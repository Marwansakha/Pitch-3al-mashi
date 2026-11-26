import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(root, "rates.json"), "utf8"));
const reserved = new Set(["insights", "fonts"]);

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function money(value) {
  return Number(value).toLocaleString("en-US");
}

function pageUrl(slug) {
  return slug ? `https://marwandoesai.com/rates/${slug}` : "https://marwandoesai.com/rates";
}

function icon(inner) {
  return `<svg class="ico" viewBox="0 0 40 40" width="36" height="36" aria-hidden="true">${inner}</svg>`;
}

const icons = {
  professionals: icon(`<circle cx="20" cy="20" r="18.25" fill="none" stroke="currentColor" stroke-width="1"/><rect x="13" y="18" width="14" height="9" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M17 18v-2a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.4"/>`),
  owners: icon(`<circle cx="20" cy="20" r="18.25" fill="none" stroke="currentColor" stroke-width="1"/><path d="M14 27V16.5h12V27M12.5 16.5 20 12l7.5 4.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M18.2 27v-4.2h3.6V27" fill="none" stroke="currentColor" stroke-width="1.4"/>`),
  entrepreneurs: icon(`<circle cx="20" cy="20" r="18.25" fill="none" stroke="currentColor" stroke-width="1"/><path d="M20 12.2a5.1 5.1 0 0 1 2.4 9.5V24h-4.8v-2.3A5.1 5.1 0 0 1 20 12.2z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M17.6 26.4h4.8M18.2 28.2h3.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`),
  investors: icon(`<circle cx="20" cy="20" r="18.25" fill="none" stroke="currentColor" stroke-width="1"/><path d="M12.5 26.5 18 20l4 3.2 6.2-8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M22.8 15.2h5.4v5.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`)
};

function count(value, options = {}) {
  const decimals = options.decimals || 0;
  const prefix = options.prefix || "";
  const suffix = options.suffix || "";
  const shown = options.text != null
    ? options.text
    : prefix + Number(value).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + suffix;
  const attrs = [
    `data-count="${value}"`,
    `data-decimals="${decimals}"`,
    prefix ? `data-prefix="${esc(prefix)}"` : "",
    suffix ? `data-suffix="${esc(suffix)}"` : ""
  ].filter(Boolean).join(" ");
  return `<span class="count" ${attrs}>${esc(shown)}</span>`;
}

function abbr(text) {
  const match = String(text).match(/^([\d.]+)(.*)$/);
  const decimals = match[1].includes(".") ? 1 : 0;
  return count(Number(match[1]), { decimals, suffix: match[2], text: String(text) });
}

function proof(shot, box) {
  return `<a class="proof" href="#proof-${shot}" data-shot="${shot}" data-x="${box[0]}" data-y="${box[1]}" data-w="${box[2]}" data-h="${box[3]}">Proof</a>`;
}

function statCard(kicker, figure, extra, proofHtml, wide) {
  return `<article class="stat${wide ? " wide" : ""}">
    <div class="stat-top"><p class="kicker">${esc(kicker)}</p>${proofHtml}</div>
    <p class="figure">${figure}</p>
    ${extra || ""}
  </article>`;
}

function barList(parts, scale) {
  const max = scale === "max" ? Math.max(...parts.map((part) => part.value)) : 100;
  const rows = parts.map((part) => {
    const width = (part.value / max) * 100;
    return `<div class="bar-row">
      <span class="bar-label">${esc(part.label)}</span>
      <span class="bar-track"><span class="bar-fill" style="--w:${width.toFixed(2)}%"></span></span>
      <span class="bar-val">${part.value}%</span>
    </div>`;
  }).join("");
  return `<div class="bars">${rows}</div>`;
}

