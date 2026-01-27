import { round } from "@nshiab/journalism-format";

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
  // We increment the variables for following month, except home value, since it's done in computeGains.
  // Renter
  if (persona.params.monthlyRent > 0) {
    persona.params.monthlyInsurance += round(
      persona.params.monthlyInsurance *
        rates.renterInsuranceIncrease[monthIndex],
      { decimals: 2 },
    );
    persona.params.monthlyRent += round(
      persona.params.monthlyRent *
        rates.rentIncrease[monthIndex],
      { decimals: 2 },
    );
  }

  // Buyer
  if (persona.params.homeValue > 0) {
    persona.params.monthlyInsurance += round(
      persona.params.monthlyInsurance *
        rates.ownerInsuranceIncrease[monthIndex],
      { decimals: 2 },
    );
    persona.params.monthlyPropertyTax += round(
      persona.params.monthlyPropertyTax *
        rates.propertyTaxIncrease[monthIndex],
      { decimals: 2 },
    );
    persona.params.monthlyCondoFees += round(
      persona.params.monthlyCondoFees *
        rates.condoFeeIncrease[monthIndex],
      { decimals: 2 },
    );
    persona.params.sellingFixedFees += round(
      persona.params.sellingFixedFees *
        rates.sellingFixedFeesIncrease[monthIndex],
      { decimals: 2 },
    );
    persona.params.monthlyMaintenanceCost += round(
      persona.params.monthlyMaintenanceCost *
        rates.maintenanceIncrease[monthIndex],
      { decimals: 2 },
    );
  }
}
