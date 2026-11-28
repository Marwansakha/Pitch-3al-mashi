import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "links/index.html"), "utf8");
const data = JSON.parse(fs.readFileSync(path.join(root, "content/videos.json"), "utf8"));
const videos = data.videos;

const start = html.indexOf("function safeHttp");
const end = html.indexOf("function formatDate");
assert.ok(start > 0 && end > start, "workshop helpers are in the page script");

const context = { location: { origin: "https://marwandoesai.com" }, URL };
vm.createContext(context);
vm.runInContext(
  html.slice(start, end) +
    "\nthis.isGrokEntry = isGrokEntry; this.workshopHref = workshopHref;",
  context
);

const grokSlugs = ["grok-for-managers", "grok-bot-series-2", "grok-bot-series-3", "grok-bot-connect-tools"];
assert.equal(videos.some((video) => video.slug === "grok-bot-series-1"), false);

for (const slug of grokSlugs) {
  const video = videos.find((item) => item.slug === slug);
  assert.ok(video, slug);
  assert.equal(video.workshopUrl, "/grok-workshop");
  assert.equal(context.workshopHref(video), "/grok-workshop");
  assert.equal(context.isGrokEntry(video), true);
}

const leads = videos.find((video) => video.slug === "google-maps-leads");
assert.equal(Object.hasOwn(leads, "workshopUrl"), false);
assert.equal(context.workshopHref(leads), "");
assert.equal(context.isGrokEntry(leads), false);

const mirofish = videos.find((video) => video.slug === "mirofish-virtual-customers");
assert.ok(mirofish);
assert.equal(mirofish.videoUrl, "https://www.instagram.com/reel/DgLGASkRaQW/");
assert.equal(Object.hasOwn(mirofish, "workshopUrl"), false);
assert.equal(context.workshopHref(mirofish), "");
assert.equal(context.isGrokEntry(mirofish), false);

const taggedOnly = { slug: "future-reel", tags: ["Grok"] };
const botTagged = { slug: "future-bot", tags: ["AI", "Grok Bot"] };
const slugOnly = { slug: "using-grok-at-work", tags: ["AI tools"] };
const untouched = { slug: "openai-agents-court", tags: ["AI", "OpenAI"] };
assert.equal(context.workshopHref(taggedOnly), "/grok-workshop");
assert.equal(context.workshopHref(botTagged), "/grok-workshop");
assert.equal(context.workshopHref(slugOnly), "/grok-workshop");
assert.equal(context.workshopHref(untouched), "");
assert.equal(context.workshopHref({ slug: "custom", workshopUrl: "/grok-workshop/register" }), "/grok-workshop/register");
assert.equal(context.workshopHref({ slug: "bad", tags: ["Grok"], workshopUrl: "javascript:alert(1)" }), "/grok-workshop");

const withField = videos.filter((video) => Object.hasOwn(video, "workshopUrl")).map((video) => video.slug).sort();
assert.deepEqual(withField, grokSlugs.slice().sort());

assert.match(html, /ورشة /);
assert.match(html, /Grok workshop/);
assert.equal(html.includes("card-workshop"), false);
assert.equal(html.includes("has-workshop"), false);
assert.match(html, /workshopAnchor\(workshop, "btn workshop"\)/);
assert.match(html, /btn workshop/);
assert.match(html, /\.grid\{[^}]*direction:ltr/);
assert.match(html, /وفر ساعتين من يومك/);
assert.match(html, /سجّل بالورشة/);
assert.match(html, /href="\/grok-workshop\/"/);
assert.match(html, /grok-bot-mark\.svg/);
assert.equal(data.profile.photo, "/links/marwan.jpg");
assert.match(html, /#F5F3EE/);
assert.match(html, /#1A1A1A/);
assert.match(html, /#B8860B/);
assert.match(html, /DM Sans/);
assert.equal(html.includes("افتح الرابط"), true);
assert.equal(html.includes("شاهد على "), true);

const workshopPages = [
  "grok-workshop/index.html",
  "grok-workshop/register/index.html",
  "grok-workshop/thanks/index.html",
];
for (const file of workshopPages) {
  const page = fs.readFileSync(path.join(root, file), "utf8");
  assert.equal(page.includes("workshopUrl"), false, file);
  assert.equal(page.includes("card-workshop"), false, file);
}

console.log("bio workshop checks passed");
