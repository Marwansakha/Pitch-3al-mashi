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

const perSession = [
  { id: "2026-12-18", label: "18 و19 ديسمبر 2026", capacity: 24, seeded: 4, active: true },
  { id: "2026-12-25", label: "25 و26 ديسمبر 2026", capacity: 20, seeded: 0, active: true }
];
const perBookings = [];
for (let i = 0; i < 16; i++) perBookings.push({ sessionId: "2026-12-18", email: "dec18-" + i + "@example.com", name: "A" + i });
for (let i = 0; i < 3; i++) perBookings.push({ sessionId: "2026-12-25", email: "dec25-" + i + "@example.com", name: "B" + i });
const openBoth = offeredSessions(perSession, perBookings, 20);
assert.deepEqual(openBoth.map((session) => session.id), ["2026-12-18", "2026-12-25"]);
assert.equal(seatsLeft(openBoth[0], perBookings), 4);
assert.equal(seatsLeft(openBoth[1], perBookings), 17);
assert.equal(openBoth[0].capacity, 24);
assert.equal(openBoth[1].capacity, 20);
assert.equal(book(openBoth, perBookings, { sessionId: "2026-12-18", name: "جديد", email: "new18@example.com" }).ok, true);
assert.equal(book(openBoth, perBookings, { sessionId: "2026-12-25", name: "جديد", email: "new25@example.com" }).ok, true);

const bothFilled = perBookings.slice();
for (let i = 0; i < 4; i++) bothFilled.push({ sessionId: "2026-12-18", email: "fill18-" + i + "@example.com", name: "F" + i });
for (let i = 0; i < 17; i++) bothFilled.push({ sessionId: "2026-12-25", email: "fill25-" + i + "@example.com", name: "G" + i });
const third = offeredSessions(perSession, bothFilled, 20);
assert.equal(third[2].id, "2027-01-01");
assert.equal(third[2].capacity, 20);
assert.equal(third[2].seeded, 0);
assert.equal(third[2].label, "1 و2 يناير 2027");

const only18 = [{ id: "2026-12-18", label: "18 و19 ديسمبر 2026", capacity: 24, seeded: 4, active: true }];
const laterBookings = [];
for (let i = 0; i < 3; i++) laterBookings.push({ sessionId: "2026-12-25", email: "later-" + i + "@example.com", name: "L" + i });
const shownLater = offeredSessions(only18, laterBookings, 20);
const dec25 = shownLater.find((session) => session.id === "2026-12-25");
assert.equal(dec25.capacity, 20);
assert.equal(seatsLeft(dec25, laterBookings), 17);

console.log("seat math passed");
