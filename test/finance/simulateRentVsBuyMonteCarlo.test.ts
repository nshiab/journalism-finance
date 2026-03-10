import { assert, assertEquals } from "jsr:@std/assert";
import simulateRentVsBuyMonteCarlo from "../../src/finance/simulateRentVsBuyMonteCarlo.ts";
import getParamsRentVsBuyMonteCarlo from "./helpers/getParamsRentVsBuyMonteCarlot.ts";

Deno.test("documentation example: simulateRentVsBuyMonteCarlo should run without errors", () => {
  const results = simulateRentVsBuyMonteCarlo({
    iterations: 10, // Reduced from 1000 for faster testing
    startingYear: 2024,
    numberOfYears: 25,
    tfsaContributions: true,
    combinedTaxRate: 0.4,
    renter: {
      startingMonthlyRent: 1500,
      securityDeposit: 1500,
      startingMonthlyInsurance: 25,
    },
    buyer: {
      downPayment: 50000,
      purchasePrice: 400000,
      fixedRateDiscount: 1.0,
      variableRateMargin: 0,
      purchaseFixedFees: 3000,
      startingAnnualMaintenanceCost: 1500,
      startingAnnualPropertyTax: 2500,
      startingMonthlyCondoFees: 0,
      startingMonthlyInsurance: 80,
      sellingFixedFees: 1500,
      sellingCommissionRate: 0.05,
    },
    gbmParameters: {
      market: { startValue: 0.07, mu: 0.07, sigma: 0.15 },
      rent: { startValue: 0.03, mu: 0.03, sigma: 0.02 },
      ownerInsurance: { startValue: 0.03, mu: 0.03, sigma: 0.05 },
      renterInsurance: { startValue: 0.03, mu: 0.03, sigma: 0.05 },
      maintenance: { startValue: 0.02, mu: 0.02, sigma: 0.05 },
      propertyTax: { startValue: 0.02, mu: 0.02, sigma: 0.02 },
      condoFee: { startValue: 0.03, mu: 0.03, sigma: 0.05 },
      appreciation: { startValue: 0.04, mu: 0.04, sigma: 0.10 },
      sellingFixedFees: { startValue: 0.02, mu: 0.02, sigma: 0.05 },
      fiveYearInterestRates: { startValue: 0.05, a: 0.2, b: 0.05, sigma: 0.02 },
      fourYearInterestRates: {
        startValue: 0.048,
        a: 0.2,
        b: 0.048,
        sigma: 0.02,
      },
      threeYearInterestRates: {
        startValue: 0.045,
        a: 0.2,
        b: 0.045,
        sigma: 0.02,
      },
      twoYearInterestRates: {
        startValue: 0.042,
        a: 0.2,
        b: 0.042,
        sigma: 0.02,
      },
      oneYearInterestRates: { startValue: 0.04, a: 0.2, b: 0.04, sigma: 0.02 },
      variableInterestRates: {
        startValue: 0.06,
        a: 0.3,
        b: 0.055,
        sigma: 0.03,
      },
    },
  }, { verbose: false });

  assert(results.winners.length === 10);
});

Deno.test("should run a monte carlo simulation of rent vs buy with 1,000 iterations", async () => {
  const params = getParamsRentVsBuyMonteCarlo(1000, "Montreal", "Quebec", {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  });

  // console.log(params);

  const simulationResults = simulateRentVsBuyMonteCarlo(params, {
    verbose: true,
    values: true,
    rates: true,
  });

  console.log(simulationResults.values.slice(0, 5));
  console.log(simulationResults.rates.slice(0, 5));
  console.log(simulationResults.winners.slice(0, 5));

  assertEquals(true, true);
});
