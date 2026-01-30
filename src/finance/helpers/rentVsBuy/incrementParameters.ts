import { round } from "@nshiab/journalism-format";
import type { Persona } from "./types/persona.ts";

export default function incrementParameters(
  monthIndex: number,
  persona: Persona,
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
  // We increment the variables for following month
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
    persona.params.homeValue = round(
      (1 + rates.appreciationIncrease[monthIndex]) * persona.params.homeValue,
      {
        decimals: 2,
      },
    );

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
