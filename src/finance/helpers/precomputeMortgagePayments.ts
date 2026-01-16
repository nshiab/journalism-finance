import mortgagePayments from "../mortgagePayments.ts";

export default function precomputeMortgagePayments(
  numberOfYears: number,
  startingMortgageAmount: number,
  originalRateDiscount: number,
  interestRates: number[],
) {
  // We precompute all mortgage payments for the entire period
  const allMortgagePayments: {
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
  const term = 5;
  for (let year = 0; year < numberOfYears; year += term) {
    const effectiveInterestRate = (interestRates[year] - originalRateDiscount) *
      100;
    const mortgageAmount = allMortgagePayments[allMortgagePayments.length - 1]
      ? allMortgagePayments[allMortgagePayments.length - 1].balance
      : startingMortgageAmount;
    const payments = mortgagePayments(
      mortgageAmount,
      effectiveInterestRate,
      "monthly",
      term,
      25 - year,
    );
    allMortgagePayments.push(
      ...payments.map((payment) => ({
        ...payment,
        effectiveInterestRate: effectiveInterestRate / 100,
        postedInterestRate: interestRates[year],
        rateDiscount: originalRateDiscount,
      })),
    );
  }

  const annualMortgagePayments: {
    year: number;
    interests: number;
    capital: number;
    mortgage: number;
    balance: number;
    effectiveInterestRate: number;
    postedInterestRate: number;
    rateDiscount: number;
  }[] = [];
  for (let i = 0; i < allMortgagePayments.length; i += 12) {
    annualMortgagePayments.push({
      year: (i / 12) + 1, // 1-indexed years
      balance: Math.round(allMortgagePayments[i + 11].balance),
      interests: Math.round(
        allMortgagePayments.slice(i, i + 12).reduce(
          (sum, mortgagePayment) => sum + mortgagePayment.interest,
          0,
        ),
      ),
      capital: Math.round(
        allMortgagePayments.slice(i, i + 12).reduce(
          (sum, mortgagePayment) => sum + mortgagePayment.capital,
          0,
        ),
      ),
      mortgage: Math.round(
        allMortgagePayments.slice(i, i + 12).reduce(
          (sum, mortgagePayment) => sum + mortgagePayment.payment,
          0,
        ),
      ),
      effectiveInterestRate: allMortgagePayments[i].effectiveInterestRate,
      postedInterestRate: allMortgagePayments[i].postedInterestRate,
      rateDiscount: allMortgagePayments[i].rateDiscount,
    });
  }

  return annualMortgagePayments;
}
