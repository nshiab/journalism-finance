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

  for (let year = 0; year < numberOfYears; year += term) {
    const effectiveInterestRate =
      (fixedInterestRates[year] - originalRateDiscount) *
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
      25 - year,
    );
    allFixedMortgagePayments.push(
      ...payments.map((payment) => ({
        ...payment,
        effectiveInterestRate: effectiveInterestRate / 100,
        postedInterestRate: fixedInterestRates[year],
        rateDiscount: originalRateDiscount,
      })),
    );
  }

  const annualFixedMortgagePayments: {
    year: number;
    interests: number;
    capital: number;
    mortgage: number;
    balance: number;
    effectiveInterestRate: number;
    postedInterestRate: number;
    rateDiscount: number;
  }[] = [];
  for (let i = 0; i < allFixedMortgagePayments.length; i += 12) {
    annualFixedMortgagePayments.push({
      year: (i / 12) + 1, // 1-indexed years
      balance: Math.round(allFixedMortgagePayments[i + 11].balance),
      interests: Math.round(
        allFixedMortgagePayments.slice(i, i + 12).reduce(
          (sum, mortgagePayment) => sum + mortgagePayment.interest,
          0,
        ),
      ),
      capital: Math.round(
        allFixedMortgagePayments.slice(i, i + 12).reduce(
          (sum, mortgagePayment) => sum + mortgagePayment.capital,
          0,
        ),
      ),
      mortgage: Math.round(
        allFixedMortgagePayments.slice(i, i + 12).reduce(
          (sum, mortgagePayment) => sum + mortgagePayment.payment,
          0,
        ),
      ),
      effectiveInterestRate: allFixedMortgagePayments[i].effectiveInterestRate,
      postedInterestRate: allFixedMortgagePayments[i].postedInterestRate,
      rateDiscount: allFixedMortgagePayments[i].rateDiscount,
    });
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

  for (let year = 0; year < numberOfYears; year += term) {
    const mortgageAmount =
      allVariableMortgagePayments[allVariableMortgagePayments.length - 1]
        ? allVariableMortgagePayments[allVariableMortgagePayments.length - 1]
          .balance
        : startingMortgageAmount;
    const monthlyEffectiveRates = variableInterestRates.slice(
      year,
      year + term,
    ).map((d) => Array.from({ length: 12 }, () => d * 100)).flat();
    const payments = variableMortgagePayments(
      mortgageAmount,
      monthlyEffectiveRates,
      term,
      25 - year,
    );
    allVariableMortgagePayments.push(
      ...payments.map((payment) => ({
        ...payment,
        effectiveInterestRate: payment.rate,
        postedInterestRate: variableInterestRates[year],
        rateDiscount: 0, // No rate discount for variable-rate mortgages
      })),
    );
  }

  const annualVariableMortgagePayments: {
    year: number;
    interests: number;
    capital: number;
    mortgage: number;
    balance: number;
    effectiveInterestRate: number;
    postedInterestRate: number;
    rateDiscount: number;
  }[] = [];

  for (let i = 0; i < allVariableMortgagePayments.length; i += 12) {
    annualVariableMortgagePayments.push({
      year: (i / 12) + 1, // 1-indexed years
      balance: Math.round(allVariableMortgagePayments[i + 11].balance),
      interests: Math.round(
        allVariableMortgagePayments.slice(i, i + 12).reduce(
          (sum, mortgagePayment) => sum + mortgagePayment.interest,
          0,
        ),
      ),
      capital: Math.round(
        allVariableMortgagePayments.slice(i, i + 12).reduce(
          (sum, mortgagePayment) => sum + mortgagePayment.capital,
          0,
        ),
      ),
      mortgage: Math.round(
        allVariableMortgagePayments.slice(i, i + 12).reduce(
          (sum, mortgagePayment) => sum + mortgagePayment.payment,
          0,
        ),
      ),
      effectiveInterestRate:
        allVariableMortgagePayments[i].effectiveInterestRate,
      postedInterestRate: allVariableMortgagePayments[i].postedInterestRate,
      rateDiscount: allVariableMortgagePayments[i].rateDiscount,
    });
  }

  return { annualFixedMortgagePayments, annualVariableMortgagePayments };
}
