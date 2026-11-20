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
assert.match(page, /شامل الضريبة/);
assert.equal(page.includes("وكيل انبنى"), false);
assert.equal(page.includes("أقل مصاريف بالأتمتة"), false);
assert.equal(page.includes('class="stats"'), false);
assert.match(page, /بنبني مساعدك الشخصي/);
assert.match(page, /بنخلّص شغل من السيارة/);
assert.match(page, /بنحوّل أي مهمة رقمية لروتين/);
assert.match(page, /بنبني بوت التقارير/);
assert.match(page, /البوت بيبنيلك أداة/);
assert.match(page, /بنوصّل الوكلاء كفريق/);
assert.equal(page.includes("ليست الأنسب"), false);
assert.equal(page.includes("مش إلك"), false);
assert.equal(page.includes("catbox"), false);
assert.match(page, /marwan\.webp/);
assert.match(page, /alt="مروان أبو سخا ببليزر كريمي/);
assert.equal(page.includes("لسا مش جاهزة"), false);

assert.equal(page.includes("<form"), false);
assert.match(page, /function revealAll/);
assert.match(page, /js-anim/);
assert.equal(page.includes('classList.add("motion")'), false);
assert.match(page, /href="\/grok-workshop\/register"/);
const register = fs.readFileSync(path.join(root, "grok-workshop/register/index.html"), "utf8");
assert.match(register, /<form[^>]*name="grok-workshop"/);
assert.match(register, /data-netlify="true"/);
assert.match(register, /netlify-honeypot="bot-field"/);
assert.match(register, /name="form-name" value="grok-workshop"/);
assert.match(register, /name="bot-field"/);
for (const field of ["name", "email", "role", "phone", "city"]) {
  assert.match(register, new RegExp(`name="${field}"[^>]*required|required[^>]*name="${field}"`));
}
assert.match(register, /id="phone"[^>]*dir="ltr"/);
assert.ok(sitemap.includes("https://marwandoesai.com/grok-workshop"));

const webp = fs.statSync(path.join(root, "grok-workshop/marwan.webp")).size;
const jpg = fs.statSync(path.join(root, "grok-workshop/marwan.jpg")).size;
assert.ok(webp < 80000, "webp " + webp);
assert.ok(jpg < 80000, "jpg " + jpg);

assert.match(thanks, /تم حجز مقعدك مبدئياً/);
assert.match(register, /تم حجز مقعدك مبدئياً/);
assert.match(page, /780/);
assert.match(page, /درهم/);
assert.equal(page.includes("980"), false);
assert.match(register, /name="session"/);
assert.match(register, /id="currency"/);
assert.match(register, /2026-12-18/);
assert.equal(register.includes("2026-12-19"), false);
assert.equal(register.includes("2027-01-30"), false);
assert.equal(register.includes("next-session"), false);
assert.match(register, /سجّل اسمك للجلسة الجاية/);
assert.match(register, /باقي أماكن قليلة/);
assert.match(register, /مقاعد باقية/);
assert.match(register, /seat-shake/);
assert.match(register, /سجّل اسمك على قائمة الانتظار للجلسات القادمة/);
assert.match(register, /value="waitlist"/);
assert.match(register, /قائمة الانتظار للجلسات القادمة/);
assert.match(register, /id="thanks-waitlist"/);
assert.match(register, /بنبعتلك إيميل أول ما ينفتح تاريخ الجلسة الجاية/);
assert.equal(register.includes("مقعد بس"), false);
assert.equal(register.includes('class="left">11<'), false);
assert.match(register, /rates\.json/);
assert.equal(home.includes("/grok-workshop"), false);
assert.match(toml, /from = "\/links"\s+to = "\/"\s+status = 301\s+force = true/);
assert.match(toml, /from = "\/bio"\s+to = "\/links\/index\.html"\s+status = 200/);
assert.equal(links.includes('href="/links"'), false);

console.log("grok-workshop page checks passed");
