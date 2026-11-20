import assert from "node:assert/strict";
import { MAX_CLICKS, appendClick, buildClick, payClickKey, validEmail } from "../grok-workshop/pay-click.mjs";

assert.equal(payClickKey("marwandoesai.com"), "payclicks:prod");
assert.equal(payClickKey("WWW.marwandoesai.com"), "payclicks:prod");
assert.equal(payClickKey("www.marwandoesai.com:443"), "payclicks:prod");
assert.equal(payClickKey("deploy-preview-14--loquacious-cobbler-451547.netlify.app"), "payclicks:preview");
assert.equal(payClickKey(""), "payclicks:preview");

assert.equal(validEmail("paytest@example.com"), true);
assert.equal(validEmail("not-an-email"), false);
assert.equal(validEmail("a@b"), false);

const click = buildClick({ email: "paytest@example.com", sessionId: "2026-12-18", source: "button" }, "US", "2026-11-20T16:00:00.000Z");
assert.equal(click.row.email, "paytest@example.com");
assert.equal(click.row.sessionId, "2026-12-18");
assert.equal(click.row.source, "button");
assert.equal(click.row.at, "2026-11-20T16:00:00.000Z");
assert.equal(click.row.country, "US");
assert.equal(buildClick({ email: "paytest@example.com", sessionId: "2026-12-18", source: "redirect" }, "").row.country, undefined);
assert.equal(buildClick({ email: "bad", sessionId: "2026-12-18", source: "button" }).error, "email");
assert.equal(buildClick({ email: "paytest@example.com", sessionId: "x".repeat(81), source: "button" }).error, "session");
assert.equal(buildClick({ email: "paytest@example.com", sessionId: "2026-12-18", source: "other" }).error, "source");

const full = [];
for (let i = 0; i < MAX_CLICKS; i++) full.push({ email: i + "@example.com" });
const capped = appendClick(full, { email: "new@example.com" });
assert.equal(capped.length, MAX_CLICKS);
assert.equal(capped[0].email, "1@example.com");
assert.equal(capped[capped.length - 1].email, "new@example.com");

console.log("pay click passed");
