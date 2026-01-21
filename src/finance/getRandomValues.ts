import { randomNormal } from "d3-random";
import { round } from "@nshiab/journalism-format";

export default function getRandomValues(
  numberOfValues: number,
  avg: number,
  stdDev: number,
  options: { decimals?: number } = {},
): number[] {
  const random = randomNormal(avg, stdDev)();

  return typeof options.decimals === "number"
    ? Array.from(
      { length: numberOfValues },
      () => round(random, { decimals: options.decimals }),
    )
    : Array.from(
      { length: numberOfValues },
      () => random,
    );
}
