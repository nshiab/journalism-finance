import { assert, assertEquals } from "jsr:@std/assert";
import simulateRentVsBuy from "../../src/finance/simulateRentVsBuy.ts";
import getParams from "./helpers/getParamsRentVsBuy.ts";
import { round } from "@nshiab/journalism-format";

const numberOfYears = 25;

Deno.test("documentation example: simulateRentVsBuy should run without errors", () => {
  const rates = {
    marketReturnRate: new Array(120).fill(0.005), // 0.5% monthly
    rentIncrease: new Array(120).fill(0.002),
    ownerInsuranceIncrease: new Array(120).fill(0.002),
    renterInsuranceIncrease: new Array(120).fill(0.002),
    maintenanceIncrease: new Array(120).fill(0.002),
    propertyTaxIncrease: new Array(120).fill(0.002),
    condoFeeIncrease: new Array(120).fill(0.002),
    fiveYearInterestRates: new Array(120).fill(0.05),
    fourYearInterestRates: new Array(120).fill(0.05),
    threeYearInterestRates: new Array(120).fill(0.05),
    twoYearInterestRates: new Array(120).fill(0.05),
    oneYearInterestRates: new Array(120).fill(0.05),
    variableInterestRates: new Array(120).fill(0.06),
    appreciationIncrease: new Array(120).fill(0.003),
    sellingFixedFeesIncrease: new Array(120).fill(0.002),
  };

  const results = simulateRentVsBuy({
    startingYear: 2024,
    numberOfYears: 10,
    tfsaContributions: true,
    employmentIncome: 75_000,
    province: "Ontario",
    renter: {
      startingMonthlyRent: 2000,
      securityDeposit: 2000,
      startingMonthlyInsurance: 30,
    },
    buyer: {
      downPayment: 100000,
      purchasePrice: 500000,
      fixedRateAdjustment: -1.5,
      variableRateAdjustment: -0.5,
      purchaseFixedFees: 5000,
      startingAnnualMaintenanceCost: 2000,
      startingAnnualPropertyTax: 3000,
      startingMonthlyCondoFees: 300,
      startingMonthlyInsurance: 100,
      sellingFixedFees: 2000,
      sellingCommissionRate: 0.05,
      floorRate: 0,
    },
    rates,
  }, { finalBalanceOnly: true });

  assert(results.length > 0);
});

Deno.test("simulateRentVsBuy: should apply floor rate to mortgage interest", () => {
  const rates = {
    marketReturnRate: new Array(60).fill(0.005),
    rentIncrease: new Array(60).fill(0.002),
    ownerInsuranceIncrease: new Array(60).fill(0.002),
    renterInsuranceIncrease: new Array(60).fill(0.002),
    maintenanceIncrease: new Array(60).fill(0.002),
    propertyTaxIncrease: new Array(60).fill(0.002),
    condoFeeIncrease: new Array(60).fill(0.002),
    fiveYearInterestRates: new Array(60).fill(0.005), // 0.5%
    fourYearInterestRates: new Array(60).fill(0.005),
    threeYearInterestRates: new Array(60).fill(0.005),
    twoYearInterestRates: new Array(60).fill(0.005),
    oneYearInterestRates: new Array(60).fill(0.005),
    variableInterestRates: new Array(60).fill(0.005),
    appreciationIncrease: new Array(60).fill(0.003),
    sellingFixedFeesIncrease: new Array(60).fill(0.002),
  };

  const floorRate = 0.01; // 1%

  const results = simulateRentVsBuy({
    startingYear: 2024,
    numberOfYears: 5,
    tfsaContributions: true,
    employmentIncome: 75_000,
    province: "Ontario",
    renter: {
      startingMonthlyRent: 2000,
      securityDeposit: 2000,
      startingMonthlyInsurance: 30,
    },
    buyer: {
      downPayment: 100000,
      purchasePrice: 500000,
      fixedRateAdjustment: -1.0, // This would normally bring 0.005 to -0.995
      variableRateAdjustment: -1.0,
      purchaseFixedFees: 5000,
      startingAnnualMaintenanceCost: 2000,
      startingAnnualPropertyTax: 3000,
      startingMonthlyCondoFees: 300,
      startingMonthlyInsurance: 100,
      sellingFixedFees: 2000,
      sellingCommissionRate: 0.05,
      floorRate,
    },
    rates,
  });

  // Filter to find effective interest rates for fixed and variable scenarios
  const effectiveRates = results
    // @ts-ignore: testing internal property
    .filter((d) =>
      d.variable === "mortgageCapital" ||
      (d as any).variable === "mortgageInterest"
    )
    .map((d) => (d as any).effectiveInterestRate)
    .filter((rate) => rate !== undefined);

  assert(effectiveRates.length > 0);
  effectiveRates.forEach((rate) => {
    assertEquals(rate, floorRate);
  });
});

