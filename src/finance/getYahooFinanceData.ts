const INTERVAL_SECONDS = {
  "1d": 24 * 60 * 60,
  "1h": 60 * 60,
  "1m": 60,
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function property(value: unknown, key: string): unknown {
  if (isRecord(value)) {
    return value[key];
  }
  return undefined;
}

function first(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : undefined;
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Fetches historical prices or trading volume for a symbol from Yahoo Finance.
 *
 * **Yahoo Finance notice:** This function uses an undocumented Yahoo Finance
 * endpoint and is not affiliated with or endorsed by Yahoo. It is provided for
 * educational, research, and journalistic purposes. Before using it, review
 * Yahoo's terms and any applicable data-provider restrictions.
 *
 * @example
 * ```ts
 * const prices = await getYahooFinanceData(
 *   "^GSPTSE",
 *   new Date("2025-03-01"),
 *   new Date("2025-03-15"),
 *   "adjclose",
 *   "1d",
 * );
 * console.log(prices);
 * ```
 *
 * @param symbol - The stock or index symbol, such as `"AAPL"` or `"^GSPTSE"`.
 * @param startDate - The inclusive start of the requested range.
 * @param endDate - The inclusive end of the requested range. The observation
 * beginning at this date or time is included when available.
 * @param variable - The financial variable to retrieve.
 * @param interval - The interval between observations: daily, hourly, or every
 * minute.
 * @returns The available observations, with Unix timestamps in milliseconds.
 * Missing values reported by Yahoo are omitted.
 * @throws {RangeError} If either date is invalid or `endDate` is before
 * `startDate`.
 * @throws {Error} If Yahoo rejects the request, returns no data, or provides invalid timestamps.
 * @see https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html
 * @see https://help.yahoo.com/kb/finance/SLN2310.html
 *
 * @category Finance
 */
export default async function getYahooFinanceData(
  symbol: string,
  startDate: Date,
  endDate: Date,
  variable: "open" | "high" | "low" | "close" | "adjclose" | "volume",
  interval: "1d" | "1h" | "1m",
): Promise<{ timestamp: number; value: number }[]> {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
    throw new RangeError("startDate and endDate must be valid dates.");
  }
  if (endTime < startTime) {
    throw new RangeError("endDate must be equal to or later than startDate.");
  }

  const period1 = Math.floor(startTime / 1000);
  // Yahoo treats period2 as exclusive. Advancing it by one interval keeps the
  // public range inclusive without exposing that upstream detail to callers.
  const period2 = Math.floor(endTime / 1000) + INTERVAL_SECONDS[interval];
  const url = new URL(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`,
  );
  url.search = new URLSearchParams({
    events: "capitalGain|div|split",
    formatted: "true",
    includeAdjustedClose: "true",
    interval,
    period1: String(period1),
    period2: String(period2),
    symbol,
    userYfid: "true",
    lang: "en-CA",
    region: "CA",
  }).toString();

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to fetch Yahoo Finance data: ${response.status} ${response.statusText}${
        text ? `. ${text}` : ""
      }. Yahoo may have changed, rate-limited, or disabled this undocumented endpoint.`,
    );
  }

  const data: unknown = await response.json();
  const chart = property(data, "chart");
  const error = property(chart, "error");
  if (error) {
    throw new Error(
      typeof property(error, "description") === "string"
        ? String(property(error, "description"))
        : "Yahoo Finance returned an unknown error.",
    );
  }

  const result = first(property(chart, "result"));
  const timestamps = property(result, "timestamp");
  if (!isArray(timestamps) || !timestamps.length) {
    throw new Error("No Yahoo Finance data found.");
  }

  const indicators = property(result, "indicators");
  const values = property(
    first(property(indicators, variable === "adjclose" ? "adjclose" : "quote")),
    variable,
  );

  if (!isArray(values)) {
    throw new Error(`${variable} data is not available for ${symbol}.`);
  }

  const exclusiveEndTime = period2 * 1000;
  const rows: { timestamp: number; value: number }[] = [];
  for (let index = 0; index < timestamps.length; index++) {
    const seconds = timestamps[index];
    if (typeof seconds !== "number" || !Number.isFinite(seconds)) {
      throw new Error("Yahoo Finance returned an invalid timestamp.");
    }
    const timestamp = seconds * 1000;
    const value = values[index];
    if (
      timestamp >= period1 * 1000 &&
      timestamp < exclusiveEndTime &&
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      rows.push({ timestamp, value });
    }
  }

  if (rows.length === 0) {
    throw new Error(`No ${variable} data found for ${symbol}.`);
  }

  return rows;
}
