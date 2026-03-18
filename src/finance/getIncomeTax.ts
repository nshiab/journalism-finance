export type Province =
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

export type TaxYear = 2025 | 2026;

interface TaxBracket {
  rate: number;
  threshold: number;
}

export interface TaxBreakdown {
  federalRate: number;
  provincialRate: number;
  grossFederalTax: number;
  appliedFederalCredits: number;
  quebecAbatement: number;
  grossProvincialTax: number;
  appliedProvincialCredits: number;
  ontarioTaxReduction: number;
  provincialSurtax: number;
  healthPremium: number;
  cppOrQppPremium: number;
  cpp2OrQpp2Premium: number;
  eiPremium: number;
  qpipPremium: number;
  totalTaxAndPremiums: number;
}

// --- 1. FEDERAL LIMITS DICTIONARY ---

const FEDERAL_LIMITS: Record<
  TaxYear,
  {
    maxBPA: number;
    minBPA: number;
    phaseOutStart: number;
    phaseOutEnd: number;
    maxCEA: number;
  }
> = {
  2025: {
    maxBPA: 16129,
    minBPA: 14538,
    phaseOutStart: 177882,
    phaseOutEnd: 253414,
    maxCEA: 1471,
  },
  2026: {
    maxBPA: 16452,
    minBPA: 14829,
    phaseOutStart: 181440,
    phaseOutEnd: 258482,
    maxCEA: 1501,
  },
};

// --- 2. PROVINCIAL BPA DICTIONARY ---

const PROVINCIAL_BPA: Record<TaxYear, Record<Province, number>> = {
  2025: {
    "Yukon": FEDERAL_LIMITS[2025].maxBPA, // Dynamically maps to Federal
    "Manitoba": 15780,
    "Alberta": 21885,
    "Saskatchewan": 18491,
    "Nunavut": 18788,
    "Quebec": 18638,
    "Northwest Territories": 17373,
    "Prince Edward Island": 13500,
    "New Brunswick": 13054,
    "British Columbia": 12580,
    "Ontario": 12747,
    "Nova Scotia": 11481,
    "Newfoundland and Labrador": 10818,
  },
  2026: {
    "Yukon": FEDERAL_LIMITS[2026].maxBPA,
    "Manitoba": 15780,
    "Alberta": 22769,
    "Saskatchewan": 20381,
    "Nunavut": 19659,
    "Quebec": 18952,
    "Northwest Territories": 18198,
    "Prince Edward Island": 15000,
    "New Brunswick": 13664,
    "British Columbia": 13216,
    "Ontario": 12989,
    "Nova Scotia": 11932,
    "Newfoundland and Labrador": 11188,
  },
};

// --- 3. PAYROLL DEDUCTION LIMITS DICTIONARY ---

const PAYROLL_LIMITS: Record<
  TaxYear,
  {
    ympe: number;
    yampe: number;
    eiMaxEarnings: number;
    qpipMaxEarnings: number;
    qppRate: number;
    eiRateQC: number;
    qpipRate: number;
    eiRate: number;
    cppRate: number;
    cpp2Rate: number;
  }
> = {
  2025: {
    ympe: 71300,
    yampe: 81200,
    eiMaxEarnings: 65700,
    qpipMaxEarnings: 98000,
    qppRate: 0.064,
    eiRateQC: 0.0131,
    qpipRate: 0.00494,
    eiRate: 0.0164,
    cppRate: 0.0595,
    cpp2Rate: 0.04,
  },
  2026: {
    ympe: 74600,
    yampe: 85000,
    eiMaxEarnings: 68900,
    qpipMaxEarnings: 103000,
    qppRate: 0.063,
    eiRateQC: 0.0130,
    qpipRate: 0.00430,
    eiRate: 0.0163,
    cppRate: 0.0595,
    cpp2Rate: 0.04,
  },
};

// --- 4. ONTARIO SPECIFIC LIMITS DICTIONARY ---

