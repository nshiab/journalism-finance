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
    annualMarketReturnStdDev: 0.01,
    tfsaContributions: true,
    combinedTaxRate: 0.25,
    renter: {
      startingMonthlyRent: 1750,
      annualRentIncreaseAvg: 0.03,
      annualRentIncreaseStdDev: 0.01,
      securityDeposit: 1750,
      startingMonthlyInsurance: 75,
      annualInsuranceIncreaseAvg: 0.03,
      annualInsuranceIncreaseStdDev: 0.01,
    },
    buyer: {
      downPayment: 50_000,
      purchasePrice: 500_000,
      interestRateAvg: 0.05,
      interestRateStdDev: 0.01,
      fourYearInterestRateAvg: 0.045,
      fourYearInterestRateStdDev: 0.001,
      threeYearInterestRateAvg: 0.04,
      threeYearInterestRateStdDev: 0.001,
      twoYearInterestRateAvg: 0.035,
      twoYearInterestRateStdDev: 0.001,
      oneYearInterestRateAvg: 0.03,
      oneYearInterestRateStdDev: 0.001,
      purchaseFixedFees: 25_000,
      startingAnnualMaintenanceCost: 2500,
      annualMaintenanceIncreaseAvg: 0.03,
      annualMaintenanceIncreaseStdDev: 0.01,
      startingAnnualPropertyTax: 3500,
      annualPropertyTaxIncreaseAvg: 0.03,
      annualPropertyTaxIncreaseStdDev: 0.01,
      startingMonthlyCondoFee: 100,
      annualCondoFeeIncreaseAvg: 0.03,
      annualCondoFeeIncreaseStdDev: 0.01,
      startingMonthlyInsurance: 250,
      annualInsuranceIncreaseAvg: 0.03,
      annualInsuranceIncreaseStdDev: 0.01,
      appreciationRateAvg: 0.05,
      appreciationRateStdDev: 0.01,
      sellingFixedFees: 2000,
      sellingFixedIncreaseAvg: 0.03,
      sellingFixedIncreaseStdDev: 0.01,
      sellingCommissionRate: 0.04,
    },
  });

  const balanceAfterSelling = simulationResults.results.filter((d) =>
    d.variable === "balanceAfterSelling"
  );

  await saveChart(
    balanceAfterSelling,
    (data) =>
      plot({
        title: "Balance after selling assets",
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
          ticks: [2000, 2005, 2010, 2015, 2020],
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
    "test/output/monte-carlo-balance-after-selling.png",
    { style: "body { width: 700px; }" },
  );

  const differenceAfterSelling = simulationResults.results.filter((d) =>
    d.variable === "differenceAfterSelling"
  );

  await saveChart(
    differenceAfterSelling,
    (data) =>
      plot({
        title: "Difference in balance after selling assets",
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
          ticks: [2000, 2005, 2010, 2015, 2020],
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
    "test/output/monte-carlo-difference-after-selling.png",
    { style: "body { width: 700px; }" },
  );

  const lastYearDifferenceAfterSelling =
    simulationResults.lastYearDifferenceResults;

  await saveChart(
    lastYearDifferenceAfterSelling,
    (data) =>
      plot({
        title: "Final difference in balance after selling assets",
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
        height: 450,
        marginLeft: 60,
        color: {
          legend: true,
        },
        grid: true,
        marks: [
          dotX(
            data,
            dodgeY({
              x: "amount",
              fill: "hasMore",
              r: 1.1,
              padding: 0.1,
            }),
          ),
        ],
      }),
    "test/output/monte-carlo-final-result.png",
    { style: "body { width: 700px; }" },
  );

  assertEquals(true, true);
});
