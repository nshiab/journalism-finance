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
    annualInvestmentFeeRate: 0,
    couple: false,
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
    annualInvestmentFeeRate: 0,
    couple: false,
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
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);
  // Just because we want to test it.
  params.renter.securityDeposit = params.renter.startingMonthlyRent;

  // console.log(params);

  const results = simulateRentVsBuy(params);

  const mortgageRatesFixedBuyer = results.filter((d) =>
    [2001, 2006, 2011, 2016, 2021].includes(d.year) && d.month === 0 &&
    d.variable.includes("mortgage") && d.group === "monthlyExpenses" &&
    d.category === "buyerFixed"
  ).map((d) => ({
    ...d,
    date: d.date.toISOString(),
  }));

  // console.log(mortgageRatesFixedBuyer);

  await t.step("mortgage rates fixed buyer", async () => {
    assertEquals(mortgageRatesFixedBuyer, [
      {
        year: 2001,
        month: 0,
        monthIndex: 0,
        date: "2001-01-01T00:00:00.000Z",
        amount: 143.8,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0604,
        postedInterestRate: 0.0795,
        fixedRateAdjustment: -0.0191,
        variableRateAdjustment: 0,
      },
      {
        year: 2001,
        month: 0,
        monthIndex: 0,
        date: "2001-01-01T00:00:00.000Z",
        amount: 492.75,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0604,
        postedInterestRate: 0.0795,
        fixedRateAdjustment: -0.0191,
        variableRateAdjustment: 0,
      },
      {
        year: 2006,
        month: 0,
        monthIndex: 60,
        date: "2006-01-01T00:00:00.000Z",
        amount: 233.5,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0439,
        postedInterestRate: 0.063,
        fixedRateAdjustment: -0.0191,
        variableRateAdjustment: 0,
      },
      {
        year: 2006,
        month: 0,
        monthIndex: 60,
        date: "2006-01-01T00:00:00.000Z",
        amount: 323.01,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0439,
        postedInterestRate: 0.063,
        fixedRateAdjustment: -0.0191,
        variableRateAdjustment: 0,
      },
      {
        year: 2011,
        month: 0,
        monthIndex: 120,
        date: "2011-01-01T00:00:00.000Z",
        amount: 317.11,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0328,
        postedInterestRate: 0.0519,
        fixedRateAdjustment: -0.0191,
        variableRateAdjustment: 0,
      },
      {
        year: 2011,
        month: 0,
        monthIndex: 120,
        date: "2011-01-01T00:00:00.000Z",
        amount: 199.48,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0328,
        postedInterestRate: 0.0519,
        fixedRateAdjustment: -0.0191,
        variableRateAdjustment: 0,
      },
      {
        year: 2016,
        month: 0,
        monthIndex: 180,
        date: "2016-01-01T00:00:00.000Z",
        amount: 383.8,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0273,
        postedInterestRate: 0.0464,
        fixedRateAdjustment: -0.0191,
        variableRateAdjustment: 0,
      },
      {
        year: 2016,
        month: 0,
        monthIndex: 180,
        date: "2016-01-01T00:00:00.000Z",
        amount: 119.55,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0273,
        postedInterestRate: 0.0464,
        fixedRateAdjustment: -0.0191,
        variableRateAdjustment: 0,
      },
      {
        year: 2021,
        month: 0,
        monthIndex: 240,
        date: "2021-01-01T00:00:00.000Z",
        amount: 437.9,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0288,
        postedInterestRate: 0.0479,
        fixedRateAdjustment: -0.0191,
        variableRateAdjustment: 0,
      },
      {
        year: 2021,
        month: 0,
        monthIndex: 240,
        date: "2021-01-01T00:00:00.000Z",
        amount: 67.3,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0288,
        postedInterestRate: 0.0479,
        fixedRateAdjustment: -0.0191,
        variableRateAdjustment: 0,
      },
    ]);
  });

  const mortgageRatesVariableBuyer = results.filter((d) =>
    [2001, 2006, 2011, 2016, 2021].includes(d.year) && d.month === 0 &&
    d.variable.includes("mortgage") && d.group === "monthlyExpenses" &&
    d.category === "buyerVariable"
  ).map((d) => ({
    ...d,
    date: d.date.toISOString(),
  }));

  // console.log(mortgageRatesVariableBuyer);

  await t.step("mortgage rates variable buyer", async () => {
    assertEquals(mortgageRatesVariableBuyer, [
      {
        year: 2001,
        month: 0,
        monthIndex: 0,
        date: "2001-01-01T00:00:00.000Z",
        amount: 119.49,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0715,
        postedInterestRate: 0.075,
        fixedRateAdjustment: 0,
        variableRateAdjustment: -0.0035,
      },
      {
        year: 2001,
        month: 0,
        monthIndex: 0,
        date: "2001-01-01T00:00:00.000Z",
        amount: 590.6,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0715,
        postedInterestRate: 0.075,
        fixedRateAdjustment: 0,
        variableRateAdjustment: -0.0035,
      },
      {
        year: 2006,
        month: 0,
        monthIndex: 60,
        date: "2006-01-01T00:00:00.000Z",
        amount: 192.12,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0465,
        postedInterestRate: 0.05,
        fixedRateAdjustment: 0,
        variableRateAdjustment: -0.0035,
      },
      {
        year: 2006,
        month: 0,
        monthIndex: 60,
        date: "2006-01-01T00:00:00.000Z",
        amount: 293.93,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0465,
        postedInterestRate: 0.05,
        fixedRateAdjustment: 0,
        variableRateAdjustment: -0.0035,
      },
      {
        year: 2011,
        month: 0,
        monthIndex: 120,
        date: "2011-01-01T00:00:00.000Z",
        amount: 276.37,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0265,
        postedInterestRate: 0.03,
        fixedRateAdjustment: 0,
        variableRateAdjustment: -0.0035,
      },
      {
        year: 2011,
        month: 0,
        monthIndex: 120,
        date: "2011-01-01T00:00:00.000Z",
        amount: 134.72,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0265,
        postedInterestRate: 0.03,
        fixedRateAdjustment: 0,
        variableRateAdjustment: -0.0035,
      },
      {
        year: 2016,
        month: 0,
        monthIndex: 180,
        date: "2016-01-01T00:00:00.000Z",
        amount: 319.73,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0235,
        postedInterestRate: 0.027,
        fixedRateAdjustment: 0,
        variableRateAdjustment: -0.0035,
      },
      {
        year: 2016,
        month: 0,
        monthIndex: 180,
        date: "2016-01-01T00:00:00.000Z",
        amount: 84.61,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0235,
        postedInterestRate: 0.027,
        fixedRateAdjustment: 0,
        variableRateAdjustment: -0.0035,
      },
      {
        year: 2021,
        month: 0,
        monthIndex: 240,
        date: "2021-01-01T00:00:00.000Z",
        amount: 374.49,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.021,
        postedInterestRate: 0.0245,
        fixedRateAdjustment: 0,
        variableRateAdjustment: -0.0035,
      },
      {
        year: 2021,
        month: 0,
        monthIndex: 240,
        date: "2021-01-01T00:00:00.000Z",
        amount: 41.42,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.021,
        postedInterestRate: 0.0245,
        fixedRateAdjustment: 0,
        variableRateAdjustment: -0.0035,
      },
    ]);
  });

  // Expenses on the first month
  const firstMonthExpenses = results.filter((d) =>
    d.monthIndex === 0 &&
    d.group === "monthlyExpenses"
  );

  // console.log(firstMonthExpenses.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("first month expenses", async () => {
    assertEquals(
      firstMonthExpenses.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 509,
          category: "renter",
          group: "monthlyExpenses",
          variable: "rent",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 53,
          category: "renter",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 509,
          category: "renter",
          group: "monthlyExpenses",
          variable: "securityDeposit",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 143.8,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "mortgageCapital",
          effectiveInterestRate: 0.0604,
          postedInterestRate: 0.0795,
          fixedRateAdjustment: -0.0191,
          variableRateAdjustment: 0,
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 492.75,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "mortgageInterests",
          effectiveInterestRate: 0.0604,
          postedInterestRate: 0.0795,
          fixedRateAdjustment: -0.0191,
          variableRateAdjustment: 0,
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 45,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 53,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 157,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 125,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "condoFees",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 11014,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "downPayment",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 2203,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 3073,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "insurancePremium",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 119.49,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "mortgageCapital",
          effectiveInterestRate: 0.0715,
          postedInterestRate: 0.075,
          fixedRateAdjustment: 0,
          variableRateAdjustment: -0.0035,
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 590.6,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "mortgageInterests",
          effectiveInterestRate: 0.0715,
          postedInterestRate: 0.075,
          fixedRateAdjustment: 0,
          variableRateAdjustment: -0.0035,
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 45,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 53,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 157,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 125,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "condoFees",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 11014,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "downPayment",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 2203,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 3073,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "insurancePremium",
        },
      ],
    );
  });

  const firstMonthExpensesTotalPerCategory = firstMonthExpenses.reduce(
    (acc, d) => {
      const key = d.category;
      acc[key] = (acc[key] || 0) + d.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  await t.step("first month expenses total per category", async () => {
    assertEquals(firstMonthExpensesTotalPerCategory, {
      renter: 1071,
      buyerFixed: 17306.55,
      buyerVariable: 17380.09,
    });
  });

  // Expenses on the second month
  const secondMonthExpenses = results.filter((d) =>
    d.monthIndex === 1 &&
    d.group === "monthlyExpenses"
  );

  // console.log(secondMonthExpenses.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("second month expenses", async () => {
    assertEquals(
      secondMonthExpenses.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 509,
          category: "renter",
          group: "monthlyExpenses",
          variable: "rent",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 53.39,
          category: "renter",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 3.54,
          category: "renter",
          group: "monthlyExpenses",
          variable: "stocksFees",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 144.51,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "mortgageCapital",
          effectiveInterestRate: 0.0604,
          postedInterestRate: 0.0795,
          fixedRateAdjustment: -0.0191,
          variableRateAdjustment: 0,
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 492.03,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "mortgageInterests",
          effectiveInterestRate: 0.0604,
          postedInterestRate: 0.0795,
          fixedRateAdjustment: -0.0191,
          variableRateAdjustment: 0,
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 46.56,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 53.06,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 157,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 125.14,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "condoFees",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 0.02,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "stocksFees",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 140.82,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "mortgageCapital",
          effectiveInterestRate: 0.069,
          postedInterestRate: 0.0725,
          fixedRateAdjustment: 0,
          variableRateAdjustment: -0.0035,
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 569.26,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "mortgageInterests",
          effectiveInterestRate: 0.069,
          postedInterestRate: 0.0725,
          fixedRateAdjustment: 0,
          variableRateAdjustment: -0.0035,
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 46.56,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 53.06,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 157,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 125.14,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "condoFees",
        },
      ],
    );
  });

  const secondMonthExpensesTotalPerCategory = secondMonthExpenses.reduce(
    (acc, d) => {
      const key = d.category;
      acc[key] = round((acc[key] || 0) + d.amount, { decimals: 2 });
      return acc;
    },
    {} as Record<string, number>,
  );

  await t.step("second month expenses total per category", async () => {
    assertEquals(secondMonthExpensesTotalPerCategory, {
      renter: 565.93,
      buyerFixed: 1018.32,
      buyerVariable: 1091.84,
    });
  });

  const cumulativeExpensesLastMonth = results.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 &&
    d.group === "cumulativeExpenses"
  );

  // console.log(cumulativeExpensesLastMonth.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("cumulative expenses last month total", async () => {
    assertEquals(
      cumulativeExpensesLastMonth.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 179650.26,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "rent",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 18480.78,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 509,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "securityDeposit",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 2947.68,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "tfsaFees",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 7581.15,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "stocksFees",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 24541.33,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 99122,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 63969.98,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 23038.88,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 59924.67,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 54338.87,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 11014,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 2203,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 3073,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurancePremium",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 547.38,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "stocksFees",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 24541.33,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 97776.83,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 47871.55,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 23038.88,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 59924.67,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 54338.87,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 11014,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 2203,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 3073,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurancePremium",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 669.28,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "tfsaFees",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 227.02,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "stocksFees",
        },
      ],
    );
  });

  const cumulativeExpensesLastMonthTotalPerCategory =
    cumulativeExpensesLastMonth.reduce(
      (acc, d) => {
        const key = d.category;
        acc[key] = round((acc[key] || 0) + d.amount, { decimals: 2 });
        return acc;
      },
      {} as Record<string, number>,
    );

  await t.step(
    "cumulative expenses last month total per category",
    async () => {
      assertEquals(cumulativeExpensesLastMonthTotalPerCategory, {
        renter: 209168.87,
        buyerFixed: 341773.11,
        buyerVariable: 324678.43,
      });
    },
  );

  const cumulativeExpensesSecondMonth = results.filter((d) =>
    d.monthIndex === 1 &&
    d.group === "cumulativeExpenses"
  );

  // console.log(cumulativeExpensesSecondMonth.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("cumulative expenses second month", async () => {
    assertEquals(
      cumulativeExpensesSecondMonth.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 1018,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "rent",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 106.39,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 509,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "securityDeposit",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 3.54,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "stocksFees",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 91.56,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 288.31,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 984.78,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 106.06,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 314,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 250.14,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 11014,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 2203,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 3073,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurancePremium",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 0.02,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "stocksFees",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 91.56,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 260.31,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 1159.86,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 106.06,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 314,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 250.14,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 11014,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 2203,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 3073,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurancePremium",
        },
      ],
    );
  });

  // Gains on the first month
  const firstMonthGains = results.filter((d) =>
    d.monthIndex === 0 &&
    d.group === "monthlyGains"
  );

  // console.log(firstMonthGains.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("first month gains", async () => {
    assertEquals(
      firstMonthGains.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 16309.09,
          category: "renter",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 73.54,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 11157.8,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 110136,
        },
        {
          year: 2001,
          month: 0,
          monthIndex: 0,
          date: "2001-01-01T00:00:00.000Z",
          amount: 11133.49,
          category: "buyerVariable",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 110136,
        },
      ],
    );
  });

  // Gains on the second month
  const secondMonthGains = results.filter((d) =>
    d.monthIndex === 1 &&
    d.group === "monthlyGains"
  );

  // console.log(secondMonthGains.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("second month gains", async () => {
    assertEquals(
      secondMonthGains.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 656.98,
          category: "renter",
          group: "monthlyGains",
          variable: "stocksGains",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 529.45,
          category: "renter",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 2.96,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "stocksGains",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 73.54,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 1047.63,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 111039.12,
        },
        {
          year: 2001,
          month: 1,
          monthIndex: 1,
          date: "2001-02-01T00:00:00.000Z",
          amount: 1043.94,
          category: "buyerVariable",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 111039.12,
        },
      ],
    );
  });

  const secondMonthGainsTotalPerCategory = secondMonthGains.reduce(
    (acc, d) => {
      const key = d.category;
      acc[key] = round((acc[key] || 0) + d.amount, { decimals: 2 });
      return acc;
    },
    {} as Record<string, number>,
  );

  await t.step("second month gains total per category", async () => {
    assertEquals(secondMonthGainsTotalPerCategory, {
      renter: 1186.43,
      buyerFixed: 1124.13,
      buyerVariable: 1043.94,
    });
  });

  const cumulativeGains = results.filter((d) => d.group === "cumulativeGains");

  const cumulativeGainsLastMonth = cumulativeGains.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 && d.group === "cumulativeGains"
  );

  // console.log(cumulativeGainsLastMonth.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("cumulative gains last month", async () => {
    assertEquals(
      cumulativeGainsLastMonth.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 108253.42,
          category: "renter",
          group: "cumulativeGains",
          variable: "tfsaGains",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 83062.92,
          category: "renter",
          group: "cumulativeGains",
          variable: "tfsaContribution",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 243448.85,
          category: "renter",
          group: "cumulativeGains",
          variable: "stocksGains",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 63935.07,
          category: "renter",
          group: "cumulativeGains",
          variable: "newStocks",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 17633.09,
          category: "buyerFixed",
          group: "cumulativeGains",
          variable: "stocksGains",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 4412.3,
          category: "buyerFixed",
          group: "cumulativeGains",
          variable: "newStocks",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 425585,
          category: "buyerFixed",
          group: "cumulativeGains",
          variable: "homeEquityGains",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 24592.94,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "tfsaGains",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 19319.46,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "tfsaContribution",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 7548.35,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "stocksGains",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 2536.44,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "newStocks",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 424239.82,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "homeEquityGains",
        },
      ],
    );
  });

  const cumulativeGainsLastMonthTotalPerCategory = cumulativeGainsLastMonth
    .reduce(
      (acc, d) => {
        const key = d.category;
        acc[key] = round((acc[key] || 0) + d.amount, { decimals: 2 });
        return acc;
      },
      {} as Record<string, number>,
    );

  // console.log(cumulativeGainsLastMonthTotalPerCategory);

  await t.step(
    "cumulative gains last month total per category",
    async () => {
      assertEquals(cumulativeGainsLastMonthTotalPerCategory, {
        renter: 498700.26,
        buyerFixed: 447630.39,
        buyerVariable: 478237.01,
      });
    },
  );

  // We want to ensure that starting on 2009, the buyer's TFSA gains start accumulating
  const cumulativeGainsBeforeTFSA = cumulativeGains.filter((d) =>
    d.year === 2008 && d.month === 11 && d.group === "cumulativeGains"
  );
  const buyerFixedNewStocksBeforeTFSA =
    cumulativeGainsBeforeTFSA.find((d) =>
      d.category === "buyerFixed" && d.variable === "newStocks"
    )?.amount ?? 0;
  const buyerFixedNewStocksAfterTFSA =
    cumulativeGainsLastMonth.find((d) =>
      d.category === "buyerFixed" && d.variable === "newStocks"
    )?.amount ?? 0;

  await t.step("No new stocks after 2009 (buyerFixed)", async () => {
    assertEquals(buyerFixedNewStocksBeforeTFSA, buyerFixedNewStocksAfterTFSA);
  });

  const buyerVariableNewStocksBeforeTFSA =
    cumulativeGainsBeforeTFSA.find((d) =>
      d.category === "buyerVariable" && d.variable === "newStocks"
    )?.amount ?? 0;
  const buyerVariableNewStocksAfterTFSA =
    cumulativeGainsLastMonth.find((d) =>
      d.category === "buyerVariable" && d.variable === "newStocks"
    )?.amount ?? 0;

  await t.step("No new stocks after 2009 (buyerVariable)", async () => {
    assertEquals(
      buyerVariableNewStocksBeforeTFSA,
      buyerVariableNewStocksAfterTFSA,
    );
  });

  const renterNewStocksBeforeTFSA =
    cumulativeGainsBeforeTFSA.find((d) =>
      d.category === "renter" && d.variable === "newStocks"
    )?.amount ?? 0;
  const renterNewStocksAfterTFSA =
    cumulativeGainsLastMonth.find((d) =>
      d.category === "renter" && d.variable === "newStocks"
    )?.amount ?? 0;

  await t.step("Almost no new stocks after 2009 (renter)", async () => {
    assertEquals(
      Math.round(renterNewStocksAfterTFSA - renterNewStocksBeforeTFSA),
      291,
    );
  });

  const assets = results.filter((d) => d.group === "assets");

  const assetsLastMonth = assets.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 && d.group === "assets"
  );

  // console.log(assetsLastMonth.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("assets last month", async () => {
    assertEquals(
      assetsLastMonth.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 191316.34,
          category: "renter",
          group: "assets",
          variable: "tfsa",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 307383.92,
          category: "renter",
          group: "assets",
          variable: "stocks",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 509,
          category: "renter",
          group: "assets",
          variable: "securityDeposit",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 22045.39,
          category: "buyerFixed",
          group: "assets",
          variable: "stocks",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 425585,
          category: "buyerFixed",
          group: "assets",
          variable: "homeEquity",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 43912.4,
          category: "buyerVariable",
          group: "assets",
          variable: "tfsa",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 10084.79,
          category: "buyerVariable",
          group: "assets",
          variable: "stocks",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 424239.82,
          category: "buyerVariable",
          group: "assets",
          variable: "homeEquity",
        },
      ],
    );
  });

  const assetsLastMonthTotalPerCategory = assetsLastMonth.reduce(
    (acc, d) => {
      const key = d.category;
      acc[key] = round((acc[key] || 0) + d.amount, { decimals: 2 });
      return acc;
    },
    {} as Record<string, number>,
  );

  // console.log(assetsLastMonthTotalPerCategory);

  await t.step("assets last month total per category", async () => {
    assertEquals(assetsLastMonthTotalPerCategory, {
      renter: 499209.26,
      buyerFixed: 447630.39,
      buyerVariable: 478237.01,
    });
  });

  const saleCosts = results.filter((d) => d.group === "saleCosts");

  const saleCostsLastMonth = saleCosts.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 && d.group === "saleCosts"
  );

  // console.log(saleCostsLastMonth.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("sale costs last month", async () => {
    assertEquals(
      saleCostsLastMonth.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 53722,
          category: "renter",
          group: "saleCosts",
          variable: "stockTaxes",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 3185,
          category: "buyerFixed",
          group: "saleCosts",
          variable: "stockTaxes",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 19572.65,
          category: "buyerFixed",
          group: "saleCosts",
          variable: "homeSellingCommission",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 2296.32,
          category: "buyerFixed",
          group: "saleCosts",
          variable: "homeSellingFixedFees",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 1364,
          category: "buyerVariable",
          group: "saleCosts",
          variable: "stockTaxes",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 19572.65,
          category: "buyerVariable",
          group: "saleCosts",
          variable: "homeSellingCommission",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 2296.32,
          category: "buyerVariable",
          group: "saleCosts",
          variable: "homeSellingFixedFees",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 1345.18,
          category: "buyerVariable",
          group: "saleCosts",
          variable: "mortgageBalance",
        },
      ],
    );
  });

  const saleCostsLastMonthTotalPerCategory = saleCostsLastMonth.reduce(
    (acc, d) => {
      const key = d.category;
      acc[key] = round((acc[key] || 0) + d.amount, { decimals: 2 });
      return acc;
    },
    {} as Record<string, number>,
  );
  // console.log(saleCostsLastMonthTotalPerCategory);

  await t.step("sale costs last month total per category", async () => {
    assertEquals(saleCostsLastMonthTotalPerCategory, {
      renter: 53722,
      buyerFixed: 25053.97,
      buyerVariable: 24578.15,
    });
  });

  const saleNetGains = results.filter((d) => d.group === "saleNetGains");

  const saleNetGainsLastMonth = saleNetGains.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 && d.group === "saleNetGains"
  );

  // console.log(saleNetGainsLastMonth.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("sale net gains last month", async () => {
    assertEquals(
      saleNetGainsLastMonth.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 253661.92,
          category: "renter",
          group: "saleNetGains",
          variable: "stockSellingGains",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 191316.34,
          category: "renter",
          group: "saleNetGains",
          variable: "tfsaSellingGains",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 509,
          category: "renter",
          group: "saleNetGains",
          variable: "securityDeposit",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 18860.39,
          category: "buyerFixed",
          group: "saleNetGains",
          variable: "stockSellingGains",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 403716.03,
          category: "buyerFixed",
          group: "saleNetGains",
          variable: "homeSellingGains",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 8720.79,
          category: "buyerVariable",
          group: "saleNetGains",
          variable: "stockSellingGains",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 43912.4,
          category: "buyerVariable",
          group: "saleNetGains",
          variable: "tfsaSellingGains",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 402370.85,
          category: "buyerVariable",
          group: "saleNetGains",
          variable: "homeSellingGains",
        },
      ],
    );
  });

  const saleNetGainsLastMonthTotalPerCategory = saleNetGainsLastMonth.reduce(
    (acc, d) => {
      const key = d.category;
      acc[key] = round((acc[key] || 0) + d.amount, { decimals: 2 });
      return acc;
    },
    {} as Record<string, number>,
  );

  // console.log(saleNetGainsLastMonthTotalPerCategory);

  await t.step("sale net gains last month total per category", async () => {
    assertEquals(saleNetGainsLastMonthTotalPerCategory, {
      renter: 445487.26,
      buyerFixed: 422576.42,
      buyerVariable: 455004.04,
    });
  });

  // We check the home value on the last month
  const homeValues = results.filter((d) =>
    "homeValue" in d && d.monthIndex === (numberOfYears * 12) - 1
  ).map((d) => ({ ...d, date: d.date.toISOString() }));

  // console.log(homeValues);

  await t.step("home values last month", async () => {
    assertEquals(
      homeValues,
      [
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: -990.78,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 425585,
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: -1084.87,
          category: "buyerVariable",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 425585,
        },
      ],
    );
  });

  const overallBalanceAfterSelling = results.filter((d) =>
    d.group === "summaryCumulative" && d.variable === "balanceAfterSelling"
  );

  const overallBalanceAfterSellingLastMonth = overallBalanceAfterSelling.filter(
    (d) =>
      d.monthIndex === (numberOfYears * 12) - 1 &&
      d.group === "summaryCumulative" &&
      d.variable === "balanceAfterSelling",
  );

  // console.log(overallBalanceAfterSellingLastMonth.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("overall balance after selling last month", async () => {
    assertEquals(
      overallBalanceAfterSellingLastMonth.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 246847.22,
          category: "renter",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 81350.69,
          category: "buyerFixed",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 131221.91,
          category: "buyerVariable",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
      ],
    );
  });

  const resultsFinalBalanceOnly = simulateRentVsBuy(params, {
    finalBalanceOnly: true,
  });

  // console.log(resultsFinalBalanceOnly.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("the final balance only option should work", async () => {
    assertEquals(
      resultsFinalBalanceOnly.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 246847.22,
          category: "renter",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 300060.22,
          category: "renter",
          group: "summaryCumulative",
          variable: "balance",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 81350.69,
          category: "buyerFixed",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 106404.66,
          category: "buyerFixed",
          group: "summaryCumulative",
          variable: "balance",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 131221.91,
          category: "buyerVariable",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          year: 2025,
          month: 11,
          monthIndex: 299,
          date: "2025-12-01T00:00:00.000Z",
          amount: 154454.88,
          category: "buyerVariable",
          group: "summaryCumulative",
          variable: "balance",
        },
      ],
    );
  });
});

