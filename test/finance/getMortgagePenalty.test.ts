import { assertEquals, assertThrows } from "jsr:@std/assert";
import getMortgagePenalty from "../../src/finance/getMortgagePenalty.ts";

// Double checked with:
// https://wowa.ca/calculators/mortgage-penalty-calculator
// https://www.ratehub.ca/penalty-calculator

Deno.test("should return 0 penalty when term is complete (remainingMonthsToTerm = 0)", () => {
  const penalty = getMortgagePenalty({
    remainingMonthsToTerm: 0,
    mortgageBalance: 300_000,
    postedInterestRate: 0.055,
    rateAdjustmentFixed: -0.005,
    rateAdjustmentVariable: 0,
    currentPostedRates: { 1: 0.045, 2: 0.0475, 3: 0.05, 5: 0.0525 },
    mortgageType: "fixed",
  });
  assertEquals(penalty, 0);
});

Deno.test("should throw an error when no current posted rate is provided for the term", () => {
  assertThrows(
    () =>
      getMortgagePenalty({
        remainingMonthsToTerm: 3 * 12,
        mortgageBalance: 300_000,
        postedInterestRate: 0.055,
        rateAdjustmentFixed: -0.005,
        rateAdjustmentVariable: 0,
        currentPostedRates: { 1: 0.045, 2: 0.0475, 5: 0.0525 },
        mortgageType: "fixed",
      }),
    Error,
    "No current posted rate provided for a 3 year term.",
  );
});

Deno.test("should calculate three months interest penalty when it's greater than IRD", () => {
  // When rates have increased, three months penalty is typically higher
  const penalty = getMortgagePenalty({
    remainingMonthsToTerm: 2 * 12,
    mortgageBalance: 300_000,
    postedInterestRate: 0.04,
    rateAdjustmentFixed: -0.005,
    rateAdjustmentVariable: 0,
    currentPostedRates: { 1: 0.05, 2: 0.055, 3: 0.0575, 5: 0.06 },
    mortgageType: "fixed",
  });
  assertEquals(penalty, 2625);
});

Deno.test("should calculate IRD penalty when it's greater than three months interest", () => {
  // When rates have decreased significantly, IRD penalty is typically higher
  const penalty = getMortgagePenalty({
    remainingMonthsToTerm: 3 * 12,
    mortgageBalance: 400_000,
    postedInterestRate: 0.06,
    rateAdjustmentFixed: -0.01,
    rateAdjustmentVariable: 0,
    currentPostedRates: { 1: 0.04, 2: 0.0425, 3: 0.045, 5: 0.0475 },
    mortgageType: "fixed",
  });
  assertEquals(penalty, 18000);
});

Deno.test("should round remaining years to nearest term for rate lookup", () => {
  // Testing with 2.4 years remaining (should round to 2)
  const penalty = getMortgagePenalty({
    remainingMonthsToTerm: 2.4 * 12,
    mortgageBalance: 250_000,
    postedInterestRate: 0.055,
    rateAdjustmentFixed: -0.0075,
    rateAdjustmentVariable: 0,
    currentPostedRates: { 1: 0.045, 2: 0.0475, 3: 0.05, 5: 0.0525 },
    mortgageType: "fixed",
  });
  assertEquals(penalty, 4500);
});

Deno.test("should use 1 year rate when remaining years rounds to 0", () => {
  const penalty = getMortgagePenalty({
    remainingMonthsToTerm: 0.4 * 12,
    mortgageBalance: 200_000,
    postedInterestRate: 0.05,
    rateAdjustmentFixed: -0.005,
    rateAdjustmentVariable: 0,
    currentPostedRates: { 1: 0.04, 2: 0.045, 3: 0.0475, 5: 0.05 },
    mortgageType: "fixed",
  });
  assertEquals(penalty, 2250);
});

