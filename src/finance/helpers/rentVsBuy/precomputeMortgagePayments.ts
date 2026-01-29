import { round } from "@nshiab/journalism-format";
import mortgagePayments from "../../mortgagePayments.ts";
import variableMortgagePayments from "../../variableMortgagePayments.ts";

export default function precomputeMortgagePayments(
  numberOfYears: number,
  startingMortgageAmount: number,
  fixedRateDiscount: number,
  variableRateMargin: number,
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
    fixedRateDiscount: number;
    variableRateMargin: number;
  }[] = [];

  for (let month = 0; month < numberOfYears * 12; month += termInMonths) {
    const effectiveInterestRate = round(
      (fixedInterestRates[month] - fixedRateDiscount) *
        100,
      { decimals: 2 },
    );
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
      { decimals: 2 },
    );
    allFixedMortgagePayments.push(
      ...payments.map((payment) => ({
        ...payment,
        effectiveInterestRate: round(effectiveInterestRate / 100, {
          decimals: 4,
        }),
        postedInterestRate: fixedInterestRates[month],
        fixedRateDiscount: fixedRateDiscount,
        variableRateMargin: 0, // No rate margin for fixed-rate mortgages
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
    fixedRateDiscount: number;
    variableRateMargin: number;
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
    ).map((d) => round((d + variableRateMargin) * 100, { decimals: 2 }));
    const payments = variableMortgagePayments(
      mortgageAmount,
      monthlyEffectiveRates,
      term,
      25 - (month / 12),
      {
        decimals: 2,
      },
    );
    allVariableMortgagePayments.push(
      ...payments.map((payment) => ({
        ...payment,
        effectiveInterestRate: round(payment.rate / 100, { decimals: 4 }),
        postedInterestRate: variableInterestRates[month],
        fixedRateDiscount: 0, // No rate discount for variable-rate mortgages
        variableRateMargin: variableRateMargin,
      })),
    );
  }

  return { allFixedMortgagePayments, allVariableMortgagePayments };
}
