/**
 * Shows a short message at the bottom of the screen.
 */
window.Toast = (function () {
  "use strict";
  let timer = null;

  /** @param {string} message @param {"success"|"error"} [type] */
  function show(message, type = "success") {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("toast--error", type === "error");
    el.classList.add("is-visible");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("is-visible"), 3000);
  }

  return { show };
})();