Deno.test("should handle case where IRD is negative (rates increased)", () => {
  const penalty = getMortgagePenalty({
    remainingMonthsToTerm: 4 * 12,
    mortgageBalance: 350_000,
    postedInterestRate: 0.035,
    rateAdjustmentFixed: -0.0025,
    rateAdjustmentVariable: 0,
    currentPostedRates: { 1: 0.055, 2: 0.0575, 3: 0.06, 4: 0.0625, 5: 0.065 },
    mortgageType: "fixed",
  });
  assertEquals(penalty, 2843.75);
});

Deno.test("should calculate penalty with no rate discount (equal penalties)", () => {
  const penalty = getMortgagePenalty({
    remainingMonthsToTerm: 5 * 12,
    mortgageBalance: 500_000,
    postedInterestRate: 0.05,
    rateAdjustmentFixed: -0,
    rateAdjustmentVariable: 0,
    currentPostedRates: { 1: 0.04, 2: 0.0425, 3: 0.045, 5: 0.0475 },
    mortgageType: "fixed",
  });
  assertEquals(penalty, 6250);
});

Deno.test("should calculate penalty with no rate discount (IRD higher)", () => {
  const penalty = getMortgagePenalty({
    remainingMonthsToTerm: 4 * 12,
    mortgageBalance: 600_000,
    postedInterestRate: 0.06,
    rateAdjustmentFixed: -0,
    rateAdjustmentVariable: 0,
    currentPostedRates: { 1: 0.035, 2: 0.0375, 3: 0.04, 4: 0.0425, 5: 0.045 },
    mortgageType: "fixed",
  });
  assertEquals(penalty, 42000);
});

Deno.test("should calculate penalty for small mortgage balance", () => {
  const penalty = getMortgagePenalty({
    remainingMonthsToTerm: 1 * 12,
    mortgageBalance: 50_000,
    postedInterestRate: 0.06,
    rateAdjustmentFixed: -0.01,
    rateAdjustmentVariable: 0,
    currentPostedRates: { 1: 0.05, 2: 0.0525, 3: 0.055, 5: 0.0575 },
    mortgageType: "fixed",
  });
  assertEquals(penalty, 625);
});
Deno.test("should calculate penalty for large mortgage balance", () => {
  const penalty = getMortgagePenalty({
    remainingMonthsToTerm: 3 * 12,
    mortgageBalance: 1_000_000,
    postedInterestRate: 0.055,
    rateAdjustmentFixed: -0.008,
    rateAdjustmentVariable: 0,
    currentPostedRates: { 1: 0.04, 2: 0.0425, 3: 0.045, 5: 0.0475 },
    mortgageType: "fixed",
  });
  assertEquals(penalty, 30000);
});

Deno.test("should calculate three months interest penalty for variable mortgage", () => {
  // For variable, penalty is always 3 months interest
  const penalty = getMortgagePenalty({
    remainingMonthsToTerm: 2 * 12,
    mortgageBalance: 300_000,
    postedInterestRate: 0.06,
    rateAdjustmentFixed: -0.01,
    rateAdjustmentVariable: 0,
    currentPostedRates: {}, // Not used for variable
    mortgageType: "variable",
  });
  // (300,000 * (0.06 - 0.01) * 3) / 12 = 300,000 * 0.05 * 0.25 = 3750
  assertEquals(penalty, 3750);
});

Deno.test("should include rateAdjustmentVariable in variable mortgage penalty", () => {
  const penalty = getMortgagePenalty({
    remainingMonthsToTerm: 1 * 12,
    mortgageBalance: 200_000,
    postedInterestRate: 0.05,
    rateAdjustmentFixed: -0.005,
    rateAdjustmentVariable: 0.0025,
    currentPostedRates: {},
    mortgageType: "variable",
  });
  // Effective rate = 0.05 - 0.005 + 0.0025 = 0.0475
  // (200,000 * 0.0475 * 3) / 12 = 2375
  assertEquals(penalty, 2375);
});
