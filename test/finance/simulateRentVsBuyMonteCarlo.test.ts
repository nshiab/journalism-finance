import { assertEquals } from "jsr:@std/assert";
import simulateRentVsBuyMonteCarlo from "../../src/finance/simulateRentVsBuyMonteCarlo.ts";
import { saveChart } from "@nshiab/journalism-dataviz";
import {
  areaY,
  dodgeY,
  dotX,
  line,
  plot,
  ruleX,
  textX,
} from "@observablehq/plot";

Deno.test("should run a monte carlor simulation of rent vs buy", async () => {
  const simulationResults = simulateRentVsBuyMonteCarlo({
    iterations: 10_000,
    startingYear: 2000,
    numberOfYears: 25,
    annualAvgMarketReturnRate: 0.05,
    annualMarketReturnStdDev: 0.02,
    tfsaContributions: true,
    combinedTaxRate: 0.25,
    renter: {
      startingMonthlyRent: 1750,
      annualRentIncreaseAvg: 0.03,
      annualRentIncreaseStdDev: 0.02,
      securityDeposit: 1750,
      startingMonthlyInsurance: 75,
      annualInsuranceIncreaseAvg: 0.03,
      annualInsuranceIncreaseStdDev: 0.02,
    },
    buyer: {
      downPayment: 50_000,
      purchasePrice: 500_000,
      interestRateAvg: 0.05,
      interestRateStdDev: 0.02,
      purchaseFixedFees: 25_000,
      startingAnnualMaintenanceCost: 2500,
      annualMaintenanceIncreaseAvg: 0.03,
      annualMaintenanceIncreaseStdDev: 0.02,
      startingAnnualPropertyTax: 3500,
      annualPropertyTaxIncreaseAvg: 0.03,
      annualPropertyTaxIncreaseStdDev: 0.02,
      startingMonthlyCondoFee: 100,
      annualCondoFeeIncreaseAvg: 0.03,
      annualCondoFeeIncreaseStdDev: 0.02,
      startingMonthlyInsurance: 250,
      annualInsuranceIncreaseAvg: 0.03,
      annualInsuranceIncreaseStdDev: 0.02,
      appreciationRateAvg: 0.05,
      appreciationRateStdDev: 0.02,
      sellingFixedFees: 2000,
      sellingFixedIncreaseAvg: 0.03,
      sellingFixedIncreaseStdDev: 0.02,
      sellingCommissionRate: 0.04,
    },
  });

  const cumulativeExpenses = simulationResults.filter((d) =>
    d.variable === "cumulativeExpenses"
  );

  // Cumulative Expenses
  await saveChart(
    cumulativeExpenses,
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
          areaY(data, {
            x: "year",
            y1: "q10",
            y2: "q90",
            fill: "category",
            fillOpacity: 0.3,
            fx: "category",
          }),
          line(data, {
            x: "year",
            y: "q10",
            stroke: "category",
            strokeOpacity: 0.5,
            fx: "category",
          }),
          line(data, {
            x: "year",
            y: "q50",
            stroke: "category",
            fx: "category",
          }),
          line(data, {
            x: "year",
            y: "q90",
            stroke: "category",
            strokeOpacity: 0.5,
            fx: "category",
          }),
        ],
      }),
    "test/output/monte-carlo-cumulative-expenses.png",
    { style: "body { width: 700px; }" },
  );

  const assets = simulationResults.filter((d) => d.variable === "assets");

  // Assets
  await saveChart(
    assets,
    (data) =>
      plot({
        title: "Assets over time",
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
          areaY(data, {
            x: "year",
            y1: "q10",
            y2: "q90",
            fill: "category",
            fillOpacity: 0.3,
            fx: "category",
          }),
          line(data, {
            x: "year",
            y: "q10",
            stroke: "category",
            strokeOpacity: 0.5,
            fx: "category",
          }),
          line(data, {
            x: "year",
            y: "q50",
            stroke: "category",
            fx: "category",
          }),
          line(data, {
            x: "year",
            y: "q90",
            stroke: "category",
            strokeOpacity: 0.5,
            fx: "category",
          }),
        ],
      }),
    "test/output/monte-carlo-assets.png",
    { style: "body { width: 700px; }" },
  );

  const balance = simulationResults.filter((d) => d.variable === "balance");

  // Balance
  await saveChart(
    balance,
    (data) =>
      plot({
        title: "Balance over time",
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
          areaY(data, {
            x: "year",
            y1: "q10",
            y2: "q90",
            fill: "category",
            fillOpacity: 0.3,
            fx: "category",
          }),
          line(data, {
            x: "year",
            y: "q10",
            stroke: "category",
            strokeOpacity: 0.5,
            fx: "category",
          }),
          line(data, {
            x: "year",
            y: "q50",
            stroke: "category",
            fx: "category",
          }),
          line(data, {
            x: "year",
            y: "q90",
            stroke: "category",
            strokeOpacity: 0.5,
            fx: "category",
          }),
        ],
      }),
    "test/output/monte-carlo-balance.png",
    { style: "body { width: 700px; }" },
  );

  assertEquals(true, true);
});
