/**
 * Reel Brothers Foundation: website contact form and newsletter sign ups.
 *
 * The website posts each message here. Contact messages are saved to a Google
 * Sheet in your Drive and emailed to NOTIFY_EMAIL, with Reply set to the
 * person who wrote in. Newsletter sign ups are saved to a second tab.
 *
 * SETUP (about five minutes)
 *  1. Signed in as the RBF Google account, open script.google.com and click New project.
 *  2. Replace everything in Code.gs with this file, and set NOTIFY_EMAIL below.
 *  3. In the function menu at the top, choose "setup" and click Run. Approve the
 *     permissions. This creates the "RBF Website Messages" sheet in your Drive.
 *  4. Click Deploy, then New deployment. Select type: Web app.
 *     Execute as: Me. Who has access: Anyone. Click Deploy and copy the Web app URL.
 *  5. Paste that URL into js/config.js as FORM_ENDPOINT.
 *
 * Changing this script later: Deploy, Manage deployments, Edit (pencil), Version:
 * New version, Deploy. That keeps the same URL, so the website does not change.
 */

const NOTIFY_EMAIL = 'you@reelbrothersfoundation.org'; // who receives contact messages
const EMAIL_NEWSLETTER_SIGNUPS = false;                 // true to also get an email per newsletter sign up
const SHEET_NAME = 'RBF Website Messages';

const TOPICS = ['I am grieving', 'I want to partner', 'I want to volunteer', 'Press', 'Other'];
const MAX_LEN = 5000;          // longest value kept from any one field
const MAX_PER_WINDOW = 30;     // spam brake: messages accepted per 10 minutes

/** Run once from the editor. Creates the sheet and remembers it. Safe to run again. */
function setup() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SHEET_ID');
  const ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.create(SHEET_NAME);
  if (!id) props.setProperty('SHEET_ID', ss.getId());
  ensureTab_(ss, 'Contact', ['Received', 'Name', 'Email', 'Topic', 'Message', 'Page']);
  ensureTab_(ss, 'Newsletter', ['Received', 'Email', 'Page']);
  const blank = ss.getSheetByName('Sheet1');
  if (blank && ss.getSheets().length > 1) ss.deleteSheet(blank);
  Logger.log('Messages are saved to: ' + ss.getUrl());
}

/** The website sends every form here. */
function doPost(e) {
  const p = (e && e.parameter) || {};
  try {
    // Bots fill in the hidden field that people never see. Accept quietly, save nothing.
    if (clean_(p._gotcha)) return json_({ ok: true });
    if (!underLimit_()) return fail_('A lot of messages are coming in right now. Please try again in a few minutes.');

    const email = clean_(p.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail_('Please enter a valid email address.');
    const page = clean_(p.page);
    const ss = sheet_();

    if (p.form === 'newsletter') {
      append_(ss, 'Newsletter', [new Date(), email, page]);
      if (EMAIL_NEWSLETTER_SIGNUPS) {
        MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: 'RBF website: newsletter sign up', body: email + ' signed up for updates.' });
      }
      return json_({ ok: true });
    }

    const name = clean_(p.name);
    const message = clean_(p.message);
    const topic = TOPICS.indexOf(clean_(p.topic)) >= 0 ? clean_(p.topic) : 'Other';
    if (!name || !message) return fail_('Please add your name and a message.');

    append_(ss, 'Contact', [new Date(), name, email, topic, message, page]);
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: 'RBF website: ' + topic + ' (' + name + ')',
      body: [
        'New message from the Reel Brothers Foundation website.',
        '',
        'Name: ' + name,
        'Email: ' + email,
        'Topic: ' + topic,
        'Sent from: ' + (page || 'website'),
        '',
        message,
        '',
        'Reply to this email to answer ' + name + ' directly.'
      ].join('\n')
    });
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return fail_('Something went wrong on our side.');
  }
}

/** Open the Web app URL in a browser to confirm the deployment is live. */
function doGet() {
  return json_({ ok: true, service: 'Reel Brothers Foundation website forms' });
}

function clean_(v) {
  return String(v == null ? '' : v).trim().slice(0, MAX_LEN);
}

// A value that starts with = + - or @ would run as a spreadsheet formula. Store it as plain text.
function asText_(v) {
  return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v;
}

function append_(ss, tab, row) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    ensureTab_(ss, tab, []).appendRow(row.map(asText_));
  } finally {
    lock.releaseLock();
  }
}

function sheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) throw new Error('Run setup() once before deploying.');
  return SpreadsheetApp.openById(id);
}

function ensureTab_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (headers.length) {
      sh.appendRow(headers);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
  }
  return sh;
}

function underLimit_() {
  const cache = CacheService.getScriptCache();
  const key = 'count_' + Math.floor(Date.now() / 600000); // one bucket per 10 minutes
  const n = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(n), 660);
  return n <= MAX_PER_WINDOW;
}

function fail_(message) {
  return json_({ ok: false, errors: [{ message: message }] });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
