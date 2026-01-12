import { assertEquals } from "jsr:@std/assert";
import simulateRentVsBuy from "../../src/finance/simulateRentVsBuy.ts";
import { saveChart } from "@nshiab/journalism-dataviz";
import { barY, plot } from "@observablehq/plot";
import getRandomValues from "../../src/finance/getRandomValues.ts";

Deno.test("should compute the total expenses and savings of a renter and buyer", async () => {
  const numberOfYears = 25;
  const annualMarketReturnRate = getRandomValues(
    numberOfYears,
    0.05,
    0,
    { decimals: 4 },
  );
  const annualRentIncrease = getRandomValues(numberOfYears, 0.03, 0, {
    decimals: 4,
  });
  const renterAnnualInsuranceIncrease = getRandomValues(
    numberOfYears,
    0.03,
    0,
    { decimals: 4 },
  );
  const annualMaintenanceIncrease = getRandomValues(
    numberOfYears,
    0.02,
    0,
    { decimals: 4 },
  );
  const annualPropertyTaxIncrease = getRandomValues(
    numberOfYears,
    0.02,
    0,
    { decimals: 4 },
  );
  const annualCondoFeeIncrease = getRandomValues(
    numberOfYears,
    0.02,
    0,
    { decimals: 4 },
  );
  const buyerAnnualInsuranceIncrease = getRandomValues(
    numberOfYears,
    0.03,
    0,
    { decimals: 4 },
  );
  const appreciationIncrease = getRandomValues(
    numberOfYears,
    0.05,
    0,
    { decimals: 4 },
  );

  const results = simulateRentVsBuy({
    startingYear: 2000,
    numberOfYears,
    annualMarketReturnRate,
    tfsaContributions: true,
    renter: {
      startingMonthlyRent: 1750,
      annualRentIncrease,
      securityDeposit: 1750,
      startingMonthlyInsurance: 75,
      annualInsuranceIncrease: renterAnnualInsuranceIncrease,
    },
    buyer: {
      downPayment: 50_000,
      purchasePrice: 500_000,
      interestRate: 0.05,
      purchaseFixedFees: 25_000,
      startingAnnualMaintenanceCost: 2500,
      annualMaintenanceIncrease,
      startingAnnualPropertyTax: 3500,
      annualPropertyTaxIncrease,
      startingMonthlyCondoFees: 100,
      annualCondoFeeIncrease,
      startingMonthlyInsurance: 250,
      annualInsuranceIncrease: buyerAnnualInsuranceIncrease,
      appreciationIncrease,
    },
  });

  // Annual expenses
  const annualExpenses = results.filter((d) =>
    [
      // buyer
      "mortgageCapital",
      "mortgageInterests",
      "maintenance",
      "propertyTax",
      "condoFees",
      "insurance",
      "downPayment",
      "purchaseFixedFees",
      "insurancePremium",
      // renter
      "rent",
      "insurance",
      "securityDeposit",
    ].includes(d.variable)
  );
  await saveChart(
    annualExpenses,
    (data) =>
      plot({
        title: "Annual expenses",
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
          ticks: [2000, 2004, 2009, 2014, 2019, 2024],
          tickFormat: (d) => d.toString(),
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
          barY(data, {
            x: "year",
            y: "amount",
            fill: "variable",
            fx: "category",
          }),
        ],
      }),
    "test/output/annual-expenses.png",
    { style: "body { width: 700px; }" },
  );

  // Cumulative expenses
  const cumulativeExpenses = results.filter((d) =>
    [
      // buyer
      "cumulativeMortgageCapital",
      "cumulativeMortgageInterests",
      "cumulativeMaintenance",
      "cumulativePropertyTax",
      "cumulativeCondoFees",
      "cumulativeInsurance",
      "cumulativeDownPayment",
      "cumulativePurchaseFixedFees",
      "cumulativeInsurancePremium",
      // renter
      "cumulativeRent",
      "cumulativeInsurance",
      "cumulativeSecurityDeposit",
    ].includes(d.variable)
  );
  await saveChart(
    cumulativeExpenses,
    (data) =>
      plot({
        title: "Cumulative expenses",
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
          ticks: [2000, 2004, 2009, 2014, 2019, 2024],
          tickFormat: (d) => d.toString(),
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
          barY(data, {
            x: "year",
            y: "amount",
            fill: "variable",
            fx: "category",
          }),
        ],
      }),
    "test/output/cumulative-expenses.png",
    { style: "body { width: 700px; }" },
  );

  // Buyer home value and equity
  const buyerHomeValue = results.filter((d) =>
    d.category === "buyer" &&
    [
      "homeValue",
      "homeEquity",
    ].includes(d.variable)
  );
  await saveChart(
    buyerHomeValue,
    (data) =>
      plot({
        title: "Buyer - Home value and equity",
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
          ticks: [2000, 2004, 2009, 2014, 2019, 2024],
          tickFormat: (d) => d.toString(),
        },
        marginLeft: 60,
        color: {
          legend: true,
        },
        grid: true,
        marks: [
          barY(data, {
            x: "year",
            y: "amount",
            fill: "variable",
            fx: "variable",
          }),
        ],
      }),
    "test/output/buyer-home-value-equity.png",
    { style: "body { width: 700px; }" },
  );
  // Buyer home value increase and equity gains
  const buyerHomeValueEquityIncrease = results.filter((d) =>
    d.category === "buyer" &&
    [
      "homeValueIncrease",
      "homeEquityGains",
    ].includes(d.variable)
  );
  await saveChart(
    buyerHomeValueEquityIncrease,
    (data) =>
      plot({
        title: "Buyer - Home value and equity increase",
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
          ticks: [2000, 2004, 2009, 2014, 2019, 2024],
          tickFormat: (d) => d.toString(),
        },
        marginLeft: 60,
        color: {
          legend: true,
        },
        grid: true,
        marks: [
          barY(data, {
            x: "year",
            y: "amount",
            fill: "variable",
            fx: "variable",
          }),
        ],
      }),
    "test/output/buyer-home-value-equity-increase.png",
    { style: "body { width: 700px; }" },
  );

  // GAINS
  const gains = results.filter((d) =>
    [
      "marketGains",
      "tfsaGains",
      "tfsaContributions",
      "newStocks",
      // buyer
      "homeEquityGains",
    ].includes(d.variable)
  );
  await saveChart(
    gains,
    (data) =>
      plot({
        title: "Annual gains",
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
          ticks: [2000, 2004, 2009, 2014, 2019, 2024],
          tickFormat: (d) => d.toString(),
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
          barY(data, {
            x: "year",
            y: "amount",
            fill: "variable",
            fx: "category",
          }),
        ],
      }),
    "test/output/annual-gains.png",
    { style: "body { width: 700px; }" },
  );

  // CUMULATIVE GAINS
  const cumulativeGains = results.filter((d) =>
    [
      "stocks",
      "tfsa",
      // buyer
      "homeEquity",
    ].includes(d.variable)
  );
  await saveChart(
    cumulativeGains,
    (data) =>
      plot({
        title: "Cumulative gains",
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
          ticks: [2000, 2004, 2009, 2014, 2019, 2024],
          tickFormat: (d) => d.toString(),
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
          barY(data, {
            x: "year",
            y: "amount",
            fill: "variable",
            fx: "category",
          }),
        ],
      }),
    "test/output/cumulative-gains.png",
    { style: "body { width: 700px; }" },
  );

  // Balance
  const balance = results.filter((d) =>
    [
      "balance",
    ].includes(d.variable)
  );
  await saveChart(
    balance,
    (data) =>
      plot({
        title: "Annual balance (gains - expenses)",
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
          ticks: [2000, 2004, 2009, 2014, 2019, 2024],
          tickFormat: (d) => d.toString(),
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
          barY(data, {
            x: "year",
            y: "amount",
            fill: "variable",
            fx: "category",
          }),
        ],
      }),
    "test/output/annual-balance.png",
    { style: "body { width: 700px; }" },
  );

  // Assets
  const assets = results.filter((d) =>
    [
      "assets",
    ].includes(d.variable)
  );
  await saveChart(
    assets,
    (data) =>
      plot({
        title: "Assets",
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
          ticks: [2000, 2004, 2009, 2014, 2019, 2024],
          tickFormat: (d) => d.toString(),
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
          barY(data, {
            x: "year",
            y: "amount",
            fill: "variable",
            fx: "category",
          }),
        ],
      }),
    "test/output/assets.png",
    { style: "body { width: 700px; }" },
  );

  // Difference in assets
  const assetsDifference = results.filter((d) =>
    [
      "difference",
    ].includes(d.variable)
  );
  await saveChart(
    assetsDifference,
    (data) =>
      plot({
        title: "Assets difference",
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
          ticks: [2000, 2004, 2009, 2014, 2019, 2024],
          tickFormat: (d) => d.toString(),
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
          barY(data, {
            x: "year",
            y: "amount",
            fill: "category",
            // fx: "category",
          }),
        ],
      }),
    "test/output/assets-difference.png",
    { style: "body { width: 700px; }" },
  );

  //Just for now
  assertEquals(true, true);
});
