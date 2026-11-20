import { getStore } from "@netlify/blobs";
import { book, releaseTests, seatsLeft } from "../../grok-workshop/seat-math.mjs";

const STORE = "workshop-seats";

function key() {
  return "bookings:" + (process.env.CONTEXT || "dev");
}

function reply(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

async function catalog(request) {
  const data = await fetch(new URL("/grok-workshop/sessions.json", request.url)).then((res) => {
    if (!res.ok) throw new Error("sessions");
    return res.json();
  });
  const capacity = data.capacity || 20;
  return data.sessions.map((session) => ({
    id: session.id,
    label: session.label,
    seeded: session.seeded || 0,
    capacity
  }));
}

async function loadBookings(store) {
  return (await store.get(key(), { type: "json" })) || [];
}

function summary(sessions, bookings) {
  return {
    sessions: sessions.map((session) => {
      const left = seatsLeft(session, bookings);
      return { id: session.id, seatsLeft: left, capacity: session.capacity, full: left === 0 };
    })
  };
}

export default async function handler(request) {
  if (request.method === "OPTIONS") return reply({ ok: true });
  let sessions;
  try {
    sessions = await catalog(request);
  } catch (error) {
    return reply({ error: "sessions" }, 500);
  }
  let store;
  try {
    store = getStore({ name: STORE, consistency: "strong" });
  } catch (error) {
    return reply({ error: "store" }, 500);
  }

  if (request.method === "GET") {
    try {
      return reply(summary(sessions, await loadBookings(store)));
    } catch (error) {
      return reply({ error: "store" }, 500);
    }
  }

  if (request.method !== "POST") return reply({ error: "method" }, 405);

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return reply({ error: "json" }, 400);
  }

  let bookings;
  try {
    bookings = await loadBookings(store);
  } catch (error) {
    return reply({ error: "store" }, 500);
  }

  if (body.action === "release") {
    const next = releaseTests(bookings, body.sessionId || "");
    await store.setJSON(key(), next);
    return reply(summary(sessions, next));
  }

  const entry = {
    sessionId: String(body.sessionId || "").trim(),
    name: body.name,
    email: body.email,
    role: body.role,
    phone: body.phone,
    city: body.city
  };
  if (!entry.sessionId || !String(entry.name || "").trim() || !String(entry.email || "").trim()) {
    return reply({ error: "fields" }, 400);
  }

  const result = book(sessions, bookings, entry);
  if (!result.ok) return reply(result, result.error === "full" ? 409 : 400);
  await store.setJSON(key(), result.bookings);
  return reply({ ok: true, seatsLeft: result.seatsLeft, sessions: summary(sessions, result.bookings).sessions });
}
