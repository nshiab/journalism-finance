import { assertEquals, assertThrows } from "jsr:@std/assert";
import variableMortgagePayments from "../../src/finance/variableMortgagePayments.ts";

Deno.test("variableMortgagePayments should calculate variable-rate mortgage with one rate change", () => {
  // 5 year term = 60 payments: 12 at 6%, then 48 at 5.5%
  const rates = [...Array(12).fill(6), ...Array(48).fill(5.5)];
  const payments = variableMortgagePayments(
    250_000,
    rates,
    5,
    25,
  );

  // Check first payment (at 6% rate)
  assertEquals(payments[0].paymentId, 0);
  assertEquals(payments[0].rate, 6);
  assertEquals(typeof payments[0].payment, "number");
  assertEquals(typeof payments[0].interest, "number");
  assertEquals(typeof payments[0].capital, "number");
  assertEquals(payments[0].balance < 250_000, true);

  // Check payment at rate change (should still be at 6%)
  assertEquals(payments[11].paymentId, 11);
  assertEquals(payments[11].rate, 6);

  // Check payment after rate change (should be at 5.5%)
  assertEquals(payments[12].paymentId, 12);
  assertEquals(payments[12].rate, 5.5);

  // Check last payment
  const lastPayment = payments[payments.length - 1];
  assertEquals(lastPayment.paymentId, 59);
  assertEquals(lastPayment.rate, 5.5);
  assertEquals(lastPayment.balance < payments[0].balance, true);
});

Deno.test("variableMortgagePayments should handle multiple rate changes", () => {
  // 5 year term = 60 payments: 12 at 6%, 12 at 5.5%, 12 at 5%, then 24 at 5.25%
  const rates = [
    ...Array(12).fill(6),
    ...Array(12).fill(5.5),
    ...Array(12).fill(5),
    ...Array(24).fill(5.25),
  ];
  const payments = variableMortgagePayments(
    200_000,
    rates,
    5,
    25,
  );

  // Check rates at different points
  assertEquals(payments[0].rate, 6); // Initial rate
  assertEquals(payments[11].rate, 6); // Before first change
  assertEquals(payments[12].rate, 5.5); // After first change
  assertEquals(payments[23].rate, 5.5); // Before second change
  assertEquals(payments[24].rate, 5); // After second change
  assertEquals(payments[35].rate, 5); // Before third change
  assertEquals(payments[36].rate, 5.25); // After third change
  assertEquals(payments[payments.length - 1].rate, 5.25); // Last payment
});

Deno.test("variableMortgagePayments should work with no rate changes", () => {
  // 5 year term = 60 payments all at 6%
  const rates = Array(60).fill(6);
  const variablePayments = variableMortgagePayments(
    200_000,
    rates,
    5,
    25,
  );

  // Should maintain initial rate throughout
  assertEquals(variablePayments[0].rate, 6);
  assertEquals(variablePayments[30].rate, 6);
  assertEquals(variablePayments[variablePayments.length - 1].rate, 6);
});

Deno.test("variableMortgagePayments should work with different mortgage amounts", () => {
  // 5 year term = 60 payments: 12 at 5.5%, then 48 at 5%
  const rates = [...Array(12).fill(5.5), ...Array(48).fill(5)];
  const payments = variableMortgagePayments(
    300_000,
    rates,
    5,
    25,
  );

  assertEquals(payments[0].rate, 5.5);
  assertEquals(payments[11].rate, 5.5);
  assertEquals(payments[12].rate, 5);
  assertEquals(typeof payments[0].payment, "number");
  assertEquals(payments[0].balance < 300_000, true);
});

Deno.test("variableMortgagePayments should work with rate increase (VRM)", () => {
  // 5 year term = 60 payments: 12 at 6%, then 48 at 6.5%
  const rates = [...Array(12).fill(6), ...Array(48).fill(6.5)];
  const payments = variableMortgagePayments(
    250_000,
    rates,
    5,
    25,
  );

  assertEquals(payments[0].rate, 6);
  assertEquals(payments[12].rate, 6.5);
  assertEquals(typeof payments[0].payment, "number");
  // VRM: Payment stays FIXED, but when rate increases, more goes to interest, less to capital
  assertEquals(payments[12].payment, payments[11].payment);
  assertEquals(payments[12].interest > payments[11].interest, true);
  assertEquals(payments[12].capital < payments[11].capital, true);
});

