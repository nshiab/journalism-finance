import computeBalances from "./helpers/rentVsBuy/computeBalances.ts";
import computeExpenses from "./helpers/rentVsBuy/computeExpenses.ts";
import computeGains from "./helpers/rentVsBuy/computeGains.ts";
import computeSale from "./helpers/rentVsBuy/computeSale.ts";
import getPersona from "./helpers/rentVsBuy/getPersona.ts";
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
    marketReturnRate: number[];
    annualRentIncrease: number[];
    annualInsuranceIncrease: number[];
    annualMaintenanceIncrease: number[];
    annualPropertyTaxIncrease: number[];
    annualCondoFeeIncrease: number[];
    fiveYearInterestRates: number[];
    fourYearInterestRates: number[];
    threeYearInterestRates: number[];
    twoYearInterestRates: number[];
    oneYearInterestRates: number[];
    variableInterestRates: number[];
    annualAppreciationIncrease: number[];
    annualSellingFixedFeesIncrease: number[];
  };
}) {
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
    rateDiscount: 0,
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
    startingMonthlyInsurance: 0,
    downPayment: parameters.buyer.downPayment,
    purchasePrice: parameters.buyer.purchasePrice,
    insurancePremium,
    homeValue: parameters.buyer.purchasePrice,
    rateDiscount: parameters.buyer.rateDiscount,
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
    startingMonthlyInsurance: 0,
    downPayment: parameters.buyer.downPayment,
    purchasePrice: parameters.buyer.purchasePrice,
    homeValue: parameters.buyer.purchasePrice,
    insurancePremium,
    rateDiscount: parameters.buyer.rateDiscount,
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
      parameters.buyer.rateDiscount,
      parameters.rates.fiveYearInterestRates,
      parameters.rates.variableInterestRates,
    );

  for (
    let monthIndex = 0;
    monthIndex < parameters.numberOfYears * 12;
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
      parameters.rates.annualAppreciationIncrease[monthIndex],
      renterTotalMonthlyExpenses,
      maxMonthlyExpenses,
      parameters.tfsaContributions,
    );
    computeGains(
      year,
      buyerFixed,
      allFixedMortgagePayments[monthIndex],
      parameters.rates.marketReturnRate[monthIndex],
      parameters.rates.annualAppreciationIncrease[monthIndex],
      buyerFixedTotalMonthlyExpenses,
      maxMonthlyExpenses,
      parameters.tfsaContributions,
    );
    computeGains(
      year,
      buyerVariable,
      allVariableMortgagePayments[monthIndex],
      parameters.rates.marketReturnRate[monthIndex],
      parameters.rates.annualAppreciationIncrease[monthIndex],
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
    const renterBalanceAfterSelling = computeBalances(renter);
    const buyerFixedBalanceAfterSelling = computeBalances(buyerFixed);
    const buyerVariableBalanceAfterSelling = computeBalances(buyerVariable);

    // We compute the difference
    const maxBalanceAfterSelling = Math.max(
      renterBalanceAfterSelling,
      buyerFixedBalanceAfterSelling,
      buyerVariableBalanceAfterSelling,
    );
    const minBalanceAfterSelling = Math.min(
      renterBalanceAfterSelling,
      buyerFixedBalanceAfterSelling,
      buyerVariableBalanceAfterSelling,
    );

    renter.summaryCumulative.differenceAfterSelling =
      renter.summaryCumulative.balanceAfterSelling === maxBalanceAfterSelling
        ? renter.summaryCumulative.balanceAfterSelling - minBalanceAfterSelling
        : renter.summaryCumulative.balanceAfterSelling - maxBalanceAfterSelling;
    buyerFixed.summaryCumulative.differenceAfterSelling =
      buyerFixed.summaryCumulative.balanceAfterSelling ===
          maxBalanceAfterSelling
        ? buyerFixed.summaryCumulative.balanceAfterSelling -
          minBalanceAfterSelling
        : buyerFixed.summaryCumulative.balanceAfterSelling -
          maxBalanceAfterSelling;
    buyerVariable.summaryCumulative.differenceAfterSelling =
      buyerVariable.summaryCumulative.balanceAfterSelling ===
          maxBalanceAfterSelling
        ? buyerVariable.summaryCumulative.balanceAfterSelling -
          minBalanceAfterSelling
        : buyerVariable.summaryCumulative.balanceAfterSelling -
          maxBalanceAfterSelling;

    // We push all results for this month
    toResults(year, month, "renter", renter, results, monthIndex);
    toResults(
      year,
      month,
      "buyerFixed",
      buyerFixed,
      results,
      monthIndex,
    );
    toResults(
      year,
      month,
      "buyerVariable",
      buyerVariable,
      results,
      monthIndex,
    );

    // We increment the variables for following month, except home value, since it's done in computeRentVsBuyGains.
    // Some expenses are incremented annually only
    if (month % 12 === 0) {
      // Renter
      renter.params.monthlyRent += Math.round(
        renter.params.monthlyRent *
          parameters.rates.annualRentIncrease[monthIndex],
      );
      renter.params.monthlyInsurance += Math.round(
        renter.params.monthlyInsurance *
          parameters.rates.annualInsuranceIncrease[monthIndex],
      );
      // Buyer fixed
      buyerFixed.params.monthlyMaintenanceCost += Math.round(
        buyerFixed.params.monthlyMaintenanceCost *
          parameters.rates.annualMaintenanceIncrease[monthIndex],
      );
      buyerFixed.params.monthlyPropertyTax += Math.round(
        buyerFixed.params.monthlyPropertyTax *
          parameters.rates.annualPropertyTaxIncrease[monthIndex],
      );
      buyerFixed.params.monthlyCondoFees += Math.round(
        buyerFixed.params.monthlyCondoFees *
          parameters.rates.annualCondoFeeIncrease[monthIndex],
      );
      buyerFixed.params.sellingFixedFees += Math.round(
        buyerFixed.params.sellingFixedFees *
          parameters.rates.annualSellingFixedFeesIncrease[monthIndex],
      );
      // Buyer variable
      buyerVariable.params.monthlyMaintenanceCost += Math.round(
        buyerVariable.params.monthlyMaintenanceCost *
          parameters.rates.annualMaintenanceIncrease[monthIndex],
      );
      buyerVariable.params.monthlyPropertyTax += Math.round(
        buyerVariable.params.monthlyPropertyTax *
          parameters.rates.annualPropertyTaxIncrease[monthIndex],
      );
      buyerVariable.params.monthlyCondoFees += Math.round(
        buyerVariable.params.monthlyCondoFees *
          parameters.rates.annualCondoFeeIncrease[monthIndex],
      );
      buyerVariable.params.sellingFixedFees += Math.round(
        buyerVariable.params.sellingFixedFees *
          parameters.rates.annualSellingFixedFeesIncrease[monthIndex],
      );
    }
  }

  return results;
}
