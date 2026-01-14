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
    interestRates: number[];
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
              | "securityDeposit"
              | "stockTaxes";
          }
          | {
            group: "annualGains" | "cumulativeGains";
            variable:
              | "tfsaGains"
              | "tfsaContribution"
              | "marketGains"
              | "newStocks"
              | "stockSellingGains";
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
            variable: "difference" | "balance";
          }
        )
      | {
        category: "buyer";
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
              | "insurancePremium"
              | "stockTaxes"
              | "homeSellingCommission"
              | "homeSellingFixedFees";
          }
          | {
            group: "annualGains" | "cumulativeGains";
            variable:
              | "tfsaGains"
              | "tfsaContribution"
              | "marketGains"
              | "newStocks"
              | "stockSellingGains"
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
            variable: "difference" | "balance";
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
  let homeEquity = 0;
  let sellingFixedFees = parameters.buyer.sellingFixedFees;

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
  // Buyer
  let buyerCumulativeMortgageCapital = 0;
  let buyerCumulativeMortgageInterests = 0;
  let buyerCumulativeMaintenance = 0;
  let buyerCumulativePropertyTax = 0;
  let buyerCumulativeCondoFees = 0;
  let buyerCumulativeInsurance = 0;
  let buyerCumulativeExpenses = 0;
  let buyerStocks = 0;
  let buyerStocksPurchased = 0;
  let buyerCumulativeMarketGains = 0;
  let buyerTfsa = 0;
  let buyerTfsaGains = 0;
  let buyerCumulativeTfsaGains = 0;
  let buyerTfsaContribution = 0;
  let buyerCumulativeTfsaContributions = 0;
  let buyerCumulativeHomeEquityGains = 0;
  let buyerAssets = 0;

  // We precompute the insurance premium for the buyer
  const insurancePremium = mortgageInsurancePremium(
    parameters.buyer.purchasePrice,
    parameters.buyer.downPayment,
  );

  // We precompute the mortgage payments for the buyer for the entire period
  const annualMortgagePayments = precomputeMortgagePayments(
    parameters.numberOfYears,
    parameters.buyer.purchasePrice - parameters.buyer.downPayment,
    parameters.buyer.interestRates,
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

    // BUYER SETUP
    // We retrieve the mortgage payments for this year
    const mortgagePaymentsForThisYear = annualMortgagePayments[yearIndex];
    // We make sure everything is per year
    const buyAnnualCondoFees = buyMonthlyCondoFees * 12;
    const buyAnnualInsurance = buyMonthlyInsurance * 12;
    // Expenses
    results.push({
      year,
      category: "buyer",
      group: "annualExpenses",
      variable: "mortgageCapital",
      amount: mortgagePaymentsForThisYear.capital,
    });
    results.push({
      year,
      category: "buyer",
      group: "annualExpenses",
      variable: "mortgageInterests",
      amount: mortgagePaymentsForThisYear.interests,
    });
    results.push({
      year,
      category: "buyer",
      group: "annualExpenses",
      variable: "maintenance",
      amount: buyAnnualMaintenanceCost,
    });
    results.push({
      year,
      category: "buyer",
      group: "annualExpenses",
      variable: "propertyTax",
      amount: buyAnnualPropertyTax,
    });
    results.push({
      year,
      category: "buyer",
      group: "annualExpenses",
      variable: "condoFees",
      amount: buyAnnualCondoFees,
    });
    results.push({
      year,
      category: "buyer",
      group: "annualExpenses",
      variable: "insurance",
      amount: buyAnnualInsurance,
    });

    // We keep track of cumulative expenses
    buyerCumulativeMortgageCapital += mortgagePaymentsForThisYear.capital;
    results.push({
      year,
      category: "buyer",
      group: "cumulativeExpenses",
      variable: "mortgageCapital",
      amount: buyerCumulativeMortgageCapital,
    });
    buyerCumulativeMortgageInterests += mortgagePaymentsForThisYear.interests;
    results.push({
      year,
      category: "buyer",
      group: "cumulativeExpenses",
      variable: "mortgageInterests",
      amount: buyerCumulativeMortgageInterests,
    });
    buyerCumulativeMaintenance += buyAnnualMaintenanceCost;
    results.push({
      year,
      category: "buyer",
      group: "cumulativeExpenses",
      variable: "maintenance",
      amount: buyerCumulativeMaintenance,
    });
    buyerCumulativePropertyTax += buyAnnualPropertyTax;
    results.push({
      year,
      category: "buyer",
      group: "cumulativeExpenses",
      variable: "propertyTax",
      amount: buyerCumulativePropertyTax,
    });
    buyerCumulativeCondoFees += buyAnnualCondoFees;
    results.push({
      year,
      category: "buyer",
      group: "cumulativeExpenses",
      variable: "condoFees",
      amount: buyerCumulativeCondoFees,
    });
    buyerCumulativeInsurance += buyAnnualInsurance;
    results.push({
      year,
      category: "buyer",
      group: "cumulativeExpenses",
      variable: "insurance",
      amount: buyerCumulativeInsurance,
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
        category: "buyer",
        group: "annualExpenses",
        variable: "downPayment",
        amount: downPayment,
      });
      results.push({
        year,
        category: "buyer",
        group: "annualExpenses",
        variable: "purchaseFixedFees",
        amount: purchaseFixedFees,
      });
      results.push({
        year,
        category: "buyer",
        group: "annualExpenses",
        variable: "insurancePremium",
        amount: insurancePremiumForCurrentYear,
      });
    }
    results.push({
      year,
      category: "buyer",
      group: "cumulativeExpenses",
      variable: "downPayment",
      amount: parameters.buyer.downPayment,
    });
    results.push({
      year,
      category: "buyer",
      group: "cumulativeExpenses",
      variable: "purchaseFixedFees",
      amount: parameters.buyer.purchaseFixedFees,
    });
    results.push({
      year,
      category: "buyer",
      group: "cumulativeExpenses",
      variable: "insurancePremium",
      amount: insurancePremium,
    });

    // Total expenses, that we keep for comparison later
    const buyerExpenses = mortgagePaymentsForThisYear.capital +
      mortgagePaymentsForThisYear.interests +
      buyAnnualMaintenanceCost +
      buyAnnualPropertyTax +
      buyAnnualCondoFees +
      buyAnnualInsurance +
      downPayment +
      purchaseFixedFees + insurancePremiumForCurrentYear;
    // We keep track of cumulative expenses
    buyerCumulativeExpenses += buyerExpenses;

    // TFSA gains
    if (parameters.tfsaContributions) {
      buyerTfsaGains = Math.round(
        buyerTfsa * parameters.annualMarketReturnRate[yearIndex],
      );
      results.push({
        year,
        category: "buyer",
        group: "annualGains",
        variable: "tfsaGains",
        amount: buyerTfsaGains,
      });
      buyerCumulativeTfsaGains += buyerTfsaGains;
      results.push({
        year,
        category: "buyer",
        group: "cumulativeGains",
        variable: "tfsaGains",
        amount: buyerCumulativeTfsaGains,
      });
      // We will push the tfsa later after adjusting for the difference between renter and buyer expenses
      buyerTfsa += buyerTfsaGains;
    }

    // Market gains
    const buyerMarketGains = Math.round(
      buyerStocks * parameters.annualMarketReturnRate[yearIndex],
    );
    results.push({
      year,
      category: "buyer",
      group: "annualGains",
      variable: "marketGains",
      amount: buyerMarketGains,
    });
    buyerCumulativeMarketGains += buyerMarketGains;
    results.push({
      year,
      category: "buyer",
      group: "cumulativeGains",
      variable: "marketGains",
      amount: buyerCumulativeMarketGains,
    });
    // We will push the stocks later after adjusting for the difference between renter and buyer expenses
    buyerStocks += buyerMarketGains;

    // We appreciate the home value for the buyer
    const homeValueIncrease = Math.round(
      homeValue * parameters.buyer.appreciationIncrease[yearIndex],
    );
    homeValue += homeValueIncrease;

    // We store the previous year home equity for later calculations
    const previousYearHomeEquity = homeEquity;
    // We calculate the home equity for the buyer
    homeEquity = homeValue -
      mortgagePaymentsForThisYear.balance;

    results.push({
      year,
      category: "buyer",
      group: "assets",
      variable: "homeEquity",
      amount: homeEquity,
    });
    // We calculate the home equity gains for this year
    const homeEquityGains = homeEquity - previousYearHomeEquity;
    results.push({
      year,
      category: "buyer",
      group: "annualGains",
      variable: "homeEquityGains",
      amount: homeEquityGains,
    });
    buyerCumulativeHomeEquityGains += homeEquityGains;
    results.push({
      year,
      category: "buyer",
      group: "cumulativeGains",
      variable: "homeEquityGains",
      amount: buyerCumulativeHomeEquityGains,
    });

    // COMPARISON AND ADJUSTMENTS
    // We compare annual expenses of renter and buyer and decide where the difference should go to. We keep track of it for later.
    let renterSavings = 0;
    let buyerSavings = 0;
    if (renterExpenses < buyerExpenses) {
      renterSavings = buyerExpenses -
        renterExpenses;
    } else if (
      buyerExpenses < renterExpenses
    ) {
      buyerSavings = renterExpenses -
        buyerExpenses;
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

      const buyerContributionRoom = getTfsaContribution(
        year,
        buyerCumulativeTfsaContributions,
      );
      buyerTfsaContribution = Math.min(
        buyerContributionRoom,
        buyerSavings,
      );
      results.push({
        year,
        category: "buyer",
        group: "annualGains",
        variable: "tfsaContribution",
        amount: buyerTfsaContribution,
      });
      buyerCumulativeTfsaContributions += buyerTfsaContribution;
      results.push({
        year,
        category: "buyer",
        group: "cumulativeGains",
        variable: "tfsaContribution",
        amount: buyerCumulativeTfsaContributions,
      });
      buyerTfsa += buyerTfsaContribution;
      results.push({
        year,
        category: "buyer",
        group: "assets",
        variable: "tfsa",
        amount: buyerTfsa,
      });
    }

    // We adjust and push the savings as new stocks after TFSA contributions
    renterSavings -= renterTfsaContribution;
    buyerSavings -= buyerTfsaContribution;
    const renterNewStocks = renterSavings;
    const buyerNewStocks = buyerSavings;
    results.push({
      year,
      category: "renter",
      group: "annualGains",
      variable: "newStocks",
      amount: renterNewStocks,
    });
    results.push({
      year,
      category: "buyer",
      group: "annualGains",
      variable: "newStocks",
      amount: buyerNewStocks,
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
    buyerStocks += buyerNewStocks;
    results.push({
      year,
      category: "buyer",
      group: "assets",
      variable: "stocks",
      amount: buyerStocks,
    });
    buyerStocksPurchased += buyerNewStocks;

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
      category: "buyer",
      group: "cumulativeGains",
      variable: "newStocks",
      amount: buyerStocksPurchased,
    });

    // We calculate the total gains for this year
    const renterGains = renterMarketGains + renterTfsaGains + renterNewStocks +
      renterTfsaContribution;
    const buyerGains = buyerMarketGains + buyerTfsaGains + buyerNewStocks +
      buyerTfsaContribution + homeEquityGains;

    // We adjust the annual balances
    const renterBalance = renterGains - renterExpenses;
    results.push({
      year,
      category: "renter",
      group: "summary",
      variable: "balance",
      amount: renterBalance,
    });
    const buyerBalance = buyerGains - buyerExpenses;
    results.push({
      year,
      category: "buyer",
      group: "summary",
      variable: "balance",
      amount: buyerBalance,
    });

    // We calculate the overall assets so far
    renterAssets = renterStocks + renterTfsa;
    buyerAssets = buyerStocks + buyerTfsa + homeEquity;

    // We calculate the overall balances so far
    const renterOverallBalance = renterAssets - renterCumulativeExpenses;
    results.push({
      year,
      category: "renter",
      group: "summaryCumulative",
      variable: "balance",
      amount: renterOverallBalance,
    });
    const buyerOverallBalance = buyerAssets - buyerCumulativeExpenses;
    results.push({
      year,
      category: "buyer",
      group: "summaryCumulative",
      variable: "balance",
      amount: buyerOverallBalance,
    });

    // We calculate the difference in overall balance
    results.push({
      year,
      category: "renter",
      group: "summaryCumulative",
      variable: "difference",
      amount: renterOverallBalance - buyerOverallBalance,
    });
    results.push({
      year,
      category: "buyer",
      group: "summaryCumulative",
      variable: "difference",
      amount: buyerOverallBalance - renterOverallBalance,
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
  }

  // We sell everything at the end
  // First we calculate the selling costs

  // Renter
  // We don't forget to push all of the other cumulative expenses
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "renter",
    group: "cumulativeExpenses",
    variable: "rent",
    amount: renterCumulativeRent,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "renter",
    group: "cumulativeExpenses",
    variable: "insurance",
    amount: renterCumulativeInsurance,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "renter",
    group: "cumulativeExpenses",
    variable: "securityDeposit",
    amount: parameters.renter.securityDeposit,
  });

  const renterFinalStockGains = renterStocks - renterStocksPurchased;
  const renterStockTaxes = Math.round(Math.max(
    (Math.max(0, renterFinalStockGains) /
      2) * parameters.combinedTaxRate,
  ));
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "renter",
    group: "annualExpenses",
    variable: "stockTaxes",
    amount: renterStockTaxes,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "renter",
    group: "cumulativeExpenses",
    variable: "stockTaxes",
    amount: renterStockTaxes,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "renter",
    group: "annualGains",
    variable: "stockSellingGains",
    amount: renterFinalStockGains - renterStockTaxes,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "renter",
    group: "cumulativeGains",
    variable: "stockSellingGains",
    amount: renterFinalStockGains - renterStockTaxes,
  });

  // We adjust the assets
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "renter",
    group: "assets",
    variable: "stocks",
    amount: renterStocks - renterStockTaxes,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "renter",
    group: "assets",
    variable: "tfsa",
    amount: renterTfsa,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "renter",
    group: "assets",
    variable: "securityDeposit",
    amount: parameters.renter.securityDeposit,
  });

  // Buyer
  // We don't forget to push all of the other cumulative expenses
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "cumulativeExpenses",
    variable: "mortgageCapital",
    amount: buyerCumulativeMortgageCapital,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "cumulativeExpenses",
    variable: "mortgageInterests",
    amount: buyerCumulativeMortgageInterests,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "cumulativeExpenses",
    variable: "maintenance",
    amount: buyerCumulativeMaintenance,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "cumulativeExpenses",
    variable: "propertyTax",
    amount: buyerCumulativePropertyTax,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "cumulativeExpenses",
    variable: "condoFees",
    amount: buyerCumulativeCondoFees,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "cumulativeExpenses",
    variable: "insurance",
    amount: buyerCumulativeInsurance,
  });
  results.push({
    "year": parameters.startingYear + parameters.numberOfYears,
    "category": "buyer",
    "group": "cumulativeExpenses",
    "variable": "downPayment",
    "amount": parameters.buyer.downPayment,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "cumulativeExpenses",
    variable: "purchaseFixedFees",
    amount: parameters.buyer.purchaseFixedFees,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "cumulativeExpenses",
    variable: "insurancePremium",
    amount: insurancePremium,
  });

  const buyerFinalStockGains = buyerStocks - buyerStocksPurchased;
  const buyerStockTaxes = Math.round(Math.max(
    (Math.max(0, buyerFinalStockGains) /
      2) * parameters.combinedTaxRate,
  ));
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "annualExpenses",
    variable: "stockTaxes",
    amount: buyerStockTaxes,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "cumulativeExpenses",
    variable: "stockTaxes",
    amount: buyerStockTaxes,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "annualGains",
    variable: "stockSellingGains",
    amount: buyerFinalStockGains - buyerStockTaxes,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "cumulativeGains",
    variable: "stockSellingGains",
    amount: buyerFinalStockGains - buyerStockTaxes,
  });

  const buyerHomeSellingCommission = Math.round(
    homeValue * parameters.buyer.sellingCommissionRate,
  );
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "annualExpenses",
    variable: "homeSellingCommission",
    amount: buyerHomeSellingCommission,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "cumulativeExpenses",
    variable: "homeSellingCommission",
    amount: buyerHomeSellingCommission,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "annualExpenses",
    variable: "homeSellingFixedFees",
    amount: sellingFixedFees,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "cumulativeExpenses",
    variable: "homeSellingFixedFees",
    amount: sellingFixedFees,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "annualGains",
    variable: "homeSellingGains",
    amount: homeValue - buyerHomeSellingCommission - sellingFixedFees,
  });

  // We adjust the assets
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "assets",
    variable: "stocks",
    amount: buyerStocks - buyerStockTaxes,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "assets",
    variable: "tfsa",
    amount: buyerTfsa,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "assets",
    variable: "homeEquity",
    amount: homeValue - buyerHomeSellingCommission - sellingFixedFees,
  });

  // Then we calculate the final assets after selling stocks and paying selling costs
  // The cumulative expenses variables come from before the selling costs
  const renterAssetsAfterSelling = (renterAssets - renterStockTaxes) +
    parameters.renter.securityDeposit;
  const renterFinalBalance = renterAssetsAfterSelling -
    renterCumulativeExpenses;
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "renter",
    group: "summaryCumulative",
    variable: "balance",
    amount: renterFinalBalance,
  });

  const buyerSellingCosts = buyerStockTaxes + buyerHomeSellingCommission +
    sellingFixedFees;
  const buyerAssetsAfterSelling = buyerAssets - buyerSellingCosts;
  const buyerFinalBalance = buyerAssetsAfterSelling - buyerCumulativeExpenses;
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "summaryCumulative",
    variable: "balance",
    amount: buyerFinalBalance,
  });

  // We can now calculate the final difference
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "renter",
    group: "summaryCumulative",
    variable: "difference",
    amount: renterFinalBalance - buyerFinalBalance,
  });
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "summaryCumulative",
    variable: "difference",
    amount: buyerFinalBalance - renterFinalBalance,
  });

  return results;
}