Deno.test("variableMortgagePayments should work with rate decrease (VRM)", () => {
  // 5 year term = 60 payments: 6 at 5%, then 54 at 4.5%
  const rates = [...Array(6).fill(5), ...Array(54).fill(4.5)];
  const payments = variableMortgagePayments(
    200_000,
    rates,
    5,
    25,
  );

  assertEquals(payments[0].rate, 5);
  assertEquals(payments[5].rate, 5);
  assertEquals(payments[6].rate, 4.5);
  // VRM: Payment stays FIXED, but when rate decreases, less goes to interest, more to capital
  assertEquals(payments[6].payment, payments[5].payment);
  assertEquals(payments[6].interest < payments[5].interest, true);
  assertEquals(payments[6].capital > payments[5].capital, true);
});

Deno.test("variableMortgagePayments monthly payments should be consistent", () => {
  // 5 year term = 60 payments: 24 at 6%, then 36 at 5.8%
  const rates = [...Array(24).fill(6), ...Array(36).fill(5.8)];
  const payments = variableMortgagePayments(
    220_000,
    rates,
    5,
    25,
  );

  assertEquals(payments[0].rate, 6);
  assertEquals(payments[24].rate, 5.8);
  assertEquals(typeof payments[0].payment, "number");
});

Deno.test("variableMortgagePayments should throw error if amortizationPeriod < term", () => {
  assertThrows(
    () => {
      variableMortgagePayments(
        200_000,
        Array(120).fill(5), // 10 years worth of rates
        10,
        5, // Amortization less than term
      );
    },
    Error,
    "The amortizationPeriod should be equal or greater than the term.",
  );
});

Deno.test("variableMortgagePayments should throw error if not enough rates provided", () => {
  assertThrows(
    () => {
      // 5 year term needs 60 rates, but only provide 50
      variableMortgagePayments(
        200_000,
        Array(50).fill(5),
        5,
        25,
      );
    },
    Error,
    "Not enough rates provided",
  );
});

Deno.test("variableMortgagePayments should handle varying rates throughout term", () => {
  // 5 year term = 60 payments with rates changing at different points
  const rates = [
    ...Array(12).fill(6),
    ...Array(12).fill(5.5),
    ...Array(12).fill(5),
    ...Array(24).fill(5.25),
  ];
  const payments = variableMortgagePayments(
    200_000,
    rates,
    5,
    25,
  );

  // Should apply rates correctly
  assertEquals(payments[11].rate, 6);
  assertEquals(payments[12].rate, 5.5);
  assertEquals(payments[24].rate, 5);
  assertEquals(payments[36].rate, 5.25);
});

Deno.test("variableMortgagePayments should include id in output when provided", () => {
  // 5 year term = 60 payments: 12 at 6%, then 48 at 5.5%
  const rates = [...Array(12).fill(6), ...Array(48).fill(5.5)];
  const payments = variableMortgagePayments(
    200_000,
    rates,
    5,
    25,
    { id: "test-mortgage-123" },
  );

  assertEquals(payments[0].id, "test-mortgage-123");
  assertEquals(payments[12].id, "test-mortgage-123");
  assertEquals(payments[payments.length - 1].id, "test-mortgage-123");
});

Deno.test("variableMortgagePayments should track cumulative amounts correctly", () => {
  // 2 year term = 24 payments: 6 at 5%, then 18 at 5.5%
  const rates = [...Array(6).fill(5), ...Array(18).fill(5.5)];
  const payments = variableMortgagePayments(
    100_000,
    rates,
    2,
    25,
  );

  // Cumulative values should increase
  assertEquals(payments[0].amountPaid > 0, true);
  assertEquals(payments[0].interestPaid > 0, true);
  assertEquals(payments[0].capitalPaid > 0, true);

  // Each payment should increase cumulative amounts
  for (let i = 1; i < payments.length; i++) {
    assertEquals(
      payments[i].amountPaid > payments[i - 1].amountPaid,
      true,
    );
    assertEquals(
      payments[i].interestPaid >= payments[i - 1].interestPaid,
      true,
    );
    assertEquals(
      payments[i].capitalPaid > payments[i - 1].capitalPaid,
      true,
    );
  }
});

