export default function getPersona(parameters: {
  startingMonthlyRent: number;
  securityDeposit: number;
  startingMonthlyInsurance: number;
  downPayment: number;
  purchasePrice: number;
  homeValue: number;
  insurancePremium: number;
  fixedRateDiscount: number;
  variableRateMargin: number;
  purchaseFixedFees: number;
  startingAnnualMaintenanceCost: number;
  startingAnnualPropertyTax: number;
  startingMonthlyCondoFees: number;
  sellingFixedFees: number;
  sellingCommissionRate: number;
}): {
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
    mortgageCapital: number;
    mortgageInterests: number;
    rent: number;
    insurance: number;
    securityDeposit: number;
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
} {
  return {
    params: {
      monthlyRent: parameters.startingMonthlyRent,
      monthlyInsurance: parameters.startingMonthlyInsurance,
      securityDeposit: parameters.securityDeposit,
      downPayment: parameters.downPayment,
      purchasePrice: parameters.purchasePrice,
      homeValue: parameters.homeValue,
      fixedRateDiscount: parameters.fixedRateDiscount,
      variableRateMargin: parameters.variableRateMargin,
      purchaseFixedFees: parameters.purchaseFixedFees,
      monthlyMaintenanceCost: Math.round(
        parameters.startingAnnualMaintenanceCost / 12,
      ),
      monthlyPropertyTax: Math.round(parameters.startingAnnualPropertyTax / 12),
      monthlyCondoFees: parameters.startingMonthlyCondoFees,
      sellingFixedFees: parameters.sellingFixedFees,
      sellingCommissionRate: parameters.sellingCommissionRate,
      insurancePremium: parameters.insurancePremium,
    },
    monthlyExpenses: {
      mortgageCapital: 0,
      mortgageInterests: 0,
      rent: 0,
      insurance: 0,
      securityDeposit: 0,
      maintenance: 0,
      propertyTax: 0,
      condoFees: 0,
      downPayment: 0,
      purchaseFixedFees: 0,
      insurancePremium: 0,
    },
    cumulativeExpenses: {
      rent: 0,
      insurance: 0,
      securityDeposit: 0,
      mortgageCapital: 0,
      mortgageInterests: 0,
      maintenance: 0,
      propertyTax: 0,
      condoFees: 0,
      downPayment: 0,
      purchaseFixedFees: 0,
      insurancePremium: 0,
    },
    monthlyGains: {
      tfsaGains: 0,
      tfsaContribution: 0,
      stocksGains: 0,
      newStocks: 0,
      homeSellingGains: 0,
      homeEquityGains: 0,
    },
    cumulativeGains: {
      tfsaGains: 0,
      tfsaContribution: 0,
      stocksGains: 0,
      newStocks: 0,
      homeSellingGains: 0,
      homeEquityGains: 0,
    },
    assets: {
      tfsa: 0,
      stocks: 0,
      securityDeposit: 0,
      homeEquity: 0,
    },
    summary: {
      balance: 0,
    },
    summaryCumulative: {
      balance: 0,
      balanceAfterSelling: 0,
      differenceAfterSelling: 0,
    },
    saleCosts: {
      stockTaxes: 0,
      homeSellingCommission: 0,
      homeSellingFixedFees: 0,
      mortgagePenalty: 0,
    },
    saleNetGains: {
      stockSellingGains: 0,
      tfsaSellingGains: 0,
      homeSellingGains: 0,
      securityDeposit: 0,
    },
  };
}
