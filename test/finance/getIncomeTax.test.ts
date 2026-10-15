import { readFile } from "node:fs/promises";
import { test, expect } from "vite-plus/test";

import getIncomeTax from "../../src/finance/getIncomeTax.ts";

const PROVINCES: Parameters<typeof getIncomeTax>[1][] = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
];

const SOURCES = ["TurboTax"];

for (const province of PROVINCES) {
  for (const source of SOURCES) {
    test(`getIncomeTax - ${province} vs ${source} 2025`, async () => {
      const data: unknown = JSON.parse(
        await readFile(
          `./test/data/taxIncomeExternalSource/${source}/2025/${province}.json`,
          "utf8",
        ),
      );

      if (!Array.isArray(data)) throw new Error("Expected tax scenarios");
      const scenarios: unknown[] = data;
      for (const scenario of scenarios) {
        if (
          typeof scenario !== "object" ||
          scenario === null ||
          !("income" in scenario) ||
          typeof scenario.income !== "number" ||
          !("rrsp" in scenario) ||
          typeof scenario.rrsp !== "number" ||
          !("capitalGains" in scenario) ||
          typeof scenario.capitalGains !== "number" ||
          !("tax" in scenario) ||
          typeof scenario.tax !== "number"
        )
          throw new Error("Invalid tax scenario");
        const income = scenario.income;
        const expectedTotal = scenario.tax;

        const result = getIncomeTax(income, province, 2025, {
          rrsp: scenario.rrsp,
          capitalGains: scenario.capitalGains,
        });

        const diff = Math.abs(result.totalTaxAndPremiums - expectedTotal);
        const percentageDiff = (diff / (expectedTotal || 1)) * 100;

        // console.log(
        //   `${source} | ${province} Income: ${income} | RRSP: ${scenario.rrsp} | CapGains: ${scenario.capitalGains} | Expected (2025): ${expectedTotal} | Got (2025): ${
        //     Math.round(result.totalTaxAndPremiums)
        //   } | Diff: ${diff.toFixed(0)} (${percentageDiff.toFixed(2)}%)`,
        // );
        // console.log(result);
        expect(province === "Quebec" ? percentageDiff < 7 : percentageDiff < 0.5).toEqual(true);
      }
    });
  }
}

test("getIncomeTax does not share cached results between nearby incomes", () => {
  const lowerIncomeTax = getIncomeTax(100_001, "Ontario", 2025);
  const higherIncomeTax = getIncomeTax(100_004, "Ontario", 2025);

  expect(lowerIncomeTax.totalTaxAndPremiums).not.toEqual(higherIncomeTax.totalTaxAndPremiums);
  expect(getIncomeTax(100_001, "Ontario", 2025)).toEqual(lowerIncomeTax);
});
