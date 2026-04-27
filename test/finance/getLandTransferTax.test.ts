import { assertEquals, assertThrows } from "jsr:@std/assert";
import getLandTransferTax from "../../src/finance/getLandTransferTax.ts";

Deno.test("Land Transfer Tax Calculator", async (t) => {
  await t.step("Ontario Secondary Cities (Provincial Only)", async (st) => {
    await st.step("Calculates standard tax correctly (Ottawa, $500k)", () => {
      // 55k * 0.005 + 195k * 0.010 + 150k * 0.015 + 100k * 0.020 = 6475
      assertEquals(getLandTransferTax("Ottawa", 500000, 2026), 6475);
    });

    await st.step("Applies FTHB rebate correctly (max $4,000 rebate)", () => {
      // 6475 - 4000 = 2475
      assertEquals(getLandTransferTax("Ottawa", 500000, 2026, true), 2475);
    });

    await st.step("Caps FTHB rebate at total tax if tax < $4,000", () => {
      // Tax on $250,000 = 55k * 0.005 + 195k * 0.010 = 2225
      // 2225 - 2225 (capped rebate) = 0
      assertEquals(getLandTransferTax("Hamilton", 250000, 2026, true), 0);
    });
  });

  await t.step("Toronto (Dual Provincial & Municipal Tax)", async (st) => {
    await st.step("Calculates combined standard tax ($500k)", () => {
      // Provincial = 6475
      // Municipal  = 6475
      assertEquals(getLandTransferTax("Toronto", 500000, 2026), 12950);
    });

    await st.step(
      "Applies dual FTHB rebates ($4,000 Prov + $4,475 Muni)",
      () => {
        // Provincial FTHB = 6475 - 4000 = 2475
        // Municipal FTHB  = 6475 - 4475 = 2000
        // Total = 4475
        assertEquals(getLandTransferTax("Toronto", 500000, 2026, true), 4475);
      },
    );
  });

  await t.step("British Columbia (Vancouver / Victoria)", async (st) => {
    await st.step("Calculates standard tax ($500k)", () => {
      // 200k * 0.01 + 300k * 0.02 = 8000
      assertEquals(getLandTransferTax("Vancouver", 500000, 2026), 8000);
    });

    await st.step("Applies FTHB rebate (<= $835k)", () => {
      // Tax on $800k = 200k * 0.01 + 600k * 0.02 = 14000
      // Rebate = 8000
      // 14000 - 8000 = 6000
      assertEquals(getLandTransferTax("Vancouver", 800000, 2026, true), 6000);
      // Tax on $835k = 200k * 0.01 + 635k * 0.02 = 14700
      // Rebate = 8000
      // 14700 - 8000 = 6700
      assertEquals(getLandTransferTax("Victoria", 835000, 2026, true), 6700);
    });

    await st.step("Calculates partial FTHB phase-out ($850k)", () => {
      // Standard tax on $850k = 200k * 0.01 + 650k * 0.02 = 15000
      // Phase-out exemption = 8000 * ((860k - 850k) / 25000) = 8000 * (10/25) = 3200
      // 15000 - 3200 = 11800
      assertEquals(getLandTransferTax("Vancouver", 850000, 2026, true), 11800);
    });

    await st.step("Applies Luxury Surtax (> $3M)", () => {
      // Base tax on $3.5M = (200k*0.01) + (1.8M*0.02) + (1.5M*0.03) = 83000
      // Surtax = 500k * 0.02 = 10000
      // Total = 93000
      assertEquals(getLandTransferTax("Vancouver", 3500000, 2026), 93000);
    });
  });

  await t.step("Quebec (Montreal / Quebec City)", async (st) => {
    await st.step("Calculates standard tax (Montreal, $500k)", () => {
      // 62.9k * 0.005 + 252.1k * 0.010 + 185k * 0.015 = 5610.50
      assertEquals(getLandTransferTax("Montreal", 500000, 2026), 5610.5);
    });

    await st.step("Calculates standard tax (Quebec City, $500k)", () => {
      // Same brackets as Montreal up to $500k
      assertEquals(getLandTransferTax("Quebec", 500000, 2026), 5610.5);
    });

    await st.step(
      "Ignores FTHB boolean (not a point-of-sale deduction)",
      () => {
        const taxMontreal = getLandTransferTax("Montreal", 500000, 2026);
        assertEquals(
          getLandTransferTax("Montreal", 500000, 2026, true),
          taxMontreal,
        );

        const taxQuebec = getLandTransferTax("Quebec", 500000, 2026);
        assertEquals(
          getLandTransferTax("Quebec", 500000, 2026, true),
          taxQuebec,
        );
      },
    );

    await st.step("Calculates higher bracket divergence ($1M)", () => {
      // Montreal: 62.9k*0.005 + 252.1k*0.01 + 237.3k*0.015 + 447.7k*0.02 = 15349
      assertEquals(getLandTransferTax("Montreal", 1000000, 2026), 15349);

      // Quebec City: 62.9k*0.005 + 252.1k*0.01 + 185k*0.015 + 250k*0.025 + 250k*0.03 = 19360.5
      assertEquals(getLandTransferTax("Quebec", 1000000, 2026), 19360.5);
    });
  });

  await t.step("Manitoba (Winnipeg)", async (st) => {
    await st.step("Calculates marginal brackets correctly", () => {
      // 30k*0 + 60k*0.005 + 60k*0.01 + 50k*0.015 + 50k*0.02 = 2650
      assertEquals(getLandTransferTax("Winnipeg", 250000, 2026), 2650);
    });

    await st.step("Ignores FTHB boolean", () => {
      assertEquals(getLandTransferTax("Winnipeg", 250000, 2026, true), 2650);
    });
  });

  await t.step("Alberta (Calgary / Edmonton)", async (st) => {
    await st.step("Calculates administrative levy correctly", () => {
      // 50 + (400k / 5000) * 5 = 450
      assertEquals(getLandTransferTax("Calgary", 400000, 2026), 450);
      assertEquals(getLandTransferTax("Edmonton", 400000, 2026), 450);
    });

    await st.step(
      "Handles 'portion thereof' rounding (above $5k boundary)",
      () => {
        // 50 + ceil(400001 / 5000) * 5 = 50 + 81 * 5 = 455
        assertEquals(getLandTransferTax("Calgary", 400001, 2026), 455);
      },
    );
  });

  await t.step("Saskatchewan (Saskatoon / Regina)", async (st) => {
    await st.step("Returns 0 for value <= 500", () => {
      assertEquals(getLandTransferTax("Regina", 400, 2026), 0);
    });

    await st.step("Returns flat fee of 25 for value <= 6300", () => {
      assertEquals(getLandTransferTax("Saskatoon", 6000, 2026), 25);
    });

    await st.step("Calculates ad valorem for > 6300", () => {
      // 400k * 0.004 = 1600
      assertEquals(getLandTransferTax("Saskatoon", 400000, 2026), 1600);
    });
  });

  await t.step("Flat Rate Regions", async (st) => {
    await st.step("Nova Scotia (Halifax) - 1.5%", () => {
      assertEquals(getLandTransferTax("Halifax", 400000, 2026), 6000);
      assertEquals(getLandTransferTax("Halifax", 400000, 2026, true), 6000);
    });

    await st.step("New Brunswick - 1.0%", () => {
      assertEquals(getLandTransferTax("Fredericton", 400000, 2026), 4000);
      assertEquals(getLandTransferTax("Moncton", 400000, 2026), 4000);
      assertEquals(getLandTransferTax("Saint John (NB)", 400000, 2026), 4000);
    });
  });

  await t.step("Newfoundland and Labrador (Saint John's (NL))", async (st) => {
    await st.step("Calculates base fee correctly", () => {
      // 100 (first 500) + 399,500 * 0.004 = 1698
      assertEquals(getLandTransferTax("Saint John's (NL)", 400000, 2026), 1698);
    });

    await st.step("Applies 50% FTHB discount", () => {
      // 1698 * 0.5 = 849
      assertEquals(
        getLandTransferTax("Saint John's (NL)", 400000, 2026, true),
        849,
      );
    });
  });

  await t.step("Error Handling", async (st) => {
    await st.step("Throws an error for unimplemented or invalid cities", () => {
      assertThrows(
        () => {
          // Type casting bypasses TS, testing runtime resilience
          getLandTransferTax("Charlottetown" as any, 500000, 2026);
        },
        Error,
        "Tax calculation logic not implemented for city: Charlottetown",
      );
    });

    await st.step("Throws an error for unsupported years", () => {
      assertThrows(
        () => {
          // @ts-ignore: testing runtime validation
          getLandTransferTax("Toronto", 500000, 2025);
        },
        Error,
        "Land transfer tax rates not found for year 2025",
      );
    });
  });
});
