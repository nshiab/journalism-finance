import { assertEquals } from "jsr:@std/assert";
import simulateRentVsBuy from "../../src/finance/simulateRentVsBuy.ts";
import { saveChart } from "@nshiab/journalism-dataviz";
import { barY, plot } from "@observablehq/plot";
import getRandomValues from "../../src/finance/getRandomValues.ts";

Deno.test("should compute the total expenses and savings of a renter and buyer", async (t) => {
  const numberOfYears = 25;
  const annualMarketReturnRate = getRandomValues(
    numberOfYears,
    0.05,
    0,
    { decimals: 4 },
  );
  const annualRentIncrease = getRandomValues(numberOfYears, 0.03, 0, {
    decimals: 4,
  });
  const renterAnnualInsuranceIncrease = getRandomValues(
    numberOfYears,
    0.03,
    0,
    { decimals: 4 },
  );
  const annualMaintenanceIncrease = getRandomValues(
    numberOfYears,
    0.03,
    0,
    { decimals: 4 },
  );
  const annualPropertyTaxIncrease = getRandomValues(
    numberOfYears,
    0.03,
    0,
    { decimals: 4 },
  );
  const annualCondoFeeIncrease = getRandomValues(
    numberOfYears,
    0.03,
    0,
    { decimals: 4 },
  );
  const buyerAnnualInsuranceIncrease = getRandomValues(
    numberOfYears,
    0.03,
    0,
    { decimals: 4 },
  );
  const appreciationIncrease = getRandomValues(
    numberOfYears,
    0.05,
    0,
    { decimals: 4 },
  );
  const sellingFixedFeesIncrease = getRandomValues(
    numberOfYears,
    0.03,
    0,
    { decimals: 4 },
  );

  const results = simulateRentVsBuy({
    startingYear: 2000,
    numberOfYears,
    annualMarketReturnRate,
    tfsaContributions: true,
    combinedTaxRate: 0.25,
    renter: {
      startingMonthlyRent: 1750,
      annualRentIncrease,
      securityDeposit: 1750,
      startingMonthlyInsurance: 75,
      annualInsuranceIncrease: renterAnnualInsuranceIncrease,
    },
    buyer: {
      downPayment: 50_000,
      purchasePrice: 500_000,
      interestRates: [0.05, 0.05, 0.05, 0.05, 0.05],
      purchaseFixedFees: 25_000,
      startingAnnualMaintenanceCost: 2500,
      annualMaintenanceIncrease,
      startingAnnualPropertyTax: 3500,
      annualPropertyTaxIncrease,
      startingMonthlyCondoFees: 100,
      annualCondoFeeIncrease,
      startingMonthlyInsurance: 250,
      annualInsuranceIncrease: buyerAnnualInsuranceIncrease,
      appreciationIncrease,
      sellingFixedFees: 2000,
      sellingFixedFeesIncrease,
      sellingCommissionRate: 0.04,
    },
  });

  // Expenses on the first year
  const firstYearExpenses = results.filter((d) =>
    d.year === 2000 &&
    d.group === "annualExpenses"
  );

  await t.step("first year expenses", async () => {
    assertEquals(firstYearExpenses, [
      {
        year: 2000,
        category: "renter",
        group: "annualExpenses",
        variable: "rent",
        amount: 21000,
      },
      {
        year: 2000,
        category: "renter",
        group: "annualExpenses",
        variable: "insurance",
        amount: 900,
      },
      {
        year: 2000,
        category: "renter",
        group: "annualExpenses",
        variable: "securityDeposit",
        amount: 1750,
      },
      {
        year: 2000,
        category: "buyer",
        group: "annualExpenses",
        variable: "mortgageCapital",
        amount: 9348,
      },
      {
        year: 2000,
        category: "buyer",
        group: "annualExpenses",
        variable: "mortgageInterests",
        amount: 22059,
      },
      {
        year: 2000,
        category: "buyer",
        group: "annualExpenses",
        variable: "maintenance",
        amount: 2500,
      },
      {
        year: 2000,
        category: "buyer",
        group: "annualExpenses",
        variable: "propertyTax",
        amount: 3500,
      },
      {
        year: 2000,
        category: "buyer",
        group: "annualExpenses",
        variable: "condoFees",
        amount: 1200,
      },
      {
        year: 2000,
        category: "buyer",
        group: "annualExpenses",
        variable: "insurance",
        amount: 3000,
      },
      {
        year: 2000,
        category: "buyer",
        group: "annualExpenses",
        variable: "downPayment",
        amount: 50000,
      },
      {
        year: 2000,
        category: "buyer",
        group: "annualExpenses",
        variable: "purchaseFixedFees",
        amount: 25000,
      },
      {
        year: 2000,
        category: "buyer",
        group: "annualExpenses",
        variable: "insurancePremium",
        amount: 13950,
      },
    ]);
  });

  const renterFirstYearTotalExpenses = firstYearExpenses.filter((d) =>
    d.category === "renter"
  ).reduce((acc, curr) => acc + curr.amount, 0);

  await t.step("renter first year total expenses", async () => {
    assertEquals(renterFirstYearTotalExpenses, 23650);
  });

  const buyerFirstYearTotalExpenses = firstYearExpenses.filter((d) =>
    d.category === "buyer"
  ).reduce((acc, curr) => acc + curr.amount, 0);

  await t.step("buyer first year total expenses", async () => {
    assertEquals(buyerFirstYearTotalExpenses, 130557);
  });

  await saveChart(
    firstYearExpenses,
    (data) =>
      plot({
        title: "Expenses in the first year (2000)",
        y: {
          nice: true,
          label: null,
          tickFormat: (d) =>
            Math.abs(d) < 1000
              ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
              : Math.abs(d) < 1_000_000
              ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
              : d < 0
              ? `-$${Math.abs(d) / 1_000_000}M`
              : `$${d / 1_000_000}M`,
        },
        x: {
          ticks: [2000, 2004, 2009, 2014, 2019, 2024],
          tickFormat: (d) => d.toString(),
        },
        fx: {
          label: null,
        },
        marginLeft: 60,
        color: {
          legend: true,
        },
        grid: true,
        marks: [
          barY(data, {
            x: "year",
            y: "amount",
            fill: "variable",
            fx: "category",
            order: "amount",
          }),
        ],
      }),
    "test/output/first-year-expenses.png",
    { style: "body { width: 700px; }" },
  );

  // Annual expenses
  const annualExpenses = results.filter((d) => d.group === "annualExpenses");
  const annualExpensesSecondYear = annualExpenses.filter((d) =>
    d.year === 2001
  );
  await t.step("second year expenses", async () => {
    assertEquals(annualExpensesSecondYear, [
      {
        year: 2001,
        category: "renter",
        group: "annualExpenses",
        variable: "rent",
        amount: 21636,
      },
      {
        year: 2001,
        category: "renter",
        group: "annualExpenses",
        variable: "insurance",
        amount: 924,
      },
      {
        year: 2001,
        category: "buyer",
        group: "annualExpenses",
        variable: "mortgageCapital",
        amount: 9821,
      },
      {
        year: 2001,
        category: "buyer",
        group: "annualExpenses",
        variable: "mortgageInterests",
        amount: 21586,
      },
      {
        year: 2001,
        category: "buyer",
        group: "annualExpenses",
        variable: "maintenance",
        amount: 2575,
      },
      {
        year: 2001,
        category: "buyer",
        group: "annualExpenses",
        variable: "propertyTax",
        amount: 3605,
      },
      {
        year: 2001,
        category: "buyer",
        group: "annualExpenses",
        variable: "condoFees",
        amount: 1236,
      },
      {
        year: 2001,
        category: "buyer",
        group: "annualExpenses",
        variable: "insurance",
        amount: 3096,
      },
    ]);
  });

  const renterTotalExpensesSecondYear = annualExpensesSecondYear.filter((d) =>
    d.category === "renter"
  ).reduce((acc, curr) => acc + curr.amount, 0);

  await t.step("renter second year total expenses", async () => {
    assertEquals(renterTotalExpensesSecondYear, 22560);
  });

  const buyerTotalExpensesSecondYear = annualExpensesSecondYear.filter((d) =>
    d.category === "buyer"
  ).reduce((acc, curr) => acc + curr.amount, 0);

  await t.step("buyer second year total expenses", async () => {
    assertEquals(buyerTotalExpensesSecondYear, 41919);
  });

  const renterTotalExpensesLastYear = annualExpenses.filter((d) =>
    d.category === "renter" && d.year === 2024
  ).reduce((acc, curr) => acc + curr.amount, 0);

  await t.step("renter last year total expenses", async () => {
    assertEquals(renterTotalExpensesLastYear, 44544);
  });

  const buyerTotalExpensesLastYear = annualExpenses.filter((d) =>
    d.category === "buyer" && d.year === 2024
  ).reduce((acc, curr) => acc + curr.amount, 0);

  await t.step("buyer last year total expenses", async () => {
    assertEquals(buyerTotalExpensesLastYear, 52148);
  });

  await saveChart(
    annualExpenses,
    (data) =>
      plot({
        title: "Annual expenses over time",
        y: {
          nice: true,
          label: null,
          tickFormat: (d) =>
            Math.abs(d) < 1000
              ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
              : Math.abs(d) < 1_000_000
              ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
              : d < 0
              ? `-$${Math.abs(d) / 1_000_000}M`
              : `$${d / 1_000_000}M`,
        },
        x: {
          ticks: [2000, 2005, 2010, 2015, 2020, 2025],
          tickFormat: (d) => d.toString(),
        },
        fx: {
          label: null,
        },
        marginLeft: 60,
        color: {
          legend: true,
        },
        grid: true,
        marks: [
          barY(data, {
            x: "year",
            y: "amount",
            fill: "variable",
            fx: "category",
          }),
        ],
      }),
    "test/output/annual-expenses.png",
    { style: "body { width: 700px; }" },
  );

  const cumulativeAnnualExpenses = results.filter((d) =>
    d.group === "cumulativeExpenses"
  );

  const cumulativeRenterFirstYearExpenses = cumulativeAnnualExpenses.filter((
    d,
  ) => d.year === 2000 && d.category === "renter").reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );
  await t.step("cumulative expenses on first year for renter", async () => {
    assertEquals(
      cumulativeRenterFirstYearExpenses,
      renterFirstYearTotalExpenses,
    );
  });

  const cumulativeBuyerFirstYearExpenses = cumulativeAnnualExpenses.filter((
    d,
  ) => d.year === 2000 && d.category === "buyer").reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );
  await t.step("cumulative expenses on first year for buyer", async () => {
    assertEquals(
      cumulativeBuyerFirstYearExpenses,
      buyerFirstYearTotalExpenses,
    );
  });

  const cumulativeRenterSecondYearExpenses = cumulativeAnnualExpenses.filter((
    d,
  ) => d.year === 2001 && d.category === "renter").reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );
  await t.step("cumulative expenses on second year for renter", async () => {
    assertEquals(
      cumulativeRenterSecondYearExpenses,
      renterFirstYearTotalExpenses + renterTotalExpensesSecondYear,
    );
  });

  const cumulativeBuyerSecondYearExpenses = cumulativeAnnualExpenses.filter((
    d,
  ) => d.year === 2001 && d.category === "buyer").reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );
  await t.step("cumulative expenses on second year for buyer", async () => {
    assertEquals(
      cumulativeBuyerSecondYearExpenses,
      buyerFirstYearTotalExpenses + buyerTotalExpensesSecondYear,
    );
  });

  const cumulativeRenterLastYearExpenses = cumulativeAnnualExpenses.filter((
    d,
  ) => d.year === 2025 && d.category === "renter").reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );
  const renterExpectedCumulativeExpenses = annualExpenses.filter((d) =>
    d.category === "renter"
  ).reduce((acc, curr) => acc + curr.amount, 0);
  await t.step("cumulative expenses on last year for renter", async () => {
    assertEquals(
      cumulativeRenterLastYearExpenses,
      renterExpectedCumulativeExpenses,
    );
  });
  await t.step(
    "cumulative expenses on last year for renter (actual number)",
    async () => {
      assertEquals(
        cumulativeRenterLastYearExpenses,
        867371,
      );
    },
  );

  const cumulativeBuyerLastYearExpenses = cumulativeAnnualExpenses.filter((
    d,
  ) => d.year === 2025 && d.category === "buyer").reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );
  const buyerExpectedCumulativeExpenses = annualExpenses.filter((d) =>
    d.category === "buyer"
  ).reduce((acc, curr) => acc + curr.amount, 0);
  await t.step("cumulative expenses on last year for buyer", async () => {
    assertEquals(
      cumulativeBuyerLastYearExpenses,
      buyerExpectedCumulativeExpenses,
    );
  });
  await t.step(
    "cumulative expenses on last year for buyer (actual number)",
    async () => {
      assertEquals(
        cumulativeBuyerLastYearExpenses,
        1317941,
      );
    },
  );

  await saveChart(
    cumulativeAnnualExpenses,
    (data) =>
      plot({
        title: "Cumulative expenses over time",
        y: {
          nice: true,
          label: null,
          tickFormat: (d) =>
            Math.abs(d) < 1000
              ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
              : Math.abs(d) < 1_000_000
              ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
              : d < 0
              ? `-$${Math.abs(d) / 1_000_000}M`
              : `$${d / 1_000_000}M`,
        },
        x: {
          ticks: [2000, 2005, 2010, 2015, 2020, 2025],
          tickFormat: (d) => d.toString(),
        },
        fx: {
          label: null,
        },
        marginLeft: 60,
        color: {
          legend: true,
        },
        grid: true,
        marks: [
          barY(data, {
            x: "year",
            y: "amount",
            fill: "variable",
            fx: "category",
          }),
        ],
      }),
    "test/output/cumulative-expenses.png",
    { style: "body { width: 700px; }" },
  );

  //Just for now
  assertEquals(true, true);
});
