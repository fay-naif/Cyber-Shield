/**
 * Safe wrapper around localStorage (some browsers block it on file://).
 */
window.Storage2 = (function () {
  "use strict";

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      /* storage unavailable — keep working in memory only */
    }
  }

  return { read, write };
})();
