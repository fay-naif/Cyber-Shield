import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { fnv1a, normalizeHost, shardOf, SHARD_COUNT } = require("../js/core/domain-hash.js");

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test("hash is stable", () => {
  assert.equal(fnv1a("example.com"), fnv1a("example.com"));
  assert.notEqual(fnv1a("example.com"), fnv1a("example.net"));
});

test("host is normalized before hashing", () => {
  assert.equal(normalizeHost("WWW.Example.COM."), "example.com");
  assert.equal(shardOf("www.example.com"), shardOf("example.com"));
});

test("shard id is two hex characters inside the range", () => {
  for (const host of ["a.com", "secure-bank-verify.top", "مثال.السعودية"]) {
    const id = shardOf(host);
    assert.match(id, /^[0-9a-f]{2}$/);
    assert.ok(parseInt(id, 16) < SHARD_COUNT);
  }
});

let failed = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    console.log("  \u2713 " + name);
  } catch (err) {
    failed++;
    console.log("  \u2717 " + name + "\n    " + err.message);
  }
}
console.log("\n" + (tests.length - failed) + "/" + tests.length + " passed");
process.exit(failed ? 1 : 0);
