/**
 * Entry point — starts every module once the page is ready.
 */
(function () {
  "use strict";

  function start() {
    const modules = [
      window.Navigation,
      window.Particles,
      window.Reveal,
      window.Counters,
      window.LinkChecker,
      window.Reviews,
      window.Faq,
      window.ContactForm,
    ];

    modules.forEach((mod) => mod && mod.init());

    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
