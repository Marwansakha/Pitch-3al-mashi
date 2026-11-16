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
assert.match(page, /<title>ورشة تدريبية: ابنِ فريقك الذكي مع Grok Bot \| مروان أبو سخا<\/title>/);
assert.match(page, /<meta name="description" content="[^"]+">/);
assert.match(page, /property="og:title"/);
assert.match(page, /property="og:description"/);
assert.match(page, /property="og:image"/);
assert.match(page, /property="og:url" content="https:\/\/marwandoesai\.com\/grok-workshop"/);
assert.match(page, /rel="canonical" href="https:\/\/marwandoesai\.com\/grok-workshop"/);
assert.ok(sitemap.includes("https://marwandoesai.com/grok-workshop"));
assert.equal(sitemap.includes("https://marwandoesai.com/links"), false);

assert.match(page, /هذه الورشة لك إذا كنت مديرًا تنفيذيًا أو صاحب شركة، ولست تقنيًا\./);
assert.match(page, /إذا كنت تقنيًا \(مطوّرًا أو مهندسًا\)/);
assert.match(page, /الجمعة 18 والسبت 19 ديسمبر 2026/);
assert.match(page, /جلستان، ساعتان لكل يوم/);
assert.match(page, />980</);
assert.match(page, /SAR 980/);
assert.equal(page.includes("ig.me"), false);
assert.equal(page.includes("instagram.com"), false);
assert.equal(/\d{1,2}:\d{2}/.test(page), false);

assert.match(page, /<form[^>]*name="grok-workshop"/);
assert.match(page, /data-netlify="true"/);
assert.match(page, /netlify-honeypot="bot-field"/);
assert.match(page, /name="form-name" value="grok-workshop"/);
assert.match(page, /name="bot-field"/);
assert.match(page, /action="\/grok-workshop\/thanks"/);
for (const field of ["name", "email", "role", "phone", "city"]) {
  assert.match(page, new RegExp(`name="${field}"[^>]*required|required[^>]*name="${field}"`));
}
assert.match(page, /id="email"[^>]*type="email"/);
assert.match(page, /id="phone"[^>]*type="tel"[^>]*dir="ltr"|id="phone"[^>]*dir="ltr"[^>]*type="tel"/);
assert.match(page, /الاسم الكامل/);
assert.match(page, /البريد الإلكتروني/);
assert.match(page, /المسمى الوظيفي/);
assert.match(page, /رقم الهاتف/);
assert.match(page, /المدينة/);
assert.equal((page.match(/احجز مقعدك/g) || []).length >= 3, true);
assert.match(page, /href="#register"/);
assert.match(page, /شكرًا لتسجيلك/);
assert.match(page, /سنتواصل معك بتفاصيل الورشة/);

assert.match(thanks, /<html lang="ar" dir="rtl">/);
assert.match(thanks, /شكرًا لتسجيلك/);
assert.match(thanks, /سنتواصل معك بتفاصيل الورشة/);
assert.match(thanks, /noindex/);

assert.equal(home.includes("/grok-workshop"), false);
assert.equal(home.includes('href="/links"'), false);
assert.equal(links.includes("/grok-workshop"), false);
assert.equal(links.includes('href="/links"'), false);
assert.match(toml, /from = "\/links"\s+to = "\/"\s+status = 301\s+force = true/);
assert.match(toml, /from = "\/bio"\s+to = "\/links\/index\.html"\s+status = 200/);

console.log("grok-workshop page checks passed");
