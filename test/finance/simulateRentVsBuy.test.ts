import { assertEquals } from "jsr:@std/assert";
import simulateRentVsBuy from "../../src/finance/simulateRentVsBuy.ts";
import { saveChart } from "@nshiab/journalism-dataviz";
import { barY, dot, line, plot } from "@observablehq/plot";

Deno.test("should compute the total expenses and savings of a renter and buyer", async () => {
  const results = simulateRentVsBuy({
    numberOfYears: 25,
    annualMarketReturnRate: 0.007,
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

  // BUYER
  const buyerExpenses = results.filter((d) =>
    d.category === "buyer" &&
    [
      "mortgageCapital",
      "mortgageInterest",
      "maintenance",
      "propertyTax",
      "condoFees",
      "insurance",
      "downPayment",
      "purchaseFixedFees",
    ].includes(d.variable)
  );
  await saveChart(buyerExpenses, (data) =>
    plot({
      title: "Buyer - Annual expenses",
      y: {
        tickFormat: (d) => d < 1000 ? `$${d}` : `$${d / 1000}k`,
        nice: true,
      },
      color: {
        legend: true,
      },
      grid: true,
      marks: [
        barY(data, {
          x: "year",
          y: "amount",
          fill: "variable",
        }),
      ],
    }), "test/output/buyer-expenses.png");

  const buyerGains = results.filter((d) =>
    d.category === "buyer" &&
    ["savings", "marketGains", "homeEquityGains"].includes(d.variable)
  );
  await saveChart(buyerGains, (data) =>
    plot({
      title: "Buyer - Annual gains",
      y: {
        tickFormat: (d) => d < 1000 ? `$${d}` : `$${d / 1000}k`,
        nice: true,
      },
      color: {
        legend: true,
      },
      grid: true,
      marks: [
        barY(data, {
          x: "year",
          y: "amount",
          fill: "variable",
        }),
      ],
    }), "test/output/buyer-gains.png");

  const renterExpenses = results.filter((d) =>
    d.category === "renter" &&
    ["rent", "insurance", "securityDeposit"].includes(d.variable)
  );
  await saveChart(renterExpenses, (data) =>
    plot({
      title: "Renter - Annual expenses",
      y: {
        tickFormat: (d) => d < 1000 ? `$${d}` : `$${d / 1000}k`,
        nice: true,
      },
      color: {
        legend: true,
      },
      grid: true,
      marks: [
        barY(data, {
          x: "year",
          y: "amount",
          fill: "variable",
        }),
      ],
    }), "test/output/renter-expenses.png");

  const renterCumulativeExpenses = results.filter((d) =>
    d.category === "renter" &&
    ["cumulativeRent", "cumulativeInsurance", "cumulativeSecurityDeposit"]
      .includes(
        d.variable,
      )
  );
  await saveChart(renterCumulativeExpenses, (data) =>
    plot({
      title: "Renter - Cumulative expenses",
      y: {
        tickFormat: (d) =>
          d < 1000
            ? `$${d}`
            : d < 1_000_000
            ? `$${d / 1000}k`
            : `$${d / 1_000_000}M`,
        nice: true,
      },
      color: {
        legend: true,
      },
      grid: true,
      marks: [
        barY(data, {
          x: "year",
          y: "amount",
          fill: "variable",
        }),
      ],
    }), "test/output/renter-cumulative-expenses.png");

  const buyerCumulativeExpenses = results.filter((d) =>
    d.category === "buyer" &&
    [
      "cumulativeMortgageCapital",
      "cumulativeMortgageInterest",
      "cumulativeMaintenance",
      "cumulativePropertyTax",
      "cumulativeCondoFees",
      "cumulativeInsurance",
      "cumulativeDownPayment",
      "cumulativePurchaseFixedFees",
    ].includes(
      d.variable,
    )
  );
  await saveChart(
    buyerCumulativeExpenses,
    (data) =>
      plot({
        title: "Buyer - Cumulative expenses",
        y: {
          tickFormat: (d) =>
            d < 1000
              ? `$${d}`
              : d < 1_000_000
              ? `$${d / 1000}k`
              : `$${d / 1_000_000}M`,
          nice: true,
        },
        color: {
          legend: true,
        },
        grid: true,
        marks: [
          barY(data, {
            x: "year",
            y: "amount",
            fill: "variable",
          }),
        ],
      }),
    "test/output/buyer-cumulative-expenses.png",
    {
      style: "body {width: 800px;}",
    },
  );

  const renterCumulativeGains = results.filter((d) =>
    d.category === "renter" &&
    ["cumulativeSavings", "cumulativeMarketGains"]
      .includes(
        d.variable,
      )
  );
  await saveChart(renterCumulativeGains, (data) =>
    plot({
      title: "Renter - Cumulative gains",
      y: {
        tickFormat: (d) =>
          d < 1000
            ? `$${d}`
            : d < 1_000_000
            ? `$${d / 1000}k`
            : `$${d / 1_000_000}M`,
        nice: true,
      },
      color: {
        legend: true,
      },
      grid: true,
      marks: [
        barY(data, {
          x: "year",
          y: "amount",
          fill: "variable",
        }),
      ],
    }), "test/output/renter-cumulative-gains.png");
  const buyerCumulativeGains = results.filter((d) =>
    d.category === "buyer" &&
    ["cumulativeSavings", "cumulativeMarketGains", "homeEquity"]
      .includes(
        d.variable,
      )
  );
  await saveChart(buyerCumulativeGains, (data) =>
    plot({
      title: "Buyer - Cumulative gains",
      y: {
        tickFormat: (d) =>
          d < 1000
            ? `$${d}`
            : d < 1_000_000
            ? `$${d / 1000}k`
            : `$${d / 1_000_000}M`,
      },
      color: {
        legend: true,
      },
      grid: true,
      marks: [
        barY(data, {
          x: "year",
          y: "amount",
          fill: "variable",
        }),
      ],
    }), "test/output/buyer-cumulative-gains.png");

  const renterGains = results.filter((d) =>
    d.category === "renter" && ["savings", "marketGains"].includes(d.variable)
  );
  await saveChart(renterGains, (data) =>
    plot({
      title: "Renter - Annual gains",
      y: {
        tickFormat: (d) => d < 1000 ? `$${d}` : `$${d / 1000}k`,
        nice: true,
      },
      color: {
        legend: true,
      },
      grid: true,
      marks: [
        barY(data, {
          x: "year",
          y: "amount",
          fill: "variable",
        }),
      ],
    }), "test/output/renter-gains.png");

  const renterBalance = results.filter((d) =>
    d.category === "renter" && d.variable === "balance"
  );
  await saveChart(renterBalance, (data) =>
    plot({
      title: "Renter - Annual balance",
      y: {
        tickFormat: (d) =>
          Math.abs(d) < 1000
            ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
            : d < 0
            ? `-$${Math.abs(d) / 1000}k`
            : `$${d / 1000}k`,
        nice: true,
      },
      color: {
        legend: true,
      },
      grid: true,
      marks: [
        barY(data, {
          x: "year",
          y: "amount",
          fill: "variable",
        }),
      ],
    }), "test/output/renter-balance.png");

  const buyerBalance = results.filter((d) =>
    d.category === "buyer" && d.variable === "balance"
  );
  await saveChart(buyerBalance, (data) =>
    plot({
      title: "Buyer - Annual balance (home equity included)",
      y: {
        nice: true,
        tickFormat: (d) =>
          Math.abs(d) < 1000
            ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
            : d < 0
            ? `-$${Math.abs(d) / 1000}k`
            : `$${d / 1000}k`,
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
        }),
      ],
    }), "test/output/buyer-balance.png");

  const totalSavings = results.filter((d) => d.variable === "totalSavings");
  await saveChart(totalSavings, (data) =>
    plot({
      title: "Total savings (including home equity for buyer)",
      y: {
        tickFormat: (d) =>
          d < 1000
            ? `$${d}`
            : d < 1_000_000
            ? `$${d / 1000}k`
            : `$${d / 1_000_000}M`,
        nice: true,
      },
      color: {
        legend: true,
      },
      grid: true,
      marks: [
        line(data, {
          x: "year",
          y: "amount",
          stroke: "category",
        }),
        dot(data, {
          x: "year",
          y: "amount",
          fill: "category",
        }),
      ],
    }), "test/output/total-savings.png");

  const cumulativeExpenses = results.filter((d) =>
    d.variable === "cumulativeExpenses"
  );
  await saveChart(cumulativeExpenses, (data) =>
    plot({
      title: "Cumulative expenses",
      y: {
        tickFormat: (d) =>
          d < 1000
            ? `$${d}`
            : d < 1_000_000
            ? `$${d / 1000}k`
            : `$${d / 1_000_000}M`,
        nice: true,
      },
      color: {
        legend: true,
      },
      grid: true,
      marks: [
        line(data, {
          x: "year",
          y: "amount",
          stroke: "category",
        }),
        dot(data, {
          x: "year",
          y: "amount",
          fill: "category",
        }),
      ],
    }), "test/output/cumulative-expenses.png");

  const totalBalances = results.filter((d) => d.variable === "totalBalance");
  await saveChart(totalBalances, (data) =>
    plot({
      title: "Total balance (including home equity for buyer)",
      y: {
        tickFormat: (d) =>
          Math.abs(d) < 1000
            ? d < 0 ? `-$${Math.abs(d)}` : `$${d}`
            : Math.abs(d) < 1_000_000
            ? d < 0 ? `-$${Math.abs(d) / 1000}k` : `$${d / 1000}k`
            : d < 0
            ? `-$${Math.abs(d) / 1_000_000}M`
            : `$${d / 1_000_000}M`,
        nice: true,
      },
      marginLeft: 55,
      color: {
        legend: true,
      },
      grid: true,
      marks: [
        line(data, {
          x: "year",
          y: "amount",
          stroke: "category",
        }),
        dot(data, {
          x: "year",
          y: "amount",
          fill: "category",
        }),
      ],
    }), "test/output/total-balances.png");

  //Just for now
  assertEquals(true, true);
});
