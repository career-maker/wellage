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
