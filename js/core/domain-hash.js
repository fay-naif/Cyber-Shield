/**
 * Domain hashing
 * --------------
 * The threat database is split into 256 small files ("shards") so the browser
 * only downloads the one file that could contain the domain being checked.
 * The shard is picked with a 32-bit FNV-1a hash of the domain — the same code
 * runs in the build script (Node) and in the browser.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.DomainHash = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const SHARD_COUNT = 256;

  /** @param {string} text */
  function fnv1a(text) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash >>> 0;
  }

  /** Lower-cases a host name and drops a leading "www." */
  function normalizeHost(host) {
    return String(host || "").trim().toLowerCase().replace(/\.$/, "").replace(/^www\./, "");
  }

  /** @returns {string} two-character hex shard id, "00" … "ff" */
  function shardOf(host) {
    return (fnv1a(normalizeHost(host)) % SHARD_COUNT).toString(16).padStart(2, "0");
  }

  return { fnv1a, normalizeHost, shardOf, SHARD_COUNT };
});
