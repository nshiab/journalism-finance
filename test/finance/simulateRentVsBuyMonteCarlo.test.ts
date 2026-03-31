import { assert, assertEquals } from "jsr:@std/assert";
import simulateRentVsBuyMonteCarlo from "../../src/finance/simulateRentVsBuyMonteCarlo.ts";
import getParamsRentVsBuyMonteCarlo from "./helpers/getParamsRentVsBuyMonteCarlo.ts";

Deno.test("documentation example: simulateRentVsBuyMonteCarlo should run without errors", () => {
  const results = simulateRentVsBuyMonteCarlo({
    iterations: 10, // Reduced from 1000 for faster testing
    startingYear: 2024,
    numberOfYears: 25,
    tfsaContributions: true,
    annualInvestmentFeeRate: 0,
    couple: false,
    employmentIncome: 75000,
    province: "Ontario",
    renter: {
      startingMonthlyRent: 1500,
      securityDeposit: 1500,
      startingMonthlyInsurance: 25,
    },
    buyer: {
      downPayment: 50000,
      purchasePrice: 400000,
      fixedRateAdjustment: -1.0,
      variableRateAdjustment: 0,
      purchaseFixedFees: 3000,
      startingAnnualMaintenanceCost: 1500,
      startingAnnualPropertyTax: 2500,
      startingMonthlyCondoFees: 0,
      startingMonthlyInsurance: 80,
      sellingFixedFees: 1500,
      sellingCommissionRate: 0.05,
      floorRate: 0,
    },
    stochasticParameters: {
      market: { startValue: 0.07, mu: 0.07, sigma: 0.15 },
      rent: { startValue: 0.03, mu: 0.03, sigma: 0.02 },
      ownerInsurance: { startValue: 0.03, mu: 0.03, sigma: 0.05 },
      renterInsurance: { startValue: 0.03, mu: 0.03, sigma: 0.05 },
      maintenance: { startValue: 0.02, mu: 0.02, sigma: 0.05 },
      propertyTax: { startValue: 0.02, mu: 0.02, sigma: 0.02 },
      condoFee: { startValue: 0.03, mu: 0.03, sigma: 0.05 },
      appreciation: { startValue: 0.04, mu: 0.04, sigma: 0.10 },
      sellingFixedFees: { startValue: 0.02, mu: 0.02, sigma: 0.05 },
      fiveYearInterestRates: { startValue: 0.05, a: 0.2, b: 0.05, sigma: 0.02 },
      fourYearInterestRates: {
        startValue: 0.048,
        a: 0.2,
        b: 0.048,
        sigma: 0.02,
      },
      threeYearInterestRates: {
        startValue: 0.045,
        a: 0.2,
        b: 0.045,
        sigma: 0.02,
      },
      twoYearInterestRates: {
        startValue: 0.042,
        a: 0.2,
        b: 0.042,
        sigma: 0.02,
      },
      oneYearInterestRates: { startValue: 0.04, a: 0.2, b: 0.04, sigma: 0.02 },
      variableInterestRates: {
        startValue: 0.06,
        a: 0.3,
        b: 0.055,
        sigma: 0.03,
      },
    },
  }, { verbose: false });

  assert(results.winners.length === 10);
  assert(results.winnersBeforeSelling.length === 10);
});

