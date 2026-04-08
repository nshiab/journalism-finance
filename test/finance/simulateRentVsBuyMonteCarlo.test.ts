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

  // Just for the tests
  params.renter.securityDeposit = 1000;

  const results = simulateRentVsBuyMonteCarlo(params, {
    verbose: true,
    verboseStep: 100,
    monthlyQuantiles: ["q10", "q50", "q90"],
  });

  // winners behavior unchanged
  assertEquals(results.winners.length, 1000);
  assertEquals(results.winnersBeforeSelling.length, 1000);

  const winnerCounts = { buyerFixed: 0, buyerVariable: 0, renter: 0 };
  const winnerCountsBeforeSelling = {
    buyerFixed: 0,
    buyerVariable: 0,
    renter: 0,
  };
  for (const w of results.winners) winnerCounts[w.category] += 1;
  for (const w of results.winnersBeforeSelling) {
    winnerCountsBeforeSelling[w.category] += 1;
  }
  const total = results.winners.length;
  const pct = (n: number) => Math.round((n / total) * 100);
  console.log("Winner counts and percentages:", winnerCounts, {
    buyerFixed: pct(winnerCounts.buyerFixed),
    buyerVariable: pct(winnerCounts.buyerVariable),
    renter: pct(winnerCounts.renter),
  });
  console.log(
    "Winner counts and percentages before selling:",
    winnerCountsBeforeSelling,
    {
      buyerFixed: pct(winnerCountsBeforeSelling.buyerFixed),
      buyerVariable: pct(winnerCountsBeforeSelling.buyerVariable),
      renter: pct(winnerCountsBeforeSelling.renter),
    },
  );

  // console.log(results.monthlyQuantiles.slice(0, 3));

  // monthlyQuantiles is populated
  assert(results.monthlyQuantiles.length > 0);

  // each record has q10 <= q50 <= q90
  for (const row of results.monthlyQuantiles) {
    assert(
      (row.q10 ?? 0) <= (row.q50 ?? 0),
      `q10 <= q50 failed for ${row.category}/${row.group}/${row.variable} month ${row.monthIndex}`,
    );
    assert(
      (row.q50 ?? 0) <= (row.q90 ?? 0),
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

  // Check that all expected variables are present in the output
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
    results.monthlyQuantiles.map((d) => d.variable),
  );
  for (const v of expectedVariables) {
    assert(
      actualVariables.has(v as any),
      `Variable ${v} is missing from results.monthlyQuantiles`,
    );
  }
  for (const v of actualVariables) {
    assert(
      expectedVariables.includes(v as any),
      `Variable ${v} was found in results but is not in the expectedVariables list`,
    );
  }
  assertEquals(
    actualVariables.size,
    expectedVariables.length,
    `Actual variable count (${actualVariables.size}) doesn't match expected (${expectedVariables.length})`,
  );
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
      const countsBeforeSelling = {
        buyerFixed: 0,
        buyerVariable: 0,
        renter: 0,
      };
      for (const w of results.winners) counts[w.category] += 1;
      for (const w of results.winnersBeforeSelling) {
        countsBeforeSelling[w.category] += 1;
      }
      const total = results.winners.length;
      const pct = (n: number) => Math.round((n / total) * 100);
      console.log(`${label} - Winner counts and percentages:`, counts, {
        buyerFixed: pct(counts.buyerFixed),
        buyerVariable: pct(counts.buyerVariable),
        renter: pct(counts.renter),
      });
      console.log(
        `${label} - Winner counts and percentages before selling:`,
        countsBeforeSelling,
        {
          buyerFixed: pct(countsBeforeSelling.buyerFixed),
          buyerVariable: pct(countsBeforeSelling.buyerVariable),
          renter: pct(countsBeforeSelling.renter),
        },
      );
    }

    // Default path (finalBalanceOnly, stride=9)
    const defaultResults = simulateRentVsBuyMonteCarlo(params, {});
    logWinners("default", defaultResults);
    for (
      const category of ["renter", "buyerFixed", "buyerVariable"] as const
    ) {
      const wins = defaultResults.winners.filter((w) =>
        w.category === category
      ).length;
      assert(
        wins > 0,
        `${category} should win at least once without monthlyQuantiles, got 0 out of ${defaultResults.winners.length}`,
      );
    }

    // monthlyQuantiles path (onRecord active, stride=2)
    const quantileResults = simulateRentVsBuyMonteCarlo(params, {
      monthlyQuantiles: ["q10", "q50", "q90"],
    });
    logWinners("monthlyQuantiles", quantileResults);
    for (
      const category of ["renter", "buyerFixed", "buyerVariable"] as const
    ) {
      const wins = quantileResults.winners.filter((w) =>
        w.category === category
      ).length;
      assert(
        wins > 0,
        `${category} should win at least once with monthlyQuantiles, got 0 out of ${quantileResults.winners.length}`,
      );
    }
  },
);

