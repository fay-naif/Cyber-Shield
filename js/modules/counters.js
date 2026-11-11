/**
 * Animates the statistics from 0 to their target value once visible.
 */
window.Counters = (function () {
  "use strict";

  const DURATION = 1600;
  const format = (n) => n.toLocaleString("en-US");

  function animate(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(Math.round(target * eased)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function init() {
    const counters = window.Dom.$$("[data-count]");

    if (!("IntersectionObserver" in window)) {
      counters.forEach((el) => { el.textContent = format(Number(el.dataset.count)) + (el.dataset.suffix || ""); });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach((el) => observer.observe(el));
  }

  return { init };
})();
