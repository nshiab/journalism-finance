import { assertEquals } from "jsr:@std/assert";
import simulateRentVsBuy from "../../src/finance/simulateRentVsBuy.ts";
import { saveChart } from "@nshiab/journalism-dataviz";
import { barY, dot, line, plot } from "@observablehq/plot";

Deno.test("should compute the total expenses and savings of a renter and buyer", async () => {
  const results = simulateRentVsBuy({
    numberOfYears: 25,
    annualMarketReturnRate: 0.06,
    renter: {
      startingMonthlyRent: 1500,
      annualRentIncrease: 0.04,
      securityDeposit: 1500,
      startingMonthlyInsurance: 75,
      annualInsuranceIncrease: 0.03,
    },
    buyer: {
      downPayment: 50_000,
      purchasePrice: 500_000,
      interestRate: 0.05,
      purchaseFixedFees: 25_000,
      startingAnnualMaintenanceCost: 2500,
      annualMaintenanceIncrease: 0.03,
      startingAnnualPropertyTax: 3500,
      annualPropertyTaxIncrease: 0.02,
      startingMonthlyCondoFees: 0,
      annualCondoFeeIncrease: 0.02,
      startingMonthlyInsurance: 250,
      annualInsuranceIncrease: 0.03,
      appreciationRate: 0.04,
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
        x: { ticks: [1, 5, 10, 15, 20, 25] },
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
        x: { ticks: [1, 5, 10, 15, 20, 25] },
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
          ticks: [1, 5, 10, 15, 20, 25],
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
          ticks: [1, 5, 10, 15, 20, 25],
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
      "savings",
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
        x: { ticks: [1, 5, 10, 15, 20, 25] },
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
        x: { ticks: [1, 5, 10, 15, 20, 25] },
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
        x: { ticks: [1, 5, 10, 15, 20, 25] },
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
        x: { ticks: [1, 5, 10, 15, 20, 25] },
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

  // Assets
  const netWorth = results.filter((d) =>
    [
      "netWorth",
    ].includes(d.variable)
  );
  await saveChart(
    netWorth,
    (data) =>
      plot({
        title: "Net Worth",
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
        x: { ticks: [1, 5, 10, 15, 20, 25] },
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
    "test/output/netWorth.png",
    { style: "body { width: 700px; }" },
  );

  //Just for now
  assertEquals(true, true);
});
