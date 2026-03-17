type Province =
  | "Newfoundland and Labrador"
  | "Prince Edward Island"
  | "Nova Scotia"
  | "New Brunswick"
  | "Quebec"
  | "Ontario"
  | "Manitoba"
  | "Saskatchewan"
  | "Alberta"
  | "British Columbia"
  | "Yukon"
  | "Northwest Territories"
  | "Nunavut";

interface TaxBracket {
  rate: number;
  threshold: number;
}

// 2026 Federal Brackets
const FEDERAL_BRACKETS: TaxBracket[] = [
  { rate: 0.14, threshold: 0 },
  { rate: 0.205, threshold: 58523 },
  { rate: 0.26, threshold: 117045 },
  { rate: 0.29, threshold: 181440 },
  { rate: 0.33, threshold: 258482 },
];

// 2026 Provincial Brackets
const PROVINCIAL_BRACKETS: Record<Province, TaxBracket[]> = {
  "Ontario": [
    { rate: 0.0505, threshold: 0 },
    { rate: 0.0915, threshold: 53891 },
    { rate: 0.1116, threshold: 107785 },
    { rate: 0.1216, threshold: 150000 },
    { rate: 0.1316, threshold: 220000 },
  ],
  "Quebec": [
    { rate: 0.14, threshold: 0 },
    { rate: 0.19, threshold: 54345 },
    { rate: 0.24, threshold: 108680 },
    { rate: 0.2575, threshold: 132245 },
  ],
  "British Columbia": [
    { rate: 0.0506, threshold: 0 },
    { rate: 0.077, threshold: 50363 },
    { rate: 0.105, threshold: 100728 },
    { rate: 0.1229, threshold: 115648 },
    { rate: 0.147, threshold: 140430 },
    { rate: 0.168, threshold: 190405 },
    { rate: 0.205, threshold: 265545 },
  ],
  "Alberta": [
    { rate: 0.08, threshold: 0 },
    { rate: 0.10, threshold: 61200 },
    { rate: 0.12, threshold: 154259 },
    { rate: 0.13, threshold: 185111 },
    { rate: 0.14, threshold: 246813 },
    { rate: 0.15, threshold: 370220 },
  ],
  "Manitoba": [
    { rate: 0.108, threshold: 0 },
    { rate: 0.1275, threshold: 47000 },
    { rate: 0.174, threshold: 100000 },
  ],
  "Saskatchewan": [
    { rate: 0.105, threshold: 0 },
    { rate: 0.125, threshold: 54532 },
    { rate: 0.145, threshold: 155805 },
  ],
  "Nova Scotia": [
    { rate: 0.0879, threshold: 0 },
    { rate: 0.1495, threshold: 30995 },
    { rate: 0.1667, threshold: 61991 },
    { rate: 0.175, threshold: 97417 },
    { rate: 0.21, threshold: 157124 },
  ],
  "New Brunswick": [
    { rate: 0.094, threshold: 0 },
    { rate: 0.14, threshold: 52333 },
    { rate: 0.16, threshold: 104666 },
    { rate: 0.195, threshold: 193861 },
  ],
  "Newfoundland and Labrador": [
    { rate: 0.087, threshold: 0 },
    { rate: 0.145, threshold: 44678 },
    { rate: 0.158, threshold: 89354 },
    { rate: 0.178, threshold: 159528 },
    { rate: 0.198, threshold: 223340 },
    { rate: 0.208, threshold: 285319 },
    { rate: 0.213, threshold: 570638 },
    { rate: 0.218, threshold: 1141275 },
  ],
  "Prince Edward Island": [
    { rate: 0.095, threshold: 0 },
    { rate: 0.1347, threshold: 33928 },
    { rate: 0.166, threshold: 65820 },
    { rate: 0.1762, threshold: 106890 },
    { rate: 0.19, threshold: 142250 },
  ],
  "Yukon": [
    { rate: 0.064, threshold: 0 },
    { rate: 0.09, threshold: 58523 },
    { rate: 0.109, threshold: 117045 },
    { rate: 0.128, threshold: 181440 },
    { rate: 0.15, threshold: 500000 },
  ],
  "Northwest Territories": [
    { rate: 0.059, threshold: 0 },
    { rate: 0.086, threshold: 53003 },
    { rate: 0.122, threshold: 106009 },
    { rate: 0.1405, threshold: 172346 },
  ],
  "Nunavut": [
    { rate: 0.04, threshold: 0 },
    { rate: 0.07, threshold: 55801 },
    { rate: 0.09, threshold: 111602 },
    { rate: 0.115, threshold: 181439 },
  ],
};

function calculateTax(
  income: number,
  brackets: TaxBracket[],
): { amount: number; marginalRate: number } {
  let tax = 0;
  let marginalRate = 0;

  for (let i = 0; i < brackets.length; i++) {
    const currentBracket = brackets[i];
    const nextBracket = brackets[i + 1];
    const threshold = currentBracket.threshold;
    const nextThreshold = nextBracket ? nextBracket.threshold : Infinity;

    if (income > threshold) {
      const taxableInThisBracket = Math.min(income, nextThreshold) - threshold;
      tax += taxableInThisBracket * currentBracket.rate;
      marginalRate = currentBracket.rate;
    } else {
      break;
    }
  }

  return { amount: tax, marginalRate };
}

