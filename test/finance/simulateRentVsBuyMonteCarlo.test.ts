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
    numberOfYears: 25,
    annualAvgMarketReturnRate: 0.07,
    annualMarketReturnStdDev: 0.05,
    renter: {
      startingMonthlyRent: 1500,
      annualRentIncreaseAvg: 0.03,
      annualRentIncreaseStdDev: 0.03,
      securityDeposit: 2000,
      startingMonthlyInsurance: 100,
      annualInsuranceIncreaseAvg: 0.03,
      annualInsuranceIncreaseStdDev: 0.03,
    },
    buyer: {
      downPayment: 50000,
      purchasePrice: 500000,
      interestRate: 0.04,
      purchaseFixedFees: 20000,
      startingAnnualMaintenanceCost: 3000,
      annualMaintenanceIncreaseAvg: 0.03,
      annualMaintenanceIncreaseStdDev: 0.03,
      startingAnnualPropertyTax: 3500,
      annualPropertyTaxIncreaseAvg: 0.03,
      annualPropertyTaxIncreaseStdDev: 0.03,
      startingMonthlyCondoFee: 100,
      annualCondoFeeIncreaseAvg: 0.03,
      annualCondoFeeIncreaseStdDev: 0.03,
      startingMonthlyInsurance: 150,
      annualInsuranceIncreaseAvg: 0.05,
      annualInsuranceIncreaseStdDev: 0.03,
      appreciationRateAvg: 0.05,
      appreciationRateStdDev: 0.05,
    },
  });

  // Cumulative expenses
  const cumulativeExpenses = simulationResults.results.filter((d) =>
    [
      "cumulativeExpenses",
    ].includes(d.variable)
  );
  await saveChart(
    cumulativeExpenses,
    (data) =>
      plot({
        title: "Cumulative expenses",
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
        x: { ticks: [1, 5, 10, 15, 20, 25] },
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

  // Assets
  const assets = simulationResults.results.filter((d) =>
    [
      "assets",
    ].includes(d.variable)
  );
  await saveChart(
    assets,
    (data) =>
      plot({
        title: "Assets",
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
        x: { ticks: [1, 5, 10, 15, 20, 25] },
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

  // Difference in assets for renter
  const differenceRenter = simulationResults.results.filter((d) =>
    [
      "difference",
    ].includes(d.variable) && d.category === "renter"
  );
  await saveChart(
    differenceRenter,
    (data) =>
      plot({
        title:
          "Difference in assets from renter perspective (renter assets - buyer assets)",
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
        x: { ticks: [1, 5, 10, 15, 20, 25] },
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
          }),
          line(data, {
            x: "year",
            y: "q10",
            stroke: "category",
            strokeOpacity: 0.5,
          }),
          line(data, {
            x: "year",
            y: "q50",
            stroke: "category",
          }),
          line(data, {
            x: "year",
            y: "q90",
            stroke: "category",
            strokeOpacity: 0.5,
          }),
        ],
      }),
    "test/output/monte-carlo-difference-renter.png",
    { style: "body { width: 700px; }" },
  );

  // Difference in assets for renter
  const differenceBuyer = simulationResults.results.filter((d) =>
    [
      "difference",
    ].includes(d.variable) && d.category === "buyer"
  );
  await saveChart(
    differenceBuyer,
    (data) =>
      plot({
        title:
          "Difference in assets from buyer perspective (buyer assets - renter assets)",
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
        x: { ticks: [1, 5, 10, 15, 20, 25] },
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
          }),
          line(data, {
            x: "year",
            y: "q10",
            stroke: "category",
            strokeOpacity: 0.5,
          }),
          line(data, {
            x: "year",
            y: "q50",
            stroke: "category",
          }),
          line(data, {
            x: "year",
            y: "q90",
            stroke: "category",
            strokeOpacity: 0.5,
          }),
        ],
      }),
    "test/output/monte-carlo-difference-buyer.png",
    { style: "body { width: 700px; }" },
  );

  // Final year difference distribution
  // We remap buyer/renter
  const differenceAtFinalYear = simulationResults.finalYearResults.filter((d) =>
    [
      "difference",
    ].includes(d.variable) && d.category === "buyer"
  ).map((d) => ({
    ...d,
    category: d.amount >= 0 ? "buyerHasMore" : "renterHasMore",
  }));
  await saveChart(
    differenceAtFinalYear,
    (data) => {
      // Percentage of time buyer is positive
      if (Array.isArray(data) === false) {
        throw new Error("Data is not an array");
      }
      const totalCount = data.length;

      const buyer = data.filter((d) => d.category === "buyerHasMore");
      const renter = data.filter((d) => d.category === "renterHasMore");
      const buyerPositiveCount = buyer.length;
      const renterPositiveCount = renter.length;
      const percentageBuyerPositive = Math.round(
        buyerPositiveCount / totalCount * 100,
      );
      const percentageRenterPositive = Math.round(
        renterPositiveCount / totalCount * 100,
      );
      // We calculate the average assets for renter and buyer
      let averageBuyerAssets =
        buyer.reduce((acc, curr) => acc + curr.amount, 0) / buyer.length;
      averageBuyerAssets = averageBuyerAssets < 0 ? 0 : averageBuyerAssets;
      let averageRenterAssets =
        renter.reduce((acc, curr) => acc + curr.amount, 0) / renter.length;
      averageRenterAssets = averageRenterAssets > 0
        ? 0
        : Math.abs(averageRenterAssets);

      return plot({
        title: "Is it better to buy or to rent after 25 years?",
        subtitle:
          "Each dot represents the assets difference between buyer and renter of one of 10k simulations.",
        height: 450,
        x: {
          nice: true,
          label: null,
          tickFormat: (d) =>
            (Math.abs(d) < 1000
              ? d < 0 ? `+$${Math.abs(d)}` : `+$${d}`
              : Math.abs(d) < 1_000_000
              ? d < 0 ? `+$${Math.abs(d) / 1000}k` : `+$${d / 1000}k`
              : d < 0
              ? `+$${Math.abs(d) / 1_000_000}M`
              : `+$${d / 1_000_000}M`).replace("+$0", "$0"),
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
          dotX(
            data,
            dodgeY({
              x: "amount",
              fill: "category",
              r: 1,
              padding: 0,
              //   fy: "category",
            }),
          ),
          textX([{
            amount: 0,
            category: "buyerHasMore",
            text:
              `The buyer ends up with more assets ${percentageBuyerPositive}% of the time with $${
                Math.round(averageBuyerAssets).toLocaleString()
              } more on average.`,
          }], {
            lineWidth: 10,
            x: "amount",
            text: "text",
            textAnchor: "start",
            fontWeight: "bold",
            fontSize: 12,
            dy: -100,
            dx: 100,
            fill: "category",
            stroke: "white",
          }),
          textX([{
            amount: 0,
            category: "renterHasMore",
            text:
              `The renter ends up with more assets ${percentageRenterPositive}% of the time with $${
                Math.round(averageRenterAssets).toLocaleString()
              } more on average.`,
          }], {
            lineWidth: 10,
            x: "amount",
            text: "text",
            textAnchor: "end",
            fontWeight: "bold",
            fontSize: 12,
            dy: -100,
            dx: -100,
            fill: "category",
            stroke: "white",
          }),
        ],
      });
    },
    "test/output/monte-carlo-difference-last-year.png",
    { style: "body { width: 700px; }" },
  );

  assertEquals(true, true);
});
