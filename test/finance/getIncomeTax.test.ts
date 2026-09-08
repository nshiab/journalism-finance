import { assertEquals, assertNotEquals } from "jsr:@std/assert";
import getIncomeTax from "../../src/finance/getIncomeTax.ts";

const PROVINCES = [
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
    Deno.test(`getIncomeTax - ${province} vs ${source} 2025`, async () => {
      const data: {
        income: number;
        rrsp: number;
        capitalGains: number;
        tax: number;
      }[] = JSON.parse(
        await Deno.readTextFile(
          `./test/data/taxIncomeExternalSource/${source}/2025/${province}.json`,
        ),
      );

      for (const scenario of data) {
        const income = scenario.income;
        const expectedTotal = scenario.tax;

        const result = getIncomeTax(income, province as any, 2025, {
          rrsp: scenario.rrsp,
          capitalGains: scenario.capitalGains,
        });

        const diff = Math.abs(
          result.totalTaxAndPremiums - expectedTotal,
        );
        const percentageDiff = (diff / (expectedTotal || 1)) * 100;

        // console.log(
        //   `${source} | ${province} Income: ${income} | RRSP: ${scenario.rrsp} | CapGains: ${scenario.capitalGains} | Expected (2025): ${expectedTotal} | Got (2025): ${
        //     Math.round(result.totalTaxAndPremiums)
        //   } | Diff: ${diff.toFixed(0)} (${percentageDiff.toFixed(2)}%)`,
        // );
        // console.log(result);
        assertEquals(
          province === "Quebec" ? percentageDiff < 7 : percentageDiff < 0.5,
          true,
        );
      }
    });
  }
}

Deno.test("getIncomeTax does not share cached results between nearby incomes", () => {
  const lowerIncomeTax = getIncomeTax(100_001, "Ontario", 2025);
  const higherIncomeTax = getIncomeTax(100_004, "Ontario", 2025);

  assertNotEquals(
    lowerIncomeTax.totalTaxAndPremiums,
    higherIncomeTax.totalTaxAndPremiums,
  );
  assertEquals(
    getIncomeTax(100_001, "Ontario", 2025),
    lowerIncomeTax,
  );
});
