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
