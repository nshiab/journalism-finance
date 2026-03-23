import { assertEquals } from "jsr:@std/assert";
import getSalesTax from "../../src/finance/getSalesTax.ts";

Deno.test("getSalesTax Alberta - 5% GST only", () => {
  const amount = 100;
  const result = getSalesTax(amount, "Alberta", 2025);
  assertEquals(result.gst, 5);
  assertEquals(result.pst, 0);
  assertEquals(result.hst, 0);
  assertEquals(result.totalTax, 5);
  assertEquals(result.totalAmount, 105);
});

Deno.test("getSalesTax British Columbia - 5% GST + 7% PST", () => {
  const result = getSalesTax(100, "British Columbia", 2025);
  assertEquals(result.gst, 5);
  assertEquals(result.pst, 7);
  assertEquals(result.totalTax, 12);
});

Deno.test("getSalesTax Ontario - 13% HST", () => {
  const result = getSalesTax(100, "Ontario", 2025);
  assertEquals(result.hst, 13);
  assertEquals(result.gst, 0);
  assertEquals(result.pst, 0);
  assertEquals(result.totalTax, 13);
});

Deno.test("getSalesTax Quebec - 5% GST + 9.975% QST", () => {
  const result = getSalesTax(100, "Quebec", 2025);
  assertEquals(result.gst, 5);
  assertEquals(result.pst, 9.975);
  assertEquals(result.totalTax, 14.975);
});

Deno.test("getSalesTax Nova Scotia - 14% HST", () => {
  const result = getSalesTax(100, "Nova Scotia", 2025);
  assertEquals(result.hst, 14);
  assertEquals(result.totalTax, 14);
});

Deno.test("getSalesTax Saskatchewan - 5% GST + 6% PST", () => {
  const result = getSalesTax(100, "Saskatchewan", 2025);
  assertEquals(result.gst, 5);
  assertEquals(result.pst, 6);
  assertEquals(result.totalTax, 11);
});

Deno.test("getSalesTax Manitoba - 5% GST + 7% PST", () => {
  const result = getSalesTax(100, "Manitoba", 2025);
  assertEquals(result.gst, 5);
  assertEquals(result.pst, 7);
  assertEquals(result.totalTax, 12);
});

Deno.test("getSalesTax New Brunswick - 15% HST", () => {
  const result = getSalesTax(100, "New Brunswick", 2025);
  assertEquals(result.hst, 15);
  assertEquals(result.totalTax, 15);
});

Deno.test("getSalesTax Newfoundland and Labrador - 15% HST", () => {
  const result = getSalesTax(100, "Newfoundland and Labrador", 2025);
  assertEquals(result.hst, 15);
  assertEquals(result.totalTax, 15);
});

Deno.test("getSalesTax Prince Edward Island - 15% HST", () => {
  const result = getSalesTax(100, "Prince Edward Island", 2025);
  assertEquals(result.hst, 15);
  assertEquals(result.totalTax, 15);
});

Deno.test("getSalesTax Northwest Territories - 5% GST only", () => {
  const result = getSalesTax(100, "Northwest Territories", 2025);
  assertEquals(result.gst, 5);
  assertEquals(result.totalTax, 5);
});

Deno.test("getSalesTax Nunavut - 5% GST only", () => {
  const result = getSalesTax(100, "Nunavut", 2025);
  assertEquals(result.gst, 5);
  assertEquals(result.totalTax, 5);
});

Deno.test("getSalesTax Yukon - 5% GST only", () => {
  const result = getSalesTax(100, "Yukon", 2025);
  assertEquals(result.gst, 5);
  assertEquals(result.totalTax, 5);
});
