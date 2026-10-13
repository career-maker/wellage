/* components/video.js */
/* Hero "Watch Video": plays the Vimeo film in a popup layer; the player is created on open and removed on close. */
(function () {
  "use strict";

  var dialog = document.getElementById("video-dialog");
  var frame = dialog && dialog.querySelector("[data-video-frame]");
  if (!frame || !dialog.showModal) return;

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-video-open]");
    if (!t) return;
    e.preventDefault();
    var f = document.createElement("iframe");
    f.src = t.getAttribute("data-video-open");
    f.title = "Wellage Praana video";
    f.allow = "autoplay; fullscreen; picture-in-picture";
    f.allowFullscreen = true;
    frame.textContent = "";
    frame.appendChild(f);
    dialog.showModal();
  });

  dialog.addEventListener("close", function () { frame.textContent = ""; });
})();
