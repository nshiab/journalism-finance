import { test, expect } from "vite-plus/test";

import variableMortgagePayments from "../../src/finance/variableMortgagePayments.ts";

test("variableMortgagePayments should calculate variable-rate mortgage with one rate change", () => {
  // 5 year term = 60 payments: 12 at 6%, then 48 at 5.5%
  const rates = [...Array<number>(12).fill(6), ...Array<number>(48).fill(5.5)];
  const payments = variableMortgagePayments(250_000, rates, 5, 25);

  // Check first payment (at 6% rate)
  expect(payments[0].paymentId).toEqual(0);
  expect(payments[0].rate).toEqual(6);
  expect(typeof payments[0].payment).toEqual("number");
  expect(typeof payments[0].interest).toEqual("number");
  expect(typeof payments[0].capital).toEqual("number");
  expect(payments[0].balance < 250_000).toEqual(true);

  // Check payment at rate change (should still be at 6%)
  expect(payments[11].paymentId).toEqual(11);
  expect(payments[11].rate).toEqual(6);

  // Check payment after rate change (should be at 5.5%)
  expect(payments[12].paymentId).toEqual(12);
  expect(payments[12].rate).toEqual(5.5);

  // Check last payment
  const lastPayment = payments[payments.length - 1];
  expect(lastPayment.paymentId).toEqual(59);
  expect(lastPayment.rate).toEqual(5.5);
  expect(lastPayment.balance < payments[0].balance).toEqual(true);
});

test("variableMortgagePayments should handle multiple rate changes", () => {
  // 5 year term = 60 payments: 12 at 6%, 12 at 5.5%, 12 at 5%, then 24 at 5.25%
  const rates = [
    ...Array<number>(12).fill(6),
    ...Array<number>(12).fill(5.5),
    ...Array<number>(12).fill(5),
    ...Array<number>(24).fill(5.25),
  ];
  const payments = variableMortgagePayments(200_000, rates, 5, 25);

  // Check rates at different points
  expect(payments[0].rate).toEqual(6); // Initial rate
  expect(payments[11].rate).toEqual(6); // Before first change
  expect(payments[12].rate).toEqual(5.5); // After first change
  expect(payments[23].rate).toEqual(5.5); // Before second change
  expect(payments[24].rate).toEqual(5); // After second change
  expect(payments[35].rate).toEqual(5); // Before third change
  expect(payments[36].rate).toEqual(5.25); // After third change
  expect(payments[payments.length - 1].rate).toEqual(5.25); // Last payment
});

test("variableMortgagePayments should work with no rate changes", () => {
  // 5 year term = 60 payments all at 6%
  const rates = Array<number>(60).fill(6);
  const variablePayments = variableMortgagePayments(200_000, rates, 5, 25);

  // Should maintain initial rate throughout
  expect(variablePayments[0].rate).toEqual(6);
  expect(variablePayments[30].rate).toEqual(6);
  expect(variablePayments[variablePayments.length - 1].rate).toEqual(6);
});

test("variableMortgagePayments should work with different mortgage amounts", () => {
  // 5 year term = 60 payments: 12 at 5.5%, then 48 at 5%
  const rates = [...Array<number>(12).fill(5.5), ...Array<number>(48).fill(5)];
  const payments = variableMortgagePayments(300_000, rates, 5, 25);

  expect(payments[0].rate).toEqual(5.5);
  expect(payments[11].rate).toEqual(5.5);
  expect(payments[12].rate).toEqual(5);
  expect(typeof payments[0].payment).toEqual("number");
  expect(payments[0].balance < 300_000).toEqual(true);
});

test("variableMortgagePayments should work with rate increase (VRM)", () => {
  // 5 year term = 60 payments: 12 at 6%, then 48 at 6.5%
  const rates = [...Array<number>(12).fill(6), ...Array<number>(48).fill(6.5)];
  const payments = variableMortgagePayments(250_000, rates, 5, 25);

  expect(payments[0].rate).toEqual(6);
  expect(payments[12].rate).toEqual(6.5);
  expect(typeof payments[0].payment).toEqual("number");
  // VRM: Payment stays FIXED, but when rate increases, more goes to interest, less to capital
  expect(payments[12].payment).toEqual(payments[11].payment);
  expect(payments[12].interest > payments[11].interest).toEqual(true);
  expect(payments[12].capital < payments[11].capital).toEqual(true);
});

