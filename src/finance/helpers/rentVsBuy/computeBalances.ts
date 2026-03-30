import { round } from "@nshiab/journalism-format";
import type { Persona } from "./types/persona.ts";

export default function computeBalances(
  persona: Persona,
  finalBalanceOnly: boolean,
  monthIndex: number,
  numberOfMonths: number,
) {
  if (!finalBalanceOnly || monthIndex === numberOfMonths - 1) {
    // Monthly balance
    const totalMonthlyExpenses = (Object.keys(persona.monthlyExpenses) as Array<
      keyof typeof persona.monthlyExpenses
    >).reduce(
      (sum, key) => {
        if (key === "tfsaFees" || key === "stocksFees") {
          return sum;
        }
        return sum + persona.monthlyExpenses[key];
      },
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
    const totalCumulativeExpenses = (Object.keys(
      persona.cumulativeExpenses,
    ) as Array<keyof typeof persona.cumulativeExpenses>).reduce(
      (sum, key) => {
        if (key === "tfsaFees" || key === "stocksFees") {
          return sum;
        }
        return sum + persona.cumulativeExpenses[key];
      },
      0,
    );
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
}