const ONTARIO_LIMITS: Record<
  TaxYear,
  { baseOTRAmount: number; surtaxThreshold1: number; surtaxThreshold2: number }
> = {
  2025: { baseOTRAmount: 294, surtaxThreshold1: 5659, surtaxThreshold2: 7243 },
  2026: { baseOTRAmount: 284, surtaxThreshold1: 5818, surtaxThreshold2: 7446 },
};

// --- 5. TAX BRACKETS DICTIONARIES ---

const FEDERAL_BRACKETS: Record<TaxYear, TaxBracket[]> = {
  2025: [
    { rate: 0.145, threshold: 0 },
    { rate: 0.205, threshold: 57375 },
    { rate: 0.26, threshold: 114750 },
    { rate: 0.29, threshold: 177882 },
    { rate: 0.33, threshold: 253414 },
  ],
  2026: [
    { rate: 0.14, threshold: 0 },
    { rate: 0.205, threshold: 58523 },
    { rate: 0.26, threshold: 117045 },
    { rate: 0.29, threshold: 181440 },
    { rate: 0.33, threshold: 258482 },
  ],
};

const PROVINCIAL_BRACKETS: Record<TaxYear, Record<Province, TaxBracket[]>> = {
  2025: {
    "Ontario": [
      { rate: 0.0505, threshold: 0 },
      { rate: 0.0915, threshold: 52886 },
      { rate: 0.1116, threshold: 105775 },
      { rate: 0.1216, threshold: 150000 },
      { rate: 0.1316, threshold: 220000 },
    ],
    "Quebec": [{ rate: 0.14, threshold: 0 }, { rate: 0.19, threshold: 53255 }, {
      rate: 0.24,
      threshold: 106495,
    }, { rate: 0.2575, threshold: 129590 }],
    "British Columbia": [
      { rate: 0.0506, threshold: 0 },
      { rate: 0.077, threshold: 49279 },
      { rate: 0.105, threshold: 98560 },
      { rate: 0.1229, threshold: 113158 },
      { rate: 0.147, threshold: 137407 },
      { rate: 0.168, threshold: 186306 },
      { rate: 0.205, threshold: 259829 },
    ],
    "Alberta": [
      { rate: 0.08, threshold: 0 },
      { rate: 0.10, threshold: 60000 },
      { rate: 0.12, threshold: 151234 },
      { rate: 0.13, threshold: 181481 },
      { rate: 0.14, threshold: 241974 },
      { rate: 0.15, threshold: 362961 },
    ],
    "Manitoba": [{ rate: 0.108, threshold: 0 }, {
      rate: 0.1275,
      threshold: 47564,
    }, { rate: 0.174, threshold: 101200 }],
    "Saskatchewan": [{ rate: 0.105, threshold: 0 }, {
      rate: 0.125,
      threshold: 53463,
    }, { rate: 0.145, threshold: 152750 }],
    "Nova Scotia": [
      { rate: 0.0879, threshold: 0 },
      { rate: 0.1495, threshold: 30507 },
      { rate: 0.1667, threshold: 61015 },
      { rate: 0.175, threshold: 95883 },
      { rate: 0.21, threshold: 154650 },
    ],
    "New Brunswick": [
      { rate: 0.094, threshold: 0 },
      { rate: 0.14, threshold: 51306 },
      { rate: 0.16, threshold: 102614 },
      { rate: 0.195, threshold: 190060 },
    ],
    "Newfoundland and Labrador": [
      { rate: 0.087, threshold: 0 },
      { rate: 0.145, threshold: 44192 },
      { rate: 0.158, threshold: 88382 },
      { rate: 0.178, threshold: 157792 },
      { rate: 0.198, threshold: 220910 },
      { rate: 0.208, threshold: 282214 },
      { rate: 0.213, threshold: 564429 },
      { rate: 0.218, threshold: 1128858 },
    ],
    "Prince Edward Island": [
      { rate: 0.095, threshold: 0 },
      { rate: 0.1347, threshold: 33328 },
      { rate: 0.166, threshold: 64656 },
      { rate: 0.1762, threshold: 105000 },
      { rate: 0.19, threshold: 140000 },
    ],
    "Yukon": [
      { rate: 0.064, threshold: 0 },
      { rate: 0.09, threshold: 57375 },
      { rate: 0.109, threshold: 114750 },
      { rate: 0.128, threshold: 177882 },
      { rate: 0.15, threshold: 500000 },
    ],
    "Northwest Territories": [
      { rate: 0.059, threshold: 0 },
      { rate: 0.086, threshold: 51964 },
      { rate: 0.122, threshold: 103930 },
      { rate: 0.1405, threshold: 168967 },
    ],
    "Nunavut": [
      { rate: 0.04, threshold: 0 },
      { rate: 0.07, threshold: 54707 },
      { rate: 0.09, threshold: 109413 },
      { rate: 0.115, threshold: 177881 },
    ],
  },
  2026: {
    "Ontario": [
      { rate: 0.0505, threshold: 0 },
      { rate: 0.0915, threshold: 53891 },
      { rate: 0.1116, threshold: 107785 },
      { rate: 0.1216, threshold: 150000 },
      { rate: 0.1316, threshold: 220000 },
    ],
    "Quebec": [{ rate: 0.14, threshold: 0 }, { rate: 0.19, threshold: 54345 }, {
      rate: 0.24,
      threshold: 108680,
    }, { rate: 0.2575, threshold: 132245 }],
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
    "Manitoba": [{ rate: 0.108, threshold: 0 }, {
      rate: 0.1275,
      threshold: 47000,
    }, { rate: 0.174, threshold: 100000 }],
    "Saskatchewan": [{ rate: 0.105, threshold: 0 }, {
      rate: 0.125,
      threshold: 54532,
    }, { rate: 0.145, threshold: 155805 }],
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
  },
};

