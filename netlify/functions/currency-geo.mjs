import { currencyForCountry } from "../../grok-workshop/currency-geo.mjs";

function countryCode(request, context) {
  const geo = context && context.geo && context.geo.country;
  if (geo && geo.code) return String(geo.code).toUpperCase();
  const direct = request.headers.get("x-country");
  if (direct) return direct.trim().toUpperCase();
  const raw = request.headers.get("x-nf-geo");
  if (!raw) return "";
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (parsed.country && parsed.country.code) return String(parsed.country.code).toUpperCase();
  } catch (error) {
    return "";
  }
  return "";
}

export default async function handler(request, context) {
  let codes = ["AED", "USD"];
  try {
    const rates = await fetch(new URL("/grok-workshop/rates.json", request.url)).then((res) => res.json());
    if (rates && rates.currencies) codes = rates.currencies.map((item) => item.code);
  } catch (error) {
    codes = ["AED", "USD"];
  }
  const country = countryCode(request, context);
  return new Response(JSON.stringify({
    country: country,
    currency: currencyForCountry(country, codes)
  }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}