Deno.test("variableMortgagePayments balance behavior with VRM", () => {
  // 3 year term = 36 payments: 12 at 6%, then 24 at 5.5%
  // With rates staying reasonable, balance should decrease
  const rates = [...Array(12).fill(6), ...Array(24).fill(5.5)];
  const payments = variableMortgagePayments(
    150_000,
    rates,
    3,
    25,
  );

  // With moderate rates, balance should generally decrease (or stay same at end)
  for (let i = 1; i < payments.length; i++) {
    assertEquals(
      payments[i].balance <= payments[i - 1].balance,
      true,
    );
  }

  // VRM: After 3-year term of a 25-year amortization, should have substantial balance remaining
  const lastPayment = payments[payments.length - 1];
  assertEquals(lastPayment.balance > 0, true);
  assertEquals(lastPayment.balance < 150_000, true); // Balance decreased but not to 0
  // Should have paid down a reasonable amount but not fully paid off
  assertEquals(lastPayment.balance > 100_000, true); // Still a large balance after 3 years
});

Deno.test("variableMortgagePayments should respect decimals option", () => {
  // 5 year term = 60 payments all at 5%
  const rates = Array(60).fill(5);
  const payments = variableMortgagePayments(
    100_000,
    rates,
    5,
    25,
    { decimals: 0 },
  );

  // All values should be integers
  assertEquals(payments[0].payment % 1, 0);
  assertEquals(payments[0].interest % 1, 0);
  assertEquals(payments[0].capital % 1, 0);
  assertEquals(payments[0].balance % 1, 0);
});

Deno.test("variableMortgagePayments should handle negative amortization (trigger rate)", () => {
  // VRM key feature: if rates rise high enough, payment doesn't cover interest
  // This causes negative amortization - balance increases
  // 2 year term = 24 payments: 6 at 5%, then 18 at 15% (extremely high rate)
  const rates = [...Array(6).fill(5), ...Array(18).fill(15)];
  const payments = variableMortgagePayments(
    200_000,
    rates,
    2,
    25,
  );

  // Initial payments should reduce balance normally
  assertEquals(payments[5].balance < 200_000, true);
  assertEquals(payments[5].capital > 0, true);

  // After rate spike, if interest exceeds fixed payment, capital becomes negative
  // This means balance increases (negative amortization)
  const highRatePayment = payments[6];
  if (highRatePayment.interest > highRatePayment.payment) {
    // Capital should be negative
    assertEquals(highRatePayment.capital < 0, true);
    // Balance should increase from previous payment
    assertEquals(highRatePayment.balance > payments[5].balance, true);
  }
});

Deno.test("variableMortgagePayments should handle zero rate edge case", () => {
  // Edge case: 0% interest rate
  // 2 year term = 24 payments all at 0%
  const rates = Array(24).fill(0);
  const payments = variableMortgagePayments(
    120_000,
    rates,
    2,
    25,
  );

  // With 0% rate, all interest should be 0
  assertEquals(payments[0].rate, 0);
  assertEquals(payments[0].interest, 0);
  assertEquals(payments[12].interest, 0);
  assertEquals(payments[payments.length - 1].interest, 0);

  // Payment should still be made (all goes to principal)
  assertEquals(payments[0].payment > 0, true);
  assertEquals(payments[0].capital > 0, true);
  assertEquals(payments[0].payment, payments[0].capital); // payment = capital when interest is 0

  // Balance should decrease steadily
  assertEquals(payments[0].balance < 120_000, true);
  assertEquals(
    payments[payments.length - 1].balance < payments[0].balance,
    true,
  );

  // Total interest paid should be 0
  assertEquals(payments[payments.length - 1].interestPaid, 0);
});

