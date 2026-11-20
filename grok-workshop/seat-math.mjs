export function seatsLeft(session, bookings) {
  const real = bookings.filter((row) => row.sessionId === session.id).length;
  return Math.max(0, session.capacity - (session.seeded || 0) - real);
}

export function book(sessions, bookings, entry) {
  const email = String(entry.email || "").trim().toLowerCase();
  const row = {
    sessionId: entry.sessionId,
    email,
    name: String(entry.name || "").trim(),
    role: String(entry.role || "").trim(),
    phone: String(entry.phone || "").trim(),
    city: String(entry.city || "").trim(),
    at: entry.at || new Date().toISOString()
  };
  if (entry.sessionId === "waitlist") {
    return { ok: true, bookings: bookings.concat([row]), waitlist: true };
  }
  const session = sessions.find((item) => item.id === entry.sessionId);
  if (!session || session.active === false) return { error: "inactive" };
  if (bookings.some((item) => item.sessionId === session.id && item.email === email)) {
    return { error: "duplicate", seatsLeft: seatsLeft(session, bookings) };
  }
  if (seatsLeft(session, bookings) <= 0) return { error: "full", seatsLeft: 0 };
  const next = bookings.concat([Object.assign({}, row, { sessionId: session.id })]);
  return { ok: true, bookings: next, seatsLeft: seatsLeft(session, next) };
}

export function releaseTests(bookings, sessionId) {
  return bookings.filter((row) => {
    const testRow = String(row.name || "").startsWith("TEST") && String(row.email || "").endsWith("@example.com");
    if (!testRow) return true;
    if (sessionId && row.sessionId !== sessionId) return true;
    return false;
  });
}
