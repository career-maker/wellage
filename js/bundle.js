/* config.js */
/**
 * Site configuration — the single integration point for backend wiring.
 * Nothing in here is a secret; never put API keys in front-end code.
 */
window.PRAANA_CONFIG = {
  phone: "+919048857777",
  phoneDisplay: "+91 9048 857777",
  whatsapp: "919048857777",

  // Approved brochure PDF (path or URL). Empty = no file supplied yet, so the
  // brochure CTAs scroll to the enquiry form with a pre-filled request instead.
  brochureUrl: "wellage.pdf",

  // Lead endpoint. Expected contract: POST application/json
  //   { form: "enquiry" | "visit", name, phone, email, unit?, message?, date?, visitors?, source }
  // and a 2xx response on success. Empty = not connected: the forms validate,
  // then offer WhatsApp / call fallbacks and do NOT claim the enquiry was sent.
  formEndpoint: "",
};

/* components/accordion.js */
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

/* components/carousel.js */
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
    window.requestAnimationFrame(function () { window.requestAnimationFrame(sync); });
  });
})();

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

/* components/dialog.js */
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

/* components/drawer.js */
/* Slide-out enquiry form: reachable from any scroll position. */
(function () {
  "use strict";

  var drawer = document.querySelector("[data-drawer]");
  var tab = document.querySelector("[data-drawer-toggle]");
  var backdrop = document.querySelector("[data-drawer-backdrop]");
  if (!drawer || !tab) return;

  var lastFocus = null;
  var userChose = false; // once the visitor opens/closes it themselves, stop auto behaviour
  var wide = window.matchMedia("(min-width: 80rem)");

  function setOpen(open, restoreFocus, auto) {
    drawer.classList.toggle("is-open", open);
    tab.setAttribute("aria-expanded", String(open));
    tab.classList.toggle("is-hidden", open);
    backdrop.hidden = !open;
    if (open) {
      drawer.removeAttribute("inert");
      if (auto) return; // opened automatically in the hero: do not steal focus
      lastFocus = document.activeElement;
      window.setTimeout(function () {
        var first = drawer.querySelector(".field__control");
        if (first) first.focus({ preventScroll: true });
      }, 60);
    } else {
      drawer.setAttribute("inert", "");
      if (restoreFocus !== false && !auto) {
        var back = lastFocus && lastFocus !== document.body && document.contains(lastFocus) ? lastFocus : tab;
        back.focus({ preventScroll: true });
      }
    }
  }

  tab.addEventListener("click", function () {
    userChose = true;
    setOpen(true);
  });
  drawer.querySelector("[data-drawer-close]").addEventListener("click", function () {
    userChose = true;
    setOpen(false);
  });

  // Desktop: the form is open beside the hero, then folds into the side tab once the hero scrolls away.
  var hero = document.getElementById("top");
  if (drawer.hasAttribute("data-auto-open") && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(
      function (entries) {
        if (userChose || !wide.matches) return;
        setOpen(entries[0].isIntersecting, true, true);
      },
      { threshold: 0.35 }
    ).observe(hero);
    if (wide.matches) setOpen(true, true, true);
  }
  // optional: open on its own after a delay (data-open-delay, ms) unless the visitor already used it
  var delay = Number(drawer.getAttribute("data-open-delay"));
  if (delay > 0) {
    window.setTimeout(function () {
      if (userChose || drawer.classList.contains("is-open")) return;
      userChose = true; // keep it open until the visitor closes it
      setOpen(true, true, true);
    }, delay);
  }
  backdrop.addEventListener("click", function () {
    setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) {
      // a styled dropdown handles its own Escape first
      if (!document.querySelector(".select__list--float:not([hidden])")) setOpen(false);
    }
  });

  // any element marked data-drawer-open (brochure CTAs, request floor plans)
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-drawer-open]");
    if (!t || t.hasAttribute("download")) return; // a real brochure file is configured
    e.preventDefault();
    var msg = document.getElementById("drawer-message");
    var text = t.dataset.prefill || (t.hasAttribute("data-brochure") ? "Please send me the Wellage Praana brochure." : "");
    if (msg && text && !msg.value) msg.value = text;
    userChose = true;
    setOpen(true);
  });
})();

