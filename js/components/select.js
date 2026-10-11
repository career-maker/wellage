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
      li.textContent = o.text;
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
      text.textContent = select.options[i].text;
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

    function open() {
      if (!list.hidden) return;
      list.hidden = false;
      wrap.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      setActive(select.selectedIndex);
    }

    function close() {
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
      if (!wrap.contains(e.target)) close();
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