test("variableMortgagePayments should work with rate decrease (VRM)", () => {
  // 5 year term = 60 payments: 6 at 5%, then 54 at 4.5%
  const rates = [...Array<number>(6).fill(5), ...Array<number>(54).fill(4.5)];
  const payments = variableMortgagePayments(200_000, rates, 5, 25);

  expect(payments[0].rate).toEqual(5);
  expect(payments[5].rate).toEqual(5);
  expect(payments[6].rate).toEqual(4.5);
  // VRM: Payment stays FIXED, but when rate decreases, less goes to interest, more to capital
  expect(payments[6].payment).toEqual(payments[5].payment);
  expect(payments[6].interest < payments[5].interest).toEqual(true);
  expect(payments[6].capital > payments[5].capital).toEqual(true);
});

test("variableMortgagePayments monthly payments should be consistent", () => {
  // 5 year term = 60 payments: 24 at 6%, then 36 at 5.8%
  const rates = [...Array<number>(24).fill(6), ...Array<number>(36).fill(5.8)];
  const payments = variableMortgagePayments(220_000, rates, 5, 25);

  expect(payments[0].rate).toEqual(6);
  expect(payments[24].rate).toEqual(5.8);
  expect(typeof payments[0].payment).toEqual("number");
});

test("variableMortgagePayments should throw error if amortizationPeriod < term", () => {
  expect(() => {
    variableMortgagePayments(
      200_000,
      Array<number>(120).fill(5), // 10 years worth of rates
      10,
      5, // Amortization less than term
    );
  }).toThrow(
    expect.objectContaining({
      name: Error.name,
      message: {
        asymmetricMatch: (value: unknown) =>
          typeof value === "string" &&
          value.includes("The amortizationPeriod should be equal or greater than the term."),
      },
    }),
  );
});

test("variableMortgagePayments should throw error if not enough rates provided", () => {
  expect(() => {
    // 5 year term needs 60 rates, but only provide 50
    variableMortgagePayments(200_000, Array<number>(50).fill(5), 5, 25);
  }).toThrow(
    expect.objectContaining({
      name: Error.name,
      message: {
        asymmetricMatch: (value: unknown) =>
          typeof value === "string" && value.includes("Not enough rates provided"),
      },
    }),
  );
});

test("variableMortgagePayments should handle varying rates throughout term", () => {
  // 5 year term = 60 payments with rates changing at different points
  const rates = [
    ...Array<number>(12).fill(6),
    ...Array<number>(12).fill(5.5),
    ...Array<number>(12).fill(5),
    ...Array<number>(24).fill(5.25),
  ];
  const payments = variableMortgagePayments(200_000, rates, 5, 25);

  // Should apply rates correctly
  expect(payments[11].rate).toEqual(6);
  expect(payments[12].rate).toEqual(5.5);
  expect(payments[24].rate).toEqual(5);
  expect(payments[36].rate).toEqual(5.25);
});

test("variableMortgagePayments should include id in output when provided", () => {
  // 5 year term = 60 payments: 12 at 6%, then 48 at 5.5%
  const rates = [...Array<number>(12).fill(6), ...Array<number>(48).fill(5.5)];
  const payments = variableMortgagePayments(200_000, rates, 5, 25, { id: "test-mortgage-123" });

  expect(payments[0].id).toEqual("test-mortgage-123");
  expect(payments[12].id).toEqual("test-mortgage-123");
  expect(payments[payments.length - 1].id).toEqual("test-mortgage-123");
});

test("variableMortgagePayments should track cumulative amounts correctly", () => {
  // 2 year term = 24 payments: 6 at 5%, then 18 at 5.5%
  const rates = [...Array<number>(6).fill(5), ...Array<number>(18).fill(5.5)];
  const payments = variableMortgagePayments(100_000, rates, 2, 25);

  // Cumulative values should increase
  expect(payments[0].amountPaid > 0).toEqual(true);
  expect(payments[0].interestPaid > 0).toEqual(true);
  expect(payments[0].capitalPaid > 0).toEqual(true);

  // Each payment should increase cumulative amounts
  for (let i = 1; i < payments.length; i++) {
    expect(payments[i].amountPaid > payments[i - 1].amountPaid).toEqual(true);
    expect(payments[i].interestPaid >= payments[i - 1].interestPaid).toEqual(true);
    expect(payments[i].capitalPaid > payments[i - 1].capitalPaid).toEqual(true);
  }
});

