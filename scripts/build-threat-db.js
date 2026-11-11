#!/usr/bin/env node
/**
 * Builds the phishing database used by the link checker.
 *
 * Downloads public phishing feeds, keeps the host names, removes duplicates and
 * writes them into 256 shard files under data/threats/ plus a manifest.json.
 * Run by the deploy workflow every day; can also be run locally:
 *
 *   npm run build:threats
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { normalizeHost, shardOf, SHARD_COUNT } = require("../js/core/domain-hash.js");

const OUT_DIR = path.join(__dirname, "..", "data", "threats");

const SOURCES = [
  {
    name: "OpenPhish",
    url: "https://openphish.com/feed.txt",
    type: "urls",
  },
  {
    name: "Phishing.Database",
    url: "https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-domains-ACTIVE.txt",
    type: "domains",
  },
];

/** Hosts that must never be flagged as a whole (shared hosting / big platforms). */
const NEVER_BLOCK = new Set([
  "github.io", "github.com", "google.com", "docs.google.com", "drive.google.com", "sites.google.com",
  "vercel.app", "netlify.app", "web.app", "firebaseapp.com", "pages.dev", "workers.dev",
  "000webhostapp.com", "blogspot.com", "wixsite.com", "weebly.com", "microsoft.com", "apple.com",
]);

function toHost(line, type) {
  const value = line.trim();
  if (!value || value.startsWith("#")) return null;
  if (type === "domains") return normalizeHost(value);
  try {
    return normalizeHost(new URL(value).hostname);
  } catch (err) {
    return null;
  }
}

async function download(source) {
  const res = await fetch(source.url);
  if (!res.ok) throw new Error(source.name + " answered HTTP " + res.status);
  const text = await res.text();
  return text.split(/\r?\n/).map((line) => toHost(line, source.type)).filter(Boolean);
}

async function main() {
  const hosts = new Set();
  const counts = {};

  for (const source of SOURCES) {
    try {
      const list = await download(source);
      list.forEach((host) => hosts.add(host));
      counts[source.name] = list.length;
      console.log("✓ " + source.name + ": " + list.length.toLocaleString() + " entries");
    } catch (err) {
      counts[source.name] = 0;
      console.warn("✗ " + source.name + " skipped — " + err.message);
    }
  }

  NEVER_BLOCK.forEach((host) => hosts.delete(host));
  if (!hosts.size) throw new Error("No feed could be downloaded — keeping the previous database.");

  const shards = Array.from({ length: SHARD_COUNT }, () => []);
  hosts.forEach((host) => shards[parseInt(shardOf(host), 16)].push(host));

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  shards.forEach((list, i) => {
    const id = i.toString(16).padStart(2, "0");
    fs.writeFileSync(path.join(OUT_DIR, id + ".json"), JSON.stringify(list.sort()));
  });

  const manifest = {
    updatedAt: new Date().toISOString(),
    total: hosts.size,
    sources: SOURCES.map((s) => ({ name: s.name, url: s.url, entries: counts[s.name] })),
  };
  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("Database ready: " + hosts.size.toLocaleString() + " unique hosts in " + SHARD_COUNT + " shards.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
