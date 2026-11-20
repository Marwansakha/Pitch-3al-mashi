import assert from "node:assert/strict";
import { book, releaseTests, seatsLeft } from "../grok-workshop/seat-math.mjs";

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

console.log("seat math passed");
