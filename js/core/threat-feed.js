/**
 * Threat feed lookup
 * ------------------
 * Checks a host name against the phishing database published with the site
 * (data/threats/). The database is rebuilt every day by the deploy workflow
 * from public phishing feeds — see scripts/build-threat-db.js.
 */
window.ThreatFeed = (function () {
  "use strict";

  const BASE = "data/threats/";
  const shardCache = new Map();
  let manifestPromise = null;

  function loadManifest() {
    if (!manifestPromise) {
      manifestPromise = fetch(BASE + "manifest.json", { cache: "no-cache" })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);
    }
    return manifestPromise;
  }

  function loadShard(id) {
    if (!shardCache.has(id)) {
      const request = fetch(BASE + id + ".json")
        .then((res) => (res.ok ? res.json() : []))
        .then((list) => new Set(list))
        .catch(() => new Set());
      shardCache.set(id, request);
    }
    return shardCache.get(id);
  }

  /**
   * @param {string} host
   * @returns {Promise<{available: boolean, listed?: boolean, updatedAt?: string, total?: number}>}
   */
  async function lookup(host) {
    const manifest = await loadManifest();
    if (!manifest) return { available: false };

    const clean = window.DomainHash.normalizeHost(host);
    const shard = await loadShard(window.DomainHash.shardOf(clean));
    return {
      available: true,
      listed: shard.has(clean),
      updatedAt: manifest.updatedAt,
      total: manifest.total,
    };
  }

  return { lookup, loadManifest };
})();
