import { saveChart } from "@nshiab/journalism-dataviz";
import { areaY, barY, frame, line, plot, text } from "@observablehq/plot";
import simulateRentVsBuy from "../../../src/finance/simulateRentVsBuy.ts";

export default async function makeCharts(
  city: string,
  results: ReturnType<typeof simulateRentVsBuy>,
  allRatesFiltered: {
    geo: string;
    year: number;
    month: number;
    variable: string;
    value: number;
    pctChange: number;
    indexedValue: number;
  }[],
) {
  // Chart of all values used (indexed), except mortgage rates
  await saveChart(
    allRatesFiltered.filter((d) => !d.variable.includes("rate")).map((d) => ({
      date: new Date(Date.UTC(d.year, d.month - 1, 1)),
      variable: d.variable,
      value: d.indexedValue,
    })),
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
        title: "Historical indicators",
        subtitle: "Values indexed to 100 at the start date.",
        y: { insetTop: 20, grid: true, ticks: 5, nice: true },
        x: { ticks: 5, grid: true },
        fx: { tickFormat: (d) => "" },
        fy: { tickFormat: (d) => "" },
        marks: [
          areaY(
            data,
            {
              x: "date",
              y: "value",
              stroke: "black",
              fill: "lightgray",
              // curve: "step",
              strokeWidth: 1,
              fx: (d) => fx(d.variable),
              fy: (d) => fy(d.variable),
            },
          ),
          text(keys, {
            fx,
            fy,
            frameAnchor: "top-left",
            dx: 6,
            dy: 6,
            fill: "black",
            stroke: "white",
          }),
          frame(),
        ],
      });
    },
    `test/output/${city}-all-indexed-values.png`,
    { style: "body { width: 700px; }" },
  );

  // Chart of all rates used, except mortgage rates
  await saveChart(
    allRatesFiltered.filter((d) => !d.variable.includes("rate")).map((d) => ({
      date: new Date(Date.UTC(d.year, d.month - 1, 1)),
      variable: d.variable,
      value: d.pctChange,
    })),
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
        title: "Monthly rates used in simulation",
        y: { insetTop: 20, tickFormat: "%", grid: true, ticks: 5, nice: true },
        x: { ticks: 5, grid: true },
        fx: { tickFormat: (d) => "" },
        fy: { tickFormat: (d) => "" },
        marks: [
          line(
            data,
            {
              x: "date",
              y: "value",
              stroke: "black",
              // curve: "step",
              strokeWidth: 1,
              fx: (d) => fx(d.variable),
              fy: (d) => fy(d.variable),
            },
          ),
          text(keys, { fx, fy, frameAnchor: "top-left", dx: 6, dy: 6 }),
          frame(),
        ],
      });
    },
    `test/output/${city}-all-rates.png`,
    { style: "body { width: 700px; }" },
  );

  // Chart of mortgage rates
  await saveChart(
    allRatesFiltered.filter((d) => d.variable.includes("rate")).map((d) => ({
      date: new Date(Date.UTC(d.year, d.month - 1, 1)),
      variable: d.variable,
      value: d.value,
    })),
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
        title: "Mortgage rates used in simulation",
        y: { insetTop: 20, tickFormat: "%", grid: true, ticks: 5, nice: true },
        x: { ticks: 5, grid: true },
        fx: { tickFormat: (d) => "" },
        fy: { tickFormat: (d) => "" },
        marks: [
          line(
            data,
            {
              x: "date",
              y: "value",
              stroke: "black",
              // curve: "step",
              strokeWidth: 1,
              fx: (d) => fx(d.variable),
              fy: (d) => fy(d.variable),
            },
          ),
          text(keys, { fx, fy, frameAnchor: "top-left", dx: 6, dy: 6 }),
          frame(),
        ],
      });
    },
    `test/output/${city}-all-mortgage-rates.png`,
    { style: "body { width: 700px; }" },
  );

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
    `test/output/${city}-first-month-expenses.png`,
    { style: "body { width: 700px; }" },
  );

  const secondMonthExpenses = results.filter((d) =>
    d.monthIndex === 1 &&
    d.group === "monthlyExpenses"
  );

  await saveChart(
    secondMonthExpenses,
    (data) =>
      plot({
        title: "Second month expenses (Feb. 2000)",
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
    `test/output/${city}-second-month-expenses.png`,
    { style: "body { width: 700px; }" },
  );

  const monthlyExpenses = results.filter((d) =>
    d.monthIndex > 0 &&
    d.group === "monthlyExpenses"
  );

  await saveChart(
    monthlyExpenses,
    (data) =>
      plot({
        title: "Monthly expenses over time (excluding first month)",
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
    `test/output/${city}-monthly-expenses.png`,
    { style: "body { width: 700px; }" },
  );

  const cumulativeExpenses = results.filter((d) =>
    d.group === "cumulativeExpenses"
  );

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
    `test/output/${city}-cumulative-expenses.png`,
    { style: "body { width: 700px; }" },
  );

  const firstMonthGains = results.filter((d) =>
    d.monthIndex === 0 &&
    d.group === "monthlyGains"
  );

  await saveChart(
    firstMonthGains,
    (data) =>
      plot({
        title: "First month gains (Jan. 2000)",
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
    `test/output/${city}-first-month-gains.png`,
    { style: "body { width: 700px; }" },
  );

  const secondMonthGains = results.filter((d) =>
    d.monthIndex === 1 &&
    d.group === "monthlyGains"
  );

  await saveChart(
    secondMonthGains,
    (data) =>
      plot({
        title: "Second month gains (Feb. 2000)",
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
    `test/output/${city}-second-month-gains.png`,
    { style: "body { width: 700px; }" },
  );

  const monthlyGains = results.filter((d) =>
    d.group === "monthlyGains" && d.month !== 0
  );

  await saveChart(
    monthlyGains,
    (data) =>
      plot({
        title: "Monthly gains over time (excluding first month)",
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
    `test/output/${city}-monthly-gains.png`,
    { style: "body { width: 700px; }" },
  );

  const cumulativeGains = results.filter((d) => d.group === "cumulativeGains");

  await saveChart(
    cumulativeGains,
    (data) =>
      plot({
        title: "Cumulative gains over time",
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
    `test/output/${city}-cumulative-gains.png`,
    { style: "body { width: 700px; }" },
  );

  const assets = results.filter((d) => d.group === "assets");

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
    `test/output/${city}-assets.png`,
    { style: "body { width: 700px; }" },
  );

  const saleCosts = results.filter((d) => d.group === "saleCosts");

  await saveChart(
    saleCosts,
    (data) =>
      plot({
        title: "Sale costs, if assets were sold",
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
    `test/output/${city}-sale-costs.png`,
    { style: "body { width: 700px; }" },
  );

  const saleNetGains = results.filter((d) => d.group === "saleNetGains");

  await saveChart(
    saleNetGains,
    (data) =>
      plot({
        title: "Sale gains, if assets were sold",
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
    `test/output/${city}-sale-gains.png`,
    { style: "body { width: 700px; }" },
  );

  const firstMonthBalance = results.filter((d) =>
    d.monthIndex === 0 &&
    d.group === "summary" && d.variable === "balance"
  );

  await saveChart(
    firstMonthBalance,
    (data) =>
      plot({
        title: "First month balance (Jan. 2000)",
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
    `test/output/${city}-first-month-balance.png`,
    { style: "body { width: 700px; }" },
  );

  const monthlyBalance = results.filter((d) =>
    d.group === "summary" && d.variable === "balance" && d.month !== 0
  );

  await saveChart(
    monthlyBalance,
    (data) =>
      plot({
        title: "Monthly balance over time (excluding first month)",
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
    `test/output/${city}-monthly-balance.png`,
    { style: "body { width: 700px; }" },
  );

  const overallBalance = results.filter((d) =>
    d.group === "summaryCumulative" && d.variable === "balance"
  );

  await saveChart(
    overallBalance,
    (data) =>
      plot({
        title: "Overall balance over time",
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
    `test/output/${city}-overall-balance.png`,
    { style: "body { width: 700px; }" },
  );

  const overallBalanceAfterSelling = results.filter((d) =>
    d.group === "summaryCumulative" && d.variable === "balanceAfterSelling"
  );

  await saveChart(
    overallBalanceAfterSelling,
    (data) =>
      plot({
        title: "Overall balance after selling over time",
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
          ticks: 4,
          tickFormat: (d) => d.toISOString().slice(0, 4).replace("20", "'"),
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
    `test/output/${city}-overall-balance-after-selling.png`,
    { style: "body { width: 700px; }" },
  );
}
