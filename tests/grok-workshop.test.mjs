import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(root, "grok-workshop/index.html"), "utf8");
const thanks = fs.readFileSync(path.join(root, "grok-workshop/thanks/index.html"), "utf8");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
const links = fs.readFileSync(path.join(root, "links/index.html"), "utf8");
const toml = fs.readFileSync(path.join(root, "netlify.toml"), "utf8");

assert.match(page, /<html lang="ar" dir="rtl">/);
assert.match(page, /رجّع ساعتين من يومك/);
assert.match(page, /6:00/);
assert.match(page, /أونلاين/);
assert.match(page, /100/);
assert.match(page, /18%/);
assert.match(page, /شامل الضريبة/);
assert.equal(page.includes("ليست الأنسب"), false);
assert.equal(page.includes("مش إلك"), false);
assert.equal(page.includes("catbox"), false);
assert.match(page, /marwan\.webp/);
assert.match(page, /alt="مروان أبو سخا ببليزر كريمي/);
assert.equal(page.includes("لسا مش جاهزة"), false);

assert.match(page, /<form[^>]*name="grok-workshop"/);
assert.match(page, /data-netlify="true"/);
assert.match(page, /netlify-honeypot="bot-field"/);
assert.match(page, /name="form-name" value="grok-workshop"/);
assert.match(page, /name="bot-field"/);
for (const field of ["name", "email", "role", "phone", "city"]) {
  assert.match(page, new RegExp(`name="${field}"[^>]*required|required[^>]*name="${field}"`));
}
assert.match(page, /id="phone"[^>]*dir="ltr"/);
assert.match(page, /980/);
assert.ok(sitemap.includes("https://marwandoesai.com/grok-workshop"));

const webp = fs.statSync(path.join(root, "grok-workshop/marwan.webp")).size;
const jpg = fs.statSync(path.join(root, "grok-workshop/marwan.jpg")).size;
assert.ok(webp < 80000, "webp " + webp);
assert.ok(jpg < 80000, "jpg " + jpg);

assert.match(thanks, /تمام، وصلنا تسجيلك/);
assert.equal(home.includes("/grok-workshop"), false);
assert.match(toml, /from = "\/links"\s+to = "\/"\s+status = 301\s+force = true/);
assert.match(toml, /from = "\/bio"\s+to = "\/links\/index\.html"\s+status = 200/);
assert.equal(links.includes('href="/links"'), false);

console.log("grok-workshop page checks passed");
