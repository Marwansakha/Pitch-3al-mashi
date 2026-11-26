import { getStore } from "@netlify/blobs";
import fs from "node:fs";
import path from "node:path";

const SITE_ID = process.env.NETLIFY_SITE_ID || "c065d51a-130f-4cc6-9c4c-cbb863bd2e9f";
const STORE = "creator-metrics";
const KEY = "latest";

export function validateMetrics(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "JSON must be an object";
  if (typeof payload.updatedAt !== "string" || Number.isNaN(Date.parse(payload.updatedAt))) {
    return "updatedAt must be an ISO date string";
  }
  if (!payload.metrics || typeof payload.metrics !== "object" || Array.isArray(payload.metrics)) {
    return "metrics must be an object";
  }
  return "";
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node scripts/update-creator-metrics.mjs <file.json>");
    process.exit(1);
  }
  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (!token) {
    console.error("NETLIFY_AUTH_TOKEN is not set");
    process.exit(1);
  }
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
  } catch (error) {
    console.error("Could not read JSON from " + file);
    process.exit(1);
  }
  const problem = validateMetrics(payload);
  if (problem) {
    console.error(problem);
    process.exit(1);
  }
  const store = getStore({
    name: STORE,
    siteID: SITE_ID,
    token,
    consistency: "strong"
  });
  await store.setJSON(KEY, payload);
  console.log("Wrote " + STORE + "/" + KEY + " (" + payload.updatedAt + ")");
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (invoked) main();
