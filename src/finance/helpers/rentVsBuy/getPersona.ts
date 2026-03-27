import type { Persona } from "./types/persona.ts";

export default function getPersona(parameters: {
  startingMonthlyRent: number;
  securityDeposit: number;
  startingMonthlyInsurance: number;
  downPayment: number;
  purchasePrice: number;
  homeValue: number;
  insurancePremium: number;
  fixedRateAdjustment: number;
  variableRateAdjustment: number;
  purchaseFixedFees: number;
  startingAnnualMaintenanceCost: number;
  startingAnnualPropertyTax: number;
  startingMonthlyCondoFees: number;
  sellingFixedFees: number;
  sellingCommissionRate: number;
  floorRate: number;
}): Persona {
  return {
    params: {
      monthlyRent: parameters.startingMonthlyRent,
      monthlyInsurance: parameters.startingMonthlyInsurance,
      securityDeposit: parameters.securityDeposit,
      downPayment: parameters.downPayment,
      purchasePrice: parameters.purchasePrice,
      homeValue: parameters.homeValue,
      fixedRateAdjustment: parameters.fixedRateAdjustment,
      variableRateAdjustment: parameters.variableRateAdjustment,
      purchaseFixedFees: parameters.purchaseFixedFees,
      monthlyMaintenanceCost: Math.round(
        parameters.startingAnnualMaintenanceCost / 12,
      ),
      monthlyPropertyTax: Math.round(parameters.startingAnnualPropertyTax / 12),
      monthlyCondoFees: parameters.startingMonthlyCondoFees,
      sellingFixedFees: parameters.sellingFixedFees,
      sellingCommissionRate: parameters.sellingCommissionRate,
      insurancePremium: parameters.insurancePremium,
      floorRate: parameters.floorRate,
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
      homeEquityGains: 0,
    },
    cumulativeGains: {
      tfsaGains: 0,
      tfsaContribution: 0,
      stocksGains: 0,
      newStocks: 0,
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
    },
    saleCosts: {
      stockTaxes: 0,
      homeSellingCommission: 0,
      homeSellingFixedFees: 0,
      mortgagePenalty: 0,
      mortgageBalance: 0,
    },
    saleNetGains: {
      stockSellingGains: 0,
      tfsaSellingGains: 0,
      homeSellingGains: 0,
      securityDeposit: 0,
    },
  };
}
