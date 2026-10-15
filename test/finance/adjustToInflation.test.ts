import { test, expect } from "vite-plus/test";

import adjustToInflation from "../../src/finance/adjustToInflation.ts";

// Using this as a reference https://www.bankofcanada.ca/rates/related/inflation-calculator/

test("should return 100$ in April 1914 adjusted to April 2023 inflation", () => {
  const adjustedAmount = adjustToInflation(100, 6.0, 156.4);
  expect(adjustedAmount).toEqual(2606.6666666666665);
});
test("should return 100$ in April 1914 adjusted to April 2023 inflation. It should be rounded to the nearest integer.", () => {
  const adjustedAmount = adjustToInflation(100, 6.0, 156.4, {
    decimals: 0,
  });
  expect(adjustedAmount).toEqual(2607);
});
test("should return 100$ in April 1914 adjusted to April 2023 inflation. It should be rounded to third decimal.", () => {
  const adjustedAmount = adjustToInflation(100, 6.0, 156.4, {
    decimals: 3,
  });
  expect(adjustedAmount).toEqual(2606.667);
});

test("should return 100$ in April 2023 adjusted to April 1914 inflation", () => {
  const adjustedAmount = adjustToInflation(100, 156.4, 6.0);
  expect(adjustedAmount).toEqual(3.8363171355498764);
});
test("should return 100$ in April 2023 adjusted to April 1914 inflation. It should be rounded to the nearest integer.", () => {
  const adjustedAmount = adjustToInflation(100, 156.4, 6.0, {
    decimals: 0,
  });
  expect(adjustedAmount).toEqual(4);
});
test("should return 100$ in April 2023 adjusted to April 1914 inflation. It should be rounded to third decimal.", () => {
  const adjustedAmount = adjustToInflation(100, 156.4, 6.0, {
    decimals: 3,
  });
  expect(adjustedAmount).toEqual(3.836);
});

test("should reject non-positive CPI values", () => {
  expect(() => adjustToInflation(100, 0, 156.4)).toThrow(
    expect.objectContaining({
      name: RangeError.name,
      message: {
        asymmetricMatch: (value: unknown) =>
          typeof value === "string" &&
          value.includes("amountCPI and targetCPI must be positive numbers"),
      },
    }),
  );
  expect(() => adjustToInflation(100, 156.4, -1)).toThrow(
    expect.objectContaining({
      name: RangeError.name,
      message: {
        asymmetricMatch: (value: unknown) =>
          typeof value === "string" &&
          value.includes("amountCPI and targetCPI must be positive numbers"),
      },
    }),
  );
});
