import { prettyDuration } from "@nshiab/journalism-format";
import simulateRentVsBuy from "./simulateRentVsBuy.ts";
import { maxIndex } from "d3-array";
import { generateGbmPath } from "@nshiab/journalism-statistics";

export default function simulateRentVsBuyMonteCarlo(
  parameters: {
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
      fixedRateDiscount: number;
      variableRateMargin: number;
      purchaseFixedFees: number;
      startingAnnualMaintenanceCost: number;
      startingAnnualPropertyTax: number;
      startingMonthlyCondoFees: number;
      startingMonthlyInsurance: number;
      sellingFixedFees: number;
      sellingCommissionRate: number;
    };
    gbmParameters: {
      marketReturn: { startValue: number; mu: number; sigma: number };
      rentIncrease: { startValue: number; mu: number; sigma: number };
      ownerInsuranceIncrease: { startValue: number; mu: number; sigma: number };
      renterInsuranceIncrease: {
        startValue: number;
        mu: number;
        sigma: number;
      };
      fiveYearInterestRates: { startValue: number; mu: number; sigma: number };
      fourYearInterestRates: { startValue: number; mu: number; sigma: number };
      threeYearInterestRates: { startValue: number; mu: number; sigma: number };
      twoYearInterestRates: { startValue: number; mu: number; sigma: number };
      oneYearInterestRates: { startValue: number; mu: number; sigma: number };
      variableInterestRates: { startValue: number; mu: number; sigma: number };
      maintenanceIncrease: { startValue: number; mu: number; sigma: number };
      propertyTaxIncrease: { startValue: number; mu: number; sigma: number };
      condoFeeIncrease: { startValue: number; mu: number; sigma: number };
      appreciationIncrease: { startValue: number; mu: number; sigma: number };
      sellingFixedFeesIncrease: {
        startValue: number;
        mu: number;
        sigma: number;
      };
    };
  },
  options: {
    verbose?: boolean;
    verboseStep?: number;
    values?: boolean;
  } = {},
) {
  const winners = [];
  const values: {
    iteration: string;
    variable: string;
    value: number;
    month: number;
  }[] = [];

  const nbMonths = parameters.numberOfYears * 12;

  function prepRates(
    iteration: number,
    variable: string,
    params: { startValue: number; mu: number; sigma: number },
  ): number[] {
    // We generate a bit more than the number of months...
    const path = generateGbmPath(
      params.startValue,
      params.mu,
      params.sigma,
      parameters.numberOfYears + 0.9,
      12,
    );
    if (options.values) {
      values.push(
        ...path.slice(0, nbMonths).map((value, i) => ({
          iteration: iteration.toString(),
          variable,
          value,
          month: i,
        })),
      );
    }

    // So we can compute the monthly returns, which is what we need for the simulation
    const randomRates = [];
    for (let i = 0; i < nbMonths; i++) {
      randomRates.push((path[i + 1] - path[i]) / path[i]);
    }

    return randomRates;
  }

  const start = options.verbose ? Date.now() : null;
  for (let i = 0; i < parameters.iterations; i++) {
    if (options.verbose && i % (options.verboseStep || 1000) === 0) {
      console.log(`Simulation ${i} / ${parameters.iterations}`);
    }

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
        fixedRateDiscount: parameters.buyer.fixedRateDiscount,
        variableRateMargin: parameters.buyer.variableRateMargin,
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
        marketReturnRate: prepRates(
          i,
          "stockMarket",
          parameters.gbmParameters.marketReturn,
        ),
        rentIncrease: prepRates(
          i,
          "rent",
          parameters.gbmParameters.rentIncrease,
        ),
        renterInsuranceIncrease: prepRates(
          i,
          "renterInsurance",
          parameters.gbmParameters.renterInsuranceIncrease,
        ),
        ownerInsuranceIncrease: prepRates(
          i,
          "ownerInsurance",
          parameters.gbmParameters.ownerInsuranceIncrease,
        ),
        maintenanceIncrease: prepRates(
          i,
          "maintenance",
          parameters.gbmParameters.maintenanceIncrease,
        ),
        propertyTaxIncrease: prepRates(
          i,
          "propertyTax",
          parameters.gbmParameters.propertyTaxIncrease,
        ),
        condoFeeIncrease: prepRates(
          i,
          "condoFee",
          parameters.gbmParameters.condoFeeIncrease,
        ),
        fiveYearInterestRates: prepRates(
          i,
          "fiveYearInterestRates",
          parameters.gbmParameters.fiveYearInterestRates,
        ),
        fourYearInterestRates: prepRates(
          i,
          "fourYearInterestRates",
          parameters.gbmParameters.fourYearInterestRates,
        ),
        threeYearInterestRates: prepRates(
          i,
          "threeYearInterestRates",
          parameters.gbmParameters.threeYearInterestRates,
        ),
        twoYearInterestRates: prepRates(
          i,
          "twoYearInterestRates",
          parameters.gbmParameters.twoYearInterestRates,
        ),
        oneYearInterestRates: prepRates(
          i,
          "oneYearInterestRates",
          parameters.gbmParameters.oneYearInterestRates,
        ),
        variableInterestRates: prepRates(
          i,
          "variableInterestRates",
          parameters.gbmParameters.variableInterestRates,
        ),
        appreciationIncrease: prepRates(
          i,
          "propertyAppreciation",
          parameters.gbmParameters.appreciationIncrease,
        ),
        sellingFixedFeesIncrease: prepRates(
          i,
          "sellingFixedFees",
          parameters.gbmParameters.sellingFixedFeesIncrease,
        ),
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
    values,
    winners: winners.sort((a, b) => b.category.localeCompare(a.category)),
  };
}
