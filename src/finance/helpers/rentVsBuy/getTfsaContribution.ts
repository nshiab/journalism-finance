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
  }];

  if (year > Math.max(...tfsaContributions.map((c) => c.year))) {
    console.log(
      "WARNING: Year exceeds the latest TFSA contribution limit data, which stops at 2026. TFSA contribution could be higher than calculated.",
    );
  }

  const previousContributionsYear = tfsaContributions.filter((c) =>
    c.year <= year
  ).reduce((sum, c) => sum + c.amount, 0);

  return Math.max(0, previousContributionsYear - contributionsSoFar);
}
