import { assert, assertEquals } from "jsr:@std/assert";
import simulateRentVsBuyMonteCarlo from "../../src/finance/simulateRentVsBuyMonteCarlo.ts";
import {
  decodeMonteCarloMonthlyIterations,
  decodeMonteCarloMonthlyQuantiles,
  decodeMonteCarloValues,
  decodeMonteCarloWinners,
} from "../../src/finance/decodeMonteCarloResults.ts";
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
      securityDeposit: 1500,
    },
    buyer: {
      downPayment: 50000,
      fixedRateAdjustment: -1.0,
      variableRateAdjustment: 0,
      purchaseFixedFees: 3000,
      sellingCommissionRate: 0.05,
      floorRate: 0,
    },
    stochasticParameters: {
      market: { initialValue: 0.07, mu: 0.07, sigma: 0.15 },
      rent: { initialValue: 1500, mu: 0.03, sigma: 0.02 },
      ownerInsurance: { initialValue: 80, mu: 0.03, sigma: 0.05 },
      renterInsurance: { initialValue: 25, mu: 0.03, sigma: 0.05 },
      maintenance: { initialValue: 1500, mu: 0.02, sigma: 0.05 },
      propertyTax: { initialValue: 2500, mu: 0.02, sigma: 0.02 },
      condoFee: { initialValue: 0, mu: 0.03, sigma: 0.05 },
      appreciation: { initialValue: 400000, mu: 0.04, sigma: 0.10 },
      sellingFixedFees: { initialValue: 1500, mu: 0.02, sigma: 0.05 },
      fiveYearInterestRates: {
        initialValue: 0.05,
        a: 0.2,
        b: 0.05,
        sigma: 0.02,
      },
      fourYearInterestRates: {
        initialValue: 0.048,
        a: 0.2,
        b: 0.048,
        sigma: 0.02,
      },
      threeYearInterestRates: {
        initialValue: 0.045,
        a: 0.2,
        b: 0.045,
        sigma: 0.02,
      },
      twoYearInterestRates: {
        initialValue: 0.042,
        a: 0.2,
        b: 0.042,
        sigma: 0.02,
      },
      oneYearInterestRates: {
        initialValue: 0.04,
        a: 0.2,
        b: 0.04,
        sigma: 0.02,
      },
      variableInterestRates: {
        initialValue: 0.06,
        a: 0.3,
        b: 0.055,
        sigma: 0.03,
      },
    },
    winVariable: "balanceAfterSelling",
  }, { verbose: false });

  assert(results.winners.monthIndex.length === 10);
});

Deno.test("should run a monte carlo simulation of rent vs buy with 100 iterations", async () => {
  const params = getParamsRentVsBuyMonteCarlo(100, "Montreal", "Quebec", {
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
  });

  // console.log(simulationResults.values.slice(0, 1));
  // console.log(simulationResults.winners.slice(0, 1));

  const winnerCounts: {
    [key in "buyerFixed" | "buyerVariable" | "renter"]: number;
  } = {
    buyerFixed: 0,
    buyerVariable: 0,
    renter: 0,
  };
  for (const winner of decodeMonteCarloWinners(simulationResults.winners)) {
    winnerCounts[winner.category] += 1;
  }

  const winnerPercentages = {
    buyerFixed: 0,
    buyerVariable: 0,
    renter: 0,
  };
  const totalWinners = simulationResults.winners.monthIndex.length;
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

  assertEquals(simulationResults.winners.monthIndex.length, 100);

  // Verify that the sum of percentages is close to 100%
  const sumPercentages = Object.values(winnerPercentages).reduce(
    (a, b) => a + b,
    0,
  );
  assert(Math.abs(sumPercentages - 100) <= 2);
});

