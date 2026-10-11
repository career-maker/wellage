/* Gallery category filter + accessible lightbox (native <dialog>). */
(function () {
  "use strict";

  var grid = document.querySelector("[data-gallery]");
  if (!grid) return;
  var items = Array.prototype.slice.call(grid.querySelectorAll(".gallery__item"));
  var filters = document.querySelector("[data-gallery-filters]");
  var empty = document.querySelector("[data-gallery-empty]");
  var allBtn = document.querySelector("[data-gallery-all]");
  var LIMIT = 6;
  var expanded = false;

  // show the first LIMIT matching items until "View All" is pressed
  function layout() {
    var n = 0;
    items.forEach(function (li) {
      var extra = !li.hidden && ++n > LIMIT;
      li.classList.toggle("is-extra", extra);
      if (!li.hidden && !extra) li.setAttribute("data-slot", String(n));
      else li.removeAttribute("data-slot");
    });
    grid.classList.toggle("is-collapsed", !expanded);
    allBtn.hidden = n <= LIMIT;
    allBtn.textContent = expanded ? "Show Less" : "View All";
    allBtn.setAttribute("aria-expanded", String(expanded));
  }

  allBtn.addEventListener("click", function () {
    expanded = !expanded;
    layout();
  });

  filters.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-filter]");
    if (!btn) return;
    var f = btn.dataset.filter;
    filters.querySelectorAll("[data-filter]").forEach(function (b) {
      var on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    var shown = 0;
    items.forEach(function (li) {
      var show = f === "all" || li.dataset.cat === f;
      li.hidden = !show;
      if (show) shown += 1;
    });
    empty.hidden = shown !== 0;
    layout();
  });
  layout();

  // lightbox
  var box = document.querySelector("[data-lightbox]");
  var img = box.querySelector("[data-lightbox-img]");
  var cap = box.querySelector("[data-lightbox-caption]");
  var current = 0;
  var lastTrigger = null;

  function visible() {
    return items.filter(function (li) {
      return !li.hidden;
    });
  }

  function show(i) {
    var list = visible();
    current = (i + list.length) % list.length;
    var b = list[current].querySelector(".gallery__btn");
    img.src = b.dataset.full;
    img.alt = b.dataset.alt;
    cap.textContent = b.dataset.alt + " (" + (current + 1) + " / " + list.length + ")";
  }

  grid.addEventListener("click", function (e) {
    var b = e.target.closest(".gallery__btn");
    if (!b) return;
    lastTrigger = b;
    show(visible().indexOf(b.parentElement));
    box.showModal();
  });

  box.querySelector("[data-lightbox-prev]").addEventListener("click", function () {
    show(current - 1);
  });
  box.querySelector("[data-lightbox-next]").addEventListener("click", function () {
    show(current + 1);
  });
  box.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
  box.addEventListener("close", function () {
    if (lastTrigger) lastTrigger.focus();
  });
})();
