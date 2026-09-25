/* ======================= SITE CONFIG =======================
   The only place to change these values. Every page loads this file.
   See README.md.                                                  */
window.RBF_CONFIG = {
  // Google Analytics 4 measurement ID, for example "G-ABC123XYZ9".
  // While this is the placeholder, analytics stays switched off.
  GA4_ID: "G-XXXXXXXXXX",

  // Web app URL of the RBF form script, for example "https://script.google.com/macros/s/AKfy.../exec".
  // Set up with apps-script/contact-form.gs. Messages land in the "RBF Website Messages" Google Sheet
  // and are emailed to the inbox named in that script.
  // While this is the placeholder, the form explains that it is not connected yet.
  FORM_ENDPOINT: "https://script.google.com/a/macros/reelbrothersfoundation.org/s/AKfycbyx029nCLOFeq6bJ8bR6v936p6hNXVhCOsJUzKJDcWi9to5f2mfGwv4uaOiI3sTiri6/exec",

  // Optional separate endpoint for newsletter sign ups. Leave blank to use FORM_ENDPOINT.
  NEWSLETTER_ENDPOINT: ""
};
/* =========================================================== */

(function (id) {
  if (!/^G-[A-Z0-9]{6,}$/.test(id) || /^G-X+$/.test(id)) return;
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", id);
})(window.RBF_CONFIG.GA4_ID);
