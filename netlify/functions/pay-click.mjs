import { getStore } from "@netlify/blobs";
import { MAX_BODY, appendClick, buildClick, payClickKey } from "../../grok-workshop/pay-click.mjs";

const STORE = "workshop-seats";

function reply(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

function hostName(request) {
  try {
    return new URL(request.url).hostname;
  } catch (error) {
    return String(request.headers.get("host") || "");
  }
}

function countryCode(context) {
  const geo = context && context.geo && context.geo.country;
  if (geo && geo.code) return String(geo.code);
  return "";
}

export default async function handler(request, context) {
  const key = payClickKey(hostName(request));
  let store;
  try {
    store = getStore({ name: STORE, consistency: "strong" });
  } catch (error) {
    return reply({ error: "store" }, 500);
  }

  if (request.method === "GET") {
    try {
      const clicks = (await store.get(key, { type: "json" })) || [];
      return reply({ count: clicks.length });
    } catch (error) {
      return reply({ error: "store" }, 500);
    }
  }

  if (request.method !== "POST") return reply({ error: "method" }, 405);

  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY) return reply({ error: "size" }, 413);
  let raw = "";
  try {
    raw = await request.text();
  } catch (error) {
    return reply({ error: "body" }, 400);
  }
  if (raw.length > MAX_BODY) return reply({ error: "size" }, 413);
  let body;
  try {
    body = JSON.parse(raw);
  } catch (error) {
    return reply({ error: "json" }, 400);
  }
  const built = buildClick(body, countryCode(context));
  if (built.error) return reply({ error: built.error }, 400);

  try {
    const clicks = (await store.get(key, { type: "json" })) || [];
    const next = appendClick(clicks, built.row);
    await store.setJSON(key, next);
    return reply({ ok: true, count: next.length });
  } catch (error) {
    return reply({ error: "store" }, 500);
  }
}
