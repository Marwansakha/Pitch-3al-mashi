import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

execFileSync(process.execPath, ["rates/build.mjs"], { cwd: root, stdio: "inherit" });

const standard = fs.readFileSync(path.join(root, "rates/index.html"), "utf8");
const kk = fs.readFileSync(path.join(root, "rates/kk/index.html"), "utf8");
const toml = fs.readFileSync(path.join(root, "netlify.toml"), "utf8");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const css = fs.readFileSync(path.join(root, "rates/card.css"), "utf8");

function visible(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/https?:\/\/[^"'\s]+/g, "")
    .replace(/\/rates\/kk/g, "");
}

assert.match(standard, /<meta name="robots" content="noindex">/);
assert.match(kk, /<meta name="robots" content="noindex">/);
assert.match(toml, /for = "\/rates"[\s\S]*X-Robots-Tag = "noindex"/);
assert.match(toml, /for = "\/rates\/\*"[\s\S]*X-Robots-Tag = "noindex"/);
assert.equal(sitemap.includes("/rates"), false);

assert.match(standard, /Prices are in AED/);
assert.match(standard, /5,000<span class="cur">AED<\/span>/);
assert.match(standard, /2,000<span class="cur">AED<\/span>/);
assert.match(standard, /6,000<span class="cur">AED<\/span>/);
assert.match(standard, /8,000<span class="cur">AED<\/span>/);
assert.match(standard, /Stories are included: I reshare the content on my stories\./);
assert.equal(standard.includes("Instagram insights"), false);
assert.equal(standard.includes("metrics-figure"), false);
assert.equal(standard.includes("1,500"), false);

assert.match(kk, /Prices are in JOD/);
assert.match(kk, /1,500<span class="cur">JOD<\/span>/);
assert.match(kk, /1,000<span class="cur">JOD<\/span>/);
assert.match(kk, />Each</);
assert.match(kk, /3,000<span class="cur">JOD<\/span>/);
assert.match(kk, /1 reel \+ 2 stories/);
assert.equal(kk.includes("Stories are included"), false);
assert.match(kk, /I reshare the content on my stories\./);
assert.match(kk, /30% of the reel’s contract value is charged\./);
assert.match(kk, /Instagram insights/);
assert.match(kk, /last 30 days \(26 Oct – 24 Nov 2026\)/);
assert.match(kk, /78,936/);
assert.match(kk, /\+12\.2%/);
assert.match(kk, /\+7,517/);
assert.match(kk, /1,820,375/);
assert.match(kk, /723,107/);
assert.match(kk, /1,547,301/);
assert.match(kk, /272,124/);
assert.match(kk, /1\.3M/);
assert.match(kk, /84K/);
assert.match(kk, /66K/);
assert.match(kk, /22K/);
assert.match(kk, />746</);
assert.match(kk, /69\.9%/);
assert.match(kk, /30\.1%/);
assert.match(kk, /28\.5%/);
assert.match(kk, /21\.7%/);
assert.match(kk, /78\.7%/);
assert.match(kk, /prefers-reduced-motion|insights\.js/);
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.match(kk, /class="proof"/);
assert.match(kk, /class="gallery"/);
assert.match(kk, /class="donut"/);
assert.match(kk, /class="growth-line"/);
assert.match(kk, /<link rel="canonical" href="https:\/\/marwandoesai.com\/rates\/kk">/);

const title = kk.match(/<title>([^<]*)<\/title>/)[1];
assert.equal(title, "Marwan Abu Sakha · Rate Card");
assert.equal(title.toLowerCase().includes("kk"), false);
const alts = [...kk.matchAll(/alt="([^"]*)"/g)].map((match) => match[1]);
assert.ok(alts.length >= 9);
for (const alt of alts) assert.equal(/\bkk\b/i.test(alt), false, alt);
assert.equal(/\bkk\b/i.test(visible(kk)), false, "slug leaked outside the URL");

for (let i = 1; i <= 9; i += 1) {
  const file = path.join(root, "rates/insights", `insight-${i}.webp`);
  const size = fs.statSync(file).size;
  assert.ok(size > 1000 && size < 180000, file + " " + size);
}
assert.ok(fs.statSync(path.join(root, "rates/marwan.jpg")).size > 1000);
assert.ok(fs.statSync(path.join(root, "rates/og.jpg")).size > 1000);

for (const file of ["index.html", "links/index.html", "grok-workshop/index.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  assert.equal(html.includes("/rates/kk"), false, file + " links the private page");
  assert.equal(html.includes('href="/rates"'), false, file + " links the rate card");
}
assert.equal(standard.includes("/rates/kk"), false);

console.log("rates tests passed");
