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

    tfsaContributions: true,
    combinedTaxRate: 0.25,
    renter: {
      startingMonthlyRent: 1750,
      securityDeposit: 1750,
      startingMonthlyInsurance: 75,
    },
    buyer: {
      downPayment: 50_000,
      purchasePrice: 500_000,
      rateDiscount: 0.005,
      purchaseFixedFees: 25_000,
      startingAnnualMaintenanceCost: 2500,
      startingAnnualPropertyTax: 3500,
      startingMonthlyCondoFees: 100,
      startingMonthlyInsurance: 250,
      sellingFixedFees: 2000,
      sellingCommissionRate: 0.04,
    },
    rates: {
      monthlyAvgMarketReturnRate: 0.005,
      monthlyMarketReturnStdDev: 0.001,
      annualRentIncreaseAvg: 0.03,
      annualRentIncreaseStdDev: 0.01,
      annualInsuranceIncreaseAvg: 0.03,
      annualInsuranceIncreaseStdDev: 0.01,
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
      variableInterestRateAvg: 0.04,
      variableInterestRateStdDev: 0.01,
      annualMaintenanceIncreaseAvg: 0.03,
      annualMaintenanceIncreaseStdDev: 0.01,
      annualPropertyTaxIncreaseAvg: 0.03,
      annualPropertyTaxIncreaseStdDev: 0.01,
      annualCondoFeeIncreaseAvg: 0.03,
      annualCondoFeeIncreaseStdDev: 0.01,
      appreciationRateAvg: 0.05,
      appreciationRateStdDev: 0.01,
      sellingFixedIncreaseAvg: 0.03,
      sellingFixedIncreaseStdDev: 0.01,
    },
  }, { verbose: true });

  const rates = simulationResults.rates;
  for (const rate of rates) {
    if (rate.variable === "monthlyMarketReturnRate") {
      rate.value = rate.value * 12;
      rate.variable = "annualMarketReturnRate*";
    }
  }

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
          data.filter((d) => d.variable === "appreciationIncrease").length
            .toLocaleString()
        } iterations.`,
        caption:
          `*The simulation uses monthly market return rates, but they are annualized here for easier understanding.`,
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

  /**
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
          ruleY([0], { strokeOpacity: 0.5, strokeDasharray: "4 4" }),
          areaY(data, {
            x: "date",
            y1: "q25",
            y2: "q75",
            fill: "category",
            fillOpacity: 0.2,
            fx: "category",
          }),
          areaY(data, {
            x: "date",
            y1: "q10",
            y2: "q90",
            fill: "category",
            fillOpacity: 0.15,
            fx: "category",
          }),
          line(data, {
            x: "date",
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
   */

  const winners = simulationResults.winners;

  await saveChart(
    winners,
    (data) => {
      if (!Array.isArray(data)) {
        throw new Error("Data should be an array");
      }

      const min = Math.min(...data.map((d) => d.amount));
      const max = Math.max(...data.map((d) => d.amount));
      const middle = (min + max) / 2;

      const buyerFixedWins = data.filter((d) => d.category === "buyerFixed");
      const buyerFixedPerc = Math.round(
        buyerFixedWins.length /
          data.length * 100,
      );
      const buyerFixedAverage = Math.round(
        buyerFixedWins.reduce((sum, d) => sum + d.amount, 0) /
          buyerFixedWins.length,
      );

      const buyerVariableWins = data.filter((d) =>
        d.category === "buyerVariable"
      );
      const buyerVariablePerc = Math.round(
        buyerVariableWins.length /
          data.length * 100,
      );
      const buyerVariableAverage = Math.round(
        buyerVariableWins.reduce((sum, d) => sum + d.amount, 0) /
          buyerVariableWins.length,
      );

      const renterWins = data.filter((d) => d.category === "renter");
      const renterPerc = Math.round(
        renterWins.length /
          data.length * 100,
      );
      const renterAverage = Math.round(
        renterWins.reduce((sum, d) => sum + d.amount, 0) /
          renterWins.length,
      );

      return plot({
        title: "Balance after selling assets on last year",
        subtitle:
          `Monte Carlo simulation with ${data.length.toLocaleString()} iterations.`,
        x: {
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
        height: 500,
        grid: true,
        color: {
          legend: true,
        },
        marks: [
          dotX(
            data,
            dodgeY({
              x: "amount",
              fill: "category",
              r: 1,
              padding: 0.1,
              sort: "category",
            }),
          ),
          textX([{
            text:
              `The buyer with a fixed-rate mortgage wins ${buyerFixedPerc}% of times, with $${buyerFixedAverage.toLocaleString()} on average.`,
            category: "buyerFixed",
          }], {
            stroke: "white",
            fill: "category",
            fontSize: 12,
            lineWidth: 12,
            fontWeight: "bold",
            lineHeight: 1.2,
            x: middle,
            text: "text",
            dx: -200,
            dy: -225,
            lineAnchor: "top",
          }),
          textX([{
            text:
              `The buyer with a variable-rate mortgage wins ${buyerVariablePerc}% of times, with $${buyerVariableAverage.toLocaleString()} on average.`,
            category: "buyerVariable",
          }], {
            stroke: "white",
            fill: "category",
            fontSize: 12,
            lineWidth: 12,
            fontWeight: "bold",
            lineHeight: 1.2,
            x: middle,
            text: "text",
            dx: 0,
            dy: -225,
            lineAnchor: "top",
          }),
          textX([{
            text:
              `The renter wins ${renterPerc}% of times, with $${renterAverage.toLocaleString()} on average.`,
            category: "renter",
          }], {
            stroke: "white",
            fill: "category",
            fontSize: 12,
            lineWidth: 12,
            fontWeight: "bold",
            lineHeight: 1.2,
            x: middle,
            text: "text",
            dx: 200,
            dy: -225,
            lineAnchor: "top",
          }),
        ],
      });
    },
    "test/output/monte-carlo-final-result.png",
    { style: "body { width: 700px; }" },
  );

  assertEquals(true, true);
});
