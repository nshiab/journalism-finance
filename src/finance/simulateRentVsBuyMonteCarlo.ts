import { prettyDuration } from "@nshiab/journalism-format";
import simulateRentVsBuy from "./simulateRentVsBuy.ts";
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
 *   @param parameters.renter.securityDeposit - The initial security deposit or last month's rent (scenario-dependent).
 * @param parameters.buyer - Configuration for the buyer scenarios.
 *   @param parameters.buyer.downPayment - The total down payment amount paid at the start.
 *   @param parameters.buyer.fixedRateAdjustment - The adjustment applied to the posted fixed mortgage rate (added to the posted rate).
 *   @param parameters.buyer.variableRateAdjustment - The adjustment applied to the variable mortgage rate (added to the posted rate).
 *   @param parameters.buyer.purchaseFixedFees - One-time costs at purchase (notary, land transfer tax, etc.).
 *   @param parameters.buyer.sellingCommissionRate - The commission rate paid to real estate agents upon sale (e.g., `0.05` for 5%).
 *   @param parameters.buyer.floorRate - The minimum interest rate (posted + adjustment) for mortgages.
 * @param parameters.stochasticParameters - Parameters for the stochastic models.
 *   For all parameters (market return rate, dollar amounts, interest rates), use:
 *   - `initialValue`: The starting value (e.g., `0.07` for 7% market return, `1500` for $1,500 monthly rent, or `0.05` for a 5% interest rate).
 *
 *   For **Geometric Brownian Motion (GBM)** models (market, rent, expenses, appreciation):
 *   - `mu`: The drift or expected annual growth rate.
 *   - `sigma`: The annual volatility.
 *
 *   For **Cox-Ingersoll-Ross (CIR)** models (interest rates):
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
 *   @param options.monthlyQuantiles - Pass an array of stat names to compute and return per-month summaries for every variable, group, and category. Available stats: `"q10"` (10th percentile), `"q50"` (median), `"q90"` (90th percentile), `"min"` (minimum), `"max"` (maximum). Only the requested fields will be present on each record; all others will be `undefined`. For example, `["q10", "q50", "q90"]` reproduces the classic P10/P50/P90 output, while `["min", "max"]` returns only the range. Each record in the returned `monthlyQuantiles` array is in wide format: `{ category, group, variable, monthIndex, ...requestedStats }`. Note that enabling this option runs `simulateRentVsBuy` with full monthly output instead of final-balance-only, which increases per-iteration cost.
 *   @param options.monthlyIterations - If `true`, captures and returns the raw monthly financial data for every variable, group, and category for each individual iteration. Each record includes `iteration` (0-based index), `category`, `group`, `variable`, `monthIndex`, and `amount`. This is the un-aggregated counterpart to `monthlyQuantiles` — useful for custom analysis or visualization of individual paths. Be aware that this can produce a very large number of records (iterations × months × ~50 variables × 3 categories), so use with caution at high iteration counts. Like `monthlyQuantiles`, enabling this option forces full monthly output instead of final-balance-only per iteration.
 *
 * @returns An object containing the simulation results:
 *   - `winners`: An array of objects indicating which scenario yielded the highest final net balance (after house and investment sale) for each iteration. Each object includes the `amount`, `category` (renter, buyerFixed, buyerVariable), and the `iteration` details.
 *   - `winnersBeforeSelling`: An array of objects indicating which scenario yielded the highest final asset balance (before house and investment sale) for each iteration. Contains similar details to `winners`.
 *   - `values`: An array of objects containing the generated values paths for each iteration. Returns an empty array unless `options.values` is `true`.
 *   - `rates`: An array of objects containing the generated rate paths for each iteration. Returns an empty array unless `options.rates` is `true`.
 *   - `monthlyQuantiles`: An array of wide-format records (one per `{ category, group, variable, monthIndex }` combination). Only the stat fields listed in `options.monthlyQuantiles` are present on each record (`q10?`, `q50?`, `q90?`, `min?`, `max?`); all others are `undefined`. Returns an empty array unless `options.monthlyQuantiles` is provided.
 *   - `monthlyIterations`: An array of records containing the raw monthly financial data for every variable, group, and category per iteration. Returns an empty array unless `options.monthlyIterations` is `true`.
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
 *     securityDeposit: 1500,
 *   },
 *   buyer: {
 *     downPayment: 50000,
 *     fixedRateAdjustment: -0.01,
 *     variableRateAdjustment: 0,
 *     purchaseFixedFees: 3000,
 *     sellingCommissionRate: 0.05,
 *     floorRate: 0,
 *   },
 *   stochasticParameters: {
 *     market: { initialValue: 0.07, mu: 0.07, sigma: 0.15 },
 *     rent: { initialValue: 1500, mu: 0.03, sigma: 0.02 },
 *     ownerInsurance: { initialValue: 80, mu: 0.03, sigma: 0.05 },
 *     renterInsurance: { initialValue: 25, mu: 0.03, sigma: 0.05 },
 *     maintenance: { initialValue: 1500, mu: 0.02, sigma: 0.05 },
 *     propertyTax: { initialValue: 2500, mu: 0.02, sigma: 0.02 },
 *     condoFee: { initialValue: 0, mu: 0.03, sigma: 0.05 },
 *     appreciation: { initialValue: 400000, mu: 0.04, sigma: 0.10 },
 *     sellingFixedFees: { initialValue: 1500, mu: 0.02, sigma: 0.05 },
 *     fiveYearInterestRates: { initialValue: 0.05, a: 0.2, b: 0.05, sigma: 0.02 },
 *     fourYearInterestRates: { initialValue: 0.048, a: 0.2, b: 0.048, sigma: 0.02 },
 *     threeYearInterestRates: { initialValue: 0.045, a: 0.2, b: 0.045, sigma: 0.02 },
 *     twoYearInterestRates: { initialValue: 0.042, a: 0.2, b: 0.042, sigma: 0.02 },
 *     oneYearInterestRates: { initialValue: 0.04, a: 0.2, b: 0.04, sigma: 0.02 },
 *     variableInterestRates: { initialValue: 0.06, a: 0.3, b: 0.055, sigma: 0.03 },
 *   }
 * }, { verbose: true, verboseStep: 100 });
 *
 * console.log(results.winners.length); // 1000
 * ```
 *
 * @example
 * ```ts
 * // With monthly P10/P50/P90 quantiles plus min/max range
 * const results = simulateRentVsBuyMonteCarlo({ ...parameters }, {
 *   monthlyQuantiles: ["q10", "q50", "q90", "min", "max"],
 * });
 *
 * const renterBalance = results.monthlyQuantiles.filter(
 *   (d) => d.category === "renter" && d.group === "summaryCumulative" && d.variable === "balance"
 * );
 * console.log(renterBalance[0]); // { category: "renter", ..., q10: ..., q50: ..., q90: ..., min: ..., max: ... }
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
      securityDeposit: number;
    };
    buyer: {
      downPayment: number;
      fixedRateAdjustment: number;
      variableRateAdjustment: number;
      purchaseFixedFees: number;
      sellingCommissionRate: number;
      floorRate: number;
    };
    stochasticParameters: {
      market: { initialValue: number; mu: number; sigma: number };
      rent: { initialValue: number; mu: number; sigma: number };
      ownerInsurance: { initialValue: number; mu: number; sigma: number };
      renterInsurance: {
        initialValue: number;
        mu: number;
        sigma: number;
      };
      maintenance: { initialValue: number; mu: number; sigma: number };
      propertyTax: { initialValue: number; mu: number; sigma: number };
      condoFee: { initialValue: number; mu: number; sigma: number };
      appreciation: { initialValue: number; mu: number; sigma: number };
      sellingFixedFees: {
        initialValue: number;
        mu: number;
        sigma: number;
      };
      fiveYearInterestRates: {
        a: number;
        b: number;
        sigma: number;
        initialValue: number;
      };
      fourYearInterestRates: {
        a: number;
        b: number;
        sigma: number;
        initialValue: number;
      };
      threeYearInterestRates: {
        a: number;
        b: number;
        sigma: number;
        initialValue: number;
      };
      twoYearInterestRates: {
        a: number;
        b: number;
        sigma: number;
        initialValue: number;
      };
      oneYearInterestRates: {
        a: number;
        b: number;
        sigma: number;
        initialValue: number;
      };
      variableInterestRates: {
        a: number;
        b: number;
        sigma: number;
        initialValue: number;
      };
    };
  },
  options: {
    verbose?: boolean;
    verboseStep?: number;
    values?: boolean;
    rates?: boolean;
    monthlyQuantiles?: Array<"q10" | "q50" | "q90" | "min" | "max">;
    monthlyIterations?: boolean;
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
    monthIndex: number;
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
    group: "summaryCumulative";
    variable: "balanceAfterSelling";
  }[];
  winnersBeforeSelling: {
    monthIndex: number;
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
      | "saleNetGains"
      | "totals";
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
      | "homeSellingGains"
      | "monthlyExpenses"
      | "cumulativeExpenses"
      | "monthlyGains"
      | "cumulativeGains"
      | "assets"
      | "saleCosts"
      | "saleNetGains";
    monthIndex: number;
    q10?: number;
    q50?: number;
    q90?: number;
    min?: number;
    max?: number;
  }[];
  monthlyIterations: {
    iteration: number;
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
      | "saleNetGains"
      | "totals";
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
      | "homeSellingGains"
      | "monthlyExpenses"
      | "cumulativeExpenses"
      | "monthlyGains"
      | "cumulativeGains"
      | "assets"
      | "saleCosts"
      | "saleNetGains";
    monthIndex: number;
    amount: number;
  }[];
} {
  const winners: {
    monthIndex: number;
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
    group: "summaryCumulative";
    variable: "balanceAfterSelling";
  }[] = [];
  const winnersBeforeSelling: {
    monthIndex: number;
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

  const statsSet = new Set(options.monthlyQuantiles ?? []);

  // Float64Array buckets: pre-sized to `iterations`, avoids dynamic resizing.
  const buckets: Map<string, Float64Array[]> | null = options.monthlyQuantiles
    ? new Map<string, Float64Array[]>()
    : null;

  // Raw per-iteration monthly records, populated when options.monthlyIterations is true.
  const monthlyIterationsResult: {
    iteration: number;
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
      | "saleNetGains"
      | "totals";
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
      | "homeSellingGains"
      | "monthlyExpenses"
      | "cumulativeExpenses"
      | "monthlyGains"
      | "cumulativeGains"
      | "assets"
      | "saleCosts"
      | "saleNetGains";
    monthIndex: number;
    amount: number;
  }[] | null = options.monthlyIterations ? [] : null;

  // onRecord streams values directly into buckets and/or monthlyIterationsResult,
  // bypassing result-object allocation in toResults. currentI is updated at the
  // start of each iteration so the closure always writes to the correct column.
  let currentI = 0;
  const onRecord = (buckets || monthlyIterationsResult)
    ? (
      cat: string,
      grp: string,
      vr: string,
      mi: number,
      amt: number,
    ) => {
      if (buckets) {
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
      if (monthlyIterationsResult) {
        monthlyIterationsResult.push({
          iteration: currentI,
          category: cat as "renter" | "buyerFixed" | "buyerVariable",
          group: grp as
            | "monthlyExpenses"
            | "cumulativeExpenses"
            | "monthlyGains"
            | "cumulativeGains"
            | "assets"
            | "summary"
            | "summaryCumulative"
            | "saleCosts"
            | "saleNetGains"
            | "totals",
          variable: vr as
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
            | "homeSellingGains"
            | "monthlyExpenses"
            | "cumulativeExpenses"
            | "monthlyGains"
            | "cumulativeGains"
            | "assets"
            | "saleCosts"
            | "saleNetGains",
          monthIndex: mi,
          amount: amt,
        });
      }
    }
    : undefined;

  function prepRatesGbm(
    iteration: number,
    variable: string,
    params: { initialValue: number; mu: number; sigma: number },
  ): number[] {
    // If the initial value is 0 there is nothing to grow; return zero rates.
    if (params.initialValue === 0) {
      return new Array<number>(nbMonths).fill(0);
    }
    // We generate a bit more than the number of months...
    const path = generateGbmPath(
      params.initialValue,
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
    params: { initialValue: number; a: number; b: number; sigma: number },
  ): number[] {
    // We generate a bit more than the number of months...
    const path = generateCirPath(
      params.initialValue,
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
        startingMonthlyRent: parameters.stochasticParameters.rent.initialValue,
        securityDeposit: parameters.renter.securityDeposit,
        startingMonthlyInsurance:
          parameters.stochasticParameters.renterInsurance.initialValue,
      },
      buyer: {
        downPayment: parameters.buyer.downPayment,
        purchasePrice:
          parameters.stochasticParameters.appreciation.initialValue,
        fixedRateAdjustment: parameters.buyer.fixedRateAdjustment,
        variableRateAdjustment: parameters.buyer.variableRateAdjustment,
        purchaseFixedFees: parameters.buyer.purchaseFixedFees,
        startingAnnualMaintenanceCost:
          parameters.stochasticParameters.maintenance.initialValue,
        startingAnnualPropertyTax:
          parameters.stochasticParameters.propertyTax.initialValue,
        startingMonthlyCondoFees:
          parameters.stochasticParameters.condoFee.initialValue,
        startingMonthlyInsurance:
          parameters.stochasticParameters.ownerInsurance.initialValue,
        sellingFixedFees:
          parameters.stochasticParameters.sellingFixedFees.initialValue,
        sellingCommissionRate: parameters.buyer.sellingCommissionRate,
        floorRate: parameters.buyer.floorRate,
      },
      annualInvestmentFeeRate: parameters.annualInvestmentFeeRate,
      rates: {
        marketReturnRate: prepRatesGbm(
          i,
          "market returns",
          {
            initialValue: parameters.stochasticParameters.market.initialValue,
            mu: parameters.stochasticParameters.market.mu,
            sigma: parameters.stochasticParameters.market.sigma,
          },
        ),
        rentIncrease: prepRatesGbm(
          i,
          "rent",
          {
            initialValue: parameters.stochasticParameters.rent.initialValue,
            mu: parameters.stochasticParameters.rent.mu,
            sigma: parameters.stochasticParameters.rent.sigma,
          },
        ),
        renterInsuranceIncrease: prepRatesGbm(
          i,
          "renter insurance",
          {
            initialValue:
              parameters.stochasticParameters.renterInsurance.initialValue,
            mu: parameters.stochasticParameters.renterInsurance.mu,
            sigma: parameters.stochasticParameters.renterInsurance.sigma,
          },
        ),
        ownerInsuranceIncrease: prepRatesGbm(
          i,
          "owner insurance",
          {
            initialValue:
              parameters.stochasticParameters.ownerInsurance.initialValue,
            mu: parameters.stochasticParameters.ownerInsurance.mu,
            sigma: parameters.stochasticParameters.ownerInsurance.sigma,
          },
        ),
        maintenanceIncrease: prepRatesGbm(
          i,
          "maintenance costs",
          {
            initialValue:
              parameters.stochasticParameters.maintenance.initialValue,
            mu: parameters.stochasticParameters.maintenance.mu,
            sigma: parameters.stochasticParameters.maintenance.sigma,
          },
        ),
        propertyTaxIncrease: prepRatesGbm(
          i,
          "property taxes",
          {
            initialValue:
              parameters.stochasticParameters.propertyTax.initialValue,
            mu: parameters.stochasticParameters.propertyTax.mu,
            sigma: parameters.stochasticParameters.propertyTax.sigma,
          },
        ),
        condoFeeIncrease: prepRatesGbm(
          i,
          "condo fees",
          {
            initialValue: parameters.stochasticParameters.condoFee.initialValue,
            mu: parameters.stochasticParameters.condoFee.mu,
            sigma: parameters.stochasticParameters.condoFee.sigma,
          },
        ),
        appreciationIncrease: prepRatesGbm(
          i,
          "property appreciation",
          {
            initialValue:
              parameters.stochasticParameters.appreciation.initialValue,
            mu: parameters.stochasticParameters.appreciation.mu,
            sigma: parameters.stochasticParameters.appreciation.sigma,
          },
        ),
        sellingFixedFeesIncrease: prepRatesGbm(
          i,
          "selling fixed fees",
          {
            initialValue:
              parameters.stochasticParameters.sellingFixedFees.initialValue,
            mu: parameters.stochasticParameters.sellingFixedFees.mu,
            sigma: parameters.stochasticParameters.sellingFixedFees.sigma,
          },
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
    }, {
      finalBalanceOnly: !options.monthlyQuantiles?.length &&
        !options.monthlyIterations,
      onRecord,
    });

    // The results array always contains a fixed number of entries per category,
    // pushed in order: renter, buyerFixed, buyerVariable.
    // - When onRecord is active (monthlyQuantiles=true): 2 entries per category
    //   [balanceAfterSelling, balance] → stride = 2
    // - When finalBalanceOnly=true (monthlyQuantiles=false): 9 entries per category
    //   [balanceAfterSelling, balance, + 7 totals] → stride = 9
    // Avoid .filter() by accessing known indices directly.
    const stride = onRecord ? 2 : 9;
    const r0 = iterationResults[0]; // renter balanceAfterSelling
    const r2 = iterationResults[stride]; // buyerFixed balanceAfterSelling
    const r4 = iterationResults[stride * 2]; // buyerVariable balanceAfterSelling
    if (r0.amount >= r2.amount && r0.amount >= r4.amount) {
      winners.push(r0 as typeof winners[0]);
    } else if (r2.amount >= r4.amount) {
      winners.push(r2 as typeof winners[0]);
    } else {
      winners.push(r4 as typeof winners[0]);
    }

    const r1 = iterationResults[1]; // renter balance
    const r3 = iterationResults[stride + 1]; // buyerFixed balance
    const r5 = iterationResults[stride * 2 + 1]; // buyerVariable balance
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
      | "saleNetGains"
      | "totals";
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
      | "homeSellingGains"
      | "monthlyExpenses"
      | "cumulativeExpenses"
      | "monthlyGains"
      | "cumulativeGains"
      | "assets"
      | "saleCosts"
      | "saleNetGains";
    monthIndex: number;
    q10?: number;
    q50?: number;
    q90?: number;
    min?: number;
    max?: number;
  }[] = [];

  if (buckets && parameters.iterations > 0) {
    const startQuantiles = options.verbose ? Date.now() : null;
    const len = parameters.iterations;
    const buffer = new Float64Array(len);

    const needsQ10 = statsSet.has("q10");
    const needsQ50 = statsSet.has("q50");
    const needsQ90 = statsSet.has("q90");
    const needsMin = statsSet.has("min");
    const needsMax = statsSet.has("max");

    const p10Index = needsQ10 ? 0.1 * (len - 1) : 0;
    const p10Lower = needsQ10 ? Math.floor(p10Index) : 0;
    const p10Upper = needsQ10 ? Math.ceil(p10Index) : 0;
    const p10Weight = needsQ10 ? p10Index - p10Lower : 0;

    const p50Index = needsQ50 ? 0.5 * (len - 1) : 0;
    const p50Lower = needsQ50 ? Math.floor(p50Index) : 0;
    const p50Upper = needsQ50 ? Math.ceil(p50Index) : 0;
    const p50Weight = needsQ50 ? p50Index - p50Lower : 0;

    const p90Index = needsQ90 ? 0.9 * (len - 1) : 0;
    const p90Lower = needsQ90 ? Math.floor(p90Index) : 0;
    const p90Upper = needsQ90 ? Math.ceil(p90Index) : 0;
    const p90Weight = needsQ90 ? p90Index - p90Lower : 0;

    for (const [key, slots] of buckets) {
      const [category, group, variable] = key.split("|");
      for (let monthIndex = 0; monthIndex < nbMonths; monthIndex++) {
        // Float64Array.sort() with no comparator sorts numerically (native code).
        buffer.set(slots[monthIndex]);
        buffer.sort();

        const q10Raw = needsQ10
          ? (p10Lower === p10Upper
            ? buffer[p10Lower]
            : buffer[p10Lower] * (1 - p10Weight) + buffer[p10Upper] * p10Weight)
          : undefined;
        const q50Raw = needsQ50
          ? (p50Lower === p50Upper
            ? buffer[p50Lower]
            : buffer[p50Lower] * (1 - p50Weight) + buffer[p50Upper] * p50Weight)
          : undefined;
        const q90Raw = needsQ90
          ? (p90Lower === p90Upper
            ? buffer[p90Lower]
            : buffer[p90Lower] * (1 - p90Weight) + buffer[p90Upper] * p90Weight)
          : undefined;

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
            | "saleNetGains"
            | "totals",
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
            | "homeSellingGains"
            | "monthlyExpenses"
            | "cumulativeExpenses"
            | "monthlyGains"
            | "cumulativeGains"
            | "assets"
            | "saleCosts"
            | "saleNetGains",
          monthIndex,
          ...(q10Raw !== undefined
            ? { q10: Math.round(q10Raw * 100) / 100 }
            : {}),
          ...(q50Raw !== undefined
            ? { q50: Math.round(q50Raw * 100) / 100 }
            : {}),
          ...(q90Raw !== undefined
            ? { q90: Math.round(q90Raw * 100) / 100 }
            : {}),
          ...(needsMin ? { min: Math.round(buffer[0] * 100) / 100 } : {}),
          ...(needsMax ? { max: Math.round(buffer[len - 1] * 100) / 100 } : {}),
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
    monthIndex: number;
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
    group: "summaryCumulative";
    variable: "balanceAfterSelling";
  }[];

  const winnersBeforeSellingFiltered = winnersBeforeSelling as {
    monthIndex: number;
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
    monthlyIterations: monthlyIterationsResult ?? [],
  };
}
