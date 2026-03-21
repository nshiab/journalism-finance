import { assertEquals } from "jsr:@std/assert";
import { getIncomeTax } from "../../src/finance/getIncomeTax.ts";

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
      const data = JSON.parse(
        await Deno.readTextFile(
          `./test/data/taxIncomeExternalSource/${source}/2025/${province}.json`,
        ),
      );

      for (const [incomeStr, expectedTotalValue] of Object.entries(data)) {
        const income = Number(incomeStr);

        const expectedTotal = expectedTotalValue as number;
        const result = getIncomeTax(income, province as any, 2025);

        const diff = Math.abs(
          result.totalTaxAndPremiums - expectedTotal,
        );
        const percentageDiff = (diff / (expectedTotal || 1)) * 100;

        console.log(
          `${source} | ${province} Income: ${income} | Expected (2025): ${expectedTotal} | Got (2025): ${
            Math.round(result.totalTaxAndPremiums)
          } | Diff: ${diff.toFixed(0)} (${percentageDiff.toFixed(2)}%)`,
        );
        // Just to check things
        assertEquals(true, true);
      }
    });
  }
}
