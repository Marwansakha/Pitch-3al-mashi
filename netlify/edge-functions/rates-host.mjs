export const RATES_HOST = "rates.marwandoesai.com";

export function hostIsRates(urlString, hostHeader) {
  let urlHost = "";
  try {
    urlHost = new URL(urlString).hostname.toLowerCase();
  } catch {
    urlHost = "";
  }
  if (urlHost === RATES_HOST) return true;
  const headerHost = String(hostHeader || "").split(":")[0].toLowerCase();
  const local = urlHost === "localhost" || urlHost === "127.0.0.1" || urlHost === "::1" || urlHost === "[::1]";
  return local && headerHost === RATES_HOST;
}

// Pretty URLs probe /slug, /slug/, /slug.html, /slug.htm, /slug/index.html,
// and /slug/index.htm. Treat that whole set as one brand slug. A missing
// /rates/<slug>/index.html is a 404. Root files with other extensions
// (favicon.ico, favicon.svg, apple-touch-icon.png) and every /rates/* asset
// stay on their own paths. /.netlify/* is never rewritten. Any other path
// is sent to a file that does not exist, so it 404s instead of falling
// through to /bio, /links, or the workshop.
const NOT_A_PAGE = "/rates/.not-a-page";

export function routeRatesPath(pathname) {
  const path = pathname || "/";
  if (path === "/.netlify" || path.startsWith("/.netlify/")) return null;
  if (path === "/rates" || path.startsWith("/rates/")) return null;
  if (path === "/" || path === "/index.html" || path === "/index.htm") return "/rates/index.html";

  const bare = path.match(/^\/([^/]+)\/?$/);
  if (bare) {
    const slug = bare[1];
    if (!slug.includes(".")) return `/rates/${slug}/index.html`;
    if (!/\.html?$/i.test(slug)) return null;
  }

  const html = path.match(/^\/([^/]+)\.html?$/) || path.match(/^\/([^/]+)\/index\.html?$/);
  if (html && !html[1].includes(".")) return `/rates/${html[1]}/index.html`;
  return NOT_A_PAGE;
}

export default async (request) => {
  if (!hostIsRates(request.url, request.headers.get("host"))) return;

  const target = routeRatesPath(new URL(request.url).pathname);
  if (!target) return;

  const url = new URL(request.url);
  url.pathname = target;
  return url;
};

export const config = {
  path: "/*",
  excludedPath: ["/rates", "/rates/*", "/.netlify", "/.netlify/*"],
  onError: "bypass"
};
