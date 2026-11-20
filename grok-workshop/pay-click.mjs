export const MAX_CLICKS = 5000;
export const MAX_BODY = 4096;

export function payClickKey(host) {
  const name = String(host || "").toLowerCase().split(":")[0];
  if (name === "marwandoesai.com" || name === "www.marwandoesai.com") return "payclicks:prod";
  return "payclicks:preview";
}

export function validEmail(email) {
  const value = String(email || "").trim();
  if (value.length < 3 || value.length > 200) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function buildClick(input, country, now) {
  const email = String(input && input.email || "").trim();
  const sessionId = String(input && input.sessionId || "").trim();
  const source = input && input.source;
  if (!validEmail(email)) return { error: "email" };
  if (sessionId.length > 80) return { error: "session" };
  if (source !== "button" && source !== "redirect") return { error: "source" };
  const row = {
    email: email,
    sessionId: sessionId,
    source: source,
    at: now || new Date().toISOString()
  };
  const code = String(country || "").trim();
  if (code) row.country = code.slice(0, 80);
  return { row: row };
}

export function appendClick(clicks, row) {
  const next = (clicks || []).concat([row]);
  if (next.length <= MAX_CLICKS) return next;
  return next.slice(next.length - MAX_CLICKS);
}
