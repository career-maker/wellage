/* Video testimonials: swipe rail arrows + vertical YouTube Short in a popup (iframe created on open, removed on close). */
(function () {
  "use strict";

  var rail = document.querySelector("[data-vrail]");
  var dialog = document.getElementById("reel-dialog");
  var frame = dialog && dialog.querySelector("[data-reel-frame]");

  if (rail) {
    var step = function (dir) {
      var card = rail.querySelector(".vcard");
      var by = card ? card.getBoundingClientRect().width * 2 : rail.clientWidth * 0.8;
      rail.scrollBy({ left: dir * by, behavior: "smooth" });
    };
    var prev = document.querySelector("[data-vrail-prev]");
    var next = document.querySelector("[data-vrail-next]");
    if (prev) prev.addEventListener("click", function () { step(-1); });
    if (next) next.addEventListener("click", function () { step(1); });
  }

  if (!frame || !dialog.showModal) return;

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-reel]");
    if (!t) return;
    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(t.getAttribute("data-reel")) + "?autoplay=1&rel=0&playsinline=1&modestbranding=1";
    f.title = "Wellage video testimonial";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    frame.textContent = "";
    frame.appendChild(f);
    dialog.showModal();
  });

  dialog.addEventListener("close", function () { frame.textContent = ""; });
})();
