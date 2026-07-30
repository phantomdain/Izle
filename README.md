# Debut Website — Mamma Mia Edition

A mobile-first debut/18th-birthday invitation site with a bright, Mediterranean "sun, sea &
celebration" look — light azure, magenta, and sunshine yellow, wave dividers, and a sunburst
motif in place of the formal black & gold version.

Same structure and features as the original:
- Countdown, event details, timeline, attire guide, gift note, gallery, honor roll, FAQ
- A custom-styled **RSVP form** that submits into a Google Form (so responses land in a Google Sheet)
- A separate **Find My Table** page that looks up a guest's seat from a Google Sheet

Plain HTML/CSS/JS — no build step. Open `index.html` in a browser, or deploy the folder as-is
to any static host (GitHub Pages, Netlify, Vercel, etc.). This folder is fully self-contained —
it doesn't share config with the black & gold version one directory up.

## 1. Personalize the content

Almost everything you need to change lives in **`js/config.js`** — event name, date, venue,
maps link, hashtag, RSVP deadline. Update it once and it propagates across the whole site
(hero, countdown, calendar link, FAQ, footer, etc.).

For text that's unique per-section (the "About Me" message, FAQ answers, the "18 Roses / Candles
/ Treasures / Gifts" name lists), edit the text directly inside `index.html`.

**Hero photo**: drop a photo of the debutante at `assets/hero-photo.jpg` (a square-ish photo
works best — it's cropped into a circle). Until you add one, the hero shows a sunburst icon
instead, so the site never shows a broken-image icon.

Gallery photos go in `assets/gallery/`. Replace each placeholder
`<div class="gallery-grid__item">…</div>` in `index.html` with an
`<img src="assets/gallery/your-photo.jpg" alt="…">`.

## 2. Set up the RSVP (Google Form)

1. Create a new Google Form with these questions, in any order:
   - **Short answer**: "Full Name"
   - **Multiple choice**: "Will you be attending?" with two options — the exact text you'll put
     into `config.js` as `googleForm.attendingOptions.yes` / `.no` (defaults: "Joyfully Accepts" /
     "Regretfully Declines")
   - **Multiple choice or short answer**: "Number of Guests"
   - **Paragraph**: "Message" (optional)
2. Open the Form, click **Responses**, and link it to a new Google Sheet (this is where RSVPs
   will land).
3. Get the form's `actionUrl` and each field's `entry.XXXXXXX` ID:
   - Click the three-dot menu → **Get pre-filled link**.
   - Fill in a placeholder answer for every question, click **Get link**, then **Copy link**.
   - Paste that copied URL somewhere you can read it — it looks like:
     `https://docs.google.com/forms/d/e/1FAIpQLS.../viewform?usp=pp_url&entry.111=Test+Name&entry.222=Joyfully+Accepts...`
   - The part before `/viewform` + `formResponse` is your `actionUrl`:
     `https://docs.google.com/forms/d/e/1FAIpQLS.../formResponse`
   - Each `entry.XXXXXXX=` in the URL tells you which entry ID belongs to which question (match
     by the placeholder value you typed).
4. Paste `actionUrl` and the four `entry.XXXXXXX` IDs into `js/config.js` under `googleForm`.

That's it — the site's own RSVP form will silently POST into your Google Form on submit, so you
never have to send guests to Google's default form styling.

## 3. Set up Find My Table (Google Sheet)

1. Create a Google Sheet with two columns, e.g.:

   | Guest Name       | Table Number |
   |------------------|--------------|
   | Juan Dela Cruz   | 5            |
   | Maria Santos     | 12           |

   Column names can be anything — just match them in `config.js`'s `googleSheet.guestNameColumn`
   / `.tableColumn`.
2. In Google Sheets: **File → Share → Publish to web**.
3. Choose the specific sheet/tab, set the format to **Comma-separated values (.csv)**, and click
   **Publish**.
4. Copy the generated link and paste it into `js/config.js` as `googleSheet.csvUrl`.

Guests visiting `table.html` can then search by name (first name, last name, or full name all
work) and see their table number. If a name doesn't match exactly, the page suggests close
matches.

> Note: the published CSV updates a few minutes after you edit the sheet — good enough for
> pre-event seating, but don't expect instant sync.

## 4. Colors & fonts

The palette is defined once as CSS custom properties at the top of `css/style.css` (`:root`):
- `--azure` / `--azure-deep` / `--azure-light` — sky and sea blue
- `--magenta` / `--magenta-deep` / `--magenta-light` — bougainvillea pink
- `--yellow` / `--yellow-deep` / `--yellow-light` — sunshine
- `--ink` / `--ink-dim` / `--ink-faint` — text colors (dark azure-ink, not pure black, for a
  softer feel on the light background)

Fonts are loaded from Google Fonts in the `<head>` of each HTML file: `Fraunces` (a warm,
characterful serif) for headings, `Poppins` (clean rounded sans) for body text.

## 5. Deploying

Any static host works — no server or database needed. For example, with GitHub Pages: push this
folder to a repo and enable Pages on the `main` branch. With Netlify: drag-and-drop the folder
into the Netlify dashboard.
