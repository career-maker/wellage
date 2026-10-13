/* Connectivity: choose a destination to swap the background photo, highlight its marker and update the distance pin. */
(function () {
  "use strict";

  var root = document.querySelector("[data-conn]");
  if (!root) return;
  var photos = Array.prototype.slice.call(root.querySelectorAll("[data-conn-photo]"));
  var rows = Array.prototype.slice.call(root.querySelectorAll(".conn__route"));
  var cards = Array.prototype.slice.call(root.querySelectorAll(".conn__place"));
  var dots = Array.prototype.slice.call(root.querySelectorAll(".conn__dot"));
  var link = root.querySelector(".conn__link");
  var pinKm = root.querySelector(".conn__pin-km");
  var status = root.querySelector("[data-conn-status]");

  // phones: the place circles are a horizontal swipe strip; keep the active one centred (scrolls the strip only, never the page)
  function centerInStrip(el) {
    var strip = el.parentNode;
    if (!strip || strip.scrollWidth <= strip.clientWidth + 2) return;
    var left = el.offsetLeft - (strip.clientWidth - el.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }

  function select(i) {
    var row = rows[i];
    if (!row) return;
    var photo = Number(row.getAttribute("data-photo"));
    photos.forEach(function (img, n) { img.classList.toggle("is-active", n === photo); });
    rows.forEach(function (el, n) {
      el.classList.toggle("is-active", n === i);
      el.querySelector(".conn__pick").setAttribute("aria-pressed", String(n === i));
    });
    cards.forEach(function (el, n) {
      var on = n === photo && i < cards.length;
      el.classList.toggle("is-active", on);
      el.querySelector(".conn__pick").setAttribute("aria-pressed", String(on));
      if (on) centerInStrip(el);
    });
    dots.forEach(function (d) { d.classList.toggle("is-active", Number(d.getAttribute("data-i")) === i); });
    var d = dots[i];
    if (d && link) {
      link.setAttribute("x2", d.getAttribute("data-x"));
      link.setAttribute("y2", d.getAttribute("data-y"));
    }
    if (pinKm) pinKm.textContent = row.getAttribute("data-km");
    if (status) status.textContent = row.querySelector(".conn__name").textContent.replace(/\s+/g, " ") + ": " +
      row.getAttribute("data-km") + " km, " + row.getAttribute("data-min");
  }

  rows.forEach(function (el, i) {
    el.querySelector(".conn__pick").addEventListener("click", function () { select(i); });
  });
  cards.forEach(function (el, i) {
    el.querySelector(".conn__pick").addEventListener("click", function () { select(i); });
  });
  dots.forEach(function (d) {
    d.addEventListener("click", function () { select(Number(d.getAttribute("data-i"))); });
  });
  select(0);

  // optional auto-cycle (data-auto = ms): steps through the destinations while the section is on screen; pauses on hover / focus, stops once the visitor clicks
  var every = Number(root.getAttribute("data-auto"));
  if (every > 0 && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var at = 0;
    var timer = null;
    var seen = false;
    var held = false;
    var done = false;
    var step = function () {
      if (!seen || held || done) return;
      at = (at + 1) % rows.length;
      select(at);
    };
    var go = function () { if (!timer && !done) timer = window.setInterval(step, every); };
    var stop = function () { window.clearInterval(timer); timer = null; };
    new IntersectionObserver(function (e) {
      seen = e[0].isIntersecting;
      if (seen) go();
      else stop();
    }, { threshold: 0.35 }).observe(root);
    root.addEventListener("mouseenter", function () { held = true; });
    root.addEventListener("mouseleave", function () { held = false; });
    root.addEventListener("focusin", function () { held = true; });
    root.addEventListener("focusout", function () { held = false; });
    root.addEventListener("click", function (ev) { if (ev.target.closest(".conn__pick, .conn__dot")) { done = true; stop(); } });
  }
})();
