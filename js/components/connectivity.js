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
})();
