import { prettyDuration } from "@nshiab/journalism-format";
import simulateRentVsBuy from "./simulateRentVsBuy.ts";
import { quantile } from "d3-array";
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
 * @param parameters.annualInvestmentFeeRate - Annual investment fee rate (e.g. ETF MER or platform/advisor fee) expressed as a decimal (e.g. `0.0025` for 0.25%). Applied monthly to TFSA and stock portfolio balances using a multiplicative model — the fee is charged on the grown balance. The monthly dollar cost is also tracked as `tfsaFees` and `stocksFees` under `monthlyExpenses` and `cumulativeExpenses` in the output.
 * @param parameters.couple - Whether to simulate investments and taxes for a couple doubling TFSA contribution room and splitting capital gains in 2. Assumes parameter employmentIncome represents the per-partner income.
 * @param parameters.employmentIncome - The employment income used for calculating income taxes on investment gains.
 * @param parameters.province - The Canadian province or territory, used for calculating sales taxes.
 * @param parameters.renter - Configuration for the renter scenario.
 *   @param parameters.renter.startingMonthlyRent - The initial monthly rent payment.
 *   @param parameters.renter.securityDeposit - The initial security deposit or last month's rent (scenario-dependent).
 *   @param parameters.renter.startingMonthlyInsurance - The initial monthly renter's (tenant) insurance cost.
 * @param parameters.buyer - Configuration for the buyer scenarios.
 *   @param parameters.buyer.downPayment - The total down payment amount paid at the start.
 *   @param parameters.buyer.purchasePrice - The initial purchase price of the home.
 *   @param parameters.buyer.fixedRateAdjustment - The adjustment applied to the posted fixed mortgage rate (added to the posted rate).
 *   @param parameters.buyer.variableRateAdjustment - The adjustment applied to the variable mortgage rate (added to the posted rate).
 *   @param parameters.buyer.purchaseFixedFees - One-time costs at purchase (notary, land transfer tax, etc.).
 *   @param parameters.buyer.startingAnnualMaintenanceCost - Initial annual cost for home maintenance.
 *   @param parameters.buyer.startingAnnualPropertyTax - Initial annual property tax amount.
 *   @param parameters.buyer.startingMonthlyCondoFees - Initial monthly condo fees (if applicable).
 *   @param parameters.buyer.startingMonthlyInsurance - Initial monthly homeowner's insurance cost.
 *   @param parameters.buyer.sellingFixedFees - One-time fixed costs when selling the property (before sales tax).
 *   @param parameters.buyer.sellingCommissionRate - The commission rate paid to real estate agents upon sale (e.g., `0.05` for 5%).
 *   @param parameters.buyer.floorRate - The minimum interest rate (posted + adjustment) for mortgages.
 * @param parameters.stochasticParameters - Parameters for the stochastic models.
 *   For growth rates (market, rent, etc.), uses **Geometric Brownian Motion (GBM)**:
 *   - `startValue`: The initial annual rate (e.g., 0.05 for 5%).
 *   - `mu`: The drift or expected annual growth rate.
 *   - `sigma`: The annual volatility.
 *
 *   For interest rates (fiveYear, variable, etc.), uses **Cox-Ingersoll-Ross (CIR)**:
 *   - `startValue`: The initial annual interest rate.
 *   - `a`: Speed of mean reversion.
 *   - `b`: Long-term mean.
 *   - `sigma`: Annual volatility.
 *
 * @param parameters.stochasticParameters.market - Market return rates for savings (GBM).
 * @param parameters.stochasticParameters.rent - Rent increase rates (GBM).
 * @param parameters.stochasticParameters.ownerInsurance - Homeowner's insurance increase rates (GBM).
 * @param parameters.stochasticParameters.renterInsurance - Renter's insurance increase rates (GBM).
 * @param parameters.stochasticParameters.maintenance - Maintenance cost increase rates (GBM).
 * @param parameters.stochasticParameters.propertyTax - Property tax increase rates (GBM).
 * @param parameters.stochasticParameters.condoFee - Condo fee increase rates (GBM).
 * @param parameters.stochasticParameters.appreciation - Home value appreciation rates (GBM).
 * @param parameters.stochasticParameters.sellingFixedFees - Selling fixed fees increase rates (GBM).
 * @param parameters.stochasticParameters.fiveYearInterestRates - 5-year fixed interest rates (CIR).
 * @param parameters.stochasticParameters.fourYearInterestRates - 4-year fixed interest rates (CIR).
 * @param parameters.stochasticParameters.threeYearInterestRates - 3-year fixed interest rates (CIR).
 * @param parameters.stochasticParameters.twoYearInterestRates - 2-year fixed interest rates (CIR).
 * @param parameters.stochasticParameters.oneYearInterestRates - 1-year fixed interest rates (CIR).
 * @param parameters.stochasticParameters.variableInterestRates - Variable interest rates (CIR).
 *
 * @param options - Additional simulation options.
 *   @param options.verbose - If `true`, logs the simulation's progress to the console, including the current iteration and estimated time remaining. Useful for long-running simulations.
 *   @param options.verboseStep - The frequency of progress logging. For example, setting this to `50` will log progress every 50 iterations. Defaults to `1`.
 *   @param options.values - If `true`, the function will capture and return detailed monthly financial data (such as asset balances and net gains) for every iteration of the simulation. Be cautious with high iteration counts as this can consume significant memory.
 *   @param options.rates - If `true`, the function will capture and return the exact stochastic interest and appreciation rates generated for every iteration. Useful for auditing the simulation's statistical properties.
 *   @param options.monthlyQuantiles - If `true`, the function will compute and return P10/P50/P90 quantile summaries for every variable, group, and category across all simulation months. Each record in the returned `monthlyQuantiles` array is in wide format: `{ category, group, variable, monthIndex, year, month, date, q10, q50, q90 }`. Useful for charting the probable range of any financial variable over time (e.g. rent payments, cumulative balance). Note that enabling this option runs `simulateRentVsBuy` with full monthly output instead of final-balance-only, which increases per-iteration cost.
 *
 * @returns An object containing the simulation results:
 *   - `winners`: An array of objects indicating which scenario yielded the highest final net balance (after house and investment sale) for each iteration. Each object includes the `amount`, `category` (renter, buyerFixed, buyerVariable), and the `iteration` details.
 *   - `winnersBeforeSelling`: An array of objects indicating which scenario yielded the highest final asset balance (before house and investment sale) for each iteration. Contains similar details to `winners`.
 *   - `values`: An array of objects containing the generated values paths for each iteration. Returns an empty array unless `options.values` is `true`.
 *   - `rates`: An array of objects containing the generated rate paths for each iteration. Returns an empty array unless `options.rates` is `true`.
 *   - `monthlyQuantiles`: An array of wide-format quantile records (one per `{ category, group, variable, monthIndex }` combination) with fields `q10`, `q50`, and `q90` representing the 10th, 50th, and 90th percentiles of that variable's amount across all iterations for that month. Returns an empty array unless `options.monthlyQuantiles` is `true`.
 *
 * @example
 * ```ts
 * const results = simulateRentVsBuyMonteCarlo({
 *   iterations: 1000,
 *   startingYear: 2024,
 *   numberOfYears: 25,
 *   tfsaContributions: true,
 *   annualInvestmentFeeRate: 0.0025,
 *   couple: false,
 *   employmentIncome: 80000,
 *   province: "Ontario",
 *   renter: {
 *     startingMonthlyRent: 1500,
 *     securityDeposit: 1500,
 *     startingMonthlyInsurance: 25,
 *   },
 *   buyer: {
 *     downPayment: 50000,
 *     purchasePrice: 400000,
 *     fixedRateAdjustment: -0.01,
 *     variableRateAdjustment: 0,
 *     purchaseFixedFees: 3000,
 *     startingAnnualMaintenanceCost: 1500,
 *     startingAnnualPropertyTax: 2500,
 *     startingMonthlyCondoFees: 0,
 *     startingMonthlyInsurance: 80,
 *     sellingFixedFees: 1500,
 *     sellingCommissionRate: 0.05,
 *     floorRate: 0,
 *   },
 *   stochasticParameters: {
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
    annualInvestmentFeeRate: number;
    couple: boolean;
    employmentIncome: number;
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
      fixedRateAdjustment: number;
      variableRateAdjustment: number;
      purchaseFixedFees: number;
      startingAnnualMaintenanceCost: number;
      startingAnnualPropertyTax: number;
      startingMonthlyCondoFees: number;
      startingMonthlyInsurance: number;
      sellingFixedFees: number;
      sellingCommissionRate: number;
      floorRate: number;
    };
    stochasticParameters: {
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
    monthlyQuantiles?: boolean;
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
  monthlyQuantiles: {
    category: "renter" | "buyerFixed" | "buyerVariable";
    group:
      | "monthlyExpenses"
      | "cumulativeExpenses"
      | "monthlyGains"
      | "cumulativeGains"
      | "assets"
      | "summary"
      | "summaryCumulative"
      | "saleCosts"
      | "saleNetGains";
    variable:
      | "rent"
      | "insurance"
      | "securityDeposit"
      | "mortgageCapital"
      | "mortgageInterests"
      | "maintenance"
      | "propertyTax"
      | "condoFees"
      | "downPayment"
      | "purchaseFixedFees"
      | "insurancePremium"
      | "tfsaFees"
      | "stocksFees"
      | "tfsaGains"
      | "tfsaContribution"
      | "stocksGains"
      | "newStocks"
      | "homeEquityGains"
      | "tfsa"
      | "stocks"
      | "homeEquity"
      | "balance"
      | "balanceAfterSelling"
      | "stockTaxes"
      | "homeSellingCommission"
      | "homeSellingFixedFees"
      | "mortgagePenalty"
      | "mortgageBalance"
      | "stockSellingGains"
      | "tfsaSellingGains"
      | "homeSellingGains";
    monthIndex: number;
    year: number;
    month: number;
    date: Date;
    q10: number;
    q50: number;
    q90: number;
  }[];
} {
  const winners: {
    year: number;
    month: number;
    monthIndex: number;
    date: Date;
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
    group: "summaryCumulative";
    variable: "balanceAfterSelling";
  }[] = [];
  const winnersBeforeSelling: {
    year: number;
    month: number;
    monthIndex: number;
    date: Date;
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
    group: "summaryCumulative";
    variable: "balance";
  }[] = [];
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

  // Pre-compute dates once — reused in the post-loop quantile output.
  const dates: Date[] = Array.from(
    { length: nbMonths },
    (_, mi) =>
      new Date(
        Date.UTC(
          parameters.startingYear + Math.floor(mi / 12),
          mi % 12,
          1,
        ),
      ),
  );

  // Float64Array buckets: pre-sized to `iterations`, avoids dynamic resizing.
  const buckets: Map<string, Float64Array[]> | null = options.monthlyQuantiles
    ? new Map<string, Float64Array[]>()
    : null;

  // onRecord streams values directly into buckets, bypassing result-object
  // allocation in toResults. currentI is updated at the start of
  // each iteration so the closure always writes to the correct column.
  let currentI = 0;
  const onRecord = buckets
    ? (
      cat: string,
      grp: string,
      vr: string,
      mi: number,
      amt: number,
    ) => {
      const key = `${cat}|${grp}|${vr}`;
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = Array.from(
          { length: nbMonths },
          () => new Float64Array(parameters.iterations),
        );
        buckets.set(key, bucket);
      }
      bucket[mi][currentI] = amt;
    }
    : undefined;

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
      const iterStr = iteration.toString();
      for (let i = 0; i < nbMonths; i++) {
        values.push({ iteration: iterStr, variable, value: path[i], month: i });
      }
    }

    // So we can compute the monthly returns, which is what we need for the simulation
    const randomRates = new Array<number>(nbMonths);
    for (let i = 0; i < nbMonths; i++) {
      randomRates[i] = (path[i + 1] - path[i]) / path[i];
    }
    if (options.rates) {
      const iterStr = iteration.toString();
      for (let i = 0; i < nbMonths; i++) {
        rates.push({
          iteration: iterStr,
          variable,
          value: randomRates[i],
          month: i,
        });
      }
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
      const iterStr = iteration.toString();
      for (let i = 0; i < nbMonths; i++) {
        values.push({ iteration: iterStr, variable, value: path[i], month: i });
      }
    }

    // For interest rates, we use the actual values generated by the CIR model
    const randomRates = path.slice(0, nbMonths);

    if (options.rates) {
      const iterStr = iteration.toString();
      for (let i = 0; i < nbMonths; i++) {
        rates.push({
          iteration: iterStr,
          variable,
          value: randomRates[i],
          month: i,
        });
      }
    }

    return randomRates;
  }

  const start = options.verbose ? Date.now() : null;
  const verboseStep = options.verboseStep || 1;
  for (let i = 0; i < parameters.iterations; i++) {
    currentI = i;
    if (options.verbose && i % verboseStep === 0) {
      console.log(`Simulation ${i} / ${parameters.iterations}`);
    }

    const iterationResults = simulateRentVsBuy({
      startingYear: parameters.startingYear,
      numberOfYears: parameters.numberOfYears,
      tfsaContributions: parameters.tfsaContributions,
      couple: parameters.couple,
      employmentIncome: parameters.employmentIncome,
      province: parameters.province,
      renter: {
        startingMonthlyRent: parameters.renter.startingMonthlyRent,
        securityDeposit: parameters.renter.securityDeposit,
        startingMonthlyInsurance: parameters.renter.startingMonthlyInsurance,
      },
      buyer: {
        downPayment: parameters.buyer.downPayment,
        purchasePrice: parameters.buyer.purchasePrice,
        fixedRateAdjustment: parameters.buyer.fixedRateAdjustment,
        variableRateAdjustment: parameters.buyer.variableRateAdjustment,
        purchaseFixedFees: parameters.buyer.purchaseFixedFees,
        startingAnnualMaintenanceCost:
          parameters.buyer.startingAnnualMaintenanceCost,
        startingAnnualPropertyTax: parameters.buyer.startingAnnualPropertyTax,
        startingMonthlyCondoFees: parameters.buyer.startingMonthlyCondoFees,
        startingMonthlyInsurance: parameters.buyer.startingMonthlyInsurance,
        sellingFixedFees: parameters.buyer.sellingFixedFees,
        sellingCommissionRate: parameters.buyer.sellingCommissionRate,
        floorRate: parameters.buyer.floorRate,
      },
      annualInvestmentFeeRate: parameters.annualInvestmentFeeRate,
      rates: {
        marketReturnRate: prepRatesGbm(
          i,
          "market returns",
          parameters.stochasticParameters.market,
        ),
        rentIncrease: prepRatesGbm(
          i,
          "rent",
          parameters.stochasticParameters.rent,
        ),
        renterInsuranceIncrease: prepRatesGbm(
          i,
          "renter insurance",
          parameters.stochasticParameters.renterInsurance,
        ),
        ownerInsuranceIncrease: prepRatesGbm(
          i,
          "owner insurance",
          parameters.stochasticParameters.ownerInsurance,
        ),
        maintenanceIncrease: prepRatesGbm(
          i,
          "maintenance costs",
          parameters.stochasticParameters.maintenance,
        ),
        propertyTaxIncrease: prepRatesGbm(
          i,
          "property taxes",
          parameters.stochasticParameters.propertyTax,
        ),
        condoFeeIncrease: prepRatesGbm(
          i,
          "condo fees",
          parameters.stochasticParameters.condoFee,
        ),
        appreciationIncrease: prepRatesGbm(
          i,
          "property appreciation",
          parameters.stochasticParameters.appreciation,
        ),
        sellingFixedFeesIncrease: prepRatesGbm(
          i,
          "selling fixed fees",
          parameters.stochasticParameters.sellingFixedFees,
        ),
        fiveYearInterestRates: prepRatesCir(
          i,
          "five year interest rates",
          parameters.stochasticParameters.fiveYearInterestRates,
        ),
        fourYearInterestRates: prepRatesCir(
          i,
          "four year interest rates",
          parameters.stochasticParameters.fourYearInterestRates,
        ),
        threeYearInterestRates: prepRatesCir(
          i,
          "three year interest rates",
          parameters.stochasticParameters.threeYearInterestRates,
        ),
        twoYearInterestRates: prepRatesCir(
          i,
          "two year interest rates",
          parameters.stochasticParameters.twoYearInterestRates,
        ),
        oneYearInterestRates: prepRatesCir(
          i,
          "one year interest rates",
          parameters.stochasticParameters.oneYearInterestRates,
        ),
        variableInterestRates: prepRatesCir(
          i,
          "variable interest rates",
          parameters.stochasticParameters.variableInterestRates,
        ),
      },
    }, { finalBalanceOnly: !options.monthlyQuantiles, onRecord });

    // With finalBalanceOnly the results array always has exactly 6 entries in a
    // fixed order: [renter/afterSelling, renter/balance, buyerFixed/afterSelling,
    // buyerFixed/balance, buyerVariable/afterSelling, buyerVariable/balance].
    // Avoid .filter() by accessing known indices directly.
    const r0 = iterationResults[0]; // renter balanceAfterSelling
    const r2 = iterationResults[2]; // buyerFixed balanceAfterSelling
    const r4 = iterationResults[4]; // buyerVariable balanceAfterSelling
    if (r0.amount >= r2.amount && r0.amount >= r4.amount) {
      winners.push(r0 as typeof winners[0]);
    } else if (r2.amount >= r4.amount) {
      winners.push(r2 as typeof winners[0]);
    } else {
      winners.push(r4 as typeof winners[0]);
    }

    const r1 = iterationResults[1]; // renter balance
    const r3 = iterationResults[3]; // buyerFixed balance
    const r5 = iterationResults[5]; // buyerVariable balance
    if (r1.amount >= r3.amount && r1.amount >= r5.amount) {
      winnersBeforeSelling.push(r1 as typeof winnersBeforeSelling[0]);
    } else if (r3.amount >= r5.amount) {
      winnersBeforeSelling.push(r3 as typeof winnersBeforeSelling[0]);
    } else {
      winnersBeforeSelling.push(r5 as typeof winnersBeforeSelling[0]);
    }
  }

  const monthlyQuantilesResult: {
    category: "renter" | "buyerFixed" | "buyerVariable";
    group:
      | "monthlyExpenses"
      | "cumulativeExpenses"
      | "monthlyGains"
      | "cumulativeGains"
      | "assets"
      | "summary"
      | "summaryCumulative"
      | "saleCosts"
      | "saleNetGains";
    variable:
      | "rent"
      | "insurance"
      | "securityDeposit"
      | "mortgageCapital"
      | "mortgageInterests"
      | "maintenance"
      | "propertyTax"
      | "condoFees"
      | "downPayment"
      | "purchaseFixedFees"
      | "insurancePremium"
      | "tfsaFees"
      | "stocksFees"
      | "tfsaGains"
      | "tfsaContribution"
      | "stocksGains"
      | "newStocks"
      | "homeEquityGains"
      | "tfsa"
      | "stocks"
      | "homeEquity"
      | "balance"
      | "balanceAfterSelling"
      | "stockTaxes"
      | "homeSellingCommission"
      | "homeSellingFixedFees"
      | "mortgagePenalty"
      | "mortgageBalance"
      | "stockSellingGains"
      | "tfsaSellingGains"
      | "homeSellingGains";
    monthIndex: number;
    year: number;
    month: number;
    date: Date;
    q10: number;
    q50: number;
    q90: number;
  }[] = [];

  if (buckets) {
    const startQuantiles = options.verbose ? Date.now() : null;
    for (const [key, slots] of buckets) {
      const [category, group, variable] = key.split("|");
      for (let monthIndex = 0; monthIndex < nbMonths; monthIndex++) {
        // Float64Array.sort() with no comparator sorts numerically (native code).
        const sorted = slots[monthIndex].slice().sort();
        const year = parameters.startingYear + Math.floor(monthIndex / 12);
        const month = monthIndex % 12;
        monthlyQuantilesResult.push({
          category: category as "renter" | "buyerFixed" | "buyerVariable",
          group: group as
            | "monthlyExpenses"
            | "cumulativeExpenses"
            | "monthlyGains"
            | "cumulativeGains"
            | "assets"
            | "summary"
            | "summaryCumulative"
            | "saleCosts"
            | "saleNetGains",
          variable: variable as
            | "rent"
            | "insurance"
            | "securityDeposit"
            | "mortgageCapital"
            | "mortgageInterests"
            | "maintenance"
            | "propertyTax"
            | "condoFees"
            | "downPayment"
            | "purchaseFixedFees"
            | "insurancePremium"
            | "tfsaFees"
            | "stocksFees"
            | "tfsaGains"
            | "tfsaContribution"
            | "stocksGains"
            | "newStocks"
            | "homeEquityGains"
            | "tfsa"
            | "stocks"
            | "homeEquity"
            | "balance"
            | "balanceAfterSelling"
            | "stockTaxes"
            | "homeSellingCommission"
            | "homeSellingFixedFees"
            | "mortgagePenalty"
            | "mortgageBalance"
            | "stockSellingGains"
            | "tfsaSellingGains"
            | "homeSellingGains",
          monthIndex,
          year,
          month,
          date: dates[monthIndex],
          q10: Math.round((quantile(sorted, 0.1) ?? 0) * 100) / 100,
          q50: Math.round((quantile(sorted, 0.5) ?? 0) * 100) / 100,
          q90: Math.round((quantile(sorted, 0.9) ?? 0) * 100) / 100,
        });
      }
    }
    if (startQuantiles) {
      prettyDuration(startQuantiles, {
        log: true,
        prefix: "Computed quantiles in ",
      });
    }
  }

  // Winners are already the correct entries, just cast and sort.
  const winnersFiltered = winners as {
    year: number;
    month: number;
    monthIndex: number;
    date: Date;
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
    group: "summaryCumulative";
    variable: "balanceAfterSelling";
  }[];

  const winnersBeforeSellingFiltered = winnersBeforeSelling as {
    year: number;
    month: number;
    monthIndex: number;
    date: Date;
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
    group: "summaryCumulative";
    variable: "balance";
  }[];

  const winnersSorted = winnersFiltered.sort((a, b) =>
    b.category.localeCompare(a.category)
  );
  const winnersBeforeSellingSorted = winnersBeforeSellingFiltered.sort((a, b) =>
    b.category.localeCompare(a.category)
  );

  if (start) {
    prettyDuration(start, { log: true, prefix: "Completed in " });
  }

  return {
    values,
    rates,
    winners: winnersSorted,
    winnersBeforeSelling: winnersBeforeSellingSorted,
    monthlyQuantiles: monthlyQuantilesResult,
  };
}
