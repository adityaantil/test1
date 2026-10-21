/* ==========================================================================
   HardSec 2026 — site settings
   This is the only file you need to touch to open registration or to show the
   list of registered participants. No HTML editing required.
   ========================================================================== */
window.HARDSEC_CONFIG = {
  /* Event start, used by the countdown. Format: YYYY-MM-DDTHH:MM:SS+05:30 (IST). */
  event: {
    start: '2026-11-21T09:00:00+05:30', // EDIT-DATE
  },

  registration: {
    /* 1. Set to true when registration opens. */
    open: false,

    /* 2. Paste your Google Form link, e.g. 'https://forms.gle/xxxxxxxx' */
    formUrl: '',

    /* Optional: also show the form inside the page. Use the "Embed HTML" URL
       from Google Forms (it ends in /viewform?embedded=true). Leave '' to open
       the form in a new tab instead. */
    embedUrl: '',

    /* Text shown on buttons and in the registration section once it is open. */
    openLabel: 'Register now',
    openHeading: 'Your seat is waiting. Register now.',
    openText: 'Registration is open. Seats are limited, so please register early. Entry is free for IEEE/CASS members and Rs 549 for everyone else.',
    openNote: 'Event dates are tentative and may change.',
  },

  /* Optional public list of registered participants.
     In Google Sheets (the sheet your form writes to): File > Share > Publish to web >
     choose the sheet and "Comma-separated values (.csv)" > Publish, then paste the link here.
     Only the columns listed in `columns` are displayed. Never list e-mail or phone columns here. */
  participants: {
    csvUrl: '',
    columns: ['Name', 'College'], // header names exactly as in the sheet
    heading: 'Registered participants',
  },

  /* Optional: your GitHub repository, shown as a link in the footer. Leave '' to hide it. */
  githubUrl: '',
};
