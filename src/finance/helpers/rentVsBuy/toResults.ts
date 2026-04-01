import type { MortgagePayment } from "./types/mortgagePayment.ts";
import type { Persona } from "./types/persona.ts";

const MONTHLY_EXPENSES_KEYS = [
  "mortgageCapital",
  "mortgageInterests",
  "rent",
  "insurance",
  "securityDeposit",
  "maintenance",
  "propertyTax",
  "condoFees",
  "downPayment",
  "purchaseFixedFees",
  "insurancePremium",
  "tfsaFees",
  "stocksFees",
] as const;
const CUMULATIVE_EXPENSES_KEYS = [
  "rent",
  "insurance",
  "securityDeposit",
  "mortgageCapital",
  "mortgageInterests",
  "maintenance",
  "propertyTax",
  "condoFees",
  "downPayment",
  "purchaseFixedFees",
  "insurancePremium",
  "tfsaFees",
  "stocksFees",
] as const;
const MONTHLY_GAINS_KEYS = [
  "tfsaGains",
  "tfsaContribution",
  "stocksGains",
  "newStocks",
  "homeEquityGains",
] as const;
const CUMULATIVE_GAINS_KEYS = [
  "tfsaGains",
  "tfsaContribution",
  "stocksGains",
  "newStocks",
  "homeEquityGains",
] as const;
const ASSETS_KEYS = [
  "tfsa",
  "stocks",
  "securityDeposit",
  "homeEquity",
] as const;
const SUMMARY_KEYS = ["balance"] as const;
const SUMMARY_CUMULATIVE_KEYS = ["balance", "balanceAfterSelling"] as const;
const SALE_COSTS_KEYS = [
  "stockTaxes",
  "homeSellingCommission",
  "homeSellingFixedFees",
  "mortgagePenalty",
  "mortgageBalance",
] as const;
const SALE_NET_GAINS_KEYS = [
  "stockSellingGains",
  "tfsaSellingGains",
  "homeSellingGains",
  "securityDeposit",
] as const;

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
          | "insurancePremium"
          | "tfsaFees"
          | "stocksFees";
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
  onRecord?: (
    category: string,
    group: string,
    variable: string,
    monthIndex: number,
    amount: number,
  ) => void,
) {
  if (onRecord) {
    // Fast path: stream numeric values directly to the accumulator without
    // allocating result objects. Used by simulateRentVsBuyMonteCarlo when
    // monthlyQuantiles is enabled.

    for (const variable of MONTHLY_EXPENSES_KEYS) {
      const amount = persona.monthlyExpenses[variable];
      if (amount !== 0) {
        onRecord(category, "monthlyExpenses", variable, monthIndex, amount);
      }
    }
    for (const variable of CUMULATIVE_EXPENSES_KEYS) {
      const amount = persona.cumulativeExpenses[variable];
      if (amount !== 0) {
        onRecord(category, "cumulativeExpenses", variable, monthIndex, amount);
      }
    }
    for (const variable of MONTHLY_GAINS_KEYS) {
      const amount = persona.monthlyGains[variable];
      if (amount !== 0) {
        onRecord(category, "monthlyGains", variable, monthIndex, amount);
      }
    }
    for (const variable of CUMULATIVE_GAINS_KEYS) {
      const amount = persona.cumulativeGains[variable];
      if (amount !== 0) {
        onRecord(category, "cumulativeGains", variable, monthIndex, amount);
      }
    }
    for (const variable of ASSETS_KEYS) {
      const amount = persona.assets[variable];
      if (amount !== 0) {
        onRecord(category, "assets", variable, monthIndex, amount);
      }
    }
    for (const variable of SUMMARY_KEYS) {
      const amount = persona.summary[variable];
      if (amount !== 0) {
        onRecord(category, "summary", variable, monthIndex, amount);
      }
    }
    for (const variable of SUMMARY_CUMULATIVE_KEYS) {
      const amount = persona.summaryCumulative[variable];
      if (amount !== 0) {
        onRecord(category, "summaryCumulative", variable, monthIndex, amount);
      }
    }
    for (const variable of SALE_COSTS_KEYS) {
      const amount = persona.saleCosts[variable];
      if (amount !== 0) {
        onRecord(category, "saleCosts", variable, monthIndex, amount);
      }
    }
    for (const variable of SALE_NET_GAINS_KEYS) {
      const amount = persona.saleNetGains[variable];
      if (amount !== 0) {
        onRecord(category, "saleNetGains", variable, monthIndex, amount);
      }
    }

    // Still push the 2 summaryCumulative records at the final month so the
    // caller can extract winners without a separate scan.
    if (monthIndex === numberOfMonths - 1) {
      const date = new Date(Date.UTC(year, month, 1));
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
    return;
  }

  if (finalBalanceOnly) {
    if (monthIndex === numberOfMonths - 1) {
      const date = new Date(Date.UTC(year, month, 1));
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
    const date = new Date(Date.UTC(year, month, 1));
    // Process monthlyExpenses
    for (
      const variable of MONTHLY_EXPENSES_KEYS
    ) {
      if (
        persona.monthlyExpenses[variable] !== 0
      ) {
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
      const variable of CUMULATIVE_EXPENSES_KEYS
    ) {
      if (
        persona.cumulativeExpenses[variable] !== 0
      ) {
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
      const variable of MONTHLY_GAINS_KEYS
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
      const variable of CUMULATIVE_GAINS_KEYS
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
      const variable of ASSETS_KEYS
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
      const variable of SUMMARY_KEYS
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
      const variable of SUMMARY_CUMULATIVE_KEYS
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
      const variable of SALE_COSTS_KEYS
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
      const variable of SALE_NET_GAINS_KEYS
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
