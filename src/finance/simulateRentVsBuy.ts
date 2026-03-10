import computeBalances from "./helpers/rentVsBuy/computeBalances.ts";
import computeExpenses from "./helpers/rentVsBuy/computeExpenses.ts";
import computeGains from "./helpers/rentVsBuy/computeGains.ts";
import computeSale from "./helpers/rentVsBuy/computeSale.ts";
import getPersona from "./helpers/rentVsBuy/getPersona.ts";
import incrementParameters from "./helpers/rentVsBuy/incrementParameters.ts";
import precomputeMortgagePayments from "./helpers/rentVsBuy/precomputeMortgagePayments.ts";
import toResults from "./helpers/rentVsBuy/toResults.ts";
import mortgageInsurancePremium from "./mortgageInsurancePremium.ts";

/**
 * Simulates and compares the financial outcomes of renting versus buying a home over a specified number of years.
 * This comprehensive simulation accounts for various factors including mortgage payments (fixed and variable),
 * property taxes, maintenance costs, condo fees, insurance, rent increases, market returns on savings, and
 * the eventual sale of the property. Tailored for a Canadian context, it includes specific features like
 * tax-free TFSA contributions and standard Canadian mortgage structures.
 *
 * The simulation tracks three scenarios:
 * 1. **Renter**: Pays rent and invests the difference between their expenses and the buyer's expenses into the market.
 * 2. **Buyer (Fixed)**: Purchases a home using a fixed-rate mortgage and invests any remaining surplus.
 * 3. **Buyer (Variable)**: Purchases a home using a variable-rate mortgage and invests any remaining surplus.
 *
 * It provides a detailed breakdown of monthly expenses, gains, assets, and a final summary including the
 * net balance after selling the property and paying all associated costs (taxes, commissions, penalties).
 *
 * @param parameters - The input parameters for the simulation.
 * @param parameters.startingYear - The year the simulation begins.
 * @param parameters.numberOfYears - The duration of the simulation in years.
 * @param parameters.tfsaContributions - Whether to prioritize TFSA contributions for investments (tax-free gains).
 * @param parameters.combinedTaxRate - The combined marginal tax rate used for calculating taxes on investment gains.
 * @param parameters.renter - Configuration for the renter scenario.
 *   @param parameters.renter.startingMonthlyRent - The initial monthly rent payment.
 *   @param parameters.renter.securityDeposit - The initial security deposit.
 *   @param parameters.renter.startingMonthlyInsurance - The initial monthly renter's insurance.
 * @param parameters.buyer - Configuration for the buyer scenarios.
 *   @param parameters.buyer.downPayment - The down payment amount.
 *   @param parameters.buyer.purchasePrice - The purchase price of the home.
 *   @param parameters.buyer.fixedRateDiscount - The discount applied to the posted fixed mortgage rate.
 *   @param parameters.buyer.variableRateMargin - The margin added to the variable mortgage rate.
 *   @param parameters.buyer.purchaseFixedFees - Fixed fees associated with the purchase (e.g., notary, land transfer tax).
 *   @param parameters.buyer.startingAnnualMaintenanceCost - The initial annual maintenance cost.
 *   @param parameters.buyer.startingAnnualPropertyTax - The initial annual property tax.
 *   @param parameters.buyer.startingMonthlyCondoFees - The initial monthly condo fees.
 *   @param parameters.buyer.startingMonthlyInsurance - The initial monthly homeowner's insurance.
 *   @param parameters.buyer.sellingFixedFees - Fixed fees associated with selling the home.
 *   @param parameters.buyer.sellingCommissionRate - The real estate commission rate for selling the home (e.g., 0.05 for 5%).
 * @param parameters.rates - Annualized rates and their values over the simulation period. Each array should have a length of `numberOfYears * 12`. These can be historical or projected rates.
 *   @param parameters.rates.marketReturnRate - Monthly market return rates.
 *   @param parameters.rates.rentIncrease - Monthly rent increase rates.
 *   @param parameters.rates.ownerInsuranceIncrease - Monthly homeowner's insurance increase rates.
 *   @param parameters.rates.renterInsuranceIncrease - Monthly renter's insurance increase rates.
 *   @param parameters.rates.maintenanceIncrease - Monthly maintenance cost increase rates.
 *   @param parameters.rates.propertyTaxIncrease - Monthly property tax increase rates.
 *   @param parameters.rates.condoFeeIncrease - Monthly condo fee increase rates.
 *   @param parameters.rates.fiveYearInterestRates - Monthly 5-year fixed mortgage interest rates.
 *   @param parameters.rates.fourYearInterestRates - Monthly 4-year fixed mortgage interest rates.
 *   @param parameters.rates.threeYearInterestRates - Monthly 3-year fixed mortgage interest rates.
 *   @param parameters.rates.twoYearInterestRates - Monthly 2-year fixed mortgage interest rates.
 *   @param parameters.rates.oneYearInterestRates - Monthly 1-year fixed mortgage interest rates.
 *   @param parameters.rates.variableInterestRates - Monthly variable mortgage interest rates.
 *   @param parameters.rates.appreciationIncrease - Monthly home appreciation rates.
 *   @param parameters.rates.sellingFixedFeesIncrease - Monthly increase rates for selling fixed fees.
 * @param options - Additional simulation options.
 *   @param options.finalBalanceOnly - If `true`, the returned results will only include the final month's summary and sale data for each scenario. Defaults to `false`.
 *
 * @returns A detailed array of monthly results for each scenario (renter, buyerFixed, buyerVariable).
 * Each object in the array represents a specific data point (expense, gain, asset, or summary) for a given month.
 *
 * @example
 * ```ts
 * const rates = {
 *   marketReturnRate: new Array(120).fill(0.005), // 0.5% monthly
 *   rentIncrease: new Array(120).fill(0.002),
 *   ownerInsuranceIncrease: new Array(120).fill(0.002),
 *   renterInsuranceIncrease: new Array(120).fill(0.002),
 *   maintenanceIncrease: new Array(120).fill(0.002),
 *   propertyTaxIncrease: new Array(120).fill(0.002),
 *   condoFeeIncrease: new Array(120).fill(0.002),
 *   fiveYearInterestRates: new Array(120).fill(0.05),
 *   fourYearInterestRates: new Array(120).fill(0.05),
 *   threeYearInterestRates: new Array(120).fill(0.05),
 *   twoYearInterestRates: new Array(120).fill(0.05),
 *   oneYearInterestRates: new Array(120).fill(0.05),
 *   variableInterestRates: new Array(120).fill(0.06),
 *   appreciationIncrease: new Array(120).fill(0.003),
 *   sellingFixedFeesIncrease: new Array(120).fill(0.002),
 * };
 *
 * const results = simulateRentVsBuy({
 *   startingYear: 2024,
 *   numberOfYears: 10,
 *   tfsaContributions: true,
 *   combinedTaxRate: 0.4,
 *   renter: {
 *     startingMonthlyRent: 2000,
 *     securityDeposit: 2000,
 *     startingMonthlyInsurance: 30,
 *   },
 *   buyer: {
 *     downPayment: 100000,
 *     purchasePrice: 500000,
 *     fixedRateDiscount: 1.5,
 *     variableRateMargin: -0.5,
 *     purchaseFixedFees: 5000,
 *     startingAnnualMaintenanceCost: 2000,
 *     startingAnnualPropertyTax: 3000,
 *     startingMonthlyCondoFees: 300,
 *     startingMonthlyInsurance: 100,
 *     sellingFixedFees: 2000,
 *     sellingCommissionRate: 0.05,
 *   },
 *   rates
 * }, { finalBalanceOnly: true });
 * ```
 */
