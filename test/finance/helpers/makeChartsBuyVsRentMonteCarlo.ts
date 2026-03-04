import { saveChart } from "@nshiab/journalism-dataviz";
import simulateRentVsBuyMonteCarlo from "../../../src/finance/simulateRentVsBuyMonteCarlo.ts";
import { line, plot } from "@observablehq/plot";

export default async function makeChartsMonteCarlo(
  results: ReturnType<typeof simulateRentVsBuyMonteCarlo>,
) {
  const values = results.values;

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
          data.filter((d) => d.month === 299).sort((a, b) => a.value - b.value)[
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
            ticks: [0, 60, 120, 180, 240, 300],
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
            ticks: [0, 60, 120, 180, 240, 300],
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
            ticks: [0, 60, 120, 180, 240, 300],
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
    console.log(`Chart for variable ${variable} written.`);
  }
}
