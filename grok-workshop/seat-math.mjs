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
    return "الجمعة " + startDay + " والسبت " + endDay + " " + startMonth + " " + startYear;
  }
  if (startYear === endYear) {
    return "الجمعة " + startDay + " " + startMonth + " والسبت " + endDay + " " + endMonth + " " + startYear;
  }
  return "الجمعة " + startDay + " " + startMonth + " " + startYear + " والسبت " + endDay + " " + endMonth + " " + endYear;
}

export function offeredSessions(sessions, bookings) {
  const base = sessions.find((session) => session.active !== false);
  if (!base) return [];
  const offered = [];
  let current = {
    id: base.id,
    label: base.label,
    seeded: base.seeded || 0,
    capacity: base.capacity,
    active: true
  };
  for (let step = 0; step < 104; step++) {
    offered.push(current);
    if (seatsLeft(current, bookings) > 0) break;
    const id = addDays(current.id, 7);
    current = {
      id,
      label: weekendLabel(id),
      seeded: 0,
      capacity: current.capacity,
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
