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
      market: { startValue: number; mu: number; sigma: number };
      rent: { startValue: number; mu: number; sigma: number };
      ownerInsurance: { startValue: number; mu: number; sigma: number };
      renterInsurance: {
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
      maintenance: { startValue: number; mu: number; sigma: number };
      propertyTax: { startValue: number; mu: number; sigma: number };
      condoFee: { startValue: number; mu: number; sigma: number };
      appreciation: { startValue: number; mu: number; sigma: number };
      sellingFixedFees: {
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
    rates?: boolean;
  } = {},
) {
  const winners = [];
  const values: {
    iteration: string;
    variable: string;
    value: number;
    month: number;
  }[] = [];
  const rates: {
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
    if (options.rates) {
      rates.push(
        ...randomRates.map((value, i) => ({
          iteration: iteration.toString(),
          variable,
          value,
          month: i,
        })),
      );
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
          "S&P/TSX",
          parameters.gbmParameters.market,
        ),
        rentIncrease: prepRates(
          i,
          "rent",
          parameters.gbmParameters.rent,
        ),
        renterInsuranceIncrease: prepRates(
          i,
          "renter insurance",
          parameters.gbmParameters.renterInsurance,
        ),
        ownerInsuranceIncrease: prepRates(
          i,
          "owner insurance",
          parameters.gbmParameters.ownerInsurance,
        ),
        maintenanceIncrease: prepRates(
          i,
          "maintenance costs",
          parameters.gbmParameters.maintenance,
        ),
        propertyTaxIncrease: prepRates(
          i,
          "property taxes",
          parameters.gbmParameters.propertyTax,
        ),
        condoFeeIncrease: prepRates(
          i,
          "condo fees",
          parameters.gbmParameters.condoFee,
        ),
        fiveYearInterestRates: prepRates(
          i,
          "five year interest rates",
          parameters.gbmParameters.fiveYearInterestRates,
        ),
        fourYearInterestRates: prepRates(
          i,
          "four year interest rates",
          parameters.gbmParameters.fourYearInterestRates,
        ),
        threeYearInterestRates: prepRates(
          i,
          "three year interest rates",
          parameters.gbmParameters.threeYearInterestRates,
        ),
        twoYearInterestRates: prepRates(
          i,
          "two year interest rates",
          parameters.gbmParameters.twoYearInterestRates,
        ),
        oneYearInterestRates: prepRates(
          i,
          "one year interest rates",
          parameters.gbmParameters.oneYearInterestRates,
        ),
        variableInterestRates: prepRates(
          i,
          "variable interest rates",
          parameters.gbmParameters.variableInterestRates,
        ),
        appreciationIncrease: prepRates(
          i,
          "property appreciation",
          parameters.gbmParameters.appreciation,
        ),
        sellingFixedFeesIncrease: prepRates(
          i,
          "selling fixed fees",
          parameters.gbmParameters.sellingFixedFees,
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
    rates,
    winners: winners.sort((a, b) => b.category.localeCompare(a.category)),
  };
}
