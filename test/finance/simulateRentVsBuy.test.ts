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
  // const annualExpenses = results.filter((d) =>
  //   [
  //     // buyer
  //     "mortgageCapital",
  //     "mortgageInterests",
  //     "maintenance",
  //     "propertyTax",
  //     "condoFees",
  //     "insurance",
  //     "downPayment",
  //     "purchaseFixedFees",
  //     "insurancePremium",
  //     // renter
  //     "rent",
  //     "insurance",
  //     "securityDeposit",
  //   ].includes(d.variable)
  // );
  // const annualExpensesSecondYear = annualExpenses.filter((d) =>
  //   d.year === 2001
  // );
  // t.step("second year expenses", async () => {
  //   assertEquals(annualExpensesSecondYear, [
  //     { year: 2001, category: "renter", variable: "rent", amount: 21636 },
  //     {
  //       year: 2001,
  //       category: "renter",
  //       variable: "insurance",
  //       amount: 924,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyer",
  //       variable: "mortgageCapital",
  //       amount: 9821,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyer",
  //       variable: "mortgageInterests",
  //       amount: 21586,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyer",
  //       variable: "maintenance",
  //       amount: 2575,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyer",
  //       variable: "propertyTax",
  //       amount: 3605,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyer",
  //       variable: "condoFees",
  //       amount: 1236,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyer",
  //       variable: "insurance",
  //       amount: 3096,
  //     },
  //   ]);
  // });

  // await saveChart(
  //   annualExpenses,
  //   (data) =>
  //     plot({
  //       title: "Annual expenses over time",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         ticks: [2000, 2004, 2009, 2014, 2019, 2024],
  //         tickFormat: (d) => d.toString(),
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         barY(data, {
  //           x: "year",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/annual-expenses.png",
  //   { style: "body { width: 700px; }" },
  // );

  // // Cumulative expenses
  // const cumulativeExpenses = results.filter((d) =>
  //   [
  //     // buyer
  //     "cumulativeMortgageCapital",
  //     "cumulativeMortgageInterests",
  //     "cumulativeMaintenance",
  //     "cumulativePropertyTax",
  //     "cumulativeCondoFees",
  //     "cumulativeInsurance",
  //     "cumulativeDownPayment",
  //     "cumulativePurchaseFixedFees",
  //     "cumulativeInsurancePremium",
  //     // renter
  //     "cumulativeRent",
  //     "cumulativeInsurance",
  //     "cumulativeSecurityDeposit",
  //   ].includes(d.variable)
  // );
  // await saveChart(
  //   cumulativeExpenses,
  //   (data) =>
  //     plot({
  //       title: "Cumulative expenses",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         ticks: [2000, 2004, 2009, 2014, 2019, 2024],
  //         tickFormat: (d) => d.toString(),
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         barY(data, {
  //           x: "year",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/cumulative-expenses.png",
  //   { style: "body { width: 700px; }" },
  // );

  // // Buyer home value and equity
  // const buyerHomeValue = results.filter((d) =>
  //   d.category === "buyer" &&
  //   [
  //     "homeValue",
  //     "homeEquity",
  //   ].includes(d.variable)
  // );
  // await saveChart(
  //   buyerHomeValue,
  //   (data) =>
  //     plot({
  //       title: "Buyer - Home value and equity",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         ticks: [2000, 2004, 2009, 2014, 2019, 2024],
  //         tickFormat: (d) => d.toString(),
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         barY(data, {
  //           x: "year",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "variable",
  //         }),
  //       ],
  //     }),
  //   "test/output/buyer-home-value-equity.png",
  //   { style: "body { width: 700px; }" },
  // );
  // // Buyer home value increase and equity gains
  // const buyerHomeValueEquityIncrease = results.filter((d) =>
  //   d.category === "buyer" &&
  //   [
  //     "homeValueIncrease",
  //     "homeEquityGains",
  //   ].includes(d.variable)
  // );
  // await saveChart(
  //   buyerHomeValueEquityIncrease,
  //   (data) =>
  //     plot({
  //       title: "Buyer - Home value and equity increase",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         ticks: [2000, 2004, 2009, 2014, 2019, 2024],
  //         tickFormat: (d) => d.toString(),
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         barY(data, {
  //           x: "year",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "variable",
  //         }),
  //       ],
  //     }),
  //   "test/output/buyer-home-value-equity-increase.png",
  //   { style: "body { width: 700px; }" },
  // );

  // // GAINS
  // const gains = results.filter((d) =>
  //   [
  //     "marketGains",
  //     "tfsaGains",
  //     "tfsaContributions",
  //     "newStocks",
  //     // buyer
  //     "homeEquityGains",
  //   ].includes(d.variable)
  // );
  // await saveChart(
  //   gains,
  //   (data) =>
  //     plot({
  //       title: "Annual gains",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         ticks: [2000, 2004, 2009, 2014, 2019, 2024],
  //         tickFormat: (d) => d.toString(),
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         barY(data, {
  //           x: "year",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/annual-gains.png",
  //   { style: "body { width: 700px; }" },
  // );

  // // CUMULATIVE GAINS
  // const cumulativeGains = results.filter((d) =>
  //   [
  //     "stocks",
  //     "tfsa",
  //     // buyer
  //     "homeEquity",
  //   ].includes(d.variable)
  // );
  // await saveChart(
  //   cumulativeGains,
  //   (data) =>
  //     plot({
  //       title: "Cumulative gains",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         ticks: [2000, 2004, 2009, 2014, 2019, 2024],
  //         tickFormat: (d) => d.toString(),
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         barY(data, {
  //           x: "year",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/cumulative-gains.png",
  //   { style: "body { width: 700px; }" },
  // );

  // // Balance
  // const balance = results.filter((d) =>
  //   [
  //     "balance",
  //   ].includes(d.variable)
  // );
  // await saveChart(
  //   balance,
  //   (data) =>
  //     plot({
  //       title: "Annual balance (gains - expenses)",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         ticks: [2000, 2004, 2009, 2014, 2019, 2024],
  //         tickFormat: (d) => d.toString(),
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         barY(data, {
  //           x: "year",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/annual-balance.png",
  //   { style: "body { width: 700px; }" },
  // );

  // // Assets
  // const assets = results.filter((d) =>
  //   [
  //     "assets",
  //   ].includes(d.variable)
  // );
  // await saveChart(
  //   assets,
  //   (data) =>
  //     plot({
  //       title: "Assets",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         ticks: [2000, 2004, 2009, 2014, 2019, 2024],
  //         tickFormat: (d) => d.toString(),
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         barY(data, {
  //           x: "year",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/assets.png",
  //   { style: "body { width: 700px; }" },
  // );

  // // Difference in assets
  // const assetsDifference = results.filter((d) =>
  //   [
  //     "difference",
  //   ].includes(d.variable)
  // );
  // await saveChart(
  //   assetsDifference,
  //   (data) =>
  //     plot({
  //       title: "Assets difference",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         ticks: [2000, 2004, 2009, 2014, 2019, 2024],
  //         tickFormat: (d) => d.toString(),
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         barY(data, {
  //           x: "year",
  //           y: "amount",
  //           fill: "category",
  //           // fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/assets-difference.png",
  //   { style: "body { width: 700px; }" },
  // );

  //Just for now
  assertEquals(true, true);
});
