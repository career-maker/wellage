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
    } else if (el.name === "phone" && !PHONE_RE.test(v)) {
      msg = "Enter a valid 10-digit Indian mobile number, e.g. 98765 43210.";
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