function growthChart(points) {
  const top = 3;
  const height = 28;
  const coords = points.map((value, index) => {
    const x = (index / (points.length - 1)) * 100;
    const y = top + (1 - value) * height;
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
  const base = top + height;
  return `<div class="chart">
    <div class="chart-plot">
      <div class="chart-y"><span>78.9K</span><span>70.4K</span></div>
      <svg viewBox="0 0 100 34" role="img" aria-label="Follower growth from 70.4K on 26 October to 78.9K on 24 November 2026">
        <path class="growth-fill" d="${coords} L100 ${base} L0 ${base} Z"></path>
        <path class="growth-line" pathLength="1" d="${coords}"></path>
      </svg>
    </div>
    <div class="chart-x"><span>Oct 26</span><span>Nov 9</span><span>Nov 24</span></div>
  </div>`;
}

function insightsSection(data) {
  const non = data.nonFollowerViews;
  const fol = data.followerViews;
  const nonShare = (non / (non + fol)) * 100;
  const folShare = 100 - nonShare;
  const men = data.gender.find((part) => part.label === "Men").value;
  const shots = data.shots.map((shot) => `<figure id="proof-${shot.id}">
      <button type="button" class="shot-open" data-shot="${shot.id}">
        <img src="${esc(shot.src)}" width="${shot.width}" height="${shot.height}" alt="${esc(shot.alt)}" loading="lazy" decoding="async">
      </button>
      <figcaption>${esc(shot.caption)}</figcaption>
    </figure>`).join("");

  return `<section class="insights" aria-labelledby="insights-title">
    <h2 id="insights-title" class="insights-title"><span class="mark">Instagram insights </span><span class="range">· last 30 days (26 Oct – 24 Nov 2026)</span></h2>
    <p class="insights-lead">Tap Proof on a figure to open the dashboard screenshot it came from.</p>
    <div class="tablist" role="tablist" aria-label="Insight groups">
      <button type="button" role="tab" id="tab-reach" aria-controls="panel-reach" aria-selected="true">Reach</button>
      <button type="button" role="tab" id="tab-audience" aria-controls="panel-audience" aria-selected="false" tabindex="-1">Audience</button>
      <button type="button" role="tab" id="tab-where" aria-controls="panel-where" aria-selected="false" tabindex="-1">Where they are</button>
    </div>
    <div class="panel" role="tabpanel" id="panel-reach" aria-labelledby="tab-reach">
      <div class="stat-grid">
        ${statCard("Views", count(data.views), "", proof("8", [0.025, 0.181, 0.36, 0.115]), true)}
        ${statCard("Viewers", count(data.viewers), "", proof("8", [0.39, 0.181, 0.34, 0.115]), false)}
        ${statCard("Reels views", abbr(data.reelsViews), "", proof("6", [0.02, 0.2, 0.96, 0.17]), false)}
        ${statCard("Stories views", abbr(data.storiesViews), "", proof("6", [0.02, 0.2, 0.96, 0.17]), false)}
        ${statCard("Reels interactions", abbr(data.reelsInteractions), "", proof("5", [0.02, 0.391, 0.96, 0.17]), false)}
        <article class="stat wide">
          <div class="stat-top"><p class="kicker">Where the views came from</p>${proof("7", [0.02, 0.175, 0.96, 0.13])}</div>
          <div class="split-legend">
            <p><span class="swatch"></span>Non-followers<br><span class="figure">${count(data.nonFollowerViews)}</span></p>
            <p><span class="swatch ink"></span>Followers<br><span class="figure">${count(data.followerViews)}</span></p>
          </div>
          <div class="split-bar">
            <span class="split-non" style="--w:${nonShare.toFixed(2)}%"></span>
            <span class="split-fol" style="--w:${folShare.toFixed(2)}%"></span>
          </div>
        </article>
        ${statCard("Profile visits", abbr(data.profileVisits), "", proof("5", [0.02, 0.59, 0.96, 0.27]), false)}
        ${statCard("Bio link taps", count(data.bioLinkTaps), "", proof("5", [0.02, 0.59, 0.96, 0.27]), false)}
      </div>
    </div>
    <div class="panel" role="tabpanel" id="panel-audience" aria-labelledby="tab-audience" hidden>
      <div class="stat-grid">
        <article class="stat wide">
          <div class="stat-top"><p class="kicker">Followers</p>${proof("4", [0.02, 0.17, 0.96, 0.36])}</div>
          <p class="figure">${count(data.followers)}</p>
          <p class="note"><strong>${count(data.growthPct, { decimals: 1, prefix: "+", suffix: "%" })}</strong> vs Oct 25 · net <strong>${count(data.netFollowers, { prefix: "+" })}</strong></p>
          ${growthChart(data.growth)}
        </article>
        <article class="stat wide">
          <div class="stat-top"><p class="kicker">Gender</p>${proof("3", [0.02, 0.15, 0.96, 0.18])}</div>
          <div class="gender-layout">
            <svg class="donut" viewBox="0 0 120 120" aria-hidden="true">
              <circle class="donut-track" cx="60" cy="60" r="46"></circle>
              <circle class="donut-arc" cx="60" cy="60" r="46" pathLength="100" style="--men:${men}"></circle>
            </svg>
            <div class="gender-copy">
              ${barList(data.gender, "percent")}
            </div>
          </div>
        </article>
        <article class="stat wide">
          <div class="stat-top"><p class="kicker">Age</p>${proof("3", [0.02, 0.36, 0.96, 0.42])}</div>
          ${barList(data.age, "percent")}
        </article>
      </div>
    </div>
    <div class="panel" role="tabpanel" id="panel-where" aria-labelledby="tab-where" hidden>
      <div class="stat-grid">
        <article class="stat wide">
          <div class="stat-top"><p class="kicker">Top countries</p>${proof("2", [0.02, 0.2, 0.96, 0.3])}</div>
          ${barList(data.countries, "max")}
        </article>
        <article class="stat wide">
          <div class="stat-top"><p class="kicker">Top cities</p>${proof("1", [0.02, 0.24, 0.96, 0.3])}</div>
          ${barList(data.cities, "max")}
        </article>
        <article class="stat wide">
          <div class="stat-top"><p class="kicker">Languages</p>${proof("2", [0.02, 0.52, 0.96, 0.18])}</div>
          ${barList(data.languages, "percent")}
        </article>
      </div>
    </div>
    <div class="gallery-head">
      <div>
        <p class="kicker">Screenshots</p>
        <p class="insights-lead">Swipe through the dashboard for the same 30 days.</p>
      </div>
      <div class="gallery-nav">
        <button type="button" data-gallery="prev" aria-label="Previous screenshot">←</button>
        <button type="button" data-gallery="next" aria-label="Next screenshot">→</button>
      </div>
    </div>
    <div class="gallery">${shots}</div>
  </section>
  <div class="lightbox" hidden>
    <div class="lb-dialog" role="dialog" aria-modal="true" aria-labelledby="lb-title">
      <div class="lb-bar">
        <p id="lb-title">Instagram insights</p>
        <button type="button" class="lb-close" data-close>Close</button>
      </div>
      <div class="lb-scroll">
        <div class="lb-frame">
          <img alt="">
          <i class="hl" hidden></i>
        </div>
      </div>
    </div>
  </div>`;
}

function simpleMetrics(src) {
  if (!src) return "";
  return `<figure class="metrics-figure">
    <figcaption class="kicker">Account insights</figcaption>
    <img src="${esc(src)}" alt="Account insights">
  </figure>`;
}

function rateItem(item, currency, bundle) {
  const detail = item.detail ? `<p class="detail">— ${esc(item.detail)}</p>` : "";
  const where = item.channels ? `<span class="where">${esc(item.channels)}</span>` : "";
  return `<li class="item${bundle ? " bundle" : ""}">
    <div>
      <h3>${esc(item.title)}</h3>
      ${detail}
      <p class="desc">${esc(item.description)}</p>
    </div>
    <p class="price"><span class="price-main">${money(item.price)}<span class="cur">${esc(currency)}</span></span>${where}</p>
  </li>`;
}

function render(page) {
  const url = pageUrl(page.slug);
  const description = `Collaboration rates for Marwan Abu Sakha. Prices in ${page.currency}, excluding tax. Effective January 2026.`;
  const usageFirst = page.storiesIncluded
    ? "Organic rights on my own channels only. Stories are included: I reshare the content on my stories."
    : "Organic rights on my own channels only. I reshare the content on my stories.";
  const items = page.items.map((item) => rateItem(item, page.currency, false)).join("");
  const bundle = page.bundle ? rateItem(page.bundle, page.currency, true) : "";
  const metrics = page.insights ? insightsSection(page.insights) : simpleMetrics(page.metricsImage);
  const script = page.insights ? `<script src="/rates/insights.js" defer></script>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light">
<title>Marwan Abu Sakha · Rate Card</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${url}">
<meta property="og:title" content="Marwan Abu Sakha · Rate Card">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="https://marwandoesai.com/rates/og.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Marwan Abu Sakha rate card">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Marwan Abu Sakha · Rate Card">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="https://marwandoesai.com/rates/og.jpg">
<meta name="twitter:image:alt" content="Marwan Abu Sakha rate card">
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/rates/fonts/fraunces-italic-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/rates/fonts/fraunces-roman-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/rates/card.css">
</head>
<body>
<a class="skip" href="#rates">Skip to rates</a>
<article class="sheet">
  <header class="mast">
    <p class="mast-name">Marwan Abu Sakha</p>
    <p class="mast-meta">Rate card · Effective ${esc(config.effective)}</p>
  </header>
  <div class="layout">
    <div class="col-a">
    <figure class="portrait">
      <img src="/rates/marwan.jpg" width="576" height="634" alt="Marwan Abu Sakha in a light suit, smiling">
      <figcaption>Marwan Abu Sakha</figcaption>
    </figure>
    <section class="about" aria-labelledby="about-title">
      <p class="kicker">About</p>
      <h2 id="about-title">Builder<br><em><span class="amp">&amp;</span> operator.</em></h2>
      <p class="roles">Founder — Creator — Speaker</p>
      <p class="prose">A technology operator and creator focused on how modern businesses actually scale — product, team, systems, and distribution.</p>
      <p class="prose">In the regional ecosystem I’m known for breaking down the mechanics of scaling a business and for recommending the tools and platforms that genuinely move the needle for operators.</p>
    </section>
    <section class="audience" aria-labelledby="audience-title">
      <p class="kicker" id="audience-title">Audience</p>
      <ul class="who">
        <li>${icons.professionals}<span>Professionals</span></li>
        <li>${icons.owners}<span>Business owners</span></li>
        <li>${icons.entrepreneurs}<span>Entrepreneurs</span></li>
        <li>${icons.investors}<span>Investors</span></li>
      </ul>
      <div class="stats">
        <div>
          <p class="kicker">Age</p>
          <div class="stat-table">
            <div class="stat-row"><span>24 &amp; under</span><b>11%</b></div>
            <div class="stat-row"><span>25–34</span><b>38.6%</b></div>
            <div class="stat-row"><span>35–44</span><b>30.2%</b></div>
            <div class="stat-row"><span>45–65</span><b>20.2%</b></div>
          </div>
        </div>
        <div>
          <p class="kicker">Gender</p>
          <div class="stat-table">
            <div class="stat-row"><span>Men</span><b>66%</b></div>
            <div class="stat-row"><span>Women</span><b>34%</b></div>
          </div>
        </div>
      </div>
    </section>
    </div>
    <div class="col-b">
    <section class="rates" id="rates" aria-labelledby="rates-title">
      <p class="kicker quiet">Collaboration rates</p>
      <h1 class="rate-title" id="rates-title"><em>Rate</em><br>Card</h1>
      <p class="lede">Transparent, flat rates for brand collaborations. Prices are in ${esc(page.currency)} and exclude applicable taxes. Scope confirmed in writing before any work begins.</p>
      <ul class="items">
        ${items}
        ${bundle}
      </ul>
    </section>
    <section class="usage" aria-labelledby="usage-title">
      <p class="kicker" id="usage-title">Usage &amp; rights</p>
      <p class="prose">${esc(usageFirst)}</p>
      <p class="fine">Repurposing is included for the first month after posting. To keep using the video after that, 30% of the reel’s contract value is charged.</p>
    </section>
    </div>
  </div>
  ${metrics}
  <section class="fit" aria-labelledby="fit-title">
    <p class="kicker" id="fit-title">Not a fit</p>
    <p>I don’t work with <em>bidding platforms, unverified vendors, or anything otherwise sketchy</em>, and I don’t give <em>direct investment advice</em>. Consumer products such as <em>e-commerce</em> and <em>food</em> aren’t the best fit for my audience.</p>
  </section>
  <footer class="foot">
    <p class="signoff">Let’s build something worth watching.</p>
    <div class="contact email"><span class="k">Email</span><a href="mailto:marwandoesai@gmail.com">marwandoesai@gmail.com</a></div>
    <div class="contact"><span class="k">UAE</span><a href="tel:+97155916162">+971 55 916 162</a></div>
    <div class="contact"><span class="k">KSA</span><a href="tel:+966559812870">+966 55 981 2870</a></div>
    <div class="contact"><span class="k">Jordan</span><a href="tel:+962792082000">+962 79 208 2000</a></div>
  </footer>
</article>
${script}
</body>
</html>
`;
}

const slugs = new Set();
for (const page of config.pages) {
  if (page.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug)) {
    throw new Error("Slug must be lowercase letters, numbers, and hyphens: " + page.slug);
  }
  if (reserved.has(page.slug)) throw new Error("Reserved slug: " + page.slug);
  slugs.add(page.slug);
  const dir = page.slug ? path.join(root, page.slug) : root;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), render(page));
  console.log("wrote", page.slug ? `/rates/${page.slug}` : "/rates");
}

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory() || reserved.has(entry.name) || slugs.has(entry.name)) continue;
  const index = path.join(root, entry.name, "index.html");
  if (fs.existsSync(index)) fs.rmSync(path.join(root, entry.name), { recursive: true });
}
