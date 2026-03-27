import type { MortgagePayment } from "./types/mortgagePayment.ts";
import type { Persona } from "./types/persona.ts";

export default function toResults(
  year: number,
  month: number,
  category: "renter" | "buyerFixed" | "buyerVariable",
  persona: Persona,
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
        fixedRateAdjustment?: number;
        variableRateAdjustment?: number;
      }
      | {
        group: "monthlyGains" | "cumulativeGains";
        variable:
          | "tfsaGains"
          | "tfsaContribution"
          | "stocksGains"
          | "newStocks"
          | "homeEquityGains";
        homeValue?: number;
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
          | "balanceAfterSelling";
      }
      | {
        group: "saleCosts";
        variable:
          | "stockTaxes"
          | "homeSellingCommission"
          | "homeSellingFixedFees"
          | "mortgagePenalty"
          | "mortgageBalance";
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
  mortgagePayment: MortgagePayment | null,
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
      results.push({
        year,
        month,
        monthIndex,
        date,
        amount: persona.summaryCumulative.balance,
        category,
        group: "summaryCumulative",
        variable: "balance",
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
            fixedRateAdjustment: mortgagePayment.fixedRateAdjustment,
            variableRateAdjustment: mortgagePayment.variableRateAdjustment,
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
        if (
          (
            variable === "homeEquityGains"
          ) &&
          persona.assets.homeEquity !== undefined
        ) {
          results.push({
            year,
            month,
            monthIndex,
            date,
            amount: persona.monthlyGains[variable],
            category,
            group: "monthlyGains",
            variable,
            homeValue: persona.params.homeValue,
          });
        } else {
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