Deno.test("variableMortgagePayments should handle term === amortizationPeriod boundary", () => {
  // Boundary condition: term equals amortization period
  // This means the mortgage should be fully paid off at the end
  // 5 year term = 5 year amortization = 60 payments all at 5%
  const rates = Array(60).fill(5);
  const payments = variableMortgagePayments(
    100_000,
    rates,
    5,
    5, // Same as term
  );

  // Should have exactly 60 payments
  assertEquals(payments.length, 60);

  // Last payment should have balance of 0 or very close to 0
  const lastPayment = payments[payments.length - 1];
  assertEquals(lastPayment.balance, 0);

  // Total capital paid should equal the original mortgage amount
  assertEquals(lastPayment.capitalPaid, 100_000);

  // Balance should decrease monotonically
  for (let i = 1; i < payments.length; i++) {
    assertEquals(payments[i].balance < payments[i - 1].balance, true);
  }
});

Deno.test("variableMortgagePayments should show significant balance growth with sustained high rates", () => {
  // VRM extreme scenario: LOW initial rate (sets LOW fixed payment),
  // then rates spike HIGH and stay high for entire term
  // This demonstrates cumulative negative amortization over time
  // 5 year term = 60 payments: 1 at 3%, then 59 at 18% (extremely high, sustained)
  const originalLoan = 200_000;
  const rates = [3, ...Array(59).fill(18)]; // Low start, then sustained high rate
  const payments = variableMortgagePayments(
    originalLoan,
    rates,
    5,
    25,
  );

  const lastPayment = payments[payments.length - 1];

  // With sustained high rates causing negative amortization,
  // the final balance should be significantly higher than the original loan
  assertEquals(lastPayment.balance > originalLoan, true);

  // Should have substantial balance growth (typically would trigger a "trigger point" reset in practice)
  const balanceIncrease = lastPayment.balance - originalLoan;
  assertEquals(balanceIncrease > 10_000, true); // At least $10k increase

  // Most payments (after rate spike) should have negative capital (interest exceeds payment)
  const negativeCapitalPayments = payments.filter((p) => p.capital < 0);
  assertEquals(negativeCapitalPayments.length > 50, true); // Most of 60 payments

  // Balance should generally increase after the rate spike
  let balanceIncreases = 0;
  for (let i = 1; i < payments.length; i++) {
    if (payments[i].balance > payments[i - 1].balance) {
      balanceIncreases++;
    }
  }
  // Should have many periods of balance growth
  assertEquals(balanceIncreases > 40, true);
});

Deno.test("variableMortgagePayments should allow early payoff with high initial rate and low sustained rates", () => {
  // VRM opposite scenario: HIGH initial rate (sets HIGH fixed payment),
  // then rates drop VERY LOW and stay low
  // This causes rapid principal paydown and could lead to early payoff
  // 5 year term = 60 payments: 1 at 15%, then 59 at 1% (very low)
  const originalLoan = 100_000;
  const rates = [15, ...Array(59).fill(1)]; // High start, then very low sustained rate
  const payments = variableMortgagePayments(
    originalLoan,
    rates,
    5,
    25,
  );

  // After rate drop, most payment goes to principal (very little interest)
  assertEquals(payments[10].interest < payments[0].interest, true);
  assertEquals(payments[10].capital > payments[0].capital, true);

  // With high payment and low rates, mortgage could be paid off early
  const lastPayment = payments[payments.length - 1];

  // Check if paid off early (fewer than 60 payments)
  if (payments.length < 60) {
    // Early payoff occurred
    assertEquals(lastPayment.balance, 0);
    assertEquals(lastPayment.capitalPaid, originalLoan);
  } else {
    // If not paid off early, should have significantly lower balance than normal
    // (balance reduction should be much greater than typical)
    assertEquals(lastPayment.balance < originalLoan * 0.5, true); // Less than 50% remaining
  }

  // All payments after rate drop should have positive capital
  const paymentsAfterDrop = payments.slice(1);
  const allPositiveCapital = paymentsAfterDrop.every((p) => p.capital > 0);
  assertEquals(allPositiveCapital, true);

  // Balance should decrease steadily after rate drop
  for (let i = 2; i < payments.length; i++) {
    assertEquals(payments[i].balance < payments[i - 1].balance, true);
  }
});
