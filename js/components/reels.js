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

  // auto-scroll: one card per second, loops back to the start; paused while hovered / focused / touched / a video is playing / off screen
  var held = false;
  var visible = false;
  var touchTimer = null;
  var stage = rail.closest(".vtest__stage") || rail;
  var motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  stage.addEventListener("mouseenter", function () { held = true; });
  stage.addEventListener("mouseleave", function () { held = false; });
  stage.addEventListener("focusin", function () { held = true; });
  stage.addEventListener("focusout", function () { held = false; });
  stage.addEventListener("touchstart", function () {
    held = true;
    window.clearTimeout(touchTimer);
  }, { passive: true });
  stage.addEventListener("touchend", function () {
    window.clearTimeout(touchTimer);
    touchTimer = window.setTimeout(function () { held = false; }, 4000);
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }, { threshold: 0.25 }).observe(rail);
  } else {
    visible = true;
  }

  window.setInterval(function () {
    if (held || !visible || document.hidden || rail.querySelector(".vcard.is-playing")) return;
    var atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
    if (atEnd) {
      rail.scrollTo({ left: 0, behavior: motionOk ? "smooth" : "auto" });
      return;
    }
    var card = rail.querySelector(".vcard");
    var gap = parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    var by = card ? card.getBoundingClientRect().width + gap : rail.clientWidth * 0.5;
    rail.scrollBy({ left: by, behavior: motionOk ? "smooth" : "auto" });
  }, 1000);
})();
