import { test, expect } from "vite-plus/test";

import getMortgageInsuranceTax from "../../src/finance/getMortgageInsuranceTax.ts";

test("getMortgageInsuranceTax applies provincial premium taxes", () => {
  expect(getMortgageInsuranceTax(19_000, "Ontario")).toEqual(1_520);
  expect(getMortgageInsuranceTax(19_000, "Quebec")).toEqual(1_710);
  expect(getMortgageInsuranceTax(19_000, "Saskatchewan")).toEqual(1_140);
  expect(getMortgageInsuranceTax(19_000, "Alberta")).toEqual(0);
});
