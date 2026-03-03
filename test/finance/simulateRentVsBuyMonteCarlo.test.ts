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
import getParamsRentVsBuyMonteCarlo from "./helpers/getParamsRentVsBuyMonteCarlot.ts";

Deno.test("should run a monte carlor simulation of rent vs buy", async () => {
  const params = getParamsRentVsBuyMonteCarlo(1000, "Montreal", "Quebec", {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  });

  // console.log(params);

  const simulationResults = simulateRentVsBuyMonteCarlo(params, {
    verbose: true,
    values: true,
  });

  // console.log(simulationResults);

  const values = simulationResults.values;

  const variables = Array.from(new Set(values.map((d) => d.variable)));

  for (
    const variable of variables.filter((d) =>
      !d.toLowerCase().includes("rates") && !d.toLowerCase().includes("stock")
    )
  ) {
    console.log(`Writing chart for variable ${variable}...`);
    await saveChart(
      values.filter((d) => d.variable === variable),
      (data) => {
        if (!Array.isArray(data)) {
          throw new Error("Data should be an array");
        }

        const variableName = data[0].variable;

        const lastMonthAvgValue = Math.round(
          data.filter((d) => d.month === 299).reduce(
            (sum, d) => sum + d.value,
            0,
          ) / data.filter((d) => d.month === 299).length,
        );
        const lastMonthMedianValue = Math.round(
          data.filter((d) => d.month === 299).sort((a, b) => a.value - b.value)[
            Math.floor(data.filter((d) => d.month === 299).length / 2)
          ].value,
        );

        return plot({
          title: `Randomly generated ${variableName} values`,
          subtitle: `For simulation with ${
            data.filter((d) => d.variable === variableName && d.month === 0)
              .length
              .toLocaleString()
          } iterations. Last month average $${lastMonthAvgValue.toLocaleString()} and median $${lastMonthMedianValue.toLocaleString()}.`,
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
            ticks: [0, 60, 120, 180, 240, 300],
            tickFormat: (d) => `${2000 + Math.round(d / 12)}`,
            nice: true,
            label: null,
          },
          grid: true,
          marks: [
            line(data, {
              x: "month",
              y: "value",
              z: "iteration",
              stroke: "black",
              strokeOpacity: 0.05,
            }),
          ],
        });
      },
      `test/output/monte-carlo-values-${variable}.png`,
    );
    console.log(`Chart for variable ${variable} written.`);
  }

  for (
    const variable of variables.filter((d) => d.toLowerCase().includes("rates"))
  ) {
    console.log(`Writing chart for variable ${variable}...`);
    await saveChart(
      values.filter((d) => d.variable === variable),
      (data) => {
        if (!Array.isArray(data)) {
          throw new Error("Data should be an array");
        }

        const variableName = data[0].variable;

        const lastMonthAvgValue = (data.filter((d) => d.month === 299).reduce(
          (sum, d) => sum + d.value,
          0,
        ) / data.filter((d) => d.month === 299).length) * 100;
        const lastMonthMedianValue = data.filter((d) =>
          d.month === 299
        ).sort((a, b) => a.value - b.value)[
          Math.floor(data.filter((d) => d.month === 299).length / 2)
        ].value * 100;

        return plot({
          title: `Randomly generated ${variableName} values`,
          subtitle: `For simulation with ${
            data.filter((d) => d.variable === variableName && d.month === 0)
              .length
              .toLocaleString()
          } iterations. Last month average ${
            lastMonthAvgValue.toFixed(2)
          }% and median ${lastMonthMedianValue.toFixed(2)}%.`,
          y: {
            nice: true,
            label: null,
            tickFormat: "%",
          },
          x: {
            ticks: [0, 60, 120, 180, 240, 300],
            tickFormat: (d) => `${2000 + Math.round(d / 12)}`,
            nice: true,
            label: null,
          },
          grid: true,
          marks: [
            line(data, {
              x: "month",
              y: "value",
              z: "iteration",
              stroke: "black",
              strokeOpacity: 0.05,
            }),
          ],
        });
      },
      `test/output/monte-carlo-values-${variable}.png`,
    );
    console.log(`Chart for variable ${variable} written.`);
  }

  for (
    const variable of variables.filter((d) => d.toLowerCase().includes("stock"))
  ) {
    console.log(`Writing chart for variable ${variable}...`);
    await saveChart(
      values.filter((d) => d.variable === variable),
      (data) => {
        if (!Array.isArray(data)) {
          throw new Error("Data should be an array");
        }

        const variableName = data[0].variable;

        const lastMonthAvgValue = Math.round(
          data.filter((d) => d.month === 299).reduce(
            (sum, d) => sum + d.value,
            0,
          ) / data.filter((d) => d.month === 299).length,
        );
        const lastMonthMedianValue = Math.round(
          data.filter((d) => d.month === 299).sort((a, b) => a.value - b.value)[
            Math.floor(data.filter((d) => d.month === 299).length / 2)
          ].value,
        );

        return plot({
          title: `Randomly generated ${variableName} values`,
          subtitle: `For simulation with ${
            data.filter((d) => d.variable === variableName && d.month === 0)
              .length
              .toLocaleString()
          } iterations. Last month average ${lastMonthAvgValue.toLocaleString()} and median ${lastMonthMedianValue.toLocaleString()}.`,
          y: {
            nice: true,
            label: null,
            tickFormat: (d) =>
              Math.abs(d) < 1000
                ? d < 0 ? `-${Math.abs(d)}` : `${d}`
                : Math.abs(d) < 1_000_000
                ? d < 0 ? `-${Math.abs(d) / 1000}k` : `${d / 1000}k`
                : d < 0
                ? `-${Math.abs(d) / 1_000_000}M`
                : `${d / 1_000_000}M`,
          },
          x: {
            ticks: [0, 60, 120, 180, 240, 300],
            tickFormat: (d) => `${2000 + Math.round(d / 12)}`,
            nice: true,
            label: null,
          },
          grid: true,
          marks: [
            line(data, {
              x: "month",
              y: "value",
              z: "iteration",
              stroke: "black",
              strokeOpacity: 0.05,
            }),
          ],
        });
      },
      `test/output/monte-carlo-values-${variable}.png`,
    );
    console.log(`Chart for variable ${variable} written.`);
  }

  // /**
  // const balanceAfterSelling = simulationResults.results.filter((d) =>
  //   d.variable === "balanceAfterSelling"
  // );

  // await saveChart(
  //   balanceAfterSelling,
  //   (data) => {
  //     if (!Array.isArray(data)) {
  //       throw new Error("Data should be an array");
  //     }
  //     return plot({
  //       title: "Balance after selling assets",
  //       subtitle: `Monte Carlo simulation with ${
  //         data[0].items.toLocaleString()
  //       } iterations.`,
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
  //         nice: true,
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
  //         ruleY([0], { strokeOpacity: 0.5, strokeDasharray: "4 4" }),
  //         areaY(data, {
  //           x: "date",
  //           y1: "q25",
  //           y2: "q75",
  //           fill: "category",
  //           fillOpacity: 0.2,
  //           fx: "category",
  //         }),
  //         areaY(data, {
  //           x: "date",
  //           y1: "q10",
  //           y2: "q90",
  //           fill: "category",
  //           fillOpacity: 0.15,
  //           fx: "category",
  //         }),
  //         line(data, {
  //           x: "date",
  //           y: "q50",
  //           stroke: "category",
  //           fx: "category",
  //         }),
  //       ],
  //     });
  //   },
  //   "test/output/monte-carlo-balance-after-selling.png",
  //   { style: "body { width: 700px; }" },
  // );
  //  */

  // const winners = simulationResults.winners;

  // await saveChart(
  //   winners,
  //   (data) => {
  //     if (!Array.isArray(data)) {
  //       throw new Error("Data should be an array");
  //     }

  //     const min = Math.min(...data.map((d) => d.amount));
  //     const max = Math.max(...data.map((d) => d.amount));
  //     const middle = (min + max) / 2;

  //     const buyerFixedWins = data.filter((d) => d.category === "buyerFixed");
  //     const buyerFixedPerc = Math.round(
  //       buyerFixedWins.length /
  //         data.length * 100,
  //     );
  //     const buyerFixedAverage = Math.round(
  //       buyerFixedWins.reduce((sum, d) => sum + d.amount, 0) /
  //         buyerFixedWins.length,
  //     );

  //     const buyerVariableWins = data.filter((d) =>
  //       d.category === "buyerVariable"
  //     );
  //     const buyerVariablePerc = Math.round(
  //       buyerVariableWins.length /
  //         data.length * 100,
  //     );
  //     const buyerVariableAverage = Math.round(
  //       buyerVariableWins.reduce((sum, d) => sum + d.amount, 0) /
  //         buyerVariableWins.length,
  //     );

  //     const renterWins = data.filter((d) => d.category === "renter");
  //     const renterPerc = Math.round(
  //       renterWins.length /
  //         data.length * 100,
  //     );
  //     const renterAverage = Math.round(
  //       renterWins.reduce((sum, d) => sum + d.amount, 0) /
  //         renterWins.length,
  //     );

  //     return plot({
  //       title: "Balance after selling assets on last year",
  //       subtitle:
  //         `Monte Carlo simulation with ${data.length.toLocaleString()} iterations.`,
  //       x: {
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
  //       height: 500,
  //       grid: true,
  //       color: {
  //         legend: true,
  //       },
  //       marks: [
  //         dotX(
  //           data,
  //           dodgeY({
  //             x: "amount",
  //             fill: "category",
  //             r: 1,
  //             padding: 0.1,
  //             sort: "category",
  //           }),
  //         ),
  //         textX([{
  //           text:
  //             `The buyer with a fixed-rate mortgage wins ${buyerFixedPerc}% of times, with $${buyerFixedAverage.toLocaleString()} on average.`,
  //           category: "buyerFixed",
  //         }], {
  //           stroke: "white",
  //           fill: "category",
  //           fontSize: 12,
  //           lineWidth: 12,
  //           fontWeight: "bold",
  //           lineHeight: 1.2,
  //           x: middle,
  //           text: "text",
  //           dx: -200,
  //           dy: -225,
  //           lineAnchor: "top",
  //         }),
  //         textX([{
  //           text:
  //             `The buyer with a variable-rate mortgage wins ${buyerVariablePerc}% of times, with $${buyerVariableAverage.toLocaleString()} on average.`,
  //           category: "buyerVariable",
  //         }], {
  //           stroke: "white",
  //           fill: "category",
  //           fontSize: 12,
  //           lineWidth: 12,
  //           fontWeight: "bold",
  //           lineHeight: 1.2,
  //           x: middle,
  //           text: "text",
  //           dx: 0,
  //           dy: -225,
  //           lineAnchor: "top",
  //         }),
  //         textX([{
  //           text:
  //             `The renter wins ${renterPerc}% of times, with $${renterAverage.toLocaleString()} on average.`,
  //           category: "renter",
  //         }], {
  //           stroke: "white",
  //           fill: "category",
  //           fontSize: 12,
  //           lineWidth: 12,
  //           fontWeight: "bold",
  //           lineHeight: 1.2,
  //           x: middle,
  //           text: "text",
  //           dx: 200,
  //           dy: -225,
  //           lineAnchor: "top",
  //         }),
  //       ],
  //     });
  //   },
  //   "test/output/monte-carlo-final-result.png",
  //   { style: "body { width: 700px; }" },
  // );

  assertEquals(true, true);
});
