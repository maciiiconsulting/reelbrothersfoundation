# Reel Brothers Foundation website

A small static site with no build step. Hosted on GitHub Pages from `main` (repo root), same setup as anight2remember.com. The custom domain, reelbrothersfoundation.org, gets pointed after review.

## Pages

| File | Page | What is on it |
|---|---|---|
| `index.html` | Home | Hero, mission, the Four Pillars in brief, Matthew 4:19, an In Memory preview, ways to get involved, Give, and the contact form |
| `story.html` | Our Story | Who he was, the founding story in Michael's words, and the timeline from loss to a foundation |
| `programs.html` | Programs | The Four Pillars in depth, what exists today versus what is planned, the Wheel, initiatives, and year one |
| `board.html` | Board | All nine seats with photo and bio slots, and how the foundation is governed |
| `resources.html` | Resources | Crisis lines, the "Where does grief meet you today?" check-in, Write It Out, a starter list of support services, and the blog |

Shared styles are in `css/site.css` and shared behavior in `js/site.js`. The header and footer are repeated in each of the five pages, so a change to the menu or footer has to be made in all five. When `css/site.css` or anything in `js/` changes, bump the `?v=` number on those links in every page so browsers fetch the new file.

## The three settings

All three live in `js/config.js`, which every page loads.

| Setting | What it does |
|---|---|
| `GA4_ID` | Google Analytics 4. Paste the measurement ID (`G-...`). While it is the placeholder, no analytics code loads. Use a new RBF property, not the AN2R one. |
| `FORM_ENDPOINT` | Where the contact form (Home) and the newsletter sign up (every footer) send messages: the web app URL of the RBF form script. Until it is set, the forms tell visitors they are not connected yet. |
| `NEWSLETTER_ENDPOINT` | Optional. Leave blank so sign ups use `FORM_ENDPOINT` too. |

### The form script (Google Apps Script)

The forms run on the foundation's own Google account, with no outside service. `apps-script/contact-form.gs` holds the script and the full setup steps at its top:

1. Signed in as the RBF Google account, create a new project at script.google.com and paste the script in. Set `NOTIFY_EMAIL` to the inbox that should receive messages.
2. Run `setup` once. It creates the "RBF Website Messages" Google Sheet, with a Contact tab and a Newsletter tab.
3. Deploy it as a web app (Execute as: Me, Who has access: Anyone) and paste the web app URL into `FORM_ENDPOINT`.

Each contact message is saved to the Sheet and emailed to `NOTIFY_EMAIL`, with Reply going straight to the person who wrote in. Newsletter sign ups are saved to their own tab. The script drops messages from the hidden spam trap, refuses a flood of messages, and stores anything that looks like a spreadsheet formula as plain text. People write about grief here, so share the Sheet only with the people who answer these messages.

The copy in this repo has no private details. The live copy, with the real inbox, lives in the Google account.

## Content still to add

Nothing on the site is a placeholder any more, so it can launch as is. These can be added at any time:

| What | Page | How |
|---|---|---|
| Board photos, bios and LinkedIn links | Board | Each person shows an initials badge until a photo arrives. In `board.html`, replace a person's `<div class="photo initials">` with `<img class="photo" src="img/board/NAME.jpg" alt="Their name">`, and add `<p class="bio">` and a LinkedIn link under their role. Square photos, about 400 pixels, work best. |
| Social accounts | Footer, every page | Add a list item with the link next to Instagram in the footer of all five pages. |
| Blog posts and the video series | Resources | Each post becomes its own page, linked from the From the blog section. |
| Giving | Home | See `TODO(donate)` below. |

Michael approved the story and the Resources tools for launch on September 25, 2026. Where the content came from:

- "His story" on Our Story: written in fresh words from his obituary at Morton's Mortuary. The obituary text itself is not copied; the funeral home marks it as protected.
- "In Michael's words" and the timeline on Our Story: Michael's own words, with dates from the family obituaries.
- The check-in prompts, Write It Out and the list of outside services on Resources. A licensed clinician on the board should look these over after launch, the Depression prompt first.

Two more items are marked in HTML comments instead of on the page:

- `TODO(donate)` on the home page: the Donate button is disabled on purpose. No payment processor until counsel clears the solicitation wording and Maryland registration is confirmed.
- `TODO(counsel)` on the Board page: tax status language. Nothing on the site may say 501(c)(3), tax deductible or deductible gifts until the IRS determination letter arrives and counsel signs off.

## Images

Everything is in `/img`. Logo marks are SVG, exported from the Illustrator master (`Reel Brothers Foundation Brand Mocks.ai`). Letters are outlined and the fisherman silhouette is traced to vector, so every mark stays flat and sharp at any size.

| File | Artboard | Used for |
|---|---|---|
| `rbf-fish-white.svg` | 29, recolored true white | Menu bar on every page |
| `rbf-silhouette-wordmark-white.svg` | 58, true white | Home and Our Story heroes |
| `rbf-silhouette-stacked-white.svg` | 47, true white | Scripture band on Home |
| `rbf-lockup-fish.svg` | 48 | Above the mission on Home |
| `rbf-fish-lightblue.svg` | 29 | Footer |
| `rbf-silhouette-wordmark.svg` | 58 | Printed page header |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `/favicon.ico` | 29 | Browser tab and phone home screen |
| `og-image.png` | 48 on white, 1200x630 | Link previews when the site is texted or posted |
| `memorial-collage-*.webp` / `.jpg` | Original collage | Home and Our Story |
| `brand/` | 29, 43, 47 | The other colorways, for decks and social. Not loaded by the site. |

To swap an image, keep the same file name. The collage comes in two WebP sizes plus a JPEG fallback, so replace all three.

## Before pointing the domain

1. Decide whether to add board photos and bios before launch or after.
2. Set `GA4_ID` and `FORM_ENDPOINT` in `js/config.js`, then send a test message.
3. Confirm each person named on the site is happy to be named, with names spelled as they want them.
4. In the repo settings, add the custom domain under Pages (this creates a `CNAME` file; pull afterwards) and turn on Enforce HTTPS.
5. DNS, in Squarespace: apex A records to `185.199.108.153`, `.109`, `.110` and `.111`, and `www` as a CNAME to `maciiiconsulting.github.io`. **Leave the MX and TXT records alone.** Google Workspace email runs on this domain.
6. Text the link to yourself and check that the preview shows the fish lockup.

Canonical URLs, link preview tags and the structured data already point at `https://reelbrothersfoundation.org/`. If the domain ever changes, replace it in every page in one pass:

```bash
sed -i '' 's#https://reelbrothersfoundation.org#https://NEW-DOMAIN#g' *.html
```

## House rules for edits

- No tax deductibility claims, no dollar figures that are not real, no implied history.
- Real photos or nothing. No stock photography of people.
- No em dashes or en dashes in the copy.
- Marks stay flat: no bevel, no drop shadow.
- Keep the voice plain and warm, not institutional.
- Scripture is quoted from the NIV. The footer carries the Biblica notice that this requires, so keep it.
