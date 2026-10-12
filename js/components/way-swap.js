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
})();
