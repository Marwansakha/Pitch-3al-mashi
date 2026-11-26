const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function parseISO(id) {
  const parts = String(id).split("-").map(Number);
  return Date.UTC(parts[0], parts[1] - 1, parts[2]);
}

function formatISO(ms) {
  const date = new Date(ms);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return date.getUTCFullYear() + "-" + month + "-" + day;
}

export function addDays(id, days) {
  return formatISO(parseISO(id) + days * 86400000);
}

export function weekendLabel(fridayId) {
  const friday = parseISO(fridayId);
  const saturday = friday + 86400000;
  const start = new Date(friday);
  const end = new Date(saturday);
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const startMonth = MONTHS[start.getUTCMonth()];
  const endMonth = MONTHS[end.getUTCMonth()];
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();
  if (startMonth === endMonth && startYear === endYear) {
    return startDay + " و" + endDay + " " + startMonth + " " + startYear;
  }
  if (startYear === endYear) {
    return startDay + " " + startMonth + " و" + endDay + " " + endMonth + " " + startYear;
  }
  return startDay + " " + startMonth + " " + startYear + " و" + endDay + " " + endMonth + " " + endYear;
}

function isDateId(id) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(id || ""));
}

function sessionFromCatalog(session, fallback) {
  return {
    id: session.id,
    label: session.label,
    seeded: session.seeded || 0,
    capacity: session.capacity || fallback,
    closed: Boolean(session.closed),
    active: true
  };
}

export function offeredSessions(sessions, bookings, defaultCapacity) {
  const base = sessions.find((session) => session.active !== false);
  if (!base) return [];
  const fallback = defaultCapacity || base.capacity || 20;
  const catalog = new Map(sessions.map((session) => [session.id, session]));
  function hasLater(id) {
    const laterCatalog = sessions.some((session) => session.active !== false && isDateId(session.id) && parseISO(session.id) > parseISO(id));
    const laterBooked = (bookings || []).some((row) => {
      const sessionId = row.sessionId;
      if (!isDateId(sessionId) || sessionId === "waitlist") return false;
      return parseISO(sessionId) > parseISO(id);
    });
    return laterCatalog || laterBooked;
  }
  const offered = [];
  let current = sessionFromCatalog(base, fallback);
  for (let step = 0; step < 104; step++) {
    offered.push(current);
    // A closed session stays visible but stops auto-rollover, so no later weekend opens on its own.
    if (current.closed) break;
    if (seatsLeft(current, bookings) > 0 && !hasLater(current.id)) break;
    const id = addDays(current.id, 7);
    const existing = catalog.get(id);
    current = existing && existing.active !== false
      ? sessionFromCatalog(existing, fallback)
      : {
          id,
          label: weekendLabel(id),
          seeded: 0,
          capacity: fallback,
          closed: false,
          active: true
        };
  }
  return offered;
}

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
  if (session.closed) return { error: "full", seatsLeft: 0, closed: true };
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
