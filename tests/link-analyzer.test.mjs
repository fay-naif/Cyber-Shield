// Run with: npm test  (Node 18+, no dependencies)
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { analyze } = require("../js/core/link-analyzer.js");

const cases = [
  ["reference example from the design", () => {
    const r = analyze("https://secure-bank-verify.top");
    assert.equal(r.score, 35);
    assert.equal(r.level, "high");
    assert.deepEqual(r.keywords, ["verify", "bank", "secure"]);
  }],
  ["well-known site is safe", () => {
    const r = analyze("https://www.google.com");
    assert.equal(r.level, "safe");
    assert.equal(r.score, 100);
  }],
  ["bare domain is accepted", () => {
    assert.equal(analyze("wikipedia.org").valid, true);
  }],
  ["empty and junk input are invalid", () => {
    assert.equal(analyze("").valid, false);
    assert.equal(analyze("hello").valid, false);
  }],
  ["IP host over http is high risk", () => {
    assert.equal(analyze("http://192.168.10.5/login").level, "high");
  }],
  ["brand look-alike is flagged", () => {
    const r = analyze("https://paypal-support.help");
    assert.ok(r.score < 80);
  }],
  ["shortener lowers the score", () => {
    assert.ok(analyze("https://bit.ly/abc123").score < 100);
  }],
];

let failed = 0;
for (const [name, fn] of cases) {
  try {
    fn();
    console.log("  \u2713 " + name);
  } catch (err) {
    failed++;
    console.error("  \u2717 " + name + "\n    " + err.message);
  }
}

console.log("\n" + (cases.length - failed) + "/" + cases.length + " passed");
process.exit(failed ? 1 : 0);
