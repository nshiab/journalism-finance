import { saveChart } from "@nshiab/journalism-dataviz";
import { barY, frame, plot, ruleY, text } from "@observablehq/plot";

export default async function makeChartsBuyVsRentMonteCarloMultipleCities(
  results: {
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
    city: string;
  }[],
) {
  // For each city, we calculate the percentage of wins
  const aggregatedResults = [];
  const cities = Array.from(new Set(results.map((d) => d.city)));
  const categories = ["renter", "buyerFixed", "buyerVariable"];

  for (const city of cities) {
    const cityResults = results.filter((d) => d.city === city);
    const total = cityResults.length;

    for (const category of categories) {
      const categoryResults = cityResults.filter((d) =>
        d.category === category
      );
      const percentage = categoryResults.length / total;

      aggregatedResults.push({
        city: city.replace("Kitchener_waterloo", "Kitchener-Waterloo")
          .replace("Saint_john_nb", "Saint John (NB)").replace(
            "St_johns_nl",
            "St Johns (NL)",
          ),
        category,
        percentage,
      });
    }
  }

  await saveChart(
    aggregatedResults,
    (data) => {
      if (!Array.isArray(data)) {
        throw new Error("Data should be an array");
      }

      const n = 4; // number of facet columns
      const keys = Array.from(new Set(data.map((d) => d.city)));
      const index = new Map(keys.map((key, i) => [key, i]));
      //@ts-expect-error It's okay
      const fx = (key) => index.get(key) % n;
      //@ts-expect-error It's okay
      const fy = (key) => Math.floor(index.get(key) / n);

      return plot({
        title: "Best financial strategy after 25 years",
        subtitle: "Monte Carlo simulation with 1,000 iterations for each city.",
        color: {
          legend: true,
        },
        x: {
          axis: null,
          label: null,
        },
        y: {
          label: null,
          insetTop: 30,
          grid: true,
          ticks: 5,
          nice: true,
          tickFormat: "%",
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
            y: "percentage",
            fill: "category",
            fx: (d) => fx(d.city),
            fy: (d) => fy(d.city),
          }),
          text(data, {
            x: "category",
            y: "percentage",
            text: (d) => `${Math.round(d.percentage * 100)}%`,
            fill: "category",
            stroke: "white",
            fx: (d) => fx(d.city),
            fy: (d) => fy(d.city),
            fontSize: 10,
            dy: -8,
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
    "test/output/multiple-cities-monte-carlo.png",
  );
}
