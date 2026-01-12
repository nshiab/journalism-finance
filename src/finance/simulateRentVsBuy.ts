import getTfsaContribution from "./helpers/getTfsaContribution.ts";
import precomputeMortgagePayments from "./helpers/precomputeMortgagePayments.ts";
import mortgageInsurancePremium from "./mortgageInsurancePremium.ts";

export default function simulateRentVsBuy(parameters: {
  startingYear: number;
  numberOfYears: number;
  annualMarketReturnRate: number[];
  tfsaContributions: boolean;
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
    interestRate: number;
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
  };
}) {
  const results: {
    year: number;
    category: "renter" | "buyer";
    variable:
      | "rent"
      | "insurance"
      | "cumulativeRent"
      | "cumulativeInsurance"
      | "securityDeposit"
      | "cumulativeSecurityDeposit"
      | "expenses"
      | "cumulativeExpenses"
      | "marketGains"
      | "cumulativeMarketGains"
      | "stocks"
      | "tfsaGains"
      | "tfsaContributions"
      | "cumulativeTfsaContributions"
      | "cumulativeTfsaGains"
      | "tfsa"
      | "newStocks"
      | "gains"
      | "balance"
      | "assets"
      | "difference"
      | "mortgageCapital"
      | "mortgageInterests"
      | "maintenance"
      | "propertyTax"
      | "condoFees"
      | "cumulativeMortgageCapital"
      | "cumulativeMortgageInterests"
      | "cumulativeMaintenance"
      | "cumulativePropertyTax"
      | "cumulativeCondoFees"
      | "downPayment"
      | "purchaseFixedFees"
      | "insurancePremium"
      | "cumulativeDownPayment"
      | "cumulativePurchaseFixedFees"
      | "cumulativeInsurancePremium"
      | "homeValueIncrease"
      | "homeValue"
      | "homeEquity"
      | "homeEquityGains";
    amount: number;
  }[] = [];

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

  // Local variables for cumulative calculations
  // Renter
  let renterCumulativeRent = 0;
  let renterCumulativeInsurance = 0;
  let renterCumulativeExpenses = 0;
  let renterStocks = 0;
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
  let buyerCumulativeMarketGains = 0;
  let buyerTfsa = 0;
  let buyerTfsaGains = 0;
  let buyerCumulativeTfsaGains = 0;
  let buyerTfsaContributions = 0;
  let buyerCumulativeTfsaContributions = 0;
  let buyerAssets = 0;

  // We precompute the mortgage payments for the buyer for the entire period
  const annualMortgagePayments = precomputeMortgagePayments(
    parameters.numberOfYears,
    parameters.buyer.purchasePrice - parameters.buyer.downPayment,
    parameters.buyer.interestRate,
  );

  // We precompute the insurance premium for the buyer
  const insurancePremium = mortgageInsurancePremium(
    parameters.buyer.purchasePrice,
    parameters.buyer.downPayment,
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
      variable: "rent",
      amount: annualRent,
    });
    const annualRentInsurance = rentInsurance * 12;
    results.push({
      year,
      category: "renter",
      variable: "insurance",
      amount: annualRentInsurance,
    });
    // We keep track of cumulative expenses
    renterCumulativeRent += annualRent;
    results.push({
      year,
      category: "renter",
      variable: "cumulativeRent",
      amount: renterCumulativeRent,
    });
    renterCumulativeInsurance += annualRentInsurance;
    results.push({
      year,
      category: "renter",
      variable: "cumulativeInsurance",
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
        variable: "securityDeposit",
        amount: securityDeposit,
      });
    }
    results.push({
      year,
      category: "renter",
      variable: "cumulativeSecurityDeposit",
      amount: parameters.renter.securityDeposit,
    });

    // Total expenses, that we keep for comparison later
    const renterExpenses = annualRent + annualRentInsurance +
      securityDeposit;
    results.push({
      year,
      category: "renter",
      variable: "expenses",
      amount: renterExpenses,
    });
    // We keep track of cumulative expenses
    renterCumulativeExpenses += renterExpenses;
    results.push({
      year,
      category: "renter",
      variable: "cumulativeExpenses",
      amount: renterCumulativeExpenses,
    });

    // TFSA gains
    if (parameters.tfsaContributions) {
      renterTfsaGains = Math.round(
        renterTfsa * parameters.annualMarketReturnRate[yearIndex],
      );
      results.push({
        year,
        category: "renter",
        variable: "tfsaGains",
        amount: renterTfsaGains,
      });
      renterCumulativeTfsaGains += renterTfsaGains;
      results.push({
        year,
        category: "renter",
        variable: "cumulativeTfsaGains",
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
      variable: "marketGains",
      amount: renterMarketGains,
    });
    renterCumulativeMarketGains += renterMarketGains;
    results.push({
      year,
      category: "renter",
      variable: "cumulativeMarketGains",
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
      variable: "mortgageCapital",
      amount: mortgagePaymentsForThisYear.capital,
    });
    results.push({
      year,
      category: "buyer",
      variable: "mortgageInterests",
      amount: mortgagePaymentsForThisYear.interests,
    });
    results.push({
      year,
      category: "buyer",
      variable: "maintenance",
      amount: buyAnnualMaintenanceCost,
    });
    results.push({
      year,
      category: "buyer",
      variable: "propertyTax",
      amount: buyAnnualPropertyTax,
    });
    results.push({
      year,
      category: "buyer",
      variable: "condoFees",
      amount: buyAnnualCondoFees,
    });
    results.push({
      year,
      category: "buyer",
      variable: "insurance",
      amount: buyAnnualInsurance,
    });

    // We keep track of cumulative expenses
    buyerCumulativeMortgageCapital += mortgagePaymentsForThisYear.capital;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeMortgageCapital",
      amount: buyerCumulativeMortgageCapital,
    });
    buyerCumulativeMortgageInterests += mortgagePaymentsForThisYear.interests;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeMortgageInterests",
      amount: buyerCumulativeMortgageInterests,
    });
    buyerCumulativeMaintenance += buyAnnualMaintenanceCost;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeMaintenance",
      amount: buyerCumulativeMaintenance,
    });
    buyerCumulativePropertyTax += buyAnnualPropertyTax;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativePropertyTax",
      amount: buyerCumulativePropertyTax,
    });
    buyerCumulativeCondoFees += buyAnnualCondoFees;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeCondoFees",
      amount: buyerCumulativeCondoFees,
    });
    buyerCumulativeInsurance += buyAnnualInsurance;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeInsurance",
      amount: buyerCumulativeInsurance,
    });

    // Non-recurring expenses
    const downPayment = year === parameters.startingYear
      ? parameters.buyer.downPayment
      : 0;
    const purchaseFixedFees = year === parameters.startingYear
      ? parameters.buyer.purchaseFixedFees
      : 0;
    const insurancePremiumThisYear = year === parameters.startingYear
      ? insurancePremium
      : 0;
    if (year === parameters.startingYear) {
      results.push({
        year,
        category: "buyer",
        variable: "downPayment",
        amount: downPayment,
      });
      results.push({
        year,
        category: "buyer",
        variable: "purchaseFixedFees",
        amount: purchaseFixedFees,
      });
      results.push({
        year,
        category: "buyer",
        variable: "insurancePremium",
        amount: insurancePremiumThisYear,
      });
    }
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeDownPayment",
      amount: parameters.buyer.downPayment,
    });
    results.push({
      year,
      category: "buyer",
      variable: "cumulativePurchaseFixedFees",
      amount: parameters.buyer.purchaseFixedFees,
    });
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeInsurancePremium",
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
      purchaseFixedFees + insurancePremiumThisYear;
    results.push({
      year,
      category: "buyer",
      variable: "expenses",
      amount: buyerExpenses,
    });
    // We keep track of cumulative expenses
    buyerCumulativeExpenses += buyerExpenses;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeExpenses",
      amount: buyerCumulativeExpenses,
    });

    // TFSA gains
    if (parameters.tfsaContributions) {
      buyerTfsaGains = Math.round(
        buyerTfsa * parameters.annualMarketReturnRate[yearIndex],
      );
      results.push({
        year,
        category: "buyer",
        variable: "tfsaGains",
        amount: buyerTfsaGains,
      });
      buyerCumulativeTfsaGains += buyerTfsaGains;
      results.push({
        year,
        category: "buyer",
        variable: "cumulativeTfsaGains",
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
      variable: "marketGains",
      amount: buyerMarketGains,
    });
    buyerCumulativeMarketGains += buyerMarketGains;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeMarketGains",
      amount: buyerCumulativeMarketGains,
    });
    // We will push the stocks later after adjusting for the difference between renter and buyer expenses
    buyerStocks += buyerMarketGains;

    // We appreciate the home value for the buyer
    const homeValueIncrease = Math.round(
      homeValue * parameters.buyer.appreciationIncrease[yearIndex],
    );
    results.push({
      year,
      category: "buyer",
      variable: "homeValueIncrease",
      amount: homeValueIncrease,
    });
    homeValue += homeValueIncrease;
    results.push({
      year,
      category: "buyer",
      variable: "homeValue",
      amount: homeValue,
    });

    // We store the previous year home equity for later calculations
    const previousYearHomeEquity = homeEquity;
    // We calculate the home equity for the buyer
    homeEquity = homeValue -
      mortgagePaymentsForThisYear.balance;
    results.push({
      year,
      category: "buyer",
      variable: "homeEquity",
      amount: homeEquity,
    });
    // We calculate the home equity gains for this year
    const homeEquityGains = homeEquity - previousYearHomeEquity;
    results.push({
      year,
      category: "buyer",
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
        variable: "tfsaContributions",
        amount: renterTfsaContributions,
      });
      renterCumulativeTfsaContributions += renterTfsaContributions;
      results.push({
        year,
        category: "renter",
        variable: "cumulativeTfsaContributions",
        amount: renterCumulativeTfsaContributions,
      });
      renterTfsa += renterTfsaContributions;
      results.push({
        year,
        category: "renter",
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
        variable: "tfsaContributions",
        amount: buyerTfsaContributions,
      });
      buyerCumulativeTfsaContributions += buyerTfsaContributions;
      results.push({
        year,
        category: "buyer",
        variable: "cumulativeTfsaContributions",
        amount: buyerCumulativeTfsaContributions,
      });
      buyerTfsa += buyerTfsaContributions;
      results.push({
        year,
        category: "buyer",
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
      variable: "newStocks",
      amount: renterSavings,
    });
    results.push({
      year,
      category: "buyer",
      variable: "newStocks",
      amount: buyerSavings,
    });

    // We adjust the stocks accordingly and now can push it
    renterStocks += renterSavings;
    results.push({
      year,
      category: "renter",
      variable: "stocks",
      amount: renterStocks,
    });
    buyerStocks += buyerSavings;
    results.push({
      year,
      category: "buyer",
      variable: "stocks",
      amount: buyerStocks,
    });

    // We calculate the total gains for this year
    const renterGains = renterMarketGains + renterTfsaGains + renterSavings;
    results.push({
      year,
      category: "renter",
      variable: "gains",
      amount: renterGains,
    });
    const buyerGains = buyerMarketGains + buyerTfsaGains + buyerSavings +
      homeEquityGains;
    results.push({
      year,
      category: "buyer",
      variable: "gains",
      amount: buyerGains,
    });

    // We adjust the balances
    const renterBalance = renterGains - renterExpenses;
    results.push({
      year,
      category: "renter",
      variable: "balance",
      amount: renterBalance,
    });
    // The buyer balance includes home equity gains
    const buyerBalance = buyerGains - buyerExpenses;
    results.push({
      year,
      category: "buyer",
      variable: "balance",
      amount: buyerBalance,
    });

    // We calculate the overall assets so far
    renterAssets = renterStocks + renterTfsa;
    results.push({
      year,
      category: "renter",
      variable: "assets",
      amount: renterAssets,
    });
    buyerAssets = buyerStocks + buyerTfsa + homeEquity;
    results.push({
      year,
      category: "buyer",
      variable: "assets",
      amount: buyerAssets,
    });

    // Now we can check who has the highest assets
    results.push({
      year,
      category: "renter",
      variable: "difference",
      amount: renterAssets - buyerAssets,
    });
    results.push({
      year,
      category: "buyer",
      variable: "difference",
      amount: buyerAssets - renterAssets,
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
  }

  return results;
}
