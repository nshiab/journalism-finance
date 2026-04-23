/**
 * Valid Canadian metropolitan markets for Land Transfer Tax calculations.
 */
export type City =
  | "Toronto"
  | "Montreal"
  | "Calgary"
  | "Ottawa"
  | "Edmonton"
  | "Winnipeg"
  | "Vancouver"
  | "Hamilton"
  | "Quebec"
  | "Halifax"
  | "London"
  | "Saskatoon"
  | "Kitchener-Waterloo"
  | "Regina"
  | "Victoria"
  | "Barrie"
  | "Guelph"
  | "Kingston"
  | "Fredericton"
  | "Moncton"
  | "Saint John (NB)"
  | "Saint John's (NL)";

interface TaxBracket {
  limit: number;
  rate: number;
}

/**
 * Helper function to calculate progressive marginal taxes.
 */
function calculateMarginalTax(value: number, brackets: TaxBracket[]): number {
  let tax = 0;
  let previousLimit = 0;

  for (const bracket of brackets) {
    if (value > previousLimit) {
      const taxableAmount = Math.min(value, bracket.limit) - previousLimit;
      tax += taxableAmount * bracket.rate;
      previousLimit = bracket.limit;
    } else {
      break;
    }
  }

  return tax;
}

/**
 * Calculates the standard Land Transfer Tax (or equivalent registration fee)
 * for a given city and property value based on 2026 tax frameworks.
 * * **Rebate Limitations and Exclusions:**
 * The `firstTimeOwner` parameter applies structural, point-of-sale land transfer tax
 * rebates assuming the buyer meets all idealized programmatic criteria (e.g., absolute
 * zero global ownership history, Canadian citizenship/PR, and continuous provincial residency).
 * * The following rebates and subsidies are INTENTIONALLY EXCLUDED from this calculation:
 * - **Nova Scotia:** The First-Time Home Buyers Rebate is excluded because it is restricted
 * exclusively to a refund on the provincial portion of the HST for *newly built* properties,
 * not the 1.5% municipal Deed Transfer Tax calculated here.
 * - **Montreal (HPAP) & Quebec City (Programme Accès Famille):** Excluded because they operate
 * as localized financial grants or down payment assistance loans requiring specific household
 * compositions (e.g., dependents under 18) or new-build environmental certifications, rather
 * than structural tax base reductions.
 * - **Manitoba:** Excluded because the "Home Buyers' Amount" is a $1,500 general income tax
 * credit claimed on annual tax returns, not an upfront point-of-sale deduction from the
 * provincial land transfer tax.
 * @param city - The metropolitan market.
 * @param propertyValue - The fair market value or purchase price of the property.
 * @param firstTimeOwner - Indicates if the purchaser qualifies for strict FTHB exemptions.
 * @returns The total calculated transaction friction cost in Canadian Dollars.
 */