// --- CORE CALCULATION ENGINE ---

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

function getPayrollDeductions(
  income: number,
  province: Province,
  year: TaxYear,
) {
  const limits = PAYROLL_LIMITS[year];
  const basicExemption = 3500;

  let cppOrQpp = 0;
  let cpp2OrQpp2 = 0;
  let ei = 0;
  let qpip = 0;

  if (province === "Quebec") {
    const qppPensionable = Math.max(
      0,
      Math.min(income, limits.ympe) - basicExemption,
    );
    cppOrQpp = qppPensionable * limits.qppRate;

    const qpp2Pensionable = Math.max(
      0,
      Math.min(income, limits.yampe) - limits.ympe,
    );
    cpp2OrQpp2 = qpp2Pensionable * limits.cpp2Rate;

    ei = Math.min(income, limits.eiMaxEarnings) * limits.eiRateQC;
    qpip = Math.min(income, limits.qpipMaxEarnings) * limits.qpipRate;
  } else {
    const cppPensionable = Math.max(
      0,
      Math.min(income, limits.ympe) - basicExemption,
    );
    cppOrQpp = cppPensionable * limits.cppRate;

    const cpp2Pensionable = Math.max(
      0,
      Math.min(income, limits.yampe) - limits.ympe,
    );
    cpp2OrQpp2 = cpp2Pensionable * limits.cpp2Rate;

    ei = Math.min(income, limits.eiMaxEarnings) * limits.eiRate;
  }

  return { cppOrQpp, cpp2OrQpp2, ei, qpip };
}

function getFederalBPA(income: number, year: TaxYear): number {
  const limits = FEDERAL_LIMITS[year];

  if (income <= limits.phaseOutStart) return limits.maxBPA;
  if (income >= limits.phaseOutEnd) return limits.minBPA;

  const phaseOutRatio = (income - limits.phaseOutStart) /
    (limits.phaseOutEnd - limits.phaseOutStart);
  return limits.maxBPA - (phaseOutRatio * (limits.maxBPA - limits.minBPA));
}

