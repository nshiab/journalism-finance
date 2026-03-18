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

export interface TaxBreakdown {
  // Rates
  federalRate: number;
  provincialRate: number;

  // Dollar Amounts (Can be directly summed)
  grossFederalTax: number;
  appliedFederalCredits: number; // Negative
  quebecAbatement: number; // Negative
  grossProvincialTax: number;
  appliedProvincialCredits: number; // Negative
  ontarioTaxReduction: number; // Negative
  provincialSurtax: number;
  healthPremium: number;

  // Payroll Premiums
  cppOrQppPremium: number;
  cpp2OrQpp2Premium: number; // NEW: The second additional tier
  eiPremium: number;
  qpipPremium: number;

  // Final Sum
  totalTaxAndPremiums: number;
}

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

function getPayrollDeductions(income: number, province: Province) {
  const basicExemption = 3500;

  // Official 2026 Thresholds
  const ympe = 74600; // First Ceiling
  const yampe = 85000; // Second Ceiling (CPP2/QPP2)
  const eiMaxEarnings = 68900;
  const qpipMaxEarnings = 103000;

  let cppOrQpp = 0;
  let cpp2OrQpp2 = 0;
  let ei = 0;
  let qpip = 0;

  if (province === "Quebec") {
    // 2026 QPP
    const qppPensionable = Math.max(0, Math.min(income, ympe) - basicExemption);
    cppOrQpp = qppPensionable * 0.063; // Reduced to 6.30% in 2026

    // 2026 QPP2
    const qpp2Pensionable = Math.max(0, Math.min(income, yampe) - ympe);
    cpp2OrQpp2 = qpp2Pensionable * 0.04;

    // 2026 Quebec EI
    ei = Math.min(income, eiMaxEarnings) * 0.0130;

    // 2026 QPIP
    qpip = Math.min(income, qpipMaxEarnings) * 0.00430;
  } else {
    // 2026 Standard CPP
    const cppPensionable = Math.max(0, Math.min(income, ympe) - basicExemption);
    cppOrQpp = cppPensionable * 0.0595;

    // 2026 Standard CPP2
    const cpp2Pensionable = Math.max(0, Math.min(income, yampe) - ympe);
    cpp2OrQpp2 = cpp2Pensionable * 0.04;

    // 2026 Standard EI
    ei = Math.min(income, eiMaxEarnings) * 0.0163;
  }

  return { cppOrQpp, cpp2OrQpp2, ei, qpip };
}

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

function applyOntarioTaxReduction(
  basicTax: number,
): { reducedTax: number; reductionAmount: number } {
  const baseOTRAmount = 284;
  if (basicTax <= baseOTRAmount) {
    return { reducedTax: basicTax, reductionAmount: 0 };
  }

  const potentialReduction = (baseOTRAmount * 2) - basicTax;
  if (potentialReduction > 0) {
    const reducedTax = Math.max(0, basicTax - potentialReduction);
    return { reducedTax, reductionAmount: basicTax - reducedTax };
  }
  return { reducedTax: basicTax, reductionAmount: 0 };
}

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
 * Calculates a comprehensive breakdown of 2026 Canadian federal and provincial income taxes,
 * including mandatory payroll deductions (CPP/QPP, CPP2/QPP2, EI, QPIP) and provincial
 * premiums/surtaxes.
 * * This function models the exact mechanics of the Canadian tax system:
 * 1. Second-tier pension contributions (CPP2/QPP2) are applied as a direct deduction
 * against taxable income *before* brackets are calculated.
 * 2. Base pension contributions (CPP/QPP), EI premiums, and the Basic Personal Amount (BPA)
 * generate Non-Refundable Tax Credits (NRTCs), which reduce the gross tax owing.
 * * **Important Structural Note:** * To guarantee 100% mathematical transparency without hidden net calculations, all tax
 * credits, abatements, and reductions in the returned `TaxBreakdown` object are output
 * as **negative numbers**. This ensures that summing every dollar-based property
 * (excluding rates) perfectly equals the final `totalTaxAndPremiums` value.
 *
 * @param {number} income - The individual's total gross annual taxable employment income.
 * @param {Province} province - The Canadian province or territory of residence as of Dec 31st.
 * @returns {TaxBreakdown} A fully itemized object containing marginal rates, gross taxes,
 * negative-valued credits, mandatory premiums, and the mathematically sum-verified total.
 *
 * @example
 * // Calculate taxes for an individual earning $90,000 in Ontario
 * const taxData = getIncomeTax(90000, "Ontario");
 * * console.log(`Total Deductions: $${taxData.totalTaxAndPremiums}`);
 * * // Because credits and reductions are negative, summing the properties mathematically balances:
 * const verificationSum =
 * taxData.grossFederalTax +
 * taxData.appliedFederalCredits +
 * taxData.quebecAbatement +
 * taxData.grossProvincialTax +
 * taxData.appliedProvincialCredits +
 * taxData.ontarioTaxReduction +
 * taxData.provincialSurtax +
 * taxData.healthPremium +
 * taxData.cppOrQppPremium +
 * taxData.cpp2OrQpp2Premium +
 * taxData.eiPremium +
 * taxData.qpipPremium;
 * * console.assert(verificationSum === taxData.totalTaxAndPremiums); // Evaluates to true
 */
export function getIncomeTax(
  income: number,
  province: Province,
): TaxBreakdown {
  // 1. Mandatory Payroll Deductions
  const deductions = getPayrollDeductions(income, province);

  // CRITICAL STEP: CPP2/QPP2 is a direct deduction from taxable income, not a credit.
  const taxableIncome = Math.max(0, income - deductions.cpp2OrQpp2);

  // 2. FEDERAL TAX CALCULATION
  const federalResult = calculateTax(taxableIncome, FEDERAL_BRACKETS);
  const federalGrossTax = federalResult.amount;

  const federalBpaAmount = getFederalBPA(taxableIncome);
  const canadaEmploymentAmount = Math.min(income, 1462); // 2026 indexed CEA
  const federalNRTCBase = federalBpaAmount + deductions.cppOrQpp +
    deductions.ei + deductions.qpip + canadaEmploymentAmount;

  const federalCreditTotal = federalNRTCBase * FEDERAL_BRACKETS[0].rate;
  const appliedFederalCredits = Math.min(federalGrossTax, federalCreditTotal);

  let netFederalTax = federalGrossTax - appliedFederalCredits;
  let quebecAbatement = 0;

  if (province === "Quebec") {
    quebecAbatement = netFederalTax * 0.165;
    netFederalTax = Math.max(0, netFederalTax - quebecAbatement);
  }

  // 3. PROVINCIAL TAX CALCULATION
  const provincialBrackets = PROVINCIAL_BRACKETS[province];
  const provincialResult = calculateTax(taxableIncome, provincialBrackets);
  const provincialGrossTax = provincialResult.amount;

  const provincialBpaAmount = getProvincialBPA(taxableIncome, province);
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
    const otrResult = applyOntarioTaxReduction(netProvincialTax);
    netProvincialTax = otrResult.reducedTax;
    ontarioTaxReduction = otrResult.reductionAmount;

    if (netProvincialTax > 0) {
      const { surtaxAmount, marginalMultiplier } = getOntarioSurtax(
        netProvincialTax,
      );
      provincialSurtaxAmount = surtaxAmount;
      provincialMarginalRate *= marginalMultiplier;
    }

    healthPremium = getOntarioHealthPremium(income); // OHP is based on Gross Income, not taxable.
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
