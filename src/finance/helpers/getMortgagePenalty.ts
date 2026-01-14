export default function getMortgagePenalty(
  remainingYearsToTerm: number,
  mortgageBalance: number,
  originalInterestRate: number,
  fourYearMortgageInterestRate: number,
  threeYearMortgageInterestRate: number,
  twoYearMortgageInterestRate: number,
  oneYearMortgageInterestRate: number,
) {
  // If term is done, not penalty
  if (remainingYearsToTerm === 0) {
    return 0;
  }

  const threeMonthsPenalty = Math.round(
    (mortgageBalance * originalInterestRate) / 12 * 3,
  );

  let currentRate = 0;
  if (remainingYearsToTerm === 4) {
    currentRate = fourYearMortgageInterestRate;
  } else if (remainingYearsToTerm === 3) {
    currentRate = threeYearMortgageInterestRate;
  } else if (remainingYearsToTerm === 2) {
    currentRate = twoYearMortgageInterestRate;
  } else if (remainingYearsToTerm === 1) {
    currentRate = oneYearMortgageInterestRate;
  }

  const ird = originalInterestRate - currentRate;
  const perMonth = (ird * mortgageBalance) / 12;
  const monthsLeft = remainingYearsToTerm * 12;
  const fixedMortgagePenalty = Math.round(
    perMonth * monthsLeft,
  );

  return Math.max(threeMonthsPenalty, fixedMortgagePenalty);
}
