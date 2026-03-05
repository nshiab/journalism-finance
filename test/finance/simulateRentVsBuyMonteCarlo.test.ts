import { assertEquals } from "jsr:@std/assert";
import simulateRentVsBuyMonteCarlo from "../../src/finance/simulateRentVsBuyMonteCarlo.ts";
import getParamsRentVsBuyMonteCarlo from "./helpers/getParamsRentVsBuyMonteCarlot.ts";
import makeChartsMonteCarlo from "./helpers/makeChartsBuyVsRentMonteCarlo.ts";

// Deno.test("should run a monte carlo simulation of rent vs buy with 1,000 iterations", async () => {
//   const params = getParamsRentVsBuyMonteCarlo(1000, "Montreal", "Quebec", {
//     renterMonthlyInsurance: 70,
//     ownerMonthlyInsurance: 125,
//     sellingFixedFees: 2000,
//     condoFees: 250,
//   });

//   console.log(params);

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
    { city: "Montreal", province: "Quebec" },
    { city: "Toronto", province: "Ontario" },
    { city: "Vancouver", province: "British Columbia" },
    { city: "Calgary", province: "Alberta" },
    { city: "Halifax", province: "Nova Scotia" },
  ];

  for (const location of locations) {
    const params = getParamsRentVsBuyMonteCarlo(
      1000,
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

    await makeChartsMonteCarlo(simulationResults, true, location.city);
  }

  assertEquals(true, true);
});
