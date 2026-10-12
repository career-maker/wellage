/* components/way-swap.js */
/* Life at Praana: hovering / focusing / tapping an item swaps the centre photo. */
(function () {
  "use strict";

  var stage = document.querySelector("[data-way-swap]");
  if (!stage) return;
  var imgs = Array.prototype.slice.call(stage.querySelectorAll("[data-way-img]"));
  var items = Array.prototype.slice.call(stage.querySelectorAll("[data-way-item]"));
  var base = stage.querySelector('[data-way-img="base"]');
  var current = "base";
  var canHover = window.matchMedia("(hover: hover)");

  function show(key) {
    imgs.forEach(function (im) { im.classList.toggle("is-active", im.getAttribute("data-way-img") === String(key)); });
    items.forEach(function (it) { it.classList.toggle("is-on", String(it.getAttribute("data-way-item")) === String(key)); });
  }

  items.forEach(function (it) {
    var k = it.getAttribute("data-way-item");
    it.addEventListener("mouseenter", function () { if (canHover.matches) show(k); });
    it.addEventListener("mouseleave", function () { if (canHover.matches) show(current); });
    it.addEventListener("focus", function () { show(k); });
    it.addEventListener("blur", function () { show(current); });
    it.addEventListener("click", function () {
      current = k;
      show(k);
    });
  });
  // optional auto-cycle (data-auto = ms): runs while the section is on screen, pauses on hover / focus, stops once the visitor picks an item
  var every = Number(stage.getAttribute("data-auto"));
  if (every > 0 && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var host = stage.closest("section") || stage; // the stage itself has no box on desktop (display: contents)
    var idx = -1;
    var timer = null;
    var visible = false;
    var paused = false;
    var picked = false;
    var tick = function () {
      if (!visible || paused || picked) return;
      idx = (idx + 1) % items.length;
      show(items[idx].getAttribute("data-way-item"));
    };
    var run = function () {
      if (timer || picked) return;
      timer = window.setInterval(tick, every);
    };
    var halt = function () {
      window.clearInterval(timer);
      timer = null;
    };
    new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting;
      if (visible) run();
      else halt();
    }, { threshold: 0.35 }).observe(host);
    host.addEventListener("mouseenter", function () { paused = true; });
    host.addEventListener("mouseleave", function () { paused = false; show(current); idx = -1; });
    host.addEventListener("click", function (ev) { if (ev.target.closest("[data-way-item]")) { picked = true; halt(); } });
  }
})();
