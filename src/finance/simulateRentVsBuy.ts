import getMortgagePenalty from "./helpers/getMortgagePenalty.ts";
import getTfsaContribution from "./helpers/getTfsaContribution.ts";
import precomputeMortgagePayments from "./helpers/precomputeMortgagePayments.ts";
import mortgageInsurancePremium from "./mortgageInsurancePremium.ts";

export default function simulateRentVsBuy(parameters: {
  startingYear: number;
  numberOfYears: number;
  annualMarketReturnRate: number[];
  tfsaContributions: boolean;
  combinedTaxRate: number;
  renter: {
    startingMonthlyRent: number;
    annualRentIncrease: number[];
    securityDeposit: number;
    startingMonthlyInsurance: number;
    annualInsuranceIncrease: number[];
  };
  buyer: {
    downPayment: number;
    purchasePrice: number;
    rateDiscount: number;
    fiveYearInterestRates: number[];
    fourYearInterestRates: number[];
    threeYearInterestRates: number[];
    twoYearInterestRates: number[];
    oneYearInterestRates: number[];
    // variableInterestRates: number[];
    purchaseFixedFees: number;
    startingAnnualMaintenanceCost: number;
    annualMaintenanceIncrease: number[];
    startingAnnualPropertyTax: number;
    annualPropertyTaxIncrease: number[];
    startingMonthlyCondoFees: number;
    annualCondoFeeIncrease: number[];
    startingMonthlyInsurance: number;
    annualInsuranceIncrease: number[];
    appreciationIncrease: number[];
    sellingFixedFees: number;
    sellingFixedFeesIncrease: number[];
    sellingCommissionRate: number;
  };
}) {
  const results: (
    & { year: number; amount: number }
    & (
      | {
        category: "renter";
      }
        & (
          | {
            group: "annualExpenses" | "cumulativeExpenses";
            variable:
              | "rent"
              | "insurance"
              | "securityDeposit";
          }
          | {
            group: "annualGains" | "cumulativeGains";
            variable:
              | "tfsaGains"
              | "tfsaContribution"
              | "marketGains"
              | "newStocks";
          }
          | {
            group: "assets";
            variable:
              | "tfsa"
              | "stocks"
              | "securityDeposit";
          }
          | {
            group: "summary" | "summaryCumulative";
            variable:
              | "difference"
              | "differenceAfterSelling"
              | "balance"
              | "balanceAfterSelling";
          }
          | {
            group: "saleCosts";
            variable: "stockTaxes";
          }
          | {
            group: "saleGains";
            variable: "stockSellingGains" | "tsfaSellingGains";
          }
        )
      | {
        category: "buyerFixed" | "buyerVariable";
      }
        & (
          | {
            group: "annualExpenses" | "cumulativeExpenses";
            variable:
              | "insurance"
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
            group: "annualGains" | "cumulativeGains";
            variable:
              | "tfsaGains"
              | "tfsaContribution"
              | "marketGains"
              | "newStocks"
              | "homeSellingGains"
              | "homeEquityGains";
          }
          | {
            group: "assets";
            variable:
              | "tfsa"
              | "stocks"
              | "homeEquity";
          }
          | {
            group: "summary" | "summaryCumulative";
            variable:
              | "difference"
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
            group: "saleGains";
            variable:
              | "stockSellingGains"
              | "tsfaSellingGains"
              | "homeSellingGains";
          }
        )
    )
  )[] = [];

  // Initial values in local variables to be able to adjust them year after year
  // Renter
  let rent = parameters.renter.startingMonthlyRent;
  let rentInsurance = parameters.renter.startingMonthlyInsurance;
  // Buyer
  let buyAnnualMaintenanceCost = parameters.buyer.startingAnnualMaintenanceCost;
  let buyAnnualPropertyTax = parameters.buyer.startingAnnualPropertyTax;
  let buyMonthlyCondoFees = parameters.buyer.startingMonthlyCondoFees;
  let buyMonthlyInsurance = parameters.buyer.startingMonthlyInsurance;
  let homeValue = parameters.buyer.purchasePrice;
  let sellingFixedFees = parameters.buyer.sellingFixedFees;
  // Buyer fixed
  let buyerFixedHomeEquity = 0;
  // Buyer variable
  // let buyerVariableHomeEquity = 0;

  // Local variables for cumulative calculations
  // Renter
  let renterCumulativeRent = 0;
  let renterCumulativeInsurance = 0;
  let renterCumulativeExpenses = 0;
  let renterStocks = 0;
  let renterStocksPurchased = 0;
  let renterCumulativeMarketGains = 0;
  let renterTfsa = 0;
  let renterTfsaGains = 0;
  let renterCumulativeTfsaGains = 0;
  let renterTfsaContribution = 0;
  let renterCumulativeTfsaContributions = 0;
  let renterAssets = 0;
  // Buyer fixed
  let buyerFixedCumulativeMaintenance = 0;
  let buyerFixedCumulativePropertyTax = 0;
  let buyerFixedCumulativeCondoFees = 0;
  let buyerFixedCumulativeInsurance = 0;
  let buyerFixedCumulativeExpenses = 0;
  let buyerFixedCumulativeMortgageCapital = 0;
  let buyerFixedCumulativeMortgageInterests = 0;
  let buyerFixedStocks = 0;
  let buyerFixedStocksPurchased = 0;
  let buyerFixedCumulativeMarketGains = 0;
  let buyerFixedTfsa = 0;
  let buyerFixedTfsaGains = 0;
  let buyerFixedCumulativeTfsaGains = 0;
  let buyerFixedTfsaContribution = 0;
  let buyerFixedCumulativeTfsaContributions = 0;
  let buyerFixedCumulativeHomeEquityGains = 0;
  let buyerFixedAssets = 0;
  // Buyer variable
  // let buyerVariableCumulativeMaintenance = 0;
  // let buyerVariableCumulativePropertyTax = 0;
  // let buyerVariableCumulativeCondoFees = 0;
  // let buyerVariableCumulativeInsurance = 0;
  // let buyerVariableCumulativeExpenses = 0;
  // let buyerVariableCumulativeMortgageCapital = 0;
  // let buyerVariableCumulativeMortgageInterests = 0;
  // let buyerVariableStocks = 0;
  // let buyerVariableStocksPurchased = 0;
  // let buyerVariableCumulativeMarketGains = 0;
  // let buyerVariableTfsa = 0;
  // let buyerVariableTfsaGains = 0;
  // let buyerVariableCumulativeTfsaGains = 0;
  // let buyerVariableTfsaContribution = 0;
  // let buyerVariableCumulativeTfsaContributions = 0;
  // let buyerVariableCumulativeHomeEquityGains = 0;
  // let buyerVariableAssets = 0;

  // We precompute the insurance premium for the buyer
  const insurancePremium = mortgageInsurancePremium(
    parameters.buyer.purchasePrice,
    parameters.buyer.downPayment,
  );

  // We precompute the mortgage payments for the buyer for the entire period
  const annualFixedMortgagePayments = precomputeMortgagePayments(
    parameters.numberOfYears,
    parameters.buyer.purchasePrice - parameters.buyer.downPayment,
    parameters.buyer.rateDiscount,
    parameters.buyer.fiveYearInterestRates,
  );

  for (
    let year = parameters.startingYear;
    year < parameters.startingYear + parameters.numberOfYears;
    year++
  ) {
    const yearIndex = year - parameters.startingYear;

    // RENTER SETUP
    // Expenses
    const annualRent = rent * 12;
    results.push({
      year,
      category: "renter",
      group: "annualExpenses",
      variable: "rent",
      amount: annualRent,
    });
    const annualRentInsurance = rentInsurance * 12;
    results.push({
      year,
      category: "renter",
      group: "annualExpenses",
      variable: "insurance",
      amount: annualRentInsurance,
    });
    // We keep track of cumulative expenses
    renterCumulativeRent += annualRent;
    results.push({
      year,
      category: "renter",
      group: "cumulativeExpenses",
      variable: "rent",
      amount: renterCumulativeRent,
    });
    renterCumulativeInsurance += annualRentInsurance;
    results.push({
      year,
      category: "renter",
      group: "cumulativeExpenses",
      variable: "insurance",
      amount: renterCumulativeInsurance,
    });

    // Non-recurring expenses
    const securityDeposit = year === parameters.startingYear
      ? parameters.renter.securityDeposit
      : 0;
    if (year === parameters.startingYear) {
      results.push({
        year,
        category: "renter",
        group: "annualExpenses",
        variable: "securityDeposit",
        amount: securityDeposit,
      });
    }
    results.push({
      year,
      category: "renter",
      group: "cumulativeExpenses",
      variable: "securityDeposit",
      amount: parameters.renter.securityDeposit,
    });

    // Total expenses, that we keep for comparison later
    const renterExpenses = annualRent + annualRentInsurance +
      securityDeposit;
    // We keep track of cumulative expenses
    renterCumulativeExpenses += renterExpenses;

    // TFSA gains
    if (parameters.tfsaContributions) {
      renterTfsaGains = Math.round(
        renterTfsa * parameters.annualMarketReturnRate[yearIndex],
      );
      results.push({
        year,
        category: "renter",
        group: "annualGains",
        variable: "tfsaGains",
        amount: renterTfsaGains,
      });
      renterCumulativeTfsaGains += renterTfsaGains;
      results.push({
        year,
        category: "renter",
        group: "cumulativeGains",
        variable: "tfsaGains",
        amount: renterCumulativeTfsaGains,
      });
      // We will push the tfsa later after adjusting for the difference between renter and buyer expenses
      renterTfsa += renterTfsaGains;
    }

    // Market gains
    const renterMarketGains = Math.round(
      renterStocks * parameters.annualMarketReturnRate[yearIndex],
    );
    results.push({
      year,
      category: "renter",
      group: "annualGains",
      variable: "marketGains",
      amount: renterMarketGains,
    });
    renterCumulativeMarketGains += renterMarketGains;
    results.push({
      year,
      category: "renter",
      group: "cumulativeGains",
      variable: "marketGains",
      amount: renterCumulativeMarketGains,
    });
    // We will push the stocks later after adjusting for the difference between renter and buyer expenses
    renterStocks += renterMarketGains;

    // BUYER FIXED/VARIABLE SETUP
    // We make sure everything is per year
    const buyAnnualCondoFees = buyMonthlyCondoFees * 12;
    const buyAnnualInsurance = buyMonthlyInsurance * 12;
    // We retrieve the mortgage payments for this year
    const fixedMortgagePaymentsForThisYear =
      annualFixedMortgagePayments[yearIndex];
    // Expenses
    results.push({
      year,
      category: "buyerFixed",
      group: "annualExpenses",
      variable: "mortgageCapital",
      amount: fixedMortgagePaymentsForThisYear.capital,
    });
    results.push({
      year,
      category: "buyerFixed",
      group: "annualExpenses",
      variable: "mortgageInterests",
      amount: fixedMortgagePaymentsForThisYear.interests,
    });
    results.push({
      year,
      category: "buyerFixed",
      group: "annualExpenses",
      variable: "maintenance",
      amount: buyAnnualMaintenanceCost,
    });
    results.push({
      year,
      category: "buyerFixed",
      group: "annualExpenses",
      variable: "propertyTax",
      amount: buyAnnualPropertyTax,
    });
    results.push({
      year,
      category: "buyerFixed",
      group: "annualExpenses",
      variable: "condoFees",
      amount: buyAnnualCondoFees,
    });
    results.push({
      year,
      category: "buyerFixed",
      group: "annualExpenses",
      variable: "insurance",
      amount: buyAnnualInsurance,
    });

    // We keep track of cumulative expenses
    buyerFixedCumulativeMortgageCapital +=
      fixedMortgagePaymentsForThisYear.capital;
    results.push({
      year,
      category: "buyerFixed",
      group: "cumulativeExpenses",
      variable: "mortgageCapital",
      amount: buyerFixedCumulativeMortgageCapital,
    });
    buyerFixedCumulativeMortgageInterests +=
      fixedMortgagePaymentsForThisYear.interests;
    results.push({
      year,
      category: "buyerFixed",
      group: "cumulativeExpenses",
      variable: "mortgageInterests",
      amount: buyerFixedCumulativeMortgageInterests,
    });
    buyerFixedCumulativeMaintenance += buyAnnualMaintenanceCost;
    results.push({
      year,
      category: "buyerFixed",
      group: "cumulativeExpenses",
      variable: "maintenance",
      amount: buyerFixedCumulativeMaintenance,
    });
    buyerFixedCumulativePropertyTax += buyAnnualPropertyTax;
    results.push({
      year,
      category: "buyerFixed",
      group: "cumulativeExpenses",
      variable: "propertyTax",
      amount: buyerFixedCumulativePropertyTax,
    });
    buyerFixedCumulativeCondoFees += buyAnnualCondoFees;
    results.push({
      year,
      category: "buyerFixed",
      group: "cumulativeExpenses",
      variable: "condoFees",
      amount: buyerFixedCumulativeCondoFees,
    });
    buyerFixedCumulativeInsurance += buyAnnualInsurance;
    results.push({
      year,
      category: "buyerFixed",
      group: "cumulativeExpenses",
      variable: "insurance",
      amount: buyerFixedCumulativeInsurance,
    });

    // Non-recurring expenses
    const downPayment = year === parameters.startingYear
      ? parameters.buyer.downPayment
      : 0;
    const purchaseFixedFees = year === parameters.startingYear
      ? parameters.buyer.purchaseFixedFees
      : 0;
    const insurancePremiumForCurrentYear = year === parameters.startingYear
      ? insurancePremium
      : 0;
    if (year === parameters.startingYear) {
      results.push({
        year,
        category: "buyerFixed",
        group: "annualExpenses",
        variable: "downPayment",
        amount: downPayment,
      });
      results.push({
        year,
        category: "buyerFixed",
        group: "annualExpenses",
        variable: "purchaseFixedFees",
        amount: purchaseFixedFees,
      });
      results.push({
        year,
        category: "buyerFixed",
        group: "annualExpenses",
        variable: "insurancePremium",
        amount: insurancePremiumForCurrentYear,
      });
    }
    results.push({
      year,
      category: "buyerFixed",
      group: "cumulativeExpenses",
      variable: "downPayment",
      amount: parameters.buyer.downPayment,
    });
    results.push({
      year,
      category: "buyerFixed",
      group: "cumulativeExpenses",
      variable: "purchaseFixedFees",
      amount: parameters.buyer.purchaseFixedFees,
    });
    results.push({
      year,
      category: "buyerFixed",
      group: "cumulativeExpenses",
      variable: "insurancePremium",
      amount: insurancePremium,
    });

    // Total expenses, that we keep for comparison later
    const buyerFixedExpenses = fixedMortgagePaymentsForThisYear.capital +
      fixedMortgagePaymentsForThisYear.interests +
      buyAnnualMaintenanceCost +
      buyAnnualPropertyTax +
      buyAnnualCondoFees +
      buyAnnualInsurance +
      downPayment +
      purchaseFixedFees + insurancePremiumForCurrentYear;
    // We keep track of cumulative expenses
    buyerFixedCumulativeExpenses += buyerFixedExpenses;

    // TFSA gains
    if (parameters.tfsaContributions) {
      buyerFixedTfsaGains = Math.round(
        buyerFixedTfsa * parameters.annualMarketReturnRate[yearIndex],
      );
      results.push({
        year,
        category: "buyerFixed",
        group: "annualGains",
        variable: "tfsaGains",
        amount: buyerFixedTfsaGains,
      });
      buyerFixedCumulativeTfsaGains += buyerFixedTfsaGains;
      results.push({
        year,
        category: "buyerFixed",
        group: "cumulativeGains",
        variable: "tfsaGains",
        amount: buyerFixedCumulativeTfsaGains,
      });
      // We will push the tfsa later after adjusting for the difference between renter and buyer expenses
      buyerFixedTfsa += buyerFixedTfsaGains;
    }

    // Market gains
    const buyerFixedMarketGains = Math.round(
      buyerFixedStocks * parameters.annualMarketReturnRate[yearIndex],
    );
    results.push({
      year,
      category: "buyerFixed",
      group: "annualGains",
      variable: "marketGains",
      amount: buyerFixedMarketGains,
    });
    buyerFixedCumulativeMarketGains += buyerFixedMarketGains;
    results.push({
      year,
      category: "buyerFixed",
      group: "cumulativeGains",
      variable: "marketGains",
      amount: buyerFixedCumulativeMarketGains,
    });
    // We will push the stocks later after adjusting for the difference between renter and buyer expenses
    buyerFixedStocks += buyerFixedMarketGains;

    // We appreciate the home value for the buyer
    const homeValueIncrease = Math.round(
      homeValue * parameters.buyer.appreciationIncrease[yearIndex],
    );
    homeValue += homeValueIncrease;

    // We store the previous year home equity for later calculations
    const buyerFixedPreviousYearHomeEquity = buyerFixedHomeEquity;
    // We calculate the home equity for the buyer
    buyerFixedHomeEquity = homeValue -
      fixedMortgagePaymentsForThisYear.balance;

    results.push({
      year,
      category: "buyerFixed",
      group: "assets",
      variable: "homeEquity",
      amount: buyerFixedHomeEquity,
    });
    // We calculate the home equity gains for this year
    const buyerFixedHomeEquityGains = buyerFixedHomeEquity -
      buyerFixedPreviousYearHomeEquity;
    results.push({
      year,
      category: "buyerFixed",
      group: "annualGains",
      variable: "homeEquityGains",
      amount: buyerFixedHomeEquityGains,
    });
    buyerFixedCumulativeHomeEquityGains += buyerFixedHomeEquityGains;
    results.push({
      year,
      category: "buyerFixed",
      group: "cumulativeGains",
      variable: "homeEquityGains",
      amount: buyerFixedCumulativeHomeEquityGains,
    });

    // COMPARISON AND ADJUSTMENTS
    // We compare annual expenses of renter and buyer and decide where the difference should go to. We keep track of it for later.
    let renterSavings = 0;
    let buyerFixedSavings = 0;
    if (renterExpenses < buyerFixedExpenses) {
      renterSavings = buyerFixedExpenses -
        renterExpenses;
    } else if (
      buyerFixedExpenses < renterExpenses
    ) {
      buyerFixedSavings = renterExpenses -
        buyerFixedExpenses;
    }

    // We adjust TFSA contributions if applicable
    if (parameters.tfsaContributions) {
      const renterContributionRoom = getTfsaContribution(
        year,
        renterCumulativeTfsaContributions,
      );
      renterTfsaContribution = Math.min(
        renterContributionRoom,
        renterSavings,
      );
      results.push({
        year,
        category: "renter",
        group: "annualGains",
        variable: "tfsaContribution",
        amount: renterTfsaContribution,
      });
      renterCumulativeTfsaContributions += renterTfsaContribution;
      results.push({
        year,
        category: "renter",
        group: "cumulativeGains",
        variable: "tfsaContribution",
        amount: renterCumulativeTfsaContributions,
      });
      renterTfsa += renterTfsaContribution;
      results.push({
        year,
        category: "renter",
        group: "assets",
        variable: "tfsa",
        amount: renterTfsa,
      });

      const buyerFixedContributionRoom = getTfsaContribution(
        year,
        buyerFixedCumulativeTfsaContributions,
      );
      buyerFixedTfsaContribution = Math.min(
        buyerFixedContributionRoom,
        buyerFixedSavings,
      );
      results.push({
        year,
        category: "buyerFixed",
        group: "annualGains",
        variable: "tfsaContribution",
        amount: buyerFixedTfsaContribution,
      });
      buyerFixedCumulativeTfsaContributions += buyerFixedTfsaContribution;
      results.push({
        year,
        category: "buyerFixed",
        group: "cumulativeGains",
        variable: "tfsaContribution",
        amount: buyerFixedCumulativeTfsaContributions,
      });
      buyerFixedTfsa += buyerFixedTfsaContribution;
      results.push({
        year,
        category: "buyerFixed",
        group: "assets",
        variable: "tfsa",
        amount: buyerFixedTfsa,
      });
    }

    // We adjust and push the savings as new stocks after TFSA contributions
    renterSavings -= renterTfsaContribution;
    buyerFixedSavings -= buyerFixedTfsaContribution;
    const renterNewStocks = renterSavings;
    const buyerFixedNewStocks = buyerFixedSavings;
    results.push({
      year,
      category: "renter",
      group: "annualGains",
      variable: "newStocks",
      amount: renterNewStocks,
    });
    results.push({
      year,
      category: "buyerFixed",
      group: "annualGains",
      variable: "newStocks",
      amount: buyerFixedNewStocks,
    });

    // We adjust the stocks accordingly and now can push it
    renterStocks += renterNewStocks;
    results.push({
      year,
      category: "renter",
      group: "assets",
      variable: "stocks",
      amount: renterStocks,
    });
    renterStocksPurchased += renterNewStocks;
    buyerFixedStocks += buyerFixedNewStocks;
    results.push({
      year,
      category: "buyerFixed",
      group: "assets",
      variable: "stocks",
      amount: buyerFixedStocks,
    });
    buyerFixedStocksPurchased += buyerFixedNewStocks;

    // We push the cumulative stock purchase
    results.push({
      year,
      category: "renter",
      group: "cumulativeGains",
      variable: "newStocks",
      amount: renterStocksPurchased,
    });
    results.push({
      year,
      category: "buyerFixed",
      group: "cumulativeGains",
      variable: "newStocks",
      amount: buyerFixedStocksPurchased,
    });

    // We calculate the total gains for this year
    const renterGains = renterMarketGains + renterTfsaGains + renterNewStocks +
      renterTfsaContribution;
    const buyerFixedGains = buyerFixedMarketGains + buyerFixedTfsaGains +
      buyerFixedNewStocks +
      buyerFixedTfsaContribution + buyerFixedHomeEquityGains;

    // We adjust the annual balances
    const renterBalance = renterGains - renterExpenses;
    results.push({
      year,
      category: "renter",
      group: "summary",
      variable: "balance",
      amount: renterBalance,
    });
    const buyerFixedBalance = buyerFixedGains - buyerFixedExpenses;
    results.push({
      year,
      category: "buyerFixed",
      group: "summary",
      variable: "balance",
      amount: buyerFixedBalance,
    });

    // We calculate the overall assets so far
    renterAssets = renterStocks + renterTfsa;
    buyerFixedAssets = buyerFixedStocks + buyerFixedTfsa + buyerFixedHomeEquity;

    // We calculate the overall balances so far
    const renterOverallBalance = renterAssets - renterCumulativeExpenses;
    results.push({
      year,
      category: "renter",
      group: "summaryCumulative",
      variable: "balance",
      amount: renterOverallBalance,
    });
    const buyerFixedOverallBalance = buyerFixedAssets -
      buyerFixedCumulativeExpenses;
    results.push({
      year,
      category: "buyerFixed",
      group: "summaryCumulative",
      variable: "balance",
      amount: buyerFixedOverallBalance,
    });

    // We calculate the difference in overall balance
    results.push({
      year,
      category: "renter",
      group: "summaryCumulative",
      variable: "difference",
      amount: renterOverallBalance - buyerFixedOverallBalance,
    });
    results.push({
      year,
      category: "buyerFixed",
      group: "summaryCumulative",
      variable: "difference",
      amount: buyerFixedOverallBalance - renterOverallBalance,
    });

    // We adjust for following year
    // RENTER
    rent = Math.round(
      rent * (1 + parameters.renter.annualRentIncrease[yearIndex]),
    );
    rentInsurance = Math.round(
      rentInsurance *
        (1 + parameters.renter.annualInsuranceIncrease[yearIndex]),
    );
    // BUYER
    buyAnnualMaintenanceCost = Math.round(
      buyAnnualMaintenanceCost *
        (1 + parameters.buyer.annualMaintenanceIncrease[yearIndex]),
    );
    buyAnnualPropertyTax = Math.round(
      buyAnnualPropertyTax *
        (1 + parameters.buyer.annualPropertyTaxIncrease[yearIndex]),
    );
    buyMonthlyCondoFees = Math.round(
      buyMonthlyCondoFees *
        (1 + parameters.buyer.annualCondoFeeIncrease[yearIndex]),
    );
    buyMonthlyInsurance = Math.round(
      buyMonthlyInsurance *
        (1 + parameters.buyer.annualInsuranceIncrease[yearIndex]),
    );
    sellingFixedFees = Math.round(
      sellingFixedFees *
        (1 + parameters.buyer.sellingFixedFeesIncrease[yearIndex]),
    );

    // We simulate a sell each year

    // First we calculate the selling costs
    const renterFinalStockGains = renterStocks - renterStocksPurchased;
    const renterStockTaxes = Math.round(Math.max(
      (Math.max(0, renterFinalStockGains) /
        2) * parameters.combinedTaxRate,
    ));
    results.push({
      year,
      category: "renter",
      group: "saleCosts",
      variable: "stockTaxes",
      amount: renterStockTaxes,
    });

    const homeSellingCommission = Math.round(
      homeValue * parameters.buyer.sellingCommissionRate,
    );
    results.push({
      year,
      category: "buyerFixed",
      group: "saleCosts",
      variable: "homeSellingCommission",
      amount: homeSellingCommission,
    });

    const buyerFixedFinalStockGains = buyerFixedStocks -
      buyerFixedStocksPurchased;
    const buyerFixedStockTaxes = Math.round(Math.max(
      (Math.max(0, buyerFixedFinalStockGains) /
        2) * parameters.combinedTaxRate,
    ));
    results.push({
      year,
      category: "buyerFixed",
      group: "saleCosts",
      variable: "stockTaxes",
      amount: buyerFixedStockTaxes,
    });
    results.push({
      year,
      category: "buyerFixed",
      group: "saleCosts",
      variable: "homeSellingFixedFees",
      amount: sellingFixedFees,
    });

    const remainingYearsToTerm = 5 - ((yearIndex % 5) + 1);
    const fixedMortgagePenalty = getMortgagePenalty(
      {
        remainingYearsToTerm,
        mortgageBalance: fixedMortgagePaymentsForThisYear.balance,
        postedInterestRate: fixedMortgagePaymentsForThisYear.postedInterestRate,
        rateDiscount: fixedMortgagePaymentsForThisYear.rateDiscount,
        currentPostedRates: {
          5: parameters.buyer.fiveYearInterestRates[yearIndex],
          4: parameters.buyer.fourYearInterestRates[yearIndex],
          3: parameters.buyer.threeYearInterestRates[yearIndex],
          2: parameters.buyer.twoYearInterestRates[yearIndex],
          1: parameters.buyer.oneYearInterestRates[yearIndex],
        },
      },
    );
    results.push({
      year,
      category: "buyerFixed",
      group: "saleCosts",
      variable: "mortgagePenalty",
      amount: fixedMortgagePenalty,
    });

    // Then the selling gains
    const renterStockSellingGains = renterStocks - renterStockTaxes;
    results.push({
      year,
      category: "renter",
      group: "saleGains",
      variable: "stockSellingGains",
      amount: renterStockSellingGains,
    });
    results.push({
      year,
      category: "renter",
      group: "saleGains",
      variable: "tsfaSellingGains",
      amount: renterTfsa,
    });

    const buyerFixedStockSellingGains = buyerFixedStocks - buyerFixedStockTaxes;
    results.push({
      year,
      category: "buyerFixed",
      group: "saleGains",
      variable: "stockSellingGains",
      amount: buyerFixedStockSellingGains,
    });
    results.push({
      year,
      category: "buyerFixed",
      group: "saleGains",
      variable: "tsfaSellingGains",
      amount: buyerFixedTfsa,
    });
    const buyerFixedHomeSellingGains = homeValue -
      fixedMortgagePaymentsForThisYear.balance - fixedMortgagePenalty -
      homeSellingCommission -
      sellingFixedFees;
    results.push({
      year,
      category: "buyerFixed",
      group: "saleGains",
      variable: "homeSellingGains",
      amount: buyerFixedHomeSellingGains,
    });

    // Now we can calculate the final balances after selling
    const renterAssetsAfterSelling = renterStockSellingGains + renterTfsa;
    const renterOverallBalanceAfterSelling = renterAssetsAfterSelling -
      renterCumulativeExpenses;
    results.push({
      year,
      category: "renter",
      group: "summaryCumulative",
      variable: "balanceAfterSelling",
      amount: renterOverallBalanceAfterSelling,
    });

    const buyerFixedAssetsAfterSelling = buyerFixedStockSellingGains +
      buyerFixedTfsa +
      buyerFixedHomeSellingGains;
    const buyerFixedOverallBalanceAfterSelling = buyerFixedAssetsAfterSelling -
      buyerFixedCumulativeExpenses;
    results.push({
      year,
      category: "buyerFixed",
      group: "summaryCumulative",
      variable: "balanceAfterSelling",
      amount: buyerFixedOverallBalanceAfterSelling,
    });

    // And, finally, we can calculate the difference in overall balance after selling
    results.push({
      year,
      category: "renter",
      group: "summaryCumulative",
      variable: "differenceAfterSelling",
      amount: renterOverallBalanceAfterSelling -
        buyerFixedOverallBalanceAfterSelling,
    });
    results.push({
      year,
      category: "buyerFixed",
      group: "summaryCumulative",
      variable: "differenceAfterSelling",
      amount: buyerFixedOverallBalanceAfterSelling -
        renterOverallBalanceAfterSelling,
    });
  }

  return results;
}
