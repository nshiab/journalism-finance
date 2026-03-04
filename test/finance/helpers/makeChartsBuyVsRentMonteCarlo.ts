import { saveChart } from "@nshiab/journalism-dataviz";
import simulateRentVsBuyMonteCarlo from "../../../src/finance/simulateRentVsBuyMonteCarlo.ts";
import { dodgeY, dotX, line, plot, textX } from "@observablehq/plot";

export default async function makeChartsMonteCarlo(
  results: ReturnType<typeof simulateRentVsBuyMonteCarlo>,
) {
  const winners = results.winners.sort((a, b) => a.amount - b.amount);

  console.log(
    `Writing final result chart...`,
  );

  await saveChart(
    winners,
    (data) => {
      if (!Array.isArray(data)) {
        throw new Error("Data should be an array");
      }

      const p001 = Math.round(
        data.length * 0.005,
      );
      const p999 = Math.round(
        data.length * 0.995,
      );
      const p001Value = data[p001].amount;
      const p999Value = data[p999].amount;

      const middle = (p001Value + p999Value) / 2;

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

      const dataFiltered = data
        .filter((d) => d.amount >= p001Value && d.amount <= p999Value)
        .sort(() => Math.random() - 0.5);

      const height = data.length < 10_000 ? 300 : 500;
      const textTopMargin = 20;

      return plot({
        title: "Balance after selling assets on last year",
        subtitle:
          `Each dot represents one of ${data.length.toLocaleString()} iterations of a Monte Carlo simulation.`,
        caption:
          `For better readability, only results between the 0.5th and 99.5th percentiles are shown on the chart.`,
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
        height,
        grid: true,
        color: {
          legend: true,
        },
        marks: [
          dotX(
            dataFiltered,
            dodgeY({
              x: "amount",
              fill: "category",
              r: data.length < 10_000 ? 2 : 1.1,
              padding: data.length < 10_000 ? 1 : 0.1,
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
            dy: -height / 2 + textTopMargin,
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
            dy: -height / 2 + textTopMargin,
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
            dy: -height / 2 + textTopMargin,
            lineAnchor: "top",
          }),
        ],
      });
    },
    "test/output/monte-carlo-final-result.png",
    { style: "body { width: 700px; }" },
  );

  const values = results.values;
  const nbIterations = new Set(values.map((d) => d.iteration)).size;

  if (values.length > 0 && nbIterations < 10_000) {
    const variables = Array.from(new Set(values.map((d) => d.variable)));

    for (
      const variable of variables.filter((d) =>
        !d.toLowerCase().includes("rates") && !d.toLowerCase().includes("s&p")
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
            data.filter((d) => d.month === 299).sort((a, b) =>
              a.value - b.value
            )[
              Math.floor(data.filter((d) => d.month === 299).length / 2)
            ].value,
          );

          return plot({
            title: `Generated values for ${variableName} variable`,
            subtitle: `${
              data.filter((d) => d.variable === variableName && d.month === 0)
                .length
                .toLocaleString()
            } iterations with GBM generation. Last month average $${lastMonthAvgValue.toLocaleString()} and median $${lastMonthMedianValue.toLocaleString()}.`,
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
              ticks: [0, 60, 120, 180, 240],
              tickFormat: (d) => `${2000 + Math.round(d / 12)}`,
              // nice: true,
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
    }

    for (
      const variable of variables.filter((d) =>
        d.toLowerCase().includes("rates")
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

          const lastMonthAvgValue = (data.filter((d) => d.month === 299).reduce(
            (sum, d) => sum + d.value,
            0,
          ) / data.filter((d) => d.month === 299).length) * 100;
          const lastMonthMedianValue = data.filter((d) =>
            d.month === 299
          ).sort((a, b) => a.value - b.value)[
            Math.floor(
              data.filter((d) =>
                d.month === 299
              ).length / 2,
            )
          ].value * 100;

          return plot({
            title: `Generated values for ${variableName} variable`,
            subtitle: `${
              data.filter((d) => d.variable === variableName && d.month === 0)
                .length
                .toLocaleString()
            } iterations with GBM generation. Last month average ${
              lastMonthAvgValue.toFixed(2)
            }% and median ${lastMonthMedianValue.toFixed(2)}%.`,
            y: {
              nice: true,
              label: null,
              tickFormat: "%",
            },
            x: {
              ticks: [0, 60, 120, 180, 240],
              tickFormat: (d) => `${2000 + Math.round(d / 12)}`,
              // nice: true,
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
    }

    for (
      const variable of variables.filter((d) => d.toLowerCase().includes("s&p"))
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
            data.filter((d) => d.month === 299).sort((a, b) =>
              a.value - b.value
            )[
              Math.floor(data.filter((d) => d.month === 299).length / 2)
            ].value,
          );

          return plot({
            title: `Generated values for ${variableName} variable`,
            subtitle: `${
              data.filter((d) => d.variable === variableName && d.month === 0)
                .length
                .toLocaleString()
            } iterations with GBM generation. Last month average ${lastMonthAvgValue.toLocaleString()} and median ${lastMonthMedianValue.toLocaleString()}.`,
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
              ticks: [0, 60, 120, 180, 240],
              tickFormat: (d) => `${2000 + Math.round(d / 12)}`,
              // nice: true,
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
        `test/output/monte-carlo-values-${variable.replace("/", "_")}.png`,
      );
    }

    const rates = results.rates.filter((d) => parseInt(d.iteration) < 1000);

    for (
      const variable of variables
    ) {
      console.log(`Writing chart for variable ${variable} (rates)...`);
      await saveChart(
        rates.filter((d) => d.variable === variable),
        (data) => {
          if (!Array.isArray(data)) {
            throw new Error("Data should be an array");
          }

          const variableName = data[0].variable;

          return plot({
            title: `Generated rates for ${variableName} variable`,
            subtitle: `${
              data.filter((d) => d.variable === variableName && d.month === 0)
                .length
                .toLocaleString()
            } iterations with GBM generation.`,
            y: {
              nice: true,
              label: null,
              tickFormat: "%",
            },
            x: {
              ticks: [0, 60, 120, 180, 240],
              tickFormat: (d) => `${2000 + Math.round(d / 12)}`,
              // nice: true,
              label: null,
            },
            grid: true,
            marks: [
              line(data, {
                x: "month",
                y: "value",
                z: "iteration",
                stroke: "black",
                strokeOpacity: 0.01,
              }),
            ],
          });
        },
        `test/output/monte-carlo-values-${
          variable.replace("/", "_")
        }-rates.png`,
      );
    }
  } else {
    console.log(
      `Skipping variable charts because there are too many iterations (${values.length}).`,
    );
  }
}
