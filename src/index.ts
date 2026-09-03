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
 * npm i @nshiab/journalism-finance
 * ```
 *
 * To import a function, use:
 * ```ts
 * import { functionName } from "@nshiab/journalism-finance";
 * ```
 *
 * To import a function from the web entry point, use:
 * ```ts
 * import { functionName } from "@nshiab/journalism-finance/web";
 * ```
 */

import getYahooFinanceData from "./finance/getYahooFinanceData.ts";
export * from "./web.ts";
export { getYahooFinanceData };
