import { assert, assertEquals } from "jsr:@std/assert";
import simulateRentVsBuyMonteCarlo from "../../src/finance/simulateRentVsBuyMonteCarlo.ts";
import {
  decodeMonteCarloMonthlyIterations,
  decodeMonteCarloMonthlyQuantiles,
  decodeMonteCarloValues,
  decodeMonteCarloWinners,
} from "../../src/finance/decodeMonteCarloResults.ts";
import getParamsRentVsBuyMonteCarlo from "./helpers/getParamsRentVsBuyMonteCarlo.ts";
import getRentVsBuyCholeskyMatrix from "../../src/finance/helpers/rentVsBuy/getRentVsBuyCholeskyMatrix.ts";

Deno.test("documentation example: simulateRentVsBuyMonteCarlo should run without errors", () => {
  const results = simulateRentVsBuyMonteCarlo({
    iterations: 10, // Reduced from 1000 for faster testing
    startingYear: 2024,
    numberOfYears: 25,
    tfsaContributions: true,
    annualInvestmentFeeRate: 0,
    couple: false,
    city: "Toronto",
    renter: {
      securityDeposit: 1500,
    },
    buyer: {
      downPayment: 50000,
      fixedRateAdjustment: -1.0,
      variableRateAdjustment: 0,
      firstTimeOwner: true,
      investsSavings: true,
      purchaseFixedFees: 3000,
      sellingCommissionRate: 0.05,
      floorRate: 0,
    },
    choleskyMatrix: getRentVsBuyCholeskyMatrix(),
    stochasticParameters: {
      employmentIncome: { initialValue: 75000, mu: 0.02, sigma: 0.01 },
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
  const params = getParamsRentVsBuyMonteCarlo(100, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(100, "Montreal", {
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
    const params = getParamsRentVsBuyMonteCarlo(100, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(3, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(3, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(3, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(3, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(3, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(3, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(3, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(10, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(100, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(10, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(5, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(10, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(5, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(5, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(5, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(100, "Montreal", {
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
  const params = getParamsRentVsBuyMonteCarlo(100, "Montreal", {
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
  const p = getParamsRentVsBuyMonteCarlo(2, "Montreal", {
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
  const p = getParamsRentVsBuyMonteCarlo(5, "Montreal", {
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
  const p = getParamsRentVsBuyMonteCarlo(100, "Montreal", {
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
});

Deno.test("simulateRentVsBuyMonteCarlo: income paths should be stochastic and follow parameters", () => {
  const p = getParamsRentVsBuyMonteCarlo(20, "Montreal", {
    downPayment: 50000,
    purchaseFixedFees: 2000,
  }, {
    renterMonthlyInsurance: 30,
    ownerMonthlyInsurance: 150,
    sellingFixedFees: 2000,
    condoFees: 300,
  }, false);

  const initialIncome = 50_000;
  const mu = 0.05; // 5% growth
  const sigma = 0.02;

  const results = simulateRentVsBuyMonteCarlo({
    ...p,
    stochasticParameters: {
      ...p.stochasticParameters,
      employmentIncome: { initialValue: initialIncome, mu, sigma },
    },
  }, { values: true });

  const values = decodeMonteCarloValues(results.values);
  const incomeRecords = values.filter((d) =>
    d.variable === "employment income"
  );

  assertEquals(incomeRecords.length, 20 * p.numberOfYears * 12);

  // Check that paths are different (stochastic)
  const iter0 = incomeRecords.filter((d) => d.iteration === 0).sort((a, b) =>
    a.monthIndex - b.monthIndex
  );
  const iter1 = incomeRecords.filter((d) => d.iteration === 1).sort((a, b) =>
    a.monthIndex - b.monthIndex
  );

  let isDifferent = false;
  for (let i = 0; i < iter0.length; i++) {
    if (Math.abs(iter0[i].value - iter1[i].value) > 1e-9) {
      isDifferent = true;
      break;
    }
  }
  assert(
    isDifferent,
    "Expected different income paths for different iterations",
  );

  // Check general growth trend
  const avgFinalIncome = [0, 1, 2, 3, 4].reduce((acc, iter) => {
    const path = incomeRecords.filter((d) => d.iteration === iter).sort((
      a,
      b,
    ) => a.monthIndex - b.monthIndex);
    return acc + path[path.length - 1].value;
  }, 0) / 5;

  assert(avgFinalIncome > initialIncome, "Expected income to grow on average");
});

Deno.test("simulateRentVsBuyMonteCarlo: should capture employment income in values output", () => {
  const p = getParamsRentVsBuyMonteCarlo(10, "Montreal", {
    downPayment: 50000,
    purchaseFixedFees: 2000,
  }, {
    renterMonthlyInsurance: 30,
    ownerMonthlyInsurance: 150,
    sellingFixedFees: 2000,
    condoFees: 300,
  }, false);

  const results = simulateRentVsBuyMonteCarlo(p, { values: true });
  const values = decodeMonteCarloValues(results.values);

  // Filter for one iteration's income path
  const incomeIteration0 = values.filter((d) =>
    d.iteration === 0 && d.variable === "employment income"
  ).sort((a, b) => a.monthIndex - b.monthIndex);

  assertEquals(incomeIteration0.length, p.numberOfYears * 12);

  const firstMonth = incomeIteration0[0].value;
  const lastMonth = incomeIteration0[incomeIteration0.length - 1].value;

  // Since mu is positive in getParams (0.02), income should generally increase
  assert(lastMonth > firstMonth);
});

Deno.test("simulateRentVsBuyMonteCarlo: executes successfully with an identity cholesky matrix", () => {
  const iterations = 100;
  const p = getParamsRentVsBuyMonteCarlo(iterations, "Montreal", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  const t0 = performance.now();
  const results = simulateRentVsBuyMonteCarlo({
    ...p,
    choleskyMatrix: getRentVsBuyCholeskyMatrix(),
  }, {});
  const t1 = performance.now();

  const counts = { buyerFixed: 0, buyerVariable: 0, renter: 0 };
  for (const w of decodeMonteCarloWinners(results.winners)) {
    counts[w.category] += 1;
  }

  console.log(`\nIdentity Matrix (Uncorrelated) - ${iterations} iterations`);
  console.log(`Execution time: ${(t1 - t0).toFixed(0)} ms`);
  console.log(`Winners:`, counts);
  console.log(`Percentages:`, {
    buyerFixed: ((counts.buyerFixed / iterations) * 100).toFixed(1) + "%",
    buyerVariable: ((counts.buyerVariable / iterations) * 100).toFixed(1) + "%",
    renter: ((counts.renter / iterations) * 100).toFixed(1) + "%",
  });

  assertEquals(results.winners.monthIndex.length, iterations);
});

Deno.test("simulateRentVsBuyMonteCarlo: executes successfully with a fully correlated data-driven cholesky matrix", () => {
  const iterations = 100;
  const p = getParamsRentVsBuyMonteCarlo(iterations, "Montreal", {
    downPayment: 0.10,
    purchaseFixedFees: 0.02,
  }, {
    renterMonthlyInsurance: 70,
    ownerMonthlyInsurance: 125,
    sellingFixedFees: 2000,
    condoFees: 250,
  }, false);

  // Add tiny random noise to historical data to ensure matrix is strictly positive-definite
  // (breaks perfect linear dependency caused by using the same CPI dataset for multiple variables)
  const noisyData = { ...p.rawHistoricalData };
  for (const key in noisyData) {
    noisyData[key] = noisyData[key].map((val) =>
      val * (1 + (Math.random() * 0.0001 - 0.00005))
    );
  }

  const t0 = performance.now();
  const choleskyMatrix = getRentVsBuyCholeskyMatrix(noisyData as any);
  const results = simulateRentVsBuyMonteCarlo({
    ...p,
    choleskyMatrix,
  }, {});
  const t1 = performance.now();

  const counts = { buyerFixed: 0, buyerVariable: 0, renter: 0 };
  for (const w of decodeMonteCarloWinners(results.winners)) {
    counts[w.category] += 1;
  }

  console.log(`\nCorrelated Matrix (Data-driven) - ${iterations} iterations`);
  console.log(`Execution time: ${(t1 - t0).toFixed(0)} ms`);
  console.log(`Winners:`, counts);
  console.log(`Percentages:`, {
    buyerFixed: ((counts.buyerFixed / iterations) * 100).toFixed(1) + "%",
    buyerVariable: ((counts.buyerVariable / iterations) * 100).toFixed(1) + "%",
    renter: ((counts.renter / iterations) * 100).toFixed(1) + "%",
  });

  assertEquals(results.winners.monthIndex.length, iterations);
});

Deno.test("simulateRentVsBuyMonteCarlo: adjustToInflation should correctly propagate and discount values", () => {
  const params = getParamsRentVsBuyMonteCarlo(10, "Montreal", {
    downPayment: 0.20,
    purchaseFixedFees: 0.01,
  }, {
    renterMonthlyInsurance: 30,
    ownerMonthlyInsurance: 100,
    sellingFixedFees: 2000,
    condoFees: 300,
  }, false);

  const resultsNormal = simulateRentVsBuyMonteCarlo(params, { verbose: false });
  const resultsAdjusted = simulateRentVsBuyMonteCarlo(params, {
    verbose: false,
    adjustToInflation: "sellingFixedFeesIncrease",
  });

  // Since sellingFixedFeesIncrease is usually positive (inflation), adjusted amounts should be lower than nominal ones at the end.
  const avgWinnerAmountNormal =
    resultsNormal.winners.amount.reduce((a, b) => a + b, 0) / 10;
  const avgWinnerAmountAdjusted =
    resultsAdjusted.winners.amount.reduce((a, b) => a + b, 0) / 10;

  console.log(
    `Average winner amount (normal): ${avgWinnerAmountNormal.toFixed(2)}`,
  );
  console.log(
    `Average winner amount (adjusted): ${avgWinnerAmountAdjusted.toFixed(2)}`,
  );

  assert(avgWinnerAmountAdjusted < avgWinnerAmountNormal);
});

Deno.test("simulateRentVsBuyMonteCarlo: buyer investments should be zero when investsSavings is false", () => {
  const iterations = 5;
  const years = 5;
  const params = getParamsRentVsBuyMonteCarlo(iterations, "Montreal", {
    downPayment: 0.2,
    purchaseFixedFees: 0.01,
  }, {
    renterMonthlyInsurance: 30,
    ownerMonthlyInsurance: 100,
    sellingFixedFees: 2000,
    condoFees: 300,
  }, false);

  // Manipulate rent to be very high so buyers always have savings to invest
  params.stochasticParameters.rent.initialValue = 5000;
  params.stochasticParameters.rent.mu = 0.05;
  // Minimize volatility to keep results consistent across iterations
  params.stochasticParameters.rent.sigma = 0.001;

  params.buyer.investsSavings = false;
  params.numberOfYears = years;

  const results = simulateRentVsBuyMonteCarlo(params, {
    details: {
      iterations: true,
      iterationsGroups: ["assets"],
    },
  });

  const decoded = decodeMonteCarloMonthlyIterations(
    results.details.monthlyIterations,
  );
  const lastMonth = years * 12 - 1;

  // Check buyerFixed and buyerVariable for all iterations
  for (let i = 0; i < iterations; i++) {
    // Accessing results.details.monthlyIterations data via structured access to avoid property indexing issues
    const colCount = results.details.monthlyIterations.cols;

    // We can't easily find the keys in the columnar result without the keys array
    // Let's just check the ColumnarReturn.winners or some other indicator if we can't easily decode
    // Actually, ColumnarResult has a 'keys' property.

    const findAmount = (cat: string, grp: string, vr: string) => {
      const key = `${cat}|${grp}|${vr}`;
      const keyIdx = results.details.monthlyIterations.keys.indexOf(key);
      if (keyIdx === -1) return 0;
      return results.details.monthlyIterations
        .data[key][i * colCount + lastMonth];
    };

    const buyerFixedTfsa = findAmount("buyerFixed", "assets", "tfsa");
    const buyerFixedStocks = findAmount("buyerFixed", "assets", "stocks");
    const buyerVariableTfsa = findAmount("buyerVariable", "assets", "tfsa");
    const buyerVariableStocks = findAmount("buyerVariable", "assets", "stocks");

    assertEquals(
      buyerFixedTfsa,
      0,
      `Iteration ${i}: buyerFixed TFSA should be 0`,
    );
    assertEquals(
      buyerFixedStocks,
      0,
      `Iteration ${i}: buyerFixed stocks should be 0`,
    );
    assertEquals(
      buyerVariableTfsa,
      0,
      `Iteration ${i}: buyerVariable TFSA should be 0`,
    );
    assertEquals(
      buyerVariableStocks,
      0,
      `Iteration ${i}: buyerVariable stocks should be 0`,
    );
  }
});

Deno.test("simulateRentVsBuyMonteCarlo: adjustToInflation should not discount one-time upfront costs in cumulativeExpenses", () => {
  const iterations = 3;
  const params = getParamsRentVsBuyMonteCarlo(iterations, "Montreal", {
    downPayment: 0.20,
    purchaseFixedFees: 0.01,
  }, {
    renterMonthlyInsurance: 30,
    ownerMonthlyInsurance: 100,
    sellingFixedFees: 2000,
    condoFees: 300,
  }, false);

  const nbMonths = params.numberOfYears * 12;
  const finalMonth = nbMonths - 1;

  const results = simulateRentVsBuyMonteCarlo(params, {
    verbose: false,
    adjustToInflation: "sellingFixedFeesIncrease",
    details: {
      iterations: true,
      iterationsGroups: ["cumulativeExpenses"],
    },
  });

  const resultsNormal = simulateRentVsBuyMonteCarlo(params, {
    verbose: false,
    details: {
      iterations: true,
      iterationsGroups: ["cumulativeExpenses"],
    },
  });

  const getAmount = (
    res: typeof results,
    iteration: number,
    category: string,
    variable: string,
    monthIndex: number,
  ): number | undefined => {
    const key = `${category}|cumulativeExpenses|${variable}`;
    const arr = res.details.monthlyIterations.data[key];
    if (!arr) return undefined;
    return arr[iteration * nbMonths + monthIndex];
  };

  for (let i = 0; i < iterations; i++) {
    // purchaseFixedFees is a one-time cost paid at month 0 — its cumulative
    // value must be identical at every subsequent month, unaffected by the
    // inflation discount factor.
    const feeAt0 = getAmount(results, i, "buyerFixed", "purchaseFixedFees", 0);
    const feeAtFinal = getAmount(
      results,
      i,
      "buyerFixed",
      "purchaseFixedFees",
      finalMonth,
    );
    assert(
      feeAt0 !== undefined && feeAt0 > 0,
      `Iteration ${i}: purchaseFixedFees should be non-zero`,
    );
    assertEquals(
      feeAt0,
      feeAtFinal,
      `Iteration ${i}: purchaseFixedFees must not be discounted (got ${feeAtFinal}, expected ${feeAt0})`,
    );

    // Recurring costs (mortgageCapital) should still be lower in adjusted
    // results than in nominal results at the final month (regression guard).
    const mortgageAdjusted = getAmount(
      results,
      i,
      "buyerFixed",
      "mortgageCapital",
      finalMonth,
    );
    const mortgageNormal = getAmount(
      resultsNormal,
      i,
      "buyerFixed",
      "mortgageCapital",
      finalMonth,
    );
    if (
      mortgageAdjusted !== undefined && mortgageNormal !== undefined &&
      mortgageNormal > 0
    ) {
      assert(
        mortgageAdjusted < mortgageNormal,
        `Iteration ${i}: recurring cumulative cost should be discounted`,
      );
    }
  }
});

Deno.test("simulateRentVsBuyMonteCarlo: dollar-amount paths in values should be deflated when adjustToInflation is set", () => {
  const p = getParamsRentVsBuyMonteCarlo(2, "Montreal", {
    downPayment: 50000,
    purchaseFixedFees: 2000,
  }, {
    renterMonthlyInsurance: 30,
    ownerMonthlyInsurance: 150,
    sellingFixedFees: 2000,
    condoFees: 300,
  }, false);

  // Eliminate randomness by setting sigma to 0 for all stochastics
  for (const key in p.stochasticParameters) {
    (p.stochasticParameters as any)[key].sigma = 0;
  }

  const resultsNormal = simulateRentVsBuyMonteCarlo(p, {
    values: true,
  });

  const resultsAdjusted = simulateRentVsBuyMonteCarlo(p, {
    values: true,
    adjustToInflation: "sellingFixedFeesIncrease",
  });

  const valsNormal = decodeMonteCarloValues(resultsNormal.values);
  const valsAdjusted = decodeMonteCarloValues(resultsAdjusted.values);

  // Take the last record of employment income in iteration 0
  const incomeLastNormal = valsNormal.find(
    (v) => v.iteration === 0 && v.variable === "employment income" && v.monthIndex === p.numberOfYears * 12 - 1
  );
  const incomeLastAdjusted = valsAdjusted.find(
    (v) => v.iteration === 0 && v.variable === "employment income" && v.monthIndex === p.numberOfYears * 12 - 1
  );

  assert(incomeLastNormal !== undefined);
  assert(incomeLastAdjusted !== undefined);

  // Since sellingFixedFeesIncrease is usually positive (inflation), deflated amounts should be lower than nominal.
  // We use inequality since they should differ.
  assert(
    incomeLastAdjusted.value < incomeLastNormal.value,
    `Deflated income ${incomeLastAdjusted.value} should be lower than nominal ${incomeLastNormal.value}`
  );

  // Take the last record of market returns for iteration 0 (a rate, shouldn't be deflated)
  const marketLastNormal = valsNormal.find(
    (v) => v.iteration === 0 && v.variable === "market returns" && v.monthIndex === p.numberOfYears * 12 - 1
  );
  const marketLastAdjusted = valsAdjusted.find(
    (v) => v.iteration === 0 && v.variable === "market returns" && v.monthIndex === p.numberOfYears * 12 - 1
  );

  assert(marketLastNormal !== undefined);
  assert(marketLastAdjusted !== undefined);

  // The rate paths should be exactly equal
  assertEquals(
    marketLastAdjusted.value,
    marketLastNormal.value,
    "market returns rate should not be deflated"
  );
});