/* components/forms.js */
/* Lead forms: validation, states, duplicate-submit guard, brochure + prefill actions. */
(function () {
  "use strict";

  var cfg = window.PRAANA_CONFIG || {};
  var PHONE_RE = /^(?:\+?91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(field, message) {
    var control = field;
    var err = document.getElementById(control.getAttribute("aria-describedby"));
    control.setAttribute("aria-invalid", message ? "true" : "false");
    if (err) err.textContent = message || "";
  }

  function dialOf(el) {
    var cc = el.form && el.form.elements.country_code;
    return cc && cc.value ? cc.value : "+91";
  }

  function phoneOk(el, v) {
    if (dialOf(el) === "+91") return PHONE_RE.test(v);
    return /^\d{6,14}$/.test(v.replace(/[\s-]/g, ""));
  }

  function validateField(el) {
    var v = el.value.trim();
    var msg = "";
    if (el.required && !v) {
      msg = "Please fill in this field.";
      if (el.name === "name") msg = "Please enter your name.";
      if (el.name === "phone") msg = "Please enter your phone number.";
      if (el.name === "email") msg = "Please enter your email address.";
      if (el.name === "date") msg = "Please choose a preferred visit date.";
      if (el.name === "visitors") msg = "Please select the number of visitors.";
    } else if (el.name === "name" && v.length < 2) {
      msg = "Please enter your full name.";
    } else if (el.name === "phone" && !phoneOk(el, v)) {
      msg = dialOf(el) === "+91" ? "Enter a valid 10-digit Indian mobile number, e.g. 98765 43210." : "Enter a valid phone number for the selected country.";
    } else if (el.name === "email" && !EMAIL_RE.test(v)) {
      msg = "Enter a valid email address, e.g. name@example.com.";
    } else if (el.name === "date" && v) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(v + "T00:00:00") < today) msg = "Please choose today or a future date.";
    }
    setError(el, msg);
    return !msg;
  }

  function summary(data) {
    var lines = ["Hello, I would like to enquire about Wellage Praana."];
    if (data.unit) lines.push("Preferred unit: " + data.unit);
    if (data.date) lines.push("Preferred visit date: " + data.date);
    if (data.visitors) lines.push("Visitors: " + data.visitors);
    if (data.message) lines.push("Message: " + data.message);
    lines.push("Name: " + data.name, "Phone: " + data.phone, "Email: " + data.email);
    return lines.join("\n");
  }

  function showStatus(box, kind, html) {
    box.className = "form__status is-visible form__status--" + kind;
    box.innerHTML = html;
  }

  function initForm(form) {
    var status = form.querySelector("[data-status]");
    var button = form.querySelector("[data-submit]");
    var label = button.textContent;
    var busy = false;
    var controls = Array.prototype.slice.call(form.querySelectorAll("input[name], select, textarea")).filter(function (c) {
      return c.name !== "website";
    });

    // fix: future dates only
    var dateInput = form.querySelector("[data-min-today]");
    if (dateInput) {
      var t = new Date();
      var m = String(t.getMonth() + 1).padStart(2, "0");
      var d = String(t.getDate()).padStart(2, "0");
      dateInput.min = t.getFullYear() + "-" + m + "-" + d;
    }

    controls.forEach(function (c) {
      c.addEventListener("blur", function () {
        if (c.value || c.getAttribute("aria-invalid") === "true") validateField(c);
      });
      c.addEventListener("input", function () {
        if (c.getAttribute("aria-invalid") === "true") validateField(c);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (busy) return;
      if (form.elements.website && form.elements.website.value) return; // honeypot

      var firstBad = null;
      controls.forEach(function (c) {
        if (c.hasAttribute("aria-describedby") && !validateField(c) && !firstBad) firstBad = c;
      });
      if (firstBad) {
        showStatus(status, "error", "Please correct the highlighted fields and try again.");
        firstBad.focus();
        return;
      }

      var data = { form: form.dataset.form, source: location.pathname };
      controls.forEach(function (c) {
        data[c.name] = c.value.trim();
      });
      if (data.phone && !/^\+/.test(data.phone)) data.phone = (data.country_code || "+91") + " " + data.phone;

      var fallback =
        '<div class="form__fallback">' +
        '<a class="btn btn--primary btn--sm" target="_blank" rel="noopener" href="https://wa.me/' + cfg.whatsapp + "?text=" + encodeURIComponent(summary(data)) + '">Send on WhatsApp</a>' +
        '<a class="btn btn--outline btn--sm" href="tel:' + cfg.phone + '">Call ' + cfg.phoneDisplay + "</a></div>";

      if (!cfg.formEndpoint) {
        // Honest state: no backend connected yet. Never claim the enquiry was received.
        showStatus(
          status,
          "info",
          "<strong>Details checked &mdash; not sent yet.</strong> Online submission is not connected on this preview. Please send your enquiry on WhatsApp or call us and we will take it from here." + fallback
        );
        return;
      }

      busy = true;
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
      button.textContent = "Sending…";
      showStatus(status, "info", "Sending your details…");

      fetch(cfg.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          form.reset();
          controls.forEach(function (c) {
            setError(c, "");
          });
          showStatus(status, "info", "<strong>Thank you.</strong> We have received your details and our team will contact you shortly.");
        })
        .catch(function () {
          showStatus(status, "error", "<strong>We could not send your details.</strong> Please try again, or reach us directly." + fallback);
        })
        .then(function () {
          busy = false;
          button.disabled = false;
          button.removeAttribute("aria-disabled");
          button.textContent = label;
        });
    });
  }

  document.querySelectorAll("form[data-form]").forEach(initForm);

  // Brochure CTAs: a configured file downloads; otherwise drawer.js opens the enquiry drawer pre-filled.
  document.querySelectorAll("[data-brochure]").forEach(function (a) {
    if (cfg.brochureUrl) {
      a.setAttribute("href", cfg.brochureUrl);
      a.setAttribute("download", "");
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    }
  });
})();

