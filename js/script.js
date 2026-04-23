(function () {
  "use strict";

  var NAV_MAP = {
    index: "home",
    "index.html": "home",
    services: "services",
    "services.html": "services",
    menu: "menu",
    "menu.html": "menu",
    about: "about",
    "about.html": "about",
    contact: "contact",
    "contact.html": "contact",
  };

  function currentNavKey() {
    var page = document.body.getAttribute("data-page");
    if (page) return page;
    var path = window.location.pathname.split("/").pop() || "index.html";
    return NAV_MAP[path] || NAV_MAP[path.split(".")[0]] || "";
  }

  function setActiveNav() {
    var key = currentNavKey();
    if (!key) return;
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      if (link.getAttribute("data-nav") === key) {
        link.classList.add("active");
        if (link.getAttribute("aria-current") !== "page") {
          link.setAttribute("aria-current", "page");
        }
      }
    });
  }

  function loadPartial(containerId, url) {
    var el = document.getElementById(containerId);
    if (!el) return Promise.resolve();
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      })
      .then(function (html) {
        el.innerHTML = html;
      })
      .catch(function () {
        el.innerHTML =
          '<div class="alert alert-warning m-3">Impossible de charger <code>' +
          url +
          "</code>. Ouvrez le site via un serveur local (ex. Live Server) pour les includes.</div>";
      });
  }

  function initNavbarScroll() {
    var nav = document.getElementById("mainNav");
    if (!nav) return;
    var onScroll = function () {
      if (window.scrollY > 24) nav.classList.add("navbar-scrolled");
      else nav.classList.remove("navbar-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) {
        e.classList.add("reveal-visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("reveal-visible");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  function initBackToTop() {
    var btn = document.querySelector(".back-to-top");
    if (!btn) return;
    var toggle = function () {
      if (window.scrollY > 400) btn.classList.add("visible");
      else btn.classList.remove("visible");
    };
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initPromoDismiss() {
    var bar = document.getElementById("promoBar");
    if (!bar) return;
    if (sessionStorage.getItem("prs_promo_dismissed") === "1") {
      bar.remove();
      return;
    }
    var close = bar.querySelector("[data-dismiss-promo]");
    if (close) {
      close.addEventListener("click", function () {
        sessionStorage.setItem("prs_promo_dismissed", "1");
        bar.classList.add("d-none");
      });
    }
  }

  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = document.getElementById("formSuccess");
      if (ok) {
        ok.classList.remove("d-none");
        form.reset();
        ok.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  function initFooterYear() {
    var y = document.getElementById("footer-year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /** Ferme le menu hamburger après navigation (mobile). */
  function initMobileNavCollapseClose() {
    document.addEventListener(
      "click",
      function (e) {
        var link = e.target.closest("#navbarNav a");
        if (!link) return;
        var collapseEl = document.getElementById("navbarNav");
        if (!collapseEl || !collapseEl.classList.contains("show")) return;
        if (typeof bootstrap === "undefined" || !bootstrap.Collapse) return;
        bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: false }).hide();
      },
      true
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    initPromoDismiss();
    initReveal();
    initBackToTop();
    initContactForm();
    initMobileNavCollapseClose();

    Promise.all([
      loadPartial("site-navbar", "components/navbar.html"),
      loadPartial("site-footer", "components/footer.html"),
    ]).then(function () {
      initNavbarScroll();
      initFooterYear();
      setActiveNav();
    });
  });
})();
