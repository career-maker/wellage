/* Scroll-snap carousel with prev/next buttons (track is also keyboard scrollable). */
(function () {
  "use strict";

  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var track = root.querySelector(".carousel__track");
    var step = function () {
      var first = track.firstElementChild;
      return first ? first.getBoundingClientRect().width + 16 : 300;
    };
    var prev = root.querySelector("[data-carousel-prev]");
    var next = root.querySelector("[data-carousel-next]");
    prev.addEventListener("click", function () {
      track.scrollBy({ left: -step(), behavior: "smooth" });
    });
    next.addEventListener("click", function () {
      track.scrollBy({ left: step(), behavior: "smooth" });
    });

    // arrows only exist when there is something to scroll to in that direction
    function sync() {
      var max = track.scrollWidth - track.clientWidth;
      var scrollable = max > 2;
      prev.hidden = !scrollable || track.scrollLeft <= 2;
      next.hidden = !scrollable || track.scrollLeft >= max - 2;
    }
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    if ("ResizeObserver" in window) new ResizeObserver(sync).observe(track);
    sync();
  });
})();
