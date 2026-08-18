/**
 * Submits the custom-styled RSVP form into a Google Form in the
 * background (no redirect), so responses land in the Form's
 * linked Google Sheet. Configure js/config.js -> googleForm first.
 */
(function () {
  "use strict";

  function showStatus(el, message, type) {
    el.textContent = message;
    el.className = "rsvp-status is-visible " + (type === "error" ? "is-error" : "is-success");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("rsvpForm");
    if (!form) return;

    const statusEl = document.getElementById("rsvpStatus");
    const submitBtn = document.getElementById("rsvpSubmit");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Honeypot: if this hidden field got filled, silently pretend success.
      const honeypot = form.querySelector('[name="companyWebsite"]');
      if (honeypot && honeypot.value.trim() !== "") {
        showStatus(statusEl, "Thank you! Your RSVP has been received.", "success");
        form.reset();
        return;
      }

      const name = form.querySelector('[name="guestName"]').value.trim();
      const attending = form.querySelector('[name="attending"]:checked');
      if (!name || !attending) {
        showStatus(statusEl, "Please enter your name and let us know if you'll be attending.", "error");
        return;
      }

      const cfg = window.CONFIG && window.CONFIG.googleForm;
      if (!cfg || !cfg.actionUrl || !cfg.entries || !cfg.entries.name) {
        showStatus(
          statusEl,
          "RSVP form isn't connected yet — the site owner needs to add their Google Form details in js/config.js (see README.md).",
          "error"
        );
        return;
      }

      const guestCountField = form.querySelector('[name="guestCount"]');
      const guestCount = guestCountField ? guestCountField.value : "";
      const message = form.querySelector('[name="guestMessage"]').value.trim();
      const attendingLabel = attending.value === "yes" ? cfg.attendingOptions.yes : cfg.attendingOptions.no;

      const data = new FormData();
      data.append(cfg.entries.name, name);
      data.append(cfg.entries.attending, attendingLabel);
      if (cfg.entries.guestCount) data.append(cfg.entries.guestCount, guestCount);
      if (cfg.entries.message) data.append(cfg.entries.message, message);

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";

      try {
        // Google Forms doesn't allow reading the response cross-origin,
        // so this request is fire-and-forget (mode: no-cors).
        await fetch(cfg.actionUrl, {
          method: "POST",
          mode: "no-cors",
          body: data,
        });
        showStatus(statusEl, "Thank you! Your RSVP has been received.", "success");
        form.reset();
      } catch (err) {
        showStatus(statusEl, "Something went wrong sending your RSVP. Please try again, or contact us directly.", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send RSVP";
      }
    });
  });
})();
