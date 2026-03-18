import { assertLess } from "jsr:@std/assert";
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

for (const province of PROVINCES) {
  Deno.test(`getIncomeTax - ${province} vs WealthSimple 2025`, async () => {
    const data = JSON.parse(
      await Deno.readTextFile(
        `./test/data/taxIncomeExternalSource/WealthSimple/2025/${province}.json`,
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
        `${province.padEnd(25)} Income: ${
          income.toString().padStart(7)
        } | Expected (2025): ${
          expectedTotal.toString().padStart(6)
        } | Got (2025): ${
          Math.round(result.totalTaxAndPremiums).toString().padStart(6)
        } | Diff: ${diff.toFixed(0).padStart(5)} (${
          percentageDiff.toFixed(2)
        }%)`,
      );
      // console.log(result);

      // Comparing against WealthSimple 2025 data with 2025 logic.
      // We expect high accuracy, but some differences exist (e.g., Alberta credits, rounded brackets).
      if (income === 0) {
        assertLess(diff, 1, `Income 0 for ${province} should have 0 tax`);
      } else if (income < 30000) {
        assertLess(
          diff,
          300,
          `Income ${income} for ${province} diff ${diff} is too high`,
        );
      } else {
        assertLess(
          percentageDiff,
          7,
          `Income ${income} for ${province} diff ${
            percentageDiff.toFixed(2)
          }% is too high (Expected ${expectedTotal}, Got ${result.totalTaxAndPremiums})`,
        );
      }
    }
  });
}