test("variableMortgagePayments balance behavior with VRM", () => {
  // 3 year term = 36 payments: 12 at 6%, then 24 at 5.5%
  // With rates staying reasonable, balance should decrease
  const rates = [...Array<number>(12).fill(6), ...Array<number>(24).fill(5.5)];
  const payments = variableMortgagePayments(150_000, rates, 3, 25);

  // With moderate rates, balance should generally decrease (or stay same at end)
  for (let i = 1; i < payments.length; i++) {
    expect(payments[i].balance <= payments[i - 1].balance).toEqual(true);
  }

  // VRM: After 3-year term of a 25-year amortization, should have substantial balance remaining
  const lastPayment = payments[payments.length - 1];
  expect(lastPayment.balance > 0).toEqual(true);
  expect(lastPayment.balance < 150_000).toEqual(true); // Balance decreased but not to 0
  // Should have paid down a reasonable amount but not fully paid off
  expect(lastPayment.balance > 100_000).toEqual(true); // Still a large balance after 3 years
});

test("variableMortgagePayments should respect decimals option", () => {
  // 5 year term = 60 payments all at 5%
  const rates = Array<number>(60).fill(5);
  const payments = variableMortgagePayments(100_000, rates, 5, 25, { decimals: 0 });

  // All values should be integers
  expect(payments[0].payment % 1).toEqual(0);
  expect(payments[0].interest % 1).toEqual(0);
  expect(payments[0].capital % 1).toEqual(0);
  expect(payments[0].balance % 1).toEqual(0);
});

test("variableMortgagePayments should handle negative amortization (trigger rate)", () => {
  // VRM key feature: if rates rise high enough, payment doesn't cover interest
  // This causes negative amortization - balance increases
  // 2 year term = 24 payments: 6 at 5%, then 18 at 15% (extremely high rate)
  const rates = [...Array<number>(6).fill(5), ...Array<number>(18).fill(15)];
  const payments = variableMortgagePayments(200_000, rates, 2, 25);

  // Initial payments should reduce balance normally
  expect(payments[5].balance < 200_000).toEqual(true);
  expect(payments[5].capital > 0).toEqual(true);

  // After rate spike, if interest exceeds fixed payment, capital becomes negative
  // This means balance increases (negative amortization)
  const highRatePayment = payments[6];
  if (highRatePayment.interest > highRatePayment.payment) {
    // Capital should be negative
    expect(highRatePayment.capital < 0).toEqual(true);
    // Balance should increase from previous payment
    expect(highRatePayment.balance > payments[5].balance).toEqual(true);
  }
});

test("variableMortgagePayments should handle zero rate edge case", () => {
  // Edge case: 0% interest rate
  // 2 year term = 24 payments all at 0%
  const rates = Array<number>(24).fill(0);
  const payments = variableMortgagePayments(120_000, rates, 2, 25);

  // With 0% rate, all interest should be 0
  expect(payments[0].rate).toEqual(0);
  expect(payments[0].interest).toEqual(0);
  expect(payments[12].interest).toEqual(0);
  expect(payments[payments.length - 1].interest).toEqual(0);

  // Payment should still be made (all goes to principal)
  expect(payments[0].payment > 0).toEqual(true);
  expect(payments[0].capital > 0).toEqual(true);
  expect(payments[0].payment).toEqual(payments[0].capital); // payment = capital when interest is 0

  // Balance should decrease steadily
  expect(payments[0].balance < 120_000).toEqual(true);
  expect(payments[payments.length - 1].balance < payments[0].balance).toEqual(true);

  // Total interest paid should be 0
  expect(payments[payments.length - 1].interestPaid).toEqual(0);
});

