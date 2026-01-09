import getRandomValues from "./getRandomValues.ts";
import simulateRentVsBuy from "./simulateRentVsBuy.ts";
import { quantile } from "d3-array";

export default function simulateRentVsBuyMonteCarlo(parameters: {
  iterations: number;
  numberOfYears: number;
  annualAvgMarketReturnRate: number;
  annualMarketReturnStdDev: number;
  renter: {
    startingMonthlyRent: number;
    annualRentIncreaseAvg: number;
    annualRentIncreaseStdDev: number;
    securityDeposit: number;
    startingMonthlyInsurance: number;
    annualInsuranceIncreaseAvg: number;
    annualInsuranceIncreaseStdDev: number;
  };
  buyer: {
    downPayment: number;
    purchasePrice: number;
    interestRate: number;
    purchaseFixedFees: number;
    startingAnnualMaintenanceCost: number;
    annualMaintenanceIncreaseAvg: number;
    annualMaintenanceIncreaseStdDev: number;
    startingAnnualPropertyTax: number;
    annualPropertyTaxIncreaseAvg: number;
    annualPropertyTaxIncreaseStdDev: number;
    startingMonthlyCondoFee: number;
    annualCondoFeeIncreaseAvg: number;
    annualCondoFeeIncreaseStdDev: number;
    startingMonthlyInsurance: number;
    annualInsuranceIncreaseAvg: number;
    annualInsuranceIncreaseStdDev: number;
    appreciationRateAvg: number;
    appreciationRateStdDev: number;
  };
}) {
  const allIterationsResults = [];
  const finalYearResults = [];

  for (let i = 0; i < parameters.iterations; i++) {
    // We create the arrays for the rates for each year
    const annualMarketReturnRate = getRandomValues(
      parameters.numberOfYears,
      parameters.annualAvgMarketReturnRate,
      parameters.annualMarketReturnStdDev,
      { decimals: 4 },
    );
    const annualRentIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.renter.annualRentIncreaseAvg,
      parameters.renter.annualRentIncreaseStdDev,
      {
        decimals: 4,
      },
    );
    const renterAnnualInsuranceIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.renter.annualInsuranceIncreaseAvg,
      parameters.renter.annualInsuranceIncreaseStdDev,
      { decimals: 4 },
    );
    const annualMaintenanceIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.annualMaintenanceIncreaseAvg,
      parameters.buyer.annualMaintenanceIncreaseStdDev,
      { decimals: 4 },
    );
    const annualPropertyTaxIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.annualPropertyTaxIncreaseAvg,
      parameters.buyer.annualPropertyTaxIncreaseStdDev,
      { decimals: 4 },
    );
    const annualCondoFeeIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.annualCondoFeeIncreaseAvg,
      parameters.buyer.annualCondoFeeIncreaseStdDev,
      { decimals: 4 },
    );
    const buyerAnnualInsuranceIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.annualInsuranceIncreaseAvg,
      parameters.buyer.annualInsuranceIncreaseStdDev,
      { decimals: 4 },
    );
    const appreciationIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.appreciationRateAvg,
      parameters.buyer.appreciationRateStdDev,
      { decimals: 4 },
    );
    const iterationResults = simulateRentVsBuy({
      numberOfYears: parameters.numberOfYears,
      annualMarketReturnRate,
      renter: {
        startingMonthlyRent: parameters.renter.startingMonthlyRent,
        annualRentIncrease,
        securityDeposit: parameters.renter.securityDeposit,
        startingMonthlyInsurance: parameters.renter.startingMonthlyInsurance,
        annualInsuranceIncrease: renterAnnualInsuranceIncrease,
      },
      buyer: {
        downPayment: parameters.buyer.downPayment,
        purchasePrice: parameters.buyer.purchasePrice,
        interestRate: parameters.buyer.interestRate,
        purchaseFixedFees: parameters.buyer.purchaseFixedFees,
        startingAnnualMaintenanceCost:
          parameters.buyer.startingAnnualMaintenanceCost,
        annualMaintenanceIncrease,
        startingAnnualPropertyTax: parameters.buyer.startingAnnualPropertyTax,
        annualPropertyTaxIncrease,
        startingMonthlyCondoFees: parameters.buyer.startingMonthlyCondoFee,
        annualCondoFeeIncrease,
        startingMonthlyInsurance: parameters.buyer.startingMonthlyInsurance,
        annualInsuranceIncrease: buyerAnnualInsuranceIncrease,
        appreciationIncrease,
      },
    });

    allIterationsResults.push(
      ...iterationResults.filter((d) =>
        ["cumulativeExpenses", "assets", "difference"].includes(d.variable)
      ),
    );
    finalYearResults.push(
      ...iterationResults.filter((d) =>
        d.year === parameters.numberOfYears &&
        ["cumulativeExpenses", "assets", "difference"].includes(d.variable)
      ),
    );
  }

  const results: {
    year: number;
    category: "renter" | "buyer";
    variable: "cumulativeExpenses" | "assets" | "difference";
    q10: number;
    q50: number;
    q90: number;
  }[] = [];

  for (let year = 1; year <= parameters.numberOfYears; year++) {
    for (const category of ["renter", "buyer"] as const) {
      for (
        const variable of [
          "cumulativeExpenses",
          "assets",
          "difference",
        ] as const
      ) {
        const filteredData = allIterationsResults.filter(
          (d) =>
            d.year === year && d.category === category &&
            d.variable === variable,
        );
        results.push({
          year,
          category,
          variable,
          q10: quantile(
            filteredData,
            0.1,
            (d: { amount: number }) => d.amount,
          ),
          q50: quantile(
            filteredData,
            0.5,
            (d: { amount: number }) => d.amount,
          ),
          q90: quantile(
            filteredData,
            0.9,
            (d: { amount: number }) => d.amount,
          ),
        });
      }
    }
  }

  return { results, finalYearResults };
}