function applyOntarioTaxReduction(
  basicTax: number,
  year: TaxYear,
): { reducedTax: number; reductionAmount: number } {
  const limits = ONTARIO_LIMITS[year];

  if (basicTax <= limits.baseOTRAmount) {
    return { reducedTax: basicTax, reductionAmount: 0 };
  }

  const potentialReduction = (limits.baseOTRAmount * 2) - basicTax;
  if (potentialReduction > 0) {
    const reducedTax = Math.max(0, basicTax - potentialReduction);
    return { reducedTax, reductionAmount: basicTax - reducedTax };
  }
  return { reducedTax: basicTax, reductionAmount: 0 };
}

function getOntarioSurtax(
  basicOntarioTax: number,
  year: TaxYear,
): { surtaxAmount: number; marginalMultiplier: number } {
  const limits = ONTARIO_LIMITS[year];

  let surtaxAmount = 0;
  let marginalMultiplier = 1;

  if (basicOntarioTax > limits.surtaxThreshold1) {
    surtaxAmount += 0.20 * (basicOntarioTax - limits.surtaxThreshold1);
    marginalMultiplier += 0.20;
  }

  if (basicOntarioTax > limits.surtaxThreshold2) {
    surtaxAmount += 0.36 * (basicOntarioTax - limits.surtaxThreshold2);
    marginalMultiplier += 0.36;
  }

  return { surtaxAmount, marginalMultiplier };
}

function getOntarioHealthPremium(income: number): number {
  if (income <= 20000) return 0;
  if (income <= 36000) return Math.min(300, (income - 20000) * 0.06);
  if (income <= 48000) return Math.min(450, 300 + (income - 36000) * 0.06);
  if (income <= 72000) return Math.min(600, 450 + (income - 48000) * 0.25);
  if (income <= 200000) return Math.min(900, 600 + (income - 72000) * 0.25);
  return 900;
}

/**
 * Calculates a comprehensive breakdown of Canadian federal and provincial income taxes.
 * Extracts all year-to-year variables dynamically from static configuration dictionaries.
 *
 * @param {number} income - The individual's total gross annual taxable employment income.
 * @param {Province} province - The Canadian province or territory of residence as of Dec 31st.
 * @param {TaxYear} year - The specific tax year for the calculation (e.g., 2025 or 2026).
 * @returns {TaxBreakdown} A fully itemized object containing marginal rates, gross taxes,
 * negative-valued credits, mandatory premiums, and the mathematically sum-verified total.
 */
