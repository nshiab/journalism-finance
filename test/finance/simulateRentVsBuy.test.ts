import { assertEquals } from "jsr:@std/assert";
import simulateRentVsBuy from "../../src/finance/simulateRentVsBuy.ts";
import makeCharts from "./helpers/makeCharts.ts";
import getParams from "./helpers/getParamsRentVsBuy.ts";
import { round } from "@nshiab/journalism-format";

function logFinalResults(
  results: ReturnType<typeof simulateRentVsBuy>,
  city: string,
) {
  console.log(`\nFinal results for ${city} after simulation:\n`);

  const maxMonth = Math.max(...results.map((r) => r.monthIndex));

  const finalSummary = results.filter((d) =>
    d.group === "summaryCumulative" && d.variable === "balanceAfterSelling" &&
    d.monthIndex === maxMonth
  );

  const tableData = finalSummary.map((entry) => ({
    Variable: entry.variable,
    Category: entry.category,
    Amount: entry.amount,
  })).sort((a, b) => a.Amount - b.Amount);

  console.table(tableData);
}

const numberOfYears = 25;

Deno.test("should compute the total expenses and savings of a renter and buyer in Montreal", async (t) => {
  const params = getParams("Montreal", "Quebec", {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  });

  console.log({ ...params, rates: "A lot", allRatesFiltered: "A lot" });

  const results = simulateRentVsBuy(params);
  logFinalResults(results, "Montreal");

  const mortgageRatesFixedBuyer = results.filter((d) =>
    [2000, 2005, 2010, 2015, 2020].includes(d.year) && d.month === 0 &&
    d.variable.includes("mortgage") && d.group === "monthlyExpenses" &&
    d.category === "buyerFixed"
  ).map((d) => ({
    ...d,
    date: d.date.toISOString(),
  }));

  await t.step("mortgage rates fixed buyer", async () => {
    assertEquals(mortgageRatesFixedBuyer, [
      {
        year: 2000,
        month: 0,
        monthIndex: 0,
        date: "2000-01-01T00:00:00.000Z",
        amount: 114.19,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0725,
        postedInterestRate: 0.0825,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2000,
        month: 0,
        monthIndex: 0,
        date: "2000-01-01T00:00:00.000Z",
        amount: 563.22,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0725,
        postedInterestRate: 0.0825,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2005,
        month: 0,
        monthIndex: 60,
        date: "2005-01-01T00:00:00.000Z",
        amount: 210.3,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0505,
        postedInterestRate: 0.0605,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2005,
        month: 0,
        monthIndex: 60,
        date: "2005-01-01T00:00:00.000Z",
        amount: 359.9,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0505,
        postedInterestRate: 0.0605,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2010,
        month: 0,
        monthIndex: 120,
        date: "2010-01-01T00:00:00.000Z",
        amount: 282.44,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0449,
        postedInterestRate: 0.0549,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2010,
        month: 0,
        monthIndex: 120,
        date: "2010-01-01T00:00:00.000Z",
        amount: 267.34,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0449,
        postedInterestRate: 0.0549,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2015,
        month: 0,
        monthIndex: 180,
        date: "2015-01-01T00:00:00.000Z",
        amount: 365.71,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0379,
        postedInterestRate: 0.0479,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2015,
        month: 0,
        monthIndex: 180,
        date: "2015-01-01T00:00:00.000Z",
        amount: 166.63,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0379,
        postedInterestRate: 0.0479,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2020,
        month: 0,
        monthIndex: 240,
        date: "2020-01-01T00:00:00.000Z",
        amount: 436.85,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0419,
        postedInterestRate: 0.0519,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2020,
        month: 0,
        monthIndex: 240,
        date: "2020-01-01T00:00:00.000Z",
        amount: 100.65,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0419,
        postedInterestRate: 0.0519,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
    ]);
  });

  const mortgageRatesVariableBuyer = results.filter((d) =>
    [2000, 2005, 2010, 2015, 2020].includes(d.year) && d.month === 0 &&
    d.variable.includes("mortgage") && d.group === "monthlyExpenses" &&
    d.category === "buyerVariable"
  ).map((d) => ({
    ...d,
    date: d.date.toISOString(),
  }));

  await t.step("mortgage rates variable buyer", async () => {
    assertEquals(mortgageRatesVariableBuyer, [
      {
        year: 2000,
        month: 0,
        monthIndex: 0,
        date: "2000-01-01T00:00:00.000Z",
        amount: 123.43,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0665,
        postedInterestRate: 0.065,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2000,
        month: 0,
        monthIndex: 0,
        date: "2000-01-01T00:00:00.000Z",
        amount: 524.36,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0665,
        postedInterestRate: 0.065,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2005,
        month: 0,
        monthIndex: 60,
        date: "2005-01-01T00:00:00.000Z",
        amount: 208.37,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.044,
        postedInterestRate: 0.0425,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2005,
        month: 0,
        monthIndex: 60,
        date: "2005-01-01T00:00:00.000Z",
        amount: 293.18,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.044,
        postedInterestRate: 0.0425,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2010,
        month: 0,
        monthIndex: 120,
        date: "2010-01-01T00:00:00.000Z",
        amount: 315.18,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.024,
        postedInterestRate: 0.0225,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2010,
        month: 0,
        monthIndex: 120,
        date: "2010-01-01T00:00:00.000Z",
        amount: 136.41,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.024,
        postedInterestRate: 0.0225,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2015,
        month: 0,
        monthIndex: 180,
        date: "2015-01-01T00:00:00.000Z",
        amount: 356.3,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0315,
        postedInterestRate: 0.03,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2015,
        month: 0,
        monthIndex: 180,
        date: "2015-01-01T00:00:00.000Z",
        amount: 131.72,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0315,
        postedInterestRate: 0.03,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2020,
        month: 0,
        monthIndex: 240,
        date: "2020-01-01T00:00:00.000Z",
        amount: 409.75,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.041,
        postedInterestRate: 0.0395,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2020,
        month: 0,
        monthIndex: 240,
        date: "2020-01-01T00:00:00.000Z",
        amount: 93.05,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.041,
        postedInterestRate: 0.0395,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
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
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 506,
          category: "renter",
          group: "monthlyExpenses",
          variable: "rent",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 44,
          category: "renter",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 506,
          category: "renter",
          group: "monthlyExpenses",
          variable: "securityDeposit",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 114.19,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "mortgageCapital",
          effectiveInterestRate: 0.0725,
          postedInterestRate: 0.0825,
          fixedRateDiscount: 0.01,
          variableRateMargin: 0,
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 563.22,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "mortgageInterests",
          effectiveInterestRate: 0.0725,
          postedInterestRate: 0.0825,
          fixedRateDiscount: 0.01,
          variableRateMargin: 0,
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 45,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 46,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 157,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 124,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "condoFees",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 10514,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "downPayment",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 2103,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 2933,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "insurancePremium",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 123.43,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "mortgageCapital",
          effectiveInterestRate: 0.0665,
          postedInterestRate: 0.065,
          fixedRateDiscount: 0,
          variableRateMargin: 0.0015,
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 524.36,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "mortgageInterests",
          effectiveInterestRate: 0.0665,
          postedInterestRate: 0.065,
          fixedRateDiscount: 0,
          variableRateMargin: 0.0015,
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 45,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 46,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 157,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 124,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "condoFees",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 10514,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "downPayment",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 2103,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 2933,
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
      renter: 1056,
      buyerFixed: 16599.41,
      buyerVariable: 16569.79,
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
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 506.51,
          category: "renter",
          group: "monthlyExpenses",
          variable: "rent",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 43.81,
          category: "renter",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 114.87,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "mortgageCapital",
          effectiveInterestRate: 0.0725,
          postedInterestRate: 0.0825,
          fixedRateDiscount: 0.01,
          variableRateMargin: 0,
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 562.54,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "mortgageInterests",
          effectiveInterestRate: 0.0725,
          postedInterestRate: 0.0825,
          fixedRateDiscount: 0.01,
          variableRateMargin: 0,
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 45.22,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 46.42,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 157,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 125.13,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "condoFees",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 124.11,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "mortgageCapital",
          effectiveInterestRate: 0.0665,
          postedInterestRate: 0.065,
          fixedRateDiscount: 0,
          variableRateMargin: 0.0015,
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 523.67,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "mortgageInterests",
          effectiveInterestRate: 0.0665,
          postedInterestRate: 0.065,
          fixedRateDiscount: 0,
          variableRateMargin: 0.0015,
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 45.22,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 46.42,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 157,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 125.13,
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
      renter: 550.32,
      buyerFixed: 1051.18,
      buyerVariable: 1021.55,
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
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 177356.74,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "rent",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 15317.42,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 506,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "securityDeposit",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 24613.41,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 94621.02,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 77412.27,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 20094.78,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 58554.99,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 54140.67,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 10514,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 2103,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 2933,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurancePremium",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 24613.41,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 94621.07,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 60544.16,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 20094.78,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 58554.99,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 54140.67,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 10514,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 2103,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 2933,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurancePremium",
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
        renter: 193180.16,
        buyerFixed: 344987.14,
        buyerVariable: 328119.08,
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
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 1012.51,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "rent",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 87.81,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 506,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "securityDeposit",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 90.22,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 229.06,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 1125.76,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 92.42,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 314,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 249.13,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 10514,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 2103,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 2933,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurancePremium",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 90.22,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 247.54,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 1048.03,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 92.42,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 314,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 249.13,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 10514,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 2103,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 2933,
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
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 15543.41,
          category: "renter",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 10628.19,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 105135,
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 29.62,
          category: "buyerVariable",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 10637.43,
          category: "buyerVariable",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 105135,
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
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 1596.31,
          category: "renter",
          group: "monthlyGains",
          variable: "stocksGains",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 500.86,
          category: "renter",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 535.41,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 105555.54,
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 3.04,
          category: "buyerVariable",
          group: "monthlyGains",
          variable: "stocksGains",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 29.63,
          category: "buyerVariable",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 544.65,
          category: "buyerVariable",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 105555.54,
        },
      ],
    );
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
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 56319.23,
          category: "renter",
          group: "cumulativeGains",
          variable: "tfsaGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 84013.33,
          category: "renter",
          group: "cumulativeGains",
          variable: "tfsaContribution",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 119003.94,
          category: "renter",
          group: "cumulativeGains",
          variable: "stocksGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 67793.65,
          category: "renter",
          group: "cumulativeGains",
          variable: "newStocks",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 412185.37,
          category: "buyerFixed",
          group: "cumulativeGains",
          variable: "homeEquityGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 8990.5,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "tfsaGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 11795.54,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "tfsaContribution",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 7425.3,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "stocksGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 5072.52,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "newStocks",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 412185.37,
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

  await t.step(
    "cumulative gains last month total per category",
    async () => {
      assertEquals(cumulativeGainsLastMonthTotalPerCategory, {
        renter: 327130.15,
        buyerFixed: 412185.37,
        buyerVariable: 445469.23,
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
      1030,
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
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 140332.56,
          category: "renter",
          group: "assets",
          variable: "tfsa",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 186797.59,
          category: "renter",
          group: "assets",
          variable: "stocks",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 506,
          category: "renter",
          group: "assets",
          variable: "securityDeposit",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 412185.37,
          category: "buyerFixed",
          group: "assets",
          variable: "homeEquity",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 20786.04,
          category: "buyerVariable",
          group: "assets",
          variable: "tfsa",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 12497.82,
          category: "buyerVariable",
          group: "assets",
          variable: "stocks",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 412185.37,
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

  await t.step("assets last month total per category", async () => {
    assertEquals(assetsLastMonthTotalPerCategory, {
      renter: 327636.15,
      buyerFixed: 412185.37,
      buyerVariable: 445469.23,
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
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 12495.41,
          category: "renter",
          group: "saleCosts",
          variable: "stockTaxes",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 16487.41,
          category: "buyerFixed",
          group: "saleCosts",
          variable: "homeSellingCommission",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 1998,
          category: "buyerFixed",
          group: "saleCosts",
          variable: "homeSellingFixedFees",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 779.66,
          category: "buyerVariable",
          group: "saleCosts",
          variable: "stockTaxes",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 16487.41,
          category: "buyerVariable",
          group: "saleCosts",
          variable: "homeSellingCommission",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 1998,
          category: "buyerVariable",
          group: "saleCosts",
          variable: "homeSellingFixedFees",
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

  await t.step("sale costs last month total per category", async () => {
    assertEquals(saleCostsLastMonthTotalPerCategory, {
      renter: 12495.41,
      buyerFixed: 18485.41,
      buyerVariable: 19265.07,
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
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 174302.18,
          category: "renter",
          group: "saleNetGains",
          variable: "stockSellingGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 140332.56,
          category: "renter",
          group: "saleNetGains",
          variable: "tfsaSellingGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 506,
          category: "renter",
          group: "saleNetGains",
          variable: "securityDeposit",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 393699.96,
          category: "buyerFixed",
          group: "saleNetGains",
          variable: "homeSellingGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 11718.16,
          category: "buyerVariable",
          group: "saleNetGains",
          variable: "stockSellingGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 20786.04,
          category: "buyerVariable",
          group: "saleNetGains",
          variable: "tfsaSellingGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 393699.96,
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

  await t.step("sale net gains last month total per category", async () => {
    assertEquals(saleNetGainsLastMonthTotalPerCategory, {
      renter: 315140.74,
      buyerFixed: 393699.96,
      buyerVariable: 426204.16,
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
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 3847.5,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 412185.37,
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 3474.74,
          category: "buyerVariable",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 412185.37,
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

  await t.step("overall balance after selling last month", async () => {
    assertEquals(
      overallBalanceAfterSellingLastMonth.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 121960.58,
          category: "renter",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 48712.82,
          category: "buyerFixed",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 98085.08,
          category: "buyerVariable",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
      ],
    );
  });

  await makeCharts("montreal", results, params.allRatesFiltered);
  assertEquals(true, true);
});