Deno.test("should compute the total expenses and savings of a renter and buyer in Montreal with the couple option", async (t) => {
  const params = getParams("Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);
  // Just to trigger massive savings
  params.renter.startingMonthlyRent = 100;

  params.renter.securityDeposit = params.renter.startingMonthlyRent;

  const resultsDefault = simulateRentVsBuy(params);
  const resultsCouple = simulateRentVsBuy({ ...params, couple: true });

  const tfsaContributionsLastMonthDefault = resultsDefault.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 &&
    d.group === "cumulativeGains" &&
    d.variable === "tfsaContribution"
  );
  const tfsaContributionsLastMonthCouple = resultsCouple.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 &&
    d.group === "cumulativeGains" &&
    d.variable === "tfsaContribution"
  );

  const stocksLastMonthDefault = resultsDefault.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 && d.group === "assets" &&
    d.variable === "stocks"
  );
  const stocksLastMonthCouple = resultsCouple.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 && d.group === "assets" &&
    d.variable === "stocks"
  );

  const stocksGainsLastMonthDefault = resultsDefault.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 &&
    d.group === "cumulativeGains" &&
    d.variable === "stocksGains"
  );
  const stocksGainsLastMonthCouple = resultsCouple.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 &&
    d.group === "cumulativeGains" &&
    d.variable === "stocksGains"
  );

  const saleCostsLastMonthDefault = resultsDefault.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 && d.group === "saleCosts" &&
    d.variable === "stockTaxes"
  );
  const saleCostsLastMonthCouple = resultsCouple.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 && d.group === "saleCosts" &&
    d.variable === "stockTaxes"
  );

  const comparison = {
    tfsaContributionsLastMonthDefault: tfsaContributionsLastMonthDefault.map((
      d,
    ) => ({
      ...d,
      date: d.date.toISOString(),
    })),
    tfsaContributionsLastMonthCouple: tfsaContributionsLastMonthCouple.map((
      d,
    ) => ({
      ...d,
      date: d.date.toISOString(),
    })),
    stocksLastMonthDefault: stocksLastMonthDefault.map((d) => ({
      ...d,
      date: d.date.toISOString(),
    })),
    stocksLastMonthCouple: stocksLastMonthCouple.map((d) => ({
      ...d,
      date: d.date.toISOString(),
    })),
    stocksGainsLastMonthDefault: stocksGainsLastMonthDefault.map((d) => ({
      ...d,
      date: d.date.toISOString(),
    })),
    stocksGainsLastMonthCouple: stocksGainsLastMonthCouple.map((d) => ({
      ...d,
      date: d.date.toISOString(),
    })),
    saleCostsLastMonthDefault: saleCostsLastMonthDefault.map((d) => ({
      ...d,
      date: d.date.toISOString(),
    })),
    saleCostsLastMonthCouple: saleCostsLastMonthCouple.map((d) => ({
      ...d,
      date: d.date.toISOString(),
    })),
  };

  // console.log(comparison);

  await t.step(
    "comparing default and couple",
    async () => {
      assertEquals(
        comparison,
        {
          tfsaContributionsLastMonthDefault: [
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 102000,
              category: "renter",
              group: "cumulativeGains",
              variable: "tfsaContribution",
            },
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 19319.46,
              category: "buyerVariable",
              group: "cumulativeGains",
              variable: "tfsaContribution",
            },
          ],
          tfsaContributionsLastMonthCouple: [
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 184912.05,
              category: "renter",
              group: "cumulativeGains",
              variable: "tfsaContribution",
            },
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 19319.46,
              category: "buyerVariable",
              group: "cumulativeGains",
              variable: "tfsaContribution",
            },
          ],
          stocksLastMonthDefault: [
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 687590.91,
              category: "renter",
              group: "assets",
              variable: "stocks",
            },
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 22045.39,
              category: "buyerFixed",
              group: "assets",
              variable: "stocks",
            },
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 10084.79,
              category: "buyerVariable",
              group: "assets",
              variable: "stocks",
            },
          ],
          stocksLastMonthCouple: [
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 503282.45,
              category: "renter",
              group: "assets",
              variable: "stocks",
            },
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 22045.39,
              category: "buyerFixed",
              group: "assets",
              variable: "stocks",
            },
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 10084.79,
              category: "buyerVariable",
              group: "assets",
              variable: "stocks",
            },
          ],
          stocksGainsLastMonthDefault: [
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 497825.6,
              category: "renter",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 17633.09,
              category: "buyerFixed",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 7548.35,
              category: "buyerVariable",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
          ],
          stocksGainsLastMonthCouple: [
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 396429.19,
              category: "renter",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 17633.09,
              category: "buyerFixed",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 7548.35,
              category: "buyerVariable",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
          ],
          saleCostsLastMonthDefault: [
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 119745,
              category: "renter",
              group: "saleCosts",
              variable: "stockTaxes",
            },
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 3185,
              category: "buyerFixed",
              group: "saleCosts",
              variable: "stockTaxes",
            },
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 1364,
              category: "buyerVariable",
              group: "saleCosts",
              variable: "stockTaxes",
            },
          ],
          saleCostsLastMonthCouple: [
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 84982,
              category: "renter",
              group: "saleCosts",
              variable: "stockTaxes",
            },
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 3184,
              category: "buyerFixed",
              group: "saleCosts",
              variable: "stockTaxes",
            },
            {
              year: 2025,
              month: 11,
              monthIndex: 299,
              date: "2025-12-01T00:00:00.000Z",
              amount: 1362,
              category: "buyerVariable",
              group: "saleCosts",
              variable: "stockTaxes",
            },
          ],
        },
      );
    },
  );
});
