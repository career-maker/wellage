/* Accessible single-open accordion. Height animates via CSS grid rows, so nothing is clipped. */
(function () {
  "use strict";

  function init(root) {
    var items = Array.prototype.slice.call(root.querySelectorAll(".accordion__trigger"));

    function setOpen(trigger, open) {
      var panel = document.getElementById(trigger.getAttribute("aria-controls"));
      trigger.setAttribute("aria-expanded", String(open));
      panel.classList.toggle("is-open", open);
      // keep hidden content out of the tab order / a11y tree once collapsed
      var inner = panel.firstElementChild;
      if (open) {
        inner.removeAttribute("inert");
      } else {
        inner.setAttribute("inert", "");
      }
    }

    items.forEach(function (trigger, index) {
      setOpen(trigger, false);

      trigger.addEventListener("click", function () {
        var willOpen = trigger.getAttribute("aria-expanded") !== "true";
        items.forEach(function (other) {
          if (other !== trigger) setOpen(other, false);
        });
        setOpen(trigger, willOpen);
        // one answer is always open: closing it opens the next question
        if (!willOpen) setOpen(items[(index + 1) % items.length], true);
      });

      trigger.addEventListener("keydown", function (e) {
        var next;
        if (e.key === "ArrowDown") next = items[(index + 1) % items.length];
        else if (e.key === "ArrowUp") next = items[(index - 1 + items.length) % items.length];
        else if (e.key === "Home") next = items[0];
        else if (e.key === "End") next = items[items.length - 1];
        if (next) {
          e.preventDefault();
          next.focus();
        }
      });
    });

    // first question open by default so the pattern is discoverable
    if (items[0]) setOpen(items[0], true);
  }

  document.querySelectorAll("[data-accordion]").forEach(init);
})();
