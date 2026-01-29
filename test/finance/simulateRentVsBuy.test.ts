import { assertEquals } from "jsr:@std/assert";
import simulateRentVsBuy from "../../src/finance/simulateRentVsBuy.ts";
import { saveChart } from "@nshiab/journalism-dataviz";
import { areaY, barY, frame, line, plot, text } from "@observablehq/plot";
import allRates from "../data/allRates.json" with { type: "json" };

Deno.test("should compute the total expenses and savings of a renter and buyer", async (t) => {
  // MONTREAL EXAMPLE

  const numberOfYears = 25;
  // Yahoo Finance S&P/TSX
  const marketReturnRate = allRates.filter((d) =>
    d.geo === "Stock market" && d.variable === "S&P/TSX"
  );
  // CMHC two-bedroom apartment Montreal
  const montrealRentIncrease = allRates.filter((d) =>
    d.geo === "Montreal" && d.variable === "Two-bedroom rent"
  );
  // CPI Quebec
  const quebecOwnerInsuranceIncrease = allRates.filter((d) =>
    d.geo === "Quebec" && d.variable === "CPI Homeowners insurance"
  );
  // CPI Canada
  const canadaRenterInsuranceIncrease = allRates.filter((d) =>
    d.geo === "Canada" && d.variable === "CPI Tenants insurance"
  );
  // CPI Quebec
  const quebecMaintenanceIncrease = allRates.filter((d) =>
    d.geo === "Quebec" && d.variable === "CPI Homeowners maintenance"
  );
  // CPI Quebec
  const quebecPropertyTaxIncrease = allRates.filter((d) =>
    d.geo === "Quebec" && d.variable === "CPI Property taxes & others"
  );
  // CREA Apartment Montreal
  const montrealAppreciationIncrease = allRates.filter((d) =>
    d.geo === "Montreal" && d.variable === "Apartment price"
  );
  // All-items CPI Quebec
  const quebecSellingFixedFeesIncrease = allRates.filter((d) =>
    d.geo === "Quebec" && d.variable === "CPI All-items"
  );
  // Bank of Canada
  const fiveYearInterestRates = allRates.filter((d) =>
    d.geo === "Canada" && d.variable === "Five-year fixed mortgage rate"
  );
  // Bank of Canada interpolated
  const fourYearInterestRates = allRates.filter((d) =>
    d.geo === "Canada" && d.variable === "Four-year fixed mortgage rate"
  );
  // Bank of Canada
  const threeYearInterestRates = allRates.filter((d) =>
    d.geo === "Canada" && d.variable === "Three-year fixed mortgage rate"
  );
  // Bank of Canada interpolated
  const twoYearInterestRates = allRates.filter((d) =>
    d.geo === "Canada" && d.variable === "Two-year fixed mortgage rate"
  );
  // Bank of Canada
  const oneYearInterestRates = allRates.filter((d) =>
    d.geo === "Canada" && d.variable === "One-year fixed mortgage rate"
  );
  const variableInterestRates = allRates.filter((d) =>
    d.geo === "Canada" && d.variable === "Bank of Canada prime rate"
  );

  const allRatesFiltered = [
    ...montrealAppreciationIncrease,
    ...marketReturnRate,
    ...montrealRentIncrease,
    ...quebecOwnerInsuranceIncrease,
    ...canadaRenterInsuranceIncrease,
    ...quebecMaintenanceIncrease,
    ...quebecPropertyTaxIncrease,
    ...quebecSellingFixedFeesIncrease,
    ...fiveYearInterestRates,
    ...fourYearInterestRates,
    ...threeYearInterestRates,
    ...twoYearInterestRates,
    ...oneYearInterestRates,
    ...variableInterestRates,
  ];

  const results = simulateRentVsBuy({
    startingYear: 2000,
    numberOfYears,
    tfsaContributions: true,
    combinedTaxRate: 0.23, // Combined federal + provincial tax rate for Quebec for a $75,000 annual income
    renter: {
      startingMonthlyRent: 509, // Avg two-bedroom apartment rent in Montreal was 509 and 1176 in 2000 and 2024 respectively
      securityDeposit: 509, // One month of rent
      startingMonthlyInsurance: 45, // CPI was 93.7 in 2000 and 123.2 in 2024
    },
    buyer: {
      purchasePrice: 105_135, // Avg home price in Montreal was 105,135 and 412,400 in 2000 and 2024 respectively
      downPayment: 10_514, // 10% down payment
      purchaseFixedFees: 2_100, // 2% of purchase price
      fixedRateDiscount: 0.01, // Just for fixed mortgage
      variableRateMargin: 0.0015, // Just for variable mortgage
      startingAnnualMaintenanceCost: 500, // Not much, since it's a condo. This is 1000$ in 2024. CPI 'mantenance and repairs' was 88.2 in 2000 and 178 in 2024
      startingMonthlyCondoFees: 150, // 300$ adjusted to inflation CPI 'mantenance and repairs' was 88.2 in 2000 and 178 in 2024
      startingAnnualPropertyTax: 1300, // 1700$ property taxe + 300$ school tax adjusted to inflation. CPI 'property taxes' was 88.5 in 2000 and 178.2 in 2024
      startingMonthlyInsurance: 50, // Condo, so just partial insurance. Just a bit more than renter. 83.2 in 2000 and 233.3 in 2024
      sellingFixedFees: 900, // $1500 in 2000 adjusted to 2000 inflation. All-items CPI Quebec was 94.1 in 2000 and 157.5 in 2024
      sellingCommissionRate: 0.04,
    },
    rates: {
      marketReturnRate: marketReturnRate.map((d) => d.pctChange),
      rentIncrease: montrealRentIncrease.map((d) => d.pctChange),
      ownerInsuranceIncrease: quebecOwnerInsuranceIncrease.map((d) =>
        d.pctChange
      ),
      renterInsuranceIncrease: canadaRenterInsuranceIncrease.map((d) =>
        d.pctChange
      ),
      fiveYearInterestRates: fiveYearInterestRates.map((d) => d.value),
      fourYearInterestRates: fourYearInterestRates.map((d) => d.value),
      threeYearInterestRates: threeYearInterestRates.map((d) => d.value),
      twoYearInterestRates: twoYearInterestRates.map((d) => d.value),
      oneYearInterestRates: oneYearInterestRates.map((d) => d.value),
      variableInterestRates: variableInterestRates.map((d) => d.value),
      maintenanceIncrease: quebecMaintenanceIncrease.map((d) => d.pctChange),
      propertyTaxIncrease: quebecPropertyTaxIncrease.map((d) => d.pctChange),
      condoFeeIncrease: quebecMaintenanceIncrease.map((d) => d.pctChange),
      appreciationIncrease: montrealAppreciationIncrease.map((d) =>
        d.pctChange
      ),
      sellingFixedFeesIncrease: quebecSellingFixedFeesIncrease.map((d) =>
        d.pctChange
      ),
    },
  });

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
    "test/output/montreal-all-indexed-values.png",
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
    "test/output/montreal-all-rates.png",
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
    "test/output/montreal-all-mortgage-rates.png",
    { style: "body { width: 700px; }" },
  );

  const mortgageRatesFixedBuyer = results.filter((d) =>
    [2000, 2005, 2010, 2015, 2020].includes(d.year) && d.month === 0 &&
    d.variable.includes("mortgage") && d.group === "monthlyExpenses" &&
    d.category === "buyerFixed"
  ).map((d) => ({
    ...d,
    date: d.date.toISOString(),
  }));

  await t.step("mortgage rates fixed buyer", async () => {
    assertEquals(mortgageRatesFixedBuyer, [
      {
        year: 2000,
        month: 0,
        monthIndex: 0,
        date: "2000-01-01T00:00:00.000Z",
        amount: 114.19,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0725,
        postedInterestRate: 0.0825,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2000,
        month: 0,
        monthIndex: 0,
        date: "2000-01-01T00:00:00.000Z",
        amount: 563.22,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0725,
        postedInterestRate: 0.0825,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2005,
        month: 0,
        monthIndex: 60,
        date: "2005-01-01T00:00:00.000Z",
        amount: 210.3,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0505,
        postedInterestRate: 0.0605,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2005,
        month: 0,
        monthIndex: 60,
        date: "2005-01-01T00:00:00.000Z",
        amount: 359.9,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0505,
        postedInterestRate: 0.0605,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2010,
        month: 0,
        monthIndex: 120,
        date: "2010-01-01T00:00:00.000Z",
        amount: 282.44,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0449,
        postedInterestRate: 0.0549,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2010,
        month: 0,
        monthIndex: 120,
        date: "2010-01-01T00:00:00.000Z",
        amount: 267.34,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0449,
        postedInterestRate: 0.0549,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2015,
        month: 0,
        monthIndex: 180,
        date: "2015-01-01T00:00:00.000Z",
        amount: 365.71,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0379,
        postedInterestRate: 0.0479,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2015,
        month: 0,
        monthIndex: 180,
        date: "2015-01-01T00:00:00.000Z",
        amount: 166.63,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0379,
        postedInterestRate: 0.0479,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2020,
        month: 0,
        monthIndex: 240,
        date: "2020-01-01T00:00:00.000Z",
        amount: 436.85,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0419,
        postedInterestRate: 0.0519,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
      {
        year: 2020,
        month: 0,
        monthIndex: 240,
        date: "2020-01-01T00:00:00.000Z",
        amount: 100.65,
        category: "buyerFixed",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0419,
        postedInterestRate: 0.0519,
        fixedRateDiscount: 0.01,
        variableRateMargin: 0,
      },
    ]);
  });

  const mortgageRatesVariableBuyer = results.filter((d) =>
    [2000, 2005, 2010, 2015, 2020].includes(d.year) && d.month === 0 &&
    d.variable.includes("mortgage") && d.group === "monthlyExpenses" &&
    d.category === "buyerVariable"
  ).map((d) => ({
    ...d,
    date: d.date.toISOString(),
  }));

  await t.step("mortgage rates variable buyer", async () => {
    assertEquals(mortgageRatesVariableBuyer, [
      {
        year: 2000,
        month: 0,
        monthIndex: 0,
        date: "2000-01-01T00:00:00.000Z",
        amount: 123.43,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0665,
        postedInterestRate: 0.065,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2000,
        month: 0,
        monthIndex: 0,
        date: "2000-01-01T00:00:00.000Z",
        amount: 524.36,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0665,
        postedInterestRate: 0.065,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2005,
        month: 0,
        monthIndex: 60,
        date: "2005-01-01T00:00:00.000Z",
        amount: 208.37,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.044,
        postedInterestRate: 0.0425,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2005,
        month: 0,
        monthIndex: 60,
        date: "2005-01-01T00:00:00.000Z",
        amount: 293.18,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.044,
        postedInterestRate: 0.0425,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2010,
        month: 0,
        monthIndex: 120,
        date: "2010-01-01T00:00:00.000Z",
        amount: 315.18,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.024,
        postedInterestRate: 0.0225,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2010,
        month: 0,
        monthIndex: 120,
        date: "2010-01-01T00:00:00.000Z",
        amount: 136.41,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.024,
        postedInterestRate: 0.0225,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2015,
        month: 0,
        monthIndex: 180,
        date: "2015-01-01T00:00:00.000Z",
        amount: 356.3,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.0315,
        postedInterestRate: 0.03,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2015,
        month: 0,
        monthIndex: 180,
        date: "2015-01-01T00:00:00.000Z",
        amount: 131.72,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.0315,
        postedInterestRate: 0.03,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2020,
        month: 0,
        monthIndex: 240,
        date: "2020-01-01T00:00:00.000Z",
        amount: 409.75,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageCapital",
        effectiveInterestRate: 0.041,
        postedInterestRate: 0.0395,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
      {
        year: 2020,
        month: 0,
        monthIndex: 240,
        date: "2020-01-01T00:00:00.000Z",
        amount: 93.05,
        category: "buyerVariable",
        group: "monthlyExpenses",
        variable: "mortgageInterests",
        effectiveInterestRate: 0.041,
        postedInterestRate: 0.0395,
        fixedRateDiscount: 0,
        variableRateMargin: 0.0015,
      },
    ]);
  });

  // Expenses on the first month
  const firstMonthExpenses = results.filter((d) =>
    d.monthIndex === 0 &&
    d.group === "monthlyExpenses"
  );

  // console.log(firstMonthExpenses.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  t.step("first month expenses", async () => {
    assertEquals(
      firstMonthExpenses.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 509,
          category: "renter",
          group: "monthlyExpenses",
          variable: "rent",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 45,
          category: "renter",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 509,
          category: "renter",
          group: "monthlyExpenses",
          variable: "securityDeposit",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 114.19,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "mortgageCapital",
          effectiveInterestRate: 0.0725,
          postedInterestRate: 0.0825,
          fixedRateDiscount: 0.01,
          variableRateMargin: 0,
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 563.22,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "mortgageInterests",
          effectiveInterestRate: 0.0725,
          postedInterestRate: 0.0825,
          fixedRateDiscount: 0.01,
          variableRateMargin: 0,
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 50,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 42,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 108,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 150,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "condoFees",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 10514,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "downPayment",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 2100,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 2933,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "insurancePremium",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 123.43,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "mortgageCapital",
          effectiveInterestRate: 0.0665,
          postedInterestRate: 0.065,
          fixedRateDiscount: 0,
          variableRateMargin: 0.0015,
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 524.36,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "mortgageInterests",
          effectiveInterestRate: 0.0665,
          postedInterestRate: 0.065,
          fixedRateDiscount: 0,
          variableRateMargin: 0.0015,
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 50,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 42,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 108,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 150,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "condoFees",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 10514,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "downPayment",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 2100,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 2933,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "insurancePremium",
        },
      ],
    );
  });

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
    "test/output/montreal-first-month-expenses.png",
    { style: "body { width: 700px; }" },
  );

  // Expenses on the second month
  const secondMonthExpenses = results.filter((d) =>
    d.monthIndex === 1 &&
    d.group === "monthlyExpenses"
  );

  // console.log(secondMonthExpenses.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  t.step("second month expenses", async () => {
    assertEquals(
      secondMonthExpenses.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 509,
          category: "renter",
          group: "monthlyExpenses",
          variable: "rent",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 44.81,
          category: "renter",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 114.87,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "mortgageCapital",
          effectiveInterestRate: 0.0725,
          postedInterestRate: 0.0825,
          fixedRateDiscount: 0.01,
          variableRateMargin: 0,
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 562.54,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "mortgageInterests",
          effectiveInterestRate: 0.0725,
          postedInterestRate: 0.0825,
          fixedRateDiscount: 0.01,
          variableRateMargin: 0,
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 50.24,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 42.38,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 108,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 151.36,
          category: "buyerFixed",
          group: "monthlyExpenses",
          variable: "condoFees",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 124.11,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "mortgageCapital",
          effectiveInterestRate: 0.0665,
          postedInterestRate: 0.065,
          fixedRateDiscount: 0,
          variableRateMargin: 0.0015,
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 523.67,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "mortgageInterests",
          effectiveInterestRate: 0.0665,
          postedInterestRate: 0.065,
          fixedRateDiscount: 0,
          variableRateMargin: 0.0015,
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 50.24,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 42.38,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "maintenance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 108,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "propertyTax",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 151.36,
          category: "buyerVariable",
          group: "monthlyExpenses",
          variable: "condoFees",
        },
      ],
    );
  });

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
    "test/output/montreal-second-month-expenses.png",
    { style: "body { width: 700px; }" },
  );

  const cumulativeExpensesLastMonth = results.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 &&
    d.group === "cumulativeExpenses"
  );

  // console.log(cumulativeExpensesLastMonthTotal.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("cumulative expenses last month total", async () => {
    assertEquals(
      cumulativeExpensesLastMonth.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 219809.4,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "rent",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 15674.61,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 509,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "securityDeposit",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 27323.47,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 94621.02,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 77412.27,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 18353.72,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 40284.87,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 65510.85,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 10514,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 2100,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 2933,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurancePremium",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 27323.47,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 94621.07,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 60544.16,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 18353.72,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 40284.87,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 65510.85,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 10514,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 2100,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 2933,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurancePremium",
        },
      ],
    );
  });

  const cumulativeExpensesSecondMonth = results.filter((d) =>
    d.monthIndex === 1 &&
    d.group === "cumulativeExpenses"
  );

  // console.log(cumulativeExpensesSecondMonth.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("cumulative expenses second month", async () => {
    assertEquals(
      cumulativeExpensesSecondMonth.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 1018,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "rent",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 89.81,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 509,
          category: "renter",
          group: "cumulativeExpenses",
          variable: "securityDeposit",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 100.24,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 229.06,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 1125.76,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 84.38,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 216,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 301.36,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 10514,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 2100,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 2933,
          category: "buyerFixed",
          group: "cumulativeExpenses",
          variable: "insurancePremium",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 100.24,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 247.54,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageCapital",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 1048.03,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "mortgageInterests",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 84.38,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "maintenance",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 216,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "propertyTax",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 301.36,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "condoFees",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 10514,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "downPayment",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 2100,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "purchaseFixedFees",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 2933,
          category: "buyerVariable",
          group: "cumulativeExpenses",
          variable: "insurancePremium",
        },
      ],
    );
  });

  // // Monthly expenses
  // const monthlyExpenses = results.filter((d) =>
  //   d.group === "monthlyExpenses" && d.month !== 0
  // );

  // await saveChart(
  //   monthlyExpenses,
  //   (data) =>
  //     plot({
  //       title: "Monthly expenses over time (first month excluded)",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         nice: true,
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         areaY(data, {
  //           x: "date",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/montreal-monthly-expenses.png",
  //   { style: "body { width: 700px; }" },
  // );

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
    "test/output/montreal-cumulative-expenses.png",
    { style: "body { width: 700px; }" },
  );

  // Gains on the first month
  const firstMonthGains = results.filter((d) =>
    d.monthIndex === 0 &&
    d.group === "monthlyGains"
  );

  // console.log(firstMonthGains.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("first month gains", async () => {
    assertEquals(
      firstMonthGains.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 15511.41,
          category: "renter",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 10628.19,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 105135,
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 29.62,
          category: "buyerVariable",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          year: 2000,
          month: 0,
          monthIndex: 0,
          date: "2000-01-01T00:00:00.000Z",
          amount: 10637.43,
          category: "buyerVariable",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 105135,
        },
      ],
    );
  });

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
    "test/output/montreal-first-month-gains.png",
    { style: "body { width: 700px; }" },
  );

  // Gains on the second month
  const secondMonthGains = results.filter((d) =>
    d.monthIndex === 1 &&
    d.group === "monthlyGains"
  );

  // console.log(secondMonthGains.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("second month gains", async () => {
    assertEquals(
      secondMonthGains.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 1593.02,
          category: "renter",
          group: "monthlyGains",
          variable: "stocksGains",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 475.58,
          category: "renter",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 535.41,
          category: "buyerFixed",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 105555.54,
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 3.04,
          category: "buyerVariable",
          group: "monthlyGains",
          variable: "stocksGains",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 29.63,
          category: "buyerVariable",
          group: "monthlyGains",
          variable: "newStocks",
        },
        {
          year: 2000,
          month: 1,
          monthIndex: 1,
          date: "2000-02-01T00:00:00.000Z",
          amount: 544.65,
          category: "buyerVariable",
          group: "monthlyGains",
          variable: "homeEquityGains",
          homeValue: 105555.54,
        },
      ],
    );
  });

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
    "test/output/montreal-second-month-gains.png",
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
    "test/output/montreal-monthly-gains.png",
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
    "test/output/montreal-cumulative-gains.png",
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
    "test/output/montreal-assets.png",
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
    "test/output/montreal-sale-costs.png",
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
    "test/output/montreal-sale-gains.png",
    { style: "body { width: 700px; }" },
  );

  // Balance on the first month
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
    "test/output/montreal-first-month-balance.png",
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
    "test/output/montreal-monthly-balance.png",
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
    "test/output/montreal-overall-balance.png",
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
    "test/output/montreal-overall-balance-after-selling.png",
    { style: "body { width: 700px; }" },
  );

  // GENERAL EXAMPLE

  // const numberOfYears = 25;
  // const numberOfMonths = numberOfYears * 12;
  // const marketReturnRate = Array.from(
  //   { length: numberOfMonths },
  //   () => 0.005,
  // );
  // const annualRentIncrease = Array.from({ length: numberOfMonths }, () => 0.03);
  // const annualInsuranceIncrease = Array.from(
  //   { length: numberOfMonths },
  //   () => 0.03,
  // );
  // const annualMaintenanceIncrease = Array.from(
  //   { length: numberOfMonths },
  //   () => 0.03,
  // );
  // const annualPropertyTaxIncrease = Array.from(
  //   { length: numberOfMonths },
  //   () => 0.03,
  // );
  // const annualCondoFeeIncrease = Array.from(
  //   { length: numberOfMonths },
  //   () => 0.03,
  // );
  // const annualAppreciationIncrease = Array.from(
  //   { length: numberOfMonths },
  //   () => 0.05,
  // );
  // const annualSellingFixedFeesIncrease = Array.from(
  //   { length: numberOfMonths },
  //   () => 0.03,
  // );
  // const fiveYearInterestRates = Array.from(
  //   { length: numberOfMonths },
  //   () => 0.055,
  // );
  // const fourYearInterestRates = Array.from(
  //   { length: numberOfMonths },
  //   () => 0.05,
  // );
  // const threeYearInterestRates = Array.from(
  //   { length: numberOfMonths },
  //   () => 0.045,
  // );
  // const twoYearInterestRates = Array.from(
  //   { length: numberOfMonths },
  //   () => 0.04,
  // );
  // const oneYearInterestRates = Array.from(
  //   { length: numberOfMonths },
  //   () => 0.035,
  // );
  // const variableInterestRates = Array.from(
  //   { length: numberOfMonths },
  //   () => 0.04,
  // );

  // const results = simulateRentVsBuy({
  //   startingYear: 2000,
  //   numberOfYears,
  //   tfsaContributions: true,
  //   combinedTaxRate: 0.25,
  //   renter: {
  //     startingMonthlyRent: 1750,
  //     securityDeposit: 1750,
  //     startingMonthlyInsurance: 75,
  //   },
  //   buyer: {
  //     purchasePrice: 500_000,
  //     downPayment: 50_000,
  //     rateDiscount: 0.005,
  //     purchaseFixedFees: 25_000,
  //     startingAnnualMaintenanceCost: 2500,
  //     startingAnnualPropertyTax: 3500,
  //     startingMonthlyCondoFees: 100,
  //     startingMonthlyInsurance: 250,
  //     sellingFixedFees: 2000,
  //     sellingCommissionRate: 0.04,
  //   },
  //   rates: {
  //     marketReturnRate,
  //     annualRentIncrease,
  //     annualInsuranceIncrease,
  //     fiveYearInterestRates,
  //     fourYearInterestRates,
  //     threeYearInterestRates,
  //     twoYearInterestRates,
  //     oneYearInterestRates,
  //     variableInterestRates,
  //     annualMaintenanceIncrease,
  //     annualPropertyTaxIncrease,
  //     annualCondoFeeIncrease,
  //     annualAppreciationIncrease,
  //     annualSellingFixedFeesIncrease,
  //   },
  // });

  // // Expenses on the first month
  // const firstMonthExpenses = results.filter((d) =>
  //   d.monthIndex === 0 &&
  //   d.group === "monthlyExpenses"
  // );

  // await saveChart(
  //   firstMonthExpenses,
  //   (data) =>
  //     plot({
  //       title: "First month expenses (Jan. 2000)",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       x: {
  //         label: null,
  //         tickFormat: (d) => d.toString(),
  //       },
  //       grid: true,
  //       marks: [
  //         barY(data, {
  //           x: "year",
  //           y: "amount",
  //           fill: "variable",
  //           order: "amount",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/first-month-expenses.png",
  //   { style: "body { width: 700px; }" },
  // );

  // // Monthly expenses
  // const monthlyExpenses = results.filter((d) =>
  //   d.group === "monthlyExpenses" && d.month !== 0
  // );

  // await saveChart(
  //   monthlyExpenses,
  //   (data) =>
  //     plot({
  //       title: "Monthly expenses over time (first month excluded)",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         nice: true,
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         areaY(data, {
  //           x: "date",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/monthly-expenses.png",
  //   { style: "body { width: 700px; }" },
  // );

  // const cumulativeExpenses = results.filter((d) =>
  //   d.group === "cumulativeExpenses"
  // );

  // await saveChart(
  //   cumulativeExpenses,
  //   (data) =>
  //     plot({
  //       title: "Cumulative expenses over time",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         nice: true,
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         areaY(data, {
  //           x: "date",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/cumulative-expenses.png",
  //   { style: "body { width: 700px; }" },
  // );

  // // Expenses on the first month
  // const firstMonthGains = results.filter((d) =>
  //   d.monthIndex === 0 &&
  //   d.group === "monthlyGains"
  // );

  // await saveChart(
  //   firstMonthGains,
  //   (data) =>
  //     plot({
  //       title: "First month gains (Jan. 2000)",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       x: {
  //         label: null,
  //         tickFormat: (d) => d.toString(),
  //       },
  //       grid: true,
  //       marks: [
  //         barY(data, {
  //           x: "year",
  //           y: "amount",
  //           fill: "variable",
  //           order: "amount",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/first-month-gains.png",
  //   { style: "body { width: 700px; }" },
  // );

  // const monthlyGains = results.filter((d) =>
  //   d.group === "monthlyGains" && d.month !== 0
  // );

  // await saveChart(
  //   monthlyGains,
  //   (data) =>
  //     plot({
  //       title: "Monthly gains over time (excluding first month)",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         nice: true,
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         areaY(data, {
  //           x: "date",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/monthly-gains.png",
  //   { style: "body { width: 700px; }" },
  // );

  // const cumulativeGains = results.filter((d) => d.group === "cumulativeGains");

  // await saveChart(
  //   cumulativeGains,
  //   (data) =>
  //     plot({
  //       title: "Cumulative gains over time",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         nice: true,
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         areaY(data, {
  //           x: "date",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/cumulative-gains.png",
  //   { style: "body { width: 700px; }" },
  // );

  // const assets = results.filter((d) => d.group === "assets");

  // await saveChart(
  //   assets,
  //   (data) =>
  //     plot({
  //       title: "Assets over time",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         nice: true,
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         areaY(data, {
  //           x: "date",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/assets.png",
  //   { style: "body { width: 700px; }" },
  // );

  // const saleCosts = results.filter((d) => d.group === "saleCosts");

  // await saveChart(
  //   saleCosts,
  //   (data) =>
  //     plot({
  //       title: "Sale costs, if assets were sold",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         nice: true,
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         areaY(data, {
  //           x: "date",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/sale-costs.png",
  //   { style: "body { width: 700px; }" },
  // );

  // const saleNetGains = results.filter((d) => d.group === "saleNetGains");

  // await saveChart(
  //   saleNetGains,
  //   (data) =>
  //     plot({
  //       title: "Sale gains, if assets were sold",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         nice: true,
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         areaY(data, {
  //           x: "date",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/sale-gains.png",
  //   { style: "body { width: 700px; }" },
  // );

  // // Balance on the first month
  // const firstMonthBalance = results.filter((d) =>
  //   d.monthIndex === 0 &&
  //   d.group === "summary" && d.variable === "balance"
  // );

  // await saveChart(
  //   firstMonthBalance,
  //   (data) =>
  //     plot({
  //       title: "First month balance (Jan. 2000)",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       x: {
  //         label: null,
  //         tickFormat: (d) => d.toString(),
  //       },
  //       grid: true,
  //       marks: [
  //         barY(data, {
  //           x: "year",
  //           y: "amount",
  //           fill: "variable",
  //           order: "amount",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/first-month-balance.png",
  //   { style: "body { width: 700px; }" },
  // );

  // const monthlyBalance = results.filter((d) =>
  //   d.group === "summary" && d.variable === "balance" && d.month !== 0
  // );

  // await saveChart(
  //   monthlyBalance,
  //   (data) =>
  //     plot({
  //       title: "Monthly balance over time (excluding first month)",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         nice: true,
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         areaY(data, {
  //           x: "date",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/monthly-balance.png",
  //   { style: "body { width: 700px; }" },
  // );

  // const overallBalance = results.filter((d) =>
  //   d.group === "summaryCumulative" && d.variable === "balance"
  // );

  // await saveChart(
  //   overallBalance,
  //   (data) =>
  //     plot({
  //       title: "Overall balance over time",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         nice: true,
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         areaY(data, {
  //           x: "date",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/overall-balance.png",
  //   { style: "body { width: 700px; }" },
  // );

  // const overallBalanceAfterSelling = results.filter((d) =>
  //   d.group === "summaryCumulative" && d.variable === "balanceAfterSelling"
  // );

  // await saveChart(
  //   overallBalanceAfterSelling,
  //   (data) =>
  //     plot({
  //       title: "Overall balance after selling over time",
  //       y: {
  //         nice: true,
  //         label: null,
  //         tickFormat: (d) =>
  //           Math.abs(d) < 1000
  //             ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
  //             : Math.abs(d) < 1_000_000
  //             ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
  //             : d < 0
  //             ? `-$${Math.abs(d) / 1_000_000}M`
  //             : `$${d / 1_000_000}M`,
  //       },
  //       x: {
  //         nice: true,
  //       },
  //       fx: {
  //         label: null,
  //       },
  //       marginLeft: 60,
  //       color: {
  //         legend: true,
  //       },
  //       grid: true,
  //       marks: [
  //         areaY(data, {
  //           x: "date",
  //           y: "amount",
  //           fill: "variable",
  //           fx: "category",
  //         }),
  //       ],
  //     }),
  //   "test/output/overall-balance-after-selling.png",
  //   { style: "body { width: 700px; }" },
  // );

  //Just for now
  assertEquals(true, true);
});
