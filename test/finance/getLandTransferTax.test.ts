import { test, describe, expect } from "vite-plus/test";

import getLandTransferTax from "../../src/finance/getLandTransferTax.ts";

describe("Land Transfer Tax Calculator", () => {
  describe("Ontario Secondary Cities (Provincial Only)", () => {
    test("Calculates standard tax correctly (Ottawa, $500k)", () => {
      // 55k * 0.005 + 195k * 0.010 + 150k * 0.015 + 100k * 0.020 = 6475
      expect(getLandTransferTax("Ottawa", 500000, 2026)).toEqual(6475);
    });

    test("Applies FTHB rebate correctly (max $4,000 rebate)", () => {
      // 6475 - 4000 = 2475
      expect(getLandTransferTax("Ottawa", 500000, 2026, true)).toEqual(2475);
    });

    test("Caps FTHB rebate at total tax if tax < $4,000", () => {
      // Tax on $250,000 = 55k * 0.005 + 195k * 0.010 = 2225
      // 2225 - 2225 (capped rebate) = 0
      expect(getLandTransferTax("Hamilton", 250000, 2026, true)).toEqual(0);
    });
  });

  describe("Toronto (Dual Provincial & Municipal Tax)", () => {
    test("Calculates combined standard tax ($500k)", () => {
      // Provincial = 6475
      // Municipal  = 6475
      expect(getLandTransferTax("Toronto", 500000, 2026)).toEqual(12950);
    });

    test("Applies dual FTHB rebates ($4,000 Prov + $4,475 Muni)", () => {
      // Provincial FTHB = 6475 - 4000 = 2475
      // Municipal FTHB  = 6475 - 4475 = 2000
      // Total = 4475
      expect(getLandTransferTax("Toronto", 500000, 2026, true)).toEqual(4475);
    });
  });

  describe("British Columbia (Vancouver / Victoria)", () => {
    test("Calculates standard tax ($500k)", () => {
      // 200k * 0.01 + 300k * 0.02 = 8000
      expect(getLandTransferTax("Vancouver", 500000, 2026)).toEqual(8000);
    });

    test("Applies FTHB rebate (<= $835k)", () => {
      // Tax on $800k = 200k * 0.01 + 600k * 0.02 = 14000
      // Rebate = 8000
      // 14000 - 8000 = 6000
      expect(getLandTransferTax("Vancouver", 800000, 2026, true)).toEqual(6000);
      // Tax on $835k = 200k * 0.01 + 635k * 0.02 = 14700
      // Rebate = 8000
      // 14700 - 8000 = 6700
      expect(getLandTransferTax("Victoria", 835000, 2026, true)).toEqual(6700);
    });

    test("Calculates partial FTHB phase-out ($850k)", () => {
      // Standard tax on $850k = 200k * 0.01 + 650k * 0.02 = 15000
      // Phase-out exemption = 8000 * ((860k - 850k) / 25000) = 8000 * (10/25) = 3200
      // 15000 - 3200 = 11800
      expect(getLandTransferTax("Vancouver", 850000, 2026, true)).toEqual(11800);
    });

    test("Applies Luxury Surtax (> $3M)", () => {
      // Base tax on $3.5M = (200k*0.01) + (1.8M*0.02) + (1.5M*0.03) = 83000
      // Surtax = 500k * 0.02 = 10000
      // Total = 93000
      expect(getLandTransferTax("Vancouver", 3500000, 2026)).toEqual(93000);
    });
  });

  describe("Quebec (Montreal / Quebec City)", () => {
    test("Calculates standard tax (Montreal, $500k)", () => {
      // 62.9k * 0.005 + 252.1k * 0.010 + 185k * 0.015 = 5610.50
      expect(getLandTransferTax("Montreal", 500000, 2026)).toEqual(5610.5);
    });

    test("Calculates standard tax (Quebec City, $500k)", () => {
      // Same brackets as Montreal up to $500k
      expect(getLandTransferTax("Quebec", 500000, 2026)).toEqual(5610.5);
    });

    test("Ignores FTHB boolean (not a point-of-sale deduction)", () => {
      const taxMontreal = getLandTransferTax("Montreal", 500000, 2026);
      expect(getLandTransferTax("Montreal", 500000, 2026, true)).toEqual(taxMontreal);

      const taxQuebec = getLandTransferTax("Quebec", 500000, 2026);
      expect(getLandTransferTax("Quebec", 500000, 2026, true)).toEqual(taxQuebec);
    });

    test("Calculates higher bracket divergence ($1M)", () => {
      // Montreal: 62.9k*0.005 + 252.1k*0.01 + 237.3k*0.015 + 447.7k*0.02 = 15349
      expect(getLandTransferTax("Montreal", 1000000, 2026)).toEqual(15349);

      // Quebec City: 62.9k*0.005 + 252.1k*0.01 + 185k*0.015 + 250k*0.025 + 250k*0.03 = 19360.5
      expect(getLandTransferTax("Quebec", 1000000, 2026)).toEqual(19360.5);
    });
  });

  describe("Manitoba (Winnipeg)", () => {
    test("Calculates marginal brackets correctly", () => {
      // 30k*0 + 60k*0.005 + 60k*0.01 + 50k*0.015 + 50k*0.02 = 2650
      expect(getLandTransferTax("Winnipeg", 250000, 2026)).toEqual(2650);
    });

    test("Ignores FTHB boolean", () => {
      expect(getLandTransferTax("Winnipeg", 250000, 2026, true)).toEqual(2650);
    });
  });

  describe("Alberta (Calgary / Edmonton)", () => {
    test("Calculates administrative levy correctly", () => {
      // 50 + (400k / 5000) * 5 = 450
      expect(getLandTransferTax("Calgary", 400000, 2026)).toEqual(450);
      expect(getLandTransferTax("Edmonton", 400000, 2026)).toEqual(450);
    });

    test("Handles 'portion thereof' rounding (above $5k boundary)", () => {
      // 50 + ceil(400001 / 5000) * 5 = 50 + 81 * 5 = 455
      expect(getLandTransferTax("Calgary", 400001, 2026)).toEqual(455);
    });
  });

  describe("Saskatchewan (Saskatoon / Regina)", () => {
    test("Returns 0 for value <= 500", () => {
      expect(getLandTransferTax("Regina", 400, 2026)).toEqual(0);
    });

    test("Returns flat fee of 25 for value <= 6300", () => {
      expect(getLandTransferTax("Saskatoon", 6000, 2026)).toEqual(25);
    });

    test("Calculates ad valorem for > 6300", () => {
      // 400k * 0.004 = 1600
      expect(getLandTransferTax("Saskatoon", 400000, 2026)).toEqual(1600);
    });
  });

  describe("Flat Rate Regions", () => {
    test("Nova Scotia (Halifax) - 1.5%", () => {
      expect(getLandTransferTax("Halifax", 400000, 2026)).toEqual(6000);
      expect(getLandTransferTax("Halifax", 400000, 2026, true)).toEqual(6000);
    });

    test("New Brunswick - 1.0%", () => {
      expect(getLandTransferTax("Fredericton", 400000, 2026)).toEqual(4000);
      expect(getLandTransferTax("Moncton", 400000, 2026)).toEqual(4000);
      expect(getLandTransferTax("Saint John (NB)", 400000, 2026)).toEqual(4000);
    });
  });

  describe("Newfoundland and Labrador (Saint John's (NL))", () => {
    test("Calculates base fee correctly", () => {
      // 100 (first 500) + 399,500 * 0.004 = 1698
      expect(getLandTransferTax("Saint John's (NL)", 400000, 2026)).toEqual(1698);
    });

    test("Applies 50% FTHB discount", () => {
      // 1698 * 0.5 = 849
      expect(getLandTransferTax("Saint John's (NL)", 400000, 2026, true)).toEqual(849);
    });
  });

  describe("Error Handling", () => {
    test("Throws an error for unimplemented or invalid cities", () => {
      expect(() => {
        Reflect.apply(getLandTransferTax, undefined, ["Charlottetown", 500000, 2026]);
      }).toThrow(
        expect.objectContaining({
          name: Error.name,
          message: {
            asymmetricMatch: (value: unknown) =>
              typeof value === "string" &&
              value.includes("Tax calculation logic not implemented for city: Charlottetown"),
          },
        }),
      );
    });

    test("Throws an error for unsupported years", () => {
      expect(() => {
        Reflect.apply(getLandTransferTax, undefined, ["Toronto", 500000, 2025]);
      }).toThrow(
        expect.objectContaining({
          name: Error.name,
          message: {
            asymmetricMatch: (value: unknown) =>
              typeof value === "string" &&
              value.includes("Land transfer tax rates not found for year 2025"),
          },
        }),
      );
    });
  });
});
