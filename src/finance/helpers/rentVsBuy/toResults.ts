export default function toResults(
  year: number,
  month: number,
  category: "renter" | "buyerFixed" | "buyerVariable",
  persona: {
    monthlyExpenses: {
      mortgageCapital: number;
      mortgageInterests: number;
      rent: number;
      insurance: number;
      securityDeposit: number;
      maintenance: number;
      propertyTax: number;
      condoFees: number;
      downPayment: number;
      purchaseFixedFees: number;
      insurancePremium: number;
    };
    cumulativeExpenses: {
      rent: number;
      insurance: number;
      securityDeposit: number;
      mortgageCapital: number;
      mortgageInterests: number;
      maintenance: number;
      propertyTax: number;
      condoFees: number;
      downPayment: number;
      purchaseFixedFees: number;
      insurancePremium: number;
    };
    monthlyGains: {
      tfsaGains: number;
      tfsaContribution: number;
      stocksGains: number;
      newStocks: number;
      homeSellingGains: number;
      homeEquityGains: number;
    };
    cumulativeGains: {
      tfsaGains: number;
      tfsaContribution: number;
      stocksGains: number;
      newStocks: number;
      homeSellingGains: number;
      homeEquityGains: number;
    };
    assets: {
      tfsa: number;
      stocks: number;
      securityDeposit: number;
      homeEquity: number;
    };
    summary: { balance: number };
    summaryCumulative: {
      balance: number;
      balanceAfterSelling: number;
      differenceAfterSelling: number;
    };
    saleCosts: {
      stockTaxes: number;
      homeSellingCommission: number;
      homeSellingFixedFees: number;
      mortgagePenalty: number;
    };
    saleNetGains: {
      stockSellingGains: number;
      tfsaSellingGains: number;
      homeSellingGains: number;
      securityDeposit: number;
    };
  },
  results: (
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
          | "balance"
          | "balanceAfterSelling"
          | "differenceAfterSelling";
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
  )[],
  monthIndex: number,
  numberOfMonths: number,
  finalBalanceOnly: boolean,
  mortgagePayment: {
    paymentId: number;
    payment: number;
    interest: number;
    capital: number;
    balance: number;
    amountPaid: number;
    interestPaid: number;
    capitalPaid: number;
    effectiveInterestRate: number;
    postedInterestRate: number;
    fixedRateDiscount: number;
    variableRateMargin: number;
  } | null,
) {
  const date = new Date(Date.UTC(year, month, 1));

  if (finalBalanceOnly) {
    if (monthIndex === numberOfMonths - 1) {
      results.push({
        year,
        month,
        monthIndex,
        date,
        amount: persona.summaryCumulative.balanceAfterSelling,
        category,
        group: "summaryCumulative",
        variable: "balanceAfterSelling",
      });
    }
  } else {
    // Process monthlyExpenses
    for (
      const variable of Object.keys(persona.monthlyExpenses) as Array<
        keyof typeof persona.monthlyExpenses
      >
    ) {
      if (persona.monthlyExpenses[variable] !== 0) {
        if (
          (variable === "mortgageCapital" ||
            variable === "mortgageInterests") && mortgagePayment
        ) {
          results.push({
            year,
            month,
            monthIndex,
            date,
            amount: persona.monthlyExpenses[variable],
            category,
            group: "monthlyExpenses",
            variable,
            effectiveInterestRate: mortgagePayment.effectiveInterestRate,
            postedInterestRate: mortgagePayment.postedInterestRate,
            fixedRateDiscount: mortgagePayment.fixedRateDiscount,
            variableRateMargin: mortgagePayment.variableRateMargin,
          });
        } else {
          results.push({
            year,
            month,
            monthIndex,
            date,
            amount: persona.monthlyExpenses[variable],
            category,
            group: "monthlyExpenses",
            variable,
          });
        }
      }
    }

    // Process cumulativeExpenses
    for (
      const variable of Object.keys(persona.cumulativeExpenses) as Array<
        keyof typeof persona.cumulativeExpenses
      >
    ) {
      if (persona.cumulativeExpenses[variable] !== 0) {
        results.push({
          year,
          month,
          monthIndex,
          date,
          amount: persona.cumulativeExpenses[variable],
          category,
          group: "cumulativeExpenses",
          variable,
        });
      }
    }

    // Process monthlyGains
    for (
      const variable of Object.keys(persona.monthlyGains) as Array<
        keyof typeof persona.monthlyGains
      >
    ) {
      if (persona.monthlyGains[variable] !== 0) {
        results.push({
          year,
          month,
          monthIndex,
          date,
          amount: persona.monthlyGains[variable],
          category,
          group: "monthlyGains",
          variable,
        });
      }
    }

    // Process cumulativeGains
    for (
      const variable of Object.keys(persona.cumulativeGains) as Array<
        keyof typeof persona.cumulativeGains
      >
    ) {
      if (persona.cumulativeGains[variable] !== 0) {
        results.push({
          year,
          month,
          monthIndex,
          date,
          amount: persona.cumulativeGains[variable],
          category,
          group: "cumulativeGains",
          variable,
        });
      }
    }

    // Process assets
    for (
      const variable of Object.keys(persona.assets) as Array<
        keyof typeof persona.assets
      >
    ) {
      if (persona.assets[variable] !== 0) {
        results.push({
          year,
          month,
          monthIndex,
          date,
          amount: persona.assets[variable],
          category,
          group: "assets",
          variable,
        });
      }
    }

    // Process summary
    for (
      const variable of Object.keys(persona.summary) as Array<
        keyof typeof persona.summary
      >
    ) {
      if (persona.summary[variable] !== 0) {
        results.push({
          year,
          month,
          monthIndex,
          date,
          amount: persona.summary[variable],
          category,
          group: "summary",
          variable,
        });
      }
    }

    // Process summaryCumulative
    for (
      const variable of Object.keys(persona.summaryCumulative) as Array<
        keyof typeof persona.summaryCumulative
      >
    ) {
      if (persona.summaryCumulative[variable] !== 0) {
        results.push({
          year,
          month,
          monthIndex,
          date,
          amount: persona.summaryCumulative[variable],
          category,
          group: "summaryCumulative",
          variable,
        });
      }
    }

    // Process saleCosts
    for (
      const variable of Object.keys(persona.saleCosts) as Array<
        keyof typeof persona.saleCosts
      >
    ) {
      if (persona.saleCosts[variable] !== 0) {
        results.push({
          year,
          month,
          monthIndex,
          date,
          amount: persona.saleCosts[variable],
          category,
          group: "saleCosts",
          variable,
        });
      }
    }

    // Process saleNetGains
    for (
      const variable of Object.keys(persona.saleNetGains) as Array<
        keyof typeof persona.saleNetGains
      >
    ) {
      if (persona.saleNetGains[variable] !== 0) {
        results.push({
          year,
          month,
          monthIndex,
          date,
          amount: persona.saleNetGains[variable],
          category,
          group: "saleNetGains",
          variable,
        });
      }
    }
  }
}
