import { prettyDuration } from "@nshiab/journalism-format";
import simulateRentVsBuy from "./simulateRentVsBuy.ts";
import { maxIndex } from "d3-array";
import {
  generateCirPath,
  generateGbmPath,
} from "@nshiab/journalism-statistics";

/**
 * Performs a Monte Carlo simulation for a rent versus buy analysis tailored for a Canadian context.
 * This function runs multiple iterations of the `simulateRentVsBuy` function, using stochastic paths
 * for various economic factors like market returns, interest rates, and inflation-related costs.
 * It helps evaluate the probability of different financial outcomes under uncertainty.
 *
 * The simulation uses:
 * - **Geometric Brownian Motion (GBM)** for paths like market returns, rent increases, and home appreciation.
 * - **Cox-Ingersoll-Ross (CIR)** models for interest rate paths.
 *
 * Parameters for these models can be generated from historical data using `getCirParameters` and `getGbmParameters` from `@nshiab/journalism`.
 *
 * @param parameters - The input parameters for the Monte Carlo simulation.
 * @param parameters.iterations - The number of simulation iterations to run.
 * @param parameters.startingYear - The year the simulation begins.
 * @param parameters.numberOfYears - The duration of each simulation in years.
 * @param parameters.tfsaContributions - Whether to prioritize TFSA contributions for investments (tax-free gains).
 * @param parameters.combinedTaxRate - The combined marginal tax rate used for calculating taxes on investment gains.
 * @param parameters.province - The Canadian province or territory, used for calculating sales taxes.
 * @param parameters.renter - Configuration for the renter scenario.
 *   @param parameters.renter.startingMonthlyRent - The initial monthly rent payment.
 *   @param parameters.renter.securityDeposit - The initial security deposit (e.g., last month's rent).
 *   @param parameters.renter.startingMonthlyInsurance - The initial monthly renter's (tenant) insurance cost.
 * @param parameters.buyer - Configuration for the buyer scenarios.
 *   @param parameters.buyer.downPayment - The total down payment amount paid at the start.
 *   @param parameters.buyer.purchasePrice - The initial purchase price of the home.
 *   @param parameters.buyer.fixedRateDiscount - The discount applied to the posted fixed mortgage rate (e.g., `1.5` for 1.5% off).
 *   @param parameters.buyer.variableRateMargin - The margin added or subtracted from the variable mortgage rate.
 *   @param parameters.buyer.purchaseFixedFees - One-time costs at purchase (notary, land transfer tax, etc.).
 *   @param parameters.buyer.startingAnnualMaintenanceCost - Initial annual cost for home maintenance.
 *   @param parameters.buyer.startingAnnualPropertyTax - Initial annual property tax amount.
 *   @param parameters.buyer.startingMonthlyCondoFees - Initial monthly condo fees (if applicable).
 *   @param parameters.buyer.startingMonthlyInsurance - Initial monthly homeowner's insurance cost.
 *   @param parameters.buyer.sellingFixedFees - One-time fixed costs when selling the property (before sales tax).
 *   @param parameters.buyer.sellingCommissionRate - The commission rate paid to real estate agents upon sale (e.g., `0.05` for 5%).
 * @param parameters.gbmParameters - Parameters for the Geometric Brownian Motion models.
 *   Each sub-object (market, rent, etc.) requires:
 *   - `startValue`: The initial annual rate (e.g., 0.05 for 5%).
 *   - `mu`: The drift or expected annual growth rate.
 *   - `sigma`: The annual volatility.
 * @param parameters.gbmParameters.market - Market return rates for savings.
 * @param parameters.gbmParameters.rent - Rent increase rates.
 * @param parameters.gbmParameters.ownerInsurance - Homeowner's insurance increase rates.
 * @param parameters.gbmParameters.renterInsurance - Renter's insurance increase rates.
 * @param parameters.gbmParameters.maintenance - Maintenance cost increase rates.
 * @param parameters.gbmParameters.propertyTax - Property tax increase rates.
 * @param parameters.gbmParameters.condoFee - Condo fee increase rates.
 * @param parameters.gbmParameters.appreciation - Home value appreciation rates.
 * @param parameters.gbmParameters.sellingFixedFees - Selling fixed fees increase rates.
 * @param parameters.gbmParameters.fiveYearInterestRates - Parameters for the CIR model for 5-year fixed rates.
 *   Requires `a` (speed of mean reversion), `b` (long-term mean), `sigma` (volatility), and `startValue`.
 * @param parameters.gbmParameters.fourYearInterestRates - Parameters for the CIR model for 4-year fixed rates.
 * @param parameters.gbmParameters.threeYearInterestRates - Parameters for the CIR model for 3-year fixed rates.
 * @param parameters.gbmParameters.twoYearInterestRates - Parameters for the CIR model for 2-year fixed rates.
 * @param parameters.gbmParameters.oneYearInterestRates - Parameters for the CIR model for 1-year fixed rates.
 * @param parameters.gbmParameters.variableInterestRates - Parameters for the CIR model for variable rates.
 *
 * @param options - Additional simulation options.
 *   @param options.verbose - If `true`, logs the simulation's progress to the console, including the current iteration and estimated time remaining. Useful for long-running simulations.
 *   @param options.verboseStep - The frequency of progress logging. For example, setting this to `50` will log progress every 50 iterations. Defaults to `1` if `verbose` is true.
 *   @param options.values - If `true`, the function will capture and return detailed monthly financial data (such as asset balances and net gains) for every iteration of the simulation. Be cautious with high iteration counts as this can consume significant memory.
 *   @param options.rates - If `true`, the function will capture and return the exact stochastic interest and appreciation rates generated for every iteration. Useful for auditing the simulation's statistical properties.
 *
 * @returns An object containing the simulation results:
 *   - `winners`: An array of objects indicating which scenario yielded the highest final net balance (after house and investment sale) for each iteration.
 *   - `winnersBeforeSelling`: An array of objects indicating which scenario yielded the highest final asset balance (before house and investment sale) for each iteration.
 *   - `values`: (Optional) If `options.values` is `true`, an array of objects containing the generated values paths for each iteration. Each object includes `iteration`, `variable` (e.g., "rent"), `value`, and `month`.
 *   - `rates`: (Optional) If `options.rates` is `true`, an array of objects containing the generated rate paths for each iteration. Each object includes `iteration`, `variable` (e.g., "marketReturnRate"), `value`, and `month`.
 *
 * @example
 * ```ts
 * const results = simulateRentVsBuyMonteCarlo({
 *   iterations: 1000,
 *   startingYear: 2024,
 *   numberOfYears: 25,
 *   tfsaContributions: true,
 *   combinedTaxRate: 0.4,
 *   province: "Ontario",
 *   renter: {
 *     startingMonthlyRent: 1500,
 *     securityDeposit: 1500,
 *     startingMonthlyInsurance: 25,
 *   },
 *   buyer: {
 *     downPayment: 50000,
 *     purchasePrice: 400000,
 *     fixedRateDiscount: 1.0,
 *     variableRateMargin: 0,
 *     purchaseFixedFees: 3000,
 *     startingAnnualMaintenanceCost: 1500,
 *     startingAnnualPropertyTax: 2500,
 *     startingMonthlyCondoFees: 0,
 *     startingMonthlyInsurance: 80,
 *     sellingFixedFees: 1500,
 *     sellingCommissionRate: 0.05,
 *   },
 *   gbmParameters: {
 *     market: { startValue: 0.07, mu: 0.07, sigma: 0.15 },
 *     rent: { startValue: 0.03, mu: 0.03, sigma: 0.02 },
 *     ownerInsurance: { startValue: 0.03, mu: 0.03, sigma: 0.05 },
 *     renterInsurance: { startValue: 0.03, mu: 0.03, sigma: 0.05 },
 *     maintenance: { startValue: 0.02, mu: 0.02, sigma: 0.05 },
 *     propertyTax: { startValue: 0.02, mu: 0.02, sigma: 0.02 },
 *     condoFee: { startValue: 0.03, mu: 0.03, sigma: 0.05 },
 *     appreciation: { startValue: 0.04, mu: 0.04, sigma: 0.10 },
 *     sellingFixedFees: { startValue: 0.02, mu: 0.02, sigma: 0.05 },
 *     fiveYearInterestRates: { startValue: 0.05, a: 0.2, b: 0.05, sigma: 0.02 },
 *     fourYearInterestRates: { startValue: 0.048, a: 0.2, b: 0.048, sigma: 0.02 },
 *     threeYearInterestRates: { startValue: 0.045, a: 0.2, b: 0.045, sigma: 0.02 },
 *     twoYearInterestRates: { startValue: 0.042, a: 0.2, b: 0.042, sigma: 0.02 },
 *     oneYearInterestRates: { startValue: 0.04, a: 0.2, b: 0.04, sigma: 0.02 },
 *     variableInterestRates: { startValue: 0.06, a: 0.3, b: 0.055, sigma: 0.03 },
 *   }
 * }, { verbose: true, verboseStep: 100 });
 *
 * console.log(results.winners.length); // 1000
 * ```
 */
