/* components/expert.js */
/* Floating "chat with an expert" prompt: hidden while the hero or footer is on screen. */
(function () {
  "use strict";
  var box = document.querySelector("[data-expert]");
  if (!box) return;
  var zones = Array.prototype.slice.call(document.querySelectorAll(".hero, .site-footer"));
  if (!zones.length || !("IntersectionObserver" in window)) return;
  var seen = {};
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      seen[e.target.className] = e.isIntersecting;
    });
    var away = Object.keys(seen).some(function (k) { return seen[k]; });
    box.classList.toggle("is-away", away);
  });
  zones.forEach(function (z) { io.observe(z); });
})();
