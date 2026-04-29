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
import simulateRentVsBuy, { type RentVsBuyRates } from "./finance/simulateRentVsBuy.ts";
import simulateRentVsBuyMonteCarlo from "./finance/simulateRentVsBuyMonteCarlo.ts";
import getRentVsBuyCholeskyMatrix, {
  type StochasticData,
  type StochasticVariable,
} from "./finance/helpers/rentVsBuy/getRentVsBuyCholeskyMatrix.ts";
import getMortgagePenalty from "./finance/getMortgagePenalty.ts";
import getSalesTax from "./finance/getSalesTax.ts";
import getIncomeTax from "./finance/getIncomeTax.ts";
import {
  decodeMonteCarloMonthlyIterations,
  decodeMonteCarloMonthlyQuantiles,
  decodeMonteCarloValues,
  decodeMonteCarloWinners,
} from "./finance/decodeMonteCarloResults.ts";
import type {
  BaseOptions,
  ColumnarResult,
  ColumnarReturn,
  MqCategory,
  MqGroup,
  MqVariable,
  SimParams,
  WinnersColumnar,
} from "./finance/simulateRentVsBuyMonteCarlo.ts";
import getLandTransferTax, { type City } from "./finance/getLandTransferTax.ts";
export {
  adjustToInflation,
  decodeMonteCarloMonthlyIterations,
  decodeMonteCarloMonthlyQuantiles,
  decodeMonteCarloValues,
  decodeMonteCarloWinners,
  getIncomeTax,
  getLandTransferTax,
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

export type {
  BaseOptions,
  City,
  ColumnarResult,
  ColumnarReturn,
  MqCategory,
  MqGroup,
  MqVariable,
  RentVsBuyRates,
  SimParams,
  StochasticData,
  StochasticVariable,
  WinnersColumnar,
};
