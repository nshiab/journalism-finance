let warningSent = false;

export default function getTfsaContribution(
  year: number,
  contributionsSoFar: number,
): number {
  // Reference: https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account/contributing/before.html
  const tfsaContributions = [{
    year: 2009,
    amount: 5000,
  }, {
    year: 2010,
    amount: 5000,
  }, {
    year: 2011,
    amount: 5000,
  }, {
    year: 2012,
    amount: 5000,
  }, {
    year: 2013,
    amount: 5500,
  }, {
    year: 2014,
    amount: 5500,
  }, {
    year: 2015,
    amount: 10000,
  }, {
    year: 2016,
    amount: 5500,
  }, {
    year: 2017,
    amount: 5500,
  }, {
    year: 2018,
    amount: 5500,
  }, {
    year: 2019,
    amount: 6000,
  }, {
    year: 2020,
    amount: 6000,
  }, {
    year: 2021,
    amount: 6000,
  }, {
    year: 2022,
    amount: 6000,
  }, {
    year: 2023,
    amount: 6500,
  }, {
    year: 2024,
    amount: 7000,
  }, {
    year: 2025,
    amount: 7000,
  }, {
    year: 2026,
    amount: 7000,
  }] // For Monte Carlo simulation, we need extra years. We assume the 4.23% average increase from 2009-2026 continues in the future.
    .concat([
      { year: 2027, amount: 7296 },
      { year: 2028, amount: 7605 },
      { year: 2029, amount: 7927 },
      { year: 2030, amount: 8262 },
      { year: 2031, amount: 8611 },
      { year: 2032, amount: 8975 },
      { year: 2033, amount: 9355 },
      { year: 2034, amount: 9751 },
      { year: 2035, amount: 10163 },
      { year: 2036, amount: 10593 },
      { year: 2037, amount: 11041 },
      { year: 2038, amount: 11508 },
      { year: 2039, amount: 11995 },
      { year: 2040, amount: 12502 },
      { year: 2041, amount: 13031 },
      { year: 2042, amount: 13582 },
      { year: 2043, amount: 14157 },
      { year: 2044, amount: 14756 },
      { year: 2045, amount: 15380 },
      { year: 2046, amount: 16031 },
      { year: 2047, amount: 16709 },
      { year: 2048, amount: 17416 },
      { year: 2049, amount: 18153 },
      { year: 2050, amount: 18921 },
    ]);

  if (year > Math.max(...tfsaContributions.map((c) => c.year))) {
    if (!warningSent) {
      console.log(
        "WARNING: Year exceeds the latest TFSA contribution limit data, which stops at 2026. TFSA contribution could be higher than calculated.",
      );
      warningSent = true;
    }
  }

  const previousContributionsYear = tfsaContributions.filter((c) =>
    c.year <= year
  ).reduce((sum, c) => sum + c.amount, 0);

  return Math.max(0, previousContributionsYear - contributionsSoFar);
}
