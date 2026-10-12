/* Lazy section artwork: CSS background images are exposed (via custom properties) only once a section is near the viewport. */
(function () {
  "use strict";

  var root = document.documentElement;
  var targets = Array.prototype.slice.call(document.querySelectorAll("main > section, .site-footer"));

  function wake(el) { el.classList.add("is-near"); }

  if (!("IntersectionObserver" in window)) {
    targets.forEach(wake);
    root.classList.add("is-idle");
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      wake(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: "100% 0px 100% 0px" });
  targets.forEach(function (el) { io.observe(el); });

  var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 2500); };
  window.addEventListener("load", function () {
    idle(function () { root.classList.add("is-idle"); });
  });
})();
