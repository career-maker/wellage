/* Count-up for numbers marked data-count="30" (optional data-suffix="+"): runs once when scrolled into view. */
(function () {
  "use strict";

  var els = document.querySelectorAll("[data-count]");
  if (!els.length) return;
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function run(el) {
    var end = Number(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var final = el.textContent;
    var dur = 1600;
    var t0 = null;
    el.style.minWidth = el.offsetWidth + "px"; // hold the final width so nothing shifts while counting
    function tick(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) window.requestAnimationFrame(tick);
      else el.textContent = final;
    }
    el.textContent = "0" + suffix;
    window.requestAnimationFrame(tick);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      run(e.target);
    });
  }, { threshold: 0.6 });
  els.forEach(function (el) { io.observe(el); });
})();
