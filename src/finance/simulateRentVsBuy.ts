import precomputeMortgagePayments from "./helpers/precomputeMortgagePayments.ts";

export default function simulateRentVsBuy(parameters: {
  numberOfYears: number;
  annualMarketReturnRate: number;
  renter: {
    startingMonthlyRent: number;
    annualRentIncrease: number;
    securityDeposit: number;
    startingMonthlyInsurance: number;
    annualInsuranceIncrease: number;
  };
  buyer: {
    downPayment: number;
    purchasePrice: number;
    interestRate: number;
    purchaseFixedFees: number;
    startingAnnualMaintenanceCost: number;
    annualMaintenanceIncrease: number;
    startingAnnualPropertyTax: number;
    annualPropertyTaxIncrease: number;
    startingMonthlyCondoFees: number;
    annualCondoFeeIncrease: number;
    startingMonthlyInsurance: number;
    annualInsuranceIncrease: number;
    appreciationRate: number;
  };
}) {
  const results: {
    year: number;
    category: "renter" | "buyer";
    variable: string;
    amount: number;
  }[] = [];

  let rent = parameters.renter.startingMonthlyRent;
  let rentInsurance = parameters.renter.startingMonthlyInsurance;

  let buyAnnualMaintenanceCost = parameters.buyer.startingAnnualMaintenanceCost;
  let buyAnnualPropertyTax = parameters.buyer.startingAnnualPropertyTax;
  let buyMonthlyCondoFees = parameters.buyer.startingMonthlyCondoFees;
  let buyMonthlyInsurance = parameters.buyer.startingMonthlyInsurance;

  const annualMortgagePayments = precomputeMortgagePayments(
    parameters.numberOfYears,
    parameters.buyer.purchasePrice - parameters.buyer.downPayment,
    parameters.buyer.interestRate,
  );

  for (let year = 1; year <= parameters.numberOfYears; year++) {
    // RENTER

    const annualRent = rent * 12;
    const annualRentInsurance = rentInsurance * 12;

    results.push({
      year,
      category: "renter",
      variable: "rent",
      amount: annualRent,
    });
    results.push({
      year,
      category: "renter",
      variable: "insurance",
      amount: annualRentInsurance,
    });

    // We retrieve the cumulative rent paid so far
    const renterPreviousYearCumulativeRentObject = results
      .find((r) =>
        r.category === "renter" && r.variable === "cumulativeRent" &&
        r.year === year - 1
      );
    if (year !== 1 && renterPreviousYearCumulativeRentObject === undefined) {
      throw new Error("renterPreviousYearCumulativeRentObject not found");
    }
    const renterPreviousYearCumulativeRent = year === 1
      ? 0
      : renterPreviousYearCumulativeRentObject!.amount;
    const renterCumulativeRent = renterPreviousYearCumulativeRent + annualRent;
    results.push({
      year,
      category: "renter",
      variable: "cumulativeRent",
      amount: renterCumulativeRent,
    });
    // Same thing for insurance
    const renterPreviousYearCumulativeInsuranceObject = results
      .find((r) =>
        r.category === "renter" && r.variable === "cumulativeInsurance" &&
        r.year === year - 1
      );
    if (
      year !== 1 && renterPreviousYearCumulativeInsuranceObject === undefined
    ) {
      throw new Error(
        "renterPreviousYearCumulativeInsuranceObject not found",
      );
    }
    const renterPreviousYearCumulativeInsurance = year === 1
      ? 0
      : renterPreviousYearCumulativeInsuranceObject!.amount;
    const renterCumulativeInsurance = renterPreviousYearCumulativeInsurance +
      annualRentInsurance;
    results.push({
      year,
      category: "renter",
      variable: "cumulativeInsurance",
      amount: renterCumulativeInsurance,
    });

    // For following year
    rent = Math.round(rent * (1 + parameters.renter.annualRentIncrease));
    rentInsurance = Math.round(
      rentInsurance * (1 + parameters.renter.annualInsuranceIncrease),
    );

    // Non-recurring expenses
    const securityDeposit = year === 1 ? parameters.renter.securityDeposit : 0;
    results.push({
      year,
      category: "renter",
      variable: "securityDeposit",
      amount: securityDeposit,
    });
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

    // BUYER

    results.push({
      year,
      category: "buyer",
      variable: "mortgageCapital",
      amount: annualMortgagePayments[year - 1].capital,
    });
    results.push({
      year,
      category: "buyer",
      variable: "mortgageInterest",
      amount: annualMortgagePayments[year - 1].interest,
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
      amount: buyMonthlyCondoFees * 12,
    });
    results.push({
      year,
      category: "buyer",
      variable: "insurance",
      amount: buyMonthlyInsurance * 12,
    });

    // We retrieve the cumulative mortgageCapital paid so far
    const buyerPreviousYearCumulativeMortgageCapitalObject = results
      .find((r) =>
        r.category === "buyer" && r.variable === "cumulativeMortgageCapital" &&
        r.year === year - 1
      );
    if (
      year !== 1 &&
      buyerPreviousYearCumulativeMortgageCapitalObject === undefined
    ) {
      throw new Error(
        "buyerPreviousYearCumulativeMortgageCapitalObject not found",
      );
    }
    const buyerPreviousYearCumulativeMortgageCapital = year === 1
      ? 0
      : buyerPreviousYearCumulativeMortgageCapitalObject!.amount;
    const buyerCumulativeMortgageCapital =
      buyerPreviousYearCumulativeMortgageCapital +
      annualMortgagePayments[year - 1].capital;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeMortgageCapital",
      amount: buyerCumulativeMortgageCapital,
    });
    // Same thing for the mortgage interest
    const buyerPreviousYearCumulativeMortgageInterestObject = results
      .find((r) =>
        r.category === "buyer" && r.variable === "cumulativeMortgageInterest" &&
        r.year === year - 1
      );
    if (
      year !== 1 &&
      buyerPreviousYearCumulativeMortgageInterestObject === undefined
    ) {
      throw new Error(
        "buyerPreviousYearCumulativeMortgageInterestObject not found",
      );
    }
    const buyerPreviousYearCumulativeMortgageInterest = year === 1
      ? 0
      : buyerPreviousYearCumulativeMortgageInterestObject!.amount;
    const buyerCumulativeMortgageInterest =
      buyerPreviousYearCumulativeMortgageInterest +
      annualMortgagePayments[year - 1].interest;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeMortgageInterest",
      amount: buyerCumulativeMortgageInterest,
    });
    // Same thing for maintenance
    const buyerPreviousYearCumulativeMaintenanceObject = results
      .find((r) =>
        r.category === "buyer" && r.variable === "cumulativeMaintenance" &&
        r.year === year - 1
      );
    if (
      year !== 1 && buyerPreviousYearCumulativeMaintenanceObject === undefined
    ) {
      throw new Error(
        "buyerPreviousYearCumulativeMaintenanceObject not found",
      );
    }
    const buyerPreviousYearCumulativeMaintenance = year === 1
      ? 0
      : buyerPreviousYearCumulativeMaintenanceObject!.amount;
    const buyerCumulativeMaintenance = buyerPreviousYearCumulativeMaintenance +
      buyAnnualMaintenanceCost;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeMaintenance",
      amount: buyerCumulativeMaintenance,
    });
    // Same thing for property tax
    const buyerPreviousYearCumulativePropertyTaxObject = results
      .find((r) =>
        r.category === "buyer" && r.variable === "cumulativePropertyTax" &&
        r.year === year - 1
      );
    if (
      year !== 1 && buyerPreviousYearCumulativePropertyTaxObject === undefined
    ) {
      throw new Error(
        "buyerPreviousYearCumulativePropertyTaxObject not found",
      );
    }
    const buyerPreviousYearCumulativePropertyTax = year === 1
      ? 0
      : buyerPreviousYearCumulativePropertyTaxObject!.amount;
    const buyerCumulativePropertyTax = buyerPreviousYearCumulativePropertyTax +
      buyAnnualPropertyTax;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativePropertyTax",
      amount: buyerCumulativePropertyTax,
    });
    // Same thing for condo fees
    const buyerPreviousYearCumulativeCondoFeesObject = results
      .find((r) =>
        r.category === "buyer" && r.variable === "cumulativeCondoFees" &&
        r.year === year - 1
      );
    if (
      year !== 1 && buyerPreviousYearCumulativeCondoFeesObject === undefined
    ) {
      throw new Error(
        "buyerPreviousYearCumulativeCondoFeesObject not found",
      );
    }
    const buyerPreviousYearCumulativeCondoFees = year === 1
      ? 0
      : buyerPreviousYearCumulativeCondoFeesObject!.amount;
    const buyerCumulativeCondoFees = buyerPreviousYearCumulativeCondoFees +
      buyMonthlyCondoFees * 12;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeCondoFees",
      amount: buyerCumulativeCondoFees,
    });
    // Same thing for insurance
    const buyerPreviousYearCumulativeInsuranceObject = results
      .find((r) =>
        r.category === "buyer" && r.variable === "cumulativeInsurance" &&
        r.year === year - 1
      );
    if (
      year !== 1 && buyerPreviousYearCumulativeInsuranceObject === undefined
    ) {
      throw new Error(
        "buyerPreviousYearCumulativeInsuranceObject not found",
      );
    }
    const buyerPreviousYearCumulativeInsurance = year === 1
      ? 0
      : buyerPreviousYearCumulativeInsuranceObject!.amount;
    const buyerCumulativeInsurance = buyerPreviousYearCumulativeInsurance +
      buyMonthlyInsurance * 12;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeInsurance",
      amount: buyerCumulativeInsurance,
    });

    // For following year
    buyAnnualMaintenanceCost = Math.round(
      buyAnnualMaintenanceCost *
        (1 + parameters.buyer.annualMaintenanceIncrease),
    );
    buyAnnualPropertyTax = Math.round(
      buyAnnualPropertyTax * (1 + parameters.buyer.annualPropertyTaxIncrease),
    );
    buyMonthlyCondoFees = Math.round(
      buyMonthlyCondoFees * (1 + parameters.buyer.annualCondoFeeIncrease),
    );
    buyMonthlyInsurance = Math.round(
      buyMonthlyInsurance * (1 + parameters.buyer.annualInsuranceIncrease),
    );

    // Non-recurring expenses
    const downPayment = year === 1 ? parameters.buyer.downPayment : 0;
    const purchaseFixedFees = year === 1
      ? parameters.buyer.purchaseFixedFees
      : 0;
    results.push({
      year,
      category: "buyer",
      variable: "downPayment",
      amount: downPayment,
    });
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeDownPayment",
      amount: parameters.buyer.downPayment,
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
      variable: "cumulativePurchaseFixedFees",
      amount: parameters.buyer.purchaseFixedFees,
    });

    // Total expenses, that we keep for comparison later
    const buyerExpenses = annualMortgagePayments[year - 1].capital +
      annualMortgagePayments[year - 1].interest +
      buyAnnualMaintenanceCost +
      buyAnnualPropertyTax +
      buyMonthlyCondoFees * 12 +
      buyMonthlyInsurance * 12 +
      downPayment +
      purchaseFixedFees;
    results.push({
      year,
      category: "buyer",
      variable: "expenses",
      amount: buyerExpenses,
    });

    // We compare annual expenses of renter and buyer and decide where the savings should go to. We keep track of it for later.
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
    results.push({
      year,
      category: "renter",
      variable: "savings",
      amount: renterSavings,
    });
    results.push({
      year,
      category: "buyer",
      variable: "savings",
      amount: buyerSavings,
    });

    // We add the cumulativeSavings
    const renterPreviousYearCumulativeSavingsObject = results
      .find((r) =>
        r.category === "renter" && r.variable === "cumulativeSavings" &&
        r.year === year - 1
      );
    if (
      year !== 1 && renterPreviousYearCumulativeSavingsObject === undefined
    ) {
      throw new Error("renterPreviousYearCumulativeSavingsObject not found");
    }
    const renterPreviousYearCumulativeSavings = year === 1
      ? 0
      : renterPreviousYearCumulativeSavingsObject!.amount;
    const renterCumulativeSavings = renterPreviousYearCumulativeSavings +
      renterSavings;
    results.push({
      year,
      category: "renter",
      variable: "cumulativeSavings",
      amount: renterCumulativeSavings,
    });

    const buyerPreviousYearCumulativeSavingsObject = results
      .find((r) =>
        r.category === "buyer" && r.variable === "cumulativeSavings" &&
        r.year === year - 1
      );
    if (
      year !== 1 && buyerPreviousYearCumulativeSavingsObject === undefined
    ) {
      throw new Error("buyerPreviousYearCumulativeSavingsObject not found");
    }
    const buyerPreviousYearCumulativeSavings = year === 1
      ? 0
      : buyerPreviousYearCumulativeSavingsObject!.amount;
    const buyerCumulativeSavings = buyerPreviousYearCumulativeSavings +
      buyerSavings;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeSavings",
      amount: buyerCumulativeSavings,
    });

    // We retrieve the total savings from previous year
    const renterPreviousYearSavingsObject = results
      .find((r) =>
        r.category === "renter" && r.variable === "totalSavings" &&
        r.year === year - 1
      );
    if (year !== 1 && renterPreviousYearSavingsObject === undefined) {
      throw new Error("renterPreviousYearSavingsObject not found");
    }
    const renterPreviousYearSavings = year === 1
      ? 0
      : renterPreviousYearSavingsObject!.amount;

    const buyerPreviousYearSavingsObject = results
      .find((r) =>
        r.category === "buyer" && r.variable === "totalSavings" &&
        r.year === year - 1
      );
    if (year !== 1 && buyerPreviousYearSavingsObject === undefined) {
      throw new Error("buyerPreviousYearSavingsObject not found");
    }
    const buyerPreviousYearSavings = year === 1
      ? 0
      : buyerPreviousYearSavingsObject!.amount;

    // We calculate the annual gains from the market return rate
    const renterMarketGains = Math.round(
      renterPreviousYearSavings * parameters.annualMarketReturnRate,
    );
    results.push({
      year,
      category: "renter",
      variable: "marketGains",
      amount: renterMarketGains,
    });
    const buyerMarketGains = Math.round(
      buyerPreviousYearSavings * parameters.annualMarketReturnRate,
    );
    results.push({
      year,
      category: "buyer",
      variable: "marketGains",
      amount: buyerMarketGains,
    });

    // We calculate the cumulative market gains
    const renterPreviousYearCumulativeMarketGainsObject = results
      .find((r) =>
        r.category === "renter" && r.variable === "cumulativeMarketGains" &&
        r.year === year - 1
      );
    if (
      year !== 1 &&
      renterPreviousYearCumulativeMarketGainsObject === undefined
    ) {
      throw new Error(
        "renterPreviousYearCumulativeMarketGainsObject not found",
      );
    }
    const renterPreviousYearCumulativeMarketGains = year === 1
      ? 0
      : renterPreviousYearCumulativeMarketGainsObject!.amount;
    const renterCumulativeMarketGains =
      renterPreviousYearCumulativeMarketGains +
      renterMarketGains;
    results.push({
      year,
      category: "renter",
      variable: "cumulativeMarketGains",
      amount: renterCumulativeMarketGains,
    });

    const buyerPreviousYearCumulativeMarketGainsObject = results
      .find((r) =>
        r.category === "buyer" && r.variable === "cumulativeMarketGains" &&
        r.year === year - 1
      );
    if (
      year !== 1 &&
      buyerPreviousYearCumulativeMarketGainsObject === undefined
    ) {
      throw new Error(
        "buyerPreviousYearCumulativeMarketGainsObject not found",
      );
    }
    const buyerPreviousYearCumulativeMarketGains = year === 1
      ? 0
      : buyerPreviousYearCumulativeMarketGainsObject!.amount;
    const buyerCumulativeMarketGains = buyerPreviousYearCumulativeMarketGains +
      buyerMarketGains;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeMarketGains",
      amount: buyerCumulativeMarketGains,
    });

    // We appreciate the home value for the buyer
    const previousYearHomeValueObject = results
      .find((r) =>
        r.category === "buyer" && r.variable === "homeValue" &&
        r.year === year - 1
      );
    if (year !== 1 && previousYearHomeValueObject === undefined) {
      throw new Error("previousYearHomeValueObject not found");
    }
    const previousYearHomeValue = year === 1
      ? parameters.buyer.purchasePrice
      : previousYearHomeValueObject!.amount;

    const homeValueIncrease = Math.round(
      previousYearHomeValue * parameters.buyer.appreciationRate,
    );
    const homeValue = previousYearHomeValue + homeValueIncrease;
    results.push({
      year,
      category: "buyer",
      variable: "homeValue",
      amount: homeValue,
    });

    // We retrieve the previous home equity
    const previousYearHomeEquityObject = results
      .find((r) =>
        r.category === "buyer" && r.variable === "homeEquity" &&
        r.year === year - 1
      );
    if (
      year !== 1 && previousYearHomeEquityObject === undefined
    ) {
      throw new Error("previousYearHomeEquityObject not found");
    }
    const previousYearHomeEquity = year === 1
      ? parameters.buyer.downPayment
      : previousYearHomeEquityObject!.amount;

    // We calculate the current home equity
    const homeEquity = homeValue -
      annualMortgagePayments[year - 1].balance;
    results.push({
      year,
      category: "buyer",
      variable: "homeEquity",
      amount: homeEquity,
    });
    // We calculate the home equity gains
    const homeEquityGains = homeEquity - previousYearHomeEquity;
    results.push({
      year,
      category: "buyer",
      variable: "homeEquityGains",
      amount: homeEquityGains,
    });

    // We calculate the total gains for this year
    const renterGains = renterSavings + renterMarketGains;
    results.push({
      year,
      category: "renter",
      variable: "gains",
      amount: renterGains,
    });
    // No home equity gains here because not real money until selling the home
    const buyerGains = buyerSavings + buyerMarketGains; //+ homeEquityGains;
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
    // We want to include home equity gains as well here
    const buyerBalance = buyerGains - buyerExpenses + homeEquityGains;
    results.push({
      year,
      category: "buyer",
      variable: "balance",
      amount: buyerBalance,
    });

    // We calculate the overall savings so far
    const renterTotalSavings = renterPreviousYearSavings + renterGains;
    results.push({
      year,
      category: "renter",
      variable: "totalSavings",
      amount: renterTotalSavings,
    });
    // Including home equity gains here as well
    const buyerTotalSavings = buyerPreviousYearSavings + buyerGains +
      homeEquityGains;
    results.push({
      year,
      category: "buyer",
      variable: "totalSavings",
      amount: buyerTotalSavings,
    });

    // We calculate the overall expenses so far
    const renterPreviousYearCumulativeExpensesObject = results
      .find((r) =>
        r.category === "renter" && r.variable === "cumulativeExpenses" &&
        r.year === year - 1
      );
    if (
      year !== 1 && renterPreviousYearCumulativeExpensesObject === undefined
    ) {
      throw new Error("renterPreviousYearCumulativeExpensesObject not found");
    }
    const renterPreviousYearCumulativeExpenses = year === 1
      ? 0
      : renterPreviousYearCumulativeExpensesObject!.amount;
    const renterCumulativeExpenses = renterPreviousYearCumulativeExpenses +
      renterExpenses;
    results.push({
      year,
      category: "renter",
      variable: "cumulativeExpenses",
      amount: renterCumulativeExpenses,
    });

    const buyerPreviousYearCumulativeExpensesObject = results
      .find((r) =>
        r.category === "buyer" && r.variable === "cumulativeExpenses" &&
        r.year === year - 1
      );
    if (
      year !== 1 && buyerPreviousYearCumulativeExpensesObject === undefined
    ) {
      throw new Error("buyerPreviousYearCumulativeExpensesObject not found");
    }
    const buyerPreviousYearCumulativeExpenses = year === 1
      ? 0
      : buyerPreviousYearCumulativeExpensesObject!.amount;
    const buyerCumulativeExpenses = buyerPreviousYearCumulativeExpenses +
      buyerExpenses;
    results.push({
      year,
      category: "buyer",
      variable: "cumulativeExpenses",
      amount: buyerCumulativeExpenses,
    });

    // We calculate the overall balance so far
    const renterTotalBalance = renterTotalSavings - renterCumulativeExpenses;
    results.push({
      year,
      category: "renter",
      variable: "totalBalance",
      amount: renterTotalBalance,
    });
    const buyerTotalBalance = buyerTotalSavings - buyerCumulativeExpenses;
    results.push({
      year,
      category: "buyer",
      variable: "totalBalance",
      amount: buyerTotalBalance,
    });
  }

  return results;
}
