import { assertEquals, assertThrows } from "jsr:@std/assert";
import getMortgagePenalty from "../../../src/finance/helpers/getMortgagePenalty.ts";

// Double checked with:
// https://wowa.ca/calculators/mortgage-penalty-calculator
// https://www.ratehub.ca/penalty-calculator

Deno.test("should return 0 penalty when term is complete (remainingYearsToTerm = 0)", () => {
  const penalty = getMortgagePenalty({
    remainingYearsToTerm: 0,
    mortgageBalance: 300_000,
    postedInterestRate: 0.055,
    rateDiscount: 0.005,
    currentPostedRates: { 1: 0.045, 2: 0.0475, 3: 0.05, 5: 0.0525 },
  });
  assertEquals(penalty, 0);
});

Deno.test("should throw an error when no current posted rate is provided for the term", () => {
  assertThrows(
    () =>
      getMortgagePenalty({
        remainingYearsToTerm: 3,
        mortgageBalance: 300_000,
        postedInterestRate: 0.055,
        rateDiscount: 0.005,
        currentPostedRates: { 1: 0.045, 2: 0.0475, 5: 0.0525 },
      }),
    Error,
    "No current posted rate provided for a 3 year term.",
  );
});

Deno.test("should calculate three months interest penalty when it's greater than IRD", () => {
  // When rates have increased, three months penalty is typically higher
  const penalty = getMortgagePenalty({
    remainingYearsToTerm: 2,
    mortgageBalance: 300_000,
    postedInterestRate: 0.04,
    rateDiscount: 0.005,
    currentPostedRates: { 1: 0.05, 2: 0.055, 3: 0.0575, 5: 0.06 },
  });
  // Three months penalty: (300000 * 0.035 * 3) / 12 = 2625
  // Effective rate: 0.04 - 0.005 = 0.035
  // Comparison rate - discount: 0.055 - 0.005 = 0.05
  // IRD rate: max(0, 0.035 - 0.05) = 0
  // Fixed mortgage penalty: 300000 * 0 * 2 = 0
  // Expected: max(2625, 0) = 2625
  assertEquals(penalty, 2625);
});

Deno.test("should calculate IRD penalty when it's greater than three months interest", () => {
  // When rates have decreased significantly, IRD penalty is typically higher
  const penalty = getMortgagePenalty({
    remainingYearsToTerm: 3,
    mortgageBalance: 400_000,
    postedInterestRate: 0.06,
    rateDiscount: 0.01,
    currentPostedRates: { 1: 0.04, 2: 0.0425, 3: 0.045, 5: 0.0475 },
  });
  // Three months penalty: (400000 * 0.05 * 3) / 12 = 5000
  // Effective rate: 0.06 - 0.01 = 0.05
  // Comparison rate - discount: 0.045 - 0.01 = 0.035
  // IRD rate: max(0, 0.05 - 0.035) = 0.015
  // Fixed mortgage penalty: 400000 * 0.015 * 3 = 18000
  // Expected: max(5000, 18000) = 18000
  assertEquals(penalty, 18000);
});

Deno.test("should round remaining years to nearest term for rate lookup", () => {
  // Testing with 2.4 years remaining (should round to 2)
  const penalty = getMortgagePenalty({
    remainingYearsToTerm: 2.4,
    mortgageBalance: 250_000,
    postedInterestRate: 0.055,
    rateDiscount: 0.0075,
    currentPostedRates: { 1: 0.045, 2: 0.0475, 3: 0.05, 5: 0.0525 },
  });
  // Three months penalty: (250000 * 0.0475 * 3) / 12 = 2969
  // Effective rate: 0.055 - 0.0075 = 0.0475
  // Comparison rate (for 2 years): 0.0475 - 0.0075 = 0.04
  // IRD rate: max(0, 0.0475 - 0.04) = 0.0075
  // Fixed mortgage penalty: 250000 * 0.0075 * 2.4 = 4500
  // Expected: max(2969, 4500) = 4500
  assertEquals(penalty, 4500);
});

Deno.test("should use 1 year rate when remaining years rounds to 0", () => {
  const penalty = getMortgagePenalty({
    remainingYearsToTerm: 0.4,
    mortgageBalance: 200_000,
    postedInterestRate: 0.05,
    rateDiscount: 0.005,
    currentPostedRates: { 1: 0.04, 2: 0.045, 3: 0.0475, 5: 0.05 },
  });
  // Three months penalty: (200000 * 0.045 * 3) / 12 = 2250
  // Effective rate: 0.05 - 0.005 = 0.045
  // Comparison rate (for 1 year): 0.04 - 0.005 = 0.035
  // IRD rate: max(0, 0.045 - 0.035) = 0.01
  // Fixed mortgage penalty: 200000 * 0.01 * 0.4 = 800
  // Expected: max(2250, 800) = 2250
  assertEquals(penalty, 2250);
});

