/* Header scroll state, mobile menu, current-section highlighting, mobile action bar. */
(function () {
  "use strict";

  var header = document.querySelector("[data-header]");
  var nav = document.querySelector("[data-nav]");
  var toggle = document.querySelector("[data-nav-toggle]");
  if (!header || !nav || !toggle) return;

  var desktop = window.matchMedia("(min-width: 68rem)");

  // header height as a CSS variable (the transparent header overlays the top of the hero)
  function setHeaderHeight() {
    document.documentElement.style.setProperty("--hdr-h", header.offsetHeight + "px");
  }
  setHeaderHeight();
  window.addEventListener("resize", setHeaderHeight, { passive: true });
  window.addEventListener("load", setHeaderHeight);

  // Sentinel + IntersectionObserver instead of a scroll listener (avoids forced layout reads).
  var sentinel = document.querySelector("[data-scroll-sentinel]");
  if (sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle("is-scrolled", !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  // Hide the header on scroll down, bring it back on scroll up (never while the menu or a header control has focus).
  var lastY = window.pageYOffset;
  var ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    var dy = y - lastY;
    if (y < 80 || nav.classList.contains("is-open") || header.contains(document.activeElement)) {
      header.classList.remove("is-hidden");
    } else if (dy > 6) {
      header.classList.add("is-hidden");
    } else if (dy < -6) {
      header.classList.remove("is-hidden");
    }
    if (Math.abs(dy) > 6) lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  header.addEventListener("focusin", function () {
    header.classList.remove("is-hidden");
  });

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    header.classList.toggle("is-menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Menu";
    document.documentElement.style.overflow = open ? "hidden" : "";
    // off-canvas links must not be focusable while hidden on small screens
    if (!desktop.matches) {
      if (open) nav.removeAttribute("inert");
      else nav.setAttribute("inert", "");
    }
  }

  function syncInert() {
    if (desktop.matches) {
      nav.removeAttribute("inert");
      setOpen(false);
      nav.removeAttribute("inert");
    } else if (!nav.classList.contains("is-open")) {
      nav.setAttribute("inert", "");
    }
  }
  syncInert();
  desktop.addEventListener("change", syncInert);

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  // highlight current section in the desktop nav
  var links = Array.prototype.slice.call(nav.querySelectorAll(".main-nav__link"));
  var map = {};
  links.forEach(function (a) {
    map[a.getAttribute("href").slice(1)] = a;
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          var link = map[en.target.id];
          if (!link) return;
          if (en.isIntersecting) {
            links.forEach(function (l) {
              l.classList.remove("is-current");
              l.removeAttribute("aria-current");
            });
            link.classList.add("is-current");
            link.setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  // hide the mobile action bar while a form field is focused (on-screen keyboard)
  var float = document.querySelector("[data-float]");
  var railDesktop = window.matchMedia("(min-width: 68rem)");
  if (float) {
    document.addEventListener("focusin", function (e) {
      if (e.target.matches("input, select, textarea") && !railDesktop.matches) float.classList.add("is-hidden");
    });
    document.addEventListener("focusout", function () {
      float.classList.remove("is-hidden");
    });
  }
})();
