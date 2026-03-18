/**
 * @module
 *
 * The Journalism library (finance functions)
 *
 * To install the library with Deno, use:
 * ```bash
 * deno add jsr:@nshiab/journalism-finance
 * ```
 *
 * To install the library with Node.js, use:
 * ```bash
 * npx jsr add @nshiab/journalism-finance
 * ```
 *
 * To import a function, use:
 * ```ts
 * import { functionName } from "@nshiab/journalism-finance";
 * ```
 */

import adjustToInflation from "./finance/adjustToInflation.ts";
import mortgagePayments from "./finance/mortgagePayments.ts";
import mortgageInsurancePremium from "./finance/mortgageInsurancePremium.ts";
import mortgageMaxAmount from "./finance/mortgageMaxAmount.ts";
import getYahooFinanceData from "./finance/getYahooFinanceData.ts";
import variableMortgagePayments from "./finance/variableMortgagePayments.ts";
import simulateRentVsBuy from "./finance/simulateRentVsBuy.ts";
import simulateRentVsBuyMonteCarlo from "./finance/simulateRentVsBuyMonteCarlo.ts";
import getMortgagePenalty from "./finance/getMortgagePenalty.ts";
import getSalesTax from "./finance/getSalesTax.ts";
import getIncomeTax from "./finance/getIncomeTax.ts";

export {
  adjustToInflation,
  getIncomeTax,
  getMortgagePenalty,
  getSalesTax,
  getYahooFinanceData,
  mortgageInsurancePremium,
  mortgageMaxAmount,
  mortgagePayments,
  simulateRentVsBuy,
  simulateRentVsBuyMonteCarlo,
  variableMortgagePayments,
};
