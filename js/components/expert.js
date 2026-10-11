/* components/expert.js */
/* Floating "chat with an expert" prompt: dismissible for the rest of the session. */
(function () {
  "use strict";
  var box = document.querySelector("[data-expert]");
  if (!box) return;
  var KEY = "wellage-expert-closed";
  try {
    if (window.sessionStorage.getItem(KEY) === "1") box.classList.add("is-closed");
  } catch (e) {}
  var close = box.querySelector("[data-expert-close]");
  if (close) {
    close.addEventListener("click", function () {
      box.classList.add("is-closed");
      try {
        window.sessionStorage.setItem(KEY, "1");
      } catch (e) {}
    });
  }
})();

