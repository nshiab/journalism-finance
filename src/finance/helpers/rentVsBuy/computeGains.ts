import { round } from "@nshiab/journalism-format";
import getTfsaContribution from "./getTfsaContribution.ts";
import type { Persona } from "./types/persona.ts";
import type { MortgagePayment } from "./types/mortgagePayment.ts";

export default function computeGains(
  year: number,
  persona: Persona,
  mortgagePayment: MortgagePayment | null,
  monthlyMarketReturnRate: number,
  totalMonthlyExpenses: number,
  maxMonthlyExpenses: number,
  tfsaContributions: boolean,
  couple: boolean | undefined,
  annualInvestmentFeeRate: number,
) {
  // We start by calculating the current month TFSA and stock gains.
  // The effective monthly rate nets out the annual investment fee (e.g. ETF MER).
  // Multiplicative combination ensures the fee is charged on the grown balance,
  // not the starting balance (the cross-term r × f/12 is negligible in practice).
  const effectiveMonthlyRate = (1 + monthlyMarketReturnRate) *
      (1 - annualInvestmentFeeRate / 12) - 1;

  // Compute gross and net gains per account, then derive fees as the difference.
  // This avoids rounding discrepancies between the fee tracker and the gain values.
  const tfsaGrossGain = round(
    persona.assets.tfsa * monthlyMarketReturnRate,
    { decimals: 2 },
  );
  const tfsaNetGain = round(
    persona.assets.tfsa * effectiveMonthlyRate,
    { decimals: 2 },
  );
  const stocksGrossGain = round(
    persona.assets.stocks * monthlyMarketReturnRate,
    { decimals: 2 },
  );
  const stocksNetGain = round(
    persona.assets.stocks * effectiveMonthlyRate,
    { decimals: 2 },
  );

  persona.monthlyExpenses.tfsaFees = round(tfsaGrossGain - tfsaNetGain, {
    decimals: 2,
  });
  persona.monthlyExpenses.stocksFees = round(
    stocksGrossGain - stocksNetGain,
    { decimals: 2 },
  );
  persona.cumulativeExpenses.tfsaFees = round(
    persona.cumulativeExpenses.tfsaFees + persona.monthlyExpenses.tfsaFees,
    { decimals: 2 },
  );
  persona.cumulativeExpenses.stocksFees = round(
    persona.cumulativeExpenses.stocksFees + persona.monthlyExpenses.stocksFees,
    { decimals: 2 },
  );

  persona.monthlyGains.tfsaGains = tfsaNetGain;
  persona.monthlyGains.stocksGains = stocksNetGain;

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
    let tfsaRoom = getTfsaContribution(
      year,
      couple
        ? persona.cumulativeGains.tfsaContribution / 2
        : persona.cumulativeGains.tfsaContribution,
    );

    if (couple) {
      tfsaRoom *= 2;
    }

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
