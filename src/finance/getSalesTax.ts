/**
 * Calculates the Canadian sales tax for a given amount and province. Rates as of March 2026.
 *
 * @param amount - The base amount before tax.
 * @param province - The province or territory.
 * @returns An object containing the breakdown of taxes and the total amount.
 *
 * @example
 * ```ts
 * const salesTax = getSalesTax(100, "QC");
 * console.log(salesTax);
 * // { gst: 5, pst: 9.975, hst: 0, totalTax: 14.975, totalAmount: 114.975 }
 * ```
 *
 * Reference: https://www.retailcouncil.org/resources/quick-facts/sales-tax-rates-by-province/
 */
export default function getSalesTax(
  amount: number,
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
): {
  gst: number;
  pst: number;
  hst: number;
  totalTax: number;
  totalAmount: number;
} {
  let gstRate = 0;
  let pstRate = 0;
  let hstRate = 0;

  switch (province) {
    case "Alberta":
    case "Northwest Territories":
    case "Nunavut":
    case "Yukon":
      gstRate = 0.05;
      break;
    case "British Columbia":
      gstRate = 0.05;
      pstRate = 0.07;
      break;
    case "Manitoba":
      gstRate = 0.05;
      pstRate = 0.07;
      break;
    case "Newfoundland and Labrador":
      hstRate = 0.15;
      break;
    case "New Brunswick":
      hstRate = 0.15;
      break;
    case "Nova Scotia":
      hstRate = 0.14;
      break;
    case "Prince Edward Island":
      hstRate = 0.15;
      break;
    case "Ontario":
      hstRate = 0.13;
      break;
    case "Quebec":
      gstRate = 0.05;
      pstRate = 0.09975;
      break;
    case "Saskatchewan":
      gstRate = 0.05;
      pstRate = 0.06;
      break;
  }

  const gst = Number((amount * gstRate).toFixed(4));
  const pst = Number((amount * pstRate).toFixed(4));
  const hst = Number((amount * hstRate).toFixed(4));
  const totalTax = Number((gst + pst + hst).toFixed(4));

  return {
    gst,
    pst,
    hst,
    totalTax,
    totalAmount: Number((amount + totalTax).toFixed(4)),
  };
}
