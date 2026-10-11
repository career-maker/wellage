/* Scroll-snap carousel with prev/next buttons (track is also keyboard scrollable). */
(function () {
  "use strict";

  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var track = root.querySelector(".carousel__track");
    var step = function () {
      var first = track.firstElementChild;
      return first ? first.getBoundingClientRect().width + 16 : 300;
    };
    root.querySelector("[data-carousel-prev]").addEventListener("click", function () {
      track.scrollBy({ left: -step(), behavior: "smooth" });
    });
    root.querySelector("[data-carousel-next]").addEventListener("click", function () {
      track.scrollBy({ left: step(), behavior: "smooth" });
    });
  });
})();
