import { assertEquals } from "jsr:@std/assert";
import simulateRentVsBuyMonteCarlo from "../../src/finance/simulateRentVsBuyMonteCarlo.ts";
import { saveChart } from "@nshiab/journalism-dataviz";
import {
  areaY,
  binX,
  dodgeY,
  dotX,
  frame,
  line,
  lineY,
  plot,
  ruleX,
  ruleY,
  text,
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
      rateDiscount: 0.005,
      fiveYearInterestRateAvg: 0.055,
      fiveYearInterestRateStdDev: 0.01,
      fourYearInterestRateAvg: 0.05,
      fourYearInterestRateStdDev: 0.01,
      threeYearInterestRateAvg: 0.045,
      threeYearInterestRateStdDev: 0.01,
      twoYearInterestRateAvg: 0.04,
      twoYearInterestRateStdDev: 0.01,
      oneYearInterestRateAvg: 0.035,
      oneYearInterestRateStdDev: 0.01,
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

  const rates = simulationResults.rates;

  await saveChart(
    rates,
    (data) => {
      if (!Array.isArray(data)) {
        throw new Error("Data should be an array");
      }

      const n = 3; // number of facet columns
      const keys = Array.from(new Set(data.map((d) => d.variable)));
      const index = new Map(keys.map((key, i) => [key, i]));
      //@ts-expect-error It's okay
      const fx = (key) => index.get(key) % n;
      //@ts-expect-error It's okay
      const fy = (key) => Math.floor(index.get(key) / n);

      return plot({
        title: "Distribution of randomly generated rates",
        subtitle: `For a Monte Carlo simulation with ${
          data.filter((d) => d.variable === "annualMarketReturnRate").length
            .toLocaleString()
        } iterations.`,
        y: { insetTop: 20 },
        height: 500,
        width: 800,
        x: { tickFormat: "%", grid: true, ticks: 4 },
        fx: { tickFormat: (d) => "" },
        fy: { tickFormat: (d) => "" },
        marks: [
          areaY(
            data,
            binX({ y: "count", filter: null }, {
              x: "value",
              //@ts-expect-error It's okay
              fill: "#ccc",
              curve: "step",
              //@ts-expect-error It's okay
              fx: (d) => fx(d.variable),
              //@ts-expect-error It's okay
              fy: (d) => fy(d.variable),
            }),
          ),
          lineY(
            data,
            binX({ y: "count", filter: null }, {
              x: "value",
              //@ts-expect-error It's okay
              stroke: "black",
              curve: "step",
              //@ts-expect-error It's okay
              fx: (d) => fx(d.variable),
              //@ts-expect-error It's okay
              fy: (d) => fy(d.variable),
            }),
          ),
          text(keys, { fx, fy, frameAnchor: "top-left", dx: 6, dy: 6 }),
          frame(),
        ],
      });
    },
    "test/output/monte-carlo-rates.png",
    { style: "body { width: 700px; }" },
  );

  const balanceAfterSelling = simulationResults.results.filter((d) =>
    d.variable === "balanceAfterSelling"
  );

  await saveChart(
    balanceAfterSelling,
    (data) => {
      if (!Array.isArray(data)) {
        throw new Error("Data should be an array");
      }
      return plot({
        title: "Balance after selling assets",
        subtitle: `Monte Carlo simulation with ${
          data[0].items.toLocaleString()
        } iterations.`,
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
          ruleY([0], { strokeOpacity: 0.5, strokeDasharray: "4 4" }),
          areaY(data, {
            x: "year",
            y1: "q25",
            y2: "q75",
            fill: "category",
            fillOpacity: 0.2,
            fx: "category",
          }),
          areaY(data, {
            x: "year",
            y1: "q10",
            y2: "q90",
            fill: "category",
            fillOpacity: 0.15,
            fx: "category",
          }),
          line(data, {
            x: "year",
            y: "q50",
            stroke: "category",
            fx: "category",
          }),
        ],
      });
    },
    "test/output/monte-carlo-balance-after-selling.png",
    { style: "body { width: 700px; }" },
  );

  const differenceAfterSelling = simulationResults.results.filter((d) =>
    d.variable === "differenceAfterSelling"
  );

  await saveChart(
    differenceAfterSelling,
    (data) => {
      if (!Array.isArray(data)) {
        throw new Error("Data should be an array");
      }
      return plot({
        title: "Difference in balance after selling assets",
        subtitle: `Monte Carlo simulation with ${
          data[0].items.toLocaleString()
        } iterations.`,
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
          ruleY([0], { strokeOpacity: 0.5, strokeDasharray: "4 4" }),
          areaY(data, {
            x: "year",
            y1: "q25",
            y2: "q75",
            fill: "category",
            fillOpacity: 0.2,
            fx: "category",
          }),
          areaY(data, {
            x: "year",
            y1: "q10",
            y2: "q90",
            fill: "category",
            fillOpacity: 0.15,
            fx: "category",
          }),
          line(data, {
            x: "year",
            y: "q50",
            stroke: "category",
            fx: "category",
          }),
        ],
      });
    },
    "test/output/monte-carlo-difference-after-selling.png",
    { style: "body { width: 700px; }" },
  );

  const lastYearDifferenceAfterSelling =
    simulationResults.lastYearDifferenceResults;

  await saveChart(
    lastYearDifferenceAfterSelling,
    (data) => {
      if (!Array.isArray(data)) {
        throw new Error("Data should be an array");
      }

      const buyerWins = data.filter((d) => d.amount > 0).length;
      const renterWins = data.filter((d) => d.amount < 0).length;
      const buyerWinsPercent = Math.round((buyerWins / (data.length)) * 100);
      const renterWinsPercent = Math.round((renterWins / (data.length)) * 100);
      const buyerAvgWin = Math.round(
        data
          .filter((d) => d.amount > 0)
          .reduce((sum, curr) => sum + curr.amount, 0) / buyerWins,
      );
      const renterAvgWin = Math.round(
        Math.abs(
          data
            .filter((d) => d.amount < 0)
            .reduce((sum, curr) => sum + curr.amount, 0) / renterWins,
        ),
      );

      return plot({
        title: "Final difference in balance after selling assets",
        subtitle:
          `Monte Carlo simulation with ${data.length.toLocaleString()} iterations.`,
        x: {
          // nice: true,
          label: null,
          tickFormat: (d) =>
            Math.abs(d) < 1000
              ? `+$${Math.abs(d)}`
              : Math.abs(d) < 1_000_000
              ? `+$${Math.abs(d) / 1000}k`
              : `+$${Math.abs(d) / 1_000_000}M`,
        },
        height: 450,
        grid: true,
        marks: [
          dotX(
            data,
            dodgeY({
              x: "amount",
              fill: "hasMore",
              r: 1,
              padding: 0.1,
            }),
          ),
          ruleX([0]),
          textX([{ hasMore: "buyer", amount: 0 }], {
            x: "amount",
            text: (d) =>
              `Buyer ends up with $${buyerAvgWin.toLocaleString()} more on average, ${buyerWinsPercent}% of the time.`,
            dx: 50,
            dy: -175,
            fill: "hasMore",
            stroke: "white",
            lineWidth: 15,
            textAnchor: "start",
            fontSize: 12,
          }),
          textX([{ hasMore: "renter", amount: 0 }], {
            x: "amount",
            text: (d) =>
              `Renter ends up with $${renterAvgWin.toLocaleString()} more on average, ${renterWinsPercent}% of the time.`,
            dx: -50,
            dy: -175,
            fill: "hasMore",
            stroke: "white",
            lineWidth: 15,
            textAnchor: "end",
            fontSize: 12,
          }),
        ],
      });
    },
    "test/output/monte-carlo-final-result.png",
    { style: "body { width: 700px; }" },
  );

  assertEquals(true, true);
});
