import { test, expect, assert } from "vite-plus/test";

import getRentVsBuyCholeskyMatrix from "../../../src/finance/helpers/rentVsBuy/getRentVsBuyCholeskyMatrix.ts";

test("getRentVsBuyCholeskyMatrix: should return an identity matrix when no data is provided", () => {
  const cholesky = getRentVsBuyCholeskyMatrix();
  expect(cholesky.length).toEqual(16);
  for (let i = 0; i < 16; i++) {
    expect(cholesky[i].length).toEqual(16);
    for (let j = 0; j < 16; j++) {
      if (i === j) {
        expect(cholesky[i][j]).toEqual(1);
      } else {
        expect(cholesky[i][j]).toEqual(0);
      }
    }
  }
});

test("getRentVsBuyCholeskyMatrix: should accept jitter option", () => {
  // We can't easily verify the internal effect without a non-positive-definite matrix,
  // but we can at least ensure it doesn't throw and returns a valid matrix.
  const cholesky = getRentVsBuyCholeskyMatrix(undefined, { jitter: 1e-9 });
  expect(cholesky.length).toEqual(16);
  // With identity matrix and jitter, diagonal elements will be sqrt(1 + jitter)
  assert(cholesky[0][0] > 1);
});
