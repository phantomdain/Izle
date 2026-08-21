/**
 * Gallery: paginate the grid in batches of 10, and open a swipeable
 * lightbox (covering every photo, not just the currently revealed ones)
 * when a thumbnail is clicked.
 */
(function () {
  "use strict";

  var PAGE_SIZE = 10;

  /* ---------- "Show more" pagination ---------- */
  function initPagination() {
    var grid = document.getElementById("galleryGrid");
    var moreWrap = document.getElementById("galleryMore");
    var moreBtn = document.getElementById("galleryShowMoreBtn");
    if (!grid || !moreWrap || !moreBtn) return;

    var items = Array.prototype.slice.call(grid.querySelectorAll(".gallery-grid__item"));
    var revealed = Math.min(PAGE_SIZE, items.length);

    function updateButton() {
      moreWrap.hidden = revealed >= items.length;
    }

    moreBtn.addEventListener("click", function () {
      items.slice(revealed, revealed + PAGE_SIZE).forEach(function (item) {
        item.classList.remove("is-hidden");
      });
      revealed += PAGE_SIZE;
      updateButton();
    });

    updateButton();
  }

  /* ---------- lightbox ---------- */
  function initLightbox() {
    var grid = document.getElementById("galleryGrid");
    var lightbox = document.getElementById("lightbox");
    if (!grid || !lightbox) return;

    var stage = document.getElementById("lightboxStage");
    var img = document.getElementById("lightboxImg");
    var counter = document.getElementById("lightboxCounter");
    var closeBtn = document.getElementById("lightboxClose");
    var prevBtn = document.getElementById("lightboxPrev");
    var nextBtn = document.getElementById("lightboxNext");

    var items = Array.prototype.slice.call(grid.querySelectorAll(".gallery-grid__item"));
    var photos = items.map(function (item, i) {
      var thumb = item.querySelector("img");
      return { src: thumb.src, alt: thumb.alt || "Gallery photo " + (i + 1) };
    });

    var currentIndex = 0;
    var lastFocused = null;
    var lockedScrollY = 0;

    // Plain `overflow: hidden` on <body> doesn't stop background scroll on iOS
    // Safari, so pin the body in place and restore the scroll position on close.
    function lockScroll() {
      lockedScrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = "-" + lockedScrollY + "px";
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

    function preload(index) {
      var photo = photos[(index + photos.length) % photos.length];
      if (photo) new Image().src = photo.src;
    }

    function render() {
      var photo = photos[currentIndex];
      img.src = photo.src;
      img.alt = photo.alt;
      counter.textContent = (currentIndex + 1) + " / " + photos.length;
      preload(currentIndex + 1);
      preload(currentIndex - 1);
    }

    function open(index) {
      currentIndex = index;
      render();
      lightbox.classList.add("is-open");
      lockScroll();
      document.addEventListener("keydown", onKeydown);
      closeBtn.focus();
    }

    function close() {
      lightbox.classList.remove("is-open");
      unlockScroll();
      document.removeEventListener("keydown", onKeydown);
      if (lastFocused) lastFocused.focus();
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % photos.length;
      render();
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + photos.length) % photos.length;
      render();
    }

    function onKeydown(event) {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") showNext();
      else if (event.key === "ArrowLeft") showPrev();
    }

    items.forEach(function (item, i) {
      item.addEventListener("click", function () {
        lastFocused = item;
        open(i);
      });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", showPrev);
    nextBtn.addEventListener("click", showNext);

    // Clicking the dimmed backdrop or the empty space around the photo closes it.
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox || event.target === stage) close();
    });

    // Swipe left/right on the stage to move between photos.
    var touchStartX = 0;
    var touchStartY = 0;
    stage.addEventListener(
      "touchstart",
      function (event) {
        touchStartX = event.changedTouches[0].clientX;
        touchStartY = event.changedTouches[0].clientY;
      },
      { passive: true }
    );
    stage.addEventListener(
      "touchend",
      function (event) {
        var deltaX = event.changedTouches[0].clientX - touchStartX;
        var deltaY = event.changedTouches[0].clientY - touchStartY;
        var SWIPE_THRESHOLD = 40;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
          if (deltaX < 0) showNext();
          else showPrev();
        }
      },
      { passive: true }
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    initPagination();
    initLightbox();
  });
})();
