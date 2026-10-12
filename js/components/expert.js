/* components/expert.js */
/* Floating "chat with an expert" prompt: hidden while the hero or footer is on screen. */
(function () {
  "use strict";
  var box = document.querySelector("[data-expert]");
  if (!box) return;
  var zones = Array.prototype.slice.call(document.querySelectorAll(".hero, .site-footer"));
  if (!zones.length || !("IntersectionObserver" in window)) return;
  var seen = zones.map(function () { return false; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      seen[zones.indexOf(e.target)] = e.isIntersecting;
    });
    box.classList.toggle("is-away", seen.some(Boolean));
  });
  zones.forEach(function (z) { io.observe(z); });
})();
