/* Entry point (runs last in the bundle). */
(function () {
  "use strict";
  // JS-only styling hooks: .reveal stays visible unless this class is present.
  document.documentElement.classList.add("js");
  // reveal.js ran before the class was set on first paint; re-run is not needed
  // because .reveal elements are hidden by CSS only once .js exists and the
  // IntersectionObserver then marks them .is-in immediately when in view.
})();
