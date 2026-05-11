import { assertEquals } from "jsr:@std/assert";
import mortgageMaxAmount from "../../src/finance/mortgageMaxAmount.ts";

// Tested against https://itools-ioutils.fcac-acfc.gc.ca/MQ-HQ/MQCalc-EAPHCalc-eng.aspx

Deno.test("should return a purchase price of $0k with an income of $0k, down payment of $0k, and a rate of 5.25%", () => {
  const results = mortgageMaxAmount(0, 0, 5.25);
  assertEquals(results, {
    annualIncome: 0,
    downPayment: 0,
    rate: 5.25,
    rateTested: 7.25,
    purchasePrice: 0,
    mortgageAmount: 0,
    insurancePremium: 0,
    monthlyMortgagePayment: 0,
    grossDebtServiceRatio: 0,
    totalDebtServiceRatio: 0,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 0,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $25k with an income of $0k, down payment of $25k, and a rate of 5.25%", () => {
  const results = mortgageMaxAmount(0, 25_000, 5.25);
  assertEquals(results, {
    annualIncome: 0,
    downPayment: 25000,
    rate: 5.25,
    rateTested: 7.25,
    purchasePrice: 25000,
    mortgageAmount: 0,
    insurancePremium: 0,
    monthlyMortgagePayment: 0,
    grossDebtServiceRatio: 0,
    totalDebtServiceRatio: 0,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 31,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $39k with an income of $10k, down payment of $25k, and a rate of 5.25%", () => {
  const results = mortgageMaxAmount(10_000, 25_000, 5.25);
  assertEquals(results, {
    annualIncome: 10000,
    downPayment: 25000,
    rate: 5.25,
    rateTested: 7.25,
    purchasePrice: 39000,
    mortgageAmount: 14000,
    insurancePremium: 0,
    monthlyMortgagePayment: 100,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 50,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $189k with an income of $50k, down payment of $25k, and a rate of 5.25%", () => {
  const results = mortgageMaxAmount(50_000, 25_000, 5.25);
  assertEquals(results, {
    annualIncome: 50000,
    downPayment: 25000,
    rate: 5.25,
    rateTested: 7.25,
    purchasePrice: 189000,
    mortgageAmount: 169084,
    insurancePremium: 5084,
    monthlyMortgagePayment: 1211,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 238,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $0k with an income of $100k, down payment of $0k, and a rate of 5.25%", () => {
  const results = mortgageMaxAmount(100_000, 0, 5.25);
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 0,
    rate: 5.25,
    rateTested: 7.25,
    purchasePrice: 0,
    mortgageAmount: 0,
    insurancePremium: 0,
    monthlyMortgagePayment: 0,
    grossDebtServiceRatio: 0.02,
    totalDebtServiceRatio: 0.02,
    reason: "downPayment limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 0,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $0k with an income of $100k, down payment of $5k, and a rate of 5.25%", () => {
  const results = mortgageMaxAmount(100_000, 5_000, 5.25);
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 5000,
    rate: 5.25,
    rateTested: 7.25,
    purchasePrice: 100000,
    mortgageAmount: 98800,
    insurancePremium: 3800,
    monthlyMortgagePayment: 707,
    grossDebtServiceRatio: 0.12,
    totalDebtServiceRatio: 0.12,
    reason: "downPayment limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 125,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $375k with an income of $100k, down payment of $25k, and a rate of 5.25%", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5.25);
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5.25,
    rateTested: 7.25,
    purchasePrice: 375000,
    mortgageAmount: 364000,
    insurancePremium: 14000,
    monthlyMortgagePayment: 2606,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 470,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $399k with an income of $100k, down payment of $50k, and a rate of 5.25%", () => {
  const results = mortgageMaxAmount(100_000, 50_000, 5.25);
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 50000,
    rate: 5.25,
    rateTested: 7.25,
    purchasePrice: 399000,
    mortgageAmount: 359819,
    insurancePremium: 10819,
    monthlyMortgagePayment: 2576,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 500,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $421k with an income of $100k, down payment of $75k, and a rate of 5.25%", () => {
  const results = mortgageMaxAmount(100_000, 75_000, 5.25);
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 75000,
    rate: 5.25,
    rateTested: 7.25,
    purchasePrice: 421000,
    mortgageAmount: 355688,
    insurancePremium: 9688,
    monthlyMortgagePayment: 2546,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 528,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $450k with an income of $100k, down payment of $100k, and a rate of 5.25%", () => {
  const results = mortgageMaxAmount(100_000, 100_000, 5.25);
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 100000,
    rate: 5.25,
    rateTested: 7.25,
    purchasePrice: 450000,
    mortgageAmount: 350000,
    insurancePremium: 0,
    monthlyMortgagePayment: 2506,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 564,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $433k with an income of $100k, down payment of $25k, and a rate of 1.00%", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 1);
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 1,
    rateTested: 5.25,
    purchasePrice: 433000,
    mortgageAmount: 424320,
    insurancePremium: 16320,
    monthlyMortgagePayment: 2529,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 543,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $433k with an income of $100k, down payment of $25k, and a rate of 3.00%", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 3);
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 3,
    rateTested: 5.25,
    purchasePrice: 433000,
    mortgageAmount: 424320,
    insurancePremium: 16320,
    monthlyMortgagePayment: 2529,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 543,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $410k with an income of $100k, down payment of $25k, and a rate of 4.00%", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 4);
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 4,
    rateTested: 6,
    purchasePrice: 410000,
    mortgageAmount: 400400,
    insurancePremium: 15400,
    monthlyMortgagePayment: 2562,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 514,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $381k with an income of $100k, down payment of $25k, and a rate of 5.00%", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5);
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 381000,
    mortgageAmount: 370240,
    insurancePremium: 14240,
    monthlyMortgagePayment: 2593,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 478,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $333k with an income of $100k, down payment of $25k, and a rate of 7.00%", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 7);
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 7,
    rateTested: 9,
    purchasePrice: 333000,
    mortgageAmount: 320320,
    insurancePremium: 12320,
    monthlyMortgagePayment: 2652,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 418,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $279k with an income of $100k, down payment of $25k, and a rate of 10.00%", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 10);
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 10,
    rateTested: 12,
    purchasePrice: 279000,
    mortgageAmount: 264160,
    insurancePremium: 10160,
    monthlyMortgagePayment: 2726,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 350,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $381k with an income of $100k, down payment of $25k, a rate of 5.00%, and monthly debt payment of $0.", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5, {
    monthlyDebtPayment: 0,
  });
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 381000,
    mortgageAmount: 370240,
    insurancePremium: 14240,
    monthlyMortgagePayment: 2593,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 478,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $381k with an income of $100k, down payment of $25k, a rate of 5.00%, and monthly debt payment of $50.", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5, {
    monthlyDebtPayment: 50,
  });
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 381000,
    mortgageAmount: 370240,
    insurancePremium: 14240,
    monthlyMortgagePayment: 2593,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.4,
    reason: "debt limit",
    monthlyDebtPayment: 50,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 478,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $381k with an income of $100k, down payment of $25k, a rate of 5.00%, and monthly debt payment of $100.", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5, {
    monthlyDebtPayment: 100,
  });
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 381000,
    mortgageAmount: 370240,
    insurancePremium: 14240,
    monthlyMortgagePayment: 2593,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.4,
    reason: "debt limit",
    monthlyDebtPayment: 100,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 478,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $381k with an income of $100k, down payment of $25k, a rate of 5.00%, and monthly debt payment of $250.", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5, {
    monthlyDebtPayment: 250,
  });
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 381000,
    mortgageAmount: 370240,
    insurancePremium: 14240,
    monthlyMortgagePayment: 2593,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.42,
    reason: "debt limit",
    monthlyDebtPayment: 250,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 478,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $371k with an income of $100k, down payment of $25k, a rate of 5.00%, and monthly debt payment of $500.", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5, {
    monthlyDebtPayment: 500,
  });
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 371000,
    mortgageAmount: 359840,
    insurancePremium: 13840,
    monthlyMortgagePayment: 2520,
    grossDebtServiceRatio: 0.38,
    totalDebtServiceRatio: 0.44,
    reason: "debt limit",
    monthlyDebtPayment: 500,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 465,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $342k with an income of $100k, down payment of $25k, a rate of 5.00%, and monthly debt payment of $750.", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5, {
    monthlyDebtPayment: 750,
  });
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 342000,
    mortgageAmount: 329680,
    insurancePremium: 12680,
    monthlyMortgagePayment: 2309,
    grossDebtServiceRatio: 0.35,
    totalDebtServiceRatio: 0.44,
    reason: "debt limit",
    monthlyDebtPayment: 750,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 429,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $333k with an income of $100k, down payment of $25k, a rate of 5.00%, and monthly heating cost of $1.", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5, {
    monthlyHeating: 1,
  });
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 402000,
    mortgageAmount: 392080,
    insurancePremium: 15080,
    monthlyMortgagePayment: 2746,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 1,
    isHeatingEstimate: false,
    monthlyTax: 504,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $322k with an income of $100k, down payment of $25k, a rate of 5.00%, and monthly heating cost of $100.", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5, {
    monthlyHeating: 100,
  });
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 390000,
    mortgageAmount: 379600,
    insurancePremium: 14600,
    monthlyMortgagePayment: 2659,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 100,
    isHeatingEstimate: false,
    monthlyTax: 489,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $304k with an income of $100k, down payment of $25k, a rate of 5.00%, and monthly heating cost of $250.", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5, {
    monthlyHeating: 250,
  });
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 372000,
    mortgageAmount: 360880,
    insurancePremium: 13880,
    monthlyMortgagePayment: 2528,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 250,
    isHeatingEstimate: false,
    monthlyTax: 466,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $304k with an income of $100k, down payment of $25k, a rate of 5.00%, and monthly heating cost of $500.", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5, {
    monthlyHeating: 500,
  });
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 343000,
    mortgageAmount: 330720,
    insurancePremium: 12720,
    monthlyMortgagePayment: 2316,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 500,
    isHeatingEstimate: false,
    monthlyTax: 430,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $366k with an income of $100k, down payment of $25k, a rate of 5.00%, and monthly tax cost of $1.", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5, {
    monthlyTax: 1,
  });
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 447000,
    mortgageAmount: 438880,
    insurancePremium: 16880,
    monthlyMortgagePayment: 3074,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 1,
    isTaxEstimate: false,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $298k with an income of $100k, down payment of $25k, a rate of 5.00%, and monthly tax cost of $500.", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5, {
    monthlyTax: 500,
  });
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 378000,
    mortgageAmount: 367120,
    insurancePremium: 14120,
    monthlyMortgagePayment: 2571,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 500,
    isTaxEstimate: false,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $309k with an income of $100k, down payment of $25k, a rate of 5.00%, and monthly tax cost of $1k.", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5, {
    monthlyTax: 1000,
  });
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 309000,
    mortgageAmount: 295360,
    insurancePremium: 11360,
    monthlyMortgagePayment: 2069,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 1000,
    isTaxEstimate: false,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $381k with an income of $100k, down payment of $25k, a rate of 5.00%, and monthly condo fees of $0.", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5, {
    monthlyCondoFees: 0,
  });
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 381000,
    mortgageAmount: 370240,
    insurancePremium: 14240,
    monthlyMortgagePayment: 2593,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 478,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $369k with an income of $100k, down payment of $25k, a rate of 5.00%, and monthly condo fees of $100.", () => {
  const results = mortgageMaxAmount(100_000, 25_000, 5, {
    monthlyCondoFees: 100,
  });
  assertEquals(results, {
    annualIncome: 100000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 369000,
    mortgageAmount: 357760,
    insurancePremium: 13760,
    monthlyMortgagePayment: 2506,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 463,
    isTaxEstimate: true,
    monthlyCondoFees: 100,
  });
});
Deno.test("should return a purchase price of $500k with an income of $200k, down payment of $25k, a rate of 5.00%, and monthly condo fees of $100.", () => {
  const results = mortgageMaxAmount(200_000, 25_000, 5, {
    monthlyCondoFees: 100,
  });
  assertEquals(results, {
    annualIncome: 200000,
    downPayment: 25000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 500000,
    mortgageAmount: 494000,
    insurancePremium: 19000,
    monthlyMortgagePayment: 3460,
    grossDebtServiceRatio: 0.26,
    totalDebtServiceRatio: 0.26,
    reason: "downPayment limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 625,
    isTaxEstimate: true,
    monthlyCondoFees: 100,
  });
});
Deno.test("should return a purchase price of $600k with an income of $250k, down payment of $35k, a rate of 5.00%, and monthly condo fees of $100.", () => {
  const results = mortgageMaxAmount(250_000, 35_000, 5, {
    monthlyCondoFees: 100,
  });
  assertEquals(results, {
    annualIncome: 250000,
    downPayment: 35000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 600000,
    mortgageAmount: 587600,
    insurancePremium: 22600,
    monthlyMortgagePayment: 4116,
    grossDebtServiceRatio: 0.25,
    totalDebtServiceRatio: 0.25,
    reason: "downPayment limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 750,
    isTaxEstimate: true,
    monthlyCondoFees: 100,
  });
});
Deno.test("should return a purchase price of $750k with an income of $250k, down payment of $50k, a rate of 5.00%, and monthly condo fees of $100.", () => {
  const results = mortgageMaxAmount(250_000, 50_000, 5, {
    monthlyCondoFees: 100,
  });
  assertEquals(results, {
    annualIncome: 250000,
    downPayment: 50000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 750000,
    mortgageAmount: 728000,
    insurancePremium: 28000,
    monthlyMortgagePayment: 5099,
    grossDebtServiceRatio: 0.3,
    totalDebtServiceRatio: 0.3,
    reason: "downPayment limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 938,
    isTaxEstimate: true,
    monthlyCondoFees: 100,
  });
});
Deno.test("should return a purchase price of $983k with an income of $250k, down payment of $75k, a rate of 5.00%, and monthly condo fees of $100.", () => {
  const results = mortgageMaxAmount(250_000, 75_000, 5, {
    monthlyCondoFees: 100,
  });
  assertEquals(results, {
    annualIncome: 250000,
    downPayment: 75000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 983000,
    mortgageAmount: 944320,
    insurancePremium: 36320,
    monthlyMortgagePayment: 6614,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 1230,
    isTaxEstimate: true,
    monthlyCondoFees: 100,
  });
});
Deno.test("should return a purchase price of $1.25m with an income of $500k, down payment of $100k, and a rate of 5.00%", () => {
  const results = mortgageMaxAmount(500_000, 100_000, 5);
  assertEquals(results, {
    annualIncome: 500000,
    downPayment: 100000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 1250000,
    mortgageAmount: 1196000,
    insurancePremium: 46000,
    monthlyMortgagePayment: 8377,
    grossDebtServiceRatio: 0.24,
    totalDebtServiceRatio: 0.24,
    reason: "downPayment limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 1563,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $1,499,001 with an income of $500k, down payment of $200,001, and a rate of 5.00%", () => {
  const results = mortgageMaxAmount(500_000, 200_001, 5);
  assertEquals(results, {
    annualIncome: 500000,
    downPayment: 200001,
    rate: 5,
    rateTested: 7,
    purchasePrice: 1499001,
    mortgageAmount: 1339269,
    insurancePremium: 40269,
    monthlyMortgagePayment: 9380,
    grossDebtServiceRatio: 0.27,
    totalDebtServiceRatio: 0.27,
    reason: "downPayment limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 1874,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
Deno.test("should return a purchase price of $2,442,000 with an income of $500k, down payment of $1,000,000, and a rate of 5.00%", () => {
  const results = mortgageMaxAmount(500_000, 1_000_000, 5);
  assertEquals(results, {
    annualIncome: 500000,
    downPayment: 1000000,
    rate: 5,
    rateTested: 7,
    purchasePrice: 2796000,
    mortgageAmount: 1796000,
    insurancePremium: 0,
    monthlyMortgagePayment: 12579,
    grossDebtServiceRatio: 0.39,
    totalDebtServiceRatio: 0.39,
    reason: "debt limit",
    monthlyDebtPayment: 0,
    monthlyHeating: 175,
    isHeatingEstimate: true,
    monthlyTax: 3496,
    isTaxEstimate: true,
    monthlyCondoFees: 0,
  });
});
