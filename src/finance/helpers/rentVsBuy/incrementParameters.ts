export default function incrementParameters(
  monthIndex: number,
  month: number,
  persona: {
    params: {
      monthlyRent: number;
      monthlyInsurance: number;
      securityDeposit: number;
      downPayment: number;
      purchasePrice: number;
      homeValue: number;
      rateDiscount: number;
      purchaseFixedFees: number;
      monthlyMaintenanceCost: number;
      monthlyPropertyTax: number;
      monthlyCondoFees: number;
      sellingFixedFees: number;
      sellingCommissionRate: number;
      insurancePremium: number;
    };
  },
  rates: {
    marketReturnRate: number[];
    annualRentIncrease: number[];
    annualInsuranceIncrease: number[];
    annualMaintenanceIncrease: number[];
    annualPropertyTaxIncrease: number[];
    annualCondoFeeIncrease: number[];
    fiveYearInterestRates: number[];
    fourYearInterestRates: number[];
    threeYearInterestRates: number[];
    twoYearInterestRates: number[];
    oneYearInterestRates: number[];
    variableInterestRates: number[];
    annualAppreciationIncrease: number[];
    annualSellingFixedFeesIncrease: number[];
  },
) {
  // We increment the variables for following month, except home value, since it's done in computeRentVsBuyGains.

  // At the beginning of each year
  if (month === 0) {
    // Renter and buyer
    persona.params.monthlyInsurance += Math.round(
      persona.params.monthlyInsurance *
        rates.annualInsuranceIncrease[monthIndex],
    );

    // Renter
    if (persona.params.monthlyRent > 0) {
      persona.params.monthlyRent += Math.round(
        persona.params.monthlyRent *
          rates.annualRentIncrease[monthIndex],
      );
    }

    // Buyer
    if (persona.params.homeValue > 0) {
      persona.params.monthlyPropertyTax += Math.round(
        persona.params.monthlyPropertyTax *
          rates.annualPropertyTaxIncrease[monthIndex],
      );
      persona.params.monthlyCondoFees += Math.round(
        persona.params.monthlyCondoFees *
          rates.annualCondoFeeIncrease[monthIndex],
      );
      persona.params.sellingFixedFees += Math.round(
        persona.params.sellingFixedFees *
          rates.annualSellingFixedFeesIncrease[monthIndex],
      );
      persona.params.monthlyMaintenanceCost += Math.round(
        persona.params.monthlyMaintenanceCost *
          rates.annualMaintenanceIncrease[monthIndex],
      );
    }
  }
}
