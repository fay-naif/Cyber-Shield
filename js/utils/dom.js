/**
 * Tiny DOM helpers shared by the modules.
 */
window.Dom = (function () {
  "use strict";

  /** @param {string} selector @param {ParentNode} [scope] */
  const $ = (selector, scope = document) => scope.querySelector(selector);

  /** @param {string} selector @param {ParentNode} [scope] */
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  /** Escapes user text before it is placed inside HTML. */
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
  }

  return { $, $$, escapeHtml };
})();
