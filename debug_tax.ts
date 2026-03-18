import { getIncomeTax } from "./src/finance/getIncomeTax.ts";
import { Province } from "./src/finance/getIncomeTax.ts";

const incomes = [30000, 60000, 90000, 150000, 250000];
const provinces: Province[] = [
  "Ontario",
  "Quebec",
  "British Columbia",
  "Alberta",
  "Manitoba",
  "Saskatchewan",
  "Nova Scotia",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Prince Edward Island",
  "Yukon",
  "Northwest Territories",
  "Nunavut",
];

const results: Record<string, any> = {};

for (const p of provinces) {
  results[p] = {};
  for (const i of incomes) {
    results[p][i] = getIncomeTax(i, p);
  }
}

console.log(JSON.stringify(results, null, 2));
