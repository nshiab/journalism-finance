export default function computeBalances(persona: {
  params: {
    monthlyRent: number;
    monthlyInsurance: number;
    securityDeposit: number;
    downPayment: number;
    purchasePrice: number;
    homeValue: number;
    fixedRateDiscount: number;
    variableRateMargin: number;
    purchaseFixedFees: number;
    monthlyMaintenanceCost: number;
    monthlyPropertyTax: number;
    monthlyCondoFees: number;
    sellingFixedFees: number;
    sellingCommissionRate: number;
    insurancePremium: number;
  };
  monthlyExpenses: {
    rent: number;
    insurance: number;
    securityDeposit: number;
    mortgageCapital: number;
    mortgageInterests: number;
    maintenance: number;
    propertyTax: number;
    condoFees: number;
    downPayment: number;
    purchaseFixedFees: number;
    insurancePremium: number;
  };
  cumulativeExpenses: {
    rent: number;
    insurance: number;
    securityDeposit: number;
    mortgageCapital: number;
    mortgageInterests: number;
    maintenance: number;
    propertyTax: number;
    condoFees: number;
    downPayment: number;
    purchaseFixedFees: number;
    insurancePremium: number;
  };
  monthlyGains: {
    tfsaGains: number;
    tfsaContribution: number;
    stocksGains: number;
    newStocks: number;
    homeSellingGains: number;
    homeEquityGains: number;
  };
  cumulativeGains: {
    tfsaGains: number;
    tfsaContribution: number;
    stocksGains: number;
    newStocks: number;
    homeSellingGains: number;
    homeEquityGains: number;
  };
  assets: {
    tfsa: number;
    stocks: number;
    securityDeposit: number;
    homeEquity: number;
  };
  summary: { balance: number };
  summaryCumulative: {
    balance: number;
    balanceAfterSelling: number;
    differenceAfterSelling: number;
  };
  saleCosts: {
    stockTaxes: number;
    homeSellingCommission: number;
    homeSellingFixedFees: number;
    mortgagePenalty: number;
  };
  saleNetGains: {
    stockSellingGains: number;
    tfsaSellingGains: number;
    homeSellingGains: number;
    securityDeposit: number;
  };
}) {
  // Monthly balance
  const totalMonthlyExpenses = Object.values(persona.monthlyExpenses).reduce(
    (sum, value) => sum + value,
    0,
  );
  const totalMonthlyGains = Object.values(persona.monthlyGains).reduce(
    (sum, value) => sum + value,
    0,
  );
  persona.summary.balance = totalMonthlyGains - totalMonthlyExpenses;

  // Cumulative balance
  const totalCumulativeExpenses = Object.values(
    persona.cumulativeExpenses,
  ).reduce((sum, value) => sum + value, 0);
  const totalCumulativeGains = Object.values(persona.cumulativeGains).reduce(
    (sum, value) => sum + value,
    0,
  );
  persona.summaryCumulative.balance = totalCumulativeGains -
    totalCumulativeExpenses;

  // Balance after selling
  const totalSaleNetGains = Object.values(persona.saleNetGains).reduce(
    (sum, value) => sum + value,
    0,
  );
  persona.summaryCumulative.balanceAfterSelling = totalSaleNetGains -
    totalCumulativeExpenses;
}
