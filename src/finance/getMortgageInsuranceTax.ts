import type { Province } from "./getSalesTax.ts";

/**
 * Calculates the provincial sales tax on a mortgage insurance premium.
 * Mortgage insurance premiums are exempt from federal GST/HST, but specific
 * provinces charge a provincial sales tax on these premiums.
 *
 * - Ontario: 8% Retail Sales Tax (RST)
 * - Quebec: 9% Tax on Insurance Premiums
 * - Saskatchewan: 6% Provincial Sales Tax (PST)
 *
 * @param insurancePremium - The total mortgage insurance premium amount.
 * @param province - The province or territory.
 * @returns The tax amount rounded to two decimal places.
 *
 * @example
 * ```ts
 * const tax = getMortgageInsuranceTax(19_000, "Ontario");
 * console.log(tax); // 1520
 * ```
 * @category Finance
 */
export default function getMortgageInsuranceTax(
  insurancePremium: number,
  province: Province,
): number {
  let taxRate = 0;

  if (province === "Ontario") {
    taxRate = 0.08;
  } else if (province === "Quebec") {
    taxRate = 0.09;
  } else if (province === "Saskatchewan") {
    taxRate = 0.06;
  }

  // Rounding to 2 decimal places to match regular financial transactions,
  // or generally we can return precise and the consumer rounds it,
  // but let's use standard rounding.
  return Math.round((insurancePremium * taxRate) * 100) / 100;
}
