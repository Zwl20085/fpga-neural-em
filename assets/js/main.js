/* Applies SITE_CONFIG to the page and wires up navigation. No dependencies. */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};

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
