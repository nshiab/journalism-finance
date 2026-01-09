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
    iterations: 1_000,
    numberOfYears: 25,
    annualAvgMarketReturnRate: 0.07,
    annualMarketReturnStdDev: 0.05,
    renter: {
      startingMonthlyRent: 1250,
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
  const differenceAtFinalYear = simulationResults.finalYearResults.filter((d) =>
    [
      "difference",
    ].includes(d.variable)
  );
  await saveChart(
    differenceAtFinalYear,
    (data) => {
      // @ts-ignore
      const totalBuyer = data.filter((d) => d.category === "buyer").length;
      const totalBuyerPositive =
        // @ts-ignore
        data.filter((d) => d.category === "buyer" && d.amount > 0).length;
      const percentageBuyerPositive = Math.round(
        totalBuyerPositive / totalBuyer * 100,
      );

      // @ts-ignore
      const totalRenter = data.filter((d) => d.category === "renter").length;
      const totalRenterPositive =
        // @ts-ignore
        data.filter((d) => d.category === "renter" && d.amount > 0).length;
      const percentageRenterPositive = Math.round(
        totalRenterPositive / totalRenter * 100,
      );

      let averageDifference = 0;
      if (percentageBuyerPositive > percentageRenterPositive) {
        // @ts-ignore
        const buyerData = data.filter((d) => d.category === "buyer");
        const totalDifference = buyerData.reduce(
          (acc: number, curr: { amount: number }) => acc + curr.amount,
          0,
        );
        averageDifference = totalDifference / buyerData.length;
      } else {
        // @ts-ignore
        const renterData = data.filter((d) => d.category === "renter");
        const totalDifference = renterData.reduce(
          (acc: number, curr: { amount: number }) => acc + curr.amount,
          0,
        );
        averageDifference = totalDifference / renterData.length;
      }
      averageDifference = Math.round(averageDifference);
      const averageDifferenceFormatted = averageDifference < 1000
        ? `${averageDifference}`
        : averageDifference < 1_000_000
        ? `${Math.round(averageDifference / 1000)}k`
        : `${Math.round(averageDifference / 1_000_000)}M`;

      return plot({
        title: "Difference in assets at final year",
        height: 400,
        x: {
          nice: true,
          label: null,
          tickFormat: (d) =>
            (Math.abs(d) < 1000
              ? d < 0 ? `-$${Math.abs(d)}` : `+$${d}`
              : Math.abs(d) < 1_000_000
              ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `+$${d / 1000}k`
              : d < 0
              ? `-$${Math.abs(d) / 1_000_000}M`
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
          ruleX([0], { stroke: "black" }),
          dotX(
            data,
            dodgeY({
              x: "amount",
              fill: "category",
              r: 1.5,
              padding: 1,
              //   fy: "category",
            }),
          ),
          textX([{
            amount: 0,
            category: percentageBuyerPositive > percentageRenterPositive
              ? "buyer"
              : "renter",
          }], {
            text: (d) =>
              percentageBuyerPositive > percentageRenterPositive
                ? `The buyer was better off\nthan the renter ${percentageBuyerPositive}% of time${
                  averageDifference > 0
                    ? `\nwith $${averageDifferenceFormatted} more on average`
                    : ""
                }`
                : `The renter was better off\nthan the buyer ${percentageRenterPositive}% of time${
                  averageDifference > 0
                    ? `\nwith $${averageDifferenceFormatted} more on average`
                    : ""
                }`,
            x: "amount",
            fill: "category",
            fontWeight: "bold",
            fontSize: 12,
            stroke: "white",
            dy: -160,
          }),
        ],
      });
    },
    "test/output/monte-carlo-difference-last-year.png",
    { style: "body { width: 700px; }" },
  );

  assertEquals(true, true);
});
