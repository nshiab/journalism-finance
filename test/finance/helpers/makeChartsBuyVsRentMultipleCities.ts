import { saveChart } from "@nshiab/journalism-dataviz";
import { barY, frame, plot, ruleY, text } from "@observablehq/plot";

export default async function makeChartsBuyVsRentMultipleCities(finalResults: {
  amount: number;
  category: "renter" | "buyerFixed" | "buyerVariable";
  city: string;
  province: string;
}[]) {
  await saveChart(
    finalResults,
    (data) => {
      if (!Array.isArray(data)) {
        throw new Error("Data should be an array");
      }

      const n = 3; // number of facet columns
      const keys = Array.from(new Set(data.map((d) => d.city)));
      const index = new Map(keys.map((key, i) => [key, i]));
      //@ts-expect-error It's okay
      const fx = (key) => index.get(key) % n;
      //@ts-expect-error It's okay
      const fy = (key) => Math.floor(index.get(key) / n);

      function formatNumbers(d: number) {
        return Math.abs(d) < 1000
          ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
          : Math.abs(d) < 1_000_000
          ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
          : d < 0
          ? `-$${Math.abs(d) / 1_000_000}M`
          : `$${d / 1_000_000}M`;
      }

      return plot({
        title:
          "Net gains/losses after selling all assets at the end of the simulation",
        subtitle:
          "Simulation from 2000 to 2025: Comparing the purchase of a condo to renting and investing the difference.",
        color: {
          legend: true,
        },
        x: {
          axis: null,
          label: null,
          grid: true,
        },
        y: {
          label: null,
          insetTop: 20,
          insetBottom: 5,
          grid: true,
          ticks: 5,
          nice: true,
          tickFormat: formatNumbers,
        },
        fy: {
          axis: null,
        },
        fx: {
          axis: null,
        },
        marks: [
          barY(data, {
            x: "category",
            y: "amount",
            fill: "category",
            fx: (d) => fx(d.city),
            fy: (d) => fy(d.city),
          }),
          text(data.filter((d) => d.amount >= 0), {
            x: "category",
            y: "amount",
            text: (d) => formatNumbers(Math.round(d.amount / 1000) * 1000),
            fill: "category",
            stroke: "white",
            fx: (d) => fx(d.city),
            fy: (d) => fy(d.city),
            fontSize: 10,
            dy: -8,
          }),
          text(data.filter((d) => d.amount < 0), {
            x: "category",
            y: "amount",
            text: (d) => formatNumbers(Math.round(d.amount / 1000) * 1000),
            fill: "category",
            stroke: "white",
            fx: (d) => fx(d.city),
            fy: (d) => fy(d.city),
            fontSize: 10,
            dy: 8,
          }),
          text(keys, {
            fx,
            fy,
            frameAnchor: "top-left",
            dx: 6,
            dy: 6,
            fill: "black",
            stroke: "white",
          }),
          ruleY([0]),
          frame(),
        ],
      });
    },
    "test/output/multiple-cities.png",
  );
}
