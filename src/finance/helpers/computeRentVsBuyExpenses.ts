export default function computeRentVsBuyExpenses(
  month: number,
  persona: {
    params: {
      monthlyRent: number;
      monthlyInsurance: number;
      securityDeposit: number;
      downPayment: number;
      purchasePrice: number;
      rateDiscount: number;
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
  },
  mortgagePayment: {
    paymentId: number;
    payment: number;
    interest: number;
    capital: number;
    balance: number;
    amountPaid: number;
    interestPaid: number;
    capitalPaid: number;
    effectiveInterestRate: number;
    postedInterestRate: number;
    rateDiscount: number;
  } | null,
) {
  // Common expenses
  persona.monthlyExpenses.insurance = persona.params.monthlyInsurance;

  if (mortgagePayment) {
    // Buyer expenses
    persona.monthlyExpenses.mortgageCapital = mortgagePayment.capital;
    persona.monthlyExpenses.mortgageInterests = mortgagePayment.interest;
    persona.monthlyExpenses.maintenance = persona.params.monthlyMaintenanceCost;
    persona.monthlyExpenses.propertyTax = persona.params.monthlyPropertyTax;
    persona.monthlyExpenses.condoFees = persona.params.monthlyCondoFees;

    persona.cumulativeExpenses.mortgageCapital +=
      persona.monthlyExpenses.mortgageCapital;
    persona.cumulativeExpenses.mortgageInterests +=
      persona.monthlyExpenses.mortgageInterests;
    persona.cumulativeExpenses.insurance += persona.monthlyExpenses.insurance;
    persona.cumulativeExpenses.maintenance +=
      persona.monthlyExpenses.maintenance;
    persona.cumulativeExpenses.propertyTax +=
      persona.monthlyExpenses.propertyTax;
    persona.cumulativeExpenses.condoFees += persona.monthlyExpenses.condoFees;

    // Non recurring expenses
    if (month === 0) {
      persona.monthlyExpenses.downPayment = persona.params.downPayment;
      persona.monthlyExpenses.purchaseFixedFees =
        persona.params.purchaseFixedFees;
      persona.monthlyExpenses.insurancePremium =
        persona.params.insurancePremium;

      persona.cumulativeExpenses.downPayment +=
        persona.monthlyExpenses.downPayment;
      persona.cumulativeExpenses.purchaseFixedFees +=
        persona.monthlyExpenses.purchaseFixedFees;
      persona.cumulativeExpenses.insurancePremium +=
        persona.monthlyExpenses.insurancePremium;
    } else {
      persona.monthlyExpenses.downPayment = 0;
      persona.monthlyExpenses.purchaseFixedFees = 0;
      persona.monthlyExpenses.insurancePremium = 0;
    }
  } else {
    // Renter expenses
    persona.monthlyExpenses.rent = persona.params.monthlyRent;

    // Non recurring expenses
    if (month === 0) {
      persona.monthlyExpenses.securityDeposit = persona.params.securityDeposit;

      persona.cumulativeExpenses.securityDeposit +=
        persona.monthlyExpenses.securityDeposit;
    } else {
      persona.monthlyExpenses.securityDeposit = 0;
    }
  }
}
