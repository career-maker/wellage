/* Video testimonials: swipe rail arrows + each card plays its YouTube Short in place (iframe created on click, removed when another card plays). */
(function () {
  "use strict";

  var rail = document.querySelector("[data-vrail]");
  if (!rail) return;

  function stop(card) {
    var p = card.querySelector(".vcard__player");
    if (p) p.remove();
    card.classList.remove("is-playing");
  }

  function play(card, id) {
    Array.prototype.forEach.call(rail.querySelectorAll(".vcard.is-playing"), stop);
    var box = document.createElement("div");
    var f = document.createElement("iframe");
    box.className = "vcard__player";
    f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0&playsinline=1&modestbranding=1";
    f.title = "Wellage video testimonial";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    box.appendChild(f);
    card.appendChild(box);
    card.classList.add("is-playing");
  }

  rail.addEventListener("click", function (e) {
    var t = e.target.closest("[data-reel]");
    var card = t && t.closest(".vcard");
    if (card) play(card, t.getAttribute("data-reel"));
  });

  var step = function (dir) {
    var card = rail.querySelector(".vcard");
    var by = card ? card.getBoundingClientRect().width * 2 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: dir * by, behavior: "smooth" });
  };
  var prev = document.querySelector("[data-vrail-prev]");
  var next = document.querySelector("[data-vrail-next]");
  if (prev) prev.addEventListener("click", function () { step(-1); });
  if (next) next.addEventListener("click", function () { step(1); });
})();
