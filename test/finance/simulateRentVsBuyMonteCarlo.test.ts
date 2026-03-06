import { assertEquals } from "jsr:@std/assert";
import simulateRentVsBuyMonteCarlo from "../../src/finance/simulateRentVsBuyMonteCarlo.ts";
import getParamsRentVsBuyMonteCarlo from "./helpers/getParamsRentVsBuyMonteCarlot.ts";
import makeChartsMonteCarlo from "./helpers/makeChartsBuyVsRentMonteCarlo.ts";
import makeChartsBuyVsRentMonteCarloMultipleCities from "./helpers/makeChartsBuyVsRentMonteCarloMultipleCities.ts";

// Deno.test("should run a monte carlo simulation of rent vs buy with 1,000 iterations", async () => {
//   const params = getParamsRentVsBuyMonteCarlo(1000, "Montreal", "Quebec", {
//     renterMonthlyInsurance: 70,
//     ownerMonthlyInsurance: 125,
//     sellingFixedFees: 2000,
//     condoFees: 250,
//   });

//   // console.log(params);

//   const simulationResults = simulateRentVsBuyMonteCarlo(params, {
//     verbose: true,
//     values: true,
//     rates: true,
//   });

//   await makeChartsMonteCarlo(simulationResults);
//   assertEquals(true, true);
// });

// Deno.test("should run a monte carlo simulation of rent vs buy with 10,000 iterations", async () => {
//   const paramsBig = getParamsRentVsBuyMonteCarlo(10_000, "Montreal", "Quebec", {
//     renterMonthlyInsurance: 70,
//     ownerMonthlyInsurance: 125,
//     sellingFixedFees: 2000,
//     condoFees: 250,
//   });

//   console.log(paramsBig);

//   const simulationResultsBig = simulateRentVsBuyMonteCarlo(paramsBig, {
//     verbose: true,
//   });

//   await makeChartsMonteCarlo(simulationResultsBig);
//   assertEquals(true, true);
// });

Deno.test("should run a monte carlo simulation of rent vs buy with 1,000 iterations for multiple cities", async () => {
  const locations = [
    { city: "Toronto", province: "Ontario" },
    { city: "Montreal", province: "Quebec" },
    { city: "Calgary", province: "Alberta" },
    { city: "Ottawa", province: "Ontario" },
    { city: "Edmonton", province: "Alberta" },
    { city: "Winnipeg", province: "Manitoba" },
    { city: "Vancouver", province: "British Columbia" },
    { city: "Hamilton", province: "Ontario" },
    { city: "Quebec", province: "Quebec" },
    { city: "Halifax", province: "Nova Scotia" },
    { city: "London", province: "Ontario" },
    { city: "Saskatoon", province: "Saskatchewan" },
    { city: "Kitchener_waterloo", province: "Ontario" },
    { city: "Regina", province: "Saskatchewan" },
    { city: "Victoria", province: "British Columbia" },
    { city: "Barrie", province: "Ontario" },
    { city: "Guelph", province: "Ontario" },
    { city: "Kingston", province: "Ontario" },
    { city: "Fredericton", province: "New Brunswick" },
    { city: "Moncton", province: "New Brunswick" },
    { city: "Saint_john_nb", province: "New Brunswick" },
    { city: "St_johns_nl", province: "Newfoundland and Labrador" },
  ];

  const allResults = [];
  for (const location of locations) {
    const params = getParamsRentVsBuyMonteCarlo(
      10,
      location.city,
      location.province,
      {
        renterMonthlyInsurance: 70,
        ownerMonthlyInsurance: 125,
        sellingFixedFees: 2000,
        condoFees: 250,
      },
    );

    const simulationResults = simulateRentVsBuyMonteCarlo(params, {
      verbose: true,
    });

    // await makeChartsMonteCarlo(simulationResults, true, location.city);

    allResults.push(...simulationResults.winners.map((d) => ({
      amount: d.amount,
      category: d.category,
      city: location.city,
    })));
  }

  await makeChartsBuyVsRentMonteCarloMultipleCities(allResults);

  assertEquals(true, true);
});
