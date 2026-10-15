import { test, expect } from "vite-plus/test";

import getSalesTax from "../../src/finance/getSalesTax.ts";

test("getSalesTax Alberta - 5% GST only", () => {
  const amount = 100;
  const result = getSalesTax(amount, "Alberta", 2025);
  expect(result.gst).toEqual(5);
  expect(result.pst).toEqual(0);
  expect(result.hst).toEqual(0);
  expect(result.totalTax).toEqual(5);
  expect(result.totalAmount).toEqual(105);
});

test("getSalesTax British Columbia - 5% GST + 7% PST", () => {
  const result = getSalesTax(100, "British Columbia", 2025);
  expect(result.gst).toEqual(5);
  expect(result.pst).toEqual(7);
  expect(result.totalTax).toEqual(12);
});

test("getSalesTax Ontario - 13% HST", () => {
  const result = getSalesTax(100, "Ontario", 2025);
  expect(result.hst).toEqual(13);
  expect(result.gst).toEqual(0);
  expect(result.pst).toEqual(0);
  expect(result.totalTax).toEqual(13);
});

test("getSalesTax Quebec - 5% GST + 9.975% QST", () => {
  const result = getSalesTax(100, "Quebec", 2025);
  expect(result.gst).toEqual(5);
  expect(result.pst).toEqual(9.975);
  expect(result.totalTax).toEqual(14.975);
});

test("getSalesTax Nova Scotia - 14% HST", () => {
  const result = getSalesTax(100, "Nova Scotia", 2025);
  expect(result.hst).toEqual(14);
  expect(result.totalTax).toEqual(14);
});

test("getSalesTax Saskatchewan - 5% GST + 6% PST", () => {
  const result = getSalesTax(100, "Saskatchewan", 2025);
  expect(result.gst).toEqual(5);
  expect(result.pst).toEqual(6);
  expect(result.totalTax).toEqual(11);
});

test("getSalesTax Manitoba - 5% GST + 7% PST", () => {
  const result = getSalesTax(100, "Manitoba", 2025);
  expect(result.gst).toEqual(5);
  expect(result.pst).toEqual(7);
  expect(result.totalTax).toEqual(12);
});

test("getSalesTax New Brunswick - 15% HST", () => {
  const result = getSalesTax(100, "New Brunswick", 2025);
  expect(result.hst).toEqual(15);
  expect(result.totalTax).toEqual(15);
});

test("getSalesTax Newfoundland and Labrador - 15% HST", () => {
  const result = getSalesTax(100, "Newfoundland and Labrador", 2025);
  expect(result.hst).toEqual(15);
  expect(result.totalTax).toEqual(15);
});

test("getSalesTax Prince Edward Island - 15% HST", () => {
  const result = getSalesTax(100, "Prince Edward Island", 2025);
  expect(result.hst).toEqual(15);
  expect(result.totalTax).toEqual(15);
});

test("getSalesTax Northwest Territories - 5% GST only", () => {
  const result = getSalesTax(100, "Northwest Territories", 2025);
  expect(result.gst).toEqual(5);
  expect(result.totalTax).toEqual(5);
});

test("getSalesTax Nunavut - 5% GST only", () => {
  const result = getSalesTax(100, "Nunavut", 2025);
  expect(result.gst).toEqual(5);
  expect(result.totalTax).toEqual(5);
});

test("getSalesTax Yukon - 5% GST only", () => {
  const result = getSalesTax(100, "Yukon", 2025);
  expect(result.gst).toEqual(5);
  expect(result.totalTax).toEqual(5);
});
