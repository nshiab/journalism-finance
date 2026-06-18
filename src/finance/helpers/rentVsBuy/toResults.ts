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
  "landTransferTax",
  "insurancePremiumTax",
  "tfsaFees",
  "stocksFees",
] as const;
const MONTHLY_RECURRING_EXPENSES_KEYS = [
  "mortgageCapital",
  "mortgageInterests",
  "rent",
  "insurance",
  "maintenance",
  "propertyTax",
  "condoFees",
  "tfsaFees",
  "stocksFees",
] as const;
const MONTHLY_NON_RECURRING_EXPENSES_KEYS = [
  "downPayment",
  "purchaseFixedFees",
  "landTransferTax",
  "insurancePremiumTax",
  "securityDeposit",
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
  "landTransferTax",
  "insurancePremiumTax",
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

// Fast 2-decimal rounding (mirrors the one in sibling helpers).
const r2 = (x: number) => Math.round(x * 100) / 100;

function computeTotals(persona: Persona, adj: (x: number) => number) {
  const monthlyExpenses = adj(
    persona.monthlyExpenses.mortgageCapital +
      persona.monthlyExpenses.mortgageInterests +
      persona.monthlyExpenses.rent +
      persona.monthlyExpenses.insurance +
      persona.monthlyExpenses.securityDeposit +
      persona.monthlyExpenses.maintenance +
      persona.monthlyExpenses.propertyTax +
      persona.monthlyExpenses.condoFees +
      persona.monthlyExpenses.downPayment +
      persona.monthlyExpenses.purchaseFixedFees +
      persona.monthlyExpenses.landTransferTax +
      persona.monthlyExpenses.insurancePremiumTax +
      persona.monthlyExpenses.tfsaFees +
      persona.monthlyExpenses.stocksFees,
  );
  const cumulativeExpenses = r2(
    persona.cumulativeExpenses.rent +
      persona.cumulativeExpenses.insurance +
      persona.cumulativeExpenses.mortgageCapital +
      persona.cumulativeExpenses.mortgageInterests +
      persona.cumulativeExpenses.maintenance +
      persona.cumulativeExpenses.propertyTax +
      persona.cumulativeExpenses.condoFees +
      persona.cumulativeExpenses.tfsaFees +
      persona.cumulativeExpenses.stocksFees +
      persona.cumulativeExpenses.securityDeposit +
      persona.cumulativeExpenses.downPayment +
      persona.cumulativeExpenses.purchaseFixedFees +
      persona.cumulativeExpenses.landTransferTax +
      persona.cumulativeExpenses.insurancePremiumTax,
  );
  const monthlyGains = adj(
    persona.monthlyGains.tfsaGains +
      persona.monthlyGains.tfsaContribution +
      persona.monthlyGains.stocksGains +
      persona.monthlyGains.newStocks +
      persona.monthlyGains.homeEquityGains,
  );
  const cumulativeGains = r2(
    persona.cumulativeGains.tfsaGains +
      persona.cumulativeGains.tfsaContribution +
      persona.cumulativeGains.stocksGains +
      persona.cumulativeGains.newStocks +
      persona.cumulativeGains.homeEquityGains,
  );
  const assets = adj(
    persona.assets.tfsa +
      persona.assets.stocks +
      persona.assets.securityDeposit +
      persona.assets.homeEquity,
  );
  const saleCosts = adj(
    persona.saleCosts.stockTaxes +
      persona.saleCosts.homeSellingCommission +
      persona.saleCosts.homeSellingFixedFees +
      persona.saleCosts.mortgagePenalty +
      persona.saleCosts.mortgageBalance,
  );
  const saleNetGains = adj(
    persona.saleNetGains.stockSellingGains +
      persona.saleNetGains.tfsaSellingGains +
      persona.saleNetGains.homeSellingGains +
      persona.saleNetGains.securityDeposit,
  );
  return {
    monthlyExpenses,
    cumulativeExpenses,
    monthlyGains,
    cumulativeGains,
    assets,
    saleCosts,
    saleNetGains,
  };
}

export default function toResults(
  category: "renter" | "buyerFixed" | "buyerVariable",
  persona: Persona,
  results: (
    & {
      monthIndex: number;
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
          | "landTransferTax"
          | "insurancePremiumTax"
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
        employmentIncome?: number;
      }
      | {
        group: "saleNetGains";
        variable:
          | "stockSellingGains"
          | "tfsaSellingGains"
          | "homeSellingGains"
          | "securityDeposit";
      }
      | {
        group: "monthlyRecurringExpenses";
        variable:
          | "mortgageCapital"
          | "mortgageInterests"
          | "rent"
          | "insurance"
          | "maintenance"
          | "propertyTax"
          | "condoFees"
          | "tfsaFees"
          | "stocksFees";
      }
      | {
        group: "monthlyNonRecurringExpenses";
        variable:
          | "downPayment"
          | "purchaseFixedFees"
          | "landTransferTax"
          | "insurancePremiumTax"
          | "securityDeposit";
      }
      | {
        group: "totals";
        variable:
          | "monthlyExpenses"
          | "cumulativeExpenses"
          | "monthlyGains"
          | "cumulativeGains"
          | "assets"
          | "saleCosts"
          | "saleNetGains"
          | "monthlyRecurringExpenses"
          | "monthlyNonRecurringExpenses";
      }
    )
  )[],
  monthIndex: number,
  numberOfMonths: number,
  winVariableOnly: boolean,
  mortgagePayment: MortgagePayment | null,
  employmentIncome: number | null,
  inflationMultiplier: number,
  onRecord?: (
    category: string,
    group: string,
    variable: string,
    monthIndex: number,
    amount: number,
  ) => void,
  winVariable?: "balance" | "balanceAfterSelling" | "assets",
  groups?: string[],
  variables?: string[],
  onSnapshotRecord?: (
    category: string,
    monthIndex: number,
    amount: number,
  ) => void,
  snapshotMonths?: Set<number>,
) {
  const adj = (x: number) => r2(x * inflationMultiplier);
  const allowVar = (v: string) =>
    !variables || variables.length === 0 || variables.includes(v);

  if (onRecord) {
    // Fast path: stream numeric values directly to the accumulator without
    // allocating result objects. Used by simulateRentVsBuyMonteCarlo when
    // monthlyQuantiles is enabled.

    // Totals are accumulated inline during each loop to avoid a second pass
    // over all persona fields.
    if (!groups || groups.includes("monthlyExpenses")) {
      let totalMonthlyExpenses = 0;
      for (const variable of MONTHLY_EXPENSES_KEYS) {
        const amount = persona.monthlyExpenses[variable];
        totalMonthlyExpenses += amount;
        if (amount !== 0 && allowVar(variable)) {
          onRecord(
            category,
            "monthlyExpenses",
            variable,
            monthIndex,
            adj(amount),
          );
        }
      }
      if (allowVar("monthlyExpenses")) {
        onRecord(
          category,
          "totals",
          "monthlyExpenses",
          monthIndex,
          adj(totalMonthlyExpenses),
        );
      }
    }

    if (!groups || groups.includes("cumulativeExpenses")) {
      let totalCumulativeExpenses = 0;
      for (const variable of CUMULATIVE_EXPENSES_KEYS) {
        const amount = persona.cumulativeExpenses[variable];
        totalCumulativeExpenses += amount;
        if (amount !== 0 && allowVar(variable)) {
          onRecord(
            category,
            "cumulativeExpenses",
            variable,
            monthIndex,
            r2(amount),
          );
        }
      }
      if (allowVar("cumulativeExpenses")) {
        onRecord(
          category,
          "totals",
          "cumulativeExpenses",
          monthIndex,
          r2(totalCumulativeExpenses),
        );
      }
    }

    if (
      !groups || groups.includes("monthlyRecurringExpenses") ||
      groups.includes("totals")
    ) {
      let totalMonthlyRecurringExpenses = 0;
      for (const variable of MONTHLY_RECURRING_EXPENSES_KEYS) {
        const amount = persona.monthlyExpenses[variable];
        totalMonthlyRecurringExpenses += amount;
        if (
          amount !== 0 && allowVar(variable) &&
          (!groups || groups.includes("monthlyRecurringExpenses"))
        ) {
          onRecord(
            category,
            "monthlyRecurringExpenses",
            variable,
            monthIndex,
            adj(amount),
          );
        }
      }
      if (
        allowVar("monthlyRecurringExpenses") &&
        (!groups || groups.includes("totals"))
      ) {
        onRecord(
          category,
          "totals",
          "monthlyRecurringExpenses",
          monthIndex,
          adj(totalMonthlyRecurringExpenses),
        );
      }
    }

    if (
      !groups || groups.includes("monthlyNonRecurringExpenses") ||
      groups.includes("totals")
    ) {
      let totalMonthlyNonRecurringExpenses = 0;
      for (const variable of MONTHLY_NON_RECURRING_EXPENSES_KEYS) {
        const amount = persona.monthlyExpenses[variable];
        totalMonthlyNonRecurringExpenses += amount;
        if (
          amount !== 0 && allowVar(variable) &&
          (!groups || groups.includes("monthlyNonRecurringExpenses"))
        ) {
          onRecord(
            category,
            "monthlyNonRecurringExpenses",
            variable,
            monthIndex,
            adj(amount),
          );
        }
      }
      if (
        allowVar("monthlyNonRecurringExpenses") &&
        (!groups || groups.includes("totals"))
      ) {
        onRecord(
          category,
          "totals",
          "monthlyNonRecurringExpenses",
          monthIndex,
          adj(totalMonthlyNonRecurringExpenses),
        );
      }
    }

    if (!groups || groups.includes("monthlyGains")) {
      let totalMonthlyGains = 0;
      for (const variable of MONTHLY_GAINS_KEYS) {
        const amount = persona.monthlyGains[variable];
        totalMonthlyGains += amount;
        if (amount !== 0 && allowVar(variable)) {
          onRecord(category, "monthlyGains", variable, monthIndex, adj(amount));
        }
      }
      if (allowVar("monthlyGains")) {
        onRecord(
          category,
          "totals",
          "monthlyGains",
          monthIndex,
          adj(totalMonthlyGains),
        );
      }
    }

    if (!groups || groups.includes("cumulativeGains")) {
      let totalCumulativeGains = 0;
      for (const variable of CUMULATIVE_GAINS_KEYS) {
        const amount = persona.cumulativeGains[variable];
        totalCumulativeGains += amount;
        if (amount !== 0 && allowVar(variable)) {
          onRecord(
            category,
            "cumulativeGains",
            variable,
            monthIndex,
            r2(amount),
          );
        }
      }
      if (allowVar("cumulativeGains")) {
        onRecord(
          category,
          "totals",
          "cumulativeGains",
          monthIndex,
          r2(totalCumulativeGains),
        );
      }
    }

    if (!groups || groups.includes("assets")) {
      let totalAssets = 0;
      for (const variable of ASSETS_KEYS) {
        const amount = persona.assets[variable];
        totalAssets += amount;
        if (amount !== 0 && allowVar(variable)) {
          onRecord(category, "assets", variable, monthIndex, adj(amount));
        }
      }
      if (allowVar("assets")) {
        onRecord(category, "totals", "assets", monthIndex, adj(totalAssets));
      }
    }

    if (!groups || groups.includes("summary")) {
      for (const variable of SUMMARY_KEYS) {
        const amount = persona.summary[variable];
        if (amount !== 0 && allowVar(variable)) {
          onRecord(category, "summary", variable, monthIndex, adj(amount));
        }
      }
    }

    if (!groups || groups.includes("summaryCumulative")) {
      for (const variable of SUMMARY_CUMULATIVE_KEYS) {
        const amount = persona.summaryCumulative[variable];
        if (amount !== 0 && allowVar(variable)) {
          onRecord(
            category,
            "summaryCumulative",
            variable,
            monthIndex,
            r2(amount),
          );
        }
      }
    }

    if (!groups || groups.includes("saleCosts")) {
      let totalSaleCosts = 0;
      for (const variable of SALE_COSTS_KEYS) {
        const amount = persona.saleCosts[variable];
        totalSaleCosts += amount;
        if (amount !== 0 && allowVar(variable)) {
          onRecord(category, "saleCosts", variable, monthIndex, adj(amount));
        }
      }
      if (allowVar("saleCosts")) {
        onRecord(
          category,
          "totals",
          "saleCosts",
          monthIndex,
          adj(totalSaleCosts),
        );
      }
    }

    if (!groups || groups.includes("saleNetGains")) {
      let totalSaleNetGains = 0;
      for (const variable of SALE_NET_GAINS_KEYS) {
        const amount = persona.saleNetGains[variable];
        totalSaleNetGains += amount;
        if (amount !== 0 && allowVar(variable)) {
          onRecord(category, "saleNetGains", variable, monthIndex, adj(amount));
        }
      }
      if (allowVar("saleNetGains")) {
        onRecord(
          category,
          "totals",
          "saleNetGains",
          monthIndex,
          adj(totalSaleNetGains),
        );
      }
    }

    // Still push the single winner record at the final month so the
    // caller can extract winners without a separate scan.
    if (monthIndex === numberOfMonths - 1) {
      if (winVariable !== undefined) {
        if (winVariable === "assets") {
          const totals = computeTotals(persona, adj);
          results.push({
            monthIndex,
            amount: totals.assets,
            category,
            group: "totals",
            variable: "assets",
          });
        } else {
          results.push({
            monthIndex,
            amount: persona.summaryCumulative[winVariable],
            category,
            group: "summaryCumulative",
            variable: winVariable,
          });
        }
      }
    }
    if (
      onSnapshotRecord && snapshotMonths && snapshotMonths.has(monthIndex) &&
      winVariable !== undefined
    ) {
      if (winVariable === "assets") {
        const totals = computeTotals(persona, adj);
        onSnapshotRecord(category, monthIndex, totals.assets);
      } else {
        onSnapshotRecord(
          category,
          monthIndex,
          persona.summaryCumulative[winVariable],
        );
      }
    }
    return;
  }

  if (winVariableOnly) {
    if (winVariable !== undefined) {
      const isFinalMonth = monthIndex === numberOfMonths - 1;
      const isSnapshotMonth = onSnapshotRecord !== undefined &&
        snapshotMonths !== undefined && snapshotMonths.has(monthIndex);
      if (isFinalMonth || isSnapshotMonth) {
        if (winVariable === "assets") {
          const totals = computeTotals(persona, adj);
          if (isFinalMonth) {
            results.push({
              monthIndex,
              amount: totals.assets,
              category,
              group: "totals",
              variable: "assets",
            });
          }
          if (isSnapshotMonth) {
            onSnapshotRecord!(category, monthIndex, totals.assets);
          }
        } else {
          const amount = persona.summaryCumulative[winVariable];
          if (isFinalMonth) {
            results.push({
              monthIndex,
              amount,
              category,
              group: "summaryCumulative",
              variable: winVariable,
            });
          }
          if (isSnapshotMonth) onSnapshotRecord!(category, monthIndex, amount);
        }
      }
    }
  } else {
    // Process monthlyExpenses
    if (!groups || groups.includes("monthlyExpenses")) {
      for (
        const variable of MONTHLY_EXPENSES_KEYS
      ) {
        const amount = persona.monthlyExpenses[variable];
        if (amount !== 0) {
          if (
            (variable === "mortgageCapital" ||
              variable === "mortgageInterests") && mortgagePayment
          ) {
            results.push({
              monthIndex,
              amount: adj(amount),
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
              monthIndex,
              amount: adj(amount),
              category,
              group: "monthlyExpenses",
              variable,
            });
          }
        }
      }
    }

    if (!groups || groups.includes("totals")) {
      let totalMonthlyExpenses = 0;
      for (const variable of MONTHLY_EXPENSES_KEYS) {
        totalMonthlyExpenses += persona.monthlyExpenses[variable];
      }
      results.push({
        monthIndex,
        amount: adj(totalMonthlyExpenses),
        category,
        group: "totals",
        variable: "monthlyExpenses",
      });
    }

    // Process monthlyRecurringExpenses
    if (!groups || groups.includes("monthlyRecurringExpenses")) {
      for (const variable of MONTHLY_RECURRING_EXPENSES_KEYS) {
        const amount = persona.monthlyExpenses[variable];
        if (amount !== 0) {
          results.push({
            monthIndex,
            amount: adj(amount),
            category,
            group: "monthlyRecurringExpenses",
            variable,
          });
        }
      }
    }

    if (!groups || groups.includes("totals")) {
      let totalMonthlyRecurringExpenses = 0;
      for (const variable of MONTHLY_RECURRING_EXPENSES_KEYS) {
        totalMonthlyRecurringExpenses += persona.monthlyExpenses[variable];
      }
      results.push({
        monthIndex,
        amount: adj(totalMonthlyRecurringExpenses),
        category,
        group: "totals",
        variable: "monthlyRecurringExpenses",
      });
    }

    // Process monthlyNonRecurringExpenses
    if (!groups || groups.includes("monthlyNonRecurringExpenses")) {
      for (const variable of MONTHLY_NON_RECURRING_EXPENSES_KEYS) {
        const amount = persona.monthlyExpenses[variable];
        if (amount !== 0) {
          results.push({
            monthIndex,
            amount: adj(amount),
            category,
            group: "monthlyNonRecurringExpenses",
            variable,
          });
        }
      }
    }

    if (!groups || groups.includes("totals")) {
      let totalMonthlyNonRecurringExpenses = 0;
      for (const variable of MONTHLY_NON_RECURRING_EXPENSES_KEYS) {
        totalMonthlyNonRecurringExpenses += persona.monthlyExpenses[variable];
      }
      results.push({
        monthIndex,
        amount: adj(totalMonthlyNonRecurringExpenses),
        category,
        group: "totals",
        variable: "monthlyNonRecurringExpenses",
      });
    }

    // Process cumulativeExpenses
    if (!groups || groups.includes("cumulativeExpenses")) {
      for (
        const variable of CUMULATIVE_EXPENSES_KEYS
      ) {
        const amount = persona.cumulativeExpenses[variable];
        if (amount !== 0) {
          results.push({
            monthIndex,
            amount: r2(amount),
            category,
            group: "cumulativeExpenses",
            variable,
          });
        }
      }
    }

    if (!groups || groups.includes("totals")) {
      let totalCumulativeExpenses = 0;
      for (const variable of CUMULATIVE_EXPENSES_KEYS) {
        totalCumulativeExpenses += persona.cumulativeExpenses[variable];
      }
      results.push({
        monthIndex,
        amount: r2(totalCumulativeExpenses),
        category,
        group: "totals",
        variable: "cumulativeExpenses",
      });
    }

    // Process monthlyGains
    if (!groups || groups.includes("monthlyGains")) {
      for (
        const variable of MONTHLY_GAINS_KEYS
      ) {
        const amount = persona.monthlyGains[variable];
        if (amount !== 0) {
          if (
            (
              variable === "homeEquityGains"
            ) &&
            persona.assets.homeEquity !== undefined
          ) {
            results.push({
              monthIndex,
              amount: adj(amount),
              category,
              group: "monthlyGains",
              variable,
              homeValue: adj(persona.params.homeValue),
            });
          } else {
            results.push({
              monthIndex,
              amount: adj(amount),
              category,
              group: "monthlyGains",
              variable,
            });
          }
        }
      }
    }
    if (!groups || groups.includes("totals")) {
      let totalMonthlyGains = 0;
      for (const variable of MONTHLY_GAINS_KEYS) {
        totalMonthlyGains += persona.monthlyGains[variable];
      }
      results.push({
        monthIndex,
        amount: adj(totalMonthlyGains),
        category,
        group: "totals",
        variable: "monthlyGains",
      });
    }

    // Process cumulativeGains
    if (!groups || groups.includes("cumulativeGains")) {
      for (
        const variable of CUMULATIVE_GAINS_KEYS
      ) {
        const amount = persona.cumulativeGains[variable];
        if (amount !== 0) {
          results.push({
            monthIndex,
            amount: r2(amount),
            category,
            group: "cumulativeGains",
            variable,
          });
        }
      }
    }
    if (!groups || groups.includes("totals")) {
      let totalCumulativeGains = 0;
      for (const variable of CUMULATIVE_GAINS_KEYS) {
        totalCumulativeGains += persona.cumulativeGains[variable];
      }
      results.push({
        monthIndex,
        amount: r2(totalCumulativeGains),
        category,
        group: "totals",
        variable: "cumulativeGains",
      });
    }

    // Process assets
    if (!groups || groups.includes("assets")) {
      for (
        const variable of ASSETS_KEYS
      ) {
        const amount = persona.assets[variable];
        if (amount !== 0) {
          results.push({
            monthIndex,
            amount: adj(amount),
            category,
            group: "assets",
            variable,
          });
        }
      }
    }
    if (!groups || groups.includes("totals")) {
      let totalAssets = 0;
      for (const variable of ASSETS_KEYS) {
        totalAssets += persona.assets[variable];
      }
      results.push({
        monthIndex,
        amount: adj(totalAssets),
        category,
        group: "totals",
        variable: "assets",
      });
    }

    // Process summary
    if (!groups || groups.includes("summary")) {
      for (
        const variable of SUMMARY_KEYS
      ) {
        if (persona.summary[variable] !== 0) {
          results.push({
            monthIndex,
            amount: adj(persona.summary[variable]),
            category,
            group: "summary",
            variable,
          });
        }
      }
    }

    // Process summaryCumulative
    if (!groups || groups.includes("summaryCumulative")) {
      for (
        const variable of SUMMARY_CUMULATIVE_KEYS
      ) {
        if (persona.summaryCumulative[variable] !== 0) {
          results.push({
            monthIndex,
            amount: r2(persona.summaryCumulative[variable]),
            category,
            group: "summaryCumulative",
            variable,
          });
        }
      }
    }

    // Process saleCosts
    if (!groups || groups.includes("saleCosts")) {
      for (
        const variable of SALE_COSTS_KEYS
      ) {
        const amount = persona.saleCosts[variable];
        if (amount !== 0) {
          if (variable === "stockTaxes" && employmentIncome !== null) {
            results.push({
              monthIndex,
              amount: adj(amount),
              category,
              group: "saleCosts",
              variable,
              employmentIncome: adj(employmentIncome),
            });
          } else {
            results.push({
              monthIndex,
              amount: adj(amount),
              category,
              group: "saleCosts",
              variable,
            });
          }
        }
      }
    }
    if (!groups || groups.includes("totals")) {
      let totalSaleCosts = 0;
      for (const variable of SALE_COSTS_KEYS) {
        totalSaleCosts += persona.saleCosts[variable];
      }
      results.push({
        monthIndex,
        amount: adj(totalSaleCosts),
        category,
        group: "totals",
        variable: "saleCosts",
      });
    }

    // Process saleNetGains
    if (!groups || groups.includes("saleNetGains")) {
      for (
        const variable of SALE_NET_GAINS_KEYS
      ) {
        const amount = persona.saleNetGains[variable];
        if (amount !== 0) {
          results.push({
            monthIndex,
            amount: adj(amount),
            category,
            group: "saleNetGains",
            variable,
          });
        }
      }
    }
    if (!groups || groups.includes("totals")) {
      let totalSaleNetGains = 0;
      for (const variable of SALE_NET_GAINS_KEYS) {
        totalSaleNetGains += persona.saleNetGains[variable];
      }
      results.push({
        monthIndex,
        amount: adj(totalSaleNetGains),
        category,
        group: "totals",
        variable: "saleNetGains",
      });
    }
  }
}