test("variableMortgagePayments should handle term === amortizationPeriod boundary", () => {
  // Boundary condition: term equals amortization period
  // This means the mortgage should be fully paid off at the end
  // 5 year term = 5 year amortization = 60 payments all at 5%
  const rates = Array<number>(60).fill(5);
  const payments = variableMortgagePayments(
    100_000,
    rates,
    5,
    5, // Same as term
  );

  // Should have exactly 60 payments
  expect(payments.length).toEqual(60);

  // Last payment should have balance of 0 or very close to 0
  const lastPayment = payments[payments.length - 1];
  expect(lastPayment.balance).toEqual(0);

  // Total capital paid should equal the original mortgage amount
  expect(lastPayment.capitalPaid).toEqual(100_000);

  // Balance should decrease monotonically
  for (let i = 1; i < payments.length; i++) {
    expect(payments[i].balance < payments[i - 1].balance).toEqual(true);
  }
});

test("variableMortgagePayments should show significant balance growth with sustained high rates", () => {
  // VRM extreme scenario: LOW initial rate (sets LOW fixed payment),
  // then rates spike HIGH and stay high for entire term
  // This demonstrates cumulative negative amortization over time
  // 5 year term = 60 payments: 1 at 3%, then 59 at 18% (extremely high, sustained)
  const originalLoan = 200_000;
  const rates = [3, ...Array<number>(59).fill(18)]; // Low start, then sustained high rate
  const payments = variableMortgagePayments(originalLoan, rates, 5, 25);

  const lastPayment = payments[payments.length - 1];

  // With sustained high rates causing negative amortization,
  // the final balance should be significantly higher than the original loan
  expect(lastPayment.balance > originalLoan).toEqual(true);

  // Should have substantial balance growth (typically would trigger a "trigger point" reset in practice)
  const balanceIncrease = lastPayment.balance - originalLoan;
  expect(balanceIncrease > 10_000).toEqual(true); // At least $10k increase

  // Most payments (after rate spike) should have negative capital (interest exceeds payment)
  const negativeCapitalPayments = payments.filter((p) => p.capital < 0);
  expect(negativeCapitalPayments.length > 50).toEqual(true); // Most of 60 payments

  // Balance should generally increase after the rate spike
  let balanceIncreases = 0;
  for (let i = 1; i < payments.length; i++) {
    if (payments[i].balance > payments[i - 1].balance) {
      balanceIncreases++;
    }
  }
  // Should have many periods of balance growth
  expect(balanceIncreases > 40).toEqual(true);
});

test("variableMortgagePayments should allow early payoff with high initial rate and low sustained rates", () => {
  // VRM opposite scenario: HIGH initial rate (sets HIGH fixed payment),
  // then rates drop VERY LOW and stay low
  // This causes rapid principal paydown and could lead to early payoff
  // 5 year term = 60 payments: 1 at 15%, then 59 at 1% (very low)
  const originalLoan = 100_000;
  const rates = [15, ...Array<number>(59).fill(1)]; // High start, then very low sustained rate
  const payments = variableMortgagePayments(originalLoan, rates, 5, 25);

  // After rate drop, most payment goes to principal (very little interest)
  expect(payments[10].interest < payments[0].interest).toEqual(true);
  expect(payments[10].capital > payments[0].capital).toEqual(true);

  // With high payment and low rates, mortgage could be paid off early
  const lastPayment = payments[payments.length - 1];

  // Check if paid off early (fewer than 60 payments)
  if (payments.length < 60) {
    // Early payoff occurred
    expect(lastPayment.balance).toEqual(0);
    expect(lastPayment.capitalPaid).toEqual(originalLoan);
  } else {
    // If not paid off early, should have significantly lower balance than normal
    // (balance reduction should be much greater than typical)
    expect(lastPayment.balance < originalLoan * 0.5).toEqual(true); // Less than 50% remaining
  }

  // All payments after rate drop should have positive capital
  const paymentsAfterDrop = payments.slice(1);
  const allPositiveCapital = paymentsAfterDrop.every((p) => p.capital > 0);
  expect(allPositiveCapital).toEqual(true);

  // Balance should decrease steadily after rate drop
  for (let i = 2; i < payments.length; i++) {
    expect(payments[i].balance < payments[i - 1].balance).toEqual(true);
  }
});