/* components/gallery.js */
/* Gallery category filter + accessible lightbox (native <dialog>). */
(function () {
  "use strict";

  var grid = document.querySelector("[data-gallery]");
  if (!grid) return;
  var items = Array.prototype.slice.call(grid.querySelectorAll(".gallery__item"));
  var filters = document.querySelector("[data-gallery-filters]");
  var empty = document.querySelector("[data-gallery-empty]");
  var allBtn = document.querySelector("[data-gallery-all]");
  var LIMIT = 6;
  var expanded = false;

  // show the first LIMIT matching items until "View All" is pressed
  function layout() {
    var n = 0;
    items.forEach(function (li) {
      var extra = !li.hidden && ++n > LIMIT;
      li.classList.toggle("is-extra", extra);
      if (!li.hidden && !extra) li.setAttribute("data-slot", String(n));
      else li.removeAttribute("data-slot");
    });
    grid.classList.toggle("is-collapsed", !expanded);
  }

  filters.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-filter]");
    if (!btn) return;
    var f = btn.dataset.filter;
    filters.querySelectorAll("[data-filter]").forEach(function (b) {
      var on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    var shown = 0;
    items.forEach(function (li) {
      var show = f === "all" || li.dataset.cat === f;
      li.hidden = !show;
      if (show) shown += 1;
    });
    empty.hidden = shown !== 0;
    grid.hidden = shown === 0;
    layout();
  });
  layout();

  // lightbox
  var box = document.querySelector("[data-lightbox]");
  var img = box.querySelector("[data-lightbox-img]");
  var cap = box.querySelector("[data-lightbox-caption]");
  var current = 0;
  var lastTrigger = null;

  function visible() {
    return items.filter(function (li) {
      return !li.hidden;
    });
  }

  function show(i) {
    var list = visible();
    current = (i + list.length) % list.length;
    var b = list[current].querySelector(".gallery__btn");
    img.src = b.dataset.full;
    img.alt = b.dataset.alt;
    cap.textContent = b.dataset.alt + " (" + (current + 1) + " / " + list.length + ")";
  }

  grid.addEventListener("click", function (e) {
    var b = e.target.closest(".gallery__btn");
    if (!b) return;
    lastTrigger = b;
    show(visible().indexOf(b.parentElement));
    box.showModal();
  });

  box.querySelector("[data-lightbox-prev]").addEventListener("click", function () {
    show(current - 1);
  });
  box.querySelector("[data-lightbox-next]").addEventListener("click", function () {
    show(current + 1);
  });
  box.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
  box.addEventListener("close", function () {
    if (lastTrigger) lastTrigger.focus();
  });
})();

/* components/navigation.js */
/* Header scroll state, mobile menu, current-section highlighting, mobile action bar. */
(function () {
  "use strict";

  var header = document.querySelector("[data-header]");
  var nav = document.querySelector("[data-nav]");
  var toggle = document.querySelector("[data-nav-toggle]");
  if (!header || !nav || !toggle) return;

  var desktop = window.matchMedia("(min-width: 68rem)");

  // Sentinel + IntersectionObserver instead of a scroll listener (avoids forced layout reads).
  var sentinel = document.querySelector("[data-scroll-sentinel]");
  if (sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle("is-scrolled", !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  // Hide the header on scroll down, bring it back on scroll up (never while the menu or a header control has focus).
  var lastY = window.pageYOffset;
  var ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    var dy = y - lastY;
    if (y < 80 || nav.classList.contains("is-open") || header.contains(document.activeElement)) {
      header.classList.remove("is-hidden");
    } else if (dy > 6) {
      header.classList.add("is-hidden");
    } else if (dy < -6) {
      header.classList.remove("is-hidden");
    }
    if (Math.abs(dy) > 6) lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  header.addEventListener("focusin", function () {
    header.classList.remove("is-hidden");
  });

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    header.classList.toggle("is-menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Menu";
    document.documentElement.style.overflow = open ? "hidden" : "";
    // off-canvas links must not be focusable while hidden on small screens
    if (!desktop.matches) {
      if (open) nav.removeAttribute("inert");
      else nav.setAttribute("inert", "");
    }
  }

  function syncInert() {
    if (desktop.matches) {
      nav.removeAttribute("inert");
      setOpen(false);
      nav.removeAttribute("inert");
    } else if (!nav.classList.contains("is-open")) {
      nav.setAttribute("inert", "");
    }
  }
  syncInert();
  desktop.addEventListener("change", syncInert);

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  // highlight current section in the desktop nav
  var links = Array.prototype.slice.call(nav.querySelectorAll(".main-nav__link"));
  var map = {};
  links.forEach(function (a) {
    map[a.getAttribute("href").slice(1)] = a;
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          var link = map[en.target.id];
          if (!link) return;
          if (en.isIntersecting) {
            links.forEach(function (l) {
              l.classList.remove("is-current");
              l.removeAttribute("aria-current");
            });
            link.classList.add("is-current");
            link.setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  // hide the mobile action bar while a form field is focused (on-screen keyboard)
  var float = document.querySelector("[data-float]");
  var railDesktop = window.matchMedia("(min-width: 68rem)");
  if (float) {
    document.addEventListener("focusin", function (e) {
      if (e.target.matches("input, select, textarea") && !railDesktop.matches) float.classList.add("is-hidden");
    });
    document.addEventListener("focusout", function () {
      float.classList.remove("is-hidden");
    });
  }
})();
/* components/reveal.js */
/* Scroll reveals + location distance bars. Content stays visible without JS or with reduced motion. */
(function () {
  "use strict";

  // floor-plan area bars: width relative to the largest saleable area
  document.querySelectorAll(".plan__bar").forEach(function (bar) {
    var pct = Math.max(3, Math.round((parseFloat(bar.dataset.v) / parseFloat(bar.dataset.max)) * 100));
    bar.firstElementChild.style.setProperty("--pct", pct);
  });

  // reduced-motion visitors still get the slides (the crossfade and title animation are switched off in CSS)
  var targets = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      el.classList.add("is-in");
    });
    return;
  }

  // stagger siblings
  document.querySelectorAll(".why__cards, .amenity-grid, .ideas, .varma__people, .plans__grid").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty("--i", i);
    });
  });

  var io = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          obs.unobserve(en.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  targets.forEach(function (el) {
    io.observe(el);
  });
})();

