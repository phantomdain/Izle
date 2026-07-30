/**
 * ============================================================
 *  EVENT CONFIGURATION
 *  This is the ONLY file you should need to edit to personalize
 *  the site with your own details. Everything with a value like
 *  "Debutante's Name" below is a placeholder — replace it.
 *  See README.md for how to get the Google Form / Sheet values.
 * ============================================================
 */
window.CONFIG = {
  event: {
    // Name as it should appear across the site (hero, footer, page title, etc.)
    debutanteName: "Chrizle Anne",

    // Small line above the main title in the hero section
    eyebrow: "A Sun-Kissed Celebration",

    // ISO 8601 date-time WITH timezone offset — powers the countdown timer,
    // "Add to Calendar" links, and the displayed date/time.
    // Example: "2026-12-31T18:00:00+08:00"
    dateISO: "2026-11-07T18:00:00+08:00",

    // How long the event lasts, in hours (used for calendar links)
    durationHours: 5,

    venueName: "Royaluxe Reception Hall",
    venueAddress: "Lot A Metropolis Ave., Binangonan, 1940 Rizal",

    // Paste a Google Maps link to the venue (share > copy link)
    mapsUrl: "https://maps.app.goo.gl/hKh95pRsjgU7yPr76",

    rsvpDeadlineDisplay: "October 15, 2026",

    // Event hashtag shown in the "Snap & Share" section, without the #
    hashtag: "IzleAt18",
  },

  // ------------------------------------------------------------
  // GOOGLE FORM (RSVP)
  // The RSVP form on this site is custom-styled, but it quietly
  // submits into your own Google Form so responses land in the
  // Form's linked Google Sheet. See README.md "Setting up RSVP"
  // for how to find actionUrl and each entry.ID below.
  // ------------------------------------------------------------
  googleForm: {
    actionUrl: "https://docs.google.com/forms/d/e/1FAIpQLSf4EwMS2AmocOPe5KtJTrftcSyNwgEYB16aYHSHpMBPTLgEYA/formResponse",
    entries: {
      name: "entry.800421673",
      attending: "entry.69251982",
      guestCount: "entry.677813252",
      message: "entry.1297571060",
    },
    // These MUST exactly match the option text in your Google Form's
    // multiple-choice "Will you be attending?" question.
    attendingOptions: {
      yes: "Joyfully accepts (Yes)",
      no: "Regretfully declines (No)",
    },
  },

  // ------------------------------------------------------------
  // GOOGLE SHEET (Find My Table)
  // Publish your seating spreadsheet to the web as CSV and paste
  // the link below. See README.md "Setting up Find My Table".
  // ------------------------------------------------------------
  googleSheet: {
    csvUrl: "",
    guestNameColumn: "Guest Name",
    tableColumn: "Table Number",
  },
};
