import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateMetrics } from "../scripts/update-creator-metrics.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fn = fs.readFileSync(path.join(root, "netlify/functions/creator-metrics.mjs"), "utf8");
const script = fs.readFileSync(path.join(root, "scripts/update-creator-metrics.mjs"), "utf8");

assert.match(fn, /creator-metrics/);
assert.match(fn, /"latest"/);
assert.match(fn, /max-age=300/);
assert.match(fn, /404/);
assert.match(script, /NETLIFY_AUTH_TOKEN/);
assert.match(script, /NETLIFY_SITE_ID/);
assert.match(script, /c065d51a-130f-4cc6-9c4c-cbb863bd2e9f/);
assert.equal(script.includes("loquacious-cobbler-451547"), false);
assert.equal(script.includes("console.log(token"), false);

assert.equal(validateMetrics(null), "JSON must be an object");
assert.match(validateMetrics({ updatedAt: "nope", metrics: {} }), /ISO/);
assert.match(validateMetrics({ updatedAt: "2026-11-26T05:30:00.000Z" }), /metrics/);
assert.equal(validateMetrics({
  updatedAt: "2026-11-26T05:30:00.000Z",
  metrics: { views: 1820375, followers: 78936 }
}), "");

const workshop = fs.readFileSync(path.join(root, "grok-workshop/sessions.json"), "utf8");
assert.ok(workshop.length > 10);

console.log("creator metrics tests passed");
