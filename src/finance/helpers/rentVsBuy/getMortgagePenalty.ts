import { round } from "@nshiab/journalism-format";

export default function getMortgagePenalty(
  parameters: {
    remainingMonthsToTerm: number;
    mortgageBalance: number;
    postedInterestRate: number;
    rateDiscount: number;
    currentPostedRates: Record<number, number>;
    mortgageType: "fixed" | "variable";
  },
) {
  const {
    remainingMonthsToTerm,
    mortgageBalance,
    postedInterestRate,
    rateDiscount,
    currentPostedRates,
    mortgageType,
  } = parameters;

  // If term is done, no penalty
  if (remainingMonthsToTerm === 0) {
    return 0;
  }

  if (mortgageType === "variable") {
    // Three months interest penalty
    const threeMonthsPenalty = round(
      (mortgageBalance * postedInterestRate * 3) / 12,
      { decimals: 2 },
    );

    return threeMonthsPenalty;
  } else {
    // Looking for current rate
    const remainingYearsToTerm = remainingMonthsToTerm / 12;
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
    const threeMonthsPenalty = round(
      (mortgageBalance * effectiveRate * 3) / 12,
      { decimals: 2 },
    );

    // IRD (Interest Rate Differential) penalty
    const irdRate = Math.max(
      0,
      effectiveRate - (comparisonRate - rateDiscount),
    );
    const fixedMortgagePenalty = round(
      mortgageBalance * irdRate * remainingYearsToTerm,
      { decimals: 2 },
    );

    // Return the greater of three months interest or IRD penalty
    return Math.max(threeMonthsPenalty, fixedMortgagePenalty);
  }
}
