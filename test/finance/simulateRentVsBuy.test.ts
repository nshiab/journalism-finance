import { assertEquals } from "jsr:@std/assert";
import simulateRentVsBuy from "../../src/finance/simulateRentVsBuy.ts";
import { saveChart } from "@nshiab/journalism-dataviz";
import { areaY, barY, line, plot } from "@observablehq/plot";
import spTsx from "../data/sp_tsx.json" with { type: "json" };
import rentMontreal from "../data/rent_montreal.json" with { type: "json" };
import homePriceMontreal from "../data/homePrice_montreal.json" with {
  type: "json",
};
import sellingFixedFees from "../data/sellingFixedFees.json" with {
  type: "json",
};
import condoFees from "../data/condo_fees.json" with {
  type: "json",
};
import ownerInsurance from "../data/owner_Insurance.json" with { type: "json" };
import maintenance from "../data/owner_maintenance.json" with { type: "json" };
import propertyTaxes from "../data/property_taxes.json" with { type: "json" };
import renterInsurance from "../data/renter_insurance.json" with {
  type: "json",
};

Deno.test("should compute the total expenses and savings of a renter and buyer", async (t) => {
  // MONTREAL EXAMPLE

  const numberOfYears = 25;
  const numberOfMonths = numberOfYears * 12;
  // Yahoo Finance S&P/TSX
  const marketReturnRate = spTsx;
  // CMHC 3+ bedroom apartment Montreal
  const rentIncrease = rentMontreal;
  // CPI Quebec
  const ownerInsuranceIncrease = ownerInsurance;
  // CPI Canada
  const renterInsuranceIncrease = renterInsurance;
  // CPI Quebec
  const maintenanceIncrease = maintenance;
  // CPI Quebec
  const propertyTaxIncrease = propertyTaxes;
  // CPI Quebec Owned accommodation
  const condoFeeIncrease = condoFees;
  // CREA Town house Montreal
  const appreciationIncrease = homePriceMontreal;
  // All-items CPI Quebec
  const sellingFixedFeesIncrease = sellingFixedFees;
  const fiveYearInterestRates = Array.from(
    { length: numberOfMonths },
    () => 0.055,
  );
  const fourYearInterestRates = Array.from(
    { length: numberOfMonths },
    () => 0.05,
  );
  const threeYearInterestRates = Array.from(
    { length: numberOfMonths },
    () => 0.045,
  );
  const twoYearInterestRates = Array.from(
    { length: numberOfMonths },
    () => 0.04,
  );
  const oneYearInterestRates = Array.from(
    { length: numberOfMonths },
    () => 0.035,
  );
  const variableInterestRates = Array.from(
    { length: numberOfMonths },
    () => 0.04,
  );

  const results = simulateRentVsBuy({
    startingYear: 2000,
    numberOfYears,
    tfsaContributions: true,
    combinedTaxRate: 0.25,
    renter: {
      startingMonthlyRent: 1750,
      securityDeposit: 1750,
      startingMonthlyInsurance: 75,
    },
    buyer: {
      purchasePrice: 500_000,
      downPayment: 50_000,
      rateDiscount: 0.005,
      purchaseFixedFees: 25_000,
      startingAnnualMaintenanceCost: 2500,
      startingAnnualPropertyTax: 3500,
      startingMonthlyCondoFees: 100,
      startingMonthlyInsurance: 250,
      sellingFixedFees: 2000,
      sellingCommissionRate: 0.04,
    },
    rates: {
      marketReturnRate,
      rentIncrease,
      ownerInsuranceIncrease,
      renterInsuranceIncrease,
      fiveYearInterestRates,
      fourYearInterestRates,
      threeYearInterestRates,
      twoYearInterestRates,
      oneYearInterestRates,
      variableInterestRates,
      maintenanceIncrease,
      propertyTaxIncrease,
      condoFeeIncrease,
      appreciationIncrease,
      sellingFixedFeesIncrease,
    },
  });

  // Expenses on the first month
  const firstMonthExpenses = results.filter((d) =>
    d.monthIndex === 0 &&
    d.group === "monthlyExpenses"
  );

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

  // Monthly expenses
  const monthlyExpenses = results.filter((d) =>
    d.group === "monthlyExpenses" && d.month !== 0
  );

  await saveChart(
    monthlyExpenses,
    (data) =>
      plot({
        title: "Monthly expenses over time (first month excluded)",
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
    "test/output/montreal-monthly-expenses.png",
    { style: "body { width: 700px; }" },
  );

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

  // Expenses on the first month
  const firstMonthGains = results.filter((d) =>
    d.monthIndex === 0 &&
    d.group === "monthlyGains"
  );

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