Deno.test("should run a monte carlo simulation of rent vs buy with 100 iterations and option couple", async () => {
  const params = getParamsRentVsBuyMonteCarlo(100, "Montreal", "Quebec", {
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
  });

  // console.log(simulationResults.values.slice(0, 1));
  // console.log(simulationResults.winners.slice(0, 1));

  const winnerCounts: {
    [key in "buyerFixed" | "buyerVariable" | "renter"]: number;
  } = {
    buyerFixed: 0,
    buyerVariable: 0,
    renter: 0,
  };
  for (const winner of decodeMonteCarloWinners(simulationResults.winners)) {
    winnerCounts[winner.category] += 1;
  }

  const winnerPercentages = {
    buyerFixed: 0,
    buyerVariable: 0,
    renter: 0,
  };
  const totalWinners = simulationResults.winners.monthIndex.length;
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

  assertEquals(simulationResults.winners.monthIndex.length, 100);

  // Verify that the sum of percentages is close to 100%
  const sumPercentagesCouple = Object.values(winnerPercentages).reduce(
    (a, b) => a + b,
    0,
  );
  assert(Math.abs(sumPercentagesCouple - 100) <= 2);
});

Deno.test(
  "Making sure all scenarios have wins",
  async () => {
    const params = getParamsRentVsBuyMonteCarlo(100, "Montreal", "Quebec", {
      downPayment: 0.10,
      purchaseFixedFees: 0.02,
    }, {
      renterMonthlyInsurance: 70,
      ownerMonthlyInsurance: 125,
      sellingFixedFees: 2000,
      condoFees: 250,
    }, false);

    function logWinners(
      label: string,
      results: ReturnType<typeof simulateRentVsBuyMonteCarlo>,
    ) {
      const counts = { buyerFixed: 0, buyerVariable: 0, renter: 0 };
      for (const w of decodeMonteCarloWinners(results.winners)) {
        counts[w.category] += 1;
      }
      const total = results.winners.monthIndex.length;
      const pct = (n: number) => Math.round((n / total) * 100);
      console.log(`${label} - Winner counts and percentages:`, counts, {
        buyerFixed: pct(counts.buyerFixed),
        buyerVariable: pct(counts.buyerVariable),
        renter: pct(counts.renter),
      });
    }

    // Default path (winVariableOnly, stride=1)
    const defaultResults = simulateRentVsBuyMonteCarlo(params, {});
    logWinners("default", defaultResults);
    const decodedDefaultWinners = decodeMonteCarloWinners(
      defaultResults.winners,
    );
    for (
      const category of ["renter", "buyerFixed", "buyerVariable"] as const
    ) {
      const wins = decodedDefaultWinners.filter((w) =>
        w.category === category
      ).length;
      assert(
        wins > 0,
        `${category} should win at least once, got 0 out of ${defaultResults.winners.monthIndex.length}`,
      );
    }
  },
);

