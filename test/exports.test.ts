import { assert, assertEquals } from "jsr:@std/assert";
import * as finance from "../src/index.ts";
import * as web from "../src/web.ts";

Deno.test("main and web entry points expose the intended functions", () => {
  assert("getYahooFinanceData" in finance);
  assertEquals("getYahooFinanceData" in web, false);

  for (
    const name of [
      "getMinimumDownPayment",
      "getMortgageInsuranceTax",
      "WINNER_CATEGORIES",
    ]
  ) {
    assert(name in finance);
    assert(name in web);
  }
});
