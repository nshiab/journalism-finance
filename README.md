# The Journalism Library (finance functions)

Useful TypeScript functions for journalism projects. This library focuses on
financial calculations and data fetching. It's part of the
[journalism library](https://github.com/nshiab/journalism).

The library is available on [JSR](https://jsr.io/@nshiab/journalism-finance)
with its [documentation](https://jsr.io/@nshiab/journalism-finance/doc).

The documentation is also available as the markdown file
[llm.md](https://github.com/nshiab/journalism-finance/blob/main/llm.md), which
can be passed as context to improve the use of the library by AI coding
assistants or agents.

The library is maintained by [Nael Shiab](http://naelshiab.com/), computational
journalist and senior data producer for [CBC News](https://www.cbc.ca/news).

> [!TIP]
> To learn how to use this library and more, check out
> [Code Like a Journalist](https://www.code-like-a-journalist.com/), a free and
> open-source data analysis and data visualization course in TypeScript. You
> might also find the
> [simple-data-analysis library](https://github.com/nshiab/simple-data-analysis)
> interesting.

To install the library, you can use the following commands:

```bash
# DENO
deno install jsr:@nshiab/journalism-finance

# NODE.JS
npx jsr add @nshiab/journalism-finance

# BUN
bunx jsr add @nshiab/journalism-finance
```

If you run your code in a browser, use the `web` entry point:

```js
import { adjustToInflation } from "@nshiab/journalism-finance/web";
```

If you wish to contribute, please check the
[guidelines](https://github.com/nshiab/journalism-finance/blob/main/CONTRIBUTING.md).
