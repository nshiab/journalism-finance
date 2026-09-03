import { round } from "./helpers/format.ts";

/**
 * Calculates the minimum down payment required for a property purchase in Canada, based on the purchase price.
 *
 * The calculation follows the Financial Consumer Agency of Canada (FCAC) rules:
 * - For properties $500,000 or less: 5% of the purchase price.
 * - For properties between $500,000 and $1.5 million: 5% of the first $500,000, plus 10% of the portion above $500,000.
 * - For properties $1.5 million or more: 20% of the total purchase price.
 *
 * @param purchasePrice - The total price of the property being purchased.
 * @param options - Additional calculation options.
 *   @param options.decimals - The number of decimal places to round the result to. By default, the result is not rounded.
 * @returns The minimum down payment amount.
 * @throws {RangeError} If `purchasePrice` is negative or not finite.
 *
 * @example
 * ```ts
 * // Minimum down payment for a $400,000 home (5%)
 * const downPayment400k = getMinimumDownPayment(400_000);
 * console.log(downPayment400k); // 20000
 *
 * // Minimum down payment for a $600,000 home (5% of 500k + 10% of 100k)
 * const downPayment600k = getMinimumDownPayment(600_000);
 * console.log(downPayment600k); // 35000
 *
 * // Minimum down payment for a $1,600,000 home (20%)
 * const downPayment1600k = getMinimumDownPayment(1_600_000);
 * console.log(downPayment1600k); // 320000
 *
 * // Round the result to two decimal places
 * const downPaymentWithDecimals = getMinimumDownPayment(123.456, { decimals: 2 });
 * console.log(downPaymentWithDecimals); // 6.17
 * ```
 *
 * Reference: https://www.canada.ca/en/financial-consumer-agency/services/mortgages/down-payment.html
 * @category Finance
 */
export default function getMinimumDownPayment(
  purchasePrice: number,
  options: { decimals?: number } = {},
): number {
  if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
    throw new RangeError("purchasePrice must be a non-negative number.");
  }

  let downPayment: number;
  if (purchasePrice <= 500_000) {
    downPayment = purchasePrice * 0.05;
  } else if (purchasePrice < 1_500_000) {
    downPayment = 25_000 + (purchasePrice - 500_000) * 0.1;
  } else {
    downPayment = purchasePrice * 0.2;
  }

  return typeof options.decimals === "number"
    ? round(downPayment, options)
    : downPayment;
}