Deno.test("should run a monte carlo simulation of rent vs buy with 1,000 iterations", async () => {
  const params = getParamsRentVsBuyMonteCarlo(1000, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  // console.log(params);

  const simulationResults = simulateRentVsBuyMonteCarlo(params, {
    verbose: true,
    verboseStep: 100,
    values: true,
    rates: true,
  });

  // console.log(simulationResults.values.slice(0, 1));
  // console.log(simulationResults.rates.slice(0, 1));
  // console.log(simulationResults.winners.slice(0, 1));
  // console.log(simulationResults.winnersBeforeSelling.slice(0, 1));

  const winnerCounts: {
    [key in "buyerFixed" | "buyerVariable" | "renter"]: number;
  } = {
    buyerFixed: 0,
    buyerVariable: 0,
    renter: 0,
  };
  for (const winner of simulationResults.winners) {
    winnerCounts[winner.category] += 1;
  }

  const winnerPercentages = {
    buyerFixed: 0,
    buyerVariable: 0,
    renter: 0,
  };
  const totalWinners = simulationResults.winners.length;
  for (const category in winnerCounts) {
    winnerPercentages[category as "buyerFixed" | "buyerVariable" | "renter"] =
      Math.round(
        (winnerCounts[category as "buyerFixed" | "buyerVariable" | "renter"] /
          totalWinners) * 100,
      );
  }

  console.log(
    "Winner counts and percentages:",
    winnerCounts,
    winnerPercentages,
  );

  const winnerCountsBeforeSelling: {
    [key in "buyerFixed" | "buyerVariable" | "renter"]: number;
  } = {
    buyerFixed: 0,
    buyerVariable: 0,
    renter: 0,
  };
  for (const winner of simulationResults.winnersBeforeSelling) {
    winnerCountsBeforeSelling[winner.category] += 1;
  }

  const winnerPercentagesBeforeSelling = {
    buyerFixed: 0,
    buyerVariable: 0,
    renter: 0,
  };
  const totalWinnersBeforeSelling = simulationResults.winnersBeforeSelling
    .length;
  for (const category in winnerCountsBeforeSelling) {
    winnerPercentagesBeforeSelling[
      category as "buyerFixed" | "buyerVariable" | "renter"
    ] = Math.round(
      (winnerCountsBeforeSelling[
        category as "buyerFixed" | "buyerVariable" | "renter"
      ] / totalWinnersBeforeSelling) * 100,
    );
  }

  console.log(
    "Winner counts and percentages before selling:",
    winnerCountsBeforeSelling,
    winnerPercentagesBeforeSelling,
  );

  assertEquals(simulationResults.winners.length, 1000);
  assertEquals(simulationResults.winnersBeforeSelling.length, 1000);

  // Verify that the sum of percentages is close to 100%
  const sumPercentages = Object.values(winnerPercentages).reduce(
    (a, b) => a + b,
    0,
  );
  assert(Math.abs(sumPercentages - 100) <= 2);
});

Deno.test("should run a monte carlo simulation of rent vs buy with 1,000 iterations and option couple", async () => {
  const params = getParamsRentVsBuyMonteCarlo(1000, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  // console.log(params);

  const simulationResults = simulateRentVsBuyMonteCarlo({
    ...params,
    couple: true,
  }, {
    verbose: true,
    verboseStep: 100,
    values: true,
    rates: true,
  });

  // console.log(simulationResults.values.slice(0, 1));
  // console.log(simulationResults.rates.slice(0, 1));
  // console.log(simulationResults.winners.slice(0, 1));
  // console.log(simulationResults.winnersBeforeSelling.slice(0, 1));

  const winnerCounts: {
    [key in "buyerFixed" | "buyerVariable" | "renter"]: number;
  } = {
    buyerFixed: 0,
    buyerVariable: 0,
    renter: 0,
  };
  for (const winner of simulationResults.winners) {
    winnerCounts[winner.category] += 1;
  }

  const winnerPercentages = {
    buyerFixed: 0,
    buyerVariable: 0,
    renter: 0,
  };
  const totalWinners = simulationResults.winners.length;
  for (const category in winnerCounts) {
    winnerPercentages[category as "buyerFixed" | "buyerVariable" | "renter"] =
      Math.round(
        (winnerCounts[category as "buyerFixed" | "buyerVariable" | "renter"] /
          totalWinners) * 100,
      );
  }

  console.log(
    "Winner counts and percentages:",
    winnerCounts,
    winnerPercentages,
  );

  const winnerCountsBeforeSelling: {
    [key in "buyerFixed" | "buyerVariable" | "renter"]: number;
  } = {
    buyerFixed: 0,
    buyerVariable: 0,
    renter: 0,
  };
  for (const winner of simulationResults.winnersBeforeSelling) {
    winnerCountsBeforeSelling[winner.category] += 1;
  }

  const winnerPercentagesBeforeSelling = {
    buyerFixed: 0,
    buyerVariable: 0,
    renter: 0,
  };
  const totalWinnersBeforeSelling = simulationResults.winnersBeforeSelling
    .length;
  for (const category in winnerCountsBeforeSelling) {
    winnerPercentagesBeforeSelling[
      category as "buyerFixed" | "buyerVariable" | "renter"
    ] = Math.round(
      (winnerCountsBeforeSelling[
        category as "buyerFixed" | "buyerVariable" | "renter"
      ] / totalWinnersBeforeSelling) * 100,
    );
  }

  console.log(
    "Winner counts and percentages before selling:",
    winnerCountsBeforeSelling,
    winnerPercentagesBeforeSelling,
  );

  assertEquals(simulationResults.winners.length, 1000);
  assertEquals(simulationResults.winnersBeforeSelling.length, 1000);

  // Verify that the sum of percentages is close to 100%
  const sumPercentagesCouple = Object.values(winnerPercentages).reduce(
    (a, b) => a + b,
    0,
  );
  assert(Math.abs(sumPercentagesCouple - 100) <= 2);
});

Deno.test("should return monthly quantiles when option monthlyQuantiles is true", async () => {
  const params = getParamsRentVsBuyMonteCarlo(1000, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const results = simulateRentVsBuyMonteCarlo(params, {
    verbose: true,
    verboseStep: 100,
    monthlyQuantiles: true,
  });

  // winners behavior unchanged
  assertEquals(results.winners.length, 1000);
  assertEquals(results.winnersBeforeSelling.length, 1000);

  // console.log(results.monthlyQuantiles.slice(0, 3));

  // monthlyQuantiles is populated
  assert(results.monthlyQuantiles.length > 0);

  // each record has q10 <= q50 <= q90
  for (const row of results.monthlyQuantiles) {
    assert(
      row.q10 <= row.q50,
      `q10 <= q50 failed for ${row.category}/${row.group}/${row.variable} month ${row.monthIndex}`,
    );
    assert(
      row.q50 <= row.q90,
      `q50 <= q90 failed for ${row.category}/${row.group}/${row.variable} month ${row.monthIndex}`,
    );
  }

  // renter rent variable spans all 300 months (25 years) per group
  const renterRent = results.monthlyQuantiles.filter(
    (d) =>
      d.category === "renter" &&
      d.group === "monthlyExpenses" &&
      d.variable === "rent",
  );
  assertEquals(renterRent.length, 300);
});
