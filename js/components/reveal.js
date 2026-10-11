/* Scroll reveals + location distance bars. Content stays visible without JS or with reduced motion. */
(function () {
  "use strict";

  // floor-plan area bars: width relative to the largest saleable area
  document.querySelectorAll(".plan__bar").forEach(function (bar) {
    var pct = Math.max(3, Math.round((parseFloat(bar.dataset.v) / parseFloat(bar.dataset.max)) * 100));
    bar.firstElementChild.style.setProperty("--pct", pct);
  });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      el.classList.add("is-in");
    });
    return;
  }

  // stagger siblings
  document.querySelectorAll(".why__cards, .amenity-grid, .ideas, .varma__people, .plans__grid").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty("--i", i);
    });
  });

  var io = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          obs.unobserve(en.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  targets.forEach(function (el) {
    io.observe(el);
  });
})();