Deno.test("should handle case where IRD is negative (rates increased)", () => {
  const penalty = getMortgagePenalty({
    remainingYearsToTerm: 4,
    mortgageBalance: 350_000,
    postedInterestRate: 0.035,
    rateDiscount: 0.0025,
    currentPostedRates: { 1: 0.055, 2: 0.0575, 3: 0.06, 4: 0.0625, 5: 0.065 },
  });
  // Three months penalty: (350000 * 0.0325 * 3) / 12 = 2844
  // Effective rate: 0.035 - 0.0025 = 0.0325
  // Comparison rate - discount: 0.0625 - 0.0025 = 0.06
  // IRD rate: max(0, 0.0325 - 0.06) = 0 (negative becomes 0)
  // Fixed mortgage penalty: 350000 * 0 * 4 = 0
  // Expected: max(2844, 0) = 2844
  assertEquals(penalty, 2844);
});

Deno.test("should calculate penalty with no rate discount (equal penalties)", () => {
  const penalty = getMortgagePenalty({
    remainingYearsToTerm: 5,
    mortgageBalance: 500_000,
    postedInterestRate: 0.05,
    rateDiscount: 0,
    currentPostedRates: { 1: 0.04, 2: 0.0425, 3: 0.045, 5: 0.0475 },
  });
  // Three months penalty: (500000 * 0.05 * 3) / 12 = 6250
  // Effective rate: 0.05 - 0 = 0.05
  // Comparison rate - discount: 0.0475 - 0 = 0.0475
  // IRD rate: max(0, 0.05 - 0.0475) = 0.0025
  // Fixed mortgage penalty: 500000 * 0.0025 * 5 = 6250
  // Expected: max(6250, 6250) = 6250
  assertEquals(penalty, 6250);
});

Deno.test("should calculate penalty with no rate discount (IRD higher)", () => {
  const penalty = getMortgagePenalty({
    remainingYearsToTerm: 4,
    mortgageBalance: 600_000,
    postedInterestRate: 0.06,
    rateDiscount: 0,
    currentPostedRates: { 1: 0.035, 2: 0.0375, 3: 0.04, 4: 0.0425, 5: 0.045 },
  });
  // Three months penalty: (600000 * 0.06 * 3) / 12 = 9000
  // Effective rate: 0.06 - 0 = 0.06
  // Comparison rate - discount: 0.0425 - 0 = 0.0425
  // IRD rate: max(0, 0.06 - 0.0425) = 0.0175
  // Fixed mortgage penalty: 600000 * 0.0175 * 4 = 42000
  // Expected: max(9000, 42000) = 42000
  assertEquals(penalty, 42000);
});

Deno.test("should calculate penalty for small mortgage balance", () => {
  const penalty = getMortgagePenalty({
    remainingYearsToTerm: 1,
    mortgageBalance: 50_000,
    postedInterestRate: 0.06,
    rateDiscount: 0.01,
    currentPostedRates: { 1: 0.05, 2: 0.0525, 3: 0.055, 5: 0.0575 },
  });
  // Three months penalty: (50000 * 0.05 * 3) / 12 = 625
  // Effective rate: 0.06 - 0.01 = 0.05
  // Comparison rate - discount: 0.05 - 0.01 = 0.04
  // IRD rate: max(0, 0.05 - 0.04) = 0.01
  // Fixed mortgage penalty: 50000 * 0.01 * 1 = 500
  // Expected: max(625, 500) = 625
  assertEquals(penalty, 625);
});

Deno.test("should calculate penalty for large mortgage balance", () => {
  const penalty = getMortgagePenalty({
    remainingYearsToTerm: 3,
    mortgageBalance: 1_000_000,
    postedInterestRate: 0.055,
    rateDiscount: 0.008,
    currentPostedRates: { 1: 0.04, 2: 0.0425, 3: 0.045, 5: 0.0475 },
  });
  // Three months penalty: (1000000 * 0.047 * 3) / 12 = 11750
  // Effective rate: 0.055 - 0.008 = 0.047
  // Comparison rate - discount: 0.045 - 0.008 = 0.037
  // IRD rate: max(0, 0.047 - 0.037) = 0.01
  // Fixed mortgage penalty: 1000000 * 0.01 * 3 = 30000
  // Expected: max(11750, 30000) = 30000
  assertEquals(penalty, 30000);
});
