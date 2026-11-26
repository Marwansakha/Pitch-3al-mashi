import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

execFileSync(process.execPath, ["rates/build.mjs"], { cwd: root, stdio: "inherit" });

const standard = fs.readFileSync(path.join(root, "rates/index.html"), "utf8");
const mm = fs.readFileSync(path.join(root, "rates/mm/index.html"), "utf8");
assert.equal(fs.existsSync(path.join(root, "rates/kk/index.html")), false);
const toml = fs.readFileSync(path.join(root, "netlify.toml"), "utf8");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const css = fs.readFileSync(path.join(root, "rates/card.css"), "utf8");

function visible(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/https?:\/\/[^"'\s]+/g, "")
    .replace(/\/rates\/mm/g, "");
}

assert.match(standard, /<meta name="robots" content="noindex">/);
assert.match(mm, /<meta name="robots" content="noindex">/);
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
assert.match(standard, /Entrepreneurs/);
assert.match(standard, /Founder — Creator — Speaker/);
assert.match(mm, /real interviews about how they built what they have/);
assert.match(mm, /everyday money and life lessons in Jordanian Arabic/);
assert.match(mm, /88% are 25 or older/);
assert.match(mm, /Jordan is the biggest market, led by Amman/);
assert.equal(/entrepreneurs/i.test(mm), false);
assert.equal(mm.includes("Founder — Creator — Speaker"), false);
assert.equal(/founders audience/i.test(mm), false);
assert.equal(/business audience/i.test(mm), false);
assert.equal(mm.includes("technology operator"), false);

assert.match(mm, /Prices are in JOD/);
assert.match(mm, /1,500<span class="cur">JOD<\/span>/);
assert.match(mm, /1,000<span class="cur">JOD<\/span>/);
assert.match(mm, />Each</);
assert.match(mm, /3,000<span class="cur">JOD<\/span>/);
assert.match(mm, /1 reel \+ 2 stories/);
assert.equal(mm.includes("Stories are included"), false);
assert.match(mm, /I reshare the content on my stories\./);
assert.match(mm, /30% of the reel’s contract value is charged\./);
assert.match(mm, /Instagram insights/);
assert.match(mm, /last 30 days \(26 Oct – 24 Nov 2026\)/);
assert.match(mm, /Screenshots taken the morning of 26 Nov 2026/);
assert.match(mm, /class="live-note" hidden/);
assert.match(mm, /data-metric="views"/);
assert.match(mm, /data-metric="followers"/);
assert.match(mm, /data-metric-group="countries"/);
assert.match(mm, /data-live-key="nonFollowerViews followerViews"/);
assert.match(mm, /data-live-key="languages"/);
assert.match(mm, /From the 26 Nov 2026 screenshots/);
assert.equal(mm.includes("Live numbers updated"), false);
assert.match(mm, />78,936</);
assert.match(mm, /\+12\.2%/);
assert.match(mm, /\+7,517</);
assert.match(mm, />1,820,375</);
assert.match(mm, />723,107</);
assert.match(mm, />1,547,301</);
assert.match(mm, />272,124</);
assert.match(mm, /Views in the last 30 days/);
assert.match(mm, /Net new followers/);
assert.match(mm, /1\.3M/);
assert.match(mm, /84K/);
assert.match(mm, /66K/);
assert.match(mm, /22K/);
assert.match(mm, />746</);
assert.equal(/proof/i.test(mm), false);
assert.match(mm, /aria-label="See screenshot"/);
assert.match(mm, /69\.9%/);
assert.match(mm, /30\.1%/);
assert.match(mm, /28\.5%/);
assert.match(mm, /21\.7%/);
assert.match(mm, /78\.7%/);
assert.match(mm, /prefers-reduced-motion|insights\.js/);
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.match(mm, /class="see"/);
assert.match(css, /\.figure \{[\s\S]*font-family: var\(--sans\)/);
assert.match(mm, /class="gallery"/);
assert.match(mm, /class="donut"/);
assert.match(mm, /class="growth-line"/);
assert.match(mm, /<link rel="canonical" href="https:\/\/marwandoesai.com\/rates\/mm">/);

const title = mm.match(/<title>([^<]*)<\/title>/)[1];
assert.equal(title, "Marwan Abu Sakha · Rate Card");
assert.equal(title.toLowerCase().includes("mm"), false);
const alts = [...mm.matchAll(/alt="([^"]*)"/g)].map((match) => match[1]);
assert.ok(alts.length >= 9);
for (const alt of alts) assert.equal(/\bmm\b/i.test(alt), false, alt);
assert.equal(/\bmm\b/i.test(visible(mm)), false, "slug leaked outside the URL");
assert.equal(/knorr/i.test(mm), false);
assert.equal(toml.includes("/rates/kk"), false);
assert.equal(sitemap.includes("/rates/mm"), false);
assert.match(toml, /from = "https:\/\/rates\.marwandoesai\.com\/"[\s\S]*to = "\/rates\/index\.html"[\s\S]*status = 200[\s\S]*force = true[\s\S]*Host = \["rates\.marwandoesai\.com"\]/);
assert.match(toml, /from = "https:\/\/rates\.marwandoesai\.com\/:slug\/"[\s\S]*to = "\/rates\/:slug\/index\.html"[\s\S]*status = 200[\s\S]*Host = \["rates\.marwandoesai\.com"\]/);
assert.equal(toml.includes("https://rates.marwandoesai.com/*"), false);

for (let i = 1; i <= 9; i += 1) {
  const file = path.join(root, "rates/insights", `insight-${i}.webp`);
  const size = fs.statSync(file).size;
  assert.ok(size > 1000 && size < 180000, file + " " + size);
}
assert.ok(fs.statSync(path.join(root, "rates/marwan.jpg")).size > 1000);
assert.ok(fs.statSync(path.join(root, "rates/og.jpg")).size > 1000);

for (const file of ["index.html", "links/index.html", "grok-workshop/index.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  assert.equal(html.includes("/rates/mm"), false, file + " links the private page");
  assert.equal(html.includes('href="/rates"'), false, file + " links the rate card");
}
assert.equal(standard.includes("/rates/mm"), false);

console.log("rates tests passed");
