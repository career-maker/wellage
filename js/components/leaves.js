/* Falling photographic leaves (hero + film section). Pure CSS transforms; JS only sets per-leaf parameters. */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // name -> [width, height] of the file
  var SIZES = {
    fresh: [300, 245], "dry-golden": [300, 295], copper: [300, 180]
  };
  // leaves take turns, each with its own depth and lane (vw):
  //   leaf3 behind the letters, 2leaf in front of the letters, leaf1 in front of the photo (right side)
  var TURNS = [
    { file: "dry-golden", front: false, lane: [6, 40] },
    { file: "copper", front: true, lane: [6, 40] },
    { file: "fresh", front: false, lane: [62, 92] }
  ];

  function rnd(a, b) {
    return a + Math.random() * (b - a);
  }
  function sign() {
    return Math.random() < 0.5 ? -1 : 1;
  }

  // big = hero leaves: larger, and they ride a gusting wind (leaf-wind) instead of dropping straight down
  function start(back, front, host, big) {
    var turn = 0;

    // Re-roll the path of one leaf. Called at creation and whenever a fall ends (leaf is off-screen then).
    function shuffle(leaf) {
      var t = TURNS[turn % TURNS.length];
      turn++;
      var x0 = rnd(t.lane[0], t.lane[1]);
      var target = t.front ? front : back;
      if (leaf.parentNode !== target) {
        leaf.style.animationDelay = "0s";
        target.appendChild(leaf);
      }
      if (big) x0 = Math.max(-4, x0 - 18); // wind carries them right, so start further left
      var s = leaf.style;
      s.setProperty("--x0", x0.toFixed(1) + "vw");
      s.setProperty("--x1", (x0 + rnd(-5, 5)).toFixed(1) + "vw");
      s.setProperty("--dur", (big ? rnd(10, 16) : rnd(8, 14)).toFixed(1) + "s");
      s.setProperty("--wind", rnd(0.55, 1.35).toFixed(2));
      s.opacity = rnd(0.5, 0.8).toFixed(2);
      var img = leaf.firstChild.firstChild;
      img.style.width = (big ? rnd(68, 124) : rnd(30, 58)).toFixed(0) + "px";
      img.width = SIZES[t.file][0];
      img.height = SIZES[t.file][1];
      img.src = "assets/leaves/leaf-" + t.file + ".webp";
      var sw = leaf.firstChild.style;
      sw.setProperty("--sway", (big ? rnd(26, 62) : rnd(14, 38)).toFixed(0) + "px");
      sw.setProperty("--sway-dur", rnd(3.2, 5.8).toFixed(1) + "s");
      img.style.setProperty("--r0", rnd(-180, 180).toFixed(0) + "deg");
      img.style.setProperty("--rs", (sign() * rnd(90, 240)).toFixed(0) + "deg");
      img.style.setProperty("--tilt", rnd(35, 75).toFixed(0) + "deg");
      img.style.setProperty("--spin-dur", rnd(4.5, 8.5).toFixed(1) + "s");
    }

    var leaf = document.createElement("div");
    var sway = document.createElement("div");
    var img = document.createElement("img");
    leaf.className = big ? "leaf leaf--wind" : "leaf";
    sway.className = "leaf__sway";
    img.className = "leaf__img";
    img.alt = "";
    img.decoding = "async";
    sway.appendChild(img);
    leaf.appendChild(sway);
    shuffle(leaf);
    leaf.style.animationDelay = "-" + (Math.random() * 6).toFixed(1) + "s";
    leaf.addEventListener("animationiteration", function (e) {
      if (e.target === this) shuffle(this);
    });

    // run only while the host section is on screen and the tab is visible
    var onScreen = true;
    function sync() {
      var paused = document.hidden || !onScreen;
      back.classList.toggle("is-paused", paused);
      front.classList.toggle("is-paused", paused);
    }
    document.addEventListener("visibilitychange", sync);
    if ("IntersectionObserver" in window && host) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        sync();
      }).observe(host);
    }
  }

  // hero
  var heroBack = document.querySelector("[data-leaves]");
  var heroFront = document.querySelector("[data-leaves-front]");
  if (heroBack && heroFront) start(heroBack, heroFront, document.getElementById("top"), true);

  // life at praana film band
  var filmBack = document.querySelector("[data-leaves-film]");
  var filmFront = document.querySelector("[data-leaves-film-front]");
  if (filmBack && filmFront) start(filmBack, filmFront, document.getElementById("life"));
})();
