import getRandomValues from "./getRandomValues.ts";
import simulateRentVsBuy from "./simulateRentVsBuy.ts";
import { quantile } from "d3-array";

export default function simulateRentVsBuyMonteCarlo(parameters: {
  iterations: number;
  startingYear: number;
  numberOfYears: number;
  annualAvgMarketReturnRate: number;
  annualMarketReturnStdDev: number;
  tfsaContributions: boolean;
  combinedTaxRate: number;
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
    interestRateAvg: number;
    interestRateStdDev: number;
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
    sellingFixedFees: number;
    sellingFixedIncreaseAvg: number;
    sellingFixedIncreaseStdDev: number;
    sellingCommissionRate: number;
  };
}) {
  const allIterationsResults = [];

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
    // Not all will be used, but we generate them all here for simplicity
    const interestRates = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.interestRateAvg,
      parameters.buyer.interestRateStdDev,
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
    const sellingFixedFeesIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.sellingFixedIncreaseAvg,
      parameters.buyer.sellingFixedIncreaseStdDev,
      { decimals: 4 },
    );
    const iterationResults = simulateRentVsBuy({
      startingYear: parameters.startingYear,
      numberOfYears: parameters.numberOfYears,
      annualMarketReturnRate,
      tfsaContributions: parameters.tfsaContributions,
      combinedTaxRate: parameters.combinedTaxRate,
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
        interestRates: interestRates,
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
        sellingFixedFees: parameters.buyer.sellingFixedFees,
        sellingFixedFeesIncrease,
        sellingCommissionRate: parameters.buyer.sellingCommissionRate,
      },
    });

    const iterationResultsFiltered = iterationResults.filter((d) =>
      ["cumulativeExpenses", "assets", "summary"].includes(d.group)
    );

    for (
      let year = parameters.startingYear;
      year < parameters.startingYear + parameters.numberOfYears + 1;
      year++
    ) {
      for (const category of ["renter", "buyer"] as const) {
        // cumulative expenses
        const cumulativeExpensesData = iterationResultsFiltered.filter(
          (d) =>
            d.year === year && d.category === category &&
            d.group === "cumulativeExpenses",
        ).reduce((acc, curr) => acc += curr.amount, 0);
        allIterationsResults.push({
          year,
          category,
          group: "cumulativeExpenses",
          amount: cumulativeExpensesData,
        });

        // assets
        const assetsData = iterationResultsFiltered.filter(
          (d) =>
            d.year === year && d.category === category &&
            d.group === "assets",
        ).reduce((acc, curr) => acc += curr.amount, 0);
        allIterationsResults.push({
          year,
          category,
          group: "assets",
          amount: assetsData,
        });

        // balance
        const balanceData = iterationResultsFiltered.filter(
          (d) =>
            d.year === year && d.category === category &&
            d.group === "summary" && d.variable === "balance",
        )[0].amount;
        allIterationsResults.push({
          year,
          category,
          group: "balance",
          amount: balanceData,
        });
      }
    }
  }

  const results: {
    year: number;
    category: "renter" | "buyer";
    variable: "cumulativeExpenses" | "assets" | "difference" | "balance";
    q10: number;
    q50: number;
    q90: number;
  }[] = [];

  for (
    let year = parameters.startingYear;
    year < parameters.startingYear + parameters.numberOfYears + 1;
    year++
  ) {
    for (const category of ["renter", "buyer"] as const) {
      // cumulative expenses
      const filteredExpenses = allIterationsResults.filter(
        (d) =>
          d.year === year && d.category === category &&
          d.group === "cumulativeExpenses",
      );
      results.push({
        year,
        category,
        variable: "cumulativeExpenses",
        q10: quantile(
          filteredExpenses,
          0.1,
          (d: { amount: number }) => d.amount,
        ),
        q50: quantile(
          filteredExpenses,
          0.5,
          (d: { amount: number }) => d.amount,
        ),
        q90: quantile(
          filteredExpenses,
          0.9,
          (d: { amount: number }) => d.amount,
        ),
      });

      // assets
      const filteredAssets = allIterationsResults.filter(
        (d) =>
          d.year === year && d.category === category && d.group === "assets",
      );
      results.push({
        year,
        category,
        variable: "assets",
        q10: quantile(
          filteredAssets,
          0.1,
          (d: { amount: number }) => d.amount,
        ),
        q50: quantile(
          filteredAssets,
          0.5,
          (d: { amount: number }) => d.amount,
        ),
        q90: quantile(
          filteredAssets,
          0.9,
          (d: { amount: number }) => d.amount,
        ),
      });

      // balance
      const filteredBalance = allIterationsResults.filter(
        (d) =>
          d.year === year && d.category === category && d.group === "balance",
      );
      results.push({
        year,
        category,
        variable: "balance",
        q10: quantile(
          filteredBalance,
          0.1,
          (d: { amount: number }) => d.amount,
        ),
        q50: quantile(
          filteredBalance,
          0.5,
          (d: { amount: number }) => d.amount,
        ),
        q90: quantile(
          filteredBalance,
          0.9,
          (d: { amount: number }) => d.amount,
        ),
      });
    }
  }

  return results;
}
