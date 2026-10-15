# Yahoo Finance chart requests under Node

Research snapshot: 2026-10-14.

## Finding

A controlled A/B test through the actual helper found that the existing Chrome
122 User-Agent returned HTTP 429 under Node 24.21.0. Removing only that
header returned HTTP 200 and the two expected rows. The same original request
worked in Deno; the reason for that difference remains unknown. This establishes
the stale header as the trigger in the tested Node environment, not Yahoo's
internal filtering mechanism or excessive request volume.

The header removal passes the original reproduction, all 284 local tests
including the live test (`npm run all-tests`), and CI-mode testing with 283
passing and one expected live-network skip (`CI=true npm exec -- vp test`). The
focused live check is `npm exec -- vp test test/finance/getYahooFinanceData.test.ts`.
Keep this minimal fix and the runtime's default fetch behavior. There is no
demonstrated need for a library, crumb,
cookies, transport replacement, or retry machinery for this request.

## Maintained libraries

**yahoo-finance2 4.0.3**, released 2026-10-04, is MIT licensed and requires Node
`>=22`, compatible with this project's `>=24.21.0` requirement.
[Release](https://github.com/gadicc/yahoo-finance2/releases/tag/v4.0.3),
[Node requirement](https://github.com/gadicc/yahoo-finance2/releases/tag/v4.0.0),
[license](https://github.com/gadicc/yahoo-finance2/blob/v4.0.3/LICENSE).

Its chart module calls `/v8/finance/chart/{symbol}` without setting `needsCrumb`.
The fetch layer therefore does not acquire a crumb for chart requests. It uses
supplied fetch implementations or `globalThis.fetch`, manages a cookie jar, and
throws an HTTP error on unsuccessful responses. Defaults select query2 and the
honest identity `Mozilla/5.0 (compatible; yahoo-finance2/4.0.3)`, rather than a
Chrome version. Other modules can run its cookie/consent flow and call query1's
`/v1/test/getcrumb` endpoint.
[Chart](https://github.com/gadicc/yahoo-finance2/blob/v4.0.3/src/modules/chart.ts),
[fetch](https://github.com/gadicc/yahoo-finance2/blob/v4.0.3/src/lib/yahooFinanceFetch.ts),
[defaults](https://github.com/gadicc/yahoo-finance2/blob/v4.0.3/src/lib/options/defaults.ts),
[crumb flow](https://github.com/gadicc/yahoo-finance2/blob/v4.0.3/src/lib/getCrumb.ts).

Adoption would add seven direct dependencies, including cookie, validation, Deno
shim, and MCP packages. The npm artifact itself is 5,905,375 bytes unpacked,
excluding dependencies. Its default `{meta, quotes, events}` output would require
an adapter preserving our dates and nullable price fields. That cost is
unnecessary for the demonstrated header-only fix.
[Versioned npm metadata](https://registry.npmjs.org/yahoo-finance2/4.0.3),
[output transformation](https://github.com/gadicc/yahoo-finance2/blob/v4.0.3/src/modules/chart.ts).

**yfinance 1.7.0**, released 2026-08-26, is Apache-2.0 Python software with twelve
runtime dependencies including curl_cffi, numpy, pandas, and lxml. History uses
the same chart path on query2, returns a DataFrame, and automatically adjusts
OHLC prices by default. It is not a direct TypeScript API replacement.
[Release](https://github.com/ranaroussi/yfinance/releases/tag/1.7.0),
[metadata](https://github.com/ranaroussi/yfinance/blob/1.7.0/pyproject.toml),
[history](https://github.com/ranaroussi/yfinance/blob/1.7.0/yfinance/scrapers/history.py),
[hosts](https://github.com/ranaroussi/yfinance/blob/1.7.0/yfinance/const.py).

It caches cookies/crumbs, switches cookie strategies on HTTP errors, and raises
`YFRateLimitError` when the retried response remains 429. It explicitly tolerates
a rate-limited crumb request and attempts the chart endpoint without a crumb.
Its preferred transport uses browser impersonation; the plain requests fallback
is documented as best-effort. These describe upstream architecture, not changes
recommended here.
[Data layer](https://github.com/ranaroussi/yfinance/blob/1.7.0/yfinance/data.py),
[HTTP backend](https://github.com/ranaroussi/yfinance/blob/1.7.0/yfinance/_http.py).

Neither implementation nor this local test reveals Yahoo's private filtering
rules or guarantees future availability. The useful precedent is that chart
requests can work without a crumb and need not claim to be Chrome.
