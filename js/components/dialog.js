/* Generic <dialog> openers/closers (floor plans), backdrop click to close, scroll lock. */
(function () {
  "use strict";

  document.addEventListener("click", function (e) {
    var open = e.target.closest("[data-dialog-open]");
    if (open) {
      var d = document.getElementById(open.dataset.dialogOpen);
      if (d && d.showModal) d.showModal();
      return;
    }
    var close = e.target.closest("[data-dialog-close]");
    if (close) {
      var parent = close.closest("dialog");
      if (parent) parent.close();
      return;
    }
    // click on the backdrop (the dialog element itself)
    if (e.target.tagName === "DIALOG" && e.target.open) e.target.close();
  });

  document.querySelectorAll("dialog").forEach(function (d) {
    d.addEventListener("close", function () {
      document.documentElement.style.overflow = "";
    });
    d.addEventListener("toggle", function () {
      if (d.open) document.documentElement.style.overflow = "hidden";
    });
  });
})();
