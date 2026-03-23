import { round } from "@nshiab/journalism-format";
import getMortgagePenalty from "../../getMortgagePenalty.ts";
import type { Persona } from "./types/persona.ts";
import type { MortgagePayment } from "./types/mortgagePayment.ts";
import getSalesTax from "../../getSalesTax.ts";
import getIncomeTax from "../../getIncomeTax.ts";

export default function computeSale(
  monthIndex: number,
  persona: Persona,
  employmentIncome: number,
  mortgagePayment: MortgagePayment | null,
  currentPostedRates: Record<number, number> | null,
  mortgageType: "fixed" | "variable" | null,
  finalBalanceOnly: boolean,
  numberOfMonths: number,
  province:
    | "Alberta"
    | "British Columbia"
    | "Manitoba"
    | "New Brunswick"
    | "Newfoundland and Labrador"
    | "Nova Scotia"
    | "Northwest Territories"
    | "Nunavut"
    | "Ontario"
    | "Prince Edward Island"
    | "Quebec"
    | "Saskatchewan"
    | "Yukon",
  couple?: boolean,
) {
  if (!finalBalanceOnly || monthIndex === numberOfMonths - 1) {
    const TERM_MONTHS = 60;

    // First we calculate the sale costs
    const stockGains = persona.assets.stocks -
      persona.cumulativeGains.newStocks;

    let stockTaxes = getIncomeTax(employmentIncome, province, 2025, {
      capitalGains: couple ? stockGains / 2 : stockGains,
      quebec: {
        ramq: false,
      },
    }).capitalGainsTax;

    if (couple) {
      stockTaxes *= 2;
    }

    persona.saleCosts.stockTaxes = stockTaxes;

    // Then we calculate the home selling costs
    if (mortgagePayment && currentPostedRates && mortgageType) {
      // Sales tax included
      persona.saleCosts.homeSellingCommission = round(
        (persona.params.homeValue * persona.params.sellingCommissionRate) +
          getSalesTax(
            persona.params.homeValue * persona.params.sellingCommissionRate,
            province,
            2025,
          ).totalTax,
        { decimals: 2 },
      );
      // Sales tax included
      persona.saleCosts.homeSellingFixedFees = round(
        persona.params.sellingFixedFees +
          getSalesTax(
            persona.params.sellingFixedFees,
            province,
            2025,
          ).totalTax,
        { decimals: 2 },
      );
      const remainingMonthsToTerm = TERM_MONTHS - (monthIndex % TERM_MONTHS) -
        1;
      const mortgagePenalty = getMortgagePenalty({
        remainingMonthsToTerm,
        mortgageBalance: mortgagePayment.balance,
        postedInterestRate: mortgagePayment.postedInterestRate,
        rateDiscount: mortgagePayment.fixedRateDiscount,
        rateMargin: mortgagePayment.variableRateMargin,
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
}
