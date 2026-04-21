import { assert, assertEquals } from "jsr:@std/assert";
import getRentVsBuyCholeskyMatrix from "../../../src/finance/helpers/rentVsBuy/getRentVsBuyCholeskyMatrix.ts";

Deno.test("getRentVsBuyCholeskyMatrix: should return an identity matrix when no data is provided", () => {
  const cholesky = getRentVsBuyCholeskyMatrix();
  assertEquals(cholesky.length, 16);
  for (let i = 0; i < 16; i++) {
    assertEquals(cholesky[i].length, 16);
    for (let j = 0; j < 16; j++) {
      if (i === j) {
        assertEquals(cholesky[i][j], 1);
      } else {
        assertEquals(cholesky[i][j], 0);
      }
    }
  }
});

Deno.test("getRentVsBuyCholeskyMatrix: should accept jitter option", () => {
  // We can't easily verify the internal effect without a non-positive-definite matrix,
  // but we can at least ensure it doesn't throw and returns a valid matrix.
  const cholesky = getRentVsBuyCholeskyMatrix(undefined, { jitter: 1e-9 });
  assertEquals(cholesky.length, 16);
  // With identity matrix and jitter, diagonal elements will be sqrt(1 + jitter)
  assert(cholesky[0][0] > 1);
});