/* components/brochure.js */
/* Brochure download gate: email + phone in a popup, then the PDF downloads. */
(function () {
  "use strict";

  var dialog = document.getElementById("brochure-dialog");
  var form = dialog && dialog.querySelector("[data-brochure-form]");
  if (!form) return;
  var cfg = window.PRAANA_CONFIG || {};
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_IN = /^(?:\+?91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}$/;
  var status = form.querySelector("[data-brochure-status]");
  var busy = false;

  function setError(el, msg) {
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    var err = document.getElementById(el.getAttribute("aria-describedby"));
    if (err) err.textContent = msg || "";
  }

  function dial() {
    return form.elements.country_code ? form.elements.country_code.value : "+91";
  }

  function check() {
    var email = form.elements.email;
    var phone = form.elements.phone;
    var cc = dial();
    var ok = true;
    var ev = email.value.trim();
    var emailOk = EMAIL_RE.test(ev);
    setError(email, !ev ? "Please enter your email address." : !emailOk ? "Enter a valid email address, e.g. name@example.com." : "");
    if (!emailOk) ok = false;
    var pv = phone.value.trim();
    var pOk = cc === "+91" ? PHONE_IN.test(pv) : /^\d{6,14}$/.test(pv.replace(/[\s-]/g, ""));
    var pMsg = "";
    if (!pv) pMsg = "Please enter your phone number.";
    else if (!pOk) pMsg = cc === "+91" ? "Enter a valid 10-digit Indian mobile number, e.g. 98765 43210." : "Enter a valid phone number for the selected country.";
    setError(phone, pMsg);
    if (!pOk) ok = false;
    return ok;
  }

  function brochureUrl() {
    return cfg.brochureUrl || "wellage.pdf";
  }

  function download() {
    var a = document.createElement("a");
    a.href = brochureUrl();
    a.download = "Wellage_Praana_Brochure.pdf";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Never claim a download that would 404. (file:// cannot be probed, so assume it exists there.)
  function brochureExists() {
    if (location.protocol === "file:") return Promise.resolve(true);
    return fetch(brochureUrl(), { method: "HEAD", cache: "no-store" }).then(
      function (r) { return r.ok; },
      function () { return false; }
    );
  }

  function fail(msg) {
    busy = false;
    status.className = "form__status is-visible form__status--error";
    status.textContent = msg + " ";
    var a = document.createElement("a");
    a.href = "https://wa.me/" + (cfg.whatsapp || "") + "?text=" + encodeURIComponent("Hello, please send me the Wellage Praana brochure.");
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Message us on WhatsApp";
    status.appendChild(a);
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-brochure-open]");
    if (!t || !dialog.showModal) return;
    e.preventDefault();
    status.textContent = "";
    status.className = "form__status";
    dialog.showModal();
    window.setTimeout(function () { form.elements.email.focus(); }, 60);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy || (form.elements.website && form.elements.website.value)) return;
    if (!check()) {
      status.className = "form__status is-visible form__status--error";
      status.textContent = "Please correct the highlighted fields.";
      return;
    }
    var data = {
      form: "brochure",
      email: form.elements.email.value.trim(),
      phone: dial() + " " + form.elements.phone.value.trim(),
      source: location.pathname
    };
    busy = true;
    function done() {
      brochureExists().then(function (ok) {
        if (!ok) { fail("The brochure is not available to download just now."); return; }
        busy = false;
        status.className = "form__status is-visible form__status--info";
        status.textContent = "Thank you. Your brochure download is starting.";
        download();
        window.setTimeout(function () { if (dialog.open) dialog.close(); }, 1600);
      });
    }
    if (cfg.formEndpoint) {
      fetch(cfg.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        done();
      }).catch(function () {
        fail("We could not submit your details. Please try again or contact us.");
      });
    } else {
      done();
    }
  });
})();

/* components/phone.js */
/* Phone fields: country-code dropdown with flag (progressively enhanced by select.js). */
(function () {
  "use strict";

  var COUNTRIES = [
    ["India", "+91", "in"], ["United Arab Emirates", "+971", "ae"], ["Saudi Arabia", "+966", "sa"],
    ["Qatar", "+974", "qa"], ["Kuwait", "+965", "kw"], ["Oman", "+968", "om"], ["Bahrain", "+973", "bh"],
    ["United States", "+1", "us"], ["Canada", "+1", "ca"], ["United Kingdom", "+44", "gb"],
    ["Ireland", "+353", "ie"], ["Germany", "+49", "de"], ["France", "+33", "fr"],
    ["Australia", "+61", "au"], ["New Zealand", "+64", "nz"], ["Singapore", "+65", "sg"],
    ["Malaysia", "+60", "my"], ["Sri Lanka", "+94", "lk"], ["Nepal", "+977", "np"]
  ];

  document.querySelectorAll('input[type="tel"][name="phone"]').forEach(function (input) {
    var parent = input.parentNode;
    var box = document.createElement("div");
    box.className = "phone";

    var sel = document.createElement("select");
    sel.className = "field__control phone__cc";
    sel.name = "country_code";
    sel.id = input.id + "-cc";
    sel.setAttribute("aria-label", "Country code");
    COUNTRIES.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c[1];
      o.textContent = c[0] + " (" + c[1] + ")";
      o.setAttribute("data-flag", c[2]);
      o.setAttribute("data-short", c[1]);
      sel.appendChild(o);
    });

    parent.insertBefore(box, input);
    box.appendChild(sel);
    box.appendChild(input);
    Array.prototype.slice.call(parent.children).forEach(function (n) {
      if (n.classList && (n.classList.contains("field__ico") || n.classList.contains("field__icon"))) parent.removeChild(n);
    });
    parent.classList.add("has-phone");
  });
})();

