import { test, expect } from "vite-plus/test";

import getMinimumDownPayment from "../../src/finance/getMinimumDownPayment.ts";

test("should return 5% for purchase price of $400,000", () => {
  const result = getMinimumDownPayment(400_000);
  expect(result).toEqual(20_000);
});

test("should return 5% for purchase price of $500,000", () => {
  const result = getMinimumDownPayment(500_000);
  expect(result).toEqual(25_000);
});

test("should return 5% of 500k + 10% of 100k for purchase price of $600,000", () => {
  const result = getMinimumDownPayment(600_000);
  expect(result).toEqual(35_000);
});

test("should return 5% of 500k + 10% of 999,999 for purchase price of $1,499,999", () => {
  const result = getMinimumDownPayment(1_499_999);
  expect(result).toEqual(25_000 + 999_999 * 0.1);
});

test("should return 20% for purchase price of $1,500,000", () => {
  const result = getMinimumDownPayment(1_500_000);
  expect(result).toEqual(300_000);
});

test("should return 20% for purchase price of $1,600,000", () => {
  const result = getMinimumDownPayment(1_600_000);
  expect(result).toEqual(320_000);
});

test("should preserve decimal precision by default", () => {
  const result = getMinimumDownPayment(123.456);
  expect(result).toEqual(123.456 * 0.05);
});

test("should round to the requested number of decimal places", () => {
  const result = getMinimumDownPayment(123.456, { decimals: 2 });
  expect(result).toEqual(6.17);
});

test("should support rounding to a whole number", () => {
  const result = getMinimumDownPayment(499_999, { decimals: 0 });
  expect(result).toEqual(25_000);
});

test("should reject a negative purchase price", () => {
  expect(() => getMinimumDownPayment(-1)).toThrow(
    expect.objectContaining({
      name: RangeError.name,
      message: {
        asymmetricMatch: (value: unknown) =>
          typeof value === "string" &&
          value.includes("purchasePrice must be a non-negative number"),
      },
    }),
  );
});
