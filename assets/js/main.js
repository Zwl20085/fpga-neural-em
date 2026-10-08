/* Applies SITE_CONFIG to the page and wires up navigation. No dependencies. */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};

  /** Render a value, or a visibly marked placeholder when it is missing. */
  function fill(el, value, placeholder) {
    el.textContent = "";
    if (value) {
      el.textContent = value;
      el.classList.remove("placeholder");
    } else {
      el.textContent = placeholder;
      el.classList.add("placeholder");
    }
  }

  function isSafeUrl(url) {
    return typeof url === "string" && /^(https:\/\/|mailto:)/i.test(url);
  }

  function makeLink(href, text) {
    var a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    if (/^https:/i.test(href)) a.rel = "noopener";
    return a;
  }

  function applyConfig() {
    document.querySelectorAll("[data-cfg]").forEach(function (el) {
      var key = el.getAttribute("data-cfg");
      fill(el, cfg[key], el.getAttribute("data-placeholder") || "To be confirmed");
    });

    var emailEl = document.getElementById("cfg-email");
    if (emailEl) {
      emailEl.textContent = "";
      if (cfg.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cfg.email)) {
        emailEl.classList.remove("placeholder");
        emailEl.appendChild(makeLink("mailto:" + cfg.email, cfg.email));
      } else {
        emailEl.classList.add("placeholder");
        emailEl.textContent = "Email address to be confirmed";
      }
    }

    var profileEl = document.getElementById("cfg-profile");
    if (profileEl) {
      if (isSafeUrl(cfg.profileUrl)) {
        profileEl.appendChild(makeLink(cfg.profileUrl, "Profile page"));
      } else {
        profileEl.hidden = true;
      }
    }

    var affEl = document.getElementById("cfg-affiliation");
    var addrEl = document.getElementById("cfg-address");
    if (affEl && addrEl) {
      if (cfg.affiliationConfirmed) {
        fill(affEl, cfg.affiliation, "");
        addrEl.textContent = "";
        (cfg.address || []).forEach(function (line, i) {
          if (i) addrEl.appendChild(document.createElement("br"));
          addrEl.appendChild(document.createTextNode(line));
        });
        addrEl.hidden = false;
      } else {
        fill(affEl, null, "Institutional affiliation to be confirmed");
        addrEl.hidden = true;
      }
    }

    renderList("cfg-team", cfg.team, function (m) {
      var li = document.createElement("li");
      var strong = document.createElement("strong");
      strong.textContent = m.name || "";
      li.appendChild(strong);
      if (m.role) li.appendChild(document.createTextNode(" — " + m.role));
      return li;
    }, "Further team members to be confirmed");

    renderList("cfg-publications", cfg.publications, function (p) {
      var li = document.createElement("li");
      li.appendChild(document.createTextNode(p.citation || ""));
      if (isSafeUrl(p.url)) {
        li.appendChild(document.createTextNode(" "));
        li.appendChild(makeLink(p.url, "[link]"));
      }
      return li;
    }, "Publication list to be added by the project team");

    var repos = cfg.repositories || {};
    [["cfg-repo-fe", repos.hairpinFE], ["cfg-repo-ai", repos.hairpinAI]].forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (!el) return;
      if (isSafeUrl(pair[1])) {
        el.textContent = "";
        el.appendChild(makeLink(pair[1], "Repository"));
      }
    });

    var upd = document.getElementById("cfg-updated");
    if (upd && cfg.lastUpdated) upd.textContent = cfg.lastUpdated;
  }

  function renderList(id, items, build, placeholder) {
    var ul = document.getElementById(id);
    if (!ul) return;
    ul.textContent = "";
    if (Array.isArray(items) && items.length) {
      items.forEach(function (it) { ul.appendChild(build(it)); });
    } else {
      var li = document.createElement("li");
      li.className = "placeholder";
      li.textContent = placeholder;
      ul.appendChild(li);
    }
  }

  function setupNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("nav-menu");
    if (!toggle || !menu) return;

    function close() {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("open");
    }
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("open", !open);
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        close();
        toggle.focus();
      }
    });

    if (!("IntersectionObserver" in window)) return;
    var links = {};
    menu.querySelectorAll('a[href^="#"]').forEach(function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
        var link = links[en.target.id];
        if (link) link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }

  function setupReveal() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var items = document.querySelectorAll(".reveal");
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("shown"); });
      return;
    }
    document.documentElement.classList.add("js-reveal");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("shown");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  applyConfig();
  setupNav();
  setupReveal();
})();
