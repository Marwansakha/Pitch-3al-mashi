import assert from "node:assert/strict";
import { currencyForCountry } from "../grok-workshop/currency-geo.mjs";

const codes = ["AED", "SAR", "JOD", "USD", "KWD", "QAR", "BHD", "OMR", "EGP"];

assert.equal(currencyForCountry("SA", codes), "SAR");
assert.equal(currencyForCountry("jo", codes), "JOD");
assert.equal(currencyForCountry("AE", codes), "AED");
assert.equal(currencyForCountry("US", codes), "USD");
assert.equal(currencyForCountry("DE", codes), "USD");
assert.equal(currencyForCountry("IQ", codes), "USD");
assert.equal(currencyForCountry("", codes), "AED");
assert.equal(currencyForCountry("FR", ["AED"]), "AED");

console.log("currency geo passed");
