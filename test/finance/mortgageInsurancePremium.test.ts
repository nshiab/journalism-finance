import { test, expect } from "vite-plus/test";

import mortgageInsurancePremium from "../../src/finance/mortgageInsurancePremium.ts";

// Tested against https://itools-ioutils.fcac-acfc.gc.ca/MQ-HQ/MQCalc-EAPHCalc-eng.aspx

test("should throw an error if the down payment is less than 5% of the purchase price", () => {
  expect(() => mortgageInsurancePremium(500_000, 10_000)).toThrow();
});
test("should return $19,000 with a purchase price of $500k and down payment of $25k", () => {
  const premium = mortgageInsurancePremium(500_000, 25_000);
  expect(premium).toEqual(19_000);
});
test("should return $18,040 with a purchase price of $500k and down payment of $49k", () => {
  const premium = mortgageInsurancePremium(500_000, 49_000);
  expect(premium).toEqual(18_040);
});
test("should return $13,950 with a purchase price of $500k and down payment of $50k", () => {
  const premium = mortgageInsurancePremium(500_000, 50_000);
  expect(premium).toEqual(13_950);
});
test("should return $11,900 with a purchase price of $500k and down payment of $75k", () => {
  const premium = mortgageInsurancePremium(500_000, 75_000);
  expect(premium).toEqual(11_900);
});
test("should return $11,228 with a purchase price of $500k and down payment of $99k", () => {
  const premium = mortgageInsurancePremium(500_000, 99_000);
  expect(premium).toEqual(11_228);
});
test("should return $0 with a purchase price of $500k and down payment of $100k", () => {
  const premium = mortgageInsurancePremium(500_000, 100_000);
  expect(premium).toEqual(0);
});