export default function getLandTransferTax(
  city: City,
  propertyValue: number,
  firstTimeOwner: boolean = false,
): number {
  // 1. Ontario Provincial Brackets
  // Tax Source: https://www.ontario.ca/document/land-transfer-tax/calculating-land-transfer-tax
  const ontarioProvincialBrackets: TaxBracket[] = [
    { limit: 55000, rate: 0.005 },
    { limit: 250000, rate: 0.010 },
    { limit: 400000, rate: 0.015 },
    { limit: 2000000, rate: 0.020 },
    { limit: Infinity, rate: 0.025 },
  ];

  const ontarioSecondaryCities = [
    "Ottawa",
    "Hamilton",
    "London",
    "Kitchener-Waterloo",
    "Barrie",
    "Guelph",
    "Kingston",
  ];

  if (ontarioSecondaryCities.includes(city)) {
    let tax = calculateMarginalTax(propertyValue, ontarioProvincialBrackets);
    if (firstTimeOwner) {
      // FTHB Source: https://www.ontario.ca/document/land-transfer-tax/land-transfer-tax-refunds-first-time-homebuyers
      const rebate = Math.min(tax, 4000);
      tax -= rebate;
    }
    return tax;
  }

  // 2. Toronto (Dual Taxation)
  // Tax Source: https://www.toronto.ca/services-payments/property-taxes-utilities/municipal-land-transfer-tax-mltt/municipal-land-transfer-tax-mltt-rates-and-fees/
  if (city === "Toronto") {
    const torontoMLTTBrackets: TaxBracket[] = [
      { limit: 55000, rate: 0.005 },
      { limit: 250000, rate: 0.010 },
      { limit: 400000, rate: 0.015 },
      { limit: 2000000, rate: 0.020 },
      { limit: 3000000, rate: 0.025 },
      { limit: 4000000, rate: 0.044 },
      { limit: 5000000, rate: 0.0545 },
      { limit: 10000000, rate: 0.0650 },
      { limit: 20000000, rate: 0.0755 },
      { limit: Infinity, rate: 0.0860 },
    ];

    let provincialTax = calculateMarginalTax(
      propertyValue,
      ontarioProvincialBrackets,
    );
    let municipalTax = calculateMarginalTax(propertyValue, torontoMLTTBrackets);

    if (firstTimeOwner) {
      // Provincial FTHB Source: https://www.ontario.ca/document/land-transfer-tax/land-transfer-tax-refunds-first-time-homebuyers
      // Municipal FTHB Source: https://www.toronto.ca/services-payments/property-taxes-utilities/municipal-land-transfer-tax-mltt/municipal-land-transfer-tax-mltt-rebate-opportunities/
      const provincialRebate = Math.min(provincialTax, 4000);
      const municipalRebate = Math.min(municipalTax, 4475);
      provincialTax -= provincialRebate;
      municipalTax -= municipalRebate;
    }
    return provincialTax + municipalTax;
  }

  // 3. British Columbia (Vancouver, Victoria)
  // Tax Source: https://www2.gov.bc.ca/gov/content/taxes/property-taxes/property-transfer-tax
  if (city === "Vancouver" || city === "Victoria") {
    const bcBrackets: TaxBracket[] = [
      { limit: 200000, rate: 0.010 },
      { limit: 2000000, rate: 0.020 },
      { limit: Infinity, rate: 0.030 },
    ];

    let tax = calculateMarginalTax(propertyValue, bcBrackets);

    if (propertyValue > 3000000) {
      tax += (propertyValue - 3000000) * 0.02; // Luxury Surtax
    }

    if (firstTimeOwner) {
      // FTHB Source: https://www2.gov.bc.ca/gov/content/taxes/property-taxes/property-transfer-tax/exemptions/first-time-home-buyers
      if (propertyValue <= 835000) {
        tax = 0;
      } else if (propertyValue < 860000) {
        // Partial linear phase-out over $25,000 span starting with an $8,000 baseline
        const exemption = 8000 * ((860000 - propertyValue) / 25000);
        tax = Math.max(0, tax - exemption);
      }
    }
    return tax;
  }

  // 4 & 5. Quebec (Montreal, Quebec City)
  // Tax Sources:
  // Montreal: https://montreal.ca/en/articles/how-property-transfer-duties-are-calculated-9279
  // Quebec City: https://www.ville.quebec.qc.ca/citoyens/taxes_evaluation/droits_mutation_immobiliere.aspx
  if (city === "Montreal" || city === "Quebec") {
    let tax = 0;

    if (city === "Montreal") {
      const montrealBrackets: TaxBracket[] = [
        { limit: 62900, rate: 0.005 },
        { limit: 315000, rate: 0.010 },
        { limit: 552300, rate: 0.015 },
        { limit: 1104700, rate: 0.020 },
        { limit: 2136500, rate: 0.025 },
        { limit: 3113000, rate: 0.035 },
        { limit: Infinity, rate: 0.040 },
      ];
      tax = calculateMarginalTax(propertyValue, montrealBrackets);
    } else {
      const quebecCityBrackets: TaxBracket[] = [
        { limit: 62900, rate: 0.005 },
        { limit: 315000, rate: 0.010 },
        { limit: 500000, rate: 0.015 },
        { limit: 750000, rate: 0.025 },
        { limit: Infinity, rate: 0.030 },
      ];
      tax = calculateMarginalTax(propertyValue, quebecCityBrackets);
    }

    if (firstTimeOwner) {
      // 2026 Provincial FTHB Source: https://www.cbc.ca/news/canada/montreal/quebec-welcome-tax-homebuyers-1.7168671
      // Covers first $5,000, plus 25% of remainder up to an additional $875
      let baseRebate = Math.min(tax, 5000) +
        Math.min(Math.max(0, tax - 5000) * 0.25, 875);

      // Phase-out between $750,000 and $1,000,000
      if (propertyValue >= 1000000) {
        baseRebate = 0;
      } else if (propertyValue > 750000) {
        baseRebate *= (1000000 - propertyValue) / 250000;
      }

      tax = Math.max(0, tax - baseRebate);
    }
    return tax;
  }

  // 6. Manitoba (Winnipeg)
  // Tax Source: https://www.gov.mb.ca/finance/other/landtransfertax.html
  // No point-of-sale FTHB land transfer rebate available.
  if (city === "Winnipeg") {
    const manitobaBrackets: TaxBracket[] = [
      { limit: 30000, rate: 0.000 },
      { limit: 90000, rate: 0.005 },
      { limit: 150000, rate: 0.010 },
      { limit: 200000, rate: 0.015 },
      { limit: Infinity, rate: 0.020 },
    ];
    return calculateMarginalTax(propertyValue, manitobaBrackets);
  }

  // 7. Alberta (Calgary, Edmonton)
  // Tax Source: https://www.alberta.ca/register-land-title-document-plan
  // No FTHB rebate available for administrative levies.
  if (city === "Calgary" || city === "Edmonton") {
    return 50 + (propertyValue * 0.001);
  }

  // 8. Saskatchewan (Saskatoon, Regina)
  // Tax Source: https://www.saskregistries.ca/fees/landtitlesfees
  // No FTHB rebate available for administrative levies.
  if (city === "Saskatoon" || city === "Regina") {
    if (propertyValue <= 500) return 0;
    if (propertyValue <= 6300) return 25;
    return propertyValue * 0.004;
  }

  // 9. Nova Scotia (Halifax)
  // Tax Source: https://www.halifax.ca/home-property/property-taxes/taxes-halifax
  // No municipal exemption for DTT.
  if (city === "Halifax") {
    return propertyValue * 0.015;
  }

  // 10. New Brunswick (Fredericton, Moncton, Saint John (NB))
  // Tax Source: https://laws.gnb.ca/en/document/cs/R-2.1
  // No FTHB rebate available for RPTT.
  if (
    city === "Fredericton" || city === "Moncton" || city === "Saint John (NB)"
  ) {
    return propertyValue * 0.010;
  }

  // 11. Newfoundland and Labrador (Saint John's (NL))
  // Tax Source: https://www.gov.nl.ca/gs/registries/deeds/deed-reg/
  if (city === "Saint John's (NL)") {
    let fee = 100 + (propertyValue * 0.004);
    if (firstTimeOwner) {
      // FTHB Source: https://www.nlhc.nl.ca/housing-programs/first-time-homebuyers-program-fhp/
      // Program covers 50% of legal/registration closing costs
      fee *= 0.5;
    }
    return fee;
  }

  throw new Error(`Tax calculation logic not implemented for city: ${city}`);
}
