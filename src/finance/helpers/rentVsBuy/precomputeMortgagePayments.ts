import { round } from "@nshiab/journalism-format";
import mortgagePayments from "../../mortgagePayments.ts";
import variableMortgagePayments from "../../variableMortgagePayments.ts";

export default function precomputeMortgagePayments(
  numberOfYears: number,
  startingMortgageAmount: number,
  fixedRateAdjustment: number,
  variableRateAdjustment: number,
  fixedInterestRates: number[],
  variableInterestRates: number[],
) {
  const TERM_YEARS = 5;
  const TERM_MONTHS = TERM_YEARS * 12;
  const AMORTIZATION_YEARS = 25;

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
    fixedRateAdjustment: number;
    variableRateAdjustment: number;
  }[] = [];

  for (let month = 0; month < numberOfYears * 12; month += TERM_MONTHS) {
    const effectiveInterestRate = round(
      (fixedInterestRates[month] + fixedRateAdjustment) *
        100,
      { decimals: 2 },
    );
    if (effectiveInterestRate < 0) {
      throw new Error(
        `Effective interest rate cannot be negative. Please check the fixed interest rates and adjustments for month ${month}.`,
      );
    }
    const mortgageAmount =
      allFixedMortgagePayments[allFixedMortgagePayments.length - 1]
        ? allFixedMortgagePayments[allFixedMortgagePayments.length - 1].balance
        : startingMortgageAmount;
    const payments = mortgagePayments(
      mortgageAmount,
      effectiveInterestRate,
      "monthly",
      TERM_YEARS,
      AMORTIZATION_YEARS - (month / 12),
      { decimals: 2 },
    );
    allFixedMortgagePayments.push(
      ...payments.map((payment) => ({
        ...payment,
        effectiveInterestRate: round(effectiveInterestRate / 100, {
          decimals: 4,
        }),
        postedInterestRate: fixedInterestRates[month],
        fixedRateAdjustment: fixedRateAdjustment,
        variableRateAdjustment: 0, // No rate adjustment for fixed-rate mortgages
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
    fixedRateAdjustment: number;
    variableRateAdjustment: number;
  }[] = [];

  if (variableInterestRates.length < numberOfYears * 12) {
    throw new Error("Not enough variable interest rates provided");
  }

  for (let month = 0; month < numberOfYears * 12; month += TERM_MONTHS) {
    const mortgageAmount =
      allVariableMortgagePayments[allVariableMortgagePayments.length - 1]
        ? allVariableMortgagePayments[allVariableMortgagePayments.length - 1]
          .balance
        : startingMortgageAmount;
    const monthlyEffectiveRates = variableInterestRates.slice(
      month,
      month + TERM_MONTHS,
    ).map((d) => round((d + variableRateAdjustment) * 100, { decimals: 2 }));
    if (monthlyEffectiveRates.some((rate) => rate < 0)) {
      throw new Error(
        `Effective interest rates cannot be negative. Please check the variable interest rates and adjustments for month ${month}.`,
      );
    }
    const payments = variableMortgagePayments(
      mortgageAmount,
      monthlyEffectiveRates,
      TERM_YEARS,
      AMORTIZATION_YEARS - (month / 12),
      {
        decimals: 2,
      },
    );
    allVariableMortgagePayments.push(
      ...payments.map((payment) => ({
        ...payment,
        effectiveInterestRate: round(payment.rate / 100, { decimals: 4 }),
        postedInterestRate: variableInterestRates[month],
        fixedRateAdjustment: 0, // No rate adjustment for variable-rate mortgages
        variableRateAdjustment: variableRateAdjustment,
      })),
    );
  }

  return { allFixedMortgagePayments, allVariableMortgagePayments };
}
