import { test, expect } from "vite-plus/test";

import { arraysToData, prettyDuration, round } from "../../../src/finance/helpers/format.ts";

test("round rounds to the requested decimal places", () => {
  expect(round(123.456, { decimals: 2 })).toEqual(123.46);
  expect(round(123.456)).toEqual(123);
});

test("arraysToData converts columns to rows", () => {
  expect(arraysToData({ timestamp: [1, 2], value: [10, 20] })).toEqual([
    { timestamp: 1, value: 10 },
    { timestamp: 2, value: 20 },
  ]);
});

test("prettyDuration formats a deterministic duration", () => {
  expect(
    prettyDuration(0, {
      end: 3_723_004,
      prefix: "Elapsed: ",
      suffix: "!",
    }),
  ).toEqual("Elapsed: 1 h, 2 min, 3 sec, 4 ms!");
});