/* components/select.js */
/* Styled dropdowns: progressive enhancement of native <select> (the select stays the source of truth). */
(function () {
  "use strict";

  function enhance(select) {
    var wrap = document.createElement("div");
    wrap.className = "select";
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    select.classList.add("select__native");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "field__control select__btn";
    btn.id = select.id + "-btn";
    btn.setAttribute("role", "combobox");
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    var describedby = select.getAttribute("aria-describedby");
    if (describedby) btn.setAttribute("aria-describedby", describedby);
    var label = document.querySelector('label[for="' + select.id + '"]');
    if (label) {
      label.setAttribute("for", btn.id);
      if (!label.id) label.id = select.id + "-label";
      btn.setAttribute("aria-labelledby", label.id + " " + btn.id);
    }
    var text = document.createElement("span");
    text.className = "select__value";
    btn.appendChild(text);
    btn.insertAdjacentHTML(
      "beforeend",
      '<svg class="select__chevron" aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    );

    var list = document.createElement("ul");
    list.className = "select__list";
    list.id = select.id + "-list";
    list.setAttribute("role", "listbox");
    list.hidden = true;
    btn.setAttribute("aria-controls", list.id);

    var opts = Array.prototype.map.call(select.options, function (o, i) {
      var li = document.createElement("li");
      li.className = "select__option";
      li.setAttribute("role", "option");
      li.id = list.id + "-" + i;
      var flag = o.getAttribute("data-flag");
      if (flag) {
        var im = document.createElement("img");
        im.className = "select__flag";
        im.src = "assets/flags/" + flag + ".svg";
        im.width = 22;
        im.height = 15;
        im.alt = "";
        im.loading = "lazy";
        li.appendChild(im);
        var nm = document.createElement("span");
        nm.textContent = o.text;
        li.appendChild(nm);
      } else {
        li.textContent = o.text;
      }
      li.dataset.index = i;
      list.appendChild(li);
      return li;
    });

    wrap.appendChild(btn);
    wrap.appendChild(list);

    var active = 0;
    var typed = "";
    var typedTimer;

    function sync() {
      var i = select.selectedIndex;
      var cur = select.options[i];
      var curFlag = cur.getAttribute("data-flag");
      if (curFlag) {
        text.innerHTML = '<img class="select__flag" src="assets/flags/' + curFlag + '.svg" width="22" height="15" alt=""><span>' + cur.getAttribute("data-short") + "</span>";
        btn.setAttribute("aria-label", "Country code " + cur.text);
      } else {
        text.textContent = cur.text;
      }
      wrap.classList.toggle("is-placeholder", select.value === "");
      opts.forEach(function (li, n) {
        li.setAttribute("aria-selected", String(n === i));
      });
    }

    function setActive(i) {
      active = Math.max(0, Math.min(opts.length - 1, i));
      opts.forEach(function (li, n) {
        li.classList.toggle("is-active", n === active);
      });
      btn.setAttribute("aria-activedescendant", opts[active].id);
      opts[active].scrollIntoView({ block: "nearest" });
    }

    // the list floats on <body> (position: fixed) so no card, drawer or overflow can clip it; it flips upward when space is short
    function place() {
      var r = btn.getBoundingClientRect();
      var vh = window.innerHeight;
      var below = vh - r.bottom - 10;
      var above = r.top - 10;
      var want = Math.min(list.scrollHeight, 320) + 4;
      var down = below >= want || below >= above;
      var h = Math.max(110, Math.min(want, down ? below : above));
      list.style.maxHeight = h + "px";
      list.style.minWidth = Math.max(r.width, select.classList.contains("phone__cc") ? 272 : 0) + "px";
      var w = list.offsetWidth;
      list.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + "px";
      var real = Math.min(list.scrollHeight, h);
      list.style.top = (down ? r.bottom + 6 : r.top - 6 - real) + "px";
    }

    function open() {
      if (!list.hidden) return;
      (btn.closest("dialog") || document.body).appendChild(list);
      list.classList.add("select__list--float");
      list.hidden = false;
      place();
      window.addEventListener("resize", place);
      window.addEventListener("scroll", place, true);
      wrap.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      setActive(select.selectedIndex);
    }

    function close() {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      list.hidden = true;
      wrap.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      btn.removeAttribute("aria-activedescendant");
    }

    function choose(i) {
      select.selectedIndex = i;
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
      sync();
      close();
    }

    btn.addEventListener("click", function () {
      if (list.hidden) open();
      else close();
    });

    list.addEventListener("mousedown", function (e) {
      e.preventDefault(); // keep focus on the button
    });
    list.addEventListener("click", function (e) {
      var li = e.target.closest(".select__option");
      if (li) choose(Number(li.dataset.index));
    });

    btn.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "ArrowDown" || k === "ArrowUp") {
        e.preventDefault();
        if (list.hidden) open();
        else setActive(active + (k === "ArrowDown" ? 1 : -1));
      } else if (k === "Home" || k === "End") {
        if (!list.hidden) {
          e.preventDefault();
          setActive(k === "Home" ? 0 : opts.length - 1);
        }
      } else if (k === "Enter" || k === " ") {
        e.preventDefault();
        if (list.hidden) open();
        else choose(active);
      } else if (k === "Escape") {
        if (!list.hidden) {
          e.preventDefault();
          close();
        }
      } else if (k === "Tab") {
        close();
      } else if (k.length === 1) {
        typed += k.toLowerCase();
        window.clearTimeout(typedTimer);
        typedTimer = window.setTimeout(function () {
          typed = "";
        }, 600);
        for (var n = 0; n < opts.length; n += 1) {
          if (opts[n].textContent.toLowerCase().indexOf(typed) === 0) {
            if (list.hidden) open();
            setActive(n);
            break;
          }
        }
      }
    });

    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target) && !list.contains(e.target)) close();
    });

    // validation state + programmatic focus mirror the native control
    select.focus = function () {
      btn.focus();
    };
    new MutationObserver(function () {
      btn.setAttribute("aria-invalid", select.getAttribute("aria-invalid") || "false");
    }).observe(select, { attributes: true, attributeFilter: ["aria-invalid"] });

    if (select.form) {
      select.form.addEventListener("reset", function () {
        window.setTimeout(sync, 0);
      });
    }

    sync();
  }

  document.querySelectorAll("select.field__control").forEach(enhance);
})();

