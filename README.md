# HardSec 2026: event website

Website for **HardSec 2026**, a two-day hardware-security training and hackathon
for B.Tech and M.Tech students, organized by the IEEE CASS Student Branch Chapter
at IIIT Allahabad and supported by IEEE CASS (UP Section, India).

It is a plain static site: no build step, no framework, no database. Any web
server (or GitHub Pages) can host it.

## Files (all in one folder, no subfolders)

| File | Purpose |
| --- | --- |
| `index.html` | the page and all its content |
| `fonts.css`, `base.css`, `components.css`, `sections.css` | styles |
| `config.js` | the only file to edit to open registration |
| `main.js`, `registration.js` | page behaviour |
| `*.woff2` | fonts (Unbounded, Instrument Sans, JetBrains Mono) |
| `team-*.jpg` | organizer and faculty photos (square crops) |
| `iiita-logo.png`, `ieee-cass-up-section-logo.png` | logos |
| `semchips-*.jpg`, `stpvd-*.jpg`, `student-participants.jpg` | previous-events gallery |
| `og-image.png`, `favicon.svg` | link-preview image and tab icon |

Keep every file in the same folder as `index.html` and keep the names exactly
as they are (some servers treat upper and lower case as different).

## Hosting on vlsisb.iiita.ac.in

1. Create a folder for the page on the server, for example `hardsec2026`
   (ask your web administrator, or use the file manager or FTP).
2. Upload **all** files from this folder into it (the contents, not the zip itself).
3. Open `https://vlsisb.iiita.ac.in/hardsec2026/` (your folder name) and check
   that the page looks right.
4. For link previews on WhatsApp and LinkedIn, change `og:image` in `index.html`
   to the full address, for example
   `https://vlsisb.iiita.ac.in/hardsec2026/og-image.png`.

## Everyday edits

Open `index.html` and search for these markers:
`EDIT-DATE` (event dates; also `event.start` in `config.js` for the countdown),
`EDIT-CONTACT` (contact e-mail), `SECTION: TRACKS`, `SECTION: TEAM`
(first 4 show, the rest sit under "Show more"; change `data-limit`),
`SECTION: FACULTY`, `SECTION: PARTNERS` (sponsors section, hidden for now:
delete the word `hidden` on that section to show it again).
Colours and fonts are defined at the top of `base.css`.

## Opening registration (Google Form)

Edit only `config.js`:

```js
registration: {
  open: true,
  formUrl: 'https://forms.gle/your-form-id',
  embedUrl: '',   // optional: Google Forms "Embed HTML" URL to show the form inside the page
}
```

All "Registration opens soon" buttons then switch to "Register now" and open
your form, and a "Register now" button appears in the header.

### Showing registered participants (optional)

1. Link the form to a Google Sheet. In the sheet: **File > Share > Publish to web**,
   choose the responses tab and **CSV**, publish, and copy the link.
2. In `config.js` set `participants.csvUrl` to that link and
   `participants.columns` to the headers to show, for example `['Name', 'College']`.

**Privacy:** a published sheet exposes every column to anyone with the link.
Keep e-mail and phone numbers out: publish a separate tab with only name and
college, and get participants' consent before listing names.

## Licence

Code: MIT (see `LICENSE`). The IEEE and IIIT Allahabad logos, the people's
photographs and the event photographs belong to their owners and are not
covered by the code licence. Fonts: SIL Open Font License 1.1 (`FONT-LICENSES.txt`).