Deno.test("should return monthly iterations data when option monthlyIterations is true", () => {
  const params = getParamsRentVsBuyMonteCarlo(3, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  // Just for the tests
  params.renter.securityDeposit = 1000;

  const results = simulateRentVsBuyMonteCarlo(params, {
    details: {
      iterations: true,
      iterationsGroups: [
        "monthlyExpenses",
        "cumulativeExpenses",
        "monthlyGains",
        "cumulativeGains",
        "assets",
        "summary",
        "summaryCumulative",
        "saleCosts",
        "saleNetGains",
        "totals",
      ],
    },
  });

  assertEquals(results.winners.monthIndex.length, 3);

  // monthlyIterations is empty by default
  const defaultResults = simulateRentVsBuyMonteCarlo(params, {});
  assertEquals(defaultResults.details.monthlyIterations.rows, 0);
  assertEquals(defaultResults.details.monthlyIterations.keys.length, 0);

  // monthlyIterations is populated
  assert(results.details.monthlyIterations.keys.length > 0);

  const decodedMonthlyIterations = decodeMonteCarloMonthlyIterations(
    results.details.monthlyIterations,
  );

  // Each record has the expected shape
  const sample = decodedMonthlyIterations[0];
  assert(typeof sample.iteration === "number");
  assert(typeof sample.category === "string");
  assert(typeof sample.group === "string");
  assert(typeof sample.variable === "string");
  assert(typeof sample.monthIndex === "number");
  assert(typeof sample.amount === "number");

  // Iteration values span 0 to iterations-1
  const iterationValues = new Set(
    decodedMonthlyIterations.map((r) => r.iteration),
  );
  for (let i = 0; i < 3; i++) {
    assert(
      iterationValues.has(i),
      `Iteration ${i} should be present in monthlyIterations`,
    );
  }

  // The renter summaryCumulative balance should appear once per month per iteration
  const renterBalance = decodedMonthlyIterations.filter(
    (r) =>
      r.category === "renter" &&
      r.group === "summaryCumulative" &&
      r.variable === "balance",
  );
  const nbMonths = params.numberOfYears * 12;
  assertEquals(renterBalance.length, 3 * nbMonths);

  // monthIndex values for a single iteration/category/group/variable are contiguous 0..nbMonths-1
  const renterBalanceIter0 = renterBalance
    .filter((r) => r.iteration === 0)
    .map((r) => r.monthIndex)
    .sort((a, b) => a - b);
  assertEquals(
    renterBalanceIter0,
    Array.from({ length: nbMonths }, (_, i) => i),
    "monthIndex values for iteration 0 renter/summaryCumulative/balance should be 0..nbMonths-1",
  );

  // All expected variables are present across monthlyIterations
  const expectedVariables = [
    "rent",
    "insurance",
    "securityDeposit",
    "mortgageCapital",
    "mortgageInterests",
    "maintenance",
    "propertyTax",
    "condoFees",
    "downPayment",
    "purchaseFixedFees",
    "insurancePremium",
    "tfsaFees",
    "stocksFees",
    "tfsaGains",
    "tfsaContribution",
    "stocksGains",
    "newStocks",
    "homeEquityGains",
    "tfsa",
    "stocks",
    "homeEquity",
    "balance",
    "balanceAfterSelling",
    "stockTaxes",
    "homeSellingCommission",
    "homeSellingFixedFees",
    "mortgagePenalty",
    "mortgageBalance",
    "stockSellingGains",
    "tfsaSellingGains",
    "homeSellingGains",
    "monthlyExpenses",
    "cumulativeExpenses",
    "monthlyGains",
    "cumulativeGains",
    "assets",
    "saleCosts",
    "saleNetGains",
  ];
  const actualVariables = new Set(
    decodedMonthlyIterations.map((r) => r.variable),
  );
  for (const v of expectedVariables) {
    assert(
      actualVariables.has(v as any),
      `Variable ${v} is missing from monthlyIterations`,
    );
  }
});

// ---------------------------------------------------------------------------
// Columnar format tests
// ---------------------------------------------------------------------------

Deno.test("columnar: all data values are Float64Arrays and winners are unchanged", () => {
  const params = getParamsRentVsBuyMonteCarlo(3, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const col = simulateRentVsBuyMonteCarlo(params, {
    values: true,
    details: {
      iterations: true,
      iterationsGroups: [
        "monthlyExpenses",
        "cumulativeExpenses",
        "monthlyGains",
        "cumulativeGains",
        "assets",
        "summary",
        "summaryCumulative",
        "saleCosts",
        "saleNetGains",
        "totals",
      ],
    },
  });

  // winners are now WinnersColumnar typed arrays
  assertEquals(col.winners.monthIndex.length, 3);

  // all data entries are Float64Array
  for (
    const result of [
      col.values,
      col.details.monthlyIterations,
    ]
  ) {
    for (const arr of Object.values(result.data)) {
      assert(arr instanceof Float64Array, "Expected Float64Array");
    }
  }

  // keys match data keys
  for (
    const result of [
      col.values,
      col.details.monthlyIterations,
    ]
  ) {
    assertEquals(
      result.keys.length,
      Object.keys(result.data).length,
      "keys length should match data key count",
    );
    for (const k of result.keys) {
      assert(k in result.data, `key "${k}" missing from data`);
    }
  }
});

Deno.test("columnar: empty ColumnarResult when option is disabled", () => {
  const params = getParamsRentVsBuyMonteCarlo(3, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const col = simulateRentVsBuyMonteCarlo(params, {});

  // nothing requested → all are empty
  for (
    const result of [
      col.values,
      col.details.monthlyIterations,
      col.details.monthlyQuantiles,
    ]
  ) {
    assertEquals(result.rows, 0);
    assertEquals(result.keys.length, 0);
    assertEquals(Object.keys(result.data).length, 0);
  }
});

Deno.test("columnar monthlyIterations: decode matches object-array output", () => {
  const params = getParamsRentVsBuyMonteCarlo(3, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);
  params.renter.securityDeposit = 1000;

  // deterministic: run both with the same seed isn't possible,
  // but we verify shapes and that decode round-trips correctly.
  const col = simulateRentVsBuyMonteCarlo(params, {
    details: {
      iterations: true,
      iterationsGroups: [
        "monthlyExpenses",
        "cumulativeExpenses",
        "monthlyGains",
        "cumulativeGains",
        "assets",
        "summary",
        "summaryCumulative",
        "saleCosts",
        "saleNetGains",
        "totals",
      ],
    },
  });

  assert(col.details.monthlyIterations.rows === params.iterations);
  assert(col.details.monthlyIterations.cols === params.numberOfYears * 12);

  const decoded = decodeMonteCarloMonthlyIterations(
    col.details.monthlyIterations,
  );
  assert(decoded.length > 0);

  // every decoded record has correct shape
  for (const rec of decoded) {
    assert(typeof rec.iteration === "number");
    assert(typeof rec.category === "string");
    assert(typeof rec.group === "string");
    assert(typeof rec.variable === "string");
    assert(typeof rec.monthIndex === "number");
    assert(typeof rec.amount === "number");
  }

  // iteration values span 0..iterations-1
  const iterSet = new Set(decoded.map((r) => r.iteration));
  for (let i = 0; i < params.iterations; i++) {
    assert(iterSet.has(i), `iteration ${i} missing from decoded output`);
  }
});

Deno.test("columnar values: decode matches object-array shape", () => {
  const params = getParamsRentVsBuyMonteCarlo(3, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const col = simulateRentVsBuyMonteCarlo(params, {
    values: true,
  });

  assert(col.values.rows === params.iterations);
  assert(col.values.cols === params.numberOfYears * 12);

  const decodedValues = decodeMonteCarloValues(col.values);

  assert(
    decodedValues.length > 0,
    "decodeMonteCarloValues should produce records",
  );

  for (const rec of decodedValues) {
    assert(typeof rec.iteration === "number");
    assert(typeof rec.variable === "string");
    assert(typeof rec.value === "number");
    assert(typeof rec.monthIndex === "number");
  }
});

Deno.test("columnar: buffers are detachable (transfer simulation)", () => {
  const params = getParamsRentVsBuyMonteCarlo(3, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const col = simulateRentVsBuyMonteCarlo(params, {
    details: {
      iterations: true,
      iterationsGroups: [
        "monthlyExpenses",
        "cumulativeExpenses",
        "monthlyGains",
        "cumulativeGains",
        "assets",
        "summary",
        "summaryCumulative",
        "saleCosts",
        "saleNetGains",
        "totals",
      ],
    },
    values: true,
  });

  // Collect all transferable buffers
  const transferList: ArrayBuffer[] = [];
  for (
    const result of [
      col.values,
      col.details.monthlyIterations,
    ]
  ) {
    for (const arr of Object.values(result.data)) {
      transferList.push(arr.buffer as ArrayBuffer);
    }
  }

  // Simulate structured-clone transfer by detaching via MessageChannel
  const { port1, port2 } = new MessageChannel();
  const received = new Promise<void>((resolve) => {
    port2.onmessage = () => resolve();
  });
  port1.postMessage({ col }, transferList);
  port1.close();
  port2.close();

  // After transfer, all Float64Array buffers should be detached (byteLength === 0)
  for (
    const result of [
      col.values,
      col.details.monthlyIterations,
    ]
  ) {
    for (const arr of Object.values(result.data)) {
      assertEquals(
        arr.byteLength,
        0,
        "Buffer should be detached after transfer",
      );
    }
  }
});

Deno.test("iteration is number (not string) on object-array values", () => {
  const params = getParamsRentVsBuyMonteCarlo(3, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const results = simulateRentVsBuyMonteCarlo(params, {
    values: true,
  });

  for (const rec of decodeMonteCarloValues(results.values)) {
    assert(
      typeof rec.iteration === "number",
      `values iteration should be number, got ${typeof rec.iteration}`,
    );
  }
});

Deno.test("winVariable: winners use the specified variable to determine the winner", () => {
  const params = getParamsRentVsBuyMonteCarlo(10, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const categories = ["renter", "buyerFixed", "buyerVariable"] as const;

  for (
    const winVariable of ["balanceAfterSelling", "balance", "assets"] as const
  ) {
    const results = simulateRentVsBuyMonteCarlo({ ...params, winVariable }, {});
    assertEquals(
      results.winners.monthIndex.length,
      params.iterations,
      `winners.length should equal iterations for winVariable="${winVariable}"`,
    );
    for (const w of decodeMonteCarloWinners(results.winners)) {
      assert(
        categories.includes(w.category),
        `winner.category should be a valid category for winVariable="${winVariable}"`,
      );
      assert(typeof w.monthIndex === "number");
      assert(typeof w.amount === "number");
      assert(!("group" in w), "winner should not have a group field");
      assert(!("variable" in w), "winner should not have a variable field");
    }
  }
});

Deno.test("should run a monte carlo simulation of rent vs buy with 100 iterations and option monthlyIterations", () => {
  const params = getParamsRentVsBuyMonteCarlo(100, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  // Without monthlyIterations
  const t0 = performance.now();
  const resultsWithout = simulateRentVsBuyMonteCarlo(params, {});
  const durationWithout = performance.now() - t0;
  console.log(`Without monthlyIterations: ${durationWithout.toFixed(0)} ms`);
  assertEquals(resultsWithout.winners.monthIndex.length, 100);

  // With monthlyIterations
  const t1 = performance.now();
  const results = simulateRentVsBuyMonteCarlo(params, {
    details: {
      iterations: true,
      iterationsGroups: [
        "monthlyExpenses",
        "cumulativeExpenses",
        "monthlyGains",
        "cumulativeGains",
        "assets",
        "summary",
        "summaryCumulative",
        "saleCosts",
        "saleNetGains",
        "totals",
      ],
    },
  });
  const durationWith = performance.now() - t1;
  console.log(`With details.iterations: ${durationWith.toFixed(0)} ms`);

  assertEquals(results.winners.monthIndex.length, 100);
  assert(results.details.monthlyIterations.rows === 100);
  assert(results.details.monthlyIterations.cols === params.numberOfYears * 12);
  assert(results.details.monthlyIterations.keys.length > 0);

  // Decode
  const t2 = performance.now();
  const decoded = decodeMonteCarloMonthlyIterations(
    results.details.monthlyIterations,
  );
  const durationDecode = performance.now() - t2;
  console.log(`Decode monthlyIterations: ${durationDecode.toFixed(0)} ms`);

  assert(decoded.length > 0);

  const iterSet = new Set(decoded.map((r) => r.iteration));
  for (let i = 0; i < 100; i++) {
    assert(iterSet.has(i), `iteration ${i} missing from decoded output`);
  }
});

// ---------------------------------------------------------------------------
// monthlyQuantiles tests
// ---------------------------------------------------------------------------

Deno.test("monthlyQuantiles: rows and cols match quantile count and nbMonths", () => {
  const params = getParamsRentVsBuyMonteCarlo(10, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const quantiles = [0, 0.25, 0.5, 0.75, 1.0];
  const results = simulateRentVsBuyMonteCarlo(params, {
    details: { quantiles },
  });

  assertEquals(results.details.monthlyQuantiles.rows, quantiles.length);
  assertEquals(
    results.details.monthlyQuantiles.cols,
    params.numberOfYears * 12,
  );
  assert(results.details.monthlyQuantiles.keys.length > 0);
});

Deno.test("monthlyQuantiles: empty sentinel when option is not set", () => {
  const params = getParamsRentVsBuyMonteCarlo(5, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const results = simulateRentVsBuyMonteCarlo(params, {});

  assertEquals(results.details.monthlyQuantiles.rows, 0);
  assertEquals(results.details.monthlyQuantiles.keys.length, 0);
  assertEquals(Object.keys(results.details.monthlyQuantiles.data).length, 0);
});

Deno.test("monthlyQuantiles: q0 <= q50 <= q100 for all keys and months", () => {
  const params = getParamsRentVsBuyMonteCarlo(10, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const quantiles = [0, 0.5, 1.0];
  const results = simulateRentVsBuyMonteCarlo(params, {
    details: { quantiles },
  });

  const nbMonths = params.numberOfYears * 12;
  for (const key of results.details.monthlyQuantiles.keys) {
    const arr = results.details.monthlyQuantiles.data[key];
    for (let mi = 0; mi < nbMonths; mi++) {
      const q0 = arr[0 * nbMonths + mi];
      const q50 = arr[1 * nbMonths + mi];
      const q100 = arr[2 * nbMonths + mi];
      assert(
        q0 <= q50,
        `q0 (${q0}) > q50 (${q50}) at key="${key}" monthIndex=${mi}`,
      );
      assert(
        q50 <= q100,
        `q50 (${q50}) > q100 (${q100}) at key="${key}" monthIndex=${mi}`,
      );
    }
  }
});

Deno.test("monthlyQuantiles: all data values are Float64Array and keys match data", () => {
  const params = getParamsRentVsBuyMonteCarlo(5, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const results = simulateRentVsBuyMonteCarlo(params, {
    details: { quantiles: [0, 0.5, 1.0] },
  });

  for (const arr of Object.values(results.details.monthlyQuantiles.data)) {
    assert(arr instanceof Float64Array, "Expected Float64Array");
  }
  assertEquals(
    results.details.monthlyQuantiles.keys.length,
    Object.keys(results.details.monthlyQuantiles.data).length,
  );
  for (const k of results.details.monthlyQuantiles.keys) {
    assert(
      k in results.details.monthlyQuantiles.data,
      `key "${k}" missing from data`,
    );
  }
});

Deno.test("monthlyQuantiles: buffers are detachable (transfer simulation)", () => {
  const params = getParamsRentVsBuyMonteCarlo(5, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const results = simulateRentVsBuyMonteCarlo(params, {
    details: { quantiles: [0, 0.5, 1.0] },
  });

  const transferList: ArrayBuffer[] = [];
  for (const arr of Object.values(results.details.monthlyQuantiles.data)) {
    transferList.push(arr.buffer as ArrayBuffer);
  }

  const { port1, port2 } = new MessageChannel();
  port2.onmessage = () => {};
  port1.postMessage({ results }, transferList);
  port1.close();
  port2.close();

  for (const arr of Object.values(results.details.monthlyQuantiles.data)) {
    assertEquals(arr.byteLength, 0, "Buffer should be detached after transfer");
  }
});

Deno.test("decodeMonteCarloMonthlyQuantiles: produces correct shapes and values", () => {
  const params = getParamsRentVsBuyMonteCarlo(5, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const quantiles = [0, 0.5, 1.0];
  const results = simulateRentVsBuyMonteCarlo(params, {
    details: { quantiles },
  });

  const decoded = decodeMonteCarloMonthlyQuantiles(
    results.details.monthlyQuantiles,
    quantiles,
  );
  assert(decoded.length > 0);

  const nbMonths = params.numberOfYears * 12;
  // Each key produces quantiles.length * nbMonths records
  const expectedRecords = results.details.monthlyQuantiles.keys.length *
    quantiles.length * nbMonths;
  assertEquals(decoded.length, expectedRecords);

  // Every record has the expected field types
  for (const rec of decoded) {
    assert(typeof rec.category === "string");
    assert(typeof rec.group === "string");
    assert(typeof rec.variable === "string");
    assert(typeof rec.monthIndex === "number");
    assert(typeof rec.quantile === "number");
    assert(typeof rec.value === "number");
    assert(
      quantiles.includes(rec.quantile),
      `Unexpected quantile value: ${rec.quantile}`,
    );
  }

  // Quantile ordering holds in decoded output for each (key, monthIndex) group
  for (const key of results.details.monthlyQuantiles.keys) {
    const [category, group, variable] = key.split("|");
    for (let mi = 0; mi < nbMonths; mi++) {
      const monthRecords = decoded
        .filter((r) =>
          r.category === category && r.group === group &&
          r.variable === variable && r.monthIndex === mi
        )
        .sort((a, b) => a.quantile - b.quantile);
      assertEquals(monthRecords.length, quantiles.length);
      for (let i = 0; i < monthRecords.length - 1; i++) {
        assert(
          monthRecords[i].value <= monthRecords[i + 1].value,
          `Quantile ordering violated at key="${key}" monthIndex=${mi}`,
        );
      }
    }
  }
});

Deno.test("performance: monthlyQuantiles with 100 iterations", () => {
  const params = getParamsRentVsBuyMonteCarlo(100, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const quantiles = [0, 0.25, 0.5, 0.75, 1.0];

  const t0 = performance.now();
  const results = simulateRentVsBuyMonteCarlo(params, {
    details: { quantiles },
  });
  const durationSim = performance.now() - t0;
  console.log(
    `details.quantiles simulation (100 iter): ${durationSim.toFixed(0)} ms`,
  );

  const t1 = performance.now();
  const decoded = decodeMonteCarloMonthlyQuantiles(
    results.details.monthlyQuantiles,
    quantiles,
  );
  const durationDecode = performance.now() - t1;
  console.log(`details.quantiles decode: ${durationDecode.toFixed(0)} ms`);
  console.log(
    `details.quantiles decoded records: ${decoded.length.toLocaleString()}`,
  );

  assertEquals(results.winners.monthIndex.length, 100);
  assertEquals(results.details.monthlyQuantiles.rows, quantiles.length);
  assertEquals(
    results.details.monthlyQuantiles.cols,
    params.numberOfYears * 12,
  );
  assert(decoded.length > 0);
});

Deno.test("performance: monthlyQuantiles + monthlyIterations with 100 iterations", () => {
  const params = getParamsRentVsBuyMonteCarlo(100, "Montreal", "Quebec", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const quantiles = [0, 0.25, 0.5, 0.75, 1.0];

  const t0 = performance.now();
  const results = simulateRentVsBuyMonteCarlo(params, {
    details: {
      quantiles,
      iterations: true,
      iterationsGroups: [
        "monthlyExpenses",
        "cumulativeExpenses",
        "monthlyGains",
        "cumulativeGains",
        "assets",
        "summary",
        "summaryCumulative",
        "saleCosts",
        "saleNetGains",
        "totals",
      ],
    },
  });
  const durationSim = performance.now() - t0;
  console.log(
    `details (quantiles + iterations) simulation (100 iter): ${
      durationSim.toFixed(0)
    } ms`,
  );

  const t1 = performance.now();
  const decodedQuantiles = decodeMonteCarloMonthlyQuantiles(
    results.details.monthlyQuantiles,
    quantiles,
  );
  const durationDecodeQ = performance.now() - t1;
  console.log(`details.quantiles decode: ${durationDecodeQ.toFixed(0)} ms`);
  console.log(
    `details.quantiles decoded records: ${decodedQuantiles.length.toLocaleString()}`,
  );

  const t2 = performance.now();
  const decodedIterations = decodeMonteCarloMonthlyIterations(
    results.details.monthlyIterations,
  );
  const durationDecodeI = performance.now() - t2;
  console.log(`details.iterations decode: ${durationDecodeI.toFixed(0)} ms`);
  console.log(
    `details.iterations decoded records: ${decodedIterations.length.toLocaleString()}`,
  );

  assertEquals(results.winners.monthIndex.length, 100);
  assertEquals(results.details.monthlyQuantiles.rows, quantiles.length);
  assertEquals(results.details.monthlyIterations.rows, 100);
  assert(decodedQuantiles.length > 0);
  assert(decodedIterations.length > 0);

  // Cross-validate: per-iteration values should lie within [q0, q_last] for every key/month.
  const n = params.iterations;
  const nbMonths = params.numberOfYears * 12;
  const nqs = quantiles.length;
  for (const key of results.details.monthlyQuantiles.keys) {
    const qArr = results.details.monthlyQuantiles.data[key];
    const iArr = results.details.monthlyIterations.data[key];
    if (!iArr) continue;
    for (let mi = 0; mi < nbMonths; mi++) {
      const q0 = qArr[0 * nbMonths + mi];
      const qMax = qArr[(nqs - 1) * nbMonths + mi];
      for (let i = 0; i < n; i++) {
        const val = iArr[i * nbMonths + mi];
        assert(
          val >= q0 - 1e-9 && val <= qMax + 1e-9,
          `Iteration value ${val} out of [${q0}, ${qMax}] range at key="${key}" month=${mi} iter=${i}`,
        );
      }
    }
  }
});

Deno.test("simulateRentVsBuyMonteCarlo throws when iterations enabled without iterationsGroups", () => {
  const p = getParamsRentVsBuyMonteCarlo(2, "Montreal", "Quebec", {
    downPayment: 50000,
    purchaseFixedFees: 2000,
  }, {
    renterMonthlyInsurance: 30,
    ownerMonthlyInsurance: 150,
    sellingFixedFees: 2000,
    condoFees: 300,
  }, false);
  let error;
  try {
    simulateRentVsBuyMonteCarlo(p, { details: { iterations: true } } as any);
  } catch (e: any) {
    error = e;
  }
  assertEquals(error instanceof Error, true);
  assertEquals(
    error.message.includes("requires details.iterationsGroups to be set"),
    true,
  );
});

Deno.test("simulateRentVsBuyMonteCarlo filters outputs using iterationsGroups", () => {
  const p = getParamsRentVsBuyMonteCarlo(5, "Montreal", "Quebec", {
    downPayment: 50000,
    purchaseFixedFees: 2000,
  }, {
    renterMonthlyInsurance: 30,
    ownerMonthlyInsurance: 150,
    sellingFixedFees: 2000,
    condoFees: 300,
  }, false);
  const results = simulateRentVsBuyMonteCarlo(p, {
    details: {
      iterations: true,
      iterationsGroups: ["totals"],
    },
  });

  const parsed = decodeMonteCarloMonthlyIterations(
    results.details.monthlyIterations,
  );
  for (const record of parsed) {
    assertEquals(record.group, "totals");
  }
});

Deno.test("simulateRentVsBuyMonteCarlo performance test with and without iterationsGroups", () => {
  const p = getParamsRentVsBuyMonteCarlo(100, "Montreal", "Quebec", {
    downPayment: 50000,
    purchaseFixedFees: 2000,
  }, {
    renterMonthlyInsurance: 30,
    ownerMonthlyInsurance: 150,
    sellingFixedFees: 2000,
    condoFees: 300,
  }, false);

  const startAll = performance.now();
  simulateRentVsBuyMonteCarlo(p, {
    details: {
      iterations: true,
      iterationsGroups: [
        "monthlyExpenses",
        "cumulativeExpenses",
        "monthlyGains",
        "cumulativeGains",
        "assets",
        "summary",
        "summaryCumulative",
        "saleCosts",
        "saleNetGains",
        "totals",
      ],
    },
  });
  const timeAll = performance.now() - startAll;

  const startFiltered = performance.now();
  simulateRentVsBuyMonteCarlo(p, {
    details: {
      iterations: true,
      iterationsGroups: ["totals"],
    },
  });
  const timeFiltered = performance.now() - startFiltered;

  console.log(`\nPerformance with all groups: ${timeAll.toFixed(2)}ms`);
  console.log(`Performance with "totals" only: ${timeFiltered.toFixed(2)}ms`);
  console.log(`Speedup: ${(timeAll / timeFiltered).toFixed(2)}x`);

  assertEquals(timeFiltered < timeAll, true);
});
