/**
 * Financial calculations and data fetching.
 * @module index
 */

import adjustToInflation from "./finance/adjustToInflation.ts";
import mortgagePayments from "./finance/mortgagePayments.ts";
import mortgageInsurancePremium from "./finance/mortgageInsurancePremium.ts";
import mortgageMaxAmount from "./finance/mortgageMaxAmount.ts";
import getMinimumDownPayment from "./finance/getMinimumDownPayment.ts";
import getYahooFinanceData from "./finance/getYahooFinanceData.ts";
import variableMortgagePayments from "./finance/variableMortgagePayments.ts";
import simulateRentVsBuy from "./finance/simulateRentVsBuy.ts";
import simulateRentVsBuyMonteCarlo from "./finance/simulateRentVsBuyMonteCarlo.ts";
import getRentVsBuyCholeskyMatrix from "./finance/helpers/rentVsBuy/getRentVsBuyCholeskyMatrix.ts";
import getMortgagePenalty from "./finance/getMortgagePenalty.ts";
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
  getMinimumDownPayment,
  getMortgagePenalty,
  getRentVsBuyCholeskyMatrix,
  getSalesTax,
  getYahooFinanceData,
  mortgageInsurancePremium,
  mortgageMaxAmount,
  mortgagePayments,
  simulateRentVsBuy,
  simulateRentVsBuyMonteCarlo,
  variableMortgagePayments,
};
