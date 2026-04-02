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

// Fast 2-decimal rounding (mirrors the one in sibling helpers).
const r2 = (x: number) => Math.round(x * 100) / 100;

function computeTotals(persona: Persona) {
  const monthlyExpenses = r2(
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
      persona.monthlyExpenses.insurancePremium +
      persona.monthlyExpenses.tfsaFees +
      persona.monthlyExpenses.stocksFees,
  );
  const cumulativeExpenses = r2(
    persona.cumulativeExpenses.rent +
      persona.cumulativeExpenses.insurance +
      persona.cumulativeExpenses.securityDeposit +
      persona.cumulativeExpenses.mortgageCapital +
      persona.cumulativeExpenses.mortgageInterests +
      persona.cumulativeExpenses.maintenance +
      persona.cumulativeExpenses.propertyTax +
      persona.cumulativeExpenses.condoFees +
      persona.cumulativeExpenses.downPayment +
      persona.cumulativeExpenses.purchaseFixedFees +
      persona.cumulativeExpenses.insurancePremium +
      persona.cumulativeExpenses.tfsaFees +
      persona.cumulativeExpenses.stocksFees,
  );
  const monthlyGains = r2(
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
  const assets = r2(
    persona.assets.tfsa +
      persona.assets.stocks +
      persona.assets.securityDeposit +
      persona.assets.homeEquity,
  );
  const saleCosts = r2(
    persona.saleCosts.stockTaxes +
      persona.saleCosts.homeSellingCommission +
      persona.saleCosts.homeSellingFixedFees +
      persona.saleCosts.mortgagePenalty +
      persona.saleCosts.mortgageBalance,
  );
  const saleNetGains = r2(
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
      | {
        group: "totals";
        variable:
          | "monthlyExpenses"
          | "cumulativeExpenses"
          | "monthlyGains"
          | "cumulativeGains"
          | "assets"
          | "saleCosts"
          | "saleNetGains";
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

    // Totals are accumulated inline during each loop to avoid a second pass
    // over all persona fields.
    let totalMonthlyExpenses = 0;
    for (const variable of MONTHLY_EXPENSES_KEYS) {
      const amount = persona.monthlyExpenses[variable];
      totalMonthlyExpenses += amount;
      if (amount !== 0) {
        onRecord(category, "monthlyExpenses", variable, monthIndex, amount);
      }
    }
    onRecord(
      category,
      "totals",
      "monthlyExpenses",
      monthIndex,
      r2(totalMonthlyExpenses),
    );

    let totalCumulativeExpenses = 0;
    for (const variable of CUMULATIVE_EXPENSES_KEYS) {
      const amount = persona.cumulativeExpenses[variable];
      totalCumulativeExpenses += amount;
      if (amount !== 0) {
        onRecord(category, "cumulativeExpenses", variable, monthIndex, amount);
      }
    }
    onRecord(
      category,
      "totals",
      "cumulativeExpenses",
      monthIndex,
      r2(totalCumulativeExpenses),
    );

    let totalMonthlyGains = 0;
    for (const variable of MONTHLY_GAINS_KEYS) {
      const amount = persona.monthlyGains[variable];
      totalMonthlyGains += amount;
      if (amount !== 0) {
        onRecord(category, "monthlyGains", variable, monthIndex, amount);
      }
    }
    onRecord(
      category,
      "totals",
      "monthlyGains",
      monthIndex,
      r2(totalMonthlyGains),
    );

    let totalCumulativeGains = 0;
    for (const variable of CUMULATIVE_GAINS_KEYS) {
      const amount = persona.cumulativeGains[variable];
      totalCumulativeGains += amount;
      if (amount !== 0) {
        onRecord(category, "cumulativeGains", variable, monthIndex, amount);
      }
    }
    onRecord(
      category,
      "totals",
      "cumulativeGains",
      monthIndex,
      r2(totalCumulativeGains),
    );

    let totalAssets = 0;
    for (const variable of ASSETS_KEYS) {
      const amount = persona.assets[variable];
      totalAssets += amount;
      if (amount !== 0) {
        onRecord(category, "assets", variable, monthIndex, amount);
      }
    }
    onRecord(category, "totals", "assets", monthIndex, r2(totalAssets));

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

    let totalSaleCosts = 0;
    for (const variable of SALE_COSTS_KEYS) {
      const amount = persona.saleCosts[variable];
      totalSaleCosts += amount;
      if (amount !== 0) {
        onRecord(category, "saleCosts", variable, monthIndex, amount);
      }
    }
    onRecord(category, "totals", "saleCosts", monthIndex, r2(totalSaleCosts));

    let totalSaleNetGains = 0;
    for (const variable of SALE_NET_GAINS_KEYS) {
      const amount = persona.saleNetGains[variable];
      totalSaleNetGains += amount;
      if (amount !== 0) {
        onRecord(category, "saleNetGains", variable, monthIndex, amount);
      }
    }
    onRecord(
      category,
      "totals",
      "saleNetGains",
      monthIndex,
      r2(totalSaleNetGains),
    );

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
      const totals = computeTotals(persona);
      results.push({
        year,
        month,
        monthIndex,
        date,
        amount: totals.monthlyExpenses,
        category,
        group: "totals",
        variable: "monthlyExpenses",
      });
      results.push({
        year,
        month,
        monthIndex,
        date,
        amount: totals.cumulativeExpenses,
        category,
        group: "totals",
        variable: "cumulativeExpenses",
      });
      results.push({
        year,
        month,
        monthIndex,
        date,
        amount: totals.monthlyGains,
        category,
        group: "totals",
        variable: "monthlyGains",
      });
      results.push({
        year,
        month,
        monthIndex,
        date,
        amount: totals.cumulativeGains,
        category,
        group: "totals",
        variable: "cumulativeGains",
      });
      results.push({
        year,
        month,
        monthIndex,
        date,
        amount: totals.assets,
        category,
        group: "totals",
        variable: "assets",
      });
      results.push({
        year,
        month,
        monthIndex,
        date,
        amount: totals.saleCosts,
        category,
        group: "totals",
        variable: "saleCosts",
      });
      results.push({
        year,
        month,
        monthIndex,
        date,
        amount: totals.saleNetGains,
        category,
        group: "totals",
        variable: "saleNetGains",
      });
    }
  } else {
    const date = new Date(Date.UTC(year, month, 1));
    // Process monthlyExpenses
    let totalMonthlyExpenses = 0;
    for (
      const variable of MONTHLY_EXPENSES_KEYS
    ) {
      const amount = persona.monthlyExpenses[variable];
      totalMonthlyExpenses += amount;
      if (amount !== 0) {
        if (
          (variable === "mortgageCapital" ||
            variable === "mortgageInterests") && mortgagePayment
        ) {
          results.push({
            year,
            month,
            monthIndex,
            date,
            amount,
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
            amount,
            category,
            group: "monthlyExpenses",
            variable,
          });
        }
      }
    }
    results.push({
      year,
      month,
      monthIndex,
      date,
      amount: r2(totalMonthlyExpenses),
      category,
      group: "totals",
      variable: "monthlyExpenses",
    });

    // Process cumulativeExpenses
    let totalCumulativeExpenses = 0;
    for (
      const variable of CUMULATIVE_EXPENSES_KEYS
    ) {
      const amount = persona.cumulativeExpenses[variable];
      totalCumulativeExpenses += amount;
      if (amount !== 0) {
        results.push({
          year,
          month,
          monthIndex,
          date,
          amount,
          category,
          group: "cumulativeExpenses",
          variable,
        });
      }
    }
    results.push({
      year,
      month,
      monthIndex,
      date,
      amount: r2(totalCumulativeExpenses),
      category,
      group: "totals",
      variable: "cumulativeExpenses",
    });

    // Process monthlyGains
    let totalMonthlyGains = 0;
    for (
      const variable of MONTHLY_GAINS_KEYS
    ) {
      const amount = persona.monthlyGains[variable];
      totalMonthlyGains += amount;
      if (amount !== 0) {
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
            amount,
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
            amount,
            category,
            group: "monthlyGains",
            variable,
          });
        }
      }
    }
    results.push({
      year,
      month,
      monthIndex,
      date,
      amount: r2(totalMonthlyGains),
      category,
      group: "totals",
      variable: "monthlyGains",
    });

    // Process cumulativeGains
    let totalCumulativeGains = 0;
    for (
      const variable of CUMULATIVE_GAINS_KEYS
    ) {
      const amount = persona.cumulativeGains[variable];
      totalCumulativeGains += amount;
      if (amount !== 0) {
        results.push({
          year,
          month,
          monthIndex,
          date,
          amount,
          category,
          group: "cumulativeGains",
          variable,
        });
      }
    }
    results.push({
      year,
      month,
      monthIndex,
      date,
      amount: r2(totalCumulativeGains),
      category,
      group: "totals",
      variable: "cumulativeGains",
    });

    // Process assets
    let totalAssets = 0;
    for (
      const variable of ASSETS_KEYS
    ) {
      const amount = persona.assets[variable];
      totalAssets += amount;
      if (amount !== 0) {
        results.push({
          year,
          month,
          monthIndex,
          date,
          amount,
          category,
          group: "assets",
          variable,
        });
      }
    }
    results.push({
      year,
      month,
      monthIndex,
      date,
      amount: r2(totalAssets),
      category,
      group: "totals",
      variable: "assets",
    });

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
    let totalSaleCosts = 0;
    for (
      const variable of SALE_COSTS_KEYS
    ) {
      const amount = persona.saleCosts[variable];
      totalSaleCosts += amount;
      if (amount !== 0) {
        results.push({
          year,
          month,
          monthIndex,
          date,
          amount,
          category,
          group: "saleCosts",
          variable,
        });
      }
    }
    results.push({
      year,
      month,
      monthIndex,
      date,
      amount: r2(totalSaleCosts),
      category,
      group: "totals",
      variable: "saleCosts",
    });

    // Process saleNetGains
    let totalSaleNetGains = 0;
    for (
      const variable of SALE_NET_GAINS_KEYS
    ) {
      const amount = persona.saleNetGains[variable];
      totalSaleNetGains += amount;
      if (amount !== 0) {
        results.push({
          year,
          month,
          monthIndex,
          date,
          amount,
          category,
          group: "saleNetGains",
          variable,
        });
      }
    }
    results.push({
      year,
      month,
      monthIndex,
      date,
      amount: r2(totalSaleNetGains),
      category,
      group: "totals",
      variable: "saleNetGains",
    });
  }
}
