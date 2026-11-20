export const COUNTRY_CURRENCY = {
  AE: "AED",
  SA: "SAR",
  JO: "JOD",
  KW: "KWD",
  QA: "QAR",
  BH: "BHD",
  OM: "OMR",
  EG: "EGP",
  IQ: "IQD"
};

export function currencyForCountry(country, codes) {
  const available = {};
  const list = codes || [];
  for (let i = 0; i < list.length; i++) available[list[i]] = true;
  const code = String(country || "").trim().toUpperCase();
  if (!code) return available.AED ? "AED" : "USD";
  const mapped = COUNTRY_CURRENCY[code];
  if (mapped && available[mapped]) return mapped;
  if (available.USD) return "USD";
  return "AED";
}
