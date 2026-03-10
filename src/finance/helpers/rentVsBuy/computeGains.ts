import { round } from "@nshiab/journalism-format";
import getTfsaContribution from "./getTfsaContribution.ts";
import type { Persona } from "./types/persona.ts";
import type { MortgagePayment } from "./types/mortgagePayment.ts";

export default function computeGains(
  year: number,
  persona: Persona,
  mortgagePayment: MortgagePayment | null,
  marketReturnRate: number,
  totalMonthlyExpenses: number,
  maxMonthlyExpenses: number,
  tfsaContributions: boolean,
) {
  // We start by calculating the current month TFSA and stock gains
  persona.monthlyGains.tfsaGains = round(
    persona.assets.tfsa * marketReturnRate,
    {
      decimals: 2,
    },
  );
  persona.monthlyGains.stocksGains = round(
    persona.assets.stocks * marketReturnRate,
    {
      decimals: 2,
    },
  );

  persona.cumulativeGains.tfsaGains = round(
    persona.cumulativeGains.tfsaGains +
      persona.monthlyGains.tfsaGains,
    { decimals: 2 },
  );
  persona.cumulativeGains.stocksGains = round(
    persona.cumulativeGains.stocksGains +
      persona.monthlyGains.stocksGains,
    { decimals: 2 },
  );

  persona.assets.tfsa = round(
    persona.assets.tfsa + persona.monthlyGains.tfsaGains,
    { decimals: 2 },
  );
  persona.assets.stocks = round(
    persona.assets.stocks + persona.monthlyGains.stocksGains,
    { decimals: 2 },
  );

  // We calculate home equity gains
  if (mortgagePayment) {
    const previousHomeEquity = persona.assets.homeEquity;
    persona.assets.homeEquity = round(
      persona.params.homeValue -
        mortgagePayment.balance,
      {
        decimals: 2,
      },
    );
    persona.monthlyGains.homeEquityGains = round(
      persona.assets.homeEquity -
        previousHomeEquity,
      { decimals: 2 },
    );
    persona.cumulativeGains.homeEquityGains = round(
      persona.cumulativeGains.homeEquityGains +
        persona.monthlyGains.homeEquityGains,
      { decimals: 2 },
    );
  }

  // Now we deal with any savings from reduced expenses
  let monthlySavings = maxMonthlyExpenses - totalMonthlyExpenses;

  // We check if we can invest these savings in the TFSA first
  if (tfsaContributions && monthlySavings > 0) {
    const tfsaRoom = getTfsaContribution(
      year,
      persona.cumulativeGains.tfsaContribution,
    );
    const tfsaContribution = Math.min(tfsaRoom, monthlySavings);

    persona.monthlyGains.tfsaContribution = tfsaContribution;
    persona.cumulativeGains.tfsaContribution = round(
      persona.cumulativeGains.tfsaContribution + tfsaContribution,
      { decimals: 2 },
    );
    persona.assets.tfsa = round(
      persona.assets.tfsa + tfsaContribution,
      { decimals: 2 },
    );
  } else {
    persona.monthlyGains.tfsaContribution = 0;
  }

  // Any remaining savings go into stocks
  monthlySavings = round(
    monthlySavings - persona.monthlyGains.tfsaContribution,
    { decimals: 2 },
  );
  if (monthlySavings > 0) {
    persona.monthlyGains.newStocks = monthlySavings;
    persona.cumulativeGains.newStocks = round(
      persona.cumulativeGains.newStocks + monthlySavings,
      { decimals: 2 },
    );
    persona.assets.stocks = round(
      persona.assets.stocks + monthlySavings,
      { decimals: 2 },
    );
  } else {
    persona.monthlyGains.newStocks = 0;
  }
}
