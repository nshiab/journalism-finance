import computeBalances from "./helpers/rentVsBuy/computeBalances.ts";
import computeExpenses from "./helpers/rentVsBuy/computeExpenses.ts";
import computeGains from "./helpers/rentVsBuy/computeGains.ts";
import computeSale from "./helpers/rentVsBuy/computeSale.ts";
import getPersona from "./helpers/rentVsBuy/getPersona.ts";
import incrementParameters from "./helpers/rentVsBuy/incrementParameters.ts";
import precomputeMortgagePayments from "./helpers/rentVsBuy/precomputeMortgagePayments.ts";
import toResults from "./helpers/rentVsBuy/toResults.ts";
import mortgageInsurancePremium from "./mortgageInsurancePremium.ts";

export default function simulateRentVsBuy(parameters: {
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
}, options: { finalBalanceOnly?: boolean } = {}) {
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
          | "homeSellingGains"
          | "homeEquityGains";
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
          | "differenceAfterSelling"
          | "balance"
          | "balanceAfterSelling";
      }
      | {
        group: "saleCosts";
        variable:
          | "stockTaxes"
          | "homeSellingCommission"
          | "homeSellingFixedFees"
          | "mortgagePenalty";
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
    variableRateMargin: parameters.buyer.variableRateMargin,
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
    fixedRateDiscount: parameters.buyer.fixedRateDiscount,
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
      parameters.rates.appreciationIncrease[monthIndex],
      renterTotalMonthlyExpenses,
      maxMonthlyExpenses,
      parameters.tfsaContributions,
    );
    computeGains(
      year,
      buyerFixed,
      allFixedMortgagePayments[monthIndex],
      parameters.rates.marketReturnRate[monthIndex],
      parameters.rates.appreciationIncrease[monthIndex],
      buyerFixedTotalMonthlyExpenses,
      maxMonthlyExpenses,
      parameters.tfsaContributions,
    );
    computeGains(
      year,
      buyerVariable,
      allVariableMortgagePayments[monthIndex],
      parameters.rates.marketReturnRate[monthIndex],
      parameters.rates.appreciationIncrease[monthIndex],
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
    );
    computeSale(
      monthIndex,
      buyerFixed,
      parameters.combinedTaxRate,
      allFixedMortgagePayments[monthIndex],
      currentPostedRates,
      "fixed",
    );
    computeSale(
      monthIndex,
      buyerVariable,
      parameters.combinedTaxRate,
      allVariableMortgagePayments[monthIndex],
      currentPostedRates,
      "variable",
    );

    // We compute the balances
    computeBalances(renter);
    computeBalances(buyerFixed);
    computeBalances(buyerVariable);

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
