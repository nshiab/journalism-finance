import { assertEquals } from "jsr:@std/assert";
import getMinimumDownPayment from "../../src/finance/getMinimumDownPayment.ts";

Deno.test("should return 5% for purchase price of $400,000", () => {
  const result = getMinimumDownPayment(400_000);
  assertEquals(result, 20_000);
});

Deno.test("should return 5% for purchase price of $500,000", () => {
  const result = getMinimumDownPayment(500_000);
  assertEquals(result, 25_000);
});

Deno.test("should return 5% of 500k + 10% of 100k for purchase price of $600,000", () => {
  const result = getMinimumDownPayment(600_000);
  assertEquals(result, 35_000);
});

Deno.test("should return 5% of 500k + 10% of 999,999 for purchase price of $1,499,999", () => {
  const result = getMinimumDownPayment(1_499_999);
  assertEquals(result, 25_000 + 999_999 * 0.1);
});

Deno.test("should return 20% for purchase price of $1,500,000", () => {
  const result = getMinimumDownPayment(1_500_000);
  assertEquals(result, 300_000);
});

Deno.test("should return 20% for purchase price of $1,600,000", () => {
  const result = getMinimumDownPayment(1_600_000);
  assertEquals(result, 320_000);
});

Deno.test("should preserve decimal precision by default", () => {
  const result = getMinimumDownPayment(123.456);
  assertEquals(result, 123.456 * 0.05);
});

Deno.test("should round to the requested number of decimal places", () => {
  const result = getMinimumDownPayment(123.456, { decimals: 2 });
  assertEquals(result, 6.17);
});

Deno.test("should support rounding to a whole number", () => {
  const result = getMinimumDownPayment(499_999, { decimals: 0 });
  assertEquals(result, 25_000);
});
