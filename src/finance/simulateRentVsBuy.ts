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
              | "newStocks";
          }
          | {
            group: "assets";
            variable:
              | "tfsa"
              | "stocks";
          }
          | {
            group: "summary";
            variable: "difference";
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
            group: "summary";
            variable: "sellingCosts";
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
  let renterTfsaContributions = 0;
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
  let buyerTfsaContributions = 0;
  let buyerCumulativeTfsaContributions = 0;
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
      renterTfsaContributions = Math.min(
        renterContributionRoom,
        renterSavings,
      );
      results.push({
        year,
        category: "renter",
        group: "annualGains",
        variable: "tfsaContribution",
        amount: renterTfsaContributions,
      });
      renterCumulativeTfsaContributions += renterTfsaContributions;
      results.push({
        year,
        category: "renter",
        group: "cumulativeGains",
        variable: "tfsaContribution",
        amount: renterCumulativeTfsaContributions,
      });
      renterTfsa += renterTfsaContributions;
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
      buyerTfsaContributions = Math.min(
        buyerContributionRoom,
        buyerSavings,
      );
      results.push({
        year,
        category: "buyer",
        group: "annualGains",
        variable: "tfsaContribution",
        amount: buyerTfsaContributions,
      });
      buyerCumulativeTfsaContributions += buyerTfsaContributions;
      results.push({
        year,
        category: "buyer",
        group: "cumulativeGains",
        variable: "tfsaContribution",
        amount: buyerCumulativeTfsaContributions,
      });
      buyerTfsa += buyerTfsaContributions;
      results.push({
        year,
        category: "buyer",
        group: "assets",
        variable: "tfsa",
        amount: buyerTfsa,
      });
    }

    // We adjust and push the savings as new stocks after TFSA contributions
    renterSavings -= renterTfsaContributions;
    buyerSavings -= buyerTfsaContributions;
    results.push({
      year,
      category: "renter",
      group: "annualGains",
      variable: "newStocks",
      amount: renterSavings,
    });
    results.push({
      year,
      category: "buyer",
      group: "annualGains",
      variable: "newStocks",
      amount: buyerSavings,
    });

    // We adjust the stocks accordingly and now can push it
    renterStocks += renterSavings;
    results.push({
      year,
      category: "renter",
      group: "assets",
      variable: "stocks",
      amount: renterStocks,
    });
    renterStocksPurchased += renterSavings;
    buyerStocks += buyerSavings;
    results.push({
      year,
      category: "buyer",
      group: "assets",
      variable: "stocks",
      amount: buyerStocks,
    });
    buyerStocksPurchased += buyerSavings;

    // We calculate the total gains for this year
    const renterGains = renterMarketGains + renterTfsaGains + renterSavings;
    const buyerGains = buyerMarketGains + buyerTfsaGains + buyerSavings +
      homeEquityGains;

    // We adjust the balances
    const _renterBalance = renterGains - renterExpenses;
    // The buyer balance includes home equity gains
    const _buyerBalance = buyerGains - buyerExpenses;

    // We calculate the overall assets so far
    renterAssets = renterStocks + renterTfsa;
    buyerAssets = buyerStocks + buyerTfsa + homeEquity;

    // Now we can check who has the highest assets
    results.push({
      year,
      category: "renter",
      group: "summary",
      variable: "difference",
      amount: renterAssets - buyerAssets,
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
  // Renter
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
  // We don't forget to return the security deposit
  const _renterAssetsAfterSelling = (renterAssets - renterStockTaxes) +
    parameters.renter.securityDeposit;
  // Buyer
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
    group: "annualExpenses",
    variable: "homeSellingFixedFees",
    amount: sellingFixedFees,
  });
  const buyerSellingCosts = buyerStockTaxes + buyerHomeSellingCommission +
    sellingFixedFees;
  results.push({
    year: parameters.startingYear + parameters.numberOfYears,
    category: "buyer",
    group: "summary",
    variable: "sellingCosts",
    amount: buyerSellingCosts,
  });
  const _buyerAssetsAfterSelling = buyerAssets - buyerSellingCosts;

  return results;
}