/* components/tabs.js */
/* Accessible tabs (residences): roving tabindex, arrow/Home/End keys. */
(function () {
  "use strict";

  document.querySelectorAll("[data-tabs]").forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        select(tab, false);
      });
      tab.addEventListener("keydown", function (e) {
        var next;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          select(next, true);
        }
      });
    });
  });
})();

/* components/hero-modal.js */
/* Hero "Get a Proposal" collapsible popup modal. */
(function () {
  "use strict";

  var modal = document.getElementById("hero-form-modal");
  var backdrop = document.getElementById("hero-modal-backdrop");
  var openBtn = document.getElementById("hero-proposal-btn");
  var closeBtn = document.getElementById("hero-modal-close");

  if (!modal || !openBtn) return;

  var lastFocus = null;
  var focusableSelectors = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function trapFocus(e) {
    var focusable = Array.from(modal.querySelectorAll(focusableSelectors));
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }

  function openModal() {
    lastFocus = document.activeElement;
    backdrop.removeAttribute("hidden");
    // Trigger reflow before adding class for animation
    backdrop.offsetHeight;
    backdrop.classList.add("is-open");
    modal.removeAttribute("inert");
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    // Focus first input after animation
    window.setTimeout(function () {
      var first = modal.querySelector(".field__control");
      if (first) first.focus({ preventScroll: true });
    }, 80);
    document.addEventListener("keydown", handleKeyDown);
    modal.addEventListener("keydown", trapFocus);
  }

  function closeModal() {
    modal.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    modal.setAttribute("inert", "");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", handleKeyDown);
    modal.removeEventListener("keydown", trapFocus);
    // Hide backdrop after transition
    window.setTimeout(function () {
      backdrop.setAttribute("hidden", "");
    }, 380);
    if (lastFocus && document.contains(lastFocus)) {
      lastFocus.focus({ preventScroll: true });
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") closeModal();
  }

  openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);
})();

/* components/leaves.js */
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

/* components/titles.js */
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

/* components/expert.js */
/* Floating "chat with an expert" prompt: hidden while the hero or footer is on screen. */
(function () {
  "use strict";
  var box = document.querySelector("[data-expert]");
  if (!box) return;
  var zones = Array.prototype.slice.call(document.querySelectorAll(".hero, .site-footer"));
  if (!zones.length || !("IntersectionObserver" in window)) return;
  var seen = zones.map(function () { return false; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      seen[zones.indexOf(e.target)] = e.isIntersecting;
    });
    box.classList.toggle("is-away", seen.some(Boolean));
  });
  zones.forEach(function (z) { io.observe(z); });
})();

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

