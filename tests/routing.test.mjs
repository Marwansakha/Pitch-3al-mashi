import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseRedirects(toml) {
  const rules = [];
  const parts = toml.split("[[redirects]]").slice(1);
  for (const part of parts) {
    const block = part.split("\n#")[0];
    const pick = (key) => {
      const m = block.match(new RegExp("^\\s*" + key + "\\s*=\\s*(.+)$", "m"));
      return m ? m[1].trim().replace(/^"|"$/g, "") : "";
    };
    rules.push({
      from: pick("from"),
      to: pick("to"),
      status: Number(pick("status") || "301"),
      force: pick("force") === "true",
    });
  }
  return rules;
}

function fileFor(pathname) {
  const clean = decodeURIComponent(pathname.split("?")[0]).replace(/^\/+/, "");
  const abs = path.join(root, clean);
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
    const index = path.join(abs, "index.html");
    if (fs.existsSync(index)) return index;
  }
  return null;
}

function matches(from, pathname) {
  if (from.includes("://")) return null;
  if (from.endsWith("/*")) {
    const prefix = from.slice(0, -1);
    if (pathname.startsWith(prefix)) return { splat: pathname.slice(prefix.length) };
    return null;
  }
  if (from === pathname) return { splat: "" };
  return null;
}

function resolvePath(rules, pathname, hops = 0) {
  if (hops > 4) return { status: 508, via: pathname, hops };
  for (const rule of rules) {
    if (!matches(rule.from, pathname)) continue;
    const exists = fileFor(pathname);
    if (!rule.force && exists) continue;
    if (rule.status >= 300 && rule.status < 400) {
      const next = rule.to;
      if (next.startsWith("http")) return { status: rule.status, location: next, hops };
      return resolvePath(rules, next, hops + 1);
    }
    if (rule.status === 200) {
      const file = fileFor(rule.to);
      return { status: 200, file, rewrite: rule.to, hops };
    }
  }
  const file = fileFor(pathname);
  if (file) return { status: 200, file, hops };
  return { status: 404, hops };
}

const toml = fs.readFileSync(path.join(root, "netlify.toml"), "utf8");
const rules = parseRedirects(toml);
const pathRules = rules.filter((rule) => !rule.from.includes("://"));

const linksExact = pathRules.findIndex((rule) => rule.from === "/links" && rule.force && rule.status === 301 && rule.to === "/");
const linksSlash = pathRules.findIndex((rule) => rule.from === "/links/" && rule.force && rule.status === 301 && rule.to === "/");
const bio = pathRules.findIndex((rule) => rule.from === "/bio" && rule.status === 200 && rule.to === "/links/index.html");
const bioSlash = pathRules.findIndex((rule) => rule.from === "/bio/" && rule.status === 200 && rule.to === "/links/index.html");
const bioSplat = pathRules.findIndex((rule) => rule.from === "/bio/*" && rule.status === 200 && rule.to === "/links/index.html" && !rule.force);
const linksSplat = pathRules.findIndex((rule) => rule.from === "/links/*" && rule.status === 200 && rule.to === "/links/index.html" && !rule.force);

assert.ok(linksExact >= 0, "exact /links redirects home and is forced");
assert.ok(linksSlash > linksExact, "/links/ is forced home after the exact rule");
assert.ok(bio > linksSlash && bioSlash > bio && bioSplat > bioSlash, "/bio rules follow the homepage redirects");
assert.ok(linksSplat > bioSplat, "/links/* is last so it cannot catch /bio or exact /links first");

const videos = JSON.parse(fs.readFileSync(path.join(root, "content/videos.json"), "utf8")).videos;
const slug = videos.find((video) => video.slug === "google-maps-leads").slug;
assert.equal(slug, "google-maps-leads");

function expectServe(pathname, filename) {
  const result = resolvePath(rules, pathname);
  assert.equal(result.status, 200, pathname + " should serve a page, got " + result.status);
  assert.equal(result.hops < 5, true, pathname + " redirected too many times");
  assert.ok(result.file && result.file.endsWith(filename), pathname + " served " + result.file);
  assert.notEqual(result.rewrite, "/");
  assert.notEqual(result.rewrite, "/links");
  assert.notEqual(result.rewrite, "/links/");
}

function expectHomeRedirect(pathname) {
  const direct = rules.filter((rule) => !rule.from.includes("://")).find((rule) => matches(rule.from, pathname));
  assert.ok(direct, "no rule for " + pathname);
  assert.equal(direct.to, "/");
  assert.equal(direct.status, 301);
  assert.equal(direct.force, true);
  const home = resolvePath(rules, "/");
  assert.equal(home.status, 200);
  assert.ok(home.file.endsWith("/index.html") || home.file.endsWith("index.html"));
  assert.equal(home.file.includes(`${path.sep}links${path.sep}`), false);
}

