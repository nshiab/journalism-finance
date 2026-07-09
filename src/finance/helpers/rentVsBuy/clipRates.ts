/**
 * Clips the win rate fractions to a minimum of 0.01 and redistributes any deficit.
 * This reflects unmodeled tail risks and prevents deterministic misinterpretation of statistical estimates.
 */
export default function clipRates(
  r0: number,
  r1: number,
  r2: number,
): [number, number, number] {
  const MIN = 0.01;
  const rates = [r0, r1, r2];
  let deficit = 0;

  // 1. Enforce minimums and calculate how much probability we artificially added
  for (let i = 0; i < 3; i++) {
    if (rates[i] < MIN) {
      deficit += MIN - rates[i];
      rates[i] = MIN;
    }
  }

  // 2. If we bumped a number up, borrow that amount proportionally from the others
  if (deficit > 0) {
    let surplusSum = 0;
    for (let i = 0; i < 3; i++) {
      if (rates[i] > MIN) surplusSum += rates[i];
    }

    for (let i = 0; i < 3; i++) {
      if (rates[i] > MIN) {
        rates[i] -= deficit * (rates[i] / surplusSum);
      }
    }
  }

  // 3. Strict floating-point correction (only for microscopic 1e-16 errors)
  const diff = 1.0 - (rates[0] + rates[1] + rates[2]);
  if (Math.abs(diff) > 0) {
    const maxIdx = rates[0] >= rates[1]
      ? (rates[0] >= rates[2] ? 0 : 2)
      : (rates[1] >= rates[2] ? 1 : 2);
    rates[maxIdx] += diff;
  }

  return rates as [number, number, number];
}
