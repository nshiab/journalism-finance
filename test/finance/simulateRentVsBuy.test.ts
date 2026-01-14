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
        title: "First year expenses (2000)",
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
  const annualExpenses = results.filter((d) =>
    d.group === "annualExpenses" && d.year !== 2025
  );
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
        title:
          "Annual expenses over time (excluding last year selling expenses)",
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
    d.group === "cumulativeExpenses" && d.year !== 2025
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
  ) => d.year === 2024 && d.category === "renter").reduce(
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
        800494,
      );
    },
  );

  const cumulativeBuyerLastYearExpenses = cumulativeAnnualExpenses.filter((
    d,
  ) => d.year === 2024 && d.category === "buyer").reduce(
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
        1246023,
      );
    },
  );

  await saveChart(
    cumulativeAnnualExpenses,
    (data) =>
      plot({
        title:
          "Cumulative expenses over time (excluding last year selling expenses)",
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

  const annualGains = results.filter((d) =>
    d.group === "annualGains" &&
    d.year !== 2025
  );

  const firstAndSecondYearGains = annualGains.filter((d) =>
    d.year === 2000 || d.year === 2001
  );
  await t.step("first and second year gains", async () => {
    assertEquals(firstAndSecondYearGains, [
      {
        year: 2000,
        category: "renter",
        group: "annualGains",
        variable: "tfsaGains",
        amount: 0,
      },
      {
        year: 2000,
        category: "renter",
        group: "annualGains",
        variable: "marketGains",
        amount: 0,
      },
      {
        year: 2000,
        category: "buyer",
        group: "annualGains",
        variable: "tfsaGains",
        amount: 0,
      },
      {
        year: 2000,
        category: "buyer",
        group: "annualGains",
        variable: "marketGains",
        amount: 0,
      },
      {
        year: 2000,
        category: "buyer",
        group: "annualGains",
        variable: "homeEquityGains",
        amount: 84348,
      },
      {
        year: 2000,
        category: "renter",
        group: "annualGains",
        variable: "tfsaContribution",
        amount: 0,
      },
      {
        year: 2000,
        category: "buyer",
        group: "annualGains",
        variable: "tfsaContribution",
        amount: 0,
      },
      {
        year: 2000,
        category: "renter",
        group: "annualGains",
        variable: "newStocks",
        amount: 106907,
      },
      {
        year: 2000,
        category: "buyer",
        group: "annualGains",
        variable: "newStocks",
        amount: 0,
      },
      {
        year: 2001,
        category: "renter",
        group: "annualGains",
        variable: "tfsaGains",
        amount: 0,
      },
      {
        year: 2001,
        category: "renter",
        group: "annualGains",
        variable: "marketGains",
        amount: 5345,
      },
      {
        year: 2001,
        category: "buyer",
        group: "annualGains",
        variable: "tfsaGains",
        amount: 0,
      },
      {
        year: 2001,
        category: "buyer",
        group: "annualGains",
        variable: "marketGains",
        amount: 0,
      },
      {
        year: 2001,
        category: "buyer",
        group: "annualGains",
        variable: "homeEquityGains",
        amount: 36071,
      },
      {
        year: 2001,
        category: "renter",
        group: "annualGains",
        variable: "tfsaContribution",
        amount: 0,
      },
      {
        year: 2001,
        category: "buyer",
        group: "annualGains",
        variable: "tfsaContribution",
        amount: 0,
      },
      {
        year: 2001,
        category: "renter",
        group: "annualGains",
        variable: "newStocks",
        amount: 19359,
      },
      {
        year: 2001,
        category: "buyer",
        group: "annualGains",
        variable: "newStocks",
        amount: 0,
      },
    ]);
  });

  const year2009And2010Gains = annualGains.filter((d) =>
    d.year === 2009 || d.year === 2010
  );
  await t.step("2009 and 2010 gains", async () => {
    assertEquals(year2009And2010Gains, [
      {
        year: 2009,
        category: "renter",
        group: "annualGains",
        variable: "tfsaGains",
        amount: 0,
      },
      {
        year: 2009,
        category: "renter",
        group: "annualGains",
        variable: "marketGains",
        amount: 16548,
      },
      {
        year: 2009,
        category: "buyer",
        group: "annualGains",
        variable: "tfsaGains",
        amount: 0,
      },
      {
        year: 2009,
        category: "buyer",
        group: "annualGains",
        variable: "marketGains",
        amount: 0,
      },
      {
        year: 2009,
        category: "buyer",
        group: "annualGains",
        variable: "homeEquityGains",
        amount: 53362,
      },
      {
        year: 2009,
        category: "renter",
        group: "annualGains",
        variable: "tfsaContribution",
        amount: 5000,
      },
      {
        year: 2009,
        category: "buyer",
        group: "annualGains",
        variable: "tfsaContribution",
        amount: 0,
      },
      {
        year: 2009,
        category: "renter",
        group: "annualGains",
        variable: "newStocks",
        amount: 11135,
      },
      {
        year: 2009,
        category: "buyer",
        group: "annualGains",
        variable: "newStocks",
        amount: 0,
      },
      {
        year: 2010,
        category: "renter",
        group: "annualGains",
        variable: "tfsaGains",
        amount: 250,
      },
      {
        year: 2010,
        category: "renter",
        group: "annualGains",
        variable: "marketGains",
        amount: 17932,
      },
      {
        year: 2010,
        category: "buyer",
        group: "annualGains",
        variable: "tfsaGains",
        amount: 0,
      },
      {
        year: 2010,
        category: "buyer",
        group: "annualGains",
        variable: "marketGains",
        amount: 0,
      },
      {
        year: 2010,
        category: "buyer",
        group: "annualGains",
        variable: "homeEquityGains",
        amount: 56039,
      },
      {
        year: 2010,
        category: "renter",
        group: "annualGains",
        variable: "tfsaContribution",
        amount: 5000,
      },
      {
        year: 2010,
        category: "buyer",
        group: "annualGains",
        variable: "tfsaContribution",
        amount: 0,
      },
      {
        year: 2010,
        category: "renter",
        group: "annualGains",
        variable: "newStocks",
        amount: 10673,
      },
      {
        year: 2010,
        category: "buyer",
        group: "annualGains",
        variable: "newStocks",
        amount: 0,
      },
    ]);
  });

  await saveChart(
    annualGains,
    (data) =>
      plot({
        title: "Annual gains over time (excluding last year selling gains)",
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
    "test/output/annual-gains.png",
    { style: "body { width: 700px; }" },
  );

  const cumulativeGains = results.filter((d) =>
    d.group === "cumulativeGains" &&
    d.year !== 2025
  );

  const cumulativeGainsFirstAndSecondYear = cumulativeGains.filter((d) =>
    d.year === 2000 || d.year === 2001
  );
  await t.step("cumulative gains first and second year", async () => {
    assertEquals(cumulativeGainsFirstAndSecondYear, [
      {
        year: 2000,
        category: "renter",
        group: "cumulativeGains",
        variable: "tfsaGains",
        amount: 0,
      },
      {
        year: 2000,
        category: "renter",
        group: "cumulativeGains",
        variable: "marketGains",
        amount: 0,
      },
      {
        year: 2000,
        category: "buyer",
        group: "cumulativeGains",
        variable: "tfsaGains",
        amount: 0,
      },
      {
        year: 2000,
        category: "buyer",
        group: "cumulativeGains",
        variable: "marketGains",
        amount: 0,
      },
      {
        year: 2000,
        category: "buyer",
        group: "cumulativeGains",
        variable: "homeEquityGains",
        amount: 84348,
      },
      {
        year: 2000,
        category: "renter",
        group: "cumulativeGains",
        variable: "tfsaContribution",
        amount: 0,
      },
      {
        year: 2000,
        category: "buyer",
        group: "cumulativeGains",
        variable: "tfsaContribution",
        amount: 0,
      },
      {
        year: 2000,
        category: "renter",
        group: "cumulativeGains",
        variable: "newStocks",
        amount: 106907,
      },
      {
        year: 2000,
        category: "buyer",
        group: "cumulativeGains",
        variable: "newStocks",
        amount: 0,
      },
      {
        year: 2001,
        category: "renter",
        group: "cumulativeGains",
        variable: "tfsaGains",
        amount: 0,
      },
      {
        year: 2001,
        category: "renter",
        group: "cumulativeGains",
        variable: "marketGains",
        amount: 5345,
      },
      {
        year: 2001,
        category: "buyer",
        group: "cumulativeGains",
        variable: "tfsaGains",
        amount: 0,
      },
      {
        year: 2001,
        category: "buyer",
        group: "cumulativeGains",
        variable: "marketGains",
        amount: 0,
      },
      {
        year: 2001,
        category: "buyer",
        group: "cumulativeGains",
        variable: "homeEquityGains",
        amount: 120419,
      },
      {
        year: 2001,
        category: "renter",
        group: "cumulativeGains",
        variable: "tfsaContribution",
        amount: 0,
      },
      {
        year: 2001,
        category: "buyer",
        group: "cumulativeGains",
        variable: "tfsaContribution",
        amount: 0,
      },
      {
        year: 2001,
        category: "renter",
        group: "cumulativeGains",
        variable: "newStocks",
        amount: 126266,
      },
      {
        year: 2001,
        category: "buyer",
        group: "cumulativeGains",
        variable: "newStocks",
        amount: 0,
      },
    ]);
  });

  const renterLastYearCumulativeGains = cumulativeGains.filter((d) =>
    d.year === 2024 && d.category === "renter"
  ).reduce((acc, curr) => acc + curr.amount, 0);
  const buyerLastYearCumulativeGains = cumulativeGains.filter((d) =>
    d.year === 2024 && d.category === "buyer"
  ).reduce((acc, curr) => acc + curr.amount, 0);

  await t.step("last year cumulative gains for renter", async () => {
    assertEquals(renterLastYearCumulativeGains, 1023699);
  });

  await t.step("last year cumulative gains for buyer", async () => {
    assertEquals(buyerLastYearCumulativeGains, 1693175);
  });

  // Assets and cumulative gain totals should be the same
  const cumulativeGains2024Buyer = results.filter((d) =>
    d.group === "cumulativeGains" &&
    d.category === "buyer" && d.year === 2024
  ).reduce((acc, curr) => acc += curr.amount, 0);
  const buyerAssets2024 = results.filter((d) =>
    d.group === "assets" &&
    d.category === "buyer" && d.year === 2024
  ).reduce((acc, curr) => acc += curr.amount, 0);

  await t.step(
    "buyer assets and cumulative gains should match for 2024",
    async () => {
      assertEquals(cumulativeGains2024Buyer, buyerAssets2024);
    },
  );

  const cumulativeGains2024Renter = results.filter((d) =>
    d.group === "cumulativeGains" &&
    d.category === "renter" && d.year === 2024
  ).reduce((acc, curr) => acc += curr.amount, 0);
  const renterAssets2024 = results.filter((d) =>
    d.group === "assets" &&
    d.category === "renter" && d.year === 2024
  ).reduce((acc, curr) => acc += curr.amount, 0);

  await t.step(
    "renter assets and cumulative gains should match for 2024",
    async () => {
      assertEquals(cumulativeGains2024Renter, renterAssets2024);
    },
  );

  const assets = results.filter((d) =>
    d.group === "assets" &&
    d.year !== 2025
  );

  const buyerLastYearAssets = assets.filter((d) =>
    d.year === 2024 && d.category === "buyer"
  );
  await t.step("last year assets for buyer", async () => {
    assertEquals(buyerLastYearAssets, [
      {
        year: 2024,
        category: "buyer",
        group: "assets",
        variable: "homeEquity",
        amount: 1693175,
      },
      {
        year: 2024,
        category: "buyer",
        group: "assets",
        variable: "tfsa",
        amount: 0,
      },
      {
        year: 2024,
        category: "buyer",
        group: "assets",
        variable: "stocks",
        amount: 0,
      },
    ]);
  });

  const renterLastYearAssets = assets.filter((d) =>
    d.year === 2024 && d.category === "renter"
  );
  await t.step("last year assets for renter", async () => {
    assertEquals(renterLastYearAssets, [
      {
        year: 2024,
        category: "renter",
        group: "assets",
        variable: "tfsa",
        amount: 138152,
      },
      {
        year: 2024,
        category: "renter",
        group: "assets",
        variable: "stocks",
        amount: 885547,
      },
    ]);
  });

  await saveChart(
    assets,
    (data) =>
      plot({
        title: "Assets over time (excluding last year selling gains)",
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
    "test/output/assets.png",
    { style: "body { width: 700px; }" },
  );

  const balance = results.filter((d) =>
    d.group === "summary" &&
    d.variable === "balance" && d.year !== 2025
  );

  const firstAndSecondYearBalance = balance.filter((d) =>
    d.year === 2000 || d.year === 2001
  );

  await t.step("first and second year balance", async () => {
    assertEquals(firstAndSecondYearBalance, [
      {
        year: 2000,
        category: "renter",
        group: "summary",
        variable: "balance",
        amount: 83257,
      },
      {
        year: 2000,
        category: "buyer",
        group: "summary",
        variable: "balance",
        amount: -46209,
      },
      {
        year: 2001,
        category: "renter",
        group: "summary",
        variable: "balance",
        amount: 2144,
      },
      {
        year: 2001,
        category: "buyer",
        group: "summary",
        variable: "balance",
        amount: -5848,
      },
    ]);
  });

  await saveChart(
    balance,
    (data) =>
      plot({
        title: "Annual balance over time (excluding last selling year)",
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
    "test/output/balance.png",
    { style: "body { width: 700px; }" },
  );

  const finalExpenses = results.filter((d) =>
    d.group === "annualExpenses" && d.year === 2025
  );

  await t.step("final year expenses", async () => {
    assertEquals(finalExpenses, [
      {
        year: 2025,
        category: "renter",
        group: "annualExpenses",
        variable: "stockTaxes",
        amount: 66877,
      },
      {
        year: 2025,
        category: "buyer",
        group: "annualExpenses",
        variable: "stockTaxes",
        amount: 0,
      },
      {
        year: 2025,
        category: "buyer",
        group: "annualExpenses",
        variable: "homeSellingCommission",
        amount: 67727,
      },
      {
        year: 2025,
        category: "buyer",
        group: "annualExpenses",
        variable: "homeSellingFixedFees",
        amount: 4191,
      },
    ]);
  });

  await saveChart(
    finalExpenses,
    (data) =>
      plot({
        title: "Selling year expenses (2025)",
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
    "test/output/final-expenses.png",
    { style: "body { width: 700px; }" },
  );

  const finalAssets = results.filter((d) =>
    d.group === "assets" && d.year === 2025
  );
  await t.step("proceeds from selling assets", async () => {
    assertEquals(finalAssets, [
      {
        year: 2025,
        category: "renter",
        group: "assets",
        variable: "stocks",
        amount: 818670,
      },
      {
        year: 2025,
        category: "renter",
        group: "assets",
        variable: "tfsa",
        amount: 138152,
      },
      {
        year: 2025,
        category: "renter",
        group: "assets",
        variable: "securityDeposit",
        amount: 1750,
      },
      {
        year: 2025,
        category: "buyer",
        group: "assets",
        variable: "stocks",
        amount: 0,
      },
      {
        year: 2025,
        category: "buyer",
        group: "assets",
        variable: "tfsa",
        amount: 0,
      },
      {
        year: 2025,
        category: "buyer",
        group: "assets",
        variable: "homeEquity",
        amount: 1621257,
      },
    ]);
  });

  await saveChart(
    finalAssets,
    (data) =>
      plot({
        title: "Proceeds from selling assets (2025)",
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
    "test/output/proceeds-from-selling-assets.png",
    { style: "body { width: 700px; }" },
  );

  const cumulativeBalance = results.filter((d) =>
    d.group === "summaryCumulative" && d.variable === "balance"
  );
  const finalBalance = cumulativeBalance.filter((d) => d.year === 2025);

  await t.step("final year balance", async () => {
    assertEquals(finalBalance, [
      {
        year: 2025,
        category: "renter",
        group: "summaryCumulative",
        variable: "balance",
        amount: 158078,
      },
      {
        year: 2025,
        category: "buyer",
        group: "summaryCumulative",
        variable: "balance",
        amount: 375234,
      },
    ]);
  });

  await saveChart(
    cumulativeBalance,
    (data) =>
      plot({
        title: "Overall balance over time (including selling year)",
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
    "test/output/overall-balance.png",
    { style: "body { width: 700px; }" },
  );

  const difference = results.filter((d) =>
    d.group === "summaryCumulative" && d.variable === "difference"
  );
  const lastYearDifference = difference.filter((d) => d.year === 2025);

  await t.step("final difference", async () => {
    assertEquals(lastYearDifference, [
      {
        year: 2025,
        category: "renter",
        group: "summaryCumulative",
        variable: "difference",
        amount: -217156,
      },
      {
        year: 2025,
        category: "buyer",
        group: "summaryCumulative",
        variable: "difference",
        amount: 217156,
      },
    ]);
  });

  await saveChart(
    difference,
    (data) =>
      plot({
        title:
          "Difference in overall balance over time (including selling year)",
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
    "test/output/overall-difference.png",
    { style: "body { width: 700px; }" },
  );

  //Just for now
  assertEquals(true, true);
});
