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
    city: "Toronto",
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
      firstTimeOwner: true,
      investsSavings: true,
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

Deno.test("simulateRentVsBuy: buyer investments should be zero when investsSavings is false", () => {
  const years = 5;
  const rates = {
    marketReturnRate: new Array(years * 12).fill(0.005),
    rentIncrease: new Array(years * 12).fill(0.1), // Very high rent increase to make renter more expensive
    ownerInsuranceIncrease: new Array(years * 12).fill(0),
    renterInsuranceIncrease: new Array(years * 12).fill(0),
    maintenanceIncrease: new Array(years * 12).fill(0),
    propertyTaxIncrease: new Array(years * 12).fill(0),
    condoFeeIncrease: new Array(years * 12).fill(0),
    appreciationIncrease: new Array(years * 12).fill(0),
    sellingFixedFeesIncrease: new Array(years * 12).fill(0),
  };

  const values = {
    employmentIncome: new Array(years * 12).fill(100_000),
    fiveYearInterestRates: new Array(years * 12).fill(0.05),
    fourYearInterestRates: new Array(years * 12).fill(0.05),
    threeYearInterestRates: new Array(years * 12).fill(0.05),
    twoYearInterestRates: new Array(years * 12).fill(0.05),
    oneYearInterestRates: new Array(years * 12).fill(0.05),
    variableInterestRates: new Array(years * 12).fill(0.06),
  };

  const commonParams = {
    startingYear: 2024,
    numberOfYears: years,
    tfsaContributions: true,
    annualInvestmentFeeRate: 0,
    couple: false,
    city: "Toronto" as const,
    renter: {
      startingMonthlyRent: 2000,
      securityDeposit: 0,
      startingMonthlyInsurance: 0,
    },
    buyer: {
      downPayment: 100000,
      purchasePrice: 500000,
      fixedRateAdjustment: 0,
      variableRateAdjustment: 0,
      firstTimeOwner: true,
      investsSavings: true,
      purchaseFixedFees: 0,
      startingAnnualMaintenanceCost: 0,
      startingAnnualPropertyTax: 0,
      startingMonthlyCondoFees: 0,
      startingMonthlyInsurance: 0,
      sellingFixedFees: 0,
      sellingCommissionRate: 0,
      floorRate: 0,
    },
    values,
    rates,
  };

  // Run with default (investsSavings = true)
  const resultsWithSavings = simulateRentVsBuy(commonParams, {
    winVariableOnly: false,
  });

  // Run with investsSavings = false
  const resultsWithoutSavings = simulateRentVsBuy({
    ...commonParams,
    buyer: { ...commonParams.buyer, investsSavings: false },
  }, {
    winVariableOnly: false,
  });

  const lastMonth = years * 12 - 1;

  // Debug: print results categories to see what we got
  // console.log("Unique categories:", [...new Set(resultsWithSavings.map(r => r.category))]);
  // console.log("Unique groups:", [...new Set(resultsWithSavings.map(r => r.group))]);
  // console.log("Unique variables:", [...new Set(resultsWithSavings.map(r => r.variable))]);

  const buyerFixedWith = resultsWithSavings.find((r) =>
    r.category === "buyerFixed" && r.group === "assets" &&
    r.variable === "tfsa" &&
    r.monthIndex === lastMonth
  );

  const buyerFixedWithout = resultsWithoutSavings.find((r) =>
    r.category === "buyerFixed" && r.group === "assets" &&
    r.variable === "tfsa" &&
    r.monthIndex === lastMonth
  );

  // If tfsa was never recorded (because it's 0 and was optimized out), we treat it as 0
  const buyerFixedWithAmount = buyerFixedWith?.amount ?? 0;
  const buyerFixedWithoutAmount = buyerFixedWithout?.amount ?? 0;

  const buyerFixedStocksWith = resultsWithSavings.find((r) =>
    r.category === "buyerFixed" && r.group === "assets" &&
    r.variable === "stocks" &&
    r.monthIndex === lastMonth
  );
  const buyerFixedStocksWithout = resultsWithoutSavings.find((r) =>
    r.category === "buyerFixed" && r.group === "assets" &&
    r.variable === "stocks" &&
    r.monthIndex === lastMonth
  );

  const buyerFixedStocksWithAmount = buyerFixedStocksWith?.amount ?? 0;
  const buyerFixedStocksWithoutAmount = buyerFixedStocksWithout?.amount ?? 0;

  // When high rent makes the renter the "maxMonthlyExpenses", the buyer usually gets "savings" to invest.
  // With investsSavings: false, these should stay at 0 (or much lower than the version with savings).
  assert(buyerFixedWithoutAmount <= buyerFixedWithAmount);
  assertEquals(buyerFixedWithoutAmount, 0);
  assertEquals(buyerFixedStocksWithoutAmount, 0);
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
    city: "Toronto",
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
      firstTimeOwner: true,
      investsSavings: true,
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
  const params = getParams("Montreal", {
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

  //console.log(mortgageRatesFixedBuyer);

  await t.step("mortgage rates fixed buyer", async () => {
    assertEquals(mortgageRatesFixedBuyer, [
      {
        monthIndex: 0,
        amount: 148.26,
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
        amount: 508.03,
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
        amount: 240.74,
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
        amount: 333.02,
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
        amount: 326.94,
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
        amount: 205.67,
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
        amount: 395.7,
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
        amount: 123.25,
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
        amount: 451.47,
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
        amount: 69.39,
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
        amount: 123.19,
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
        amount: 608.91,
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
        amount: 198.07,
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
        amount: 303.05,
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
        amount: 284.94,
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
        amount: 138.89,
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
        amount: 329.64,
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
        amount: 87.23,
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
        amount: 386.1,
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
        amount: 42.71,
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
          amount: 148.26,
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
          amount: 508.03,
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
          amount: 786.86,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "landTransferTax",
        },
        {
          monthIndex: 0,
          amount: 276.57,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "insurancePremiumTax",
        },
        {
          monthIndex: 0,
          amount: 123.19,
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
          amount: 608.91,
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
          amount: 786.86,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "landTransferTax",
        },
        {
          monthIndex: 0,
          amount: 276.57,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "insurancePremiumTax",
        },
      ],
    );
  });

  const firstMonthExpensesTotalPerCategory = firstMonthExpenses.reduce(
    (acc, d) => {
      const key = d.category;
      acc[key] = Math.round(((acc[key] || 0) + d.amount) * 100) / 100;
      return acc;
    },
    {} as Record<string, number>,
  );

  await t.step("first month expenses total per category", async () => {
    assertEquals(firstMonthExpensesTotalPerCategory, {
      renter: 1071,
      buyerFixed: 15316.72,
      buyerVariable: 15392.53,
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

  await t.step(
    "monthlyRecurringExpenses + monthlyNonRecurringExpenses totals equal monthlyExpenses total",
    async () => {
      for (const cat of ["renter", "buyerFixed", "buyerVariable"] as const) {
        for (
          let mi = 0;
          mi < 3;
          mi++
        ) {
          const expTotal = results.find((d) =>
            d.group === "totals" && d.variable === "monthlyExpenses" &&
            d.monthIndex === mi && d.category === cat
          )?.amount ?? 0;
          const recurringTotal = results.find((d) =>
            d.group === "totals" && d.variable === "monthlyRecurringExpenses" &&
            d.monthIndex === mi && d.category === cat
          )?.amount ?? 0;
          const nonRecurringTotal = results.find((d) =>
            d.group === "totals" &&
            d.variable === "monthlyNonRecurringExpenses" &&
            d.monthIndex === mi && d.category === cat
          )?.amount ?? 0;
          assertEquals(
            Math.round((recurringTotal + nonRecurringTotal) * 100) / 100,
            expTotal,
            `cat=${cat} month=${mi}: recurring+nonRecurring should equal monthlyExpenses total`,
          );
        }
      }
    },
  );

  await t.step(
    "monthlyNonRecurringExpenses variables are nonzero only at month 0",
    async () => {
      const nonRecurringAfterMonth0 = results.filter((d) =>
        d.group === "monthlyNonRecurringExpenses" &&
        d.monthIndex > 0 &&
        d.amount !== 0
      );
      assertEquals(
        nonRecurringAfterMonth0,
        [],
        "No nonRecurring expense variables should be nonzero after month 0",
      );
    },
  );

  await t.step(
    "monthlyRecurringExpenses variables present at month 1 for all categories",
    async () => {
      for (const cat of ["renter", "buyerFixed", "buyerVariable"] as const) {
        const recurringMonth1 = results.filter((d) =>
          d.group === "monthlyRecurringExpenses" &&
          d.monthIndex === 1 &&
          d.category === cat
        );
        assertEquals(
          recurringMonth1.length > 0,
          true,
          `Expected monthlyRecurringExpenses records at month 1 for ${cat}`,
        );
      }
    },
  );

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
          amount: 3.1,
          category: "renter",
          group: "monthlyExpenses",
          variable: "stocksFees",
        },
        {
          monthIndex: 1,
          amount: 148.99,
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
          amount: 507.29,
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
          amount: 145.19,
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
          amount: 586.91,
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
      renter: 565.49,
      buyerFixed: 1038.06,
      buyerVariable: 1113.86,
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
          amount: 3032.71,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "tfsaFees",
        },
        {
          monthIndex: 299,
          amount: 7558.28,
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
          amount: 102195.01,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          monthIndex: 299,
          amount: 65953.28,
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
          amount: 786.86,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "landTransferTax",
        },
        {
          monthIndex: 299,
          amount: 276.57,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurancePremiumTax",
        },
        {
          monthIndex: 299,
          amount: 564.32,
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
          amount: 100808.01,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          monthIndex: 299,
          amount: 49355.7,
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
          amount: 786.86,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "landTransferTax",
        },
        {
          monthIndex: 299,
          amount: 276.57,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurancePremiumTax",
        },
        {
          monthIndex: 299,
          amount: 690.17,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "tfsaFees",
        },
        {
          monthIndex: 299,
          amount: 234.06,
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
        renter: 209231.03,
        buyerFixed: 344836.79,
        buyerVariable: 327212.12,
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
          amount: 3.1,
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
          amount: 297.25,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          monthIndex: 1,
          amount: 1015.32,
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
          amount: 786.86,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "landTransferTax",
        },
        {
          monthIndex: 1,
          amount: 276.57,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurancePremiumTax",
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
          amount: 268.38,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          monthIndex: 1,
          amount: 1195.82,
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
          amount: 786.86,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "landTransferTax",
        },
        {
          monthIndex: 1,
          amount: 276.57,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurancePremiumTax",
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
          amount: 14321.53,
          category: "renter",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          monthIndex: 0,
          amount: 75.81,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          monthIndex: 0,
          amount: 8089.26,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 110136,
        },
        {
          monthIndex: 0,
          amount: 8064.19,
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
          amount: 576.92,
          category: "renter",
          group: "monthlyGains",
          variable: "stocksGains",
        },
        {
          monthIndex: 1,
          amount: 551.47,
          category: "renter",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          monthIndex: 1,
          amount: 3.05,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "stocksGains",
        },
        {
          monthIndex: 1,
          amount: 75.82,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          monthIndex: 1,
          amount: 1052.11,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 111039.12,
        },
        {
          monthIndex: 1,
          amount: 1048.31,
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
      renter: 1128.39,
      buyerFixed: 1130.98,
      buyerVariable: 1048.31,
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
          amount: 111426.57,
          category: "renter",
          group: "cumulativeGains",
          variable: "tfsaGains",
        },
        {
          monthIndex: 299,
          amount: 85900.02,
          category: "renter",
          group: "cumulativeGains",
          variable: "tfsaContribution",
        },
        {
          monthIndex: 299,
          amount: 243148.53,
          category: "renter",
          group: "cumulativeGains",
          variable: "stocksGains",
        },
        {
          monthIndex: 299,
          amount: 64281.58,
          category: "renter",
          group: "cumulativeGains",
          variable: "newStocks",
        },
        {
          monthIndex: 299,
          amount: 18180.38,
          category: "buyerFixed",
          group: "cumulativeGains",
          variable: "stocksGains",
        },
        {
          monthIndex: 299,
          amount: 4549.17,
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
          amount: 25355.58,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "tfsaGains",
        },
        {
          monthIndex: 299,
          amount: 19918.68,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "tfsaContribution",
        },
        {
          monthIndex: 299,
          amount: 7782.15,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "stocksGains",
        },
        {
          monthIndex: 299,
          amount: 2615.07,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "newStocks",
        },
        {
          monthIndex: 299,
          amount: 424198.12,
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
        renter: 504756.7,
        buyerFixed: 448314.55,
        buyerVariable: 479869.6,
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
      705,
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
          amount: 197326.59,
          category: "renter",
          group: "assets",
          variable: "tfsa",
        },
        {
          monthIndex: 299,
          amount: 307430.11,
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
          amount: 22729.55,
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
          amount: 45274.26,
          category: "buyerVariable",
          group: "assets",
          variable: "tfsa",
        },
        {
          monthIndex: 299,
          amount: 10397.22,
          category: "buyerVariable",
          group: "assets",
          variable: "stocks",
        },
        {
          monthIndex: 299,
          amount: 424198.12,
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
      renter: 505265.7,
      buyerFixed: 448314.55,
      buyerVariable: 479869.6,
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
          amount: 53646,
          category: "renter",
          group: "saleCosts",
          variable: "stockTaxes",
          employmentIncome: 75000,
        },
        {
          monthIndex: 299,
          amount: 3284,
          category: "buyerFixed",
          group: "saleCosts",
          variable: "stockTaxes",
          employmentIncome: 75000,
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
          amount: 1406,
          category: "buyerVariable",
          group: "saleCosts",
          variable: "stockTaxes",
          employmentIncome: 75000,
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
          amount: 1386.88,
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
      renter: 53646,
      buyerFixed: 25152.97,
      buyerVariable: 24661.85,
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
          amount: 253784.11,
          category: "renter",
          group: "saleNetGains",
          variable: "stockSellingGains",
        },
        {
          monthIndex: 299,
          amount: 197326.59,
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
          amount: 19445.55,
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
          amount: 8991.22,
          category: "buyerVariable",
          group: "saleNetGains",
          variable: "stockSellingGains",
        },
        {
          monthIndex: 299,
          amount: 45274.26,
          category: "buyerVariable",
          group: "saleNetGains",
          variable: "tfsaSellingGains",
        },
        {
          monthIndex: 299,
          amount: 402329.15,
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
      renter: 451619.7,
      buyerFixed: 423161.58,
      buyerVariable: 456594.63,
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
          amount: -975.16,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 425585,
        },
        {
          monthIndex: 299,
          amount: -1072.15,
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
          amount: 242388.67,
          category: "renter",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          monthIndex: 299,
          amount: 78324.79,
          category: "buyerFixed",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          monthIndex: 299,
          amount: 129382.51,
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
          amount: 242388.67,
          category: "renter",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          monthIndex: 299,
          amount: 78324.79,
          category: "buyerFixed",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          monthIndex: 299,
          amount: 129382.51,
          category: "buyerVariable",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
      ],
    );
  });
});

Deno.test("should compute the total expenses and savings of a renter and buyer in Montreal with the couple option", async (t) => {
  const params = getParams("Montreal", {
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
              amount: 19918.68,
              category: "buyerVariable",
              group: "cumulativeGains",
              variable: "tfsaContribution",
            },
          ],
          tfsaContributionsLastMonthCouple: [
            {
              monthIndex: 299,
              amount: 187364.78,
              category: "renter",
              group: "cumulativeGains",
              variable: "tfsaContribution",
            },
            {
              monthIndex: 299,
              amount: 19918.68,
              category: "buyerVariable",
              group: "cumulativeGains",
              variable: "tfsaContribution",
            },
          ],
          stocksLastMonthDefault: [
            {
              monthIndex: 299,
              amount: 693598.82,
              category: "renter",
              group: "assets",
              variable: "stocks",
            },
            {
              monthIndex: 299,
              amount: 22729.55,
              category: "buyerFixed",
              group: "assets",
              variable: "stocks",
            },
            {
              monthIndex: 299,
              amount: 10397.22,
              category: "buyerVariable",
              group: "assets",
              variable: "stocks",
            },
          ],
          stocksLastMonthCouple: [
            {
              monthIndex: 299,
              amount: 504578.77,
              category: "renter",
              group: "assets",
              variable: "stocks",
            },
            {
              monthIndex: 299,
              amount: 22729.55,
              category: "buyerFixed",
              group: "assets",
              variable: "stocks",
            },
            {
              monthIndex: 299,
              amount: 10397.22,
              category: "buyerVariable",
              group: "assets",
              variable: "stocks",
            },
          ],
          stocksGainsLastMonthDefault: [
            {
              monthIndex: 299,
              amount: 500649.9,
              category: "renter",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
            {
              monthIndex: 299,
              amount: 18180.38,
              category: "buyerFixed",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
            {
              monthIndex: 299,
              amount: 7782.15,
              category: "buyerVariable",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
          ],
          stocksGainsLastMonthCouple: [
            {
              monthIndex: 299,
              amount: 396994.63,
              category: "renter",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
            {
              monthIndex: 299,
              amount: 18180.38,
              category: "buyerFixed",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
            {
              monthIndex: 299,
              amount: 7782.15,
              category: "buyerVariable",
              group: "cumulativeGains",
              variable: "stocksGains",
            },
          ],
          saleCostsLastMonthDefault: [
            {
              monthIndex: 299,
              amount: 120499,
              category: "renter",
              group: "saleCosts",
              variable: "stockTaxes",
              employmentIncome: 75000,
            },
            {
              monthIndex: 299,
              amount: 3284,
              category: "buyerFixed",
              group: "saleCosts",
              variable: "stockTaxes",
              employmentIncome: 75000,
            },
            {
              monthIndex: 299,
              amount: 1406,
              category: "buyerVariable",
              group: "saleCosts",
              variable: "stockTaxes",
              employmentIncome: 75000,
            },
          ],
          saleCostsLastMonthCouple: [
            {
              monthIndex: 299,
              amount: 85116,
              category: "renter",
              group: "saleCosts",
              variable: "stockTaxes",
              employmentIncome: 75000,
            },
            {
              monthIndex: 299,
              amount: 3282,
              category: "buyerFixed",
              group: "saleCosts",
              variable: "stockTaxes",
              employmentIncome: 75000,
            },
            {
              monthIndex: 299,
              amount: 1404,
              category: "buyerVariable",
              group: "saleCosts",
              variable: "stockTaxes",
              employmentIncome: 75000,
            },
          ],
        },
      );
    },
  );
});

Deno.test("simulateRentVsBuy: annualInvestmentFeeRate should reduce capital gains taxes on stocks", () => {
  const params = getParams("Montreal", {
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
  const params = getParams("Montreal", {
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
      `Category index ${i}: expected higher taxes (${
        taxesHigh[i]
      }) for high income than for low income (${taxesLow[i]})`,
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
      `Category index ${i}: expected higher taxes (${
        taxesGrowing[i]
      }) for growing income than for static low income (${taxesLow[i]})`,
    );
  }
});

Deno.test("simulateRentVsBuy: employmentIncome in results should match the input trajectory", () => {
  const params = getParams("Montreal", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const nbMonths = params.numberOfYears * 12;

  // Linear growing income: $50,000 + $1,000 per year approx
  const growingIncome = new Array(nbMonths).fill(0).map((_, i) =>
    50_000 + i * 100
  );

  const results = simulateRentVsBuy({
    ...params,
    values: {
      ...params.values,
      employmentIncome: growingIncome,
    },
  });

  // Filter for stockTaxes records where income should be present
  const stockTaxesRecords = results.filter((d) =>
    d.group === "saleCosts" && d.variable === "stockTaxes" && d.amount > 0
  );

  assert(
    stockTaxesRecords.length > 10,
    "Expected at least some months with stock taxes",
  );

  for (const record of stockTaxesRecords) {
    const incomeInRecord = (record as any).employmentIncome;
    assert(
      incomeInRecord !== undefined,
      "employmentIncome should be present in stockTaxes records",
    );

    const expectedValue = 50_000 + record.monthIndex * 100;
    assertEquals(
      incomeInRecord,
      expectedValue,
      `Month ${record.monthIndex}: expected exact income ${expectedValue}, got ${incomeInRecord}`,
    );
  }

  // Also check that it's increasing in the results
  const renterRecords = stockTaxesRecords.filter((d) => d.category === "renter")
    .sort((a, b) => a.monthIndex - b.monthIndex);

  if (renterRecords.length >= 2) {
    const firstIncome = (renterRecords[0] as any).employmentIncome;
    const lastIncome =
      (renterRecords[renterRecords.length - 1] as any).employmentIncome;
    assert(
      lastIncome > firstIncome,
      `Expected income in results to increase (${lastIncome} > ${firstIncome})`,
    );
  }
});

Deno.test("simulateRentVsBuy: adjustToInflation should discount future values", () => {
  const years = 10;
  const inflationRate = 0.05; // 5% monthly (extreme for testing)

  const rates = {
    marketReturnRate: new Array(years * 12).fill(0),
    rentIncrease: new Array(years * 12).fill(inflationRate),
    ownerInsuranceIncrease: new Array(years * 12).fill(0),
    renterInsuranceIncrease: new Array(years * 12).fill(0),
    maintenanceIncrease: new Array(years * 12).fill(0),
    propertyTaxIncrease: new Array(years * 12).fill(0),
    condoFeeIncrease: new Array(years * 12).fill(0),
    appreciationIncrease: new Array(years * 12).fill(0),
    sellingFixedFeesIncrease: new Array(years * 12).fill(0),
  };

  const values = {
    employmentIncome: new Array(years * 12).fill(0),
    fiveYearInterestRates: new Array(years * 12).fill(0.05),
    fourYearInterestRates: new Array(years * 12).fill(0.05),
    threeYearInterestRates: new Array(years * 12).fill(0.05),
    twoYearInterestRates: new Array(years * 12).fill(0.05),
    oneYearInterestRates: new Array(years * 12).fill(0.05),
    variableInterestRates: new Array(years * 12).fill(0.05),
  };

  const params = {
    startingYear: 2024,
    numberOfYears: years,
    tfsaContributions: false,
    annualInvestmentFeeRate: 0,
    couple: false,
    city: "Toronto" as const,
    renter: {
      startingMonthlyRent: 1000,
      securityDeposit: 0,
      startingMonthlyInsurance: 0,
    },
    buyer: {
      downPayment: 0,
      purchasePrice: 0,
      fixedRateAdjustment: 0,
      variableRateAdjustment: 0,
      firstTimeOwner: false,
      investsSavings: true,
      purchaseFixedFees: 0,
      startingAnnualMaintenanceCost: 0,
      startingAnnualPropertyTax: 0,
      startingMonthlyCondoFees: 0,
      startingMonthlyInsurance: 0,
      sellingFixedFees: 0,
      sellingCommissionRate: 0,
      floorRate: 0,
    },
    values,
    rates,
  };

  const resultsNormal = simulateRentVsBuy(params);
  const resultsAdjusted = simulateRentVsBuy(params, {
    adjustToInflation: "rentIncrease",
  });

  // Month 0 should be the same
  const rent0Normal = resultsNormal.find((r) =>
    r.monthIndex === 0 && r.variable === "rent"
  )?.amount;
  const rent0Adjusted = resultsAdjusted.find((r) =>
    r.monthIndex === 0 && r.variable === "rent"
  )?.amount;
  assertEquals(rent0Normal, 1000);
  assertEquals(rent0Adjusted, 1000);

  // At month 1, rent increased by 5% but is adjusted back
  // Normal: 1000 * 1.05 = 1050
  // Adjusted: (1000 * 1.05) / 1.05 = 1000
  const rent1Normal = resultsNormal.find((r) =>
    r.monthIndex === 1 && r.variable === "rent"
  )?.amount;
  const rent1Adjusted = resultsAdjusted.find((r) =>
    r.monthIndex === 1 && r.variable === "rent"
  )?.amount;
  assertEquals(rent1Normal, 1050);
  assertEquals(rent1Adjusted, 1000);

  // Check month 12 (1 year later)
  // Check month 12 (1 year later)
  const rent12Normal = resultsNormal.find((r) =>
    r.monthIndex === 12 && r.variable === "rent"
  )?.amount;
  const rent12Adjusted = resultsAdjusted.find((r) =>
    r.monthIndex === 12 && r.variable === "rent"
  )?.amount;
  // Let's check they are within 0.1 of 1000 to account for r2 rounding over 12 months.
  assert(rent12Normal! > 1700);
  assert(Math.abs(rent12Adjusted! - 1000) < 0.1);

  // Check month 60 (5 years later)
  const rent60Normal = resultsNormal.find((r) =>
    r.monthIndex === 60 && r.variable === "rent"
  )?.amount;
  const rent60Adjusted = resultsAdjusted.find((r) =>
    r.monthIndex === 60 && r.variable === "rent"
  )?.amount;
  // Let's just assert adjusted is very close to 1000 and nominal is much higher
  assert(rent60Normal! > 18000);
  assert(Math.abs(rent60Adjusted! - 1000) < 0.1);
});

Deno.test("simulateRentVsBuy: adjustToInflation should not discount one-time upfront costs in cumulativeExpenses", () => {
  const years = 5;
  const inflationRate = 0.05; // 5% per month (extreme, for clear verification)

  const rates = {
    marketReturnRate: new Array(years * 12).fill(0),
    rentIncrease: new Array(years * 12).fill(inflationRate),
    ownerInsuranceIncrease: new Array(years * 12).fill(0),
    renterInsuranceIncrease: new Array(years * 12).fill(0),
    maintenanceIncrease: new Array(years * 12).fill(0),
    propertyTaxIncrease: new Array(years * 12).fill(0),
    condoFeeIncrease: new Array(years * 12).fill(0),
    appreciationIncrease: new Array(years * 12).fill(0),
    sellingFixedFeesIncrease: new Array(years * 12).fill(0),
  };

  const values = {
    employmentIncome: new Array(years * 12).fill(80000),
    fiveYearInterestRates: new Array(years * 12).fill(0.05),
    fourYearInterestRates: new Array(years * 12).fill(0.05),
    threeYearInterestRates: new Array(years * 12).fill(0.05),
    twoYearInterestRates: new Array(years * 12).fill(0.05),
    oneYearInterestRates: new Array(years * 12).fill(0.05),
    variableInterestRates: new Array(years * 12).fill(0.05),
  };

  const purchaseFixedFees = 5000;
  const securityDeposit = 1500;

  const params = {
    startingYear: 2024,
    numberOfYears: years,
    tfsaContributions: false,
    annualInvestmentFeeRate: 0,
    couple: false,
    city: "Toronto" as const,
    renter: {
      startingMonthlyRent: 1000,
      securityDeposit,
      startingMonthlyInsurance: 0,
    },
    buyer: {
      downPayment: 100000,
      purchasePrice: 500000,
      fixedRateAdjustment: 0,
      variableRateAdjustment: 0,
      firstTimeOwner: false,
      investsSavings: false,
      purchaseFixedFees,
      startingAnnualMaintenanceCost: 0,
      startingAnnualPropertyTax: 0,
      startingMonthlyCondoFees: 0,
      startingMonthlyInsurance: 0,
      sellingFixedFees: 0,
      sellingCommissionRate: 0,
      floorRate: 0,
    },
    values,
    rates,
  };

  const resultsAdjusted = simulateRentVsBuy(params, {
    adjustToInflation: "rentIncrease",
  });
  const resultsNormal = simulateRentVsBuy(params);

  const finalMonth = years * 12 - 1;

  const getCumulative = (
    results: typeof resultsAdjusted,
    category: string,
    variable: string,
    monthIndex: number,
  ) =>
    results.find((r) =>
      r.category === category &&
      r.group === "cumulativeExpenses" &&
      r.variable === variable &&
      r.monthIndex === monthIndex
    )?.amount;

  // One-time costs must NOT be discounted: their cumulative value stays constant
  // regardless of how far into the simulation we are.
  assertEquals(
    getCumulative(resultsAdjusted, "buyerFixed", "purchaseFixedFees", 0),
    purchaseFixedFees,
  );
  assertEquals(
    getCumulative(resultsAdjusted, "buyerFixed", "purchaseFixedFees", 30),
    purchaseFixedFees,
  );
  assertEquals(
    getCumulative(
      resultsAdjusted,
      "buyerFixed",
      "purchaseFixedFees",
      finalMonth,
    ),
    purchaseFixedFees,
  );
  assertEquals(
    getCumulative(resultsAdjusted, "renter", "securityDeposit", 0),
    securityDeposit,
  );
  assertEquals(
    getCumulative(resultsAdjusted, "renter", "securityDeposit", 30),
    securityDeposit,
  );
  assertEquals(
    getCumulative(resultsAdjusted, "renter", "securityDeposit", finalMonth),
    securityDeposit,
  );

  // Recurring rent IS still discounted: adjusted cumulative rent at the final
  // month must be less than the nominal cumulative rent.
  const rentNormal = getCumulative(resultsNormal, "renter", "rent", finalMonth);
  const rentAdjusted = getCumulative(
    resultsAdjusted,
    "renter",
    "rent",
    finalMonth,
  );
  assert(rentAdjusted! < rentNormal!);
});

Deno.test("simulateRentVsBuy: adjustToInflation should discount home equity gains from appreciation", () => {
  const years = 10;
  const appreciationRate = 0.005; // 0.5% monthly
  const inflationRate = 0.003; // 0.3% monthly

  const rates = {
    marketReturnRate: new Array(years * 12).fill(0),
    rentIncrease: new Array(years * 12).fill(inflationRate),
    ownerInsuranceIncrease: new Array(years * 12).fill(0),
    renterInsuranceIncrease: new Array(years * 12).fill(0),
    maintenanceIncrease: new Array(years * 12).fill(0),
    propertyTaxIncrease: new Array(years * 12).fill(0),
    condoFeeIncrease: new Array(years * 12).fill(0),
    appreciationIncrease: new Array(years * 12).fill(appreciationRate),
    sellingFixedFeesIncrease: new Array(years * 12).fill(0),
  };

  const values = {
    employmentIncome: new Array(years * 12).fill(0),
    fiveYearInterestRates: new Array(years * 12).fill(0.05),
    fourYearInterestRates: new Array(years * 12).fill(0.05),
    threeYearInterestRates: new Array(years * 12).fill(0.05),
    twoYearInterestRates: new Array(years * 12).fill(0.05),
    oneYearInterestRates: new Array(years * 12).fill(0.05),
    variableInterestRates: new Array(years * 12).fill(0.05),
  };

  const params = {
    startingYear: 2024,
    numberOfYears: years,
    tfsaContributions: false,
    annualInvestmentFeeRate: 0,
    couple: false,
    city: "Toronto" as const,
    renter: {
      startingMonthlyRent: 1000,
      securityDeposit: 0,
      startingMonthlyInsurance: 0,
    },
    buyer: {
      downPayment: 100000,
      purchasePrice: 500000,
      fixedRateAdjustment: 0,
      variableRateAdjustment: 0,
      firstTimeOwner: false,
      investsSavings: false,
      purchaseFixedFees: 0,
      startingAnnualMaintenanceCost: 0,
      startingAnnualPropertyTax: 0,
      startingMonthlyCondoFees: 0,
      startingMonthlyInsurance: 0,
      sellingFixedFees: 0,
      sellingCommissionRate: 0,
      floorRate: 0,
    },
    values,
    rates,
  };

  const resultsNormal = simulateRentVsBuy(params);
  const resultsAdjusted = simulateRentVsBuy(params, {
    adjustToInflation: "rentIncrease",
  });

  const finalMonth = years * 12 - 1;

  const getHomeEquityGains = (
    results: typeof resultsNormal,
    monthIndex: number,
  ) =>
    results.find((r) =>
      r.category === "buyerFixed" &&
      r.group === "cumulativeGains" &&
      r.variable === "homeEquityGains" &&
      r.monthIndex === monthIndex
    )?.amount;

  // At month 0 the inflation multiplier is 1, so both should be equal
  assertEquals(
    getHomeEquityGains(resultsNormal, 0),
    getHomeEquityGains(resultsAdjusted, 0),
  );

  // At the final month, the adjusted cumulative home equity gains should be
  // lower than the nominal because the inflation multiplier deflates them.
  const normalGains = getHomeEquityGains(resultsNormal, finalMonth);
  const adjustedGains = getHomeEquityGains(resultsAdjusted, finalMonth);

  assert(normalGains !== undefined && normalGains > 0);
  assert(adjustedGains !== undefined && adjustedGains > 0);
  assert(
    adjustedGains < normalGains,
    `Deflated home equity gains ${adjustedGains} should be lower than nominal ${normalGains}`,
  );
});
