import { assertEquals } from "jsr:@std/assert";
import simulateRentVsBuy from "../../src/finance/simulateRentVsBuy.ts";
import allRates from "../data/allRates.json" with { type: "json" };
import makeCharts from "./helpers/makeCharts.ts";
import adjustToInflation from "../../src/finance/adjustToInflation.ts";
import getParams from "./helpers/getParams.ts";

function logFinalResults(
  results: ReturnType<typeof simulateRentVsBuy>,
  city: string,
) {
  console.log(`\nFinal results for ${city} after simulation:\n`);

  const maxMonth = Math.max(...results.map((r) => r.monthIndex));

  const finalSummary = results.filter((d) =>
    d.group === "summaryCumulative" && d.variable === "balanceAfterSelling" &&
    d.monthIndex === maxMonth
  );

  const tableData = finalSummary.map((entry) => ({
    Variable: entry.variable,
    Category: entry.category,
    Amount: entry.amount,
  })).sort((a, b) => a.Amount - b.Amount);

  console.table(tableData);
}

// Shared variables
const numberOfYears = 25;
// Yahoo Finance S&P/TSX
const marketReturnRate = allRates.filter((d) =>
  d.geo === "Stock market" && d.variable === "S&P/TSX"
);
// CPI Canada
const canadaRenterInsuranceIncrease = allRates.filter((d) =>
  d.geo === "Canada" && d.variable === "CPI Tenants insurance"
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

Deno.test("should compute the total expenses and savings of a renter and buyer", async (t) => {
  // MONTREAL EXAMPLE

  // CPI Quebec
  const quebecRentIncreaseCPI = allRates.filter((d) =>
    d.geo === "Quebec" && d.variable === "CPI Rent"
  );
  // CPI Quebec
  const quebecOwnerInsuranceIncrease = allRates.filter((d) =>
    d.geo === "Quebec" && d.variable === "CPI Homeowners insurance"
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

  console.log(getParams("Montreal", "Quebec", 0.21, 2740));

  /*

  const results = simulateRentVsBuy({
    startingYear: 2000,
    numberOfYears,
    tfsaContributions: true,
    combinedTaxRate: 0.21, // Combined federal + provincial tax rate for Quebec for a $75,000 annual income. From https://turbotax.intuit.ca/tax-resources/canada-income-tax-calculator
    renter: {
      startingMonthlyRent: 509, // Avg two-bedroom apartment rent in Montreal was 509 and 1176 in 2000 and 2024 respectively
      securityDeposit: 509, // One month of rent
      startingMonthlyInsurance: 45, // CPI was 93.7 in 2000 and 123.2 in 2024
    },
    buyer: {
      purchasePrice: 105_135, // Avg home price in Montreal was 105,135 and 412,400 in 2000 and 2024 respectively
      downPayment: 10_514, // 10% down payment
      purchaseFixedFees: 2_100, // 2% of purchase price; welcome tax alone would have been around 757 accordong to WOWA.
      fixedRateDiscount: 0.01, // Just for fixed mortgage
      variableRateMargin: 0.0015, // Just for variable mortgage
      startingAnnualMaintenanceCost: 500, // Not much, since it's a condo. This is 1000$ in 2024. CPI 'mantenance and repairs' was 88.2 in 2000 and 178 in 2024
      startingMonthlyCondoFees: 150, // 300$ adjusted to inflation CPI 'mantenance and repairs' was 88.2 in 2000 and 178 in 2024
      startingAnnualPropertyTax: 1400, // $2,740 in 2024 according to https://wowa.ca/taxes/montreal-property-tax. CPI 'property taxes' was 101 in 2000 and 157 in 2024
      startingMonthlyInsurance: 50, // Condo, so just partial insurance. Just a bit more than renter. 83.2 in 2000 and 233.3 in 2024
      sellingFixedFees: 1200, // $2000 in 2024 adjusted to 2000 inflation. All-items CPI Quebec was 94.1 in 2000 and 157.5 in 2024
      sellingCommissionRate: 0.04,
    },
    rates: {
      marketReturnRate: marketReturnRate.map((d) => d.pctChange),
      rentIncrease: quebecRentIncreaseCPI.map((d) => d.pctChange),
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

  const allRatesFiltered = [
    ...montrealAppreciationIncrease,
    ...marketReturnRate,
    ...quebecRentIncreaseCPI,
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

  await makeCharts("montreal", results, allRatesFiltered);
  logFinalResults(results, "Montreal");

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

  await t.step("first month expenses", async () => {
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

  // Expenses on the second month
  const secondMonthExpenses = results.filter((d) =>
    d.monthIndex === 1 &&
    d.group === "monthlyExpenses"
  );

  // console.log(secondMonthExpenses.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("second month expenses", async () => {
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
          amount: 509.51,
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

  const cumulativeExpensesLastMonth = results.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 &&
    d.group === "cumulativeExpenses"
  );

  // console.log(cumulativeExpensesLastMonth.map((d) => ({
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
          amount: 178387.67,
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
          amount: 1018.51,
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
          amount: 475.07,
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

  const cumulativeGains = results.filter((d) => d.group === "cumulativeGains");

  const cumulativeGainsLastMonth = cumulativeGains.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 && d.group === "cumulativeGains"
  );

  // console.log(cumulativeGainsLastMonth.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("cumulative gains last month", async () => {
    assertEquals(
      cumulativeGainsLastMonth.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 53864.75,
          category: "renter",
          group: "cumulativeGains",
          variable: "tfsaGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 79971.68,
          category: "renter",
          group: "cumulativeGains",
          variable: "tfsaContribution",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 114111.36,
          category: "renter",
          group: "cumulativeGains",
          variable: "stocksGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 64510.24,
          category: "renter",
          group: "cumulativeGains",
          variable: "newStocks",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 412185.37,
          category: "buyerFixed",
          group: "cumulativeGains",
          variable: "homeEquityGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 8990.5,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "tfsaGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 11795.54,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "tfsaContribution",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 7425.3,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "stocksGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 5072.52,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "newStocks",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 412185.37,
          category: "buyerVariable",
          group: "cumulativeGains",
          variable: "homeEquityGains",
        },
      ],
    );
  });

  // We want to ensure that starting on 2009, the buyer's TFSA gains start accumulating
  const cumulativeGainsBeforeTFSA = cumulativeGains.filter((d) =>
    d.year === 2008 && d.month === 11 && d.group === "cumulativeGains"
  );
  const buyerFixedNewStocksBeforeTFSA =
    cumulativeGainsBeforeTFSA.find((d) =>
      d.category === "buyerFixed" && d.variable === "newStocks"
    )?.amount ?? 0;
  const buyerFixedNewStocksAfterTFSA =
    cumulativeGainsLastMonth.find((d) =>
      d.category === "buyerFixed" && d.variable === "newStocks"
    )?.amount ?? 0;

  await t.step("No new stocks after 2009 (buyerFixed)", async () => {
    assertEquals(buyerFixedNewStocksBeforeTFSA, buyerFixedNewStocksAfterTFSA);
  });

  const buyerVariableNewStocksBeforeTFSA =
    cumulativeGainsBeforeTFSA.find((d) =>
      d.category === "buyerVariable" && d.variable === "newStocks"
    )?.amount ?? 0;
  const buyerVariableNewStocksAfterTFSA =
    cumulativeGainsLastMonth.find((d) =>
      d.category === "buyerVariable" && d.variable === "newStocks"
    )?.amount ?? 0;

  await t.step("No new stocks after 2009 (buyerVariable)", async () => {
    assertEquals(
      buyerVariableNewStocksBeforeTFSA,
      buyerVariableNewStocksAfterTFSA,
    );
  });

  const renterNewStocksBeforeTFSA =
    cumulativeGainsBeforeTFSA.find((d) =>
      d.category === "renter" && d.variable === "newStocks"
    )?.amount ?? 0;
  const renterNewStocksAfterTFSA =
    cumulativeGainsLastMonth.find((d) =>
      d.category === "renter" && d.variable === "newStocks"
    )?.amount ?? 0;

  await t.step("Almost no new stocks after 2009 (renter)", async () => {
    assertEquals(
      Math.round(renterNewStocksAfterTFSA - renterNewStocksBeforeTFSA),
      127,
    );
  });

  const assets = results.filter((d) => d.group === "assets");

  const assetsLastMonth = assets.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 && d.group === "assets"
  );

  // console.log(assetsLastMonth.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("assets last month", async () => {
    assertEquals(
      assetsLastMonth.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 133836.43,
          category: "renter",
          group: "assets",
          variable: "tfsa",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 178621.6,
          category: "renter",
          group: "assets",
          variable: "stocks",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 509,
          category: "renter",
          group: "assets",
          variable: "securityDeposit",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 412185.37,
          category: "buyerFixed",
          group: "assets",
          variable: "homeEquity",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 20786.04,
          category: "buyerVariable",
          group: "assets",
          variable: "tfsa",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 12497.82,
          category: "buyerVariable",
          group: "assets",
          variable: "stocks",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 412185.37,
          category: "buyerVariable",
          group: "assets",
          variable: "homeEquity",
        },
      ],
    );
  });

  const saleCosts = results.filter((d) => d.group === "saleCosts");

  const saleCostsLastMonth = saleCosts.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 && d.group === "saleCosts"
  );

  // console.log(saleCostsLastMonth.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("sale costs last month", async () => {
    assertEquals(
      saleCostsLastMonth.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 13122.81,
          category: "renter",
          group: "saleCosts",
          variable: "stockTaxes",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 16487.41,
          category: "buyerFixed",
          group: "saleCosts",
          variable: "homeSellingCommission",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 1504.73,
          category: "buyerFixed",
          group: "saleCosts",
          variable: "homeSellingFixedFees",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 853.91,
          category: "buyerVariable",
          group: "saleCosts",
          variable: "stockTaxes",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 16487.41,
          category: "buyerVariable",
          group: "saleCosts",
          variable: "homeSellingCommission",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 1504.73,
          category: "buyerVariable",
          group: "saleCosts",
          variable: "homeSellingFixedFees",
        },
      ],
    );
  });

  const saleNetGains = results.filter((d) => d.group === "saleNetGains");

  const saleNetGainsLastMonth = saleNetGains.filter((d) =>
    d.monthIndex === (numberOfYears * 12) - 1 && d.group === "saleNetGains"
  );

  // console.log(saleNetGainsLastMonth.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("sale net gains last month", async () => {
    assertEquals(
      saleNetGainsLastMonth.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 165498.79,
          category: "renter",
          group: "saleNetGains",
          variable: "stockSellingGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 133836.43,
          category: "renter",
          group: "saleNetGains",
          variable: "tfsaSellingGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 509,
          category: "renter",
          group: "saleNetGains",
          variable: "securityDeposit",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 394193.23,
          category: "buyerFixed",
          group: "saleNetGains",
          variable: "homeSellingGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 11643.91,
          category: "buyerVariable",
          group: "saleNetGains",
          variable: "stockSellingGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 20786.04,
          category: "buyerVariable",
          group: "saleNetGains",
          variable: "tfsaSellingGains",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 394193.23,
          category: "buyerVariable",
          group: "saleNetGains",
          variable: "homeSellingGains",
        },
      ],
    );
  });

  const overallBalanceAfterSelling = results.filter((d) =>
    d.group === "summaryCumulative" && d.variable === "balanceAfterSelling"
  );

  const overallBalanceAfterSellingLastMonth = overallBalanceAfterSelling.filter(
    (d) =>
      d.monthIndex === (numberOfYears * 12) - 1 &&
      d.group === "summaryCumulative" &&
      d.variable === "balanceAfterSelling",
  );

  // console.log(overallBalanceAfterSellingLastMonth.map((d) => ({
  //   ...d,
  //   date: d.date.toISOString(),
  // })));

  await t.step("overall balance after selling last month", async () => {
    assertEquals(
      overallBalanceAfterSellingLastMonth.map((d) => ({
        ...d,
        date: d.date.toISOString(),
      })),
      [
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 105272.94,
          category: "renter",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 55140.03,
          category: "buyerFixed",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
        {
          year: 2024,
          month: 11,
          monthIndex: 299,
          date: "2024-12-01T00:00:00.000Z",
          amount: 104438.04,
          category: "buyerVariable",
          group: "summaryCumulative",
          variable: "balanceAfterSelling",
        },
      ],
    );
  });

  // Toronto example

  // CPI Ontario
  const ontarioRentIncreaseCPI = allRates.filter((d) =>
    d.geo === "Ontario" && d.variable === "CPI Rent"
  );
  // CPI Ontario
  const ontarioOwnerInsuranceIncrease = allRates.filter((d) =>
    d.geo === "Ontario" && d.variable === "CPI Homeowners insurance"
  );
  // CPI Ontario
  const ontarioMaintenanceIncrease = allRates.filter((d) =>
    d.geo === "Ontario" && d.variable === "CPI Homeowners maintenance"
  );
  // CPI Ontario
  const ontarioPropertyTaxIncrease = allRates.filter((d) =>
    d.geo === "Ontario" && d.variable === "CPI Property taxes & others"
  );
  // CREA Apartment Toronto
  const torontoAppreciationIncrease = allRates.filter((d) =>
    d.geo === "Toronto" && d.variable === "Apartment price"
  );
  // All-items CPI Ontario
  const ontarioSellingFixedFeesIncrease = allRates.filter((d) =>
    d.geo === "Ontario" && d.variable === "CPI All-items"
  );

  console.log(adjustToInflation(4312, 201.4, 95.3));

  const resultsToronto = simulateRentVsBuy({
    startingYear: 2000,
    numberOfYears,
    tfsaContributions: true,
    combinedTaxRate: 0.17, // Combined federal + provincial tax rate for Ontario for a $75,000 annual income. From https://turbotax.intuit.ca/tax-resources/canada-income-tax-calculator
    renter: {
      startingMonthlyRent: 916, // Avg two-bedroom apartment rent in Toronto was 916 and 1972 in 2000 and 2024 respectively
      securityDeposit: 916, // One month of rent
      startingMonthlyInsurance: 45, // Same as Montreal
    },
    buyer: {
      purchasePrice: 130_957, // Avg home price in Toronto was 130,957 and 602,800 in 2000 and 2024 respectively
      downPayment: 13_096, // 10% down payment
      purchaseFixedFees: 2_600, // 2% of purchase price; welcome tax alone would have been around.
      fixedRateDiscount: 0.01, // Same as Montreal
      variableRateMargin: 0.0015, // Same as Montreal
      startingAnnualMaintenanceCost: 500, // Same as Montreal
      startingMonthlyCondoFees: 150, // Same as Montreal
      startingAnnualPropertyTax: 2040, // $4,312 in 2024 according to https://wowa.ca/taxes/. CPI 'property taxes' was 95.3 in 2000 and 201.4 in 2024
      startingMonthlyInsurance: 50, // Condo, so just partial insurance. Just a bit more than renter. 83.2 in 2000 and 233.3 in 2024
      sellingFixedFees: 1200, // $2000 in 2024 adjusted to 2000 inflation. All-items CPI Quebec was 94.1 in 2000 and 157.5 in 2024
      sellingCommissionRate: 0.04,
    },
    rates: {
      marketReturnRate: marketReturnRate.map((d) => d.pctChange),
      rentIncrease: ontarioRentIncreaseCPI.map((d) => d.pctChange),
      ownerInsuranceIncrease: ontarioOwnerInsuranceIncrease.map((d) =>
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
      maintenanceIncrease: ontarioMaintenanceIncrease.map((d) => d.pctChange),
      propertyTaxIncrease: ontarioPropertyTaxIncrease.map((d) => d.pctChange),
      condoFeeIncrease: ontarioMaintenanceIncrease.map((d) => d.pctChange),
      appreciationIncrease: torontoAppreciationIncrease.map((d) => d.pctChange),
      sellingFixedFeesIncrease: ontarioSellingFixedFeesIncrease.map((d) =>
        d.pctChange
      ),
    },
  });

  const allRatesFilteredOntario = [
    ...torontoAppreciationIncrease,
    ...marketReturnRate,
    ...ontarioRentIncreaseCPI,
    ...ontarioOwnerInsuranceIncrease,
    ...canadaRenterInsuranceIncrease,
    ...ontarioMaintenanceIncrease,
    ...ontarioPropertyTaxIncrease,
    ...ontarioSellingFixedFeesIncrease,
    ...fiveYearInterestRates,
    ...fourYearInterestRates,
    ...threeYearInterestRates,
    ...twoYearInterestRates,
    ...oneYearInterestRates,
    ...variableInterestRates,
  ];

  await makeCharts("toronto", resultsToronto, allRatesFilteredOntario);
  logFinalResults(resultsToronto, "Toronto");

  //Just for now
  assertEquals(true, true);
  **/
});