/**
 * Calculates the 2026 Federal Basic Personal Amount.
 * The BPA scales down for high earners between $181,440 and $258,482.
 */
function getFederalBPA(income: number): number {
  const maxBPA = 16452;
  const minBPA = 14829;
  const phaseOutStart = 181440;
  const phaseOutEnd = 258482;

  if (income <= phaseOutStart) return maxBPA;
  if (income >= phaseOutEnd) return minBPA;

  const phaseOutRatio = (income - phaseOutStart) /
    (phaseOutEnd - phaseOutStart);
  return maxBPA - (phaseOutRatio * (maxBPA - minBPA));
}

/**
 * Returns the 2026 Provincial Basic Personal Amount based on the province.
 */
function getProvincialBPA(income: number, province: Province): number {
  switch (province) {
    case "Yukon":
      return getFederalBPA(income);
    case "Manitoba": {
      const maxBpa = 15780;
      const phaseOutStart = 200000;
      const phaseOutEnd = 400000;
      if (income <= phaseOutStart) return maxBpa;
      if (income >= phaseOutEnd) return 0;
      return maxBpa -
        (maxBpa * ((income - phaseOutStart) / (phaseOutEnd - phaseOutStart)));
    }
    case "Alberta":
      return 22769;
    case "Saskatchewan":
      return 20381;
    case "Nunavut":
      return 19659;
    case "Quebec":
      return 18952;
    case "Northwest Territories":
      return 18198;
    case "Prince Edward Island":
      return 15000;
    case "New Brunswick":
      return 13664;
    case "British Columbia":
      return 13216;
    case "Ontario":
      return 12989;
    case "Nova Scotia":
      return 11932;
    case "Newfoundland and Labrador":
      return 11188;
    default:
      return 0;
  }
}

/**
 * Calculates the Ontario Surtax for 2026 based on the Basic Ontario Tax.
 * Returns the surtax amount and the multiplier to adjust the effective marginal rate.
 */
function getOntarioSurtax(
  basicOntarioTax: number,
): { surtaxAmount: number; marginalMultiplier: number } {
  const surtaxThreshold1 = 5818;
  const surtaxThreshold2 = 7446;

  let surtaxAmount = 0;
  let marginalMultiplier = 1;

  if (basicOntarioTax > surtaxThreshold1) {
    surtaxAmount += 0.20 * (basicOntarioTax - surtaxThreshold1);
    marginalMultiplier += 0.20;
  }

  if (basicOntarioTax > surtaxThreshold2) {
    surtaxAmount += 0.36 * (basicOntarioTax - surtaxThreshold2);
    marginalMultiplier += 0.36; // Stacks with the 20% tier for a total of 1.56
  }

  return { surtaxAmount, marginalMultiplier };
}

/**
 * Calculates federal and provincial income tax for a given income in a specific province.
 *
 * Updated for 2026 tax brackets, Basic Personal Amounts (BPA), Quebec Abatement, and Ontario Surtax.
 * * @param income - Taxable income
 * @param province - The province or territory for provincial tax calculation
 * @returns An object containing federal and provincial tax details, including separate surtax values.
 */
export function getIncomeTax(
  income: number,
  province: Province,
): {
  federalRate: number;
  provincialRate: number;
  federalTax: number;
  provincialTax: number; // Base provincial tax only (excludes surtax)
  provincialSurtax: number; // The explicit surtax amount
  totalTax: number;
} {
  // --- 1. FEDERAL TAX CALCULATION ---
  const federalResult = calculateTax(income, FEDERAL_BRACKETS);

  const federalBpaAmount = getFederalBPA(income);
  const federalBpaCredit = federalBpaAmount * FEDERAL_BRACKETS[0].rate;
  let federalTax = Math.max(0, federalResult.amount - federalBpaCredit);

  if (province === "Quebec") {
    const quebecAbatement = federalTax * 0.165;
    federalTax = Math.max(0, federalTax - quebecAbatement);
  }

  // --- 2. PROVINCIAL TAX CALCULATION ---
  const provincialBrackets = PROVINCIAL_BRACKETS[province];
  const provincialResult = calculateTax(income, provincialBrackets);

  const provincialBpaAmount = getProvincialBPA(income, province);
  const provincialBpaCredit = provincialBpaAmount * provincialBrackets[0].rate;

  const provincialTax = Math.max(
    0,
    provincialResult.amount - provincialBpaCredit,
  );
  let provincialMarginalRate = provincialResult.marginalRate;
  let provincialSurtaxAmount = 0;

  // Apply Ontario Surtax and adjust the effective marginal rate
  if (province === "Ontario" && provincialTax > 0) {
    const { surtaxAmount, marginalMultiplier } = getOntarioSurtax(
      provincialTax,
    );
    provincialSurtaxAmount = surtaxAmount;
    // We no longer add surtaxAmount to provincialTax here.
    provincialMarginalRate *= marginalMultiplier;
  }

  // --- 3. RETURN RESULTS ---
  return {
    federalRate: federalResult.marginalRate,
    provincialRate: provincialMarginalRate,
    federalTax: Math.round(federalTax),
    provincialTax: Math.round(provincialTax),
    provincialSurtax: Math.round(provincialSurtaxAmount),
    totalTax: Math.round(federalTax + provincialTax + provincialSurtaxAmount),
  };
}
