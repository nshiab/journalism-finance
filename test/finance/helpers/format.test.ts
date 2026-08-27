import { assertEquals } from "jsr:@std/assert";
import {
  arraysToData,
  prettyDuration,
  round,
} from "../../../src/finance/helpers/format.ts";

Deno.test("round rounds to the requested decimal places", () => {
  assertEquals(round(123.456, { decimals: 2 }), 123.46);
  assertEquals(round(123.456), 123);
});

Deno.test("arraysToData converts columns to rows", () => {
  assertEquals(
    arraysToData({ timestamp: [1, 2], value: [10, 20] }),
    [
      { timestamp: 1, value: 10 },
      { timestamp: 2, value: 20 },
    ],
  );
});

Deno.test("prettyDuration formats a deterministic duration", () => {
  assertEquals(
    prettyDuration(0, {
      end: 3_723_004,
      prefix: "Elapsed: ",
      suffix: "!",
    }),
    "Elapsed: 1 h, 2 min, 3 sec, 4 ms!",
  );
});
