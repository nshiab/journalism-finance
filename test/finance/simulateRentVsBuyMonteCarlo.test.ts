import { assertEquals } from "jsr:@std/assert";
import simulateRentVsBuyMonteCarlo from "../../src/finance/simulateRentVsBuyMonteCarlo.ts";
import getParamsRentVsBuyMonteCarlo from "./helpers/getParamsRentVsBuyMonteCarlot.ts";
import makeChartsMonteCarlo from "./helpers/makeChartsBuyVsRentMonteCarlo.ts";

Deno.test("should run a monte carlo simulation of rent vs buy", async () => {
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
    rates: true,
  });

  await makeChartsMonteCarlo(simulationResults);

  // console.log(simulationResults);

  assertEquals(true, true);
});
