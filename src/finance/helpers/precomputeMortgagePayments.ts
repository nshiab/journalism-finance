import mortgagePayments from "../mortgagePayments.ts";
import variableMortgagePayments from "../variableMortgagePayments.ts";

export default function precomputeMortgagePayments(
  numberOfYears: number,
  startingMortgageAmount: number,
  originalRateDiscount: number,
  fixedInterestRates: number[],
  variableInterestRates: number[],
) {
  const term = 5;
  const termInMonths = term * 12;

  // We precompute all mortgage payments for the entire period for fixed-rate mortgages
  const allFixedMortgagePayments: {
    paymentId: number;
    payment: number;
    interest: number;
    capital: number;
    balance: number;
    amountPaid: number;
    interestPaid: number;
    capitalPaid: number;
    effectiveInterestRate: number;
    postedInterestRate: number;
    rateDiscount: number;
  }[] = [];

  for (let month = 0; month < numberOfYears * 12; month += termInMonths) {
    const effectiveInterestRate =
      (fixedInterestRates[month] - originalRateDiscount) *
      100;
    const mortgageAmount =
      allFixedMortgagePayments[allFixedMortgagePayments.length - 1]
        ? allFixedMortgagePayments[allFixedMortgagePayments.length - 1].balance
        : startingMortgageAmount;
    const payments = mortgagePayments(
      mortgageAmount,
      effectiveInterestRate,
      "monthly",
      term,
      25 - (month / 12),
    );
    allFixedMortgagePayments.push(
      ...payments.map((payment) => ({
        ...payment,
        effectiveInterestRate: effectiveInterestRate / 100,
        postedInterestRate: fixedInterestRates[month],
        rateDiscount: originalRateDiscount,
      })),
    );
  }

  const allVariableMortgagePayments: {
    paymentId: number;
    payment: number;
    interest: number;
    capital: number;
    balance: number;
    amountPaid: number;
    interestPaid: number;
    capitalPaid: number;
    effectiveInterestRate: number;
    postedInterestRate: number;
    rateDiscount: number;
  }[] = [];

  for (let month = 0; month < numberOfYears * 12; month += termInMonths) {
    const mortgageAmount =
      allVariableMortgagePayments[allVariableMortgagePayments.length - 1]
        ? allVariableMortgagePayments[allVariableMortgagePayments.length - 1]
          .balance
        : startingMortgageAmount;
    const monthlyEffectiveRates = variableInterestRates.slice(
      month,
      month + termInMonths,
    ).map((d) => d * 100);
    const payments = variableMortgagePayments(
      mortgageAmount,
      monthlyEffectiveRates,
      term,
      25 - (month / 12),
    );
    allVariableMortgagePayments.push(
      ...payments.map((payment) => ({
        ...payment,
        effectiveInterestRate: payment.rate,
        postedInterestRate: variableInterestRates[month],
        rateDiscount: 0, // No rate discount for variable-rate mortgages
      })),
    );
  }

  return { allFixedMortgagePayments, allVariableMortgagePayments };
}
