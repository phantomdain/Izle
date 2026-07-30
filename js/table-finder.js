/**
 * Find My Table — fetches a Google Sheet (published to the web as CSV)
 * and lets guests search their seating assignment by name.
 * Configure js/config.js -> googleSheet first.
 */
(function () {
  "use strict";

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (char === '"' && next === '"') {
          field += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          field += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n" || char === "\r") {
        if (char === "\r" && next === "\n") i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }
    if (field.length || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
  }

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function rowsToGuests(rows, nameColumn, tableColumn) {
    if (!rows.length) return [];
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const nameIdx = header.indexOf(nameColumn.trim().toLowerCase());
    const tableIdx = header.indexOf(tableColumn.trim().toLowerCase());
    if (nameIdx === -1 || tableIdx === -1) return [];

    return rows.slice(1).map((r) => ({
      name: (r[nameIdx] || "").trim(),
      table: (r[tableIdx] || "").trim(),
    })).filter((g) => g.name && g.table);
  }

  function renderLoading(resultEl) {
    resultEl.innerHTML = `<p class="finder-note">Searching…</p>`;
  }

  function renderNotConfigured(resultEl) {
    resultEl.innerHTML = `<p class="finder-note">Seating hasn't been set up yet. Please check back closer to the event, or ask the host.</p>`;
  }

  function renderError(resultEl) {
    resultEl.innerHTML = `<p class="finder-note">We couldn't load the seating list right now. Please try again in a moment.</p>`;
  }

  function renderNoMatch(resultEl, suggestions, onPick) {
    let html = `<p class="finder-note">We couldn't find that name. Double-check the spelling, or try just your first or last name.</p>`;
    if (suggestions.length) {
      html += `<div class="finder-suggestions" id="finderSuggestions"></div>`;
    }
    resultEl.innerHTML = html;
    if (suggestions.length) {
      const container = document.getElementById("finderSuggestions");
      suggestions.forEach((guest) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = guest.name;
        btn.addEventListener("click", () => onPick(guest));
        container.appendChild(btn);
      });
    }
  }

  function renderMultiple(resultEl, matches, onPick) {
    resultEl.innerHTML = `<p class="finder-note">A few names matched — tap yours:</p><div class="finder-suggestions" id="finderSuggestions"></div>`;
    const container = document.getElementById("finderSuggestions");
    matches.forEach((guest) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = guest.name;
      btn.addEventListener("click", () => onPick(guest));
      container.appendChild(btn);
    });
  }

  function renderResult(resultEl, guest) {
    resultEl.innerHTML = `
      <div class="finder-result__card">
        <div class="finder-result__name">${guest.name}</div>
        <div class="finder-result__table">Table ${guest.table}</div>
      </div>`;
  }

  function tokenOverlapScore(a, b) {
    const tokensA = new Set(a.split(" "));
    const tokensB = new Set(b.split(" "));
    let shared = 0;
    tokensA.forEach((t) => {
      if (tokensB.has(t)) shared++;
    });
    return shared;
  }

  function search(guests, rawQuery, resultEl) {
    const query = normalize(rawQuery);
    if (!query) return;

    const withNormalized = guests.map((g) => ({ ...g, _norm: normalize(g.name) }));

    const exact = withNormalized.filter((g) => g._norm === query);
    if (exact.length === 1) return renderResult(resultEl, exact[0]);
    if (exact.length > 1) return renderMultiple(resultEl, exact, (g) => renderResult(resultEl, g));

    const partial = withNormalized.filter((g) => g._norm.includes(query) || query.includes(g._norm));
    if (partial.length === 1) return renderResult(resultEl, partial[0]);
    if (partial.length > 1) return renderMultiple(resultEl, partial, (g) => renderResult(resultEl, g));

    const scored = withNormalized
      .map((g) => ({ guest: g, score: tokenOverlapScore(query, g._norm) }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.guest);

    renderNoMatch(resultEl, scored, (g) => renderResult(resultEl, g));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("finderInput");
    const button = document.getElementById("finderButton");
    const resultEl = document.getElementById("finderResult");
    if (!input || !button || !resultEl) return;

    const sheetCfg = window.CONFIG && window.CONFIG.googleSheet;
    let guestsPromise = null;

    function loadGuests() {
      if (guestsPromise) return guestsPromise;
      if (!sheetCfg || !sheetCfg.csvUrl) {
        guestsPromise = Promise.resolve([]);
        return guestsPromise;
      }
      guestsPromise = fetch(sheetCfg.csvUrl)
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.text();
        })
        .then((text) => rowsToGuests(parseCSV(text), sheetCfg.guestNameColumn, sheetCfg.tableColumn));
      return guestsPromise;
    }

    function runSearch() {
      const query = input.value.trim();
      if (!query) return;

      if (!sheetCfg || !sheetCfg.csvUrl) {
        renderNotConfigured(resultEl);
        return;
      }

      renderLoading(resultEl);
      loadGuests()
        .then((guests) => {
          if (!guests.length) {
            renderNotConfigured(resultEl);
            return;
          }
          search(guests, query, resultEl);
        })
        .catch(() => renderError(resultEl));
    }

    button.addEventListener("click", runSearch);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runSearch();
    });
  });
})();
