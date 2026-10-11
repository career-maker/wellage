/* Section titles: words rise out of a mask, staggered, once when the title scrolls into view. */
(function () {
  "use strict";

  var titles = Array.prototype.slice.call(document.querySelectorAll("main h2, .hero__title-main"));
  if (!titles.length) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  var n;

  // wrap every word of every text node in a clipping mask + inner span (keeps <em>, <br>, accents intact)
  function split(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (c) {
      if (c.nodeType === 3) {
        var parts = c.nodeValue.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) {
            frag.appendChild(document.createTextNode(p));
            return;
          }
          var m = document.createElement("span");
          var i = document.createElement("span");
          m.className = "tw";
          i.className = "tw__i";
          i.style.setProperty("--i", n++);
          i.textContent = p;
          m.appendChild(i);
          frag.appendChild(m);
        });
        c.parentNode.replaceChild(frag, c);
      } else if (c.nodeType === 1 && c.tagName !== "BR") {
        split(c);
      }
    });
  }

  titles.forEach(function (t) {
    n = 0;
    t.classList.remove("reveal", "is-in");
    t.setAttribute("aria-label", t.textContent.replace(/\s+/g, " ").trim());
    split(t);
    // keep a trailing full stop glued to the word before it
    var dot = t.querySelector(".hero__dot");
    if (dot) {
      var mask = dot.closest(".tw");
      var prev = mask && mask.previousElementSibling;
      if (prev && prev.classList.contains("tw")) {
        prev.firstChild.appendChild(dot);
        mask.remove();
      }
    }
    t.classList.add("title-anim");
  });

  var io = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          obs.unobserve(en.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.2 }
  );
  titles.forEach(function (t) {
    io.observe(t);
  });
})();
