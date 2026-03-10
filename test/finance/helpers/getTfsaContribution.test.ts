import { assertEquals, assertThrows } from "jsr:@std/assert";
import getTfsaContribution from "../../../src/finance/helpers/rentVsBuy/getTfsaContribution.ts";

// Reference: https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account/contributing/before.html

Deno.test("should return full contribution room when no contributions made (2010)", () => {
  const contributionRoom = getTfsaContribution(2010, 0);
  // Sum from 2009-2010: 5000*2 = 10000
  assertEquals(contributionRoom, 10000);
});

Deno.test("should return full contribution room when no contributions made (2024)", () => {
  const contributionRoom = getTfsaContribution(2024, 0);
  // Sum from 2009-2024: 5000*4 + 5500*5 + 10000 + 6000*4 + 6500 + 7000 = 95000
  assertEquals(contributionRoom, 95000);
});

Deno.test("should return full contribution room when no contributions made (2026)", () => {
  const contributionRoom = getTfsaContribution(2026, 0);
  // Sum from 2009-2026: 102000 + 7000 = 109000
  assertEquals(contributionRoom, 109000);
});

Deno.test("should calculate remaining contribution room with partial contributions", () => {
  const contributionRoom = getTfsaContribution(2024, 50000);
  // Total room: 95000, contributed: 50000, remaining: 45000
  assertEquals(contributionRoom, 45000);
});

Deno.test("should return 0 when contributions exceed limit", () => {
  const contributionRoom = getTfsaContribution(2024, 100000);
  // Total room: 95000, contributed: 100000, remaining: 0 (capped at 0)
  assertEquals(contributionRoom, 0);
});

Deno.test("should handle exact contribution match", () => {
  const contributionRoom = getTfsaContribution(2024, 95000);
  // Total room: 95000, contributed: 95000, remaining: 0
  assertEquals(contributionRoom, 0);
});

Deno.test("should throw error for future years", () => {
  assertThrows(
    () => getTfsaContribution(2051, 0),
    Error,
    "Year exceeds the latest TFSA contribution limit data.",
  );
});