export default function simulateRentVsBuyMonteCarlo(
  parameters: {
    iterations: number;
    startingYear: number;
    numberOfYears: number;
    tfsaContributions: boolean;
    combinedTaxRate: number;
    province:
      | "Alberta"
      | "British Columbia"
      | "Manitoba"
      | "New Brunswick"
      | "Newfoundland and Labrador"
      | "Nova Scotia"
      | "Northwest Territories"
      | "Nunavut"
      | "Ontario"
      | "Prince Edward Island"
      | "Quebec"
      | "Saskatchewan"
      | "Yukon";
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
      maintenance: { startValue: number; mu: number; sigma: number };
      propertyTax: { startValue: number; mu: number; sigma: number };
      condoFee: { startValue: number; mu: number; sigma: number };
      appreciation: { startValue: number; mu: number; sigma: number };
      sellingFixedFees: {
        startValue: number;
        mu: number;
        sigma: number;
      };
      fiveYearInterestRates: {
        a: number;
        b: number;
        sigma: number;
        startValue: number;
      };
      fourYearInterestRates: {
        a: number;
        b: number;
        sigma: number;
        startValue: number;
      };
      threeYearInterestRates: {
        a: number;
        b: number;
        sigma: number;
        startValue: number;
      };
      twoYearInterestRates: {
        a: number;
        b: number;
        sigma: number;
        startValue: number;
      };
      oneYearInterestRates: {
        a: number;
        b: number;
        sigma: number;
        startValue: number;
      };
      variableInterestRates: {
        a: number;
        b: number;
        sigma: number;
        startValue: number;
      };
    };
  },
  options: {
    verbose?: boolean;
    verboseStep?: number;
    values?: boolean;
    rates?: boolean;
  } = {},
): {
  values: {
    iteration: string;
    variable: string;
    value: number;
    month: number;
  }[];
  rates: {
    iteration: string;
    variable: string;
    value: number;
    month: number;
  }[];
  winners: {
    year: number;
    month: number;
    monthIndex: number;
    date: Date;
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
    group: "summaryCumulative";
    variable: "balanceAfterSelling";
  }[];
  winnersBeforeSelling: {
    year: number;
    month: number;
    monthIndex: number;
    date: Date;
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
    group: "summaryCumulative";
    variable: "balance";
  }[];
} {
  const winners = [];
  const winnersBeforeSelling = [];
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

  function prepRatesGbm(
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

  function prepRatesCir(
    iteration: number,
    variable: string,
    params: { startValue: number; a: number; b: number; sigma: number },
  ): number[] {
    // We generate a bit more than the number of months...
    const path = generateCirPath(
      params.startValue,
      params.a,
      params.b,
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

    // For interest rates, we use the actual values generated by the CIR model
    const randomRates = path.slice(0, nbMonths);

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
      province: parameters.province,
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
        marketReturnRate: prepRatesGbm(
          i,
          "S&P/TSX",
          parameters.gbmParameters.market,
        ),
        rentIncrease: prepRatesGbm(
          i,
          "rent",
          parameters.gbmParameters.rent,
        ),
        renterInsuranceIncrease: prepRatesGbm(
          i,
          "renter insurance",
          parameters.gbmParameters.renterInsurance,
        ),
        ownerInsuranceIncrease: prepRatesGbm(
          i,
          "owner insurance",
          parameters.gbmParameters.ownerInsurance,
        ),
        maintenanceIncrease: prepRatesGbm(
          i,
          "maintenance costs",
          parameters.gbmParameters.maintenance,
        ),
        propertyTaxIncrease: prepRatesGbm(
          i,
          "property taxes",
          parameters.gbmParameters.propertyTax,
        ),
        condoFeeIncrease: prepRatesGbm(
          i,
          "condo fees",
          parameters.gbmParameters.condoFee,
        ),
        appreciationIncrease: prepRatesGbm(
          i,
          "property appreciation",
          parameters.gbmParameters.appreciation,
        ),
        sellingFixedFeesIncrease: prepRatesGbm(
          i,
          "selling fixed fees",
          parameters.gbmParameters.sellingFixedFees,
        ),
        fiveYearInterestRates: prepRatesCir(
          i,
          "five year interest rates",
          parameters.gbmParameters.fiveYearInterestRates,
        ),
        fourYearInterestRates: prepRatesCir(
          i,
          "four year interest rates",
          parameters.gbmParameters.fourYearInterestRates,
        ),
        threeYearInterestRates: prepRatesCir(
          i,
          "three year interest rates",
          parameters.gbmParameters.threeYearInterestRates,
        ),
        twoYearInterestRates: prepRatesCir(
          i,
          "two year interest rates",
          parameters.gbmParameters.twoYearInterestRates,
        ),
        oneYearInterestRates: prepRatesCir(
          i,
          "one year interest rates",
          parameters.gbmParameters.oneYearInterestRates,
        ),
        variableInterestRates: prepRatesCir(
          i,
          "variable interest rates",
          parameters.gbmParameters.variableInterestRates,
        ),
      },
    }, { finalBalanceOnly: true });

    const balanceAfterSelling = iterationResults.filter(
      (d) =>
        d.variable === "balanceAfterSelling" && d.group === "summaryCumulative",
    );
    const balanceBeforeSelling = iterationResults.filter(
      (d) => d.variable === "balance" && d.group === "summaryCumulative",
    );

    winners.push(
      balanceAfterSelling[
        maxIndex(
          balanceAfterSelling,
          (d: { amount: number }) => d.amount,
        )
      ],
    );

    winnersBeforeSelling.push(
      balanceBeforeSelling[
        maxIndex(
          balanceBeforeSelling,
          (d: { amount: number }) => d.amount,
        )
      ],
    );
  }

  if (start) {
    prettyDuration(start, { log: true, prefix: "Completed in " });
  }

  // To make the types happy
  const winnersFiltered = winners.filter((d) =>
    d.variable === "balanceAfterSelling" && d.group === "summaryCumulative"
  ) as {
    year: number;
    month: number;
    monthIndex: number;
    date: Date;
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
    group: "summaryCumulative";
    variable: "balanceAfterSelling";
  }[];

  const winnersBeforeSellingFiltered = winnersBeforeSelling.filter((d) =>
    d.variable === "balance" && d.group === "summaryCumulative"
  ) as {
    year: number;
    month: number;
    monthIndex: number;
    date: Date;
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
    group: "summaryCumulative";
    variable: "balance";
  }[];

  return {
    values,
    rates,
    winners: winnersFiltered.sort((a, b) =>
      b.category.localeCompare(a.category)
    ),
    winnersBeforeSelling: winnersBeforeSellingFiltered.sort((a, b) =>
      b.category.localeCompare(a.category)
    ),
  };
}
