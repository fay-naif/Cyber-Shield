/**
 * Link analyzer
 * -------------
 * Pure, dependency-free URL risk scoring. It runs entirely in the browser
 * (and in Node for the tests) and never sends the link anywhere.
 *
 * Every link starts with a safety score of 100. Each warning sign found in
 * the link takes points off. The final score decides the risk level:
 *   score >= 80  -> safe
 *   score >= 50  -> medium
 *   score <  50  -> high
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.LinkAnalyzer = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /** Words commonly used in phishing links, in the order they are reported. */
  const SUSPICIOUS_KEYWORDS = [
    "verify", "bank", "secure", "login", "account", "update", "confirm",
    "password", "signin", "wallet", "gift", "free", "prize", "bonus", "unlock",
  ];

  /** Top-level domains that are cheap and widely abused. */
  const RISKY_TLDS = ["top", "xyz", "zip", "mov", "click", "tk", "ml", "ga", "cf", "gq", "work", "loan", "rest", "cam"];

  /** Known URL shorteners — they hide the real destination. */
  const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "rb.gy", "ow.ly", "shorturl.at"];

  /** Brands often impersonated; a match outside the official domain is a red flag. */
  const BRANDS = {
    paypal: "paypal.com",
    apple: "apple.com",
    google: "google.com",
    microsoft: "microsoft.com",
    amazon: "amazon.com",
    alrajhi: "alrajhibank.com.sa",
    stcpay: "stcpay.com.sa",
    absher: "absher.sa",
  };

  /** Points removed for each warning sign. */
  const PENALTY = {
    keyword: 15,
    riskyTld: 20,
    noHttps: 15,
    ipHost: 30,
    atSymbol: 25,
    punycode: 25,
    manySubdomains: 10,
    longUrl: 10,
    shortener: 15,
    brandLookalike: 30,
    manyHyphens: 5,
  };

  const LEVELS = { SAFE: "safe", MEDIUM: "medium", HIGH: "high" };

  /**
   * Adds a scheme when the user pasted a bare domain, then parses it.
   * @param {string} raw
   * @returns {URL|null}
   */
  function parseUrl(raw) {
    const value = String(raw || "").trim();
    if (!value) return null;
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : "http://" + value;
    try {
      const url = new URL(withScheme);
      return url.hostname.includes(".") || isIpAddress(url.hostname) ? url : null;
    } catch (err) {
      return null;
    }
  }

  /** @param {string} host */
  function isIpAddress(host) {
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("[");
  }

  /**
   * Analyzes a link and returns its safety score, level and reasons.
   * @param {string} input - the link as typed or pasted by the user
   * @returns {{valid: boolean, score?: number, level?: string, keywords?: string[], reasons?: string[]}}
   */
  function analyze(input) {
    const url = parseUrl(input);
    if (!url) return { valid: false };

    const raw = String(input).trim().toLowerCase();
    const host = url.hostname.toLowerCase();
    const labels = host.split(".");
    const tld = labels[labels.length - 1];
    const reasons = [];
    let score = 100;

    const penalize = (points, reason) => {
      score -= points;
      reasons.push(reason);
    };

    // 1. Phishing keywords anywhere in the link
    const keywords = SUSPICIOUS_KEYWORDS.filter((word) => raw.includes(word));
    keywords.forEach(() => { score -= PENALTY.keyword; });
    if (keywords.length) reasons.push("كلمات شائعة في روابط التصيد");

    // 2. Risky top-level domain
    if (RISKY_TLDS.includes(tld)) penalize(PENALTY.riskyTld, "امتداد نطاق يُستخدم كثيراً في الاحتيال (." + tld + ")");

    // 3. Plain HTTP
    if (url.protocol === "http:" && /^http:\/\//.test(raw)) penalize(PENALTY.noHttps, "الاتصال غير مشفّر (HTTP)");

    // 4. Raw IP address instead of a domain
    if (isIpAddress(host)) penalize(PENALTY.ipHost, "يستخدم عنوان IP بدل اسم موقع");

    // 5. "@" hides the real host (user@real-host)
    if (raw.includes("@")) penalize(PENALTY.atSymbol, "يحتوي على رمز @ لإخفاء الوجهة الحقيقية");

    // 6. Punycode can disguise look-alike characters
    if (host.includes("xn--")) penalize(PENALTY.punycode, "نطاق بأحرف مموّهة (Punycode)");

    // 7. Deeply nested subdomains
    if (labels.length > 4) penalize(PENALTY.manySubdomains, "عدد كبير من النطاقات الفرعية");

    // 8. Unusually long link
    if (raw.length > 90) penalize(PENALTY.longUrl, "الرابط طويل بشكل غير طبيعي");

    // 9. Shortened link
    if (SHORTENERS.includes(host.replace(/^www\./, ""))) penalize(PENALTY.shortener, "رابط مختصر يخفي الوجهة");

    // 10. Brand name used outside its official domain
    Object.keys(BRANDS).forEach((brand) => {
      const official = BRANDS[brand];
      if (host.includes(brand) && host !== official && !host.endsWith("." + official)) {
        penalize(PENALTY.brandLookalike, "ينتحل اسم " + brand);
      }
    });

    // 11. Many hyphens in the domain
    if ((host.match(/-/g) || []).length >= 3) penalize(PENALTY.manyHyphens, "شرطات كثيرة في اسم النطاق");

    score = Math.max(0, Math.min(100, score));

    let level = LEVELS.SAFE;
    if (score < 50) level = LEVELS.HIGH;
    else if (score < 80) level = LEVELS.MEDIUM;

    return { valid: true, score, level, keywords, reasons, host };
  }

  return { analyze, parseUrl, LEVELS, SUSPICIOUS_KEYWORDS, RISKY_TLDS };
});
