import { round } from "@nshiab/journalism-format";
import getMortgagePenalty from "./getMortgagePenalty.ts";
import type { Persona } from "./types/persona.ts";
import type { MortgagePayment } from "./types/mortgagePayment.ts";

export default function computeSale(
  monthIndex: number,
  persona: Persona,
  combinedTaxRate: number,
  mortgagePayment: MortgagePayment | null,
  currentPostedRates: Record<number, number> | null,
  mortgageType: "fixed" | "variable" | null,
) {
  const TERM_MONTHS = 60;

  // First we calculate the sale costs
  const stockGains = persona.assets.stocks - persona.cumulativeGains.newStocks;
  persona.saleCosts.stockTaxes = stockGains > 0
    ? round((stockGains / 2) * combinedTaxRate, { decimals: 2 })
    : 0;

  // Then we calculate the home selling costs
  if (mortgagePayment && currentPostedRates && mortgageType) {
    persona.saleCosts.homeSellingCommission = round(
      persona.params.homeValue * persona.params.sellingCommissionRate,
      { decimals: 2 },
    );
    persona.saleCosts.homeSellingFixedFees = persona.params.sellingFixedFees;
    const remainingMonthsToTerm = TERM_MONTHS - (monthIndex % TERM_MONTHS) - 1;
    const mortgagePenalty = getMortgagePenalty({
      remainingMonthsToTerm,
      mortgageBalance: mortgagePayment.balance,
      postedInterestRate: mortgagePayment.postedInterestRate,
      rateDiscount: mortgagePayment.fixedRateDiscount,
      currentPostedRates,
      mortgageType,
    });
    persona.saleCosts.mortgagePenalty = mortgagePenalty;
    persona.saleCosts.mortgageBalance = mortgagePayment.balance;
  }

  // Now we calculate the sale gains
  persona.saleNetGains.stockSellingGains = round(
    persona.assets.stocks -
      persona.saleCosts.stockTaxes,
    { decimals: 2 },
  );
  persona.saleNetGains.tfsaSellingGains = persona.assets.tfsa;
  persona.saleNetGains.homeSellingGains = round(
    persona.params.homeValue -
      persona.saleCosts.homeSellingCommission -
      persona.saleCosts.homeSellingFixedFees -
      persona.saleCosts.mortgagePenalty - persona.saleCosts.mortgageBalance,
    { decimals: 2 },
  );
  persona.saleNetGains.securityDeposit = persona.assets.securityDeposit;
}
