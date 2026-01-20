import computeExpenses from "./helpers/rentVsBuy/computeExpenses.ts";
import computeGains from "./helpers/rentVsBuy/computeGains.ts";
import getMortgagePenalty from "./helpers/rentVsBuy/getMortgagePenalty.ts";
import getPersona from "./helpers/rentVsBuy/getPersona.ts";
import getTfsaContribution from "./helpers/rentVsBuy/getTfsaContribution.ts";
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
          | "differenceWithBuyerFixed"
          | "differenceWithBuyerVariable"
          | "differenceAfterSellingWithBuyerFixed"
          | "differenceAfterSellingWithBuyerVariable"
          | "balance"
          | "balanceAfterSelling"
          | "differenceWithRenter"
          | "differenceAfterSellingWithRenter";
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
        group: "saleGains";
        variable: "stockSellingGains" | "tfsaSellingGains" | "homeSellingGains";
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
      totalCumulativeExpenses: renterTotalCumulativeExpenses,
    } = computeExpenses(monthIndex, renter, null);
    const {
      totalMonthlyExpenses: buyerFixedTotalMonthlyExpenses,
      totalCumulativeExpenses: buyerFixedTotalCumulativeExpenses,
    } = computeExpenses(
      monthIndex,
      buyerFixed,
      allFixedMortgagePayments[monthIndex],
    );
    const {
      totalMonthlyExpenses: buyerVariableTotalMonthlyExpenses,
      totalCumulativeExpenses: buyerVariableTotalCumulativeExpenses,
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
  }

  // for (
  //   let year = parameters.startingYear;
  //   year < parameters.startingYear + parameters.numberOfYears;
  //   year++
  // ) {
  //   const yearIndex = year - parameters.startingYear;

  //   // TFSA gains
  //   if (parameters.tfsaContributions) {
  //     renterTfsaGains = Math.round(
  //       renterTfsa * parameters.annualMarketReturnRate[yearIndex],
  //     );
  //     results.push({
  //       year,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "tfsaGains",
  //       amount: renterTfsaGains,
  //     });
  //     renterCumulativeTfsaGains += renterTfsaGains;
  //     results.push({
  //       year,
  //       category: "renter",
  //       group: "cumulativeGains",
  //       variable: "tfsaGains",
  //       amount: renterCumulativeTfsaGains,
  //     });
  //     // We will push the tfsa later after adjusting for the difference between renter and buyer expenses
  //     renterTfsa += renterTfsaGains;
  //   }

  //   // Market gains
  //   const renterstocksGains = Math.round(
  //     renterStocks * parameters.annualMarketReturnRate[yearIndex],
  //   );
  //   results.push({
  //     year,
  //     category: "renter",
  //     group: "annualGains",
  //     variable: "stocksGains",
  //     amount: renterstocksGains,
  //   });
  //   renterCumulativestocksGains += renterstocksGains;
  //   results.push({
  //     year,
  //     category: "renter",
  //     group: "cumulativeGains",
  //     variable: "stocksGains",
  //     amount: renterCumulativestocksGains,
  //   });
  //   // We will push the stocks later after adjusting for the difference between renter and buyer expenses
  //   renterStocks += renterstocksGains;

  //   // TFSA gains
  //   if (parameters.tfsaContributions) {
  //     buyerFixedTfsaGains = Math.round(
  //       buyerFixedTfsa * parameters.annualMarketReturnRate[yearIndex],
  //     );
  //     buyerVariableTfsaGains = Math.round(
  //       buyerVariableTfsa * parameters.annualMarketReturnRate[yearIndex],
  //     );
  //     results.push({
  //       year,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "tfsaGains",
  //       amount: buyerFixedTfsaGains,
  //     });
  //     results.push({
  //       year,
  //       category: "buyerVariable",
  //       group: "annualGains",
  //       variable: "tfsaGains",
  //       amount: buyerVariableTfsaGains,
  //     });
  //     buyerFixedCumulativeTfsaGains += buyerFixedTfsaGains;
  //     buyerVariableCumulativeTfsaGains += buyerVariableTfsaGains;
  //     results.push({
  //       year,
  //       category: "buyerFixed",
  //       group: "cumulativeGains",
  //       variable: "tfsaGains",
  //       amount: buyerFixedCumulativeTfsaGains,
  //     });
  //     results.push({
  //       year,
  //       category: "buyerVariable",
  //       group: "cumulativeGains",
  //       variable: "tfsaGains",
  //       amount: buyerVariableCumulativeTfsaGains,
  //     });
  //     // We will push the tfsa later after adjusting for the difference between renter and buyer expenses
  //     buyerFixedTfsa += buyerFixedTfsaGains;
  //     buyerVariableTfsa += buyerVariableTfsaGains;
  //   }

  //   // Market gains
  //   const buyerFixedstocksGains = Math.round(
  //     buyerFixedStocks * parameters.annualMarketReturnRate[yearIndex],
  //   );
  //   const buyerVariablestocksGains = Math.round(
  //     buyerVariableStocks * parameters.annualMarketReturnRate[yearIndex],
  //   );
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "annualGains",
  //     variable: "stocksGains",
  //     amount: buyerFixedstocksGains,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "annualGains",
  //     variable: "stocksGains",
  //     amount: buyerVariablestocksGains,
  //   });
  //   buyerFixedCumulativestocksGains += buyerFixedstocksGains;
  //   buyerVariableCumulativestocksGains += buyerVariablestocksGains;
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "cumulativeGains",
  //     variable: "stocksGains",
  //     amount: buyerFixedCumulativestocksGains,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "cumulativeGains",
  //     variable: "stocksGains",
  //     amount: buyerVariableCumulativestocksGains,
  //   });
  //   // We will push the stocks later after adjusting for the difference between renter and buyer expenses
  //   buyerFixedStocks += buyerFixedstocksGains;
  //   buyerVariableStocks += buyerVariablestocksGains;

  //   // We appreciate the home value for the buyer
  //   const homeValueIncrease = Math.round(
  //     homeValue * parameters.buyer.appreciationIncrease[yearIndex],
  //   );
  //   homeValue += homeValueIncrease;

  //   // We store the previous year home equity for later calculations
  //   const buyerFixedPreviousYearHomeEquity = buyerFixedHomeEquity;
  //   const buyerVariablePreviousYearHomeEquity = buyerVariableHomeEquity;
  //   // We calculate the home equity for the buyer
  //   buyerFixedHomeEquity = homeValue -
  //     fixedMortgagePaymentsForThisYear.balance;
  //   buyerVariableHomeEquity = homeValue -
  //     variableMortgagePaymentsForThisYear.balance;

  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "assets",
  //     variable: "homeEquity",
  //     amount: buyerFixedHomeEquity,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "assets",
  //     variable: "homeEquity",
  //     amount: buyerVariableHomeEquity,
  //   });
  //   // We calculate the home equity gains for this year
  //   const buyerFixedHomeEquityGains = buyerFixedHomeEquity -
  //     buyerFixedPreviousYearHomeEquity;
  //   const buyerVariableHomeEquityGains = buyerVariableHomeEquity -
  //     buyerVariablePreviousYearHomeEquity;
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "annualGains",
  //     variable: "homeEquityGains",
  //     amount: buyerFixedHomeEquityGains,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "annualGains",
  //     variable: "homeEquityGains",
  //     amount: buyerVariableHomeEquityGains,
  //   });
  //   buyerFixedCumulativeHomeEquityGains += buyerFixedHomeEquityGains;
  //   buyerVariableCumulativeHomeEquityGains += buyerVariableHomeEquityGains;
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "cumulativeGains",
  //     variable: "homeEquityGains",
  //     amount: buyerFixedCumulativeHomeEquityGains,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "cumulativeGains",
  //     variable: "homeEquityGains",
  //     amount: buyerVariableCumulativeHomeEquityGains,
  //   });

  //   // COMPARISON AND ADJUSTMENTS
  //   // We compare annual expenses of renter and buyer and decide where the difference should go to. We keep track of it for later.
  //   const maxExpenses = Math.max(
  //     renterExpenses,
  //     buyerFixedExpenses,
  //     buyerVariableExpenses,
  //   );
  //   let renterSavings = maxExpenses - renterExpenses;
  //   let buyerFixedSavings = maxExpenses - buyerFixedExpenses;
  //   let buyerVariableSavings = maxExpenses - buyerVariableExpenses;

  //   // We adjust TFSA contributions if applicable
  //   if (parameters.tfsaContributions) {
  //     const renterContributionRoom = getTfsaContribution(
  //       year,
  //       renterCumulativeTfsaContributions,
  //     );
  //     renterTfsaContribution = Math.min(
  //       renterContributionRoom,
  //       renterSavings,
  //     );
  //     results.push({
  //       year,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "tfsaContribution",
  //       amount: renterTfsaContribution,
  //     });
  //     renterCumulativeTfsaContributions += renterTfsaContribution;
  //     results.push({
  //       year,
  //       category: "renter",
  //       group: "cumulativeGains",
  //       variable: "tfsaContribution",
  //       amount: renterCumulativeTfsaContributions,
  //     });
  //     renterTfsa += renterTfsaContribution;
  //     results.push({
  //       year,
  //       category: "renter",
  //       group: "assets",
  //       variable: "tfsa",
  //       amount: renterTfsa,
  //     });

  //     const buyerFixedContributionRoom = getTfsaContribution(
  //       year,
  //       buyerFixedCumulativeTfsaContributions,
  //     );
  //     const buyerVariableContributionRoom = getTfsaContribution(
  //       year,
  //       buyerVariableCumulativeTfsaContributions,
  //     );
  //     buyerFixedTfsaContribution = Math.min(
  //       buyerFixedContributionRoom,
  //       buyerFixedSavings,
  //     );
  //     buyerVariableTfsaContribution = Math.min(
  //       buyerVariableContributionRoom,
  //       buyerVariableSavings,
  //     );
  //     results.push({
  //       year,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "tfsaContribution",
  //       amount: buyerFixedTfsaContribution,
  //     });
  //     results.push({
  //       year,
  //       category: "buyerVariable",
  //       group: "annualGains",
  //       variable: "tfsaContribution",
  //       amount: buyerVariableTfsaContribution,
  //     });
  //     buyerFixedCumulativeTfsaContributions += buyerFixedTfsaContribution;
  //     buyerVariableCumulativeTfsaContributions += buyerVariableTfsaContribution;
  //     results.push({
  //       year,
  //       category: "buyerFixed",
  //       group: "cumulativeGains",
  //       variable: "tfsaContribution",
  //       amount: buyerFixedCumulativeTfsaContributions,
  //     });
  //     results.push({
  //       year,
  //       category: "buyerVariable",
  //       group: "cumulativeGains",
  //       variable: "tfsaContribution",
  //       amount: buyerVariableCumulativeTfsaContributions,
  //     });
  //     buyerFixedTfsa += buyerFixedTfsaContribution;
  //     buyerVariableTfsa += buyerVariableTfsaContribution;
  //     results.push({
  //       year,
  //       category: "buyerFixed",
  //       group: "assets",
  //       variable: "tfsa",
  //       amount: buyerFixedTfsa,
  //     });
  //     results.push({
  //       year,
  //       category: "buyerVariable",
  //       group: "assets",
  //       variable: "tfsa",
  //       amount: buyerVariableTfsa,
  //     });
  //   }

  //   // We adjust and push the savings as new stocks after TFSA contributions
  //   renterSavings -= renterTfsaContribution;
  //   buyerFixedSavings -= buyerFixedTfsaContribution;
  //   buyerVariableSavings -= buyerVariableTfsaContribution;
  //   const renterNewStocks = renterSavings;
  //   const buyerFixedNewStocks = buyerFixedSavings;
  //   const buyerVariableNewStocks = buyerVariableSavings;
  //   results.push({
  //     year,
  //     category: "renter",
  //     group: "annualGains",
  //     variable: "newStocks",
  //     amount: renterNewStocks,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "annualGains",
  //     variable: "newStocks",
  //     amount: buyerFixedNewStocks,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "annualGains",
  //     variable: "newStocks",
  //     amount: buyerVariableNewStocks,
  //   });

  //   // We adjust the stocks accordingly and now can push it
  //   renterStocks += renterNewStocks;
  //   results.push({
  //     year,
  //     category: "renter",
  //     group: "assets",
  //     variable: "stocks",
  //     amount: renterStocks,
  //   });
  //   renterStocksPurchased += renterNewStocks;
  //   buyerFixedStocks += buyerFixedNewStocks;
  //   buyerVariableStocks += buyerVariableNewStocks;
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "assets",
  //     variable: "stocks",
  //     amount: buyerFixedStocks,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "assets",
  //     variable: "stocks",
  //     amount: buyerVariableStocks,
  //   });
  //   buyerFixedStocksPurchased += buyerFixedNewStocks;
  //   buyerVariableStocksPurchased += buyerVariableNewStocks;

  //   // We push the cumulative stock purchase
  //   results.push({
  //     year,
  //     category: "renter",
  //     group: "cumulativeGains",
  //     variable: "newStocks",
  //     amount: renterStocksPurchased,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "cumulativeGains",
  //     variable: "newStocks",
  //     amount: buyerFixedStocksPurchased,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "cumulativeGains",
  //     variable: "newStocks",
  //     amount: buyerVariableStocksPurchased,
  //   });

  //   // We calculate the total gains for this year
  //   const renterGains = renterstocksGains + renterTfsaGains + renterNewStocks +
  //     renterTfsaContribution;
  //   const buyerFixedGains = buyerFixedstocksGains + buyerFixedTfsaGains +
  //     buyerFixedNewStocks +
  //     buyerFixedTfsaContribution + buyerFixedHomeEquityGains;
  //   const buyerVariableGains = buyerVariablestocksGains +
  //     buyerVariableTfsaGains +
  //     buyerVariableNewStocks +
  //     buyerVariableTfsaContribution + buyerVariableHomeEquityGains;

  //   // We adjust the annual balances
  //   const renterBalance = renterGains - renterExpenses;
  //   results.push({
  //     year,
  //     category: "renter",
  //     group: "summary",
  //     variable: "balance",
  //     amount: renterBalance,
  //   });
  //   const buyerFixedBalance = buyerFixedGains - buyerFixedExpenses;
  //   const buyerVariableBalance = buyerVariableGains - buyerVariableExpenses;
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "summary",
  //     variable: "balance",
  //     amount: buyerFixedBalance,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "summary",
  //     variable: "balance",
  //     amount: buyerVariableBalance,
  //   });

  //   // We calculate the overall assets so far
  //   renterAssets = renterStocks + renterTfsa;
  //   buyerFixedAssets = buyerFixedStocks + buyerFixedTfsa + buyerFixedHomeEquity;
  //   buyerVariableAssets = buyerVariableStocks + buyerVariableTfsa +
  //     buyerVariableHomeEquity;

  //   // We calculate the overall balances so far
  //   const renterOverallBalance = renterAssets - renterCumulativeExpenses;
  //   results.push({
  //     year,
  //     category: "renter",
  //     group: "summaryCumulative",
  //     variable: "balance",
  //     amount: renterOverallBalance,
  //   });
  //   const buyerFixedOverallBalance = buyerFixedAssets -
  //     buyerFixedCumulativeExpenses;
  //   const buyerVariableOverallBalance = buyerVariableAssets -
  //     buyerVariableCumulativeExpenses;
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "summaryCumulative",
  //     variable: "balance",
  //     amount: buyerFixedOverallBalance,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "summaryCumulative",
  //     variable: "balance",
  //     amount: buyerVariableOverallBalance,
  //   });

  //   // We calculate the difference in overall balance
  //   results.push({
  //     year,
  //     category: "renter",
  //     group: "summaryCumulative",
  //     variable: "differenceWithBuyerFixed",
  //     amount: renterOverallBalance - buyerFixedOverallBalance,
  //   });
  //   results.push({
  //     year,
  //     category: "renter",
  //     group: "summaryCumulative",
  //     variable: "differenceWithBuyerVariable",
  //     amount: renterOverallBalance - buyerVariableOverallBalance,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "summaryCumulative",
  //     variable: "differenceWithRenter",
  //     amount: buyerFixedOverallBalance - renterOverallBalance,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "summaryCumulative",
  //     variable: "differenceWithBuyerVariable",
  //     amount: buyerFixedOverallBalance - buyerVariableOverallBalance,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "summaryCumulative",
  //     variable: "differenceWithRenter",
  //     amount: buyerVariableOverallBalance - renterOverallBalance,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "summaryCumulative",
  //     variable: "differenceWithBuyerFixed",
  //     amount: buyerVariableOverallBalance - buyerFixedOverallBalance,
  //   });

  //   // We adjust for following year
  //   // RENTER
  //   rent = Math.round(
  //     rent * (1 + parameters.renter.annualRentIncrease[yearIndex]),
  //   );
  //   rentInsurance = Math.round(
  //     rentInsurance *
  //       (1 + parameters.renter.annualInsuranceIncrease[yearIndex]),
  //   );
  //   // BUYER
  //   buyAnnualMaintenanceCost = Math.round(
  //     buyAnnualMaintenanceCost *
  //       (1 + parameters.buyer.annualMaintenanceIncrease[yearIndex]),
  //   );
  //   buyAnnualPropertyTax = Math.round(
  //     buyAnnualPropertyTax *
  //       (1 + parameters.buyer.annualPropertyTaxIncrease[yearIndex]),
  //   );
  //   buyMonthlyCondoFees = Math.round(
  //     buyMonthlyCondoFees *
  //       (1 + parameters.buyer.annualCondoFeeIncrease[yearIndex]),
  //   );
  //   buyMonthlyInsurance = Math.round(
  //     buyMonthlyInsurance *
  //       (1 + parameters.buyer.annualInsuranceIncrease[yearIndex]),
  //   );
  //   sellingFixedFees = Math.round(
  //     sellingFixedFees *
  //       (1 + parameters.buyer.sellingFixedFeesIncrease[yearIndex]),
  //   );

  //   // We simulate a sell each year

  //   // First we calculate the selling costs
  //   const renterFinalStockGains = renterStocks - renterStocksPurchased;
  //   const renterStockTaxes = Math.round(Math.max(
  //     (Math.max(0, renterFinalStockGains) /
  //       2) * parameters.combinedTaxRate,
  //   ));
  //   results.push({
  //     year,
  //     category: "renter",
  //     group: "saleCosts",
  //     variable: "stockTaxes",
  //     amount: renterStockTaxes,
  //   });

  //   const homeSellingCommission = Math.round(
  //     homeValue * parameters.buyer.sellingCommissionRate,
  //   );
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "saleCosts",
  //     variable: "homeSellingCommission",
  //     amount: homeSellingCommission,
  //   });

  //   const buyerFixedFinalStockGains = buyerFixedStocks -
  //     buyerFixedStocksPurchased;
  //   const buyerVariableFinalStockGains = buyerVariableStocks -
  //     buyerVariableStocksPurchased;
  //   const buyerFixedStockTaxes = Math.round(Math.max(
  //     (Math.max(0, buyerFixedFinalStockGains) /
  //       2) * parameters.combinedTaxRate,
  //   ));
  //   const buyerVariableStockTaxes = Math.round(Math.max(
  //     (Math.max(0, buyerVariableFinalStockGains) /
  //       2) * parameters.combinedTaxRate,
  //   ));
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "saleCosts",
  //     variable: "stockTaxes",
  //     amount: buyerFixedStockTaxes,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "saleCosts",
  //     variable: "stockTaxes",
  //     amount: buyerVariableStockTaxes,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "saleCosts",
  //     variable: "homeSellingFixedFees",
  //     amount: sellingFixedFees,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "saleCosts",
  //     variable: "homeSellingFixedFees",
  //     amount: sellingFixedFees,
  //   });

  //   const remainingYearsToTerm = 5 - ((yearIndex % 5) + 1);
  //   const fixedMortgagePenalty = getMortgagePenalty(
  //     {
  //       remainingYearsToTerm,
  //       mortgageBalance: fixedMortgagePaymentsForThisYear.balance,
  //       postedInterestRate: fixedMortgagePaymentsForThisYear.postedInterestRate,
  //       rateDiscount: fixedMortgagePaymentsForThisYear.rateDiscount,
  //       currentPostedRates: {
  //         5: parameters.buyer.fiveYearInterestRates[yearIndex],
  //         4: parameters.buyer.fourYearInterestRates[yearIndex],
  //         3: parameters.buyer.threeYearInterestRates[yearIndex],
  //         2: parameters.buyer.twoYearInterestRates[yearIndex],
  //         1: parameters.buyer.oneYearInterestRates[yearIndex],
  //       },
  //       mortgageType: "fixed",
  //     },
  //   );
  //   const variableMortgagePenalty = getMortgagePenalty(
  //     {
  //       remainingYearsToTerm,
  //       mortgageBalance: fixedMortgagePaymentsForThisYear.balance,
  //       postedInterestRate:
  //         fixedMortgagePaymentsForThisYear.effectiveInterestRate, // using the effective rate for variable mortgage
  //       rateDiscount: fixedMortgagePaymentsForThisYear.rateDiscount,
  //       currentPostedRates: {},
  //       mortgageType: "variable",
  //     },
  //   );
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "saleCosts",
  //     variable: "mortgagePenalty",
  //     amount: fixedMortgagePenalty,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "saleCosts",
  //     variable: "mortgagePenalty",
  //     amount: variableMortgagePenalty,
  //   });

  //   // Then the selling gains
  //   const renterStockSellingGains = renterStocks - renterStockTaxes;
  //   results.push({
  //     year,
  //     category: "renter",
  //     group: "saleGains",
  //     variable: "stockSellingGains",
  //     amount: renterStockSellingGains,
  //   });
  //   results.push({
  //     year,
  //     category: "renter",
  //     group: "saleGains",
  //     variable: "tsfaSellingGains",
  //     amount: renterTfsa,
  //   });

  //   const buyerFixedStockSellingGains = buyerFixedStocks - buyerFixedStockTaxes;
  //   const buyerVariableStockSellingGains = buyerVariableStocks -
  //     buyerVariableStockTaxes;
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "saleGains",
  //     variable: "stockSellingGains",
  //     amount: buyerFixedStockSellingGains,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "saleGains",
  //     variable: "stockSellingGains",
  //     amount: buyerVariableStockSellingGains,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "saleGains",
  //     variable: "tsfaSellingGains",
  //     amount: buyerFixedTfsa,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "saleGains",
  //     variable: "tsfaSellingGains",
  //     amount: buyerVariableTfsa,
  //   });
  //   const buyerFixedHomeSellingGains = homeValue -
  //     fixedMortgagePaymentsForThisYear.balance - fixedMortgagePenalty -
  //     homeSellingCommission -
  //     sellingFixedFees;
  //   const buyerVariableHomeSellingGains = homeValue -
  //     variableMortgagePaymentsForThisYear.balance - variableMortgagePenalty -
  //     homeSellingCommission -
  //     sellingFixedFees;
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "saleGains",
  //     variable: "homeSellingGains",
  //     amount: buyerVariableHomeSellingGains,
  //   });

  //   // Now we can calculate the final balances after selling
  //   const renterAssetsAfterSelling = renterStockSellingGains + renterTfsa;
  //   const renterOverallBalanceAfterSelling = renterAssetsAfterSelling -
  //     renterCumulativeExpenses;
  //   results.push({
  //     year,
  //     category: "renter",
  //     group: "summaryCumulative",
  //     variable: "balanceAfterSelling",
  //     amount: renterOverallBalanceAfterSelling,
  //   });

  //   const buyerFixedAssetsAfterSelling = buyerFixedStockSellingGains +
  //     buyerFixedTfsa +
  //     buyerFixedHomeSellingGains;
  //   const buyerVariableAssetsAfterSelling = buyerVariableStockSellingGains +
  //     buyerVariableTfsa +
  //     buyerVariableHomeSellingGains;
  //   const buyerFixedOverallBalanceAfterSelling = buyerFixedAssetsAfterSelling -
  //     buyerFixedCumulativeExpenses;
  //   const buyerVariableOverallBalanceAfterSelling =
  //     buyerVariableAssetsAfterSelling -
  //     buyerVariableCumulativeExpenses;
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "summaryCumulative",
  //     variable: "balanceAfterSelling",
  //     amount: buyerFixedOverallBalanceAfterSelling,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "summaryCumulative",
  //     variable: "balanceAfterSelling",
  //     amount: buyerVariableOverallBalanceAfterSelling,
  //   });

  //   // And, finally, we can calculate the difference in overall balance after selling
  //   results.push({
  //     year,
  //     category: "renter",
  //     group: "summaryCumulative",
  //     variable: "differenceAfterSellingWithBuyerFixed",
  //     amount: renterOverallBalanceAfterSelling -
  //       buyerFixedOverallBalanceAfterSelling,
  //   });
  //   results.push({
  //     year,
  //     category: "renter",
  //     group: "summaryCumulative",
  //     variable: "differenceAfterSellingWithBuyerVariable",
  //     amount: renterOverallBalanceAfterSelling -
  //       buyerVariableOverallBalanceAfterSelling,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "summaryCumulative",
  //     variable: "differenceAfterSellingWithRenter",
  //     amount: buyerFixedOverallBalanceAfterSelling -
  //       renterOverallBalanceAfterSelling,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerFixed",
  //     group: "summaryCumulative",
  //     variable: "differenceAfterSellingWithBuyerVariable",
  //     amount: buyerFixedOverallBalanceAfterSelling -
  //       buyerVariableOverallBalanceAfterSelling,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "summaryCumulative",
  //     variable: "differenceAfterSellingWithRenter",
  //     amount: buyerVariableOverallBalanceAfterSelling -
  //       renterOverallBalanceAfterSelling,
  //   });
  //   results.push({
  //     year,
  //     category: "buyerVariable",
  //     group: "summaryCumulative",
  //     variable: "differenceAfterSellingWithBuyerFixed",
  //     amount: buyerVariableOverallBalanceAfterSelling -
  //       buyerFixedOverallBalanceAfterSelling,
  //   });
  // }

  return results;
}