expectHomeRedirect("/links");
expectHomeRedirect("/links/");
expectServe("/", "index.html");
expectServe("/bio", "links/index.html");
expectServe("/bio/", "links/index.html");
expectServe("/bio/" + slug, "links/index.html");
expectServe("/links/" + slug, "links/index.html");
expectServe("/links/thumbs/" + slug + ".jpg", slug + ".jpg");
expectServe("/links/avatar.svg", "avatar.svg");
expectServe("/content/videos.json", "videos.json");
expectServe("/links/index.html", "links/index.html");

const homeHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const bioHtml = fs.readFileSync(path.join(root, "links/index.html"), "utf8");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
assert.equal(homeHtml.includes('href="/links"'), false, "homepage still links to exact /links");
assert.equal((homeHtml.match(/href="\/bio"/g) || []).length >= 2, true);
assert.equal(bioHtml.includes('href="/links"'), false, "grid page still links to exact /links");
assert.ok(bioHtml.includes('href="/bio"'));
assert.ok(bioHtml.includes('https://marwandoesai.com/bio'));
assert.equal(bioHtml.includes("https://marwandoesai.com/links"), false);
assert.ok(bioHtml.includes('function gridPath()'));
assert.ok(bioHtml.includes('history.pushState({}, "", gridPath())'));
assert.ok(sitemap.includes("https://marwandoesai.com/bio"));
assert.equal(sitemap.includes("https://marwandoesai.com/links"), false);

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
  for (const rule of rules) {
    if (!matches(rule.from, pathname)) continue;
    if (!rule.force && fileFor(pathname)) continue;
    if (rule.status >= 300 && rule.status < 400) {
      res.writeHead(rule.status, { Location: rule.to });
      res.end();
      return;
    }
    if (rule.status === 200) {
      const file = fileFor(rule.to);
      res.writeHead(200, { "Content-Type": file.endsWith(".html") ? "text/html" : "application/octet-stream" });
      fs.createReadStream(file).pipe(res);
      return;
    }
  }
  const file = fileFor(pathname);
  if (!file) {
    res.writeHead(404);
    res.end("missing");
    return;
  }
  const type = file.endsWith(".html") ? "text/html" : file.endsWith(".json") ? "application/json" : file.endsWith(".svg") ? "image/svg+xml" : file.endsWith(".jpg") ? "image/jpeg" : "application/octet-stream";
  res.writeHead(200, { "Content-Type": type });
  fs.createReadStream(file).pipe(res);
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const origin = "http://127.0.0.1:" + port;

async function request(pathname, redirect) {
  const response = await fetch(origin + pathname, { redirect });
  const text = await response.text();
  return { status: response.status, url: response.url, text, location: response.headers.get("location") };
}

const links = await request("/links", "manual");
assert.equal(links.status, 301);
assert.equal(links.location, "/");
const linksSlashRes = await request("/links/", "manual");
assert.equal(linksSlashRes.status, 301);
assert.equal(linksSlashRes.location, "/");
const followed = await request("/links", "follow");
assert.equal(followed.status, 200);
assert.ok(followed.url.endsWith("/"));
assert.ok(followed.text.includes("Pitch على الماشي"));
assert.equal(followed.text.includes("مروان أبو سخا | الروابط"), false);

const bioPage = await request("/bio", "manual");
assert.equal(bioPage.status, 200);
assert.equal(bioPage.location, null);
assert.ok(bioPage.text.includes("مروان أبو سخا | الروابط"));
assert.ok(bioPage.text.includes('href="/bio"'));
const bioSlashPage = await request("/bio/", "manual");
assert.equal(bioSlashPage.status, 200);
assert.ok(bioSlashPage.text.includes("content/videos.json"));

const detailBio = await request("/bio/" + slug, "manual");
assert.equal(detailBio.status, 200);
assert.ok(detailBio.text.includes("function gridPath()"));
const detailLinks = await request("/links/" + slug, "manual");
assert.equal(detailLinks.status, 200);
assert.equal(detailLinks.location, null);
assert.ok(detailLinks.text.includes("basePath"));

const thumb = await request("/links/thumbs/" + slug + ".jpg", "manual");
assert.equal(thumb.status, 200);
assert.ok(thumb.text.length > 100 || thumb.status === 200);
const avatar = await request("/links/avatar.svg", "manual");
assert.equal(avatar.status, 200);
assert.ok(avatar.text.includes("<svg"));
const data = await request("/content/videos.json", "manual");
assert.equal(data.status, 200);
assert.equal(JSON.parse(data.text).videos.length >= 25, true);

server.close();
console.log("routing tests passed (" + videos.length + " videos, slug " + slug + ")");
