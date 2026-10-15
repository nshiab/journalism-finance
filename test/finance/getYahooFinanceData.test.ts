import { test, expect } from "vite-plus/test";

import getYahooFinanceData from "../../src/finance/getYahooFinanceData.ts";

const originalFetch = globalThis.fetch;

function yahooResponse(timestamps: number[], values: Array<number | null>): Response {
  return Response.json({
    chart: {
      error: null,
      result: [
        {
          timestamp: timestamps,
          indicators: {
            adjclose: [{ adjclose: values }],
            quote: [{ close: values }],
          },
        },
      ],
    },
  });
}

test("getYahooFinanceData uses an inclusive end date and internal request headers", async () => {
  let requestedUrl: URL | undefined;
  let requestedHeaders: Headers | undefined;
  globalThis.fetch = (input, init) => {
    requestedUrl = new URL(input instanceof Request ? input.url : input);
    requestedHeaders = new Headers(init?.headers);
    return Promise.resolve(
      yahooResponse(
        [
          Date.parse("2025-03-13T13:30:00Z") / 1000,
          Date.parse("2025-03-14T13:30:00Z") / 1000,
          Date.parse("2025-03-15T13:30:00Z") / 1000,
        ],
        [100, 101, 102],
      ),
    );
  };

  try {
    const data = await getYahooFinanceData(
      "^GSPTSE",
      new Date("2025-03-13T00:00:00Z"),
      new Date("2025-03-14T00:00:00Z"),
      "adjclose",
      "1d",
    );

    expect(data).toEqual([
      { timestamp: Date.parse("2025-03-13T13:30:00Z"), value: 100 },
      { timestamp: Date.parse("2025-03-14T13:30:00Z"), value: 101 },
    ]);
    expect(requestedUrl?.searchParams.get("period2")).toEqual(
      String(Date.parse("2025-03-15T00:00:00Z") / 1000),
    );
    expect(requestedUrl?.searchParams.get("symbol")).toEqual("^GSPTSE");
    expect(requestedHeaders?.get("User-Agent") ?? "").toContain("Chrome");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getYahooFinanceData advances the end by the requested interval", async () => {
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
    expect(period2Values).toEqual([
      String(startSeconds + 86_400),
      String(startSeconds + 3_600),
      String(startSeconds + 60),
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getYahooFinanceData rejects invalid date ranges before fetching", async () => {
  await expect(() =>
    getYahooFinanceData("AAPL", new Date("2025-03-15"), new Date("2025-03-14"), "close", "1d"),
  ).rejects.toThrow(
    expect.objectContaining({
      name: RangeError.name,
      message: {
        asymmetricMatch: (value: unknown) =>
          typeof value === "string" &&
          value.includes("endDate must be equal to or later than startDate"),
      },
    }),
  );
});

test("getYahooFinanceData reports upstream failures without bypass advice", async () => {
  globalThis.fetch = () =>
    Promise.resolve(
      new Response("Too Many Requests", {
        status: 429,
        statusText: "Too Many Requests",
      }),
    );

  try {
    await expect(() =>
      getYahooFinanceData("AAPL", new Date("2025-03-13"), new Date("2025-03-14"), "close", "1d"),
    ).rejects.toThrow(
      expect.objectContaining({
        name: Error.name,
        message: {
          asymmetricMatch: (value: unknown) =>
            typeof value === "string" &&
            value.includes(
              "Yahoo may have changed, rate-limited, or disabled this undocumented endpoint",
            ),
        },
      }),
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.skipIf(process.env.CI === "true")(
  "getYahooFinanceData returns live Yahoo Finance data locally",
  async () => {
    const data = await getYahooFinanceData(
      "^GSPTSE",
      new Date("2025-03-13"),
      new Date("2025-03-14"),
      "adjclose",
      "1d",
    );

    expect(data.length > 0).toEqual(true);
    expect(data.every(({ value }) => Number.isFinite(value))).toEqual(true);
  },
);

test.each([
  { payload: null, message: "No Yahoo Finance data found." },
  { payload: { chart: { result: [] } }, message: "No Yahoo Finance data found." },
  {
    payload: { chart: { error: { description: "Symbol unavailable" } } },
    message: "Symbol unavailable",
  },
  { payload: { chart: { error: {} } }, message: "Yahoo Finance returned an unknown error." },
  {
    payload: { chart: { result: [{ timestamp: [1741870800], indicators: {} }] } },
    message: "close data is not available for AAPL.",
  },
  {
    payload: {
      chart: { result: [{ timestamp: ["1741870800"], indicators: { quote: [{ close: [100] }] } }] },
    },
    message: "Yahoo Finance returned an invalid timestamp.",
  },
])(
  "getYahooFinanceData handles malformed or unavailable data: $message",
  async ({ payload, message }) => {
    globalThis.fetch = () => Promise.resolve(Response.json(payload));
    try {
      await expect(
        getYahooFinanceData("AAPL", new Date("2025-03-13"), new Date("2025-03-14"), "close", "1d"),
      ).rejects.toThrow(message);
    } finally {
      globalThis.fetch = originalFetch;
    }
  },
);

test("getYahooFinanceData omits missing and nonnumeric observations", async () => {
  globalThis.fetch = () =>
    Promise.resolve(
      Response.json({
        chart: {
          result: [
            {
              timestamp: [1741824000, 1741827600, 1741831200],
              indicators: { quote: [{ close: [null, "100", 101] }] },
            },
          ],
        },
      }),
    );
  try {
    await expect(
      getYahooFinanceData("AAPL", new Date("2025-03-13"), new Date("2025-03-14"), "close", "1d"),
    ).resolves.toEqual([{ timestamp: 1741831200000, value: 101 }]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
