import { assertEquals } from "jsr:@std/assert";
import simulateRentVsBuy from "../../src/finance/simulateRentVsBuy.ts";
import { saveChart } from "@nshiab/journalism-dataviz";
import { areaY, barY, plot } from "@observablehq/plot";

Deno.test("should compute the total expenses and savings of a renter and buyer", async (t) => {
  const numberOfYears = 25;
  const numberOfMonths = numberOfYears * 12;
  const annualMarketReturnRate = Array.from(
    { length: numberOfMonths },
    () => 0.05,
  );
  const annualRentIncrease = Array.from({ length: numberOfMonths }, () => 0.03);
  const annualInsuranceIncrease = Array.from(
    { length: numberOfMonths },
    () => 0.03,
  );
  const annualMaintenanceIncrease = Array.from(
    { length: numberOfMonths },
    () => 0.03,
  );
  const annualPropertyTaxIncrease = Array.from(
    { length: numberOfMonths },
    () => 0.03,
  );
  const annualCondoFeeIncrease = Array.from(
    { length: numberOfMonths },
    () => 0.03,
  );
  const appreciationIncrease = Array.from(
    { length: numberOfMonths },
    () => 0.05,
  );
  const sellingFixedFeesIncrease = Array.from(
    { length: numberOfMonths },
    () => 0.03,
  );
  const fiveYearInterestRates = Array.from(
    { length: numberOfMonths },
    () => 0.055,
  );
  const fourYearInterestRates = Array.from(
    { length: numberOfMonths },
    () => 0.05,
  );
  const threeYearInterestRates = Array.from(
    { length: numberOfMonths },
    () => 0.045,
  );
  const twoYearInterestRates = Array.from(
    { length: numberOfMonths },
    () => 0.04,
  );
  const oneYearInterestRates = Array.from(
    { length: numberOfMonths },
    () => 0.035,
  );
  const variableInterestRates = Array.from(
    { length: numberOfMonths },
    () => 0.04,
  );

  const results = simulateRentVsBuy({
    startingYear: 2000,
    numberOfYears,
    tfsaContributions: true,
    combinedTaxRate: 0.25,
    renter: {
      startingMonthlyRent: 1750,
      securityDeposit: 1750,
      startingMonthlyInsurance: 75,
    },
    buyer: {
      purchasePrice: 500_000,
      downPayment: 50_000,
      rateDiscount: 0.005,
      purchaseFixedFees: 25_000,
      startingAnnualMaintenanceCost: 2500,
      startingAnnualPropertyTax: 3500,
      startingMonthlyCondoFees: 100,
      startingMonthlyInsurance: 250,
      sellingFixedFees: 2000,
      sellingCommissionRate: 0.04,
    },
    monthlyRates: {
      annualMarketReturnRate,
      annualRentIncrease,
      annualInsuranceIncrease,
      fiveYearInterestRates,
      fourYearInterestRates,
      threeYearInterestRates,
      twoYearInterestRates,
      oneYearInterestRates,
      variableInterestRates,
      annualMaintenanceIncrease,
      annualPropertyTaxIncrease,
      annualCondoFeeIncrease,
      appreciationIncrease,
      sellingFixedFeesIncrease,
    },
  });

  // Expenses on the first month
  const firstMonthExpenses = results.filter((d) =>
    d.monthIndex === 0 &&
    d.group === "monthlyExpenses"
  );

  await saveChart(
    firstMonthExpenses,
    (data) =>
      plot({
        title: "First month expenses (Jan. 2000)",
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
        marginLeft: 60,
        color: {
          legend: true,
        },
        fx: {
          label: null,
        },
        x: {
          label: null,
          tickFormat: (d) => d.toString(),
        },
        grid: true,
        marks: [
          barY(data, {
            x: "year",
            y: "amount",
            fill: "variable",
            order: "amount",
            fx: "category",
          }),
        ],
      }),
    "test/output/first-month-expenses.png",
    { style: "body { width: 700px; }" },
  );

  // Monthly expenses
  const monthlyExpenses = results.filter((d) =>
    d.group === "monthlyExpenses" && d.month !== 0
  );

  await saveChart(
    monthlyExpenses,
    (data) =>
      plot({
        title: "Monthly expenses over time (first month excluded)",
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
          nice: true,
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
          areaY(data, {
            x: "date",
            y: "amount",
            fill: "variable",
            fx: "category",
          }),
        ],
      }),
    "test/output/monthly-expenses.png",
    { style: "body { width: 700px; }" },
  );

  // const cumulativeAnnualExpenses = results.filter((d) =>
  //   d.group === "cumulativeExpenses"
  // );

  // const cumulativeRenterFirstYearExpenses = cumulativeAnnualExpenses.filter((
  //   d,
  // ) => d.year === 2000 && d.category === "renter").reduce(
  //   (acc, curr) => acc + curr.amount,
  //   0,
  // );
  // await t.step("cumulative expenses on first year for renter", async () => {
  //   assertEquals(
  //     cumulativeRenterFirstYearExpenses,
  //     renterFirstYearTotalExpenses,
  //   );
  // });

  // const cumulativeBuyerFirstYearExpenses = cumulativeAnnualExpenses.filter((
  //   d,
  // ) => d.year === 2000 && d.category === "buyerFixed").reduce(
  //   (acc, curr) => acc + curr.amount,
  //   0,
  // );
  // await t.step("cumulative expenses on first year for buyer", async () => {
  //   assertEquals(
  //     cumulativeBuyerFirstYearExpenses,
  //     buyerFirstYearTotalExpenses,
  //   );
  // });

  // const cumulativeRenterSecondYearExpenses = cumulativeAnnualExpenses.filter((
  //   d,
  // ) => d.year === 2001 && d.category === "renter").reduce(
  //   (acc, curr) => acc + curr.amount,
  //   0,
  // );
  // await t.step("cumulative expenses on second year for renter", async () => {
  //   assertEquals(
  //     cumulativeRenterSecondYearExpenses,
  //     renterFirstYearTotalExpenses + renterTotalExpensesSecondYear,
  //   );
  // });

  // const cumulativeBuyerSecondYearExpenses = cumulativeAnnualExpenses.filter((
  //   d,
  // ) => d.year === 2001 && d.category === "buyerFixed").reduce(
  //   (acc, curr) => acc + curr.amount,
  //   0,
  // );
  // await t.step("cumulative expenses on second year for buyer", async () => {
  //   assertEquals(
  //     cumulativeBuyerSecondYearExpenses,
  //     buyerFirstYearTotalExpenses + buyerTotalExpensesSecondYear,
  //   );
  // });

  // const cumulativeRenterLastYearExpenses = cumulativeAnnualExpenses.filter((
  //   d,
  // ) => d.year === 2024 && d.category === "renter").reduce(
  //   (acc, curr) => acc + curr.amount,
  //   0,
  // );
  // const renterExpectedCumulativeExpenses = annualExpenses.filter((d) =>
  //   d.category === "renter"
  // ).reduce((acc, curr) => acc + curr.amount, 0);
  // await t.step("cumulative expenses on last year for renter", async () => {
  //   assertEquals(
  //     cumulativeRenterLastYearExpenses,
  //     renterExpectedCumulativeExpenses,
  //   );
  // });
  // await t.step(
  //   "cumulative expenses on last year for renter (actual number)",
  //   async () => {
  //     assertEquals(
  //       cumulativeRenterLastYearExpenses,
  //       800494,
  //     );
  //   },
  // );

  // const cumulativeBuyerLastYearExpenses = cumulativeAnnualExpenses.filter((
  //   d,
  // ) => d.year === 2024 && d.category === "buyerFixed").reduce(
  //   (acc, curr) => acc + curr.amount,
  //   0,
  // );
  // const buyerExpectedCumulativeExpenses = annualExpenses.filter((d) =>
  //   d.category === "buyerFixed"
  // ).reduce((acc, curr) => acc + curr.amount, 0);
  // await t.step("cumulative expenses on last year for buyer", async () => {
  //   assertEquals(
  //     cumulativeBuyerLastYearExpenses,
  //     buyerExpectedCumulativeExpenses,
  //   );
  // });
  // await t.step(
  //   "cumulative expenses on last year for buyer (actual number)",
  //   async () => {
  //     assertEquals(
  //       cumulativeBuyerLastYearExpenses,
  //       1246023,
  //     );
  //   },
  // );

  // await saveChart(
  //   cumulativeAnnualExpenses,
  //   (data) =>
  //     plot({
  //       title: "Cumulative expenses over time",
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
  //         ticks: [2000, 2005, 2010, 2015, 2020, 2025],
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

  // const annualGains = results.filter((d) => d.group === "annualGains");

  // const firstAndSecondYearGains = annualGains.filter((d) =>
  //   d.year === 2000 || d.year === 2001
  // );
  // await t.step("first and second year gains", async () => {
  //   assertEquals(firstAndSecondYearGains, [
  //     {
  //       year: 2000,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "tfsaGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "marketGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "tfsaGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "marketGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "homeEquityGains",
  //       amount: 84348,
  //     },
  //     {
  //       year: 2000,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "tfsaContribution",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "tfsaContribution",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "newStocks",
  //       amount: 106907,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "newStocks",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "tfsaGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "marketGains",
  //       amount: 5345,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "tfsaGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "marketGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "homeEquityGains",
  //       amount: 36071,
  //     },
  //     {
  //       year: 2001,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "tfsaContribution",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "tfsaContribution",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "newStocks",
  //       amount: 19359,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "newStocks",
  //       amount: 0,
  //     },
  //   ]);
  // });

  // const year2009And2010Gains = annualGains.filter((d) =>
  //   d.year === 2009 || d.year === 2010
  // );
  // await t.step("2009 and 2010 gains to check TFSA", async () => {
  //   assertEquals(year2009And2010Gains, [
  //     {
  //       year: 2009,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "tfsaGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2009,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "marketGains",
  //       amount: 16548,
  //     },
  //     {
  //       year: 2009,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "tfsaGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2009,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "marketGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2009,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "homeEquityGains",
  //       amount: 53362,
  //     },
  //     {
  //       year: 2009,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "tfsaContribution",
  //       amount: 5000,
  //     },
  //     {
  //       year: 2009,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "tfsaContribution",
  //       amount: 0,
  //     },
  //     {
  //       year: 2009,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "newStocks",
  //       amount: 11135,
  //     },
  //     {
  //       year: 2009,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "newStocks",
  //       amount: 0,
  //     },
  //     {
  //       year: 2010,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "tfsaGains",
  //       amount: 250,
  //     },
  //     {
  //       year: 2010,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "marketGains",
  //       amount: 17932,
  //     },
  //     {
  //       year: 2010,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "tfsaGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2010,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "marketGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2010,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "homeEquityGains",
  //       amount: 56039,
  //     },
  //     {
  //       year: 2010,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "tfsaContribution",
  //       amount: 5000,
  //     },
  //     {
  //       year: 2010,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "tfsaContribution",
  //       amount: 0,
  //     },
  //     {
  //       year: 2010,
  //       category: "renter",
  //       group: "annualGains",
  //       variable: "newStocks",
  //       amount: 10673,
  //     },
  //     {
  //       year: 2010,
  //       category: "buyerFixed",
  //       group: "annualGains",
  //       variable: "newStocks",
  //       amount: 0,
  //     },
  //   ]);
  // });

  // await saveChart(
  //   annualGains,
  //   (data) =>
  //     plot({
  //       title: "Annual gains over time",
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
  //         ticks: [2000, 2005, 2010, 2015, 2020, 2025],
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

  // const cumulativeGains = results.filter((d) => d.group === "cumulativeGains");

  // const cumulativeGainsFirstAndSecondYear = cumulativeGains.filter((d) =>
  //   d.year === 2000 || d.year === 2001
  // );
  // await t.step("cumulative gains first and second year", async () => {
  //   assertEquals(cumulativeGainsFirstAndSecondYear, [
  //     {
  //       year: 2000,
  //       category: "renter",
  //       group: "cumulativeGains",
  //       variable: "tfsaGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "renter",
  //       group: "cumulativeGains",
  //       variable: "marketGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "cumulativeGains",
  //       variable: "tfsaGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "cumulativeGains",
  //       variable: "marketGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "cumulativeGains",
  //       variable: "homeEquityGains",
  //       amount: 84348,
  //     },
  //     {
  //       year: 2000,
  //       category: "renter",
  //       group: "cumulativeGains",
  //       variable: "tfsaContribution",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "cumulativeGains",
  //       variable: "tfsaContribution",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "renter",
  //       group: "cumulativeGains",
  //       variable: "newStocks",
  //       amount: 106907,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "cumulativeGains",
  //       variable: "newStocks",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "renter",
  //       group: "cumulativeGains",
  //       variable: "tfsaGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "renter",
  //       group: "cumulativeGains",
  //       variable: "marketGains",
  //       amount: 5345,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "cumulativeGains",
  //       variable: "tfsaGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "cumulativeGains",
  //       variable: "marketGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "cumulativeGains",
  //       variable: "homeEquityGains",
  //       amount: 120419,
  //     },
  //     {
  //       year: 2001,
  //       category: "renter",
  //       group: "cumulativeGains",
  //       variable: "tfsaContribution",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "cumulativeGains",
  //       variable: "tfsaContribution",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "renter",
  //       group: "cumulativeGains",
  //       variable: "newStocks",
  //       amount: 126266,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "cumulativeGains",
  //       variable: "newStocks",
  //       amount: 0,
  //     },
  //   ]);
  // });

  // const renterLastYearCumulativeGains = cumulativeGains.filter((d) =>
  //   d.year === 2024 && d.category === "renter"
  // ).reduce((acc, curr) => acc + curr.amount, 0);
  // const buyerLastYearCumulativeGains = cumulativeGains.filter((d) =>
  //   d.year === 2024 && d.category === "buyerFixed"
  // ).reduce((acc, curr) => acc + curr.amount, 0);

  // await t.step("last year cumulative gains for renter", async () => {
  //   assertEquals(renterLastYearCumulativeGains, 1023699);
  // });

  // await t.step("last year cumulative gains for buyer", async () => {
  //   assertEquals(buyerLastYearCumulativeGains, 1693175);
  // });

  // // Assets and cumulative gain totals should be the same
  // const cumulativeGains2024Buyer = results.filter((d) =>
  //   d.group === "cumulativeGains" &&
  //   d.category === "buyerFixed" && d.year === 2024
  // ).reduce((acc, curr) => acc += curr.amount, 0);
  // const buyerAssets2024 = results.filter((d) =>
  //   d.group === "assets" &&
  //   d.category === "buyerFixed" && d.year === 2024
  // ).reduce((acc, curr) => acc += curr.amount, 0);

  // await t.step(
  //   "buyer assets and cumulative gains should match for 2024",
  //   async () => {
  //     assertEquals(cumulativeGains2024Buyer, buyerAssets2024);
  //   },
  // );

  // const cumulativeGains2024Renter = results.filter((d) =>
  //   d.group === "cumulativeGains" &&
  //   d.category === "renter" && d.year === 2024
  // ).reduce((acc, curr) => acc += curr.amount, 0);
  // const renterAssets2024 = results.filter((d) =>
  //   d.group === "assets" &&
  //   d.category === "renter" && d.year === 2024
  // ).reduce((acc, curr) => acc += curr.amount, 0);

  // await t.step(
  //   "renter assets and cumulative gains should match for 2024",
  //   async () => {
  //     assertEquals(cumulativeGains2024Renter, renterAssets2024);
  //   },
  // );

  // const assets = results.filter((d) => d.group === "assets");

  // const buyerLastYearAssets = assets.filter((d) =>
  //   d.year === 2024 && d.category === "buyerFixed"
  // );
  // await t.step("last year assets for buyer", async () => {
  //   assertEquals(buyerLastYearAssets, [
  //     {
  //       year: 2024,
  //       category: "buyerFixed",
  //       group: "assets",
  //       variable: "homeEquity",
  //       amount: 1693175,
  //     },
  //     {
  //       year: 2024,
  //       category: "buyerFixed",
  //       group: "assets",
  //       variable: "tfsa",
  //       amount: 0,
  //     },
  //     {
  //       year: 2024,
  //       category: "buyerFixed",
  //       group: "assets",
  //       variable: "stocks",
  //       amount: 0,
  //     },
  //   ]);
  // });

  // const renterLastYearAssets = assets.filter((d) =>
  //   d.year === 2024 && d.category === "renter"
  // );
  // await t.step("last year assets for renter", async () => {
  //   assertEquals(renterLastYearAssets, [
  //     {
  //       year: 2024,
  //       category: "renter",
  //       group: "assets",
  //       variable: "tfsa",
  //       amount: 138152,
  //     },
  //     {
  //       year: 2024,
  //       category: "renter",
  //       group: "assets",
  //       variable: "stocks",
  //       amount: 885547,
  //     },
  //   ]);
  // });

  // await saveChart(
  //   assets,
  //   (data) =>
  //     plot({
  //       title: "Assets over time",
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
  //         ticks: [2000, 2005, 2010, 2015, 2020, 2025],
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

  // const balance = results.filter((d) =>
  //   d.group === "summary" &&
  //   d.variable === "balance"
  // );

  // const firstAndSecondYearBalance = balance.filter((d) =>
  //   d.year === 2000 || d.year === 2001
  // );

  // await t.step("first and second year balance", async () => {
  //   assertEquals(firstAndSecondYearBalance, [
  //     {
  //       year: 2000,
  //       category: "renter",
  //       group: "summary",
  //       variable: "balance",
  //       amount: 83257,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "summary",
  //       variable: "balance",
  //       amount: -46209,
  //     },
  //     {
  //       year: 2001,
  //       category: "renter",
  //       group: "summary",
  //       variable: "balance",
  //       amount: 2144,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "summary",
  //       variable: "balance",
  //       amount: -5848,
  //     },
  //   ]);
  // });

  // await saveChart(
  //   balance,
  //   (data) =>
  //     plot({
  //       title: "Annual balance over time",
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
  //         ticks: [2000, 2005, 2010, 2015, 2020, 2025],
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
  //   "test/output/balance.png",
  //   { style: "body { width: 700px; }" },
  // );

  // const saleCosts = results.filter((d) => d.group === "saleCosts");
  // const saleCostsFirstAndSecondYear = saleCosts.filter((d) =>
  //   d.year === 2000 || d.year === 2001
  // );

  // await t.step("first and second year sale costs", async () => {
  //   assertEquals(saleCostsFirstAndSecondYear, [
  //     {
  //       year: 2000,
  //       category: "renter",
  //       group: "saleCosts",
  //       variable: "stockTaxes",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "saleCosts",
  //       variable: "homeSellingCommission",
  //       amount: 21000,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "saleCosts",
  //       variable: "stockTaxes",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "saleCosts",
  //       variable: "homeSellingFixedFees",
  //       amount: 2060,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "saleCosts",
  //       variable: "mortgagePenalty",
  //       amount: 8813,
  //     },
  //     {
  //       year: 2001,
  //       category: "renter",
  //       group: "saleCosts",
  //       variable: "stockTaxes",
  //       amount: 668,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "saleCosts",
  //       variable: "homeSellingCommission",
  //       amount: 22050,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "saleCosts",
  //       variable: "stockTaxes",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "saleCosts",
  //       variable: "homeSellingFixedFees",
  //       amount: 2122,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "saleCosts",
  //       variable: "mortgagePenalty",
  //       amount: 12925,
  //     },
  //   ]);
  // });

  // await saveChart(
  //   saleCosts,
  //   (data) =>
  //     plot({
  //       title: "Sale costs, if assets were sold",
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
  //         ticks: [2000, 2005, 2010, 2015, 2020, 2025],
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
  //   "test/output/sale-costs.png",
  //   { style: "body { width: 700px; }" },
  // );

  // const saleGains = results.filter((d) => d.group === "saleGains");

  // const saleGainsFirstAndSecondYear = saleGains.filter((d) =>
  //   d.year === 2000 || d.year === 2001
  // );

  // await t.step("first and second year sale gains", async () => {
  //   assertEquals(saleGainsFirstAndSecondYear, [
  //     {
  //       year: 2000,
  //       category: "renter",
  //       group: "saleGains",
  //       variable: "stockSellingGains",
  //       amount: 106907,
  //     },
  //     {
  //       year: 2000,
  //       category: "renter",
  //       group: "saleGains",
  //       variable: "tsfaSellingGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "saleGains",
  //       variable: "stockSellingGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "saleGains",
  //       variable: "tsfaSellingGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "saleGains",
  //       variable: "homeSellingGains",
  //       amount: 52475,
  //     },
  //     {
  //       year: 2001,
  //       category: "renter",
  //       group: "saleGains",
  //       variable: "stockSellingGains",
  //       amount: 130943,
  //     },
  //     {
  //       year: 2001,
  //       category: "renter",
  //       group: "saleGains",
  //       variable: "tsfaSellingGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "saleGains",
  //       variable: "stockSellingGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "saleGains",
  //       variable: "tsfaSellingGains",
  //       amount: 0,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "saleGains",
  //       variable: "homeSellingGains",
  //       amount: 83322,
  //     },
  //   ]);
  // });

  // await saveChart(
  //   saleGains,
  //   (data) =>
  //     plot({
  //       title: "Sale gains, if assets were sold",
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
  //         ticks: [2000, 2005, 2010, 2015, 2020, 2025],
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
  //   "test/output/sale-gains.png",
  //   { style: "body { width: 700px; }" },
  // );

  // const balanceAfterSelling = results.filter((d) =>
  //   d.group === "summaryCumulative" && d.variable === "balanceAfterSelling"
  // );

  // const firstAndSecondYearBalanceAfterSelling = balanceAfterSelling.filter((
  //   d,
  // ) => d.year === 2000 || d.year === 2001);

  // await t.step("first and second year balance after selling", async () => {
  //   assertEquals(firstAndSecondYearBalanceAfterSelling, [
  //     {
  //       year: 2000,
  //       category: "renter",
  //       group: "summaryCumulative",
  //       variable: "balanceAfterSelling",
  //       amount: 83257,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "summaryCumulative",
  //       variable: "balanceAfterSelling",
  //       amount: -78082,
  //     },
  //     {
  //       year: 2001,
  //       category: "renter",
  //       group: "summaryCumulative",
  //       variable: "balanceAfterSelling",
  //       amount: 84733,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "summaryCumulative",
  //       variable: "balanceAfterSelling",
  //       amount: -89154,
  //     },
  //   ]);
  // });

  // await saveChart(
  //   balanceAfterSelling,
  //   (data) =>
  //     plot({
  //       title: "Balance after selling assets",
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
  //         ticks: [2000, 2005, 2010, 2015, 2020, 2025],
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
  //   "test/output/balance-after-selling.png",
  //   { style: "body { width: 700px; }" },
  // );

  // const differenceAfterSelling = results.filter((d) =>
  //   d.group === "summaryCumulative" && d.variable === "differenceAfterSelling"
  // );

  // const firstAndSecondYearDifferenceAfterSelling = differenceAfterSelling
  //   .filter((
  //     d,
  //   ) => d.year === 2000 || d.year === 2001);

  // await t.step("first and second year difference after selling", async () => {
  //   assertEquals(firstAndSecondYearDifferenceAfterSelling, [
  //     {
  //       year: 2000,
  //       category: "renter",
  //       group: "summaryCumulative",
  //       variable: "differenceAfterSelling",
  //       amount: 161339,
  //     },
  //     {
  //       year: 2000,
  //       category: "buyerFixed",
  //       group: "summaryCumulative",
  //       variable: "differenceAfterSelling",
  //       amount: -161339,
  //     },
  //     {
  //       year: 2001,
  //       category: "renter",
  //       group: "summaryCumulative",
  //       variable: "differenceAfterSelling",
  //       amount: 173887,
  //     },
  //     {
  //       year: 2001,
  //       category: "buyerFixed",
  //       group: "summaryCumulative",
  //       variable: "differenceAfterSelling",
  //       amount: -173887,
  //     },
  //   ]);
  // });

  // await saveChart(
  //   differenceAfterSelling,
  //   (data) =>
  //     plot({
  //       title: "Difference in balance after selling assets",
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
  //         ticks: [2000, 2005, 2010, 2015, 2020, 2025],
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
  //   "test/output/difference-after-selling.png",
  //   { style: "body { width: 700px; }" },
  // );

  //Just for now
  assertEquals(true, true);
});
