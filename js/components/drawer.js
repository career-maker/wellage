/* Slide-out enquiry form: reachable from any scroll position. */
(function () {
  "use strict";

  var drawer = document.querySelector("[data-drawer]");
  var tab = document.querySelector("[data-drawer-toggle]");
  var backdrop = document.querySelector("[data-drawer-backdrop]");
  if (!drawer || !tab) return;

  var lastFocus = null;
  var userChose = false; // once the visitor opens/closes it themselves, stop auto behaviour
  var wide = window.matchMedia("(min-width: 80rem)");

  function setOpen(open, restoreFocus, auto) {
    drawer.classList.toggle("is-open", open);
    tab.setAttribute("aria-expanded", String(open));
    tab.classList.toggle("is-hidden", open);
    backdrop.hidden = !open;
    if (open) {
      drawer.removeAttribute("inert");
      if (auto) return; // opened automatically in the hero: do not steal focus
      lastFocus = document.activeElement;
      window.setTimeout(function () {
        var first = drawer.querySelector(".field__control");
        if (first) first.focus({ preventScroll: true });
      }, 60);
    } else {
      drawer.setAttribute("inert", "");
      if (restoreFocus !== false && !auto) {
        var back = lastFocus && lastFocus !== document.body && document.contains(lastFocus) ? lastFocus : tab;
        back.focus({ preventScroll: true });
      }
    }
  }

  tab.addEventListener("click", function () {
    userChose = true;
    setOpen(true);
  });
  drawer.querySelector("[data-drawer-close]").addEventListener("click", function () {
    userChose = true;
    setOpen(false);
  });

  // Desktop: the form is open beside the hero, then folds into the side tab once the hero scrolls away.
  var hero = document.getElementById("top");
  if (drawer.hasAttribute("data-auto-open") && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(
      function (entries) {
        if (userChose || !wide.matches) return;
        setOpen(entries[0].isIntersecting, true, true);
      },
      { threshold: 0.35 }
    ).observe(hero);
    if (wide.matches) setOpen(true, true, true);
  }
  backdrop.addEventListener("click", function () {
    setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) {
      // a styled dropdown handles its own Escape first
      if (!drawer.querySelector(".select__list:not([hidden])")) setOpen(false);
    }
  });

  // any element marked data-drawer-open (brochure CTAs, request floor plans)
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-drawer-open]");
    if (!t || t.hasAttribute("download")) return; // a real brochure file is configured
    e.preventDefault();
    var msg = document.getElementById("drawer-message");
    var text = t.dataset.prefill || (t.hasAttribute("data-brochure") ? "Please send me the Wellage Praana brochure." : "");
    if (msg && text && !msg.value) msg.value = text;
    userChose = true;
    setOpen(true);
  });
})();
