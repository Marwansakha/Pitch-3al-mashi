import { getStore } from "@netlify/blobs";

const STORE = "creator-metrics";
const KEY = "latest";

function json(data, status, cache) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": cache
    }
  });
}

export default async function handler(request) {
  if (request.method !== "GET") return json({ error: "method" }, 405, "no-store");

  let store;
  try {
    store = getStore({ name: STORE, consistency: "strong" });
  } catch (error) {
    return json({ error: "missing" }, 404, "no-store");
  }

  let data = null;
  try {
    data = await store.get(KEY, { type: "json" });
  } catch (error) {
    return json({ error: "missing" }, 404, "no-store");
  }
  if (!data) return json({ error: "missing" }, 404, "no-store");

  return json(data, 200, "public, max-age=300");
}
