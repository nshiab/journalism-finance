/**
 * Browser-safe financial calculations. Import from `@nshiab/journalism-finance/web`.
 * @module web
 */

import adjustToInflation from "./finance/adjustToInflation.ts";
import mortgagePayments from "./finance/mortgagePayments.ts";
import mortgageInsurancePremium from "./finance/mortgageInsurancePremium.ts";
import mortgageMaxAmount from "./finance/mortgageMaxAmount.ts";
import variableMortgagePayments from "./finance/variableMortgagePayments.ts";
import simulateRentVsBuy from "./finance/simulateRentVsBuy.ts";
import simulateRentVsBuyMonteCarlo, {
  WINNER_CATEGORIES,
} from "./finance/simulateRentVsBuyMonteCarlo.ts";
import getMortgagePenalty from "./finance/getMortgagePenalty.ts";
import getRentVsBuyCholeskyMatrix from "./finance/helpers/rentVsBuy/getRentVsBuyCholeskyMatrix.ts";
import getSalesTax from "./finance/getSalesTax.ts";
import getIncomeTax from "./finance/getIncomeTax.ts";
import {
  decodeMonteCarloMonthlyIterations,
  decodeMonteCarloMonthlyQuantiles,
  decodeMonteCarloValues,
  decodeMonteCarloWinners,
  decodeMonteCarloWinnerSnapshots,
} from "./finance/decodeMonteCarloResults.ts";
import getLandTransferTax from "./finance/getLandTransferTax.ts";

export {
  adjustToInflation,
  decodeMonteCarloMonthlyIterations,
  decodeMonteCarloMonthlyQuantiles,
  decodeMonteCarloValues,
  decodeMonteCarloWinners,
  decodeMonteCarloWinnerSnapshots,
  getIncomeTax,
  getLandTransferTax,
  getMortgagePenalty,
  getRentVsBuyCholeskyMatrix,
  getSalesTax,
  mortgageInsurancePremium,
  mortgageMaxAmount,
  mortgagePayments,
  simulateRentVsBuy,
  simulateRentVsBuyMonteCarlo,
  variableMortgagePayments,
  WINNER_CATEGORIES,
};
