import { assertEquals } from "jsr:@std/assert";
import getMortgageInsuranceTax from "../../src/finance/getMortgageInsuranceTax.ts";

Deno.test("getMortgageInsuranceTax applies provincial premium taxes", () => {
  assertEquals(getMortgageInsuranceTax(19_000, "Ontario"), 1_520);
  assertEquals(getMortgageInsuranceTax(19_000, "Quebec"), 1_710);
  assertEquals(getMortgageInsuranceTax(19_000, "Saskatchewan"), 1_140);
  assertEquals(getMortgageInsuranceTax(19_000, "Alberta"), 0);
});