/* components/connectivity.js */
/* Connectivity: choose a destination to swap the background photo, highlight its marker and update the distance pin. */
(function () {
  "use strict";

  var root = document.querySelector("[data-conn]");
  if (!root) return;
  var photos = Array.prototype.slice.call(root.querySelectorAll("[data-conn-photo]"));
  var rows = Array.prototype.slice.call(root.querySelectorAll(".conn__route"));
  var cards = Array.prototype.slice.call(root.querySelectorAll(".conn__place"));
  var dots = Array.prototype.slice.call(root.querySelectorAll(".conn__dot"));
  var link = root.querySelector(".conn__link");
  var dist = root.querySelector(".conn__dist");
  var status = root.querySelector("[data-conn-status]");

  // phones: the place circles are a horizontal swipe strip; keep the active one centred (scrolls the strip only, never the page)
  function centerInStrip(el) {
    var strip = el.parentNode;
    if (!strip || strip.scrollWidth <= strip.clientWidth + 2) return;
    var left = el.offsetLeft - (strip.clientWidth - el.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }

  function select(i) {
    var row = rows[i];
    if (!row) return;
    var photo = Number(row.getAttribute("data-photo"));
    photos.forEach(function (img, n) { img.classList.toggle("is-active", n === photo); });
    rows.forEach(function (el, n) {
      el.classList.toggle("is-active", n === i);
      el.querySelector(".conn__pick").setAttribute("aria-pressed", String(n === i));
    });
    cards.forEach(function (el, n) {
      var on = n === photo && i < cards.length;
      el.classList.toggle("is-active", on);
      el.querySelector(".conn__pick").setAttribute("aria-pressed", String(on));
      if (on) centerInStrip(el);
    });
    dots.forEach(function (d) { d.classList.toggle("is-active", Number(d.getAttribute("data-i")) === i); });
    var d = dots[i];
    if (d && link) {
      link.setAttribute("x2", d.getAttribute("data-x"));
      link.setAttribute("y2", d.getAttribute("data-y"));
    }
    if (dist && d) {
      var dx = Number(d.getAttribute("data-x"));
      var dy = Number(d.getAttribute("data-y"));
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / len;
      var uy = dy / len;
      var CHIP_W = 62;
      var CHIP_H = 24;
      function clash(cx, cy) {
        var hit = false;
        function circle(ox, oy, r) {
          var nx = Math.max(cx - CHIP_W / 2, Math.min(ox, cx + CHIP_W / 2));
          var ny = Math.max(cy - CHIP_H / 2, Math.min(oy, cy + CHIP_H / 2));
          if ((nx - ox) * (nx - ox) + (ny - oy) * (ny - oy) < r * r) hit = true;
        }
        function box(bx, by, bw, bh) {
          if (cx - CHIP_W / 2 < bx + bw && cx + CHIP_W / 2 > bx && cy - CHIP_H / 2 < by + bh && cy + CHIP_H / 2 > by) hit = true;
        }
        circle(0, 0, 36);
        dots.forEach(function (o) {
          circle(Number(o.getAttribute("data-x")), Number(o.getAttribute("data-y")), o === d ? 28 : 19);
        });
        [-184, -140, -93, -49].forEach(function (py) { box(-30, py - 12, 60, 24); });
        return hit;
      }
      // try just outside the marker first, then around it, and keep the first spot that covers nothing
      var gap = 30;
      var tries = [[ux, uy], [-uy, ux], [uy, -ux], [-ux, -uy], [ux + -uy, uy + ux], [ux + uy, uy - ux]];
      var pos = null;
      for (var n = 0; n < tries.length && !pos; n += 1) {
        var vx = tries[n][0];
        var vy = tries[n][1];
        var vl = Math.sqrt(vx * vx + vy * vy) || 1;
        vx /= vl;
        vy /= vl;
        var off = gap + (CHIP_W / 2) * Math.abs(vx) + (CHIP_H / 2) * Math.abs(vy);
        var px = dx + vx * off;
        var py2 = dy + vy * off;
        if (!clash(px, py2)) pos = [px, py2];
      }
      if (!pos) pos = [dx + ux * (gap + 31), dy + uy * (gap + 12)];
      dist.setAttribute("transform", "translate(" + pos[0].toFixed(1) + " " + pos[1].toFixed(1) + ")");
      dist.querySelector("text").textContent = row.getAttribute("data-km") + " km";
    }
    if (status) status.textContent = row.querySelector(".conn__name").textContent.replace(/\s+/g, " ") + ": " +
      row.getAttribute("data-km") + " km" + (row.getAttribute("data-min") ? ", " + row.getAttribute("data-min") : "");
  }

  rows.forEach(function (el, i) {
    el.querySelector(".conn__pick").addEventListener("click", function () { select(i); });
  });
  var current = 0;
  var baseSelect = select;
  select = function (i) {
    current = Number(rows[i].getAttribute("data-photo"));
    baseSelect(i);
  };

  // hovering (or focusing) a thumbnail previews its photo in the background; leaving restores the selected one
  function preview(photo) {
    photos.forEach(function (img, n) { img.classList.toggle("is-active", n === photo); });
  }
  cards.forEach(function (el, i) {
    var pick = el.querySelector(".conn__pick");
    pick.addEventListener("click", function () { select(i); });
    ["mouseenter", "focus"].forEach(function (ev) {
      pick.addEventListener(ev, function () { preview(i); });
    });
    ["mouseleave", "blur"].forEach(function (ev) {
      pick.addEventListener(ev, function () { preview(current); });
    });
  });
  dots.forEach(function (d) {
    d.addEventListener("click", function () { select(Number(d.getAttribute("data-i"))); });
  });
  select(0);

  // optional auto-cycle (data-auto = ms): steps through the destinations while the section is on screen; pauses on hover / focus, stops once the visitor clicks
  var every = Number(root.getAttribute("data-auto"));
  if (every > 0 && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var at = 0;
    var timer = null;
  var shownPoster = false;
    var seen = false;
    var held = false;
    var done = false;
    var step = function () {
      if (!seen || held || done) return;
      at = (at + 1) % rows.length;
      select(at);
    };
    var go = function () { if (!timer && !done) timer = window.setInterval(step, every); };
    var stop = function () { window.clearInterval(timer); timer = null; };
    new IntersectionObserver(function (e) {
      seen = e[0].isIntersecting;
      if (seen) go();
      else stop();
    }, { threshold: 0.35 }).observe(root);
    root.addEventListener("mouseenter", function () { held = true; });
    root.addEventListener("mouseleave", function () { held = false; });
    root.addEventListener("focusin", function () { held = true; });
    root.addEventListener("focusout", function () { held = false; });
    root.addEventListener("click", function (ev) { if (ev.target.closest(".conn__pick, .conn__dot")) { done = true; stop(); } });
  }
})();

/* components/bg-lazy.js */
/* Lazy section artwork: CSS background images are exposed (via custom properties) only once a section is near the viewport. */
(function () {
  "use strict";

  var root = document.documentElement;
  var targets = Array.prototype.slice.call(document.querySelectorAll("main > section, .site-footer"));

  function wake(el) { el.classList.add("is-near"); }

  if (!("IntersectionObserver" in window)) {
    targets.forEach(wake);
    root.classList.add("is-idle");
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      wake(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: "100% 0px 100% 0px" });
  targets.forEach(function (el) { io.observe(el); });

  var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 2500); };
  window.addEventListener("load", function () {
    idle(function () { root.classList.add("is-idle"); });
  });
})();

