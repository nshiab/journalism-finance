import { assertEquals } from "jsr:@std/assert";
import { getIncomeTax } from "../../src/finance/getIncomeTax.ts";

Deno.test("getIncomeTax - Ontario low income", () => {
  const result = getIncomeTax(30000, "Ontario");
  // Federal tax: 30000 * 0.14 = 4200
  // Provincial tax: 30000 * 0.0505 = 1515
  assertEquals(result.federalTax, 4200);
  assertEquals(result.provincialTax, 1515);
  assertEquals(result.federalRate, 0.14);
  assertEquals(result.provincialRate, 0.0505);
  assertEquals(result.totalTax, 5715);
});

Deno.test("getIncomeTax - Ontario high income", () => {
  const result = getIncomeTax(250000, "Ontario");
  // Federal 2026 calculation:
  // 0 to 58523: 58523 * 0.14 = 8193.22
  // 58523 to 117045: 58522 * 0.205 = 11997.01
  // 117045 to 181440: 64395 * 0.26 = 16742.70
  // 181440 to 250000: 68560 * 0.29 = 19882.40
  // Total Federal: 8193.22 + 11997.01 + 16742.70 + 19882.40 = 56815.33
  assertEquals(result.federalTax, 56815);
  assertEquals(result.federalRate, 0.29);
});

Deno.test("getIncomeTax - Quebec low income", () => {
  const result = getIncomeTax(30000, "Quebec");
  // Federal 14%, Quebec 14%
  assertEquals(result.federalTax, 4200);
  assertEquals(result.provincialTax, 4200);
  assertEquals(result.totalTax, 8400);
});

Deno.test("getIncomeTax - British Columbia medium income", () => {
  const result = getIncomeTax(60000, "British Columbia");
  // Federal: 58523 * 0.14 + (60000 - 58523) * 0.205 = 8193.22 + 302.785 = 8496.005
  // BC: 47937 * 0.0506 + (60000 - 47937) * 0.077 = 2425.6122 + 928.851 = 3354.4632
  assertEquals(result.federalTax, 8496);
  assertEquals(result.provincialTax, 3354);
  assertEquals(result.totalTax, 11850); // 8496 + 3354 = 11850
});

Deno.test("getIncomeTax - Alberta", () => {
  const result = getIncomeTax(50000, "Alberta");
  // Prov: 50000 * 0.10 = 5000
  assertEquals(result.provincialTax, 5000);
});

Deno.test("getIncomeTax - Manitoba", () => {
  const result = getIncomeTax(50000, "Manitoba");
  // Prov: 47000 * 0.108 + (50000-47000) * 0.1275 = 5076 + 382.5 = 5458.5
  assertEquals(result.provincialTax, 5459);
});

Deno.test("getIncomeTax - Saskatchewan", () => {
  const result = getIncomeTax(60000, "Saskatchewan");
  // Prov: 52057 * 0.105 + (60000-52057) * 0.125 = 5465.985 + 992.875 = 6458.86
  assertEquals(result.provincialTax, 6459);
});

Deno.test("getIncomeTax - Nova Scotia", () => {
  const result = getIncomeTax(40000, "Nova Scotia");
  // Prov: 29590 * 0.0879 + (40000-29590) * 0.1495 = 2600.961 + 1556.295 = 4157.256
  assertEquals(result.provincialTax, 4157);
});

Deno.test("getIncomeTax - New Brunswick", () => {
  const result = getIncomeTax(60000, "New Brunswick");
  // Prov: 49958 * 0.094 + (60000-49958) * 0.14 = 4696.052 + 1405.88 = 6101.932
  assertEquals(result.provincialTax, 6102);
});

Deno.test("getIncomeTax - Newfoundland and Labrador", () => {
  const result = getIncomeTax(50000, "Newfoundland and Labrador");
  // Prov: 43198 * 0.087 + (50000-43198) * 0.145 = 3758.226 + 986.29 = 4744.516
  assertEquals(result.provincialTax, 4745);
});

Deno.test("getIncomeTax - Prince Edward Island", () => {
  const result = getIncomeTax(40000, "Prince Edward Island");
  // Prov: 32775 * 0.0965 + (40000-32775) * 0.1363 = 3162.7875 + 984.7675 = 4147.555
  assertEquals(result.provincialTax, 4148);
});

Deno.test("getIncomeTax - Yukon", () => {
  const result = getIncomeTax(60000, "Yukon");
  // Prov: 55867 * 0.064 + (60000-55867) * 0.09 = 3575.488 + 371.97 = 3947.458
  assertEquals(result.provincialTax, 3947);
});

Deno.test("getIncomeTax - Northwest Territories", () => {
  const result = getIncomeTax(60000, "Northwest Territories");
  // Prov: 50597 * 0.059 + (60000-50597) * 0.086 = 2985.223 + 808.658 = 3793.881
  assertEquals(result.provincialTax, 3794);
});

Deno.test("getIncomeTax - Nunavut", () => {
  const result = getIncomeTax(60000, "Nunavut");
  // Prov: 53359 * 0.04 + (60000-53359) * 0.07 = 2134.36 + 464.87 = 2599.23
  assertEquals(result.provincialTax, 2599);
});
