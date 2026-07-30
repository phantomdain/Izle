/**
 * Shared site behavior: nav, config binding, countdown, calendar/maps
 * links, honor-roll tabs, and scroll reveal animations.
 */
(function () {
  "use strict";

  /* ---------- config path resolver ---------- */
  function resolvePath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  }

  function formatDate(date) {
    const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
    const day = date.getDate();
    const month = date.toLocaleDateString(undefined, { month: "long" });
    const year = date.getFullYear();
    return `${weekday}, ${month} ${day}, ${year}`;
  }

  function formatTime(date) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  function buildDerivedConfig() {
    const cfg = window.CONFIG;
    if (!cfg) return;
    const eventDate = new Date(cfg.event.dateISO);
    const validDate = !isNaN(eventDate.getTime());
    cfg.event.dateDisplayLong = validDate ? formatDate(eventDate) : "[Event Date]";
    cfg.event.dateTimeDisplay = validDate
      ? `${formatDate(eventDate)} · ${formatTime(eventDate)}`
      : "[Event Date & Time]";
    cfg.event._parsedDate = validDate ? eventDate : null;
  }

  /* ---------- bind config values into the DOM ---------- */
  function bindConfig() {
    const cfg = window.CONFIG;
    if (!cfg) return;
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const value = resolvePath(cfg, el.getAttribute("data-bind"));
      if (value === undefined || value === null || value === "") return;
      const suffix = el.getAttribute("data-bind-suffix") || "";
      el.textContent = value + suffix;
    });

    if (cfg.event.debutanteName) {
      document.title = `${cfg.event.debutanteName}'s 18th Birthday Celebration`;
    }
  }

  /* ---------- header scroll state ---------- */
  function initHeaderScroll() {
    const header = document.getElementById("siteHeader");
    if (!header) return;
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- mobile nav ---------- */
  function initNav() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("siteNav");
    const close = document.getElementById("navClose");
    if (!toggle || !nav) return;

    let lockedScrollY = 0;

    // Plain `overflow: hidden` on <body> doesn't stop background scroll on iOS
    // Safari, so pin the body in place and restore the scroll position on close.
    function lockScroll() {
      lockedScrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
    }
    function unlockScroll() {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, lockedScrollY);
    }

    function openNav() {
      if (nav.classList.contains("is-open")) return;
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      lockScroll();
    }
    function closeNav() {
      if (!nav.classList.contains("is-open")) return;
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      unlockScroll();
    }
    function toggleNav() {
      if (nav.classList.contains("is-open")) closeNav();
      else openNav();
    }

    toggle.addEventListener("click", toggleNav);
    if (close) close.addEventListener("click", closeNav);
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- countdown ---------- */
  function initCountdown() {
    const cfg = window.CONFIG;
    const target = cfg && cfg.event._parsedDate;
    const els = {
      days: document.getElementById("cdDays"),
      hours: document.getElementById("cdHours"),
      minutes: document.getElementById("cdMinutes"),
      seconds: document.getElementById("cdSeconds"),
    };
    if (!target || !els.days) return;

    function tick() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        els.days.textContent = "00";
        els.hours.textContent = "00";
        els.minutes.textContent = "00";
        els.seconds.textContent = "00";
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      els.days.textContent = String(days).padStart(2, "0");
      els.hours.textContent = String(hours).padStart(2, "0");
      els.minutes.textContent = String(minutes).padStart(2, "0");
      els.seconds.textContent = String(seconds).padStart(2, "0");
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ---------- maps + calendar links ---------- */
  function initLinks() {
    const cfg = window.CONFIG;
    if (!cfg) return;

    const mapsLink = document.getElementById("mapsLink");
    if (mapsLink && cfg.event.mapsUrl) {
      mapsLink.href = cfg.event.mapsUrl;
    }

    const calendarLink = document.getElementById("calendarLink");
    const start = cfg.event._parsedDate;
    if (calendarLink && start) {
      const durationMs = (cfg.event.durationHours || 3) * 60 * 60 * 1000;
      const end = new Date(start.getTime() + durationMs);
      const toGCalFormat = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const title = encodeURIComponent(`${cfg.event.debutanteName}'s 18th Birthday`);
      const location = encodeURIComponent(`${cfg.event.venueName}, ${cfg.event.venueAddress}`);
      calendarLink.href =
        `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}` +
        `&dates=${toGCalFormat(start)}/${toGCalFormat(end)}&location=${location}`;
    }
  }

  /* ---------- honor roll tabs ---------- */
  function initHonorTabs() {
    const tabs = document.getElementById("honorTabs");
    if (!tabs) return;
    const buttons = tabs.querySelectorAll("button");
    const panels = document.querySelectorAll(".honor-panel");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetKey = btn.getAttribute("data-target");
        buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
        panels.forEach((p) => p.classList.toggle("is-active", p.getAttribute("data-panel") === targetKey));
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((el) => observer.observe(el));
  }

  /* ---------- hero portrait fallback ---------- */
  function initHeroPortrait() {
    const img = document.getElementById("heroPortraitImg");
    const fallback = document.getElementById("heroPortraitFallback");
    if (!img || !fallback) return;

    const cfg = window.CONFIG;
    if (cfg && cfg.event.debutanteName) {
      img.alt = cfg.event.debutanteName;
    }

    function showFallback() {
      img.classList.add("has-error");
      fallback.classList.add("is-visible");
    }

    if (img.complete && img.naturalWidth === 0) {
      showFallback();
    } else {
      img.addEventListener("error", showFallback);
    }
  }

  /* ---------- footer year ---------- */
  function initFooterYear() {
    const el = document.getElementById("footerYear");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildDerivedConfig();
    bindConfig();
    initHeaderScroll();
    initNav();
    initCountdown();
    initLinks();
    initHonorTabs();
    initReveal();
    initHeroPortrait();
    initFooterYear();
  });
})();
