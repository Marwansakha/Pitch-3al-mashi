import assert from "node:assert/strict";
import { book, offeredSessions, releaseTests, seatsLeft } from "../grok-workshop/seat-math.mjs";

const sessions = [
  { id: "2026-12-18", capacity: 20, seeded: 9 },
  { id: "2026-12-19", capacity: 20, seeded: 0 }
];

assert.equal(seatsLeft(sessions[0], []), 11);
assert.equal(seatsLeft(sessions[1], []), 20);

const first = book(sessions, [], { sessionId: "2026-12-18", name: "TEST 4", email: "test@example.com" });
assert.equal(first.ok, true);
assert.equal(first.seatsLeft, 10);

const again = book(sessions, first.bookings, { sessionId: "2026-12-18", name: "TEST 4", email: "test@example.com" });
assert.equal(again.error, "duplicate");

let rows = [];
for (let i = 0; i < 11; i++) {
  const next = book(sessions, rows, { sessionId: "2026-12-18", name: "TEST " + i, email: "test" + i + "@example.com" });
  assert.equal(next.ok, true);
  rows = next.bookings;
}
assert.equal(seatsLeft(sessions[0], rows), 0);
assert.equal(book(sessions, rows, { sessionId: "2026-12-18", name: "بعد", email: "late@example.com" }).error, "full");

const released = releaseTests(rows, "2026-12-18");
assert.equal(released.length, 0);
assert.equal(seatsLeft(sessions[0], released), 11);
assert.equal(book([{ id: "2026-12-19", capacity: 20, seeded: 0, active: false }], [], {
  sessionId: "2026-12-19", name: "TEST", email: "test@example.com"
}).error, "inactive");

const waiting = book(sessions, rows, { sessionId: "waitlist", name: "TEST Wait", email: "wait@example.com", role: "مدير", phone: "1", city: "عمّان" });
assert.equal(waiting.ok, true);
assert.equal(waiting.waitlist, true);
assert.equal(seatsLeft(sessions[0], waiting.bookings), 0);
assert.equal(waiting.bookings.filter((row) => row.sessionId === "2026-12-18").length, rows.length);
assert.equal(releaseTests(waiting.bookings, "").some((row) => row.sessionId === "waitlist"), false);

const catalog = [{ id: "2026-12-18", label: "الجمعة 18 والسبت 19 ديسمبر 2026", capacity: 2, seeded: 1, active: true }, { id: "2026-12-19", capacity: 2, seeded: 0, active: false }];
assert.deepEqual(offeredSessions(catalog, []).map((session) => session.id), ["2026-12-18"]);
assert.equal(seatsLeft(offeredSessions(catalog, [])[0], []), 1);
const filled = [{ sessionId: "2026-12-18", email: "a@example.com", name: "A" }];
const rolled = offeredSessions(catalog, filled);
assert.deepEqual(rolled.map((session) => session.id), ["2026-12-18", "2026-12-25"]);
assert.equal(rolled[1].seeded, 0);
assert.equal(rolled[1].label, "25 و26 ديسمبر 2026");
assert.equal(seatsLeft(rolled[1], filled), 2);
assert.equal(book(rolled, filled, { sessionId: "2026-12-18", name: "بعد", email: "late@example.com" }).error, "full");
assert.equal(book(rolled, filled, { sessionId: "2026-12-25", name: "جديد", email: "new@example.com" }).ok, true);
const bothFull = filled.concat([
  { sessionId: "2026-12-25", email: "c@example.com", name: "C" },
  { sessionId: "2026-12-25", email: "d@example.com", name: "D" }
]);
assert.equal(offeredSessions(catalog, bothFull)[2].id, "2027-01-01");
assert.equal(offeredSessions(catalog, bothFull)[2].seeded, 0);
assert.equal(offeredSessions(catalog, bothFull)[2].label, "1 و2 يناير 2027");
assert.equal(book(rolled, filled, { sessionId: "2027-02-05", name: "بعيد", email: "far@example.com" }).error, "inactive");

console.log("seat math passed");
