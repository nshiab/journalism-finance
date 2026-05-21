import type { Persona } from "./types/persona.ts";

// Fast 2-decimal rounding via pure arithmetic (avoids toFixed string allocations).
const r2 = (x: number) => Math.round(x * 100) / 100;

/**
 * Computes monthly and cumulative balance summaries for a persona.
 *
 * **`summary.balance`** (monthly): nominal net cash flow for the month —
 * total gains minus total expenses. Not inflation-adjusted; used as a
 * point-in-time flow indicator.
 *
 * **`summaryCumulative.balance`**: net financial return expressed in today's
 * dollars — what you currently *have* (assets discounted to today's purchasing
 * power) minus what housing *cost* you (NPV of all cumulative expenses, each
 * discounted at its own period's inflation multiplier).
 * Formula: `adj(totalAssets) - totalCumulativeExpenses`
 * A positive value means your accumulated wealth exceeds the real cost of
 * housing; a higher value across scenarios means a better financial outcome.
 *
 * **`summaryCumulative.balanceAfterSelling`**: same net-financial-return
 * concept but uses liquidation proceeds instead of current asset values —
 * what you would *walk away with* (sale proceeds discounted to today's
 * dollars, after selling costs, taxes, and mortgage payoff) minus what
 * housing cost you (same NPV cumulative expenses).
 * Formula: `adj(totalSaleNetGains) - totalCumulativeExpenses`
 */
export default function computeBalances(
  persona: Persona,
  winVariableOnly: boolean,
  monthIndex: number,
  numberOfMonths: number,
  inflationMultiplier: number,
) {
  if (!winVariableOnly || monthIndex === numberOfMonths - 1) {
    // Monthly balance — nominal net cash flow for the month.
    const totalMonthlyExpenses = persona.monthlyExpenses.mortgageCapital +
      persona.monthlyExpenses.mortgageInterests +
      persona.monthlyExpenses.rent +
      persona.monthlyExpenses.insurance +
      persona.monthlyExpenses.securityDeposit +
      persona.monthlyExpenses.maintenance +
      persona.monthlyExpenses.propertyTax +
      persona.monthlyExpenses.condoFees +
      persona.monthlyExpenses.downPayment +
      persona.monthlyExpenses.purchaseFixedFees +
      persona.monthlyExpenses.insurancePremium;
    const totalMonthlyGains = persona.monthlyGains.tfsaGains +
      persona.monthlyGains.tfsaContribution +
      persona.monthlyGains.stocksGains +
      persona.monthlyGains.newStocks +
      persona.monthlyGains.homeEquityGains;
    persona.summary.balance = r2(
      totalMonthlyGains - totalMonthlyExpenses,
    );

    // Total cumulative expenses (NPV — each month discounted at its own
    // inflationMultiplier when accumulated in computeExpenses/computeGains).
    const totalCumulativeExpenses = persona.cumulativeExpenses.mortgageCapital +
      persona.cumulativeExpenses.mortgageInterests +
      persona.cumulativeExpenses.rent +
      persona.cumulativeExpenses.insurance +
      persona.cumulativeExpenses.securityDeposit +
      persona.cumulativeExpenses.maintenance +
      persona.cumulativeExpenses.propertyTax +
      persona.cumulativeExpenses.condoFees +
      persona.cumulativeExpenses.downPayment +
      persona.cumulativeExpenses.purchaseFixedFees +
      persona.cumulativeExpenses.landTransferTax +
      persona.cumulativeExpenses.insurancePremium +
      persona.cumulativeExpenses.tfsaFees +
      persona.cumulativeExpenses.stocksFees;

    // adj(assets) — current asset value in today's dollars.
    const totalAssets = persona.assets.tfsa +
      persona.assets.stocks +
      persona.assets.securityDeposit +
      persona.assets.homeEquity;
    persona.summaryCumulative.balance = r2(
      r2(totalAssets * inflationMultiplier) - totalCumulativeExpenses,
    );

    // adj(saleNetGains) — liquidation proceeds in today's dollars (selling
    // costs, mortgage payoff, and capital gains taxes already deducted).
    const totalSaleNetGains = persona.saleNetGains.stockSellingGains +
      persona.saleNetGains.tfsaSellingGains +
      persona.saleNetGains.homeSellingGains +
      persona.saleNetGains.securityDeposit;
    persona.summaryCumulative.balanceAfterSelling = r2(
      r2(totalSaleNetGains * inflationMultiplier) - totalCumulativeExpenses,
    );
  }
}
