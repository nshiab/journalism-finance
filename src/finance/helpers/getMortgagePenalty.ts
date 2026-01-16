export default function getMortgagePenalty(
  parameters: {
    remainingYearsToTerm: number;
    mortgageBalance: number;
    postedInterestRate: number;
    rateDiscount: number;
    currentPostedRates: Record<number, number>;
  },
) {
  const {
    remainingYearsToTerm,
    mortgageBalance,
    postedInterestRate,
    rateDiscount,
    currentPostedRates,
  } = parameters;

  // If term is done, no penalty
  if (remainingYearsToTerm === 0) {
    return 0;
  }

  // Looking for current rate
  const termForRate = Math.round(remainingYearsToTerm);
  const comparisonRate =
    currentPostedRates[termForRate === 0 ? 1 : termForRate];
  if (comparisonRate === undefined) {
    throw new Error(
      `No current posted rate provided for a ${termForRate} year term.`,
    );
  }

  const effectiveRate = postedInterestRate - rateDiscount;

  // Three months interest penalty
  const threeMonthsPenalty = Math.round(
    (mortgageBalance * effectiveRate * 3) / 12,
  );

  // IRD (Interest Rate Differential) penalty
  const irdRate = Math.max(
    0,
    effectiveRate - (comparisonRate - rateDiscount),
  );
  const fixedMortgagePenalty = Math.round(
    mortgageBalance * irdRate * remainingYearsToTerm,
  );

  // Return the greater of three months interest or IRD penalty
  return Math.max(threeMonthsPenalty, fixedMortgagePenalty);
}
