# Changelog

## 2.0.0

### Breaking changes

- `getYahooFinanceData` no longer accepts `useBrowser`. Request headers are now
  handled internally.
- `getYahooFinanceData` now treats `endDate` as inclusive by requesting the
  observation beginning at that date or time.

### Improvements

- Replaced the Yahoo Finance data-use guidance with a shorter notice explaining
  that the endpoint is undocumented and unaffiliated with Yahoo.
- Added deterministic Yahoo Finance tests while retaining a live smoke test that
  runs locally and is skipped in CI.
- Exported `getMinimumDownPayment` and `getMortgageInsuranceTax` from the web
  entry point. Yahoo Finance access remains excluded from the web entry point.
- Synchronized public types and constants across the main and web entry points.
- Fixed zero-interest fixed mortgages returning `NaN` values.
- Made `getIncomeTax` caching exact and deterministic while retaining rounded
  cache inputs inside Monte Carlo simulations.
- Added explicit validation for non-positive CPI values and negative purchase
  prices.
