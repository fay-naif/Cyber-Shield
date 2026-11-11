/**
 * Header navigation: mobile menu toggle and active link while scrolling.
 */
window.Navigation = (function () {
  "use strict";
  const { $, $$ } = window.Dom;

  function setupToggle() {
    const toggle = $("#navToggle");
    const nav = $("#mainNav");
    if (!toggle || !nav) return;

    const close = () => {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    $$(".nav-link", nav).forEach((link) => link.addEventListener("click", close));
  }

  function setupActiveLink() {
    const links = $$(".nav-link");
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach((section) => observer.observe(section));
  }

  function init() {
    setupToggle();
    if ("IntersectionObserver" in window) setupActiveLink();
  }

  return { init };
})();