Deno.test("should compute the total expenses and savings of a renter and buyer in Montreal", async (t) => {
  const params = getParams("Montreal", "Quebec", {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  });
  // Just because we want to test it.
  params.renter.securityDeposit = params.renter.startingMonthlyRent;

  console.log(params);

  //   const results = simulateRentVsBuy(params);

  //   const mortgageRatesFixedBuyer = results.filter((d) =>
  //     [2000, 2005, 2010, 2015, 2020].includes(d.year) && d.month === 0 &&
  //     d.variable.includes("mortgage") && d.group === "monthlyExpenses" &&
  //     d.category === "buyerFixed"
  //   ).map((d) => ({
  //     ...d,
  //     date: d.date.toISOString(),
  //   }));

  //   await t.step("mortgage rates fixed buyer", async () => {
  //     assertEquals(mortgageRatesFixedBuyer, [
  //       {
  //         year: 2000,
  //         month: 0,
  //         monthIndex: 0,
  //         date: "2000-01-01T00:00:00.000Z",
  //         amount: 114.19,
  //         category: "buyerFixed",
  //         group: "monthlyExpenses",
  //         variable: "mortgageCapital",
  //         effectiveInterestRate: 0.0725,
  //         postedInterestRate: 0.0825,
  //         fixedRateAdjustment: -0.01,
  //         variableRateAdjustment: 0,
  //       },
  //       {
  //         year: 2000,
  //         month: 0,
  //         monthIndex: 0,
  //         date: "2000-01-01T00:00:00.000Z",
  //         amount: 563.22,
  //         category: "buyerFixed",
  //         group: "monthlyExpenses",
  //         variable: "mortgageInterests",
  //         effectiveInterestRate: 0.0725,
  //         postedInterestRate: 0.0825,
  //         fixedRateAdjustment: -0.01,
  //         variableRateAdjustment: 0,
  //       },
  //       {
  //         year: 2005,
  //         month: 0,
  //         monthIndex: 60,
  //         date: "2005-01-01T00:00:00.000Z",
  //         amount: 210.3,
  //         category: "buyerFixed",
  //         group: "monthlyExpenses",
  //         variable: "mortgageCapital",
  //         effectiveInterestRate: 0.0505,
  //         postedInterestRate: 0.0605,
  //         fixedRateAdjustment: -0.01,
  //         variableRateAdjustment: 0,
  //       },
  //       {
  //         year: 2005,
  //         month: 0,
  //         monthIndex: 60,
  //         date: "2005-01-01T00:00:00.000Z",
  //         amount: 359.9,
  //         category: "buyerFixed",
  //         group: "monthlyExpenses",
  //         variable: "mortgageInterests",
  //         effectiveInterestRate: 0.0505,
  //         postedInterestRate: 0.0605,
  //         fixedRateAdjustment: -0.01,
  //         variableRateAdjustment: 0,
  //       },
  //       {
  //         year: 2010,
  //         month: 0,
  //         monthIndex: 120,
  //         date: "2010-01-01T00:00:00.000Z",
  //         amount: 282.44,
  //         category: "buyerFixed",
  //         group: "monthlyExpenses",
  //         variable: "mortgageCapital",
  //         effectiveInterestRate: 0.0449,
  //         postedInterestRate: 0.0549,
  //         fixedRateAdjustment: -0.01,
  //         variableRateAdjustment: 0,
  //       },
  //       {
  //         year: 2010,
  //         month: 0,
  //         monthIndex: 120,
  //         date: "2010-01-01T00:00:00.000Z",
  //         amount: 267.34,
  //         category: "buyerFixed",
  //         group: "monthlyExpenses",
  //         variable: "mortgageInterests",
  //         effectiveInterestRate: 0.0449,
  //         postedInterestRate: 0.0549,
  //         fixedRateAdjustment: -0.01,
  //         variableRateAdjustment: 0,
  //       },
  //       {
  //         year: 2015,
  //         month: 0,
  //         monthIndex: 180,
  //         date: "2015-01-01T00:00:00.000Z",
  //         amount: 365.71,
  //         category: "buyerFixed",
  //         group: "monthlyExpenses",
  //         variable: "mortgageCapital",
  //         effectiveInterestRate: 0.0379,
  //         postedInterestRate: 0.0479,
  //         fixedRateAdjustment: -0.01,
  //         variableRateAdjustment: 0,
  //       },
  //       {
  //         year: 2015,
  //         month: 0,
  //         monthIndex: 180,
  //         date: "2015-01-01T00:00:00.000Z",
  //         amount: 166.63,
  //         category: "buyerFixed",
  //         group: "monthlyExpenses",
  //         variable: "mortgageInterests",
  //         effectiveInterestRate: 0.0379,
  //         postedInterestRate: 0.0479,
  //         fixedRateAdjustment: -0.01,
  //         variableRateAdjustment: 0,
  //       },
  //       {
  //         year: 2020,
  //         month: 0,
  //         monthIndex: 240,
  //         date: "2020-01-01T00:00:00.000Z",
  //         amount: 436.85,
  //         category: "buyerFixed",
  //         group: "monthlyExpenses",
  //         variable: "mortgageCapital",
  //         effectiveInterestRate: 0.0419,
  //         postedInterestRate: 0.0519,
  //         fixedRateAdjustment: -0.01,
  //         variableRateAdjustment: 0,
  //       },
  //       {
  //         year: 2020,
  //         month: 0,
  //         monthIndex: 240,
  //         date: "2020-01-01T00:00:00.000Z",
  //         amount: 100.65,
  //         category: "buyerFixed",
  //         group: "monthlyExpenses",
  //         variable: "mortgageInterests",
  //         effectiveInterestRate: 0.0419,
  //         postedInterestRate: 0.0519,
  //         fixedRateAdjustment: -0.01,
  //         variableRateAdjustment: 0,
  //       },
  //     ]);
  //   });

  //   const mortgageRatesVariableBuyer = results.filter((d) =>
  //     [2000, 2005, 2010, 2015, 2020].includes(d.year) && d.month === 0 &&
  //     d.variable.includes("mortgage") && d.group === "monthlyExpenses" &&
  //     d.category === "buyerVariable"
  //   ).map((d) => ({
  //     ...d,
  //     date: d.date.toISOString(),
  //   }));

  //   await t.step("mortgage rates variable buyer", async () => {
  //     assertEquals(mortgageRatesVariableBuyer, [
  //       {
  //         year: 2000,
  //         month: 0,
  //         monthIndex: 0,
  //         date: "2000-01-01T00:00:00.000Z",
  //         amount: 123.43,
  //         category: "buyerVariable",
  //         group: "monthlyExpenses",
  //         variable: "mortgageCapital",
  //         effectiveInterestRate: 0.0665,
  //         postedInterestRate: 0.065,
  //         fixedRateAdjustment: 0,
  //         variableRateAdjustment: 0.0015,
  //       },
  //       {
  //         year: 2000,
  //         month: 0,
  //         monthIndex: 0,
  //         date: "2000-01-01T00:00:00.000Z",
  //         amount: 524.36,
  //         category: "buyerVariable",
  //         group: "monthlyExpenses",
  //         variable: "mortgageInterests",
  //         effectiveInterestRate: 0.0665,
  //         postedInterestRate: 0.065,
  //         fixedRateAdjustment: 0,
  //         variableRateAdjustment: 0.0015,
  //       },
  //       {
  //         year: 2005,
  //         month: 0,
  //         monthIndex: 60,
  //         date: "2005-01-01T00:00:00.000Z",
  //         amount: 208.37,
  //         category: "buyerVariable",
  //         group: "monthlyExpenses",
  //         variable: "mortgageCapital",
  //         effectiveInterestRate: 0.044,
  //         postedInterestRate: 0.0425,
  //         fixedRateAdjustment: 0,
  //         variableRateAdjustment: 0.0015,
  //       },
  //       {
  //         year: 2005,
  //         month: 0,
  //         monthIndex: 60,
  //         date: "2005-01-01T00:00:00.000Z",
  //         amount: 293.18,
  //         category: "buyerVariable",
  //         group: "monthlyExpenses",
  //         variable: "mortgageInterests",
  //         effectiveInterestRate: 0.044,
  //         postedInterestRate: 0.0425,
  //         fixedRateAdjustment: 0,
  //         variableRateAdjustment: 0.0015,
  //       },
  //       {
  //         year: 2010,
  //         month: 0,
  //         monthIndex: 120,
  //         date: "2010-01-01T00:00:00.000Z",
  //         amount: 315.18,
  //         category: "buyerVariable",
  //         group: "monthlyExpenses",
  //         variable: "mortgageCapital",
  //         effectiveInterestRate: 0.024,
  //         postedInterestRate: 0.0225,
  //         fixedRateAdjustment: 0,
  //         variableRateAdjustment: 0.0015,
  //       },
  //       {
  //         year: 2010,
  //         month: 0,
  //         monthIndex: 120,
  //         date: "2010-01-01T00:00:00.000Z",
  //         amount: 136.41,
  //         category: "buyerVariable",
  //         group: "monthlyExpenses",
  //         variable: "mortgageInterests",
  //         effectiveInterestRate: 0.024,
  //         postedInterestRate: 0.0225,
  //         fixedRateAdjustment: 0,
  //         variableRateAdjustment: 0.0015,
  //       },
  //       {
  //         year: 2015,
  //         month: 0,
  //         monthIndex: 180,
  //         date: "2015-01-01T00:00:00.000Z",
  //         amount: 356.3,
  //         category: "buyerVariable",
  //         group: "monthlyExpenses",
  //         variable: "mortgageCapital",
  //         effectiveInterestRate: 0.0315,
  //         postedInterestRate: 0.03,
  //         fixedRateAdjustment: 0,
  //         variableRateAdjustment: 0.0015,
  //       },
  //       {
  //         year: 2015,
  //         month: 0,
  //         monthIndex: 180,
  //         date: "2015-01-01T00:00:00.000Z",
  //         amount: 131.72,
  //         category: "buyerVariable",
  //         group: "monthlyExpenses",
  //         variable: "mortgageInterests",
  //         effectiveInterestRate: 0.0315,
  //         postedInterestRate: 0.03,
  //         fixedRateAdjustment: 0,
  //         variableRateAdjustment: 0.0015,
  //       },
  //       {
  //         year: 2020,
  //         month: 0,
  //         monthIndex: 240,
  //         date: "2020-01-01T00:00:00.000Z",
  //         amount: 409.75,
  //         category: "buyerVariable",
  //         group: "monthlyExpenses",
  //         variable: "mortgageCapital",
  //         effectiveInterestRate: 0.041,
  //         postedInterestRate: 0.0395,
  //         fixedRateAdjustment: 0,
  //         variableRateAdjustment: 0.0015,
  //       },
  //       {
  //         year: 2020,
  //         month: 0,
  //         monthIndex: 240,
  //         date: "2020-01-01T00:00:00.000Z",
  //         amount: 93.05,
  //         category: "buyerVariable",
  //         group: "monthlyExpenses",
  //         variable: "mortgageInterests",
  //         effectiveInterestRate: 0.041,
  //         postedInterestRate: 0.0395,
  //         fixedRateAdjustment: 0,
  //         variableRateAdjustment: 0.0015,
  //       },
  //     ]);
  //   });

  //   // Expenses on the first month
  //   const firstMonthExpenses = results.filter((d) =>
  //     d.monthIndex === 0 &&
  //     d.group === "monthlyExpenses"
  //   );

  //   // console.log(firstMonthExpenses.map((d) => ({
  //   //   ...d,
  //   //   date: d.date.toISOString(),
  //   // })));

  //   await t.step("first month expenses", async () => {
  //     assertEquals(
  //       firstMonthExpenses.map((d) => ({
  //         ...d,
  //         date: d.date.toISOString(),
  //       })),
  //       [
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 506,
  //           category: "renter",
  //           group: "monthlyExpenses",
  //           variable: "rent",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 53,
  //           category: "renter",
  //           group: "monthlyExpenses",
  //           variable: "insurance",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 506,
  //           category: "renter",
  //           group: "monthlyExpenses",
  //           variable: "securityDeposit",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 114.19,
  //           category: "buyerFixed",
  //           group: "monthlyExpenses",
  //           variable: "mortgageCapital",
  //           effectiveInterestRate: 0.0725,
  //           postedInterestRate: 0.0825,
  //           fixedRateAdjustment: -0.01,
  //           variableRateAdjustment: 0,
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 563.22,
  //           category: "buyerFixed",
  //           group: "monthlyExpenses",
  //           variable: "mortgageInterests",
  //           effectiveInterestRate: 0.0725,
  //           postedInterestRate: 0.0825,
  //           fixedRateAdjustment: -0.01,
  //           variableRateAdjustment: 0,
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 45,
  //           category: "buyerFixed",
  //           group: "monthlyExpenses",
  //           variable: "insurance",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 46,
  //           category: "buyerFixed",
  //           group: "monthlyExpenses",
  //           variable: "maintenance",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 157,
  //           category: "buyerFixed",
  //           group: "monthlyExpenses",
  //           variable: "propertyTax",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 124,
  //           category: "buyerFixed",
  //           group: "monthlyExpenses",
  //           variable: "condoFees",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 10514,
  //           category: "buyerFixed",
  //           group: "monthlyExpenses",
  //           variable: "downPayment",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 2103,
  //           category: "buyerFixed",
  //           group: "monthlyExpenses",
  //           variable: "purchaseFixedFees",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 2933,
  //           category: "buyerFixed",
  //           group: "monthlyExpenses",
  //           variable: "insurancePremium",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 123.43,
  //           category: "buyerVariable",
  //           group: "monthlyExpenses",
  //           variable: "mortgageCapital",
  //           effectiveInterestRate: 0.0665,
  //           postedInterestRate: 0.065,
  //           fixedRateAdjustment: 0,
  //           variableRateAdjustment: 0.0015,
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 524.36,
  //           category: "buyerVariable",
  //           group: "monthlyExpenses",
  //           variable: "mortgageInterests",
  //           effectiveInterestRate: 0.0665,
  //           postedInterestRate: 0.065,
  //           fixedRateAdjustment: 0,
  //           variableRateAdjustment: 0.0015,
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 45,
  //           category: "buyerVariable",
  //           group: "monthlyExpenses",
  //           variable: "insurance",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 46,
  //           category: "buyerVariable",
  //           group: "monthlyExpenses",
  //           variable: "maintenance",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 157,
  //           category: "buyerVariable",
  //           group: "monthlyExpenses",
  //           variable: "propertyTax",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 124,
  //           category: "buyerVariable",
  //           group: "monthlyExpenses",
  //           variable: "condoFees",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 10514,
  //           category: "buyerVariable",
  //           group: "monthlyExpenses",
  //           variable: "downPayment",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 2103,
  //           category: "buyerVariable",
  //           group: "monthlyExpenses",
  //           variable: "purchaseFixedFees",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 2933,
  //           category: "buyerVariable",
  //           group: "monthlyExpenses",
  //           variable: "insurancePremium",
  //         },
  //       ],
  //     );
  //   });

  //   const firstMonthExpensesTotalPerCategory = firstMonthExpenses.reduce(
  //     (acc, d) => {
  //       const key = d.category;
  //       acc[key] = (acc[key] || 0) + d.amount;
  //       return acc;
  //     },
  //     {} as Record<string, number>,
  //   );

  //   await t.step("first month expenses total per category", async () => {
  //     assertEquals(firstMonthExpensesTotalPerCategory, {
  //       renter: 1065,
  //       buyerFixed: 16599.41,
  //       buyerVariable: 16569.79,
  //     });
  //   });

  //   // Expenses on the second month
  //   const secondMonthExpenses = results.filter((d) =>
  //     d.monthIndex === 1 &&
  //     d.group === "monthlyExpenses"
  //   );

  //   // console.log(secondMonthExpenses.map((d) => ({
  //   //   ...d,
  //   //   date: d.date.toISOString(),
  //   // })));

  //   await t.step("second month expenses", async () => {
  //     assertEquals(
  //       secondMonthExpenses.map((d) => ({
  //         ...d,
  //         date: d.date.toISOString(),
  //       })),
  //       [
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 506.51,
  //           category: "renter",
  //           group: "monthlyExpenses",
  //           variable: "rent",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 52.77,
  //           category: "renter",
  //           group: "monthlyExpenses",
  //           variable: "insurance",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 114.87,
  //           category: "buyerFixed",
  //           group: "monthlyExpenses",
  //           variable: "mortgageCapital",
  //           effectiveInterestRate: 0.0725,
  //           postedInterestRate: 0.0825,
  //           fixedRateAdjustment: -0.01,
  //           variableRateAdjustment: 0,
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 562.54,
  //           category: "buyerFixed",
  //           group: "monthlyExpenses",
  //           variable: "mortgageInterests",
  //           effectiveInterestRate: 0.0725,
  //           postedInterestRate: 0.0825,
  //           fixedRateAdjustment: -0.01,
  //           variableRateAdjustment: 0,
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 45.22,
  //           category: "buyerFixed",
  //           group: "monthlyExpenses",
  //           variable: "insurance",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 46.42,
  //           category: "buyerFixed",
  //           group: "monthlyExpenses",
  //           variable: "maintenance",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 157,
  //           category: "buyerFixed",
  //           group: "monthlyExpenses",
  //           variable: "propertyTax",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 125.13,
  //           category: "buyerFixed",
  //           group: "monthlyExpenses",
  //           variable: "condoFees",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 124.11,
  //           category: "buyerVariable",
  //           group: "monthlyExpenses",
  //           variable: "mortgageCapital",
  //           effectiveInterestRate: 0.0665,
  //           postedInterestRate: 0.065,
  //           fixedRateAdjustment: 0,
  //           variableRateAdjustment: 0.0015,
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 523.67,
  //           category: "buyerVariable",
  //           group: "monthlyExpenses",
  //           variable: "mortgageInterests",
  //           effectiveInterestRate: 0.0665,
  //           postedInterestRate: 0.065,
  //           fixedRateAdjustment: 0,
  //           variableRateAdjustment: 0.0015,
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 45.22,
  //           category: "buyerVariable",
  //           group: "monthlyExpenses",
  //           variable: "insurance",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 46.42,
  //           category: "buyerVariable",
  //           group: "monthlyExpenses",
  //           variable: "maintenance",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 157,
  //           category: "buyerVariable",
  //           group: "monthlyExpenses",
  //           variable: "propertyTax",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 125.13,
  //           category: "buyerVariable",
  //           group: "monthlyExpenses",
  //           variable: "condoFees",
  //         },
  //       ],
  //     );
  //   });

  //   const secondMonthExpensesTotalPerCategory = secondMonthExpenses.reduce(
  //     (acc, d) => {
  //       const key = d.category;
  //       acc[key] = round((acc[key] || 0) + d.amount, { decimals: 2 });
  //       return acc;
  //     },
  //     {} as Record<string, number>,
  //   );

  //   await t.step("second month expenses total per category", async () => {
  //     assertEquals(secondMonthExpensesTotalPerCategory, {
  //       renter: 559.28,
  //       buyerFixed: 1051.18,
  //       buyerVariable: 1021.55,
  //     });
  //   });

  //   const cumulativeExpensesLastMonth = results.filter((d) =>
  //     d.monthIndex === (numberOfYears * 12) - 1 &&
  //     d.group === "cumulativeExpenses"
  //   );

  //   // console.log(cumulativeExpensesLastMonth.map((d) => ({
  //   //   ...d,
  //   //   date: d.date.toISOString(),
  //   // })));

  //   await t.step("cumulative expenses last month total", async () => {
  //     assertEquals(
  //       cumulativeExpensesLastMonth.map((d) => ({
  //         ...d,
  //         date: d.date.toISOString(),
  //       })),
  //       [
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 177356.74,
  //           category: "renter",
  //           group: "cumulativeExpenses",
  //           variable: "rent",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 18454.14,
  //           category: "renter",
  //           group: "cumulativeExpenses",
  //           variable: "insurance",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 506,
  //           category: "renter",
  //           group: "cumulativeExpenses",
  //           variable: "securityDeposit",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 24613.41,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "insurance",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 94621.02,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "mortgageCapital",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 77412.27,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "mortgageInterests",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 20094.78,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "maintenance",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 58554.99,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "propertyTax",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 54140.67,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "condoFees",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 10514,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "downPayment",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 2103,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "purchaseFixedFees",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 2933,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "insurancePremium",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 24613.41,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "insurance",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 94621.07,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "mortgageCapital",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 60544.16,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "mortgageInterests",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 20094.78,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "maintenance",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 58554.99,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "propertyTax",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 54140.67,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "condoFees",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 10514,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "downPayment",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 2103,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "purchaseFixedFees",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 2933,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "insurancePremium",
  //         },
  //       ],
  //     );
  //   });

  //   const cumulativeExpensesLastMonthTotalPerCategory =
  //     cumulativeExpensesLastMonth.reduce(
  //       (acc, d) => {
  //         const key = d.category;
  //         acc[key] = round((acc[key] || 0) + d.amount, { decimals: 2 });
  //         return acc;
  //       },
  //       {} as Record<string, number>,
  //     );

  //   await t.step(
  //     "cumulative expenses last month total per category",
  //     async () => {
  //       assertEquals(cumulativeExpensesLastMonthTotalPerCategory, {
  //         renter: 196316.88,
  //         buyerFixed: 344987.14,
  //         buyerVariable: 328119.08,
  //       });
  //     },
  //   );

  //   const cumulativeExpensesSecondMonth = results.filter((d) =>
  //     d.monthIndex === 1 &&
  //     d.group === "cumulativeExpenses"
  //   );

  //   // console.log(cumulativeExpensesSecondMonth.map((d) => ({
  //   //   ...d,
  //   //   date: d.date.toISOString(),
  //   // })));

  //   await t.step("cumulative expenses second month", async () => {
  //     assertEquals(
  //       cumulativeExpensesSecondMonth.map((d) => ({
  //         ...d,
  //         date: d.date.toISOString(),
  //       })),
  //       [
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 1012.51,
  //           category: "renter",
  //           group: "cumulativeExpenses",
  //           variable: "rent",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 105.77,
  //           category: "renter",
  //           group: "cumulativeExpenses",
  //           variable: "insurance",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 506,
  //           category: "renter",
  //           group: "cumulativeExpenses",
  //           variable: "securityDeposit",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 90.22,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "insurance",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 229.06,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "mortgageCapital",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 1125.76,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "mortgageInterests",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 92.42,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "maintenance",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 314,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "propertyTax",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 249.13,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "condoFees",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 10514,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "downPayment",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 2103,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "purchaseFixedFees",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 2933,
  //           category: "buyerFixed",
  //           group: "cumulativeExpenses",
  //           variable: "insurancePremium",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 90.22,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "insurance",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 247.54,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "mortgageCapital",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 1048.03,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "mortgageInterests",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 92.42,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "maintenance",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 314,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "propertyTax",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 249.13,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "condoFees",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 10514,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "downPayment",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 2103,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "purchaseFixedFees",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 2933,
  //           category: "buyerVariable",
  //           group: "cumulativeExpenses",
  //           variable: "insurancePremium",
  //         },
  //       ],
  //     );
  //   });

  //   // Gains on the first month
  //   const firstMonthGains = results.filter((d) =>
  //     d.monthIndex === 0 &&
  //     d.group === "monthlyGains"
  //   );

  //   // console.log(firstMonthGains.map((d) => ({
  //   //   ...d,
  //   //   date: d.date.toISOString(),
  //   // })));

  //   await t.step("first month gains", async () => {
  //     assertEquals(
  //       firstMonthGains.map((d) => ({
  //         ...d,
  //         date: d.date.toISOString(),
  //       })),
  //       [
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 15534.41,
  //           category: "renter",
  //           group: "monthlyGains",
  //           variable: "newStocks",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 10628.19,
  //           category: "buyerFixed",
  //           group: "monthlyGains",
  //           variable: "homeEquityGains",
  //           homeValue: 105135,
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 29.62,
  //           category: "buyerVariable",
  //           group: "monthlyGains",
  //           variable: "newStocks",
  //         },
  //         {
  //           year: 2000,
  //           month: 0,
  //           monthIndex: 0,
  //           date: "2000-01-01T00:00:00.000Z",
  //           amount: 10637.43,
  //           category: "buyerVariable",
  //           group: "monthlyGains",
  //           variable: "homeEquityGains",
  //           homeValue: 105135,
  //         },
  //       ],
  //     );
  //   });

  //   // Gains on the second month
  //   const secondMonthGains = results.filter((d) =>
  //     d.monthIndex === 1 &&
  //     d.group === "monthlyGains"
  //   );

  //   // console.log(secondMonthGains.map((d) => ({
  //   //   ...d,
  //   //   date: d.date.toISOString(),
  //   // })));

  //   await t.step("second month gains", async () => {
  //     assertEquals(
  //       secondMonthGains.map((d) => ({
  //         ...d,
  //         date: d.date.toISOString(),
  //       })),
  //       [
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 1595.38,
  //           category: "renter",
  //           group: "monthlyGains",
  //           variable: "stocksGains",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 491.9,
  //           category: "renter",
  //           group: "monthlyGains",
  //           variable: "newStocks",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 535.41,
  //           category: "buyerFixed",
  //           group: "monthlyGains",
  //           variable: "homeEquityGains",
  //           homeValue: 105555.54,
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 3.04,
  //           category: "buyerVariable",
  //           group: "monthlyGains",
  //           variable: "stocksGains",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 29.63,
  //           category: "buyerVariable",
  //           group: "monthlyGains",
  //           variable: "newStocks",
  //         },
  //         {
  //           year: 2000,
  //           month: 1,
  //           monthIndex: 1,
  //           date: "2000-02-01T00:00:00.000Z",
  //           amount: 544.65,
  //           category: "buyerVariable",
  //           group: "monthlyGains",
  //           variable: "homeEquityGains",
  //           homeValue: 105555.54,
  //         },
  //       ],
  //     );
  //   });

  //   const secondMonthGainsTotalPerCategory = secondMonthGains.reduce(
  //     (acc, d) => {
  //       const key = d.category;
  //       acc[key] = round((acc[key] || 0) + d.amount, { decimals: 2 });
  //       return acc;
  //     },
  //     {} as Record<string, number>,
  //   );

  //   await t.step("second month gains total per category", async () => {
  //     assertEquals(secondMonthGainsTotalPerCategory, {
  //       renter: 2087.28,
  //       buyerFixed: 535.41,
  //       buyerVariable: 577.32,
  //     });
  //   });

  //   const cumulativeGains = results.filter((d) => d.group === "cumulativeGains");

  //   const cumulativeGainsLastMonth = cumulativeGains.filter((d) =>
  //     d.monthIndex === (numberOfYears * 12) - 1 && d.group === "cumulativeGains"
  //   );

  //   // console.log(cumulativeGainsLastMonth.map((d) => ({
  //   //   ...d,
  //   //   date: d.date.toISOString(),
  //   // })));

  //   await t.step("cumulative gains last month", async () => {
  //     assertEquals(
  //       cumulativeGainsLastMonth.map((d) => ({
  //         ...d,
  //         date: d.date.toISOString(),
  //       })),
  //       [
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 55462.64,
  //           category: "renter",
  //           group: "cumulativeGains",
  //           variable: "tfsaGains",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 82436.08,
  //           category: "renter",
  //           group: "cumulativeGains",
  //           variable: "tfsaContribution",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 116733.37,
  //           category: "renter",
  //           group: "cumulativeGains",
  //           variable: "stocksGains",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 66234.18,
  //           category: "renter",
  //           group: "cumulativeGains",
  //           variable: "newStocks",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 412185.37,
  //           category: "buyerFixed",
  //           group: "cumulativeGains",
  //           variable: "homeEquityGains",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 8990.5,
  //           category: "buyerVariable",
  //           group: "cumulativeGains",
  //           variable: "tfsaGains",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 11795.54,
  //           category: "buyerVariable",
  //           group: "cumulativeGains",
  //           variable: "tfsaContribution",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 7425.3,
  //           category: "buyerVariable",
  //           group: "cumulativeGains",
  //           variable: "stocksGains",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 5072.52,
  //           category: "buyerVariable",
  //           group: "cumulativeGains",
  //           variable: "newStocks",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 412185.37,
  //           category: "buyerVariable",
  //           group: "cumulativeGains",
  //           variable: "homeEquityGains",
  //         },
  //       ],
  //     );
  //   });

  //   const cumulativeGainsLastMonthTotalPerCategory = cumulativeGainsLastMonth
  //     .reduce(
  //       (acc, d) => {
  //         const key = d.category;
  //         acc[key] = round((acc[key] || 0) + d.amount, { decimals: 2 });
  //         return acc;
  //       },
  //       {} as Record<string, number>,
  //     );

  //   // console.log(cumulativeGainsLastMonthTotalPerCategory);

  //   await t.step(
  //     "cumulative gains last month total per category",
  //     async () => {
  //       assertEquals(cumulativeGainsLastMonthTotalPerCategory, {
  //         renter: 320866.27,
  //         buyerFixed: 412185.37,
  //         buyerVariable: 445469.23,
  //       });
  //     },
  //   );

  //   // We want to ensure that starting on 2009, the buyer's TFSA gains start accumulating
  //   const cumulativeGainsBeforeTFSA = cumulativeGains.filter((d) =>
  //     d.year === 2008 && d.month === 11 && d.group === "cumulativeGains"
  //   );
  //   const buyerFixedNewStocksBeforeTFSA =
  //     cumulativeGainsBeforeTFSA.find((d) =>
  //       d.category === "buyerFixed" && d.variable === "newStocks"
  //     )?.amount ?? 0;
  //   const buyerFixedNewStocksAfterTFSA =
  //     cumulativeGainsLastMonth.find((d) =>
  //       d.category === "buyerFixed" && d.variable === "newStocks"
  //     )?.amount ?? 0;

  //   await t.step("No new stocks after 2009 (buyerFixed)", async () => {
  //     assertEquals(buyerFixedNewStocksBeforeTFSA, buyerFixedNewStocksAfterTFSA);
  //   });

  //   const buyerVariableNewStocksBeforeTFSA =
  //     cumulativeGainsBeforeTFSA.find((d) =>
  //       d.category === "buyerVariable" && d.variable === "newStocks"
  //     )?.amount ?? 0;
  //   const buyerVariableNewStocksAfterTFSA =
  //     cumulativeGainsLastMonth.find((d) =>
  //       d.category === "buyerVariable" && d.variable === "newStocks"
  //     )?.amount ?? 0;

  //   await t.step("No new stocks after 2009 (buyerVariable)", async () => {
  //     assertEquals(
  //       buyerVariableNewStocksBeforeTFSA,
  //       buyerVariableNewStocksAfterTFSA,
  //     );
  //   });

  //   const renterNewStocksBeforeTFSA =
  //     cumulativeGainsBeforeTFSA.find((d) =>
  //       d.category === "renter" && d.variable === "newStocks"
  //     )?.amount ?? 0;
  //   const renterNewStocksAfterTFSA =
  //     cumulativeGainsLastMonth.find((d) =>
  //       d.category === "renter" && d.variable === "newStocks"
  //     )?.amount ?? 0;

  //   await t.step("Almost no new stocks after 2009 (renter)", async () => {
  //     assertEquals(
  //       Math.round(renterNewStocksAfterTFSA - renterNewStocksBeforeTFSA),
  //       542,
  //     );
  //   });

  //   const assets = results.filter((d) => d.group === "assets");

  //   const assetsLastMonth = assets.filter((d) =>
  //     d.monthIndex === (numberOfYears * 12) - 1 && d.group === "assets"
  //   );

  //   // console.log(assetsLastMonth.map((d) => ({
  //   //   ...d,
  //   //   date: d.date.toISOString(),
  //   // })));

  //   await t.step("assets last month", async () => {
  //     assertEquals(
  //       assetsLastMonth.map((d) => ({
  //         ...d,
  //         date: d.date.toISOString(),
  //       })),
  //       [
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 137898.72,
  //           category: "renter",
  //           group: "assets",
  //           variable: "tfsa",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 182967.55,
  //           category: "renter",
  //           group: "assets",
  //           variable: "stocks",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 506,
  //           category: "renter",
  //           group: "assets",
  //           variable: "securityDeposit",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 412185.37,
  //           category: "buyerFixed",
  //           group: "assets",
  //           variable: "homeEquity",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 20786.04,
  //           category: "buyerVariable",
  //           group: "assets",
  //           variable: "tfsa",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 12497.82,
  //           category: "buyerVariable",
  //           group: "assets",
  //           variable: "stocks",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 412185.37,
  //           category: "buyerVariable",
  //           group: "assets",
  //           variable: "homeEquity",
  //         },
  //       ],
  //     );
  //   });

  //   const assetsLastMonthTotalPerCategory = assetsLastMonth.reduce(
  //     (acc, d) => {
  //       const key = d.category;
  //       acc[key] = round((acc[key] || 0) + d.amount, { decimals: 2 });
  //       return acc;
  //     },
  //     {} as Record<string, number>,
  //   );

  //   await t.step("assets last month total per category", async () => {
  //     assertEquals(assetsLastMonthTotalPerCategory, {
  //       renter: 321372.27,
  //       buyerFixed: 412185.37,
  //       buyerVariable: 445469.23,
  //     });
  //   });

  //   const saleCosts = results.filter((d) => d.group === "saleCosts");

  //   const saleCostsLastMonth = saleCosts.filter((d) =>
  //     d.monthIndex === (numberOfYears * 12) - 1 && d.group === "saleCosts"
  //   );

  //   // console.log(saleCostsLastMonth.map((d) => ({
  //   //   ...d,
  //   //   date: d.date.toISOString(),
  //   // })));

  //   await t.step("sale costs last month", async () => {
  //     assertEquals(
  //       saleCostsLastMonth.map((d) => ({
  //         ...d,
  //         date: d.date.toISOString(),
  //       })),
  //       [
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 23156,
  //           category: "renter",
  //           group: "saleCosts",
  //           variable: "stockTaxes",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 18956.41,
  //           category: "buyerFixed",
  //           group: "saleCosts",
  //           variable: "homeSellingCommission",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 2297.2,
  //           category: "buyerFixed",
  //           group: "saleCosts",
  //           variable: "homeSellingFixedFees",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 1341,
  //           category: "buyerVariable",
  //           group: "saleCosts",
  //           variable: "stockTaxes",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 18956.41,
  //           category: "buyerVariable",
  //           group: "saleCosts",
  //           variable: "homeSellingCommission",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 2297.2,
  //           category: "buyerVariable",
  //           group: "saleCosts",
  //           variable: "homeSellingFixedFees",
  //         },
  //       ],
  //     );
  //   });

  //   const saleCostsLastMonthTotalPerCategory = saleCostsLastMonth.reduce(
  //     (acc, d) => {
  //       const key = d.category;
  //       acc[key] = round((acc[key] || 0) + d.amount, { decimals: 2 });
  //       return acc;
  //     },
  //     {} as Record<string, number>,
  //   );

  //   await t.step("sale costs last month total per category", async () => {
  //     assertEquals(saleCostsLastMonthTotalPerCategory, {
  //       renter: 23156,
  //       buyerFixed: 21253.61,
  //       buyerVariable: 22594.61,
  //     });
  //   });

  //   const saleNetGains = results.filter((d) => d.group === "saleNetGains");

  //   const saleNetGainsLastMonth = saleNetGains.filter((d) =>
  //     d.monthIndex === (numberOfYears * 12) - 1 && d.group === "saleNetGains"
  //   );

  //   // console.log(saleNetGainsLastMonth.map((d) => ({
  //   //   ...d,
  //   //   date: d.date.toISOString(),
  //   // })));

  //   await t.step("sale net gains last month", async () => {
  //     assertEquals(
  //       saleNetGainsLastMonth.map((d) => ({
  //         ...d,
  //         date: d.date.toISOString(),
  //       })),
  //       [
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 159811.55,
  //           category: "renter",
  //           group: "saleNetGains",
  //           variable: "stockSellingGains",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 137898.72,
  //           category: "renter",
  //           group: "saleNetGains",
  //           variable: "tfsaSellingGains",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 506,
  //           category: "renter",
  //           group: "saleNetGains",
  //           variable: "securityDeposit",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 390931.76,
  //           category: "buyerFixed",
  //           group: "saleNetGains",
  //           variable: "homeSellingGains",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 11156.82,
  //           category: "buyerVariable",
  //           group: "saleNetGains",
  //           variable: "stockSellingGains",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 20786.04,
  //           category: "buyerVariable",
  //           group: "saleNetGains",
  //           variable: "tfsaSellingGains",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 390931.76,
  //           category: "buyerVariable",
  //           group: "saleNetGains",
  //           variable: "homeSellingGains",
  //         },
  //       ],
  //     );
  //   });

  //   const saleNetGainsLastMonthTotalPerCategory = saleNetGainsLastMonth.reduce(
  //     (acc, d) => {
  //       const key = d.category;
  //       acc[key] = round((acc[key] || 0) + d.amount, { decimals: 2 });
  //       return acc;
  //     },
  //     {} as Record<string, number>,
  //   );

  //   await t.step("sale net gains last month total per category", async () => {
  //     assertEquals(saleNetGainsLastMonthTotalPerCategory, {
  //       renter: 298216.27,
  //       buyerFixed: 390931.76,
  //       buyerVariable: 422874.62,
  //     });
  //   });

  //   // We check the home value on the last month
  //   const homeValues = results.filter((d) =>
  //     "homeValue" in d && d.monthIndex === (numberOfYears * 12) - 1
  //   ).map((d) => ({ ...d, date: d.date.toISOString() }));

  //   // console.log(homeValues);

  //   await t.step("home values last month", async () => {
  //     assertEquals(
  //       homeValues,
  //       [
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 3847.5,
  //           category: "buyerFixed",
  //           group: "monthlyGains",
  //           variable: "homeEquityGains",
  //           homeValue: 412185.37,
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 3474.74,
  //           category: "buyerVariable",
  //           group: "monthlyGains",
  //           variable: "homeEquityGains",
  //           homeValue: 412185.37,
  //         },
  //       ],
  //     );
  //   });

  //   const overallBalanceAfterSelling = results.filter((d) =>
  //     d.group === "summaryCumulative" && d.variable === "balanceAfterSelling"
  //   );

  //   const overallBalanceAfterSellingLastMonth = overallBalanceAfterSelling.filter(
  //     (d) =>
  //       d.monthIndex === (numberOfYears * 12) - 1 &&
  //       d.group === "summaryCumulative" &&
  //       d.variable === "balanceAfterSelling",
  //   );

  //   await t.step("overall balance after selling last month", async () => {
  //     assertEquals(
  //       overallBalanceAfterSellingLastMonth.map((d) => ({
  //         ...d,
  //         date: d.date.toISOString(),
  //       })),
  //       [
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 101899.39,
  //           category: "renter",
  //           group: "summaryCumulative",
  //           variable: "balanceAfterSelling",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 45944.62,
  //           category: "buyerFixed",
  //           group: "summaryCumulative",
  //           variable: "balanceAfterSelling",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 94755.54,
  //           category: "buyerVariable",
  //           group: "summaryCumulative",
  //           variable: "balanceAfterSelling",
  //         },
  //       ],
  //     );
  //   });

  //   const resultsFinalBalanceOnly = simulateRentVsBuy(params, {
  //     finalBalanceOnly: true,
  //   });
  //   // console.log(resultsFinalBalanceOnly.map((d) => ({
  //   //   ...d,
  //   //   date: d.date.toISOString(),
  //   // })));
  //   await t.step("the final balance only option should work", async () => {
  //     assertEquals(
  //       resultsFinalBalanceOnly.map((d) => ({
  //         ...d,
  //         date: d.date.toISOString(),
  //       })),
  //       [
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 101899.39,
  //           category: "renter",
  //           group: "summaryCumulative",
  //           variable: "balanceAfterSelling",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 124549.39,
  //           category: "renter",
  //           group: "summaryCumulative",
  //           variable: "balance",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 45944.62,
  //           category: "buyerFixed",
  //           group: "summaryCumulative",
  //           variable: "balanceAfterSelling",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 67198.23,
  //           category: "buyerFixed",
  //           group: "summaryCumulative",
  //           variable: "balance",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 94755.54,
  //           category: "buyerVariable",
  //           group: "summaryCumulative",
  //           variable: "balanceAfterSelling",
  //         },
  //         {
  //           year: 2024,
  //           month: 11,
  //           monthIndex: 299,
  //           date: "2024-12-01T00:00:00.000Z",
  //           amount: 117350.15,
  //           category: "buyerVariable",
  //           group: "summaryCumulative",
  //           variable: "balance",
  //         },
  //       ],
  //     );
  //   });

  //   assertEquals(true, true);
  // });

  // Deno.test("should compute the total expenses and savings of a renter and buyer in Montreal with the couple option", async (t) => {
  //   const params = getParams("Montreal", "Quebec", {
  //     renterMonthlyInsurance: 70,
  //     ownerMonthlyInsurance: 125,
  //     sellingFixedFees: 2000,
  //     condoFees: 250,
  //   });
  //   // Just to trigger massive savings
  //   params.renter.startingMonthlyRent = 100;

  //   params.renter.securityDeposit = params.renter.startingMonthlyRent;

  //   const resultsDefault = simulateRentVsBuy(params);
  //   const resultsCouple = simulateRentVsBuy({ ...params, couple: true });

  //   const tfsaContributionsLastMonthDefault = resultsDefault.filter((d) =>
  //     d.monthIndex === (numberOfYears * 12) - 1 &&
  //     d.group === "cumulativeGains" &&
  //     d.variable === "tfsaContribution"
  //   );
  //   const tfsaContributionsLastMonthCouple = resultsCouple.filter((d) =>
  //     d.monthIndex === (numberOfYears * 12) - 1 &&
  //     d.group === "cumulativeGains" &&
  //     d.variable === "tfsaContribution"
  //   );

  //   const stocksLastMonthDefault = resultsDefault.filter((d) =>
  //     d.monthIndex === (numberOfYears * 12) - 1 && d.group === "assets" &&
  //     d.variable === "stocks"
  //   );
  //   const stocksLastMonthCouple = resultsCouple.filter((d) =>
  //     d.monthIndex === (numberOfYears * 12) - 1 && d.group === "assets" &&
  //     d.variable === "stocks"
  //   );

  //   const stocksGainsLastMonthDefault = resultsDefault.filter((d) =>
  //     d.monthIndex === (numberOfYears * 12) - 1 &&
  //     d.group === "cumulativeGains" &&
  //     d.variable === "stocksGains"
  //   );
  //   const stocksGainsLastMonthCouple = resultsCouple.filter((d) =>
  //     d.monthIndex === (numberOfYears * 12) - 1 &&
  //     d.group === "cumulativeGains" &&
  //     d.variable === "stocksGains"
  //   );

  //   const saleCostsLastMonthDefault = resultsDefault.filter((d) =>
  //     d.monthIndex === (numberOfYears * 12) - 1 && d.group === "saleCosts" &&
  //     d.variable === "stockTaxes"
  //   );
  //   const saleCostsLastMonthCouple = resultsCouple.filter((d) =>
  //     d.monthIndex === (numberOfYears * 12) - 1 && d.group === "saleCosts" &&
  //     d.variable === "stockTaxes"
  //   );

  //   const comparison = {
  //     tfsaContributionsLastMonthDefault: tfsaContributionsLastMonthDefault.map((
  //       d,
  //     ) => ({
  //       ...d,
  //       date: d.date.toISOString(),
  //     })),
  //     tfsaContributionsLastMonthCouple: tfsaContributionsLastMonthCouple.map((
  //       d,
  //     ) => ({
  //       ...d,
  //       date: d.date.toISOString(),
  //     })),
  //     stocksLastMonthDefault: stocksLastMonthDefault.map((d) => ({
  //       ...d,
  //       date: d.date.toISOString(),
  //     })),
  //     stocksLastMonthCouple: stocksLastMonthCouple.map((d) => ({
  //       ...d,
  //       date: d.date.toISOString(),
  //     })),
  //     stocksGainsLastMonthDefault: stocksGainsLastMonthDefault.map((d) => ({
  //       ...d,
  //       date: d.date.toISOString(),
  //     })),
  //     stocksGainsLastMonthCouple: stocksGainsLastMonthCouple.map((d) => ({
  //       ...d,
  //       date: d.date.toISOString(),
  //     })),
  //     saleCostsLastMonthDefault: saleCostsLastMonthDefault.map((d) => ({
  //       ...d,
  //       date: d.date.toISOString(),
  //     })),
  //     saleCostsLastMonthCouple: saleCostsLastMonthCouple.map((d) => ({
  //       ...d,
  //       date: d.date.toISOString(),
  //     })),
  //   };

  //   await t.step(
  //     "comparing default and couple",
  //     async () => {
  //       assertEquals(
  //         comparison,
  //         {
  //           tfsaContributionsLastMonthDefault: [
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 95000,
  //               category: "renter",
  //               group: "cumulativeGains",
  //               variable: "tfsaContribution",
  //             },
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 11795.54,
  //               category: "buyerVariable",
  //               group: "cumulativeGains",
  //               variable: "tfsaContribution",
  //             },
  //           ],
  //           tfsaContributionsLastMonthCouple: [
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 176632.88,
  //               category: "renter",
  //               group: "cumulativeGains",
  //               variable: "tfsaContribution",
  //             },
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 11795.54,
  //               category: "buyerVariable",
  //               group: "cumulativeGains",
  //               variable: "tfsaContribution",
  //             },
  //           ],
  //           stocksLastMonthDefault: [
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 444007.2,
  //               category: "renter",
  //               group: "assets",
  //               variable: "stocks",
  //             },
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 12497.82,
  //               category: "buyerVariable",
  //               group: "assets",
  //               variable: "stocks",
  //             },
  //           ],
  //           stocksLastMonthCouple: [
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 310977.43,
  //               category: "renter",
  //               group: "assets",
  //               variable: "stocks",
  //             },
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 12497.82,
  //               category: "buyerVariable",
  //               group: "assets",
  //               variable: "stocks",
  //             },
  //           ],
  //           stocksGainsLastMonthDefault: [
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 247625.01,
  //               category: "renter",
  //               group: "cumulativeGains",
  //               variable: "stocksGains",
  //             },
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 7425.3,
  //               category: "buyerVariable",
  //               group: "cumulativeGains",
  //               variable: "stocksGains",
  //             },
  //           ],
  //           stocksGainsLastMonthCouple: [
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 196228.12,
  //               category: "renter",
  //               group: "cumulativeGains",
  //               variable: "stocksGains",
  //             },
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 7425.3,
  //               category: "buyerVariable",
  //               group: "cumulativeGains",
  //               variable: "stocksGains",
  //             },
  //           ],
  //           saleCostsLastMonthDefault: [
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 54771,
  //               category: "renter",
  //               group: "saleCosts",
  //               variable: "stockTaxes",
  //             },
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 1341,
  //               category: "buyerVariable",
  //               group: "saleCosts",
  //               variable: "stockTaxes",
  //             },
  //           ],
  //           saleCostsLastMonthCouple: [
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 37746,
  //               category: "renter",
  //               group: "saleCosts",
  //               variable: "stockTaxes",
  //             },
  //             {
  //               year: 2024,
  //               month: 11,
  //               monthIndex: 299,
  //               date: "2024-12-01T00:00:00.000Z",
  //               amount: 1340,
  //               category: "buyerVariable",
  //               group: "saleCosts",
  //               variable: "stockTaxes",
  //             },
  //           ],
  //         },
  //       );
  //     },
  //   );
});
