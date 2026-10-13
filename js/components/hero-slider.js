/* Hero image slider: crossfades the slides every 4 s. Starts after page load so it never competes with the first image. */
(function () {
  "use strict";

  var hero = document.getElementById("top");
  var box = hero && hero.querySelector("[data-hero-slider]");
  if (!box) return;
  var slides = Array.prototype.slice.call(box.querySelectorAll(".hero__slide"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
  if (slides.length < 2) return;

  var DELAY = 4000;
  var index = 0;
  var timer = null;
  var shownPoster = false;
  // reduced-motion visitors still get the slides (the crossfade and title animation are switched off in CSS)

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) { s.classList.toggle("is-active", n === index); });
    dots.forEach(function (d, n) {
      d.classList.toggle("is-active", n === index);
      d.setAttribute("aria-current", n === index ? "true" : "false");
    });
    // the last slide has its own headline: show that copy block instead of the default one
    var poster = slides[index].classList.contains("hero__slide--poster");
    hero.classList.toggle("is-poster", poster);
    // when the copy block changes, replay the same word-by-word rise the section titles use
    if (shownPoster !== poster) replayTitle(poster);
    shownPoster = poster;
  }

  function replayTitle(poster) {
    var sel = poster ? ".hero__inner--slide3 .hero__title-main" : ".hero__inner:not(.hero__inner--slide3) .hero__title-main";
    var el = hero.querySelector(sel);
    if (!el || !el.classList.contains("title-anim")) return;
    el.classList.add("title-snap"); // jump back to the hidden state without animating
    el.classList.remove("is-visible");
    void el.offsetWidth;
    el.classList.remove("title-snap");
    el.classList.add("is-visible"); // titles.js transition: words rise out of their masks, staggered
  }
  function stop() { window.clearInterval(timer); timer = null; }
  function play() { if (timer || document.hidden) return; timer = window.setInterval(function () { show(index + 1); }, DELAY); }

  dots.forEach(function (d, n) {
    d.addEventListener("click", function () { show(n); stop(); play(); });
  });
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : play(); });
  hero.addEventListener("focusin", stop);
  hero.addEventListener("focusout", play);

  function start() { box.classList.add("is-ready"); play(); }
  if (document.readyState === "complete") start();
  else {
    window.addEventListener("load", start);
    window.setTimeout(start, 3000); // slow phones: do not wait for every last asset
  }
})();
