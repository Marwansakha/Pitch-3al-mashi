export function seatsLeft(session, bookings) {
  const real = bookings.filter((row) => row.sessionId === session.id).length;
  return Math.max(0, session.capacity - (session.seeded || 0) - real);
}

export function book(sessions, bookings, entry) {
  const session = sessions.find((item) => item.id === entry.sessionId);
  if (!session || session.active === false) return { error: "inactive" };
  const email = String(entry.email || "").trim().toLowerCase();
  if (bookings.some((row) => row.sessionId === session.id && row.email === email)) {
    return { error: "duplicate", seatsLeft: seatsLeft(session, bookings) };
  }
  if (seatsLeft(session, bookings) <= 0) return { error: "full", seatsLeft: 0 };
  const next = bookings.concat([{
    sessionId: session.id,
    email,
    name: String(entry.name || "").trim(),
    role: String(entry.role || "").trim(),
    phone: String(entry.phone || "").trim(),
    city: String(entry.city || "").trim(),
    at: entry.at || new Date().toISOString()
  }]);
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
