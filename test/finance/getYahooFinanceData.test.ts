import {
  assertEquals,
  assertRejects,
  assertStringIncludes,
} from "jsr:@std/assert";
import getYahooFinanceData from "../../src/finance/getYahooFinanceData.ts";

const originalFetch = globalThis.fetch;

function yahooResponse(
  timestamps: number[],
  values: Array<number | null>,
): Response {
  return Response.json({
    chart: {
      error: null,
      result: [{
        timestamp: timestamps,
        indicators: {
          adjclose: [{ adjclose: values }],
          quote: [{ close: values }],
        },
      }],
    },
  });
}

Deno.test("getYahooFinanceData uses an inclusive end date and internal request headers", async () => {
  let requestedUrl: URL | undefined;
  let requestedHeaders: Headers | undefined;
  globalThis.fetch = (input, init) => {
    requestedUrl = new URL(input instanceof Request ? input.url : input);
    requestedHeaders = new Headers(init?.headers);
    return Promise.resolve(yahooResponse(
      [
        Date.parse("2025-03-13T13:30:00Z") / 1000,
        Date.parse("2025-03-14T13:30:00Z") / 1000,
        Date.parse("2025-03-15T13:30:00Z") / 1000,
      ],
      [100, 101, 102],
    ));
  };

  try {
    const data = await getYahooFinanceData(
      "^GSPTSE",
      new Date("2025-03-13T00:00:00Z"),
      new Date("2025-03-14T00:00:00Z"),
      "adjclose",
      "1d",
    );

    assertEquals(data, [
      { timestamp: Date.parse("2025-03-13T13:30:00Z"), value: 100 },
      { timestamp: Date.parse("2025-03-14T13:30:00Z"), value: 101 },
    ]);
    assertEquals(
      requestedUrl?.searchParams.get("period2"),
      String(Date.parse("2025-03-15T00:00:00Z") / 1000),
    );
    assertEquals(requestedUrl?.searchParams.get("symbol"), "^GSPTSE");
    assertStringIncludes(requestedHeaders?.get("User-Agent") ?? "", "Chrome");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("getYahooFinanceData advances the end by the requested interval", async () => {
  const period2Values: string[] = [];
  globalThis.fetch = (input) => {
    const url = new URL(input instanceof Request ? input.url : input);
    period2Values.push(url.searchParams.get("period2") ?? "");
    const period1 = Number(url.searchParams.get("period1"));
    return Promise.resolve(yahooResponse([period1], [100]));
  };

  try {
    const start = new Date("2025-03-14T12:00:00Z");
    await getYahooFinanceData("AAPL", start, start, "close", "1d");
    await getYahooFinanceData("AAPL", start, start, "close", "1h");
    await getYahooFinanceData("AAPL", start, start, "close", "1m");

    const startSeconds = start.getTime() / 1000;
    assertEquals(period2Values, [
      String(startSeconds + 86_400),
      String(startSeconds + 3_600),
      String(startSeconds + 60),
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("getYahooFinanceData rejects invalid date ranges before fetching", async () => {
  await assertRejects(
    () =>
      getYahooFinanceData(
        "AAPL",
        new Date("2025-03-15"),
        new Date("2025-03-14"),
        "close",
        "1d",
      ),
    RangeError,
    "endDate must be equal to or later than startDate",
  );
});

Deno.test("getYahooFinanceData reports upstream failures without bypass advice", async () => {
  globalThis.fetch = () =>
    Promise.resolve(
      new Response("Too Many Requests", {
        status: 429,
        statusText: "Too Many Requests",
      }),
    );

  try {
    await assertRejects(
      () =>
        getYahooFinanceData(
          "AAPL",
          new Date("2025-03-13"),
          new Date("2025-03-14"),
          "close",
          "1d",
        ),
      Error,
      "Yahoo may have changed, rate-limited, or disabled this undocumented endpoint",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test({
  name: "getYahooFinanceData returns live Yahoo Finance data locally",
  ignore: Deno.env.get("CI") === "true",
  async fn() {
    const data = await getYahooFinanceData(
      "^GSPTSE",
      new Date("2025-03-13"),
      new Date("2025-03-14"),
      "adjclose",
      "1d",
    );

    assertEquals(data.length > 0, true);
    assertEquals(data.every(({ value }) => Number.isFinite(value)), true);
  },
});