Deno.test(
  "monthlyQuantiles should include totals group for all categories, variables, and months",
  async () => {
    const params = getParamsRentVsBuyMonteCarlo(10, "Montreal", "Quebec", {
      downPayment: 0.10,
      purchaseFixedFees: 0.02,
    }, {
      renterMonthlyInsurance: 70,
      ownerMonthlyInsurance: 125,
      sellingFixedFees: 2000,
      condoFees: 250,
    }, false);

    const results = simulateRentVsBuyMonteCarlo(params, {
      monthlyQuantiles: ["q10", "q50", "q90"],
    });

    const counts = { buyerFixed: 0, buyerVariable: 0, renter: 0 };
    const countsBeforeSelling = { buyerFixed: 0, buyerVariable: 0, renter: 0 };
    for (const w of results.winners) counts[w.category] += 1;
    for (const w of results.winnersBeforeSelling) {
      countsBeforeSelling[w.category] += 1;
    }
    const total = results.winners.length;
    const pct = (n: number) => Math.round((n / total) * 100);
    console.log("Winner counts and percentages:", counts, {
      buyerFixed: pct(counts.buyerFixed),
      buyerVariable: pct(counts.buyerVariable),
      renter: pct(counts.renter),
    });
    console.log(
      "Winner counts and percentages before selling:",
      countsBeforeSelling,
      {
        buyerFixed: pct(countsBeforeSelling.buyerFixed),
        buyerVariable: pct(countsBeforeSelling.buyerVariable),
        renter: pct(countsBeforeSelling.renter),
      },
    );

    const categories = ["renter", "buyerFixed", "buyerVariable"] as const;
    const totalsVariables = [
      "monthlyExpenses",
      "cumulativeExpenses",
      "monthlyGains",
      "cumulativeGains",
      "assets",
      "saleCosts",
      "saleNetGains",
    ] as const;
    const numberOfMonths = params.numberOfYears * 12;

    for (const category of categories) {
      for (const variable of totalsVariables) {
        const rows = results.monthlyQuantiles.filter(
          (d) =>
            d.group === "totals" &&
            d.variable === variable &&
            d.category === category,
        );

        // Every month must be present
        assertEquals(
          rows.length,
          numberOfMonths,
          `Expected ${numberOfMonths} months for ${category}/totals/${variable}, got ${rows.length}`,
        );

        // Month indices must be contiguous 0..N-1
        const monthIndices = rows.map((d) => d.monthIndex).sort((a, b) =>
          a - b
        );
        assertEquals(
          monthIndices,
          Array.from({ length: numberOfMonths }, (_, i) => i),
          `Month indices not contiguous for ${category}/totals/${variable}`,
        );

        // Quantile ordering must hold on every row
        for (const row of rows) {
          assert(
            (row.q10 ?? 0) <= (row.q50 ?? 0),
            `q10 <= q50 failed for ${category}/totals/${variable} month ${row.monthIndex}`,
          );
          assert(
            (row.q50 ?? 0) <= (row.q90 ?? 0),
            `q50 <= q90 failed for ${category}/totals/${variable} month ${row.monthIndex}`,
          );
        }
      }
    }
  },
);

