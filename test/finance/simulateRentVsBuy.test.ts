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
    appreciationIncrease: new Array(120).fill(0.003),
    sellingFixedFeesIncrease: new Array(120).fill(0.002),
  };

  const values = {
    employmentIncome: new Array(120).fill(75_000),
    fiveYearInterestRates: new Array(120).fill(0.05),
    fourYearInterestRates: new Array(120).fill(0.05),
    threeYearInterestRates: new Array(120).fill(0.05),
    twoYearInterestRates: new Array(120).fill(0.05),
    oneYearInterestRates: new Array(120).fill(0.05),
    variableInterestRates: new Array(120).fill(0.06),
  };

  const results = simulateRentVsBuy({
    startingYear: 2024,
    numberOfYears: 10,
    tfsaContributions: true,
    annualInvestmentFeeRate: 0,
    couple: false,
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
    values,
    rates,
  }, { winVariableOnly: true, winVariable: "balanceAfterSelling" });

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
    appreciationIncrease: new Array(60).fill(0.003),
    sellingFixedFeesIncrease: new Array(60).fill(0.002),
  };

  const values = {
    employmentIncome: new Array(60).fill(75_000),
    fiveYearInterestRates: new Array(60).fill(0.005), // 0.5%
    fourYearInterestRates: new Array(60).fill(0.005),
    threeYearInterestRates: new Array(60).fill(0.005),
    twoYearInterestRates: new Array(60).fill(0.005),
    oneYearInterestRates: new Array(60).fill(0.005),
    variableInterestRates: new Array(60).fill(0.005),
  };

  const floorRate = 0.01; // 1%

  const results = simulateRentVsBuy({
    startingYear: 2024,
    numberOfYears: 5,
    tfsaContributions: true,
    annualInvestmentFeeRate: 0,
    couple: false,
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
    values,
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
    [0, 60, 120, 180, 240].includes(d.monthIndex) &&
    d.variable.includes("mortgage") && d.group === "monthlyExpenses" &&
    d.category === "buyerFixed"
  );

  // console.log(mortgageRatesFixedBuyer);

  await t.step("mortgage rates fixed buyer", async () => {
    assertEquals(mortgageRatesFixedBuyer, [
      {
        monthIndex: 0,
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
        monthIndex: 0,
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
        monthIndex: 60,
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
        monthIndex: 60,
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
        monthIndex: 120,
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
        monthIndex: 120,
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
        monthIndex: 180,
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
        monthIndex: 180,
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
        monthIndex: 240,
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
        monthIndex: 240,
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
    [0, 60, 120, 180, 240].includes(d.monthIndex) &&
    d.variable.includes("mortgage") && d.group === "monthlyExpenses" &&
    d.category === "buyerVariable"
  );

  // console.log(mortgageRatesVariableBuyer);

  await t.step("mortgage rates variable buyer", async () => {
    assertEquals(mortgageRatesVariableBuyer, [
      {
        monthIndex: 0,
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
        monthIndex: 0,
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
        monthIndex: 60,
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
        monthIndex: 60,
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
        monthIndex: 120,
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
        monthIndex: 120,
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
        monthIndex: 180,
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
        monthIndex: 180,
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
        monthIndex: 240,
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
        monthIndex: 240,
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
      firstMonthExpenses,
      [
        {
          monthIndex: 0,
          amount: 509,
          category: "renter",
          group: "monthlyExpenses",
          variable: "rent",
        },
        {
          monthIndex: 0,
          amount: 53,
          category: "renter",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          monthIndex: 0,
          amount: 509,
          category: "renter",
          group: "monthlyExpenses",
          variable: "securityDeposit",
        },
        {
          monthIndex: 0,
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
          monthIndex: 0,
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
          monthIndex: 0,
          amount: 45,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          monthIndex: 0,
          amount: 53,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          monthIndex: 0,
          amount: 157,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          monthIndex: 0,
          amount: 125,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "condoFees",
        },
        {
          monthIndex: 0,
          amount: 11014,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "downPayment",
        },
        {
          monthIndex: 0,
          amount: 2203,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "purchaseFixedFees",
        },
        {
          monthIndex: 0,
          amount: 3073,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "insurancePremium",
        },
        {
          monthIndex: 0,
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
          monthIndex: 0,
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
          monthIndex: 0,
          amount: 45,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          monthIndex: 0,
          amount: 53,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          monthIndex: 0,
          amount: 157,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          monthIndex: 0,
          amount: 125,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "condoFees",
        },
        {
          monthIndex: 0,
          amount: 11014,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "downPayment",
        },
        {
          monthIndex: 0,
          amount: 2203,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "purchaseFixedFees",
        },
        {
          monthIndex: 0,
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

  await t.step(
    "totals monthlyExpenses month 0 matches manually computed",
    async () => {
      const totalsFromFunction = Object.fromEntries(
        ["renter", "buyerFixed", "buyerVariable"].map((cat) => [
          cat,
          results.find((d) =>
            d.group === "totals" &&
            d.variable === "monthlyExpenses" &&
            d.monthIndex === 0 &&
            d.category === cat
          )?.amount,
        ]),
      );
      assertEquals(totalsFromFunction, firstMonthExpensesTotalPerCategory);
    },
  );

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
      secondMonthExpenses,
      [
        {
          monthIndex: 1,
          amount: 509,
          category: "renter",
          group: "monthlyExpenses",
          variable: "rent",
        },
        {
          monthIndex: 1,
          amount: 53.39,
          category: "renter",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          monthIndex: 1,
          amount: 3.54,
          category: "renter",
          group: "monthlyExpenses",
          variable: "stocksFees",
        },
        {
          monthIndex: 1,
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
          monthIndex: 1,
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
          monthIndex: 1,
          amount: 46.56,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          monthIndex: 1,
          amount: 53.06,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          monthIndex: 1,
          amount: 157,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          monthIndex: 1,
          amount: 125.14,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "condoFees",
        },
        {
          monthIndex: 1,
          amount: 0.02,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "stocksFees",
        },
        {
          monthIndex: 1,
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
          monthIndex: 1,
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
          monthIndex: 1,
          amount: 46.56,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          monthIndex: 1,
          amount: 53.06,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          monthIndex: 1,
          amount: 157,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          monthIndex: 1,
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

  await t.step(
    "totals monthlyExpenses month 1 matches manually computed",
    async () => {
      const totalsFromFunction = Object.fromEntries(
        ["renter", "buyerFixed", "buyerVariable"].map((cat) => [
          cat,
          results.find((d) =>
            d.group === "totals" &&
            d.variable === "monthlyExpenses" &&
            d.monthIndex === 1 &&
            d.category === cat
          )?.amount,
        ]),
      );
      assertEquals(totalsFromFunction, secondMonthExpensesTotalPerCategory);
    },
  );

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
      cumulativeExpensesLastMonth,
      [
        {
          monthIndex: 299,
          amount: 179650.26,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "rent",
        },
        {
          monthIndex: 299,
          amount: 18480.78,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          monthIndex: 299,
          amount: 509,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "securityDeposit",
        },
        {
          monthIndex: 299,
          amount: 2947.68,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "tfsaFees",
        },
        {
          monthIndex: 299,
          amount: 7581.15,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "stocksFees",
        },
        {
          monthIndex: 299,
          amount: 24541.33,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          monthIndex: 299,
          amount: 99122,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          monthIndex: 299,
          amount: 63969.98,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          monthIndex: 299,
          amount: 23038.88,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          monthIndex: 299,
          amount: 59924.67,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          monthIndex: 299,
          amount: 54338.87,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          monthIndex: 299,
          amount: 11014,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          monthIndex: 299,
          amount: 2203,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          monthIndex: 299,
          amount: 3073,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurancePremium",
        },
        {
          monthIndex: 299,
          amount: 547.38,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "stocksFees",
        },
        {
          monthIndex: 299,
          amount: 24541.33,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          monthIndex: 299,
          amount: 97776.83,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          monthIndex: 299,
          amount: 47871.55,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          monthIndex: 299,
          amount: 23038.88,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          monthIndex: 299,
          amount: 59924.67,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          monthIndex: 299,
          amount: 54338.87,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          monthIndex: 299,
          amount: 11014,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          monthIndex: 299,
          amount: 2203,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          monthIndex: 299,
          amount: 3073,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurancePremium",
        },
        {
          monthIndex: 299,
          amount: 669.28,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "tfsaFees",
        },
        {
          monthIndex: 299,
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

  await t.step(
    "totals cumulativeExpenses last month matches manually computed",
    async () => {
      const totalsFromFunction = Object.fromEntries(
        ["renter", "buyerFixed", "buyerVariable"].map((cat) => [
          cat,
          results.find((d) =>
            d.group === "totals" &&
            d.variable === "cumulativeExpenses" &&
            d.monthIndex === (numberOfYears * 12) - 1 &&
            d.category === cat
          )?.amount,
        ]),
      );
      assertEquals(
        totalsFromFunction,
        cumulativeExpensesLastMonthTotalPerCategory,
      );
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
      cumulativeExpensesSecondMonth,
      [
        {
          monthIndex: 1,
          amount: 1018,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "rent",
        },
        {
          monthIndex: 1,
          amount: 106.39,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          monthIndex: 1,
          amount: 509,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "securityDeposit",
        },
        {
          monthIndex: 1,
          amount: 3.54,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "stocksFees",
        },
        {
          monthIndex: 1,
          amount: 91.56,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          monthIndex: 1,
          amount: 288.31,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          monthIndex: 1,
          amount: 984.78,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          monthIndex: 1,
          amount: 106.06,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          monthIndex: 1,
          amount: 314,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          monthIndex: 1,
          amount: 250.14,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          monthIndex: 1,
          amount: 11014,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          monthIndex: 1,
          amount: 2203,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          monthIndex: 1,
          amount: 3073,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurancePremium",
        },
        {
          monthIndex: 1,
          amount: 0.02,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "stocksFees",
        },
        {
          monthIndex: 1,
          amount: 91.56,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          monthIndex: 1,
          amount: 260.31,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          monthIndex: 1,
          amount: 1159.86,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          monthIndex: 1,
          amount: 106.06,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          monthIndex: 1,
          amount: 314,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          monthIndex: 1,
          amount: 250.14,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          monthIndex: 1,
          amount: 11014,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          monthIndex: 1,
          amount: 2203,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          monthIndex: 1,
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
      firstMonthGains,
      [
        {
          monthIndex: 0,
          amount: 16309.09,
          category: "renter",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          monthIndex: 0,
          amount: 73.54,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          monthIndex: 0,
          amount: 11157.8,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 110136,
        },
        {
          monthIndex: 0,
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
      secondMonthGains,
      [
        {
          monthIndex: 1,
          amount: 656.98,
          category: "renter",
          group: "monthlyGains",
          variable: "stocksGains",
        },
        {
          monthIndex: 1,
          amount: 529.45,
          category: "renter",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          monthIndex: 1,
          amount: 2.96,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "stocksGains",
        },
        {
          monthIndex: 1,
          amount: 73.54,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          monthIndex: 1,
          amount: 1047.63,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 111039.12,
        },
        {
          monthIndex: 1,
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

  await t.step(
    "totals monthlyGains month 1 matches manually computed",
    async () => {
      const totalsFromFunction = Object.fromEntries(
        ["renter", "buyerFixed", "buyerVariable"].map((cat) => [
          cat,
          results.find((d) =>
            d.group === "totals" &&
            d.variable === "monthlyGains" &&
            d.monthIndex === 1 &&
            d.category === cat
          )?.amount,
        ]),
      );
      assertEquals(totalsFromFunction, secondMonthGainsTotalPerCategory);
    },
  );

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
      cumulativeGainsLastMonth,
      [
        {
          monthIndex: 299,
          amount: 108253.42,
          category: "renter",
          group: "cumulativeGains",
          variable: "tfsaGains",
        },
        {
          monthIndex: 299,
          amount: 83062.92,
          category: "renter",
          group: "cumulativeGains",
          variable: "tfsaContribution",
        },
        {
          monthIndex: 299,
          amount: 243448.85,
          category: "renter",
          group: "cumulativeGains",
          variable: "stocksGains",
        },
        {
          monthIndex: 299,
          amount: 63935.07,
          category: "renter",
          group: "cumulativeGains",
          variable: "newStocks",
        },
        {
          monthIndex: 299,
          amount: 17633.09,
          category: "buyerFixed",
          group: "cumulativeGains",
          variable: "stocksGains",
        },
        {
          monthIndex: 299,
          amount: 4412.3,
          category: "buyerFixed",
          group: "cumulativeGains",
          variable: "newStocks",
        },
        {
          monthIndex: 299,
          amount: 425585,
          category: "buyerFixed",
          group: "cumulativeGains",
          variable: "homeEquityGains",
        },
        {
          monthIndex: 299,
          amount: 24592.94,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "tfsaGains",
        },
        {
          monthIndex: 299,
          amount: 19319.46,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "tfsaContribution",
        },
        {
          monthIndex: 299,
          amount: 7548.35,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "stocksGains",
        },
        {
          monthIndex: 299,
          amount: 2536.44,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "newStocks",
        },
        {
          monthIndex: 299,
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

  await t.step(
    "totals cumulativeGains last month matches manually computed",
    async () => {
      const totalsFromFunction = Object.fromEntries(
        ["renter", "buyerFixed", "buyerVariable"].map((cat) => [
          cat,
          results.find((d) =>
            d.group === "totals" &&
            d.variable === "cumulativeGains" &&
            d.monthIndex === (numberOfYears * 12) - 1 &&
            d.category === cat
          )?.amount,
        ]),
      );
      assertEquals(
        totalsFromFunction,
        cumulativeGainsLastMonthTotalPerCategory,
      );
    },
  );

  // We want to ensure that starting on 2009, the buyer's TFSA gains start accumulating
  const cumulativeGainsBeforeTFSA = cumulativeGains.filter((d) =>
    d.monthIndex === 95 && d.group === "cumulativeGains"
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
      assetsLastMonth,
      [
        {
          monthIndex: 299,
          amount: 191316.34,
          category: "renter",
          group: "assets",
          variable: "tfsa",
        },
        {
          monthIndex: 299,
          amount: 307383.92,
          category: "renter",
          group: "assets",
          variable: "stocks",
        },
        {
          monthIndex: 299,
          amount: 509,
          category: "renter",
          group: "assets",
          variable: "securityDeposit",
        },
        {
          monthIndex: 299,
          amount: 22045.39,
          category: "buyerFixed",
          group: "assets",
          variable: "stocks",
        },
        {
          monthIndex: 299,
          amount: 425585,
          category: "buyerFixed",
          group: "assets",
          variable: "homeEquity",
        },
        {
          monthIndex: 299,
          amount: 43912.4,
          category: "buyerVariable",
          group: "assets",
          variable: "tfsa",
        },
        {
          monthIndex: 299,
          amount: 10084.79,
          category: "buyerVariable",
          group: "assets",
          variable: "stocks",
        },
        {
          monthIndex: 299,
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

  await t.step(
    "totals assets last month matches manually computed",
    async () => {
      const totalsFromFunction = Object.fromEntries(
        ["renter", "buyerFixed", "buyerVariable"].map((cat) => [
          cat,
          results.find((d) =>
            d.group === "totals" &&
            d.variable === "assets" &&
            d.monthIndex === (numberOfYears * 12) - 1 &&
            d.category === cat
          )?.amount,
        ]),
      );
      assertEquals(totalsFromFunction, assetsLastMonthTotalPerCategory);
    },
  );

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
      saleCostsLastMonth,
      [
        {
          monthIndex: 299,
          amount: 53722,
          category: "renter",
          group: "saleCosts",
          variable: "stockTaxes",
        },
        {
          monthIndex: 299,
          amount: 3185,
          category: "buyerFixed",
          group: "saleCosts",
          variable: "stockTaxes",
        },
        {
          monthIndex: 299,
          amount: 19572.65,
          category: "buyerFixed",
          group: "saleCosts",
          variable: "homeSellingCommission",
        },
        {
          monthIndex: 299,
          amount: 2296.32,
          category: "buyerFixed",
          group: "saleCosts",
          variable: "homeSellingFixedFees",
        },
        {
          monthIndex: 299,
          amount: 1364,
          category: "buyerVariable",
          group: "saleCosts",
          variable: "stockTaxes",
        },
        {
          monthIndex: 299,
          amount: 19572.65,
          category: "buyerVariable",
          group: "saleCosts",
          variable: "homeSellingCommission",
        },
        {
          monthIndex: 299,
          amount: 2296.32,
          category: "buyerVariable",
          group: "saleCosts",
          variable: "homeSellingFixedFees",
        },
        {
          monthIndex: 299,
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

  await t.step(
    "totals saleCosts last month matches manually computed",
    async () => {
      const totalsFromFunction = Object.fromEntries(
        ["renter", "buyerFixed", "buyerVariable"].map((cat) => [
          cat,
          results.find((d) =>
            d.group === "totals" &&
            d.variable === "saleCosts" &&
            d.monthIndex === (numberOfYears * 12) - 1 &&
            d.category === cat
          )?.amount,
        ]),
      );
      assertEquals(totalsFromFunction, saleCostsLastMonthTotalPerCategory);
    },
  );

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
      saleNetGainsLastMonth,
      [
        {
          monthIndex: 299,
          amount: 253661.92,
          category: "renter",
          group: "saleNetGains",
          variable: "stockSellingGains",
        },
        {
          monthIndex: 299,
          amount: 191316.34,
          category: "renter",
          group: "saleNetGains",
          variable: "tfsaSellingGains",
        },
        {
          monthIndex: 299,
          amount: 509,
          category: "renter",
          group: "saleNetGains",
          variable: "securityDeposit",
        },
        {
          monthIndex: 299,
          amount: 18860.39,
          category: "buyerFixed",
          group: "saleNetGains",
          variable: "stockSellingGains",
        },
        {
          monthIndex: 299,
          amount: 403716.03,
          category: "buyerFixed",
          group: "saleNetGains",
          variable: "homeSellingGains",
        },
        {
          monthIndex: 299,
          amount: 8720.79,
          category: "buyerVariable",
          group: "saleNetGains",
          variable: "stockSellingGains",
        },
        {
          monthIndex: 299,
          amount: 43912.4,
          category: "buyerVariable",
          group: "saleNetGains",
          variable: "tfsaSellingGains",
        },
        {
          monthIndex: 299,
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

  await t.step(
    "totals saleNetGains last month matches manually computed",
    async () => {
      const totalsFromFunction = Object.fromEntries(
        ["renter", "buyerFixed", "buyerVariable"].map((cat) => [
          cat,
          results.find((d) =>
            d.group === "totals" &&
            d.variable === "saleNetGains" &&
            d.monthIndex === (numberOfYears * 12) - 1 &&
            d.category === cat
          )?.amount,
        ]),
      );
      assertEquals(totalsFromFunction, saleNetGainsLastMonthTotalPerCategory);
    },
  );

  // We check the home value on the last month
  const homeValues = results.filter((d) =>
    "homeValue" in d && d.monthIndex === (numberOfYears * 12) - 1
  );

  // console.log(homeValues);

  await t.step("home values last month", async () => {
    assertEquals(
      homeValues,
      [
        {
          monthIndex: 299,
          amount: -990.78,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 425585,
        },
        {
          monthIndex: 299,
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
      overallBalanceAfterSellingLastMonth,
      [
        {
          monthIndex: 299,
          amount: 246847.22,
          category: "renter",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          monthIndex: 299,
          amount: 81350.69,
          category: "buyerFixed",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          monthIndex: 299,
          amount: 131221.91,
          category: "buyerVariable",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
      ],
    );
  });

  const resultsWinVariableOnly = simulateRentVsBuy(params, {
    winVariableOnly: true,
    winVariable: "balanceAfterSelling",
  });

  // console.log(resultsFinalBalanceOnly.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("the final balance only option should work", async () => {
    assertEquals(
      resultsWinVariableOnly,
      [
        {
          monthIndex: 299,
          amount: 246847.22,
          category: "renter",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          monthIndex: 299,
          amount: 81350.69,
          category: "buyerFixed",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          monthIndex: 299,
          amount: 131221.91,
          category: "buyerVariable",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
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
    tfsaContributionsLastMonthDefault: tfsaContributionsLastMonthDefault,
    tfsaContributionsLastMonthCouple: tfsaContributionsLastMonthCouple,
    stocksLastMonthDefault: stocksLastMonthDefault,
    stocksLastMonthCouple: stocksLastMonthCouple,
    stocksGainsLastMonthDefault: stocksGainsLastMonthDefault,
    stocksGainsLastMonthCouple: stocksGainsLastMonthCouple,
    saleCostsLastMonthDefault: saleCostsLastMonthDefault,
    saleCostsLastMonthCouple: saleCostsLastMonthCouple,
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
              monthIndex: 299,
              amount: 102000,
              category: "renter",
              group: "cumulativeGains",
              variable: "tfsaContribution",
            },
            {
              monthIndex: 299,
              amount: 19319.46,
              category: "buyerVariable",
              group: "cumulativeGains",
              variable: "tfsaContribution",
            },
          ],
          tfsaContributionsLastMonthCouple: [
            {
              monthIndex: 299,
              amount: 184912.05,
              category: "renter",
              group: "cumulativeGains",
              variable: "tfsaContribution",
            },
            {
              monthIndex: 299,
              amount: 19319.46,
              category: "buyerVariable",
              group: "cumulativeGains",
              variable: "tfsaContribution",
            },
          ],
          stocksLastMonthDefault: [
            {
              monthIndex: 299,
              amount: 687590.91,
              category: "renter",
              group: "assets",
              variable: "stocks",
            },
            {
              monthIndex: 299,
              amount: 22045.39,
              category: "buyerFixed",
              group: "assets",
              variable: "stocks",
            },
            {
              monthIndex: 299,
              amount: 10084.79,
              category: "buyerVariable",
              group: "assets",
              variable: "stocks",
            },
          ],
          stocksLastMonthCouple: [
            {
              monthIndex: 299,
              amount: 503282.45,
              category: "renter",
              group: "assets",
              variable: "stocks",
            },
            {
              monthIndex: 299,
              amount: 22045.39,
              category: "buyerFixed",
              group: "assets",
              variable: "stocks",
            },
            {
              monthIndex: 299,
              amount: 10084.79,
              category: "buyerVariable",
              group: "assets",
              variable: "stocks",
            },
          ],
          stocksGainsLastMonthDefault: [
            {
              monthIndex: 299,
              amount: 497825.6,
              category: "renter",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
            {
              monthIndex: 299,
              amount: 17633.09,
              category: "buyerFixed",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
            {
              monthIndex: 299,
              amount: 7548.35,
              category: "buyerVariable",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
          ],
          stocksGainsLastMonthCouple: [
            {
              monthIndex: 299,
              amount: 396429.19,
              category: "renter",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
            {
              monthIndex: 299,
              amount: 17633.09,
              category: "buyerFixed",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
            {
              monthIndex: 299,
              amount: 7548.35,
              category: "buyerVariable",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
          ],
          saleCostsLastMonthDefault: [
            {
              monthIndex: 299,
              amount: 119745,
              category: "renter",
              group: "saleCosts",
              variable: "stockTaxes",
            },
            {
              monthIndex: 299,
              amount: 3185,
              category: "buyerFixed",
              group: "saleCosts",
              variable: "stockTaxes",
            },
            {
              monthIndex: 299,
              amount: 1364,
              category: "buyerVariable",
              group: "saleCosts",
              variable: "stockTaxes",
            },
          ],
          saleCostsLastMonthCouple: [
            {
              monthIndex: 299,
              amount: 84982,
              category: "renter",
              group: "saleCosts",
              variable: "stockTaxes",
            },
            {
              monthIndex: 299,
              amount: 3184,
              category: "buyerFixed",
              group: "saleCosts",
              variable: "stockTaxes",
            },
            {
              monthIndex: 299,
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

Deno.test("simulateRentVsBuy: annualInvestmentFeeRate should reduce capital gains taxes on stocks", () => {
  const params = getParams("Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const lastMonthIndex = params.numberOfYears * 12 - 1;

  const resultsNoFee = simulateRentVsBuy({
    ...params,
    annualInvestmentFeeRate: 0,
  });
  const resultsWithFee = simulateRentVsBuy({
    ...params,
    annualInvestmentFeeRate: 0.02,
  });

  // Fees reduce the stock balance month-over-month, so capital gains (and thus
  // capital gains taxes) must be strictly lower when fees are charged.
  const stockTaxesNoFee = resultsNoFee
    .filter((d) =>
      d.group === "saleCosts" && d.variable === "stockTaxes" &&
      d.monthIndex === lastMonthIndex
    )
    .map((d) => d.amount);
  const stockTaxesWithFee = resultsWithFee
    .filter((d) =>
      d.group === "saleCosts" && d.variable === "stockTaxes" &&
      d.monthIndex === lastMonthIndex
    )
    .map((d) => d.amount);

  assert(stockTaxesNoFee.length > 0, "expected stockTaxes rows with no fee");
  assert(stockTaxesWithFee.length > 0, "expected stockTaxes rows with fee");

  for (let i = 0; i < stockTaxesNoFee.length; i++) {
    assert(
      stockTaxesWithFee[i] < stockTaxesNoFee[i],
      `stockTaxes[${i}]: expected ${stockTaxesWithFee[i]} < ${
        stockTaxesNoFee[i]
      }`,
    );
  }
});

Deno.test("simulateRentVsBuy: higher employmentIncome should result in higher capital gains taxes", () => {
  const params = getParams("Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const nbMonths = params.numberOfYears * 12;
  const lastMonthIndex = nbMonths - 1;

  // Scenario 1: Low constant income
  const resultsLowIncome = simulateRentVsBuy({
    ...params,
    values: {
      ...params.values,
      employmentIncome: new Array(nbMonths).fill(30_000),
    },
  });

  // Scenario 2: High constant income
  const resultsHighIncome = simulateRentVsBuy({
    ...params,
    values: {
      ...params.values,
      employmentIncome: new Array(nbMonths).fill(250_000),
    },
  });

  const getStockTaxes = (results: any[]) =>
    results
      .filter((d) =>
        d.group === "saleCosts" && d.variable === "stockTaxes" &&
        d.monthIndex === lastMonthIndex
      )
      .map((d) => d.amount);

  const taxesLow = getStockTaxes(resultsLowIncome);
  const taxesHigh = getStockTaxes(resultsHighIncome);

  assert(taxesLow.length > 0);
  assert(taxesHigh.length > 0);

  for (let i = 0; i < taxesLow.length; i++) {
    // Higher income = higher marginal tax rate = higher capital gains tax
    assert(
      taxesHigh[i] > taxesLow[i],
      `Category index ${i}: expected higher taxes (${taxesHigh[i]}) for high income than for low income (${taxesLow[i]})`,
    );
  }

  // Scenario 3: Growing income (starts low, ends high)
  const growingIncome = new Array(nbMonths).fill(0).map((_, i) =>
    30_000 + (i / nbMonths) * 200_000
  );
  const resultsGrowingIncome = simulateRentVsBuy({
    ...params,
    values: {
      ...params.values,
      employmentIncome: growingIncome,
    },
  });

  const taxesGrowing = getStockTaxes(resultsGrowingIncome);

  for (let i = 0; i < taxesLow.length; i++) {
    // Growing income ends at 230k, so final sale tax should be significantly higher than constant 30k
    assert(
      taxesGrowing[i] > taxesLow[i],
      `Category index ${i}: expected higher taxes (${taxesGrowing[i]}) for growing income than for static low income (${taxesLow[i]})`,
    );
  }
});

