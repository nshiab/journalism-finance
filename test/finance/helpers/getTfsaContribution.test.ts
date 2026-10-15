import { test, expect } from "vite-plus/test";

import getTfsaContribution from "../../../src/finance/helpers/rentVsBuy/getTfsaContribution.ts";

// Reference: https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account/contributing/before.html

test("should return full contribution room when no contributions made (2010)", () => {
  const contributionRoom = getTfsaContribution(2010, 0);
  // Sum from 2009-2010: 5000*2 = 10000
  expect(contributionRoom).toEqual(10000);
});

test("should return full contribution room when no contributions made (2024)", () => {
  const contributionRoom = getTfsaContribution(2024, 0);
  // Sum from 2009-2024: 5000*4 + 5500*5 + 10000 + 6000*4 + 6500 + 7000 = 95000
  expect(contributionRoom).toEqual(95000);
});

test("should return full contribution room when no contributions made (2026)", () => {
  const contributionRoom = getTfsaContribution(2026, 0);
  // Sum from 2009-2026: 102000 + 7000 = 109000
  expect(contributionRoom).toEqual(109000);
});

test("should calculate remaining contribution room with partial contributions", () => {
  const contributionRoom = getTfsaContribution(2024, 50000);
  // Total room: 95000, contributed: 50000, remaining: 45000
  expect(contributionRoom).toEqual(45000);
});

test("should return 0 when contributions exceed limit", () => {
  const contributionRoom = getTfsaContribution(2024, 100000);
  // Total room: 95000, contributed: 100000, remaining: 0 (capped at 0)
  expect(contributionRoom).toEqual(0);
});

test("should handle exact contribution match", () => {
  const contributionRoom = getTfsaContribution(2024, 95000);
  // Total room: 95000, contributed: 95000, remaining: 0
  expect(contributionRoom).toEqual(0);
});

test("should throw error for future years", () => {
  expect(() => getTfsaContribution(2051, 0)).toThrow(
    expect.objectContaining({
      name: Error.name,
      message: {
        asymmetricMatch: (value: unknown) =>
          typeof value === "string" &&
          value.includes("Year exceeds the latest TFSA contribution limit data."),
      },
    }),
  );
});