export function getIncomeTax(
  income: number,
  province: Province,
  year: TaxYear,
): TaxBreakdown {
  // 1. Mandatory Payroll Deductions
  const deductions = getPayrollDeductions(income, province, year);

  // CRITICAL STEP: CPP2/QPP2 is a direct deduction from taxable income.
  const taxableIncome = Math.max(0, income - deductions.cpp2OrQpp2);

  // 2. FEDERAL TAX CALCULATION
  const federalBrackets = FEDERAL_BRACKETS[year];
  const federalResult = calculateTax(taxableIncome, federalBrackets);
  const federalGrossTax = federalResult.amount;

  const federalLimits = FEDERAL_LIMITS[year];
  const federalBpaAmount = getFederalBPA(taxableIncome, year);
  const canadaEmploymentAmount = Math.min(income, federalLimits.maxCEA);
  const federalNRTCBase = federalBpaAmount + deductions.cppOrQpp +
    deductions.ei + deductions.qpip + canadaEmploymentAmount;

  const federalCreditTotal = federalNRTCBase * federalBrackets[0].rate;
  const appliedFederalCredits = Math.min(federalGrossTax, federalCreditTotal);

  let netFederalTax = federalGrossTax - appliedFederalCredits;
  let quebecAbatement = 0;

  if (province === "Quebec") {
    quebecAbatement = netFederalTax * 0.165;
    netFederalTax = Math.max(0, netFederalTax - quebecAbatement);
  }

  // 3. PROVINCIAL TAX CALCULATION
  const provincialBrackets = PROVINCIAL_BRACKETS[year][province];
  const provincialResult = calculateTax(taxableIncome, provincialBrackets);
  const provincialGrossTax = provincialResult.amount;

  let provincialBpaAmount = PROVINCIAL_BPA[year][province];

  // Special handling for Manitoba's high-income BPA phase-out logic
  if (province === "Manitoba" && income > 200000) {
    const phaseOutRatio = (income - 200000) / (400000 - 200000);
    provincialBpaAmount = income >= 400000
      ? 0
      : provincialBpaAmount - (provincialBpaAmount * phaseOutRatio);
  }

  let provincialNRTCBase = provincialBpaAmount + deductions.cppOrQpp +
    deductions.ei;
  if (province === "Quebec") provincialNRTCBase += deductions.qpip;

  const provincialCreditTotal = provincialNRTCBase * provincialBrackets[0].rate;
  const appliedProvincialCredits = Math.min(
    provincialGrossTax,
    provincialCreditTotal,
  );

  let netProvincialTax = provincialGrossTax - appliedProvincialCredits;
  let provincialMarginalRate = provincialResult.marginalRate;

  let ontarioTaxReduction = 0;
  let provincialSurtaxAmount = 0;
  let healthPremium = 0;

  // 4. ONTARIO SPECIFIC MODIFIERS
  if (province === "Ontario") {
    const otrResult = applyOntarioTaxReduction(netProvincialTax, year);
    netProvincialTax = otrResult.reducedTax;
    ontarioTaxReduction = otrResult.reductionAmount;

    if (netProvincialTax > 0) {
      const { surtaxAmount, marginalMultiplier } = getOntarioSurtax(
        netProvincialTax,
        year,
      );
      provincialSurtaxAmount = surtaxAmount;
      provincialMarginalRate *= marginalMultiplier;
    }

    healthPremium = getOntarioHealthPremium(income);
  }

  // 5. ROUNDING AND SUMMATION
  const roundedFedGross = Math.round(federalGrossTax);
  const roundedFedCredits = -Math.round(appliedFederalCredits);
  const roundedQcAbatment = -Math.round(quebecAbatement);

  const roundedProvGross = Math.round(provincialGrossTax);
  const roundedProvCredits = -Math.round(appliedProvincialCredits);
  const roundedOnTaxRed = -Math.round(ontarioTaxReduction);
  const roundedProvSurtax = Math.round(provincialSurtaxAmount);

  const roundedHealthPrem = Math.round(healthPremium);
  const roundedCpp = Math.round(deductions.cppOrQpp);
  const roundedCpp2 = Math.round(deductions.cpp2OrQpp2);
  const roundedEi = Math.round(deductions.ei);
  const roundedQpip = Math.round(deductions.qpip);

  const totalSum = roundedFedGross +
    roundedFedCredits +
    roundedQcAbatment +
    roundedProvGross +
    roundedProvCredits +
    roundedOnTaxRed +
    roundedProvSurtax +
    roundedHealthPrem +
    roundedCpp +
    roundedCpp2 +
    roundedEi +
    roundedQpip;

  return {
    federalRate: federalResult.marginalRate,
    provincialRate: provincialMarginalRate,
    grossFederalTax: roundedFedGross,
    appliedFederalCredits: roundedFedCredits,
    quebecAbatement: roundedQcAbatment,
    grossProvincialTax: roundedProvGross,
    appliedProvincialCredits: roundedProvCredits,
    ontarioTaxReduction: roundedOnTaxRed,
    provincialSurtax: roundedProvSurtax,
    healthPremium: roundedHealthPrem,
    cppOrQppPremium: roundedCpp,
    cpp2OrQpp2Premium: roundedCpp2,
    eiPremium: roundedEi,
    qpipPremium: roundedQpip,
    totalTaxAndPremiums: totalSum,
  };
}
