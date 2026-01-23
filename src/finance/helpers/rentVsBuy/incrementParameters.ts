export default function incrementParameters(
  monthIndex: number,
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
    rentIncrease: number[];
    ownerInsuranceIncrease: number[];
    renterInsuranceIncrease: number[];
    maintenanceIncrease: number[];
    propertyTaxIncrease: number[];
    condoFeeIncrease: number[];
    fiveYearInterestRates: number[];
    fourYearInterestRates: number[];
    threeYearInterestRates: number[];
    twoYearInterestRates: number[];
    oneYearInterestRates: number[];
    variableInterestRates: number[];
    appreciationIncrease: number[];
    sellingFixedFeesIncrease: number[];
  },
) {
  // We increment the variables for following month, except home value, since it's done in computeRentVsBuyGains.

  persona.params.monthlyInsurance += Math.round(
    persona.params.monthlyInsurance *
      rates.ownerInsuranceIncrease[monthIndex + 1],
  );

  // Renter
  if (persona.params.monthlyRent > 0) {
    persona.params.monthlyInsurance += Math.round(
      persona.params.monthlyInsurance *
        rates.renterInsuranceIncrease[monthIndex + 1],
    );
    persona.params.monthlyRent += Math.round(
      persona.params.monthlyRent *
        rates.rentIncrease[monthIndex + 1],
    );
  }

  // Buyer
  if (persona.params.homeValue > 0) {
    persona.params.monthlyInsurance += Math.round(
      persona.params.monthlyInsurance *
        rates.ownerInsuranceIncrease[monthIndex + 1],
    );
    persona.params.monthlyPropertyTax += Math.round(
      persona.params.monthlyPropertyTax *
        rates.propertyTaxIncrease[monthIndex + 1],
    );
    persona.params.monthlyCondoFees += Math.round(
      persona.params.monthlyCondoFees *
        rates.condoFeeIncrease[monthIndex + 1],
    );
    persona.params.sellingFixedFees += Math.round(
      persona.params.sellingFixedFees *
        rates.sellingFixedFeesIncrease[monthIndex + 1],
    );
    persona.params.monthlyMaintenanceCost += Math.round(
      persona.params.monthlyMaintenanceCost *
        rates.maintenanceIncrease[monthIndex + 1],
    );
  }
}
