import { round } from "@nshiab/journalism-format";
import type { Persona } from "./types/persona.ts";

export default function computeBalances(persona: Persona) {
  // Monthly balance
  const totalMonthlyExpenses = Object.values(persona.monthlyExpenses).reduce(
    (sum, value) => sum + value,
    0,
  );
  const totalMonthlyGains = Object.values(persona.monthlyGains).reduce(
    (sum, value) => sum + value,
    0,
  );
  persona.summary.balance = round(totalMonthlyGains - totalMonthlyExpenses, {
    decimals: 2,
  });

  // Cumulative balance
  const totalCumulativeExpenses = Object.values(
    persona.cumulativeExpenses,
  ).reduce((sum, value) => sum + value, 0);
  const totalCumulativeGains = Object.values(persona.cumulativeGains).reduce(
    (sum, value) => sum + value,
    0,
  );
  persona.summaryCumulative.balance = round(
    totalCumulativeGains -
      totalCumulativeExpenses,
    {
      decimals: 2,
    },
  );
  // Balance after selling
  const totalSaleNetGains = Object.values(persona.saleNetGains).reduce(
    (sum, value) => sum + value,
    0,
  );
  persona.summaryCumulative.balanceAfterSelling = round(
    totalSaleNetGains -
      totalCumulativeExpenses,
    {
      decimals: 2,
    },
  );
}