Deno.test(
  "monthlyQuantiles with ['min', 'max'] should have min/max but not q10/q50/q90",
  () => {
    const params = getParamsRentVsBuyMonteCarlo(10, "Montreal", "Quebec", {
      downPayment: 0.10,
      purchaseFixedFees: 0.02,
    }, {
      renterMonthlyInsurance: 70,
      ownerMonthlyInsurance: 125,
      sellingFixedFees: 2000,
      condoFees: 250,
    }, false);

    const results = simulateRentVsBuyMonteCarlo(params, {
      monthlyQuantiles: ["min", "max"],
    });

    assert(results.monthlyQuantiles.length > 0);

    for (const row of results.monthlyQuantiles) {
      assert(
        typeof row.min === "number",
        `min should be a number, got ${row.min}`,
      );
      assert(
        typeof row.max === "number",
        `max should be a number, got ${row.max}`,
      );
      assert(
        row.min <= row.max,
        `min <= max failed for ${row.category}/${row.group}/${row.variable} month ${row.monthIndex}`,
      );
      assertEquals(
        row.q10,
        undefined,
        `q10 should be undefined when not requested`,
      );
      assertEquals(
        row.q50,
        undefined,
        `q50 should be undefined when not requested`,
      );
      assertEquals(
        row.q90,
        undefined,
        `q90 should be undefined when not requested`,
      );
    }
  },
);

Deno.test(
  "monthlyQuantiles with ['q50', 'min', 'max'] should have q50/min/max but not q10/q90",
  () => {
    const params = getParamsRentVsBuyMonteCarlo(10, "Montreal", "Quebec", {
      downPayment: 0.10,
      purchaseFixedFees: 0.02,
    }, {
      renterMonthlyInsurance: 70,
      ownerMonthlyInsurance: 125,
      sellingFixedFees: 2000,
      condoFees: 250,
    }, false);

    const results = simulateRentVsBuyMonteCarlo(params, {
      monthlyQuantiles: ["q50", "min", "max"],
    });

    assert(results.monthlyQuantiles.length > 0);

    for (const row of results.monthlyQuantiles) {
      assert(
        typeof row.q50 === "number",
        `q50 should be a number, got ${row.q50}`,
      );
      assert(
        typeof row.min === "number",
        `min should be a number, got ${row.min}`,
      );
      assert(
        typeof row.max === "number",
        `max should be a number, got ${row.max}`,
      );
      assert(
        row.min <= row.q50,
        `min <= q50 failed for ${row.category}/${row.group}/${row.variable} month ${row.monthIndex}`,
      );
      assert(
        row.q50 <= row.max,
        `q50 <= max failed for ${row.category}/${row.group}/${row.variable} month ${row.monthIndex}`,
      );
      assertEquals(
        row.q10,
        undefined,
        `q10 should be undefined when not requested`,
      );
      assertEquals(
        row.q90,
        undefined,
        `q90 should be undefined when not requested`,
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
    monthlyIterations: true,
  });

  assertEquals(results.winners.length, 3);
  assertEquals(results.winnersBeforeSelling.length, 3);

  // monthlyIterations is empty by default
  const defaultResults = simulateRentVsBuyMonteCarlo(params, {});
  assertEquals(defaultResults.monthlyIterations, []);

  // monthlyIterations is populated
  assert(results.monthlyIterations.length > 0);

  // Each record has the expected shape
  const sample = results.monthlyIterations[0];
  assert(typeof sample.iteration === "number");
  assert(typeof sample.category === "string");
  assert(typeof sample.group === "string");
  assert(typeof sample.variable === "string");
  assert(typeof sample.monthIndex === "number");
  assert(typeof sample.amount === "number");

  // Iteration values span 0 to iterations-1
  const iterationValues = new Set(
    results.monthlyIterations.map((r) => r.iteration),
  );
  for (let i = 0; i < 3; i++) {
    assert(
      iterationValues.has(i),
      `Iteration ${i} should be present in monthlyIterations`,
    );
  }

  // The renter summaryCumulative balance should appear once per month per iteration
  const renterBalance = results.monthlyIterations.filter(
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
    results.monthlyIterations.map((r) => r.variable),
  );
  for (const v of expectedVariables) {
    assert(
      actualVariables.has(v as any),
      `Variable ${v} is missing from monthlyIterations`,
    );
  }

  // monthlyIterations and monthlyQuantiles can be used simultaneously
  const combined = simulateRentVsBuyMonteCarlo(params, {
    monthlyIterations: true,
    monthlyQuantiles: ["q10", "q50", "q90"],
  });
  assert(combined.monthlyIterations.length > 0);
  assert(combined.monthlyQuantiles.length > 0);
});
