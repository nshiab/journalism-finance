import precomputeMortgagePayments from "./helpers/precomputeMortgagePayments.ts";

// NEED TO ADD OWNER INSURANCE COSTS

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
    renter: {
      annualExpenses: {
        rent: number;
        insurance: number;
        securityDeposit: number;
        total: number;
      };
      annualGains: {
        fromDifferenceWithBuyer: number;
        fromStockMarket: number;
        total: number;
      };
      annualBalance: number;
      totalPaid: {
        rent: number;
        insurance: number;
        securityDeposit: number;
        total: number;
      };
      totalSavings: {
        fromDifferenceWithBuyer: number;
        fromStockMarket: number;
        total: number;
      };
      totalBalance: number;
    };
    buyer: {
      annualExpenses: {
        capital: number;
        interest: number;
        maintenance: number;
        propertyTax: number;
        condoFees: number;
        insurance: number;
        downPayment: number;
        purchaseFixedFees: number;
        total: number;
      };
      annualGains: {
        fromDifferenceWithRenter: number;
        fromStockMarket: number;
        fromHomeValue: number;
        total: number;
        totalWithHomeValue: number;
      };
      annualBalance: number;
      annualBalanceWithHomeValue: number;
      totalPaid: {
        capital: number;
        interest: number;
        maintenance: number;
        propertyTax: number;
        condoFees: number;
        insurance: number;
        downPayment: number;
        purchaseFixedFees: number;
        total: number;
      };
      totalSavings: {
        fromDifferenceWithRenter: number;
        fromStockMarket: number;
        homeValue: number;
        total: number;
        totalWithHomeValue: number;
      };
      totalBalance: number;
      totalBalanceWithHomeValue: number;
    };
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

  for (let year = 0; year < parameters.numberOfYears; year++) {
    console.log(`Year ${year}`);

    // RENTER
    const currentYearRenter = {
      annualExpenses: {
        rent: 0,
        insurance: 0,
        securityDeposit: 0,
        total: 0,
      },
      annualGains: {
        fromDifferenceWithBuyer: 0,
        fromStockMarket: 0,
        total: 0,
      },
      annualBalance: 0,
      totalPaid: {
        rent: 0,
        insurance: 0,
        securityDeposit: 0,
        total: 0,
      },
      totalSavings: {
        fromDifferenceWithBuyer: 0,
        fromStockMarket: 0,
        total: 0,
      },
      totalBalance: 0,
    };

    const annualRent = rent * 12;
    const annualRentInsurance = rentInsurance * 12;

    // For following year
    rent = Math.round(rent * (1 + parameters.renter.annualRentIncrease));
    rentInsurance = Math.round(
      rentInsurance * (1 + parameters.renter.annualInsuranceIncrease),
    );

    // Renter expenses
    if (year === 0) {
      currentYearRenter.annualExpenses = {
        rent: annualRent,
        insurance: annualRentInsurance,
        securityDeposit: parameters.renter.securityDeposit,
        total: annualRent + annualRentInsurance +
          parameters.renter.securityDeposit,
      };
    } else {
      currentYearRenter.annualExpenses = {
        rent: annualRent,
        insurance: annualRentInsurance,
        securityDeposit: 0,
        total: annualRent + annualRentInsurance,
      };
    }

    // BUYER
    const currentYearBuyer = {
      annualExpenses: {
        capital: 0,
        interest: 0,
        maintenance: 0,
        propertyTax: 0,
        condoFees: 0,
        insurance: 0,
        downPayment: 0,
        purchaseFixedFees: 0,
        total: 0,
      },
      annualGains: {
        fromDifferenceWithRenter: 0,
        fromStockMarket: 0,
        fromHomeValue: 0,
        total: 0,
        totalWithHomeValue: 0,
      },
      annualBalance: 0,
      annualBalanceWithHomeValue: 0,
      totalPaid: {
        capital: 0,
        interest: 0,
        maintenance: 0,
        propertyTax: 0,
        condoFees: 0,
        insurance: 0,
        downPayment: 0,
        purchaseFixedFees: 0,
        total: 0,
      },
      totalSavings: {
        fromDifferenceWithRenter: 0,
        fromStockMarket: 0,
        homeValue: 0,
        total: 0,
        totalWithHomeValue: 0,
      },
      totalBalance: 0,
      totalBalanceWithHomeValue: 0,
    };

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

    // Buyer expenses
    if (year === 0) {
      currentYearBuyer.annualExpenses = {
        capital: annualMortgagePayments[year].capital,
        interest: annualMortgagePayments[year].interest,
        maintenance: buyAnnualMaintenanceCost,
        propertyTax: buyAnnualPropertyTax,
        condoFees: buyMonthlyCondoFees * 12,
        insurance: buyMonthlyInsurance * 12,
        downPayment: parameters.buyer.downPayment,
        purchaseFixedFees: parameters.buyer.purchaseFixedFees,
        total: annualMortgagePayments[year].capital +
          annualMortgagePayments[year].interest +
          buyAnnualMaintenanceCost +
          buyAnnualPropertyTax +
          buyMonthlyCondoFees * 12 +
          buyMonthlyInsurance * 12 +
          parameters.buyer.downPayment +
          parameters.buyer.purchaseFixedFees,
      };
    } else {
      currentYearBuyer.annualExpenses = {
        capital: annualMortgagePayments[year].capital,
        interest: annualMortgagePayments[year].interest,
        maintenance: buyAnnualMaintenanceCost,
        propertyTax: buyAnnualPropertyTax,
        condoFees: buyMonthlyCondoFees * 12,
        insurance: buyMonthlyInsurance * 12,
        downPayment: 0,
        purchaseFixedFees: 0,
        total: annualMortgagePayments[year].capital +
          annualMortgagePayments[year].interest +
          buyAnnualMaintenanceCost +
          buyAnnualPropertyTax +
          buyMonthlyCondoFees * 12 +
          buyMonthlyInsurance * 12,
      };
    }

    // // We compare annual expenses and decide where the savings should go to
    // if (currentYearRenter.annualExpenses < currentYearBuyer.annualExpenses) {
    //   const difference = currentYearBuyer.annualExpenses -
    //     currentYearRenter.annualExpenses;
    //   currentYearRenter.annualGains += difference;
    // } else if (
    //   currentYearBuyer.annualExpenses < currentYearRenter.annualExpenses
    // ) {
    //   const difference = currentYearRenter.annualExpenses -
    //     currentYearBuyer.annualExpenses;
    //   currentYearBuyer.annualGains += difference;
    // }

    // // We retrieve the total savings
    // if (year === 0) {
    //   currentYearRenter.totalSavings = 0;
    //   currentYearBuyer.totalSavings = 0;
    // } else {
    //   const previousYearRenter = results[year - 1].renter;
    //   const previousYearBuyer = results[year - 1].buyer;

    //   currentYearRenter.totalSavings = previousYearRenter.totalSavings;
    //   currentYearBuyer.totalSavings = previousYearBuyer.totalSavings;
    // }

    // // We calculate the annual gains from the market return rate
    // currentYearRenter.annualGains += Math.round(
    //   currentYearRenter.totalSavings * parameters.annualMarketReturnRate,
    // );
    // currentYearBuyer.annualGains += Math.round(
    //   currentYearBuyer.totalSavings * parameters.annualMarketReturnRate,
    // );

    // // We add the annual gains to the total savings
    // currentYearRenter.totalSavings += currentYearRenter.annualGains;
    // currentYearBuyer.totalSavings += currentYearBuyer.annualGains;

    // // We appreciate the home value
    // if (year === 0) {
    //   currentYearBuyer.homeValue = Math.round(
    //     parameters.buyer.purchasePrice *
    //       (1 + parameters.buyer.appreciationRate),
    //   );
    // } else {
    //   const previousYearBuyer = results[year - 1].buyer;
    //   currentYearBuyer.homeValue = Math.round(
    //     previousYearBuyer.homeValue *
    //       (1 + parameters.buyer.appreciationRate),
    //   );
    // }

    // // We adjust the annual balances and total balances
    // currentYearRenter.annualBalance = currentYearRenter.annualGains -
    //   currentYearRenter.annualExpenses;
    // currentYearRenter.totalBalance = currentYearRenter.totalSavings -
    //   currentYearRenter.totalPaid;

    // currentYearBuyer.annualBalance = currentYearBuyer.annualGains -
    //   currentYearBuyer.annualExpenses;
    // currentYearBuyer.totalBalance = currentYearBuyer.totalSavings -
    //   currentYearBuyer.totalPaid;
    // currentYearBuyer.totalBalanceWithHomeValue = currentYearBuyer.homeValue +
    //   currentYearBuyer.totalSavings -
    //   currentYearBuyer.totalPaid;

    const result = {
      year,
      renter: currentYearRenter,
      buyer: currentYearBuyer,
    };
    console.log(result);

    results.push(result);
  }
}
