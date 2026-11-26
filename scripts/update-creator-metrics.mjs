import { getStore } from "@netlify/blobs";
import fs from "node:fs";
import path from "node:path";

const SITE = "loquacious-cobbler-451547";
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

async function siteID(token) {
  const response = await fetch("https://api.netlify.com/api/v1/sites/" + SITE, {
    headers: { Authorization: "Bearer " + token }
  });
  if (!response.ok) {
    console.error("Netlify site lookup failed (" + response.status + ")");
    process.exit(1);
  }
  const site = await response.json();
  if (!site || typeof site.id !== "string" || !site.id) {
    console.error("Netlify site lookup did not return an id");
    process.exit(1);
  }
  return site.id;
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
  const id = await siteID(token);
  const store = getStore({
    name: STORE,
    siteID: id,
    token,
    consistency: "strong"
  });
  await store.setJSON(KEY, payload);
  console.log("Wrote " + STORE + "/" + KEY + " for " + SITE + " (" + payload.updatedAt + ")");
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (invoked) main();
