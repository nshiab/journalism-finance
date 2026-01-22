import { prettyDuration } from "@nshiab/journalism-format";
import getRandomValues from "./getRandomValues.ts";
import simulateRentVsBuy from "./simulateRentVsBuy.ts";
import { maxIndex } from "d3-array";

export default function simulateRentVsBuyMonteCarlo(parameters: {
  iterations: number;
  startingYear: number;
  numberOfYears: number;
  tfsaContributions: boolean;
  combinedTaxRate: number;
  renter: {
    startingMonthlyRent: number;
    securityDeposit: number;
    startingMonthlyInsurance: number;
  };
  buyer: {
    downPayment: number;
    purchasePrice: number;
    rateDiscount: number;
    purchaseFixedFees: number;
    startingAnnualMaintenanceCost: number;
    startingAnnualPropertyTax: number;
    startingMonthlyCondoFees: number;
    startingMonthlyInsurance: number;
    sellingFixedFees: number;
    sellingCommissionRate: number;
  };
  rates: {
    monthlyAvgMarketReturnRate: number;
    monthlyMarketReturnStdDev: number;
    annualRentIncreaseAvg: number;
    annualRentIncreaseStdDev: number;
    annualInsuranceIncreaseAvg: number;
    annualInsuranceIncreaseStdDev: number;
    annualMaintenanceIncreaseAvg: number;
    annualMaintenanceIncreaseStdDev: number;
    annualPropertyTaxIncreaseAvg: number;
    annualPropertyTaxIncreaseStdDev: number;
    annualCondoFeeIncreaseAvg: number;
    annualCondoFeeIncreaseStdDev: number;
    fiveYearInterestRateAvg: number;
    fiveYearInterestRateStdDev: number;
    fourYearInterestRateAvg: number;
    fourYearInterestRateStdDev: number;
    threeYearInterestRateAvg: number;
    threeYearInterestRateStdDev: number;
    twoYearInterestRateAvg: number;
    twoYearInterestRateStdDev: number;
    oneYearInterestRateAvg: number;
    oneYearInterestRateStdDev: number;
    variableInterestRateAvg: number;
    variableInterestRateStdDev: number;
    appreciationRateAvg: number;
    appreciationRateStdDev: number;
    sellingFixedIncreaseAvg: number;
    sellingFixedIncreaseStdDev: number;
  };
}, options: { verbose?: boolean; verboseStep?: number } = {}) {
  // const allIterationsResults = [];
  // const lastMonthBalanceResults = [];
  const winners = [];
  const rates = [];

  const numberOfMonths = parameters.numberOfYears * 12;
  const start = options.verbose ? Date.now() : null;
  for (let i = 0; i < parameters.iterations; i++) {
    if (options.verbose && i % (options.verboseStep || 1000) === 0) {
      console.log(`Simulation ${i} / ${parameters.iterations}`);
    }
    // We create the arrays for the rates for each year
    // We know the rates are the same throughout the iteration, so we can store them once
    const monthlyMarketReturnRate = getRandomValues(
      numberOfMonths,
      parameters.rates.monthlyAvgMarketReturnRate,
      parameters.rates.monthlyMarketReturnStdDev,
    );
    rates.push({
      variable: "monthlyMarketReturnRate",
      value: monthlyMarketReturnRate[0],
    });
    const annualRentIncrease = getRandomValues(
      numberOfMonths,
      parameters.rates.annualRentIncreaseAvg,
      parameters.rates.annualRentIncreaseStdDev,
    );
    rates.push({
      variable: "annualRentIncrease",
      value: annualRentIncrease[0],
    });
    const annualInsuranceIncrease = getRandomValues(
      numberOfMonths,
      parameters.rates.annualInsuranceIncreaseAvg,
      parameters.rates.annualInsuranceIncreaseStdDev,
    );
    rates.push({
      variable: "annualInsuranceIncrease",
      value: annualInsuranceIncrease[0],
    });
    const fiveYearInterestRates = getRandomValues(
      numberOfMonths,
      parameters.rates.fiveYearInterestRateAvg,
      parameters.rates.fiveYearInterestRateStdDev,
    );
    rates.push({
      variable: "fiveYearInterestRates",
      value: fiveYearInterestRates[0],
    });
    const fourYearInterestRates = getRandomValues(
      numberOfMonths,
      parameters.rates.fourYearInterestRateAvg,
      parameters.rates.fourYearInterestRateStdDev,
    );
    rates.push({
      variable: "fourYearInterestRates",
      value: fourYearInterestRates[0],
    });
    const threeYearInterestRates = getRandomValues(
      numberOfMonths,
      parameters.rates.threeYearInterestRateAvg,
      parameters.rates.threeYearInterestRateStdDev,
    );
    rates.push({
      variable: "threeYearInterestRates",
      value: threeYearInterestRates[0],
    });
    const twoYearInterestRates = getRandomValues(
      numberOfMonths,
      parameters.rates.twoYearInterestRateAvg,
      parameters.rates.twoYearInterestRateStdDev,
    );
    rates.push({
      variable: "twoYearInterestRates",
      value: twoYearInterestRates[0],
    });
    const oneYearInterestRates = getRandomValues(
      numberOfMonths,
      parameters.rates.oneYearInterestRateAvg,
      parameters.rates.oneYearInterestRateStdDev,
    );
    rates.push({
      variable: "oneYearInterestRates",
      value: oneYearInterestRates[0],
    });
    const variableInterestRates = getRandomValues(
      numberOfMonths,
      parameters.rates.variableInterestRateAvg,
      parameters.rates.variableInterestRateStdDev,
    );
    rates.push({
      variable: "variableInterestRates",
      value: variableInterestRates[0],
    });
    const annualMaintenanceIncrease = getRandomValues(
      numberOfMonths,
      parameters.rates.annualMaintenanceIncreaseAvg,
      parameters.rates.annualMaintenanceIncreaseStdDev,
    );
    rates.push({
      variable: "annualMaintenanceIncrease",
      value: annualMaintenanceIncrease[0],
    });
    const annualPropertyTaxIncrease = getRandomValues(
      numberOfMonths,
      parameters.rates.annualPropertyTaxIncreaseAvg,
      parameters.rates.annualPropertyTaxIncreaseStdDev,
    );
    rates.push({
      variable: "annualPropertyTaxIncrease",
      value: annualPropertyTaxIncrease[0],
    });
    const annualCondoFeeIncrease = getRandomValues(
      numberOfMonths,
      parameters.rates.annualCondoFeeIncreaseAvg,
      parameters.rates.annualCondoFeeIncreaseStdDev,
    );
    rates.push({
      variable: "annualCondoFeeIncrease",
      value: annualCondoFeeIncrease[0],
    });
    const appreciationIncrease = getRandomValues(
      numberOfMonths,
      parameters.rates.appreciationRateAvg,
      parameters.rates.appreciationRateStdDev,
    );
    rates.push({
      variable: "appreciationIncrease",
      value: appreciationIncrease[0],
    });
    const sellingFixedFeesIncrease = getRandomValues(
      numberOfMonths,
      parameters.rates.sellingFixedIncreaseAvg,
      parameters.rates.sellingFixedIncreaseStdDev,
    );
    rates.push({
      variable: "sellingFixedFeesIncrease",
      value: sellingFixedFeesIncrease[0],
    });
    const iterationResults = simulateRentVsBuy({
      startingYear: parameters.startingYear,
      numberOfYears: parameters.numberOfYears,
      tfsaContributions: parameters.tfsaContributions,
      combinedTaxRate: parameters.combinedTaxRate,
      renter: {
        startingMonthlyRent: parameters.renter.startingMonthlyRent,
        securityDeposit: parameters.renter.securityDeposit,
        startingMonthlyInsurance: parameters.renter.startingMonthlyInsurance,
      },
      buyer: {
        downPayment: parameters.buyer.downPayment,
        purchasePrice: parameters.buyer.purchasePrice,
        rateDiscount: parameters.buyer.rateDiscount,
        purchaseFixedFees: parameters.buyer.purchaseFixedFees,
        startingAnnualMaintenanceCost:
          parameters.buyer.startingAnnualMaintenanceCost,
        startingAnnualPropertyTax: parameters.buyer.startingAnnualPropertyTax,
        startingMonthlyCondoFees: parameters.buyer.startingMonthlyCondoFees,
        startingMonthlyInsurance: parameters.buyer.startingMonthlyInsurance,
        sellingFixedFees: parameters.buyer.sellingFixedFees,
        sellingCommissionRate: parameters.buyer.sellingCommissionRate,
      },
      rates: {
        marketReturnRate: monthlyMarketReturnRate,
        annualRentIncrease,
        annualInsuranceIncrease,
        annualMaintenanceIncrease,
        annualPropertyTaxIncrease,
        annualCondoFeeIncrease,
        fiveYearInterestRates,
        fourYearInterestRates,
        threeYearInterestRates,
        twoYearInterestRates,
        oneYearInterestRates,
        variableInterestRates,
        annualAppreciationIncrease: appreciationIncrease,
        annualSellingFixedFeesIncrease: sellingFixedFeesIncrease,
      },
    }, { finalBalanceOnly: true });

    winners.push(
      iterationResults[
        maxIndex(
          iterationResults,
          (d: { amount: number }) => d.amount,
        )
      ],
    );
  }

  if (start) {
    prettyDuration(start, { log: true, prefix: "Completed in " });
  }

  return {
    rates,
    winners: winners.sort((a, b) => b.category.localeCompare(a.category)),
  };
}
