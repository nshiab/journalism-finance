import { round } from "@nshiab/journalism-format";
import type { Persona } from "./types/persona.ts";
import type { MortgagePayment } from "./types/mortgagePayment.ts";

export default function computeExpenses(
  monthIndex: number,
  persona: Persona,
  mortgagePayment: MortgagePayment | null,
) {
  if (mortgagePayment) {
    // Buyer expenses
    persona.monthlyExpenses.mortgageCapital = mortgagePayment.capital;
    persona.monthlyExpenses.mortgageInterests = mortgagePayment.interest;
    persona.monthlyExpenses.maintenance = persona.params.monthlyMaintenanceCost;
    persona.monthlyExpenses.propertyTax = persona.params.monthlyPropertyTax;
    persona.monthlyExpenses.condoFees = persona.params.monthlyCondoFees;
    persona.monthlyExpenses.insurance = persona.params.monthlyInsurance;

    persona.cumulativeExpenses.mortgageCapital = round(
      persona.cumulativeExpenses.mortgageCapital +
        persona.monthlyExpenses.mortgageCapital,
      { decimals: 2 },
    );
    persona.cumulativeExpenses.mortgageInterests = round(
      persona.cumulativeExpenses.mortgageInterests +
        persona.monthlyExpenses.mortgageInterests,
      { decimals: 2 },
    );
    persona.cumulativeExpenses.insurance = round(
      persona.cumulativeExpenses.insurance + persona.monthlyExpenses.insurance,
      { decimals: 2 },
    );
    persona.cumulativeExpenses.maintenance = round(
      persona.cumulativeExpenses.maintenance +
        persona.monthlyExpenses.maintenance,
      { decimals: 2 },
    );
    persona.cumulativeExpenses.propertyTax = round(
      persona.cumulativeExpenses.propertyTax +
        persona.monthlyExpenses.propertyTax,
      { decimals: 2 },
    );
    persona.cumulativeExpenses.condoFees = round(
      persona.cumulativeExpenses.condoFees + persona.monthlyExpenses.condoFees,
      { decimals: 2 },
    );

    // Non recurring expenses
    if (monthIndex === 0) {
      persona.monthlyExpenses.downPayment = persona.params.downPayment;
      persona.monthlyExpenses.purchaseFixedFees =
        persona.params.purchaseFixedFees;
      persona.monthlyExpenses.insurancePremium =
        persona.params.insurancePremium;

      persona.cumulativeExpenses.downPayment = round(
        persona.cumulativeExpenses.downPayment +
          persona.monthlyExpenses.downPayment,
        { decimals: 2 },
      );
      persona.cumulativeExpenses.purchaseFixedFees = round(
        persona.cumulativeExpenses.purchaseFixedFees +
          persona.monthlyExpenses.purchaseFixedFees,
        { decimals: 2 },
      );
      persona.cumulativeExpenses.insurancePremium = round(
        persona.cumulativeExpenses.insurancePremium +
          persona.monthlyExpenses.insurancePremium,
        { decimals: 2 },
      );
    } else {
      persona.monthlyExpenses.downPayment = 0;
      persona.monthlyExpenses.purchaseFixedFees = 0;
      persona.monthlyExpenses.insurancePremium = 0;
    }
  } else {
    // Renter expenses
    persona.monthlyExpenses.rent = persona.params.monthlyRent;
    persona.monthlyExpenses.insurance = persona.params.monthlyInsurance;

    persona.cumulativeExpenses.rent = round(
      persona.cumulativeExpenses.rent + persona.monthlyExpenses.rent,
      { decimals: 2 },
    );
    persona.cumulativeExpenses.insurance = round(
      persona.cumulativeExpenses.insurance + persona.monthlyExpenses.insurance,
      { decimals: 2 },
    );

    // Non recurring expenses
    if (monthIndex === 0) {
      persona.monthlyExpenses.securityDeposit = persona.params.securityDeposit;

      persona.cumulativeExpenses.securityDeposit = round(
        persona.cumulativeExpenses.securityDeposit +
          persona.monthlyExpenses.securityDeposit,
        { decimals: 2 },
      );

      // Security deposit is also an asset for the renter
      persona.assets.securityDeposit = persona.params.securityDeposit;
    } else {
      persona.monthlyExpenses.securityDeposit = 0;
    }
  }

  const totalMonthlyExpenses = round(
    persona.monthlyExpenses.rent +
      persona.monthlyExpenses.insurance +
      persona.monthlyExpenses.securityDeposit +
      persona.monthlyExpenses.mortgageCapital +
      persona.monthlyExpenses.mortgageInterests +
      persona.monthlyExpenses.maintenance +
      persona.monthlyExpenses.propertyTax +
      persona.monthlyExpenses.condoFees +
      persona.monthlyExpenses.downPayment +
      persona.monthlyExpenses.purchaseFixedFees +
      persona.monthlyExpenses.insurancePremium,
    { decimals: 2 },
  );

  return {
    totalMonthlyExpenses,
  };
}
