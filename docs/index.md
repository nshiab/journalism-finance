**Journalism Finance v2.0.5**

***

# The Journalism Library (finance)

Useful TypeScript functions for financial calculations and data fetching in journalism projects.
Part of the [journalism library](https://github.com/nshiab/journalism).

The library is maintained by [Nael Shiab](https://naelshiab.com/), computational
journalist and senior data producer for [CBC News](https://www.cbc.ca/news).

> [!TIP]
> To learn how to use this library and more, check out
> [Code Like a Journalist](https://www.code-like-a-journalist.com/), a free and
> open-source data analysis and data visualization course in TypeScript. You
> might also find
> [simple-data-analysis](https://github.com/nshiab/simple-data-analysis) useful.

## Installation

```sh
npm install @nshiab/journalism-finance
```

```ts
import { getYahooFinanceData } from "@nshiab/journalism-finance";

const prices = await getYahooFinanceData(
  "AAPL",
  new Date("2025-03-13"),
  new Date("2025-03-14"),
  "close",
  "1d",
);
console.log(prices);
```

For browser applications, import browser-safe calculations from
`@nshiab/journalism-finance/web` with your JavaScript bundler.

```ts
import { adjustToInflation } from "@nshiab/journalism-finance/web";

const adjustedAmount = adjustToInflation(100, 120, 150);
console.log(adjustedAmount); // 125
```

To start a data project with folders, configuration and documentation for AI
agents, run:

```sh
npx @nshiab/setup-data-project
```

## Documentation

- [Documentation](https://nshiab.github.io/journalism-finance/)
- [llms.txt — Documentation index for AI agents](https://nshiab.github.io/journalism-finance/llms.txt)
- [llm.md — Complete Markdown reference](https://nshiab.github.io/journalism-finance/llm.md),
  for AI assistants or offline reading
- [npm package](https://www.npmjs.com/package/@nshiab/journalism-finance)

See
[CONTRIBUTING.md](https://github.com/nshiab/journalism-finance/blob/main/CONTRIBUTING.md)
for development commands.