export default function simulateRentVsBuy(
  parameters: {
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
    rates: {
      marketReturnRate: number[];
      rentIncrease: number[];
      ownerInsuranceIncrease: number[];
      renterInsuranceIncrease: number[];
      maintenanceIncrease: number[];
      propertyTaxIncrease: number[];
      condoFeeIncrease: number[];
      fiveYearInterestRates: number[];
      fourYearInterestRates: number[];
      threeYearInterestRates: number[];
      twoYearInterestRates: number[];
      oneYearInterestRates: number[];
      variableInterestRates: number[];
      appreciationIncrease: number[];
      sellingFixedFeesIncrease: number[];
    };
  },
  options: { finalBalanceOnly?: boolean } = {},
): (
  & {
    year: number;
    month: number;
    monthIndex: number;
    date: Date;
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
  }
  & (
    | {
      group: "monthlyExpenses" | "cumulativeExpenses";
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
        | "insurancePremium";
      effectiveInterestRate?: number;
      postedInterestRate?: number;
      fixedRateDiscount?: number;
      variableRateMargin?: number;
    }
    | {
      group: "monthlyGains" | "cumulativeGains";
      variable:
        | "tfsaGains"
        | "tfsaContribution"
        | "stocksGains"
        | "newStocks"
        | "homeEquityGains";
      homeValue?: number;
    }
    | {
      group: "assets";
      variable:
        | "tfsa"
        | "stocks"
        | "securityDeposit"
        | "homeEquity";
    }
    | { group: "summary"; variable: "balance" }
    | {
      group: "summaryCumulative";
      variable:
        | "balance"
        | "balanceAfterSelling";
    }
    | {
      group: "saleCosts";
      variable:
        | "stockTaxes"
        | "homeSellingCommission"
        | "homeSellingFixedFees"
        | "mortgagePenalty"
        | "mortgageBalance";
    }
    | {
      group: "saleNetGains";
      variable:
        | "stockSellingGains"
        | "tfsaSellingGains"
        | "homeSellingGains"
        | "securityDeposit";
    }
  )
)[] {
  const results: (
    & {
      year: number;
      month: number;
      monthIndex: number;
      date: Date;
      amount: number;
      category: "renter" | "buyerFixed" | "buyerVariable";
    }
    & (
      | {
        group: "monthlyExpenses" | "cumulativeExpenses";
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
          | "insurancePremium";
        effectiveInterestRate?: number;
        postedInterestRate?: number;
        fixedRateDiscount?: number;
        variableRateMargin?: number;
      }
      | {
        group: "monthlyGains" | "cumulativeGains";
        variable:
          | "tfsaGains"
          | "tfsaContribution"
          | "stocksGains"
          | "newStocks"
          | "homeEquityGains";
        homeValue?: number;
      }
      | {
        group: "assets";
        variable:
          | "tfsa"
          | "stocks"
          | "securityDeposit"
          | "homeEquity";
      }
      | {
        group: "summary";
        variable: "balance";
      }
      | {
        group: "summaryCumulative";
        variable:
          | "balance"
          | "balanceAfterSelling";
      }
      | {
        group: "saleCosts";
        variable:
          | "stockTaxes"
          | "homeSellingCommission"
          | "homeSellingFixedFees"
          | "mortgagePenalty"
          | "mortgageBalance";
      }
      | {
        group: "saleNetGains";
        variable:
          | "stockSellingGains"
          | "tfsaSellingGains"
          | "homeSellingGains"
          | "securityDeposit";
      }
    )
  )[] = [];

  // We keep track of amounts in structured objects
  const renter = getPersona({
    startingMonthlyRent: parameters.renter.startingMonthlyRent,
    securityDeposit: parameters.renter.securityDeposit,
    startingMonthlyInsurance: parameters.renter.startingMonthlyInsurance,
    downPayment: 0,
    purchasePrice: 0,
    homeValue: 0,
    insurancePremium: 0,
    fixedRateDiscount: 0,
    variableRateMargin: 0,
    purchaseFixedFees: 0,
    startingAnnualMaintenanceCost: 0,
    startingAnnualPropertyTax: 0,
    startingMonthlyCondoFees: 0,
    sellingFixedFees: 0,
    sellingCommissionRate: 0,
  });
  const insurancePremium = mortgageInsurancePremium(
    parameters.buyer.purchasePrice,
    parameters.buyer.downPayment,
  );
  const buyerFixed = getPersona({
    startingMonthlyRent: 0,
    securityDeposit: 0,
    startingMonthlyInsurance: parameters.buyer.startingMonthlyInsurance,
    downPayment: parameters.buyer.downPayment,
    purchasePrice: parameters.buyer.purchasePrice,
    insurancePremium,
    homeValue: parameters.buyer.purchasePrice,
    fixedRateDiscount: parameters.buyer.fixedRateDiscount,
    variableRateMargin: 0, // No variable rate margin for fixed mortgage
    purchaseFixedFees: parameters.buyer.purchaseFixedFees,
    startingAnnualMaintenanceCost:
      parameters.buyer.startingAnnualMaintenanceCost,
    startingAnnualPropertyTax: parameters.buyer.startingAnnualPropertyTax,
    startingMonthlyCondoFees: parameters.buyer.startingMonthlyCondoFees,
    sellingFixedFees: parameters.buyer.sellingFixedFees,
    sellingCommissionRate: parameters.buyer.sellingCommissionRate,
  });
  const buyerVariable = getPersona({
    startingMonthlyRent: 0,
    securityDeposit: 0,
    startingMonthlyInsurance: parameters.buyer.startingMonthlyInsurance,
    downPayment: parameters.buyer.downPayment,
    purchasePrice: parameters.buyer.purchasePrice,
    homeValue: parameters.buyer.purchasePrice,
    insurancePremium,
    fixedRateDiscount: 0, // No fixed rate discount for variable mortgage
    variableRateMargin: parameters.buyer.variableRateMargin,
    purchaseFixedFees: parameters.buyer.purchaseFixedFees,
    startingAnnualMaintenanceCost:
      parameters.buyer.startingAnnualMaintenanceCost,
    startingAnnualPropertyTax: parameters.buyer.startingAnnualPropertyTax,
    startingMonthlyCondoFees: parameters.buyer.startingMonthlyCondoFees,
    sellingFixedFees: parameters.buyer.sellingFixedFees,
    sellingCommissionRate: parameters.buyer.sellingCommissionRate,
  });

  // We precompute the mortgage payments for the buyer for the entire period
  const { allFixedMortgagePayments, allVariableMortgagePayments } =
    precomputeMortgagePayments(
      parameters.numberOfYears,
      parameters.buyer.purchasePrice - parameters.buyer.downPayment,
      parameters.buyer.fixedRateDiscount,
      parameters.buyer.variableRateMargin,
      parameters.rates.fiveYearInterestRates,
      parameters.rates.variableInterestRates,
    );

  const numberOfMonths = parameters.numberOfYears * 12;

  for (
    let monthIndex = 0;
    monthIndex < numberOfMonths;
    monthIndex++
  ) {
    const year = parameters.startingYear + Math.floor(monthIndex / 12);
    const month = monthIndex % 12;

    // We compute the expenses
    const {
      totalMonthlyExpenses: renterTotalMonthlyExpenses,
    } = computeExpenses(monthIndex, renter, null);
    const {
      totalMonthlyExpenses: buyerFixedTotalMonthlyExpenses,
    } = computeExpenses(
      monthIndex,
      buyerFixed,
      allFixedMortgagePayments[monthIndex],
    );
    const {
      totalMonthlyExpenses: buyerVariableTotalMonthlyExpenses,
    } = computeExpenses(
      monthIndex,
      buyerVariable,
      allVariableMortgagePayments[monthIndex],
    );

    // We compute the monthly savings
    const maxMonthlyExpenses = Math.max(
      renterTotalMonthlyExpenses,
      buyerFixedTotalMonthlyExpenses,
      buyerVariableTotalMonthlyExpenses,
    );

    // We compute the gains
    computeGains(
      year,
      renter,
      null,
      parameters.rates.marketReturnRate[monthIndex],
      renterTotalMonthlyExpenses,
      maxMonthlyExpenses,
      parameters.tfsaContributions,
    );
    computeGains(
      year,
      buyerFixed,
      allFixedMortgagePayments[monthIndex],
      parameters.rates.marketReturnRate[monthIndex],
      buyerFixedTotalMonthlyExpenses,
      maxMonthlyExpenses,
      parameters.tfsaContributions,
    );
    computeGains(
      year,
      buyerVariable,
      allVariableMortgagePayments[monthIndex],
      parameters.rates.marketReturnRate[monthIndex],
      buyerVariableTotalMonthlyExpenses,
      maxMonthlyExpenses,
      parameters.tfsaContributions,
    );

    // Now we simulate a sale of all assets
    const currentPostedRates = {
      1: parameters.rates.oneYearInterestRates[monthIndex],
      2: parameters.rates.twoYearInterestRates[monthIndex],
      3: parameters.rates.threeYearInterestRates[monthIndex],
      4: parameters.rates.fourYearInterestRates[monthIndex],
      5: parameters.rates.fiveYearInterestRates[monthIndex],
    };
    computeSale(
      monthIndex,
      renter,
      parameters.combinedTaxRate,
      null,
      null,
      null,
      options.finalBalanceOnly ?? false,
      numberOfMonths,
    );
    computeSale(
      monthIndex,
      buyerFixed,
      parameters.combinedTaxRate,
      allFixedMortgagePayments[monthIndex],
      currentPostedRates,
      "fixed",
      options.finalBalanceOnly ?? false,
      numberOfMonths,
    );
    computeSale(
      monthIndex,
      buyerVariable,
      parameters.combinedTaxRate,
      allVariableMortgagePayments[monthIndex],
      currentPostedRates,
      "variable",
      options.finalBalanceOnly ?? false,
      numberOfMonths,
    );

    // We compute the balances
    computeBalances(
      renter,
      options.finalBalanceOnly ?? false,
      monthIndex,
      numberOfMonths,
    );
    computeBalances(
      buyerFixed,
      options.finalBalanceOnly ?? false,
      monthIndex,
      numberOfMonths,
    );
    computeBalances(
      buyerVariable,
      options.finalBalanceOnly ?? false,
      monthIndex,
      numberOfMonths,
    );

    // We push all results for this month
    toResults(
      year,
      month,
      "renter",
      renter,
      results,
      monthIndex,
      numberOfMonths,
      options.finalBalanceOnly ?? false,
      null,
    );
    toResults(
      year,
      month,
      "buyerFixed",
      buyerFixed,
      results,
      monthIndex,
      numberOfMonths,
      options.finalBalanceOnly ?? false,
      allFixedMortgagePayments[monthIndex],
    );
    toResults(
      year,
      month,
      "buyerVariable",
      buyerVariable,
      results,
      monthIndex,
      numberOfMonths,
      options.finalBalanceOnly ?? false,
      allVariableMortgagePayments[monthIndex],
    );

    // We increment the parameters for next month
    incrementParameters(monthIndex, renter, parameters.rates);
    incrementParameters(monthIndex, buyerFixed, parameters.rates);
    incrementParameters(monthIndex, buyerVariable, parameters.rates);
  }

  return results;
}
