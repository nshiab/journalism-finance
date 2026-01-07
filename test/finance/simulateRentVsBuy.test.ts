import { assertEquals } from "jsr:@std/assert";
import simulateRentVsBuy from "../../src/finance/simulateRentVsBuy.ts";

Deno.test("should compare the net worth of a renter and buyer", () => {
  simulateRentVsBuy({
    numberOfYears: 25,
    annualMarketReturnRate: 0.05,
    renter: {
      startingMonthlyRent: 1000,
      annualRentIncrease: 0.03,
      securityDeposit: 1000,
      startingMonthlyInsurance: 50,
      annualInsuranceIncrease: 0.02,
    },
    buyer: {
      downPayment: 50_000,
      purchasePrice: 500_000,
      interestRate: 0.05,
      purchaseFixedFees: 500_000 * 0.04 + 5000,
      startingAnnualMaintenanceCost: 1000,
      annualMaintenanceIncrease: 0.03,
      startingAnnualPropertyTax: 1500,
      annualPropertyTaxIncrease: 0.02,
      startingMonthlyCondoFees: 200,
      annualCondoFeeIncrease: 0.02,
      startingMonthlyInsurance: 100,
      annualInsuranceIncrease: 0.02,
      appreciationRate: 0.03,
    },
  });

  //   assertEquals(adjustedAmount, 2606.6666666666665);
});