/* components/way-swap.js */
/* Life at Praana: hovering / focusing / tapping an item swaps the centre photo. */
(function () {
  "use strict";

  var stage = document.querySelector("[data-way-swap]");
  if (!stage) return;
  var imgs = Array.prototype.slice.call(stage.querySelectorAll("[data-way-img]"));
  var items = Array.prototype.slice.call(stage.querySelectorAll("[data-way-item]"));
  var base = stage.querySelector('[data-way-img="base"]');
  var current = "base";
  var canHover = window.matchMedia("(hover: hover)");

  function show(key) {
    imgs.forEach(function (im) { im.classList.toggle("is-active", im.getAttribute("data-way-img") === String(key)); });
    items.forEach(function (it) { it.classList.toggle("is-on", String(it.getAttribute("data-way-item")) === String(key)); });
  }

  items.forEach(function (it) {
    var k = it.getAttribute("data-way-item");
    it.addEventListener("mouseenter", function () { if (canHover.matches) show(k); });
    it.addEventListener("mouseleave", function () { if (canHover.matches) show(current); });
    it.addEventListener("focus", function () { show(k); });
    it.addEventListener("blur", function () { show(current); });
    it.addEventListener("click", function () {
      current = k;
      show(k);
    });
  });
  // optional auto-cycle (data-auto = ms): runs while the section is on screen, pauses on hover / focus, stops once the visitor picks an item
  var every = Number(stage.getAttribute("data-auto"));
  if (every > 0 && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var host = stage.closest("section") || stage; // the stage itself has no box on desktop (display: contents)
    var idx = -1;
    var timer = null;
    var visible = false;
    var paused = false;
    var picked = false;
    var tick = function () {
      if (!visible || paused || picked) return;
      idx = (idx + 1) % items.length;
      show(items[idx].getAttribute("data-way-item"));
    };
    var run = function () {
      if (timer || picked) return;
      timer = window.setInterval(tick, every);
    };
    var halt = function () {
      window.clearInterval(timer);
      timer = null;
    };
    new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting;
      if (visible) run();
      else halt();
    }, { threshold: 0.35 }).observe(host);
    host.addEventListener("mouseenter", function () { paused = true; });
    host.addEventListener("mouseleave", function () { paused = false; show(current); idx = -1; });
    host.addEventListener("click", function (ev) { if (ev.target.closest("[data-way-item]")) { picked = true; halt(); } });
  }
})();

/* components/counter.js */
/* Count-up for numbers marked data-count="30" (optional data-suffix="+"): runs once when scrolled into view. */
(function () {
  "use strict";

  var els = document.querySelectorAll("[data-count]");
  if (!els.length) return;
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function run(el) {
    var end = Number(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var final = el.textContent;
    var dur = 1600;
    var t0 = null;
    el.style.minWidth = el.offsetWidth + "px"; // hold the final width so nothing shifts while counting
    function tick(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) window.requestAnimationFrame(tick);
      else el.textContent = final;
    }
    el.textContent = "0" + suffix;
    window.requestAnimationFrame(tick);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      run(e.target);
    });
  }, { threshold: 0.6 });
  els.forEach(function (el) { io.observe(el); });
})();

/* components/hero-slider.js */
/* Hero image slider: crossfades the slides every 4 s. Starts after page load so it never competes with the first image. */
(function () {
  "use strict";

  var hero = document.getElementById("top");
  var box = hero && hero.querySelector("[data-hero-slider]");
  if (!box) return;
  var slides = Array.prototype.slice.call(box.querySelectorAll(".hero__slide"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
  if (slides.length < 2) return;

  var DELAY = 4000;
  var index = 0;
  var timer = null;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) { s.classList.toggle("is-active", n === index); });
    dots.forEach(function (d, n) {
      d.classList.toggle("is-active", n === index);
      d.setAttribute("aria-current", n === index ? "true" : "false");
    });
    // the last slide has its own headline: show that copy block instead of the default one
    var poster = slides[index].classList.contains("hero__slide--poster");
    hero.classList.toggle("is-poster", poster);
    // when the copy block changes, replay the same word-by-word rise the section titles use
    if (shownPoster !== poster) replayTitle(poster);
    shownPoster = poster;
  }

  function replayTitle(poster) {
    var sel = poster ? ".hero__inner--slide3 .hero__title-main" : ".hero__inner:not(.hero__inner--slide3) .hero__title-main";
    var el = hero.querySelector(sel);
    if (!el || !el.classList.contains("title-anim")) return;
    el.classList.add("title-snap"); // jump back to the hidden state without animating
    el.classList.remove("is-visible");
    void el.offsetWidth;
    el.classList.remove("title-snap");
    el.classList.add("is-visible"); // titles.js transition: words rise out of their masks, staggered
  }
  function stop() { window.clearInterval(timer); timer = null; }
  function play() { if (timer || document.hidden) return; timer = window.setInterval(function () { show(index + 1); }, DELAY); }

  dots.forEach(function (d, n) {
    d.addEventListener("click", function () { show(n); stop(); play(); });
  });
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : play(); });
  hero.addEventListener("focusin", stop);
  hero.addEventListener("focusout", play);

  function start() { box.classList.add("is-ready"); play(); }
  if (document.readyState === "complete") start();
  else {
    window.addEventListener("load", start);
    window.setTimeout(start, 3000); // slow phones: do not wait for every last asset
  }
})();

/* main.js */
/* Entry point (runs last in the bundle). */
(function () {
  "use strict";
  // JS-only styling hooks: .reveal stays visible unless this class is present.
  document.documentElement.classList.add("js");
  // reveal.js ran before the class was set on first paint; re-run is not needed
  // because .reveal elements are hidden by CSS only once .js exists and the
  // IntersectionObserver then marks them .is-in immediately when in view.
})();

