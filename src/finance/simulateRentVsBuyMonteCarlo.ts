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
    fourYearInterestRateAvg: number;
    fourYearInterestRateStdDev: number;
    threeYearInterestRateAvg: number;
    threeYearInterestRateStdDev: number;
    twoYearInterestRateAvg: number;
    twoYearInterestRateStdDev: number;
    oneYearInterestRateAvg: number;
    oneYearInterestRateStdDev: number;
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
  const lastYearDifferenceResults = [];
  const rates = [];

  for (let i = 0; i < parameters.iterations; i++) {
    // We create the arrays for the rates for each year
    // We know the rates are the same throughout the iteration, so we can store them once
    const annualMarketReturnRate = getRandomValues(
      parameters.numberOfYears,
      parameters.annualAvgMarketReturnRate,
      parameters.annualMarketReturnStdDev,
      { decimals: 4 },
    );
    rates.push({
      variable: "annualMarketReturnRate",
      value: annualMarketReturnRate[0],
    });
    const annualRentIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.renter.annualRentIncreaseAvg,
      parameters.renter.annualRentIncreaseStdDev,
      {
        decimals: 4,
      },
    );
    rates.push({
      variable: "annualRentIncrease",
      value: annualRentIncrease[0],
    });
    const renterAnnualInsuranceIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.renter.annualInsuranceIncreaseAvg,
      parameters.renter.annualInsuranceIncreaseStdDev,
      { decimals: 4 },
    );
    rates.push({
      variable: "renterAnnualInsuranceIncrease",
      value: renterAnnualInsuranceIncrease[0],
    });
    // Not all will be used, but we generate them all here for simplicity
    const interestRates = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.interestRateAvg,
      parameters.buyer.interestRateStdDev,
      { decimals: 4 },
    );
    rates.push({
      variable: "interestRates",
      value: interestRates[0],
    });
    const fourYearInterestRates = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.fourYearInterestRateAvg,
      parameters.buyer.fourYearInterestRateStdDev,
      { decimals: 4 },
    );
    rates.push({
      variable: "fourYearInterestRates",
      value: fourYearInterestRates[0],
    });
    const threeYearInterestRates = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.threeYearInterestRateAvg,
      parameters.buyer.threeYearInterestRateStdDev,
      { decimals: 4 },
    );
    rates.push({
      variable: "threeYearInterestRates",
      value: threeYearInterestRates[0],
    });
    const twoYearInterestRates = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.twoYearInterestRateAvg,
      parameters.buyer.twoYearInterestRateStdDev,
      { decimals: 4 },
    );
    rates.push({
      variable: "twoYearInterestRates",
      value: twoYearInterestRates[0],
    });
    const oneYearInterestRates = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.oneYearInterestRateAvg,
      parameters.buyer.oneYearInterestRateStdDev,
      { decimals: 4 },
    );
    rates.push({
      variable: "oneYearInterestRates",
      value: oneYearInterestRates[0],
    });
    const annualMaintenanceIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.annualMaintenanceIncreaseAvg,
      parameters.buyer.annualMaintenanceIncreaseStdDev,
      { decimals: 4 },
    );
    rates.push({
      variable: "annualMaintenanceIncrease",
      value: annualMaintenanceIncrease[0],
    });
    const annualPropertyTaxIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.annualPropertyTaxIncreaseAvg,
      parameters.buyer.annualPropertyTaxIncreaseStdDev,
      { decimals: 4 },
    );
    rates.push({
      variable: "annualPropertyTaxIncrease",
      value: annualPropertyTaxIncrease[0],
    });
    const annualCondoFeeIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.annualCondoFeeIncreaseAvg,
      parameters.buyer.annualCondoFeeIncreaseStdDev,
      { decimals: 4 },
    );
    rates.push({
      variable: "annualCondoFeeIncrease",
      value: annualCondoFeeIncrease[0],
    });
    const buyerAnnualInsuranceIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.annualInsuranceIncreaseAvg,
      parameters.buyer.annualInsuranceIncreaseStdDev,
      { decimals: 4 },
    );
    rates.push({
      variable: "buyerAnnualInsuranceIncrease",
      value: buyerAnnualInsuranceIncrease[0],
    });
    const appreciationIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.appreciationRateAvg,
      parameters.buyer.appreciationRateStdDev,
      { decimals: 4 },
    );
    rates.push({
      variable: "appreciationIncrease",
      value: appreciationIncrease[0],
    });
    const sellingFixedFeesIncrease = getRandomValues(
      parameters.numberOfYears,
      parameters.buyer.sellingFixedIncreaseAvg,
      parameters.buyer.sellingFixedIncreaseStdDev,
      { decimals: 4 },
    );
    rates.push({
      variable: "sellingFixedFeesIncrease",
      value: sellingFixedFeesIncrease[0],
    });
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
        interestRates,
        fourYearInterestRates,
        threeYearInterestRates,
        twoYearInterestRates,
        oneYearInterestRates,
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
      d.variable === "balanceAfterSelling" ||
      d.variable === "differenceAfterSelling"
    );

    for (
      let year = parameters.startingYear;
      year < parameters.startingYear + parameters.numberOfYears;
      year++
    ) {
      for (const category of ["renter", "buyer"] as const) {
        for (
          const variable of [
            "balanceAfterSelling",
            "differenceAfterSelling",
          ] as const
        ) {
          const data = iterationResultsFiltered.filter(
            (d) =>
              d.year === year && d.category === category &&
              d.variable === variable,
          )[0].amount;
          allIterationsResults.push({
            year,
            category,
            group: variable,
            amount: data,
          });
        }
      }
    }

    const lastYearDifference = iterationResultsFiltered.filter(
      (d) =>
        d.year === parameters.startingYear + parameters.numberOfYears - 1 &&
        d.variable === "differenceAfterSelling" && d.category === "buyer",
    );
    lastYearDifferenceResults.push(
      ...lastYearDifference.map((d) => ({
        hasMore: d.amount > 0 ? "buyer" : "renter",
        amount: d.amount,
      })),
    );
  }

  const results: {
    year: number;
    category: "renter" | "buyer";
    variable: "balanceAfterSelling" | "differenceAfterSelling";
    items: number;
    q10: number;
    q25: number;
    q50: number;
    q75: number;
    q90: number;
  }[] = [];

  for (
    let year = parameters.startingYear;
    year < parameters.startingYear + parameters.numberOfYears + 1;
    year++
  ) {
    for (const category of ["renter", "buyer"] as const) {
      for (
        const variable of [
          "balanceAfterSelling",
          "differenceAfterSelling",
        ] as const
      ) {
        const data = allIterationsResults.filter(
          (d) =>
            d.year === year && d.category === category &&
            d.group === variable,
        );
        results.push({
          year,
          category,
          variable,
          items: data.length,
          q10: quantile(
            data,
            0.1,
            (d: { amount: number }) => d.amount,
          ),
          q25: quantile(
            data,
            0.25,
            (d: { amount: number }) => d.amount,
          ),
          q50: quantile(
            data,
            0.5,
            (d: { amount: number }) => d.amount,
          ),
          q75: quantile(
            data,
            0.75,
            (d: { amount: number }) => d.amount,
          ),
          q90: quantile(
            data,
            0.9,
            (d: { amount: number }) => d.amount,
          ),
        });
      }
    }
  }

  return {
    results,
    lastYearDifferenceResults,
    rates,
  };
}
