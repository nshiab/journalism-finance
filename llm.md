# The Journalism library (finance functions)

To install the library with Deno, use:

```bash
deno add jsr:@nshiab/journalism-finance
```

To install the library with Node.js, use:

```bash
npx jsr add @nshiab/journalism-finance
```

To import a function, use:

```ts
import { functionName } from "@nshiab/journalism-finance";
```

## adjustToInflation

Adjusts a monetary amount for inflation using the Consumer Price Index (CPI).

### Signature

```typescript
function adjustToInflation(
  amount: number,
  amountCPI: number,
  targetCPI: number,
  options?: { decimals?: number },
): number;
```

### Parameters

- **`amount`**: The initial amount of money to be adjusted.
- **`amountCPI`**: The Consumer Price Index (CPI) corresponding to the period of
  the `amount`.
- **`targetCPI`**: The Consumer Price Index (CPI) for the period to which the
  amount is being adjusted.
- **`options`**: Optional settings for the calculation.
- **`options.decimals`**: The number of decimal places to which the resulting
  adjusted amount should be rounded. If not specified, the result will not be
  rounded.

### Examples

```ts
// Basic usage: Adjusting $100 from a time when the CPI was 120 to a time when the CPI is 150.
const adjustedValue = adjustToInflation(100, 120, 150);
console.log(adjustedValue); // Expected output: 125
```

```ts
// With rounding to two decimal places
const adjustedValueRounded = adjustToInflation(100, 120, 150.5, {
  decimals: 2,
});
console.log(adjustedValueRounded); // Expected output: 125.42
```

```ts
// Calculating the value of a 1990 salary in 2023 terms
const salary1990 = 45000;
const cpi1990 = 60.5; // Hypothetical CPI for 1990
const cpi2023 = 135.2; // Hypothetical CPI for 2023
const adjustedSalary = adjustToInflation(salary1990, cpi1990, cpi2023, {
  decimals: 0,
});
console.log(
  `A $45,000 salary in 1990 is equivalent to approximately ${adjustedSalary} in 2023.`,
);
// Expected output: "A $45,000 salary in 1990 is equivalent to approximately $100149 in 2023."
```

## getMortgagePenalty

Calculates the mortgage prepayment penalty.

For variable mortgages, the penalty is typically three months of interest. For
fixed mortgages, the penalty is usually the greater of three months of interest
or the Interest Rate Differential (IRD).

### Signature

```typescript
function getMortgagePenalty(
  parameters: {
    remainingMonthsToTerm: number;
    mortgageBalance: number;
    postedInterestRate: number;
    rateDiscount: number;
    rateMargin: number;
    currentPostedRates: Record<number, number>;
    mortgageType: "fixed" | "variable";
  },
): number;
```

### Parameters

- **`parameters`**: - The mortgage details.
- **`parameters.remainingMonthsToTerm`**: - Number of months left in the current
  mortgage term.
- **`parameters.mortgageBalance`**: - The current outstanding mortgage balance.
- **`parameters.postedInterestRate`**: - The original posted interest rate when
  the mortgage was signed.
- **`parameters.rateDiscount`**: - The discount received from the posted rate
  (as a decimal, e.g., 0.01 for 1%).
- **`parameters.rateMargin`**: - Any additional margin added to the rate.
- **`parameters.currentPostedRates`**: - A record mapping term lengths (in
  years) to current posted interest rates.
- **`parameters.mortgageType`**: - Either "fixed" or "variable".

### Returns

The calculated mortgage penalty rounded to 2 decimal places.

### Throws

- **`null`**: Error if no current posted rate is found for the remaining term
  length.

### Examples

```ts
const penalty = getMortgagePenalty({
  remainingMonthsToTerm: 24,
  mortgageBalance: 300000,
  postedInterestRate: 0.05,
  rateDiscount: 0.0125,
  rateMargin: 0,
  currentPostedRates: { 1: 0.045, 2: 0.0475, 3: 0.05, 4: 0.0525, 5: 0.055 },
  mortgageType: "fixed",
});
```

```ts
const penalty = getMortgagePenalty({
  remainingMonthsToTerm: 36,
  mortgageBalance: 250000,
  postedInterestRate: 0.06,
  rateDiscount: 0.01,
  rateMargin: 0.0025,
  currentPostedRates: {}, // Not used for variable
  mortgageType: "variable",
});
```

## getSalesTax

Calculates the Canadian sales tax for a given amount and province. Rates as of
March 2026.

### Signature

```typescript
function getSalesTax(
  amount: number,
  province:
    | "Alberta"
    | "British Columbia"
    | "Manitoba"
    | "New Brunswick"
    | "Newfoundland and Labrador"
    | "Nova Scotia"
    | "Northwest Territories"
    | "Nunavut"
    | "Ontario"
    | "Prince Edward Island"
    | "Quebec"
    | "Saskatchewan"
    | "Yukon",
): {
  gst: number;
  pst: number;
  hst: number;
  totalTax: number;
  totalAmount: number;
};
```

### Parameters

- **`amount`**: - The base amount before tax.
- **`province`**: - The province or territory.

### Returns

An object containing the breakdown of taxes and the total amount.

### Examples

```ts
const salesTax = getSalesTax(100, "QC");
console.log(salesTax);
// { gst: 5, pst: 9.975, hst: 0, totalTax: 14.975, totalAmount: 114.975 }
```

Reference:
https://www.retailcouncil.org/resources/quick-facts/sales-tax-rates-by-province/

## getYahooFinanceData

Fetches historical financial data for a given stock symbol from Yahoo Finance.
This function provides a convenient way to access various financial metrics
(e.g., open, high, low, close, adjusted close, volume) at specified intervals
(daily, hourly, or minute-by-minute).

**Important Note on Data Usage:** The use of a small amount of data from Yahoo
Finance is generally tolerated for educational or public interest purposes.
However, if you intend to collect and reuse a large volume of this data,
especially for commercial purposes, it is crucial to contact the Yahoo Finance
team or consider purchasing a premium subscription to ensure compliance with
their terms of service.

### Signature

```typescript
async function getYahooFinanceData(
  symbol: string,
  startDate: Date,
  endDate: Date,
  variable: "open" | "high" | "low" | "close" | "adjclose" | "volume",
  interval: "1d" | "1h" | "1m",
  useBrowser?: boolean,
): Promise<{ timestamp: number; value: number }[]>;
```

### Parameters

- **`symbol`**: - The stock symbol (ticker) for which to fetch data (e.g.,
  'AAPL' for Apple Inc., '^GSPTSE' for S&P/TSX Composite Index).
- **`startDate`**: - The start date for the data range (inclusive). Data will be
  fetched from this date onwards.
- **`endDate`**: - The end date for the data range (inclusive). Data will be
  fetched up to this date.
- **`variable`**: - The specific financial variable to retrieve. Can be one
  of: - `"open"`: The opening price for the period. - `"high"`: The highest
  price for the period. - `"low"`: The lowest price for the period. - `"close"`:
  The closing price for the period. - `"adjclose"`: The adjusted closing price,
  accounting for dividends and stock splits. - `"volume"`: The trading volume
  for the period.
- **`interval`**: - The time interval for the data points. Can be one of: -
  `"1d"`: Daily data. - `"1h"`: Hourly data. - `"1m"`: Minute-by-minute data.
- **`useBrowser`**: - If true, the function will use Playwright to fetch the
  data. This can be useful when facing rate limiting issues with the traditional
  fetch.

### Returns

A promise that resolves to an array of objects, where each object contains a
`timestamp` (Unix timestamp in milliseconds) and the `value` of the requested
financial variable for that period.

### Examples

```ts
// Fetch the adjusted close price for the S&P/TSX Composite Index for a specific period.
const spTsxData = await getYahooFinanceData(
  "^GSPTSE",
  new Date("2025-03-01"),
  new Date("2025-03-15"),
  "adjclose",
  "1d",
);
console.log("S&P/TSX Composite Index Data:", spTsxData);
```

```ts
// Get hourly trading volume for Apple (AAPL) for a single day.
const appleVolumeData = await getYahooFinanceData(
  "AAPL",
  new Date("2024-07-01T09:30:00"),
  new Date("2024-07-01T16:00:00"),
  "volume",
  "1h",
);
console.log("Apple Hourly Volume Data:", appleVolumeData);
```

## mortgageInsurancePremium

Calculates the mortgage insurance premium based on the property's purchase price
and the down payment amount. This function is designed to reflect the premium
rates typically applied in Canada, as outlined by institutions like the
Financial Consumer Agency of Canada. The calculated premium is rounded to the
nearest integer.

Mortgage insurance is generally required in Canada when the down payment is less
than 20% of the home's purchase price.

### Signature

```typescript
function mortgageInsurancePremium(
  purchasePrice: number,
  downPayment: number,
): number;
```

### Parameters

- **`purchasePrice`**: - The total price of the property being purchased.
- **`downPayment`**: - The amount of money paid upfront by the buyer towards the
  purchase price.

### Returns

The calculated mortgage insurance premium, rounded to the nearest integer.
Returns `0` if the down payment is 20% or more, as insurance is typically not
required in such cases.

### Throws

- **`Error`**: If the down payment is less than 5% of the purchase price, as
  this is generally the minimum required down payment for insured mortgages in
  Canada.

### Examples

```ts
// Calculate the insurance premium for a property with a $500,000 purchase price and a $25,000 down payment.
// (5% down payment, so 4% premium on the mortgage amount)
const insurancePremium = mortgageInsurancePremium(500_000, 25_000);
console.log(insurancePremium); // Expected output: 19000 (4% of $475,000)
```

```ts
// Scenario 1: 10% down payment ($50,000 on $500,000 property) - 3.1% premium
const premium10Percent = mortgageInsurancePremium(500_000, 50_000);
console.log(`Premium for 10% down: ${premium10Percent}`); // Expected: 13950 (3.1% of $450,000)

// Scenario 2: 15% down payment ($75,000 on $500,000 property) - 2.8% premium
const premium15Percent = mortgageInsurancePremium(500_000, 75_000);
console.log(`Premium for 15% down: ${premium15Percent}`); // Expected: 11900 (2.8% of $425,000)

// Scenario 3: 20% or more down payment ($100,000 on $500,000 property) - No premium
const premium20Percent = mortgageInsurancePremium(500_000, 100_000);
console.log(`Premium for 20% down: ${premium20Percent}`); // Expected: 0
```

```ts
// Attempting to calculate with a down payment less than 5% will throw an error.
try {
  mortgageInsurancePremium(500_000, 20_000); // 4% down payment
} catch (error) {
  console.error("Error:", error.message);
  // Expected output: "Error: The down payment must be more than 5% of the purchase price..."
}
```

## mortgageMaxAmount

Calculates the maximum affordable property purchase price and the corresponding
mortgage amount a borrower can qualify for, based on their annual income, down
payment, and current mortgage interest rates. This function is designed to
simulate mortgage qualification criteria, taking into account various financial
factors and debt service ratios.

The calculation incorporates a stress test, where the interest rate used for
qualification is the higher of the provided rate + 2% or 5.25% (a common
benchmark in Canada). It also considers monthly debt payments, heating costs,
property taxes, and condo fees to determine the Gross Debt Service (GDS) and
Total Debt Service (TDS) ratios, which are critical in mortgage approvals.

### Signature

```typescript
function mortgageMaxAmount(
  annualIncome: number,
  downPayment: number,
  rate: number,
  options?: {
    monthlyDebtPayment?: number;
    monthlyHeating?: number;
    monthlyTax?: number;
    monthlyCondoFees?: number;
  },
): {
  annualIncome: number;
  downPayment: number;
  rate: number;
  rateTested: number;
  purchasePrice: number;
  mortgageAmount: number;
  insurancePremium: number;
  monthlyMortgagePayment: number;
  grossDebtServiceRatio: number;
  totalDebtServiceRatio: number;
  reason: string;
  monthlyDebtPayment: number;
  monthlyHeating: number;
  isHeatingEstimate: boolean;
  monthlyTax: number;
  isTaxEstimate: boolean;
  monthlyCondoFees: number;
};
```

### Parameters

- **`annualIncome`**: - The borrower's gross annual income.
- **`downPayment`**: - The amount of money the borrower is putting down as a
  down payment.
- **`rate`**: - The current mortgage interest rate (e.g., 5.25 for 5.25%).
- **`options`**: - Additional options to fine-tune the calculation:
- **`options.monthlyDebtPayment`**: - The borrower's total monthly payments for
  other debts (e.g., car loans, credit cards). Defaults to `0`.
- **`options.monthlyHeating`**: - The estimated monthly heating costs for the
  property. Defaults to `175` (a common estimate, e.g., by Royal Bank of
  Canada).
- **`options.monthlyTax`**: - The estimated monthly property tax. Defaults to
  `1.5%` of the purchase price annually, divided by 12 (a common estimate, e.g.,
  by Royal Bank of Canada).
- **`options.monthlyCondoFees`**: - The estimated monthly condo fees, if
  applicable. Defaults to `0`.

### Returns

An object containing detailed results of the mortgage affordability calculation,
including:

- `annualIncome`: The annual income provided.
- `downPayment`: The down payment provided.
- `rate`: The mortgage interest rate provided.
- `rateTested`: The interest rate used for the stress test (higher of
  `rate + 2%` or `5.25%`).
- `purchasePrice`: The maximum affordable property purchase price.
- `mortgageAmount`: The maximum mortgage amount the borrower qualifies for.
- `insurancePremium`: The calculated mortgage insurance premium (if applicable).
- `monthlyMortgagePayment`: The estimated monthly mortgage payment.
- `grossDebtServiceRatio`: The calculated Gross Debt Service (GDS) ratio.
- `totalDebtServiceRatio`: The calculated Total Debt Service (TDS) ratio.
- `reason`: The limiting factor for the maximum amount (e.g., "debt limit",
  "downPayment limit", "max purchase price").
- `monthlyDebtPayment`: The monthly debt payment used in the calculation.
- `monthlyHeating`: The monthly heating cost used in the calculation.
- `isHeatingEstimate`: `true` if `monthlyHeating` was an estimate, `false` if
  provided.
- `monthlyTax`: The monthly property tax used in the calculation.
- `isTaxEstimate`: `true` if `monthlyTax` was an estimate, `false` if provided.
- `monthlyCondoFees`: The monthly condo fees used in the calculation.

### Examples

```ts
// Calculate affordability for a borrower with $100,000 annual income, $25,000 down payment, and a 5.25% rate.
const results = mortgageMaxAmount(100_000, 25_000, 5.25);
console.log(results);
// Expected output:
// {
//   annualIncome: 100000,
//   downPayment: 25000,
//   rate: 5.25,
//   rateTested: 7.25,
//   purchasePrice: 307000,
//   mortgageAmount: 293280,
//   insurancePremium: 11280,
//   monthlyMortgagePayment: 2100,
//   grossDebtServiceRatio: 0.32,
//   totalDebtServiceRatio: 0.32,
//   reason: "debt limit",
//   monthlyDebtPayment: 0,
//   monthlyHeating: 175,
//   isHeatingEstimate: true,
//   monthlyTax: 385,
//   isTaxEstimate: true,
//   monthlyCondoFees: 0,
// }
```

```ts
// Calculate affordability with specific monthly debt payments and property taxes.
const customExpensesResults = mortgageMaxAmount(120_000, 40_000, 4.5, {
  monthlyDebtPayment: 300,
  monthlyTax: 450,
  monthlyCondoFees: 200,
});
console.log(customExpensesResults);
```

## mortgagePayments

Calculates and returns a detailed schedule of fixed-rate mortgage payments. This
function is designed to provide a comprehensive breakdown of each payment,
including the principal and interest portions, remaining balance, and cumulative
amounts paid. It adheres to Canadian mortgage regulations, which typically
require semi-annual compounding, but allows for customization of the compounding
frequency.

The function is flexible, supporting various payment frequencies (weekly,
bi-weekly, monthly, semi-monthly, accelerated weekly, accelerated bi-weekly) and
allowing for the specification of the mortgage amount, interest rate, term, and
amortization period. It also includes options for rounding payment values and
enabling debug logging.

### Signature

```typescript
function mortgagePayments(
  mortgageAmount: number,
  rate: number,
  paymentFrequency:
    | "weekly"
    | "biWeekly"
    | "monthly"
    | "semiMonthly"
    | "acceleratedWeekly"
    | "acceleratedBiWeekly",
  term: number,
  amortizationPeriod: number,
  options?: {
    id?: string;
    decimals?: number;
    annualCompounding?: number;
    debug?: boolean;
  },
): {
  id?: string | undefined;
  paymentId: number;
  payment: number;
  interest: number;
  capital: number;
  balance: number;
  amountPaid: number;
  interestPaid: number;
  capitalPaid: number;
}[];
```

### Parameters

- **`mortgageAmount`**: - The total amount of the mortgage loan.
- **`rate`**: - The annual interest rate of the mortgage (e.g., `6.00` for
  6.00%).
- **`paymentFrequency`**: - The frequency at which mortgage payments are made.
  Supported values are: `"weekly"`, `"biWeekly"`, `"monthly"`, `"semiMonthly"`,
  `"acceleratedWeekly"`, `"acceleratedBiWeekly"`.
- **`term`**: - The term of the mortgage in years. This is the length of the
  current mortgage contract.
- **`amortizationPeriod`**: - The total amortization period of the mortgage in
  years. This is the total time it will take to pay off the mortgage.
- **`options`**: - Additional options for customizing the mortgage calculation
  and output.
- **`options.id`**: - An optional string ID to be added to each payment object
  in the returned array. Useful for tracking payments related to a specific
  mortgage.
- **`options.decimals`**: - The number of decimal places to round the financial
  values (payment, interest, capital, balance) to. Defaults to `2`.
- **`options.annualCompounding`**: - The number of times the mortgage interest
  should be compounded per year. Defaults to `2` (semi-annual compounding, as is
  standard in Canada).
- **`options.debug`**: - If `true`, enables debug logging to the console,
  providing additional insights into the calculation process. Defaults to
  `false`.

### Returns

An array of objects, where each object represents a single mortgage payment and
contains:

- `paymentId`: A 0-based index for the payment.
- `payment`: The total amount of the payment.
- `interest`: The portion of the payment that goes towards interest.
- `capital`: The portion of the payment that goes towards the principal
  (capital).
- `balance`: The remaining mortgage balance after the payment.
- `amountPaid`: The cumulative total amount paid so far.
- `interestPaid`: The cumulative total interest paid so far.
- `capitalPaid`: The cumulative total capital reimbursed so far.
- `id` (optional): The ID provided in `options.id`.

### Throws

- **`Error`**: If the `amortizationPeriod` is less than the `term`, as this is
  an invalid mortgage configuration.

### Examples

```ts
// Return the monthly mortgage payments for a $250,000 loan with a 6.00% rate, 5-year term, and 25-year amortization.
const payments = mortgagePayments(250_000, 6, "monthly", 5, 25);
console.log(payments[0]); // First payment details
// Expected output (example):
// {
//   paymentId: 0,
//   payment: 1599.52,
//   interest: 1234.66,
//   capital: 364.86,
//   balance: 249635.14,
//   amountPaid: 1599.52,
//   interestPaid: 1234.66,
//   capitalPaid: 364.86,
// }
console.log(payments[payments.length - 1]); // Last payment details
// Expected output (example):
// {
//   paymentId: 59,
//   payment: 1599.52,
//   interest: 1111.58,
//   capital: 487.93,
//   balance: 224591.84,
//   amountPaid: 95970.99,
//   interestPaid: 70562.76,
//   capitalPaid: 25408.23,
// }
```

```ts
// Attempting to set an amortization period shorter than the term will throw an error.
try {
  mortgagePayments(200_000, 5, "monthly", 10, 5); // Term (10) > Amortization (5)
} catch (error) {
  console.error("Error:", error.message);
  // Expected output: "Error: The amortizationPeriod should be equal or greater than the term."
}
```

## simulateRentVsBuy

Simulates and compares the financial outcomes of renting versus buying a home
over a specified number of years. This comprehensive simulation accounts for
various factors including mortgage payments (fixed and variable), property
taxes, maintenance costs, condo fees, insurance, rent increases, market returns
on savings, and the eventual sale of the property. Tailored for a Canadian
context, it includes specific features like tax-free TFSA contributions and
standard Canadian mortgage structures.

The simulation tracks three scenarios:

1. **Renter**: Pays rent and invests the difference between their expenses and
   the buyer's expenses into the market.
2. **Buyer (Fixed)**: Purchases a home using a fixed-rate mortgage and invests
   any remaining surplus.
3. **Buyer (Variable)**: Purchases a home using a variable-rate mortgage and
   invests any remaining surplus.

It provides a detailed breakdown of monthly expenses, gains, assets, and a final
summary including the net balance after selling the property and paying all
associated costs (taxes, legal fees, penalties).

### Signature

```typescript
function simulateRentVsBuy(
  parameters: {
    startingYear: number;
    numberOfYears: number;
    tfsaContributions: boolean;
    combinedTaxRate: number;
    province:
      | "Alberta"
      | "British Columbia"
      | "Manitoba"
      | "New Brunswick"
      | "Newfoundland and Labrador"
      | "Nova Scotia"
      | "Northwest Territories"
      | "Nunavut"
      | "Ontario"
      | "Prince Edward Island"
      | "Quebec"
      | "Saskatchewan"
      | "Yukon";
    renter: {
      startingMonthlyRent: number;
      securityDeposit: number;
      startingMonthlyInsurance: number;
    };
    buyer: {
      downPayment: number;
      purchasePrice: number;
      fixedRateDiscount: number;
      variableRateMargin: number;
      purchaseFixedFees: number;
      startingAnnualMaintenanceCost: number;
      startingAnnualPropertyTax: number;
      startingMonthlyCondoFees: number;
      startingMonthlyInsurance: number;
      sellingFixedFees: number;
      sellingCommissionRate: number;
    };
    rates: {
      marketReturnRate: number[];
      rentIncrease: number[];
      ownerInsuranceIncrease: number[];
      renterInsuranceIncrease: number[];
      maintenanceIncrease: number[];
      propertyTaxIncrease: number[];
      condoFeeIncrease: number[];
      fiveYearInterestRates: number[];
      fourYearInterestRates: number[];
      threeYearInterestRates: number[];
      twoYearInterestRates: number[];
      oneYearInterestRates: number[];
      variableInterestRates: number[];
      appreciationIncrease: number[];
      sellingFixedFeesIncrease: number[];
    };
  },
  options?: { finalBalanceOnly?: boolean },
): (
  & {
    year: number;
    month: number;
    monthIndex: number;
    date: Date;
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
  }
  & (
    | {
      group: "monthlyExpenses" | "cumulativeExpenses";
      variable:
        | "rent"
        | "insurance"
        | "securityDeposit"
        | "mortgageCapital"
        | "mortgageInterests"
        | "maintenance"
        | "propertyTax"
        | "condoFees"
        | "downPayment"
        | "purchaseFixedFees"
        | "insurancePremium";
      effectiveInterestRate?: number;
      postedInterestRate?: number;
      fixedRateDiscount?: number;
      variableRateMargin?: number;
    }
    | {
      group: "monthlyGains" | "cumulativeGains";
      variable:
        | "tfsaGains"
        | "tfsaContribution"
        | "stocksGains"
        | "newStocks"
        | "homeEquityGains";
      homeValue?: number;
    }
    | {
      group: "assets";
      variable: "tfsa" | "stocks" | "securityDeposit" | "homeEquity";
    }
    | { group: "summary"; variable: "balance" }
    | {
      group: "summaryCumulative";
      variable: "balance" | "balanceAfterSelling";
    }
    | {
      group: "saleCosts";
      variable:
        | "stockTaxes"
        | "homeSellingCommission"
        | "homeSellingFixedFees"
        | "mortgagePenalty"
        | "mortgageBalance";
    }
    | {
      group: "saleNetGains";
      variable:
        | "stockSellingGains"
        | "tfsaSellingGains"
        | "homeSellingGains"
        | "securityDeposit";
    }
  )
)[];
```

### Parameters

- **`parameters`**: - The input parameters for the simulation.
- **`parameters.startingYear`**: - The year the simulation begins.
- **`parameters.numberOfYears`**: - The duration of the simulation in years.
- **`parameters.tfsaContributions`**: - Whether to prioritize TFSA contributions
  for investments (tax-free gains).
- **`parameters.combinedTaxRate`**: - The combined marginal tax rate used for
  calculating taxes on investment gains.
- **`parameters.province`**: - The province used to calculate sales tax on the
  selling fixed fees and commission when selling the home.
- **`parameters.renter`**: - Configuration for the renter scenario.
- **`parameters.renter.startingMonthlyRent`**: - The initial monthly rent
  payment.
- **`parameters.renter.securityDeposit`**: - The initial security deposit.
- **`parameters.renter.startingMonthlyInsurance`**: - The initial monthly
  renter's insurance.
- **`parameters.buyer`**: - Configuration for the buyer scenarios.
- **`parameters.buyer.downPayment`**: - The down payment amount.
- **`parameters.buyer.purchasePrice`**: - The purchase price of the home.
- **`parameters.buyer.fixedRateDiscount`**: - The discount applied to the posted
  fixed mortgage rate.
- **`parameters.buyer.variableRateMargin`**: - The margin added to the variable
  mortgage rate.
- **`parameters.buyer.purchaseFixedFees`**: - Fixed fees associated with the
  purchase (e.g., notary, land transfer tax).
- **`parameters.buyer.startingAnnualMaintenanceCost`**: - The initial annual
  maintenance cost.
- **`parameters.buyer.startingAnnualPropertyTax`**: - The initial annual
  property tax.
- **`parameters.buyer.startingMonthlyCondoFees`**: - The initial monthly condo
  fees.
- **`parameters.buyer.startingMonthlyInsurance`**: - The initial monthly
  homeowner's insurance.
- **`parameters.buyer.sellingFixedFees`**: - Fixed fees associated with selling
  the home (before sales tax).
- **`parameters.buyer.sellingCommissionRate`**: - The real estate commission
  rate for selling the home (e.g., 0.05 for 5%).
- **`parameters.rates`**: - Annualized rates and their values over the
  simulation period. Each array should have a length of `numberOfYears * 12`.
  These can be historical or projected rates.
- **`parameters.rates.marketReturnRate`**: - Monthly market return rates.
- **`parameters.rates.rentIncrease`**: - Monthly rent increase rates.
- **`parameters.rates.ownerInsuranceIncrease`**: - Monthly homeowner's insurance
  increase rates.
- **`parameters.rates.renterInsuranceIncrease`**: - Monthly renter's insurance
  increase rates.
- **`parameters.rates.maintenanceIncrease`**: - Monthly maintenance cost
  increase rates.
- **`parameters.rates.propertyTaxIncrease`**: - Monthly property tax increase
  rates.
- **`parameters.rates.condoFeeIncrease`**: - Monthly condo fee increase rates.
- **`parameters.rates.fiveYearInterestRates`**: - Monthly 5-year fixed mortgage
  interest rates.
- **`parameters.rates.fourYearInterestRates`**: - Monthly 4-year fixed mortgage
  interest rates.
- **`parameters.rates.threeYearInterestRates`**: - Monthly 3-year fixed mortgage
  interest rates.
- **`parameters.rates.twoYearInterestRates`**: - Monthly 2-year fixed mortgage
  interest rates.
- **`parameters.rates.oneYearInterestRates`**: - Monthly 1-year fixed mortgage
  interest rates.
- **`parameters.rates.variableInterestRates`**: - Monthly variable mortgage
  interest rates.
- **`parameters.rates.appreciationIncrease`**: - Monthly home appreciation
  rates.
- **`parameters.rates.sellingFixedFeesIncrease`**: - Monthly increase rates for
  selling fixed fees.
- **`options`**: - Additional simulation options.
- **`options.finalBalanceOnly`**: - If `true`, the returned results will only
  include the final balance (before and after selling) for each scenario.
  Defaults to `false`.

### Returns

A detailed array of monthly results for each scenario (renter, buyerFixed,
buyerVariable). Each object in the array represents a specific data point for a
given month, categorized by:

- `monthlyExpenses` or `cumulativeExpenses` (e.g., rent, mortgage payments)
- `monthlyGains` or `cumulativeGains` (e.g., investment gains)
- `assets` (e.g., home equity, TFSA)
- `summary` (monthly balance)
- `summaryCumulative` (cumulative balance, final balance after selling)
- `saleCosts` (costs incurred upon selling)
- `saleNetGains` (gains realized upon selling)

### Examples

```ts
const rates = {
  marketReturnRate: new Array(120).fill(0.005), // 0.5% monthly
  rentIncrease: new Array(120).fill(0.002),
  ownerInsuranceIncrease: new Array(120).fill(0.002),
  renterInsuranceIncrease: new Array(120).fill(0.002),
  maintenanceIncrease: new Array(120).fill(0.002),
  propertyTaxIncrease: new Array(120).fill(0.002),
  condoFeeIncrease: new Array(120).fill(0.002),
  fiveYearInterestRates: new Array(120).fill(0.05),
  fourYearInterestRates: new Array(120).fill(0.05),
  threeYearInterestRates: new Array(120).fill(0.05),
  twoYearInterestRates: new Array(120).fill(0.05),
  oneYearInterestRates: new Array(120).fill(0.05),
  variableInterestRates: new Array(120).fill(0.06),
  appreciationIncrease: new Array(120).fill(0.003),
  sellingFixedFeesIncrease: new Array(120).fill(0.002),
};

const results = simulateRentVsBuy({
  startingYear: 2024,
  numberOfYears: 10,
  tfsaContributions: true,
  combinedTaxRate: 0.4,
  province: "Ontario",
  renter: {
    startingMonthlyRent: 2000,
    securityDeposit: 2000,
    startingMonthlyInsurance: 30,
  },
  buyer: {
    downPayment: 100000,
    purchasePrice: 500000,
    fixedRateDiscount: 1.5,
    variableRateMargin: -0.5,
    purchaseFixedFees: 5000,
    startingAnnualMaintenanceCost: 2000,
    startingAnnualPropertyTax: 3000,
    startingMonthlyCondoFees: 300,
    startingMonthlyInsurance: 100,
    sellingFixedFees: 2000,
    sellingCommissionRate: 0.05,
  },
  rates,
}, { finalBalanceOnly: true });
```

## simulateRentVsBuyMonteCarlo

Performs a Monte Carlo simulation for a rent versus buy analysis tailored for a
Canadian context. This function runs multiple iterations of the
`simulateRentVsBuy` function, using stochastic paths for various economic
factors like market returns, interest rates, and inflation-related costs. It
helps evaluate the probability of different financial outcomes under
uncertainty.

The simulation uses:

- **Geometric Brownian Motion (GBM)** for paths like market returns, rent
  increases, and home appreciation.
- **Cox-Ingersoll-Ross (CIR)** models for interest rate paths.

Parameters for these models can be generated from historical data using
`getCirParameters` and `getGbmParameters` from `@nshiab/journalism`.

### Signature

```typescript
function simulateRentVsBuyMonteCarlo(
  parameters: {
    iterations: number;
    startingYear: number;
    numberOfYears: number;
    tfsaContributions: boolean;
    combinedTaxRate: number;
    province:
      | "Alberta"
      | "British Columbia"
      | "Manitoba"
      | "New Brunswick"
      | "Newfoundland and Labrador"
      | "Nova Scotia"
      | "Northwest Territories"
      | "Nunavut"
      | "Ontario"
      | "Prince Edward Island"
      | "Quebec"
      | "Saskatchewan"
      | "Yukon";
    renter: {
      startingMonthlyRent: number;
      securityDeposit: number;
      startingMonthlyInsurance: number;
    };
    buyer: {
      downPayment: number;
      purchasePrice: number;
      fixedRateDiscount: number;
      variableRateMargin: number;
      purchaseFixedFees: number;
      startingAnnualMaintenanceCost: number;
      startingAnnualPropertyTax: number;
      startingMonthlyCondoFees: number;
      startingMonthlyInsurance: number;
      sellingFixedFees: number;
      sellingCommissionRate: number;
    };
    gbmParameters: {
      market: { startValue: number; mu: number; sigma: number };
      rent: { startValue: number; mu: number; sigma: number };
      ownerInsurance: { startValue: number; mu: number; sigma: number };
      renterInsurance: { startValue: number; mu: number; sigma: number };
      maintenance: { startValue: number; mu: number; sigma: number };
      propertyTax: { startValue: number; mu: number; sigma: number };
      condoFee: { startValue: number; mu: number; sigma: number };
      appreciation: { startValue: number; mu: number; sigma: number };
      sellingFixedFees: { startValue: number; mu: number; sigma: number };
      fiveYearInterestRates: {
        a: number;
        b: number;
        sigma: number;
        startValue: number;
      };
      fourYearInterestRates: {
        a: number;
        b: number;
        sigma: number;
        startValue: number;
      };
      threeYearInterestRates: {
        a: number;
        b: number;
        sigma: number;
        startValue: number;
      };
      twoYearInterestRates: {
        a: number;
        b: number;
        sigma: number;
        startValue: number;
      };
      oneYearInterestRates: {
        a: number;
        b: number;
        sigma: number;
        startValue: number;
      };
      variableInterestRates: {
        a: number;
        b: number;
        sigma: number;
        startValue: number;
      };
    };
  },
  options?: {
    verbose?: boolean;
    verboseStep?: number;
    values?: boolean;
    rates?: boolean;
  },
): {
  values: {
    iteration: string;
    variable: string;
    value: number;
    month: number;
  }[];
  rates: {
    iteration: string;
    variable: string;
    value: number;
    month: number;
  }[];
  winners: {
    year: number;
    month: number;
    monthIndex: number;
    date: Date;
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
    group: "summaryCumulative";
    variable: "balanceAfterSelling";
  }[];
  winnersBeforeSelling: {
    year: number;
    month: number;
    monthIndex: number;
    date: Date;
    amount: number;
    category: "renter" | "buyerFixed" | "buyerVariable";
    group: "summaryCumulative";
    variable: "balance";
  }[];
};
```

### Parameters

- **`parameters`**: - The input parameters for the Monte Carlo simulation.
- **`parameters.iterations`**: - The number of simulation iterations to run.
- **`parameters.startingYear`**: - The year the simulation begins.
- **`parameters.numberOfYears`**: - The duration of each simulation in years.
- **`parameters.tfsaContributions`**: - Whether to prioritize TFSA contributions
  for investments (tax-free gains).
- **`parameters.combinedTaxRate`**: - The combined marginal tax rate used for
  calculating taxes on investment gains.
- **`parameters.province`**: - The Canadian province or territory, used for
  calculating sales taxes.
- **`parameters.renter`**: - Configuration for the renter scenario.
- **`parameters.renter.startingMonthlyRent`**: - The initial monthly rent
  payment.
- **`parameters.renter.securityDeposit`**: - The initial security deposit (e.g.,
  last month's rent).
- **`parameters.renter.startingMonthlyInsurance`**: - The initial monthly
  renter's (tenant) insurance cost.
- **`parameters.buyer`**: - Configuration for the buyer scenarios.
- **`parameters.buyer.downPayment`**: - The total down payment amount paid at
  the start.
- **`parameters.buyer.purchasePrice`**: - The initial purchase price of the
  home.
- **`parameters.buyer.fixedRateDiscount`**: - The discount applied to the posted
  fixed mortgage rate (e.g., `1.5` for 1.5% off).
- **`parameters.buyer.variableRateMargin`**: - The margin added or subtracted
  from the variable mortgage rate.
- **`parameters.buyer.purchaseFixedFees`**: - One-time costs at purchase
  (notary, land transfer tax, etc.).
- **`parameters.buyer.startingAnnualMaintenanceCost`**: - Initial annual cost
  for home maintenance.
- **`parameters.buyer.startingAnnualPropertyTax`**: - Initial annual property
  tax amount.
- **`parameters.buyer.startingMonthlyCondoFees`**: - Initial monthly condo fees
  (if applicable).
- **`parameters.buyer.startingMonthlyInsurance`**: - Initial monthly homeowner's
  insurance cost.
- **`parameters.buyer.sellingFixedFees`**: - One-time fixed costs when selling
  the property (before sales tax).
- **`parameters.buyer.sellingCommissionRate`**: - The commission rate paid to
  real estate agents upon sale (e.g., `0.05` for 5%).
- **`parameters.gbmParameters`**: - Parameters for the Geometric Brownian Motion
  models. Each sub-object (market, rent, etc.) requires: - `startValue`: The
  initial annual rate (e.g., 0.05 for 5%). - `mu`: The drift or expected annual
  growth rate. - `sigma`: The annual volatility.
- **`parameters.gbmParameters.market`**: - Market return rates for savings.
- **`parameters.gbmParameters.rent`**: - Rent increase rates.
- **`parameters.gbmParameters.ownerInsurance`**: - Homeowner's insurance
  increase rates.
- **`parameters.gbmParameters.renterInsurance`**: - Renter's insurance increase
  rates.
- **`parameters.gbmParameters.maintenance`**: - Maintenance cost increase rates.
- **`parameters.gbmParameters.propertyTax`**: - Property tax increase rates.
- **`parameters.gbmParameters.condoFee`**: - Condo fee increase rates.
- **`parameters.gbmParameters.appreciation`**: - Home value appreciation rates.
- **`parameters.gbmParameters.sellingFixedFees`**: - Selling fixed fees increase
  rates.
- **`parameters.gbmParameters.fiveYearInterestRates`**: - Parameters for the CIR
  model for 5-year fixed rates. Requires `a` (speed of mean reversion), `b`
  (long-term mean), `sigma` (volatility), and `startValue`.
- **`parameters.gbmParameters.fourYearInterestRates`**: - Parameters for the CIR
  model for 4-year fixed rates.
- **`parameters.gbmParameters.threeYearInterestRates`**: - Parameters for the
  CIR model for 3-year fixed rates.
- **`parameters.gbmParameters.twoYearInterestRates`**: - Parameters for the CIR
  model for 2-year fixed rates.
- **`parameters.gbmParameters.oneYearInterestRates`**: - Parameters for the CIR
  model for 1-year fixed rates.
- **`parameters.gbmParameters.variableInterestRates`**: - Parameters for the CIR
  model for variable rates.
- **`options`**: - Additional simulation options.
- **`options.verbose`**: - If `true`, logs the simulation's progress to the
  console, including the current iteration and estimated time remaining. Useful
  for long-running simulations.
- **`options.verboseStep`**: - The frequency of progress logging. For example,
  setting this to `50` will log progress every 50 iterations. Defaults to `1` if
  `verbose` is true.
- **`options.values`**: - If `true`, the function will capture and return
  detailed monthly financial data (such as asset balances and net gains) for
  every iteration of the simulation. Be cautious with high iteration counts as
  this can consume significant memory.
- **`options.rates`**: - If `true`, the function will capture and return the
  exact stochastic interest and appreciation rates generated for every
  iteration. Useful for auditing the simulation's statistical properties.

### Returns

An object containing the simulation results:

- `winners`: An array of objects indicating which scenario yielded the highest
  final net balance (after house and investment sale) for each iteration. Each
  object includes the `amount`, `category` (renter, buyerFixed, buyerVariable),
  and the `iteration` details.
- `winnersBeforeSelling`: An array of objects indicating which scenario yielded
  the highest final asset balance (before house and investment sale) for each
  iteration. Contains similar details to `winners`.
- `values`: An array of objects containing the generated values paths for each
  iteration. Returns an empty array unless `options.values` is `true`.
- `rates`: An array of objects containing the generated rate paths for each
  iteration. Returns an empty array unless `options.rates` is `true`.

### Examples

```ts
const results = simulateRentVsBuyMonteCarlo({
  iterations: 1000,
  startingYear: 2024,
  numberOfYears: 25,
  tfsaContributions: true,
  combinedTaxRate: 0.4,
  province: "Ontario",
  renter: {
    startingMonthlyRent: 1500,
    securityDeposit: 1500,
    startingMonthlyInsurance: 25,
  },
  buyer: {
    downPayment: 50000,
    purchasePrice: 400000,
    fixedRateDiscount: 1.0,
    variableRateMargin: 0,
    purchaseFixedFees: 3000,
    startingAnnualMaintenanceCost: 1500,
    startingAnnualPropertyTax: 2500,
    startingMonthlyCondoFees: 0,
    startingMonthlyInsurance: 80,
    sellingFixedFees: 1500,
    sellingCommissionRate: 0.05,
  },
  gbmParameters: {
    market: { startValue: 0.07, mu: 0.07, sigma: 0.15 },
    rent: { startValue: 0.03, mu: 0.03, sigma: 0.02 },
    ownerInsurance: { startValue: 0.03, mu: 0.03, sigma: 0.05 },
    renterInsurance: { startValue: 0.03, mu: 0.03, sigma: 0.05 },
    maintenance: { startValue: 0.02, mu: 0.02, sigma: 0.05 },
    propertyTax: { startValue: 0.02, mu: 0.02, sigma: 0.02 },
    condoFee: { startValue: 0.03, mu: 0.03, sigma: 0.05 },
    appreciation: { startValue: 0.04, mu: 0.04, sigma: 0.10 },
    sellingFixedFees: { startValue: 0.02, mu: 0.02, sigma: 0.05 },
    fiveYearInterestRates: { startValue: 0.05, a: 0.2, b: 0.05, sigma: 0.02 },
    fourYearInterestRates: { startValue: 0.048, a: 0.2, b: 0.048, sigma: 0.02 },
    threeYearInterestRates: {
      startValue: 0.045,
      a: 0.2,
      b: 0.045,
      sigma: 0.02,
    },
    twoYearInterestRates: { startValue: 0.042, a: 0.2, b: 0.042, sigma: 0.02 },
    oneYearInterestRates: { startValue: 0.04, a: 0.2, b: 0.04, sigma: 0.02 },
    variableInterestRates: { startValue: 0.06, a: 0.3, b: 0.055, sigma: 0.03 },
  },
}, { verbose: true, verboseStep: 100 });

console.log(results.winners.length); // 1000
```

## variableMortgagePayments

Calculates and returns a detailed schedule of variable-rate monthly mortgage
payments (VRM). This function models a Variable Rate Mortgage where the payment
amount stays FIXED for the term, but rate changes affect how much goes to
interest vs. principal. If rates rise too high, payments may not cover interest,
causing negative amortization (balance increases).

### Signature

```typescript
function variableMortgagePayments(
  mortgageAmount: number,
  rates: number[],
  term: number,
  amortizationPeriod: number,
  options?: {
    id?: string;
    decimals?: number;
    annualCompounding?: number;
    debug?: boolean;
  },
): {
  id?: string | undefined;
  paymentId: number;
  payment: number;
  interest: number;
  capital: number;
  balance: number;
  amountPaid: number;
  interestPaid: number;
  capitalPaid: number;
  rate: number;
}[];
```

### Parameters

- **`mortgageAmount`**: - The total amount of the mortgage loan.
- **`rates`**: - An array of annual interest rates (e.g.,
  `[6.00, 6.00, 5.50, 5.50, ...]` for rates in percentages). The array must
  contain at least as many rates as there are payments in the term. Each element
  corresponds to the rate for that payment period (0-based index).
- **`term`**: - The term of the mortgage in years. This is the length of the
  current mortgage contract.
- **`amortizationPeriod`**: - The total amortization period of the mortgage in
  years. This is the total time it will take to pay off the mortgage.
- **`options`**: - Additional options for customizing the mortgage calculation
  and output.
- **`options.id`**: - An optional string ID to be added to each payment object
  in the returned array. Useful for tracking payments related to a specific
  mortgage.
- **`options.decimals`**: - The number of decimal places to round the financial
  values (payment, interest, capital, balance) to. Defaults to `2`.
- **`options.annualCompounding`**: - The number of times the mortgage interest
  should be compounded per year. Defaults to `12` (monthly compounding). Set to
  `2` for semi-annual compounding as is standard in Canada.
- **`options.debug`**: - If `true`, enables debug logging to the console,
  providing additional insights into the calculation process. Defaults to
  `false`.

### Returns

An array of objects, where each object represents a single mortgage payment and
contains:

- `paymentId`: A 0-based index for the payment.
- `payment`: The total amount of the payment (fixed for the term).
- `interest`: The portion that goes towards interest (varies with rate changes).
- `capital`: The portion that goes towards the principal (can be negative during
  negative amortization).
- `balance`: The remaining mortgage balance after the payment (can increase if
  interest exceeds payment).
- `amountPaid`: The cumulative total amount paid so far.
- `interestPaid`: The cumulative total interest paid so far.
- `capitalPaid`: The cumulative total capital reimbursed so far (can be
  negative).
- `rate`: The annual interest rate in effect for this payment.
- `id` (optional): The ID provided in `options.id`.

### Throws

- **`Error`**: If the `amortizationPeriod` is less than the `term`, as this is
  an invalid mortgage configuration.
- **`Error`**: If the `rates` array does not contain enough rates for all
  payments in the term.

### Examples

```ts
// VRM: Payment stays fixed, but rate changes affect interest/principal split
// If rates rise high enough, balance can increase (negative amortization)
const rates = [
  ...Array(12).fill(6), // Months 0-11 at 6%
  ...Array(12).fill(5.5), // Months 12-23 at 5.5% (more goes to principal)
  ...Array(36).fill(7.5), // Months 24-59 at 7.5% (might trigger negative amortization)
];
const payments = variableMortgagePayments(250_000, rates, 5, 25);
console.log(payments[0]); // Payment amount set based on initial rate
console.log(payments[12]); // Same payment, but less interest (rate dropped)
console.log(payments[24]); // Same payment, but more interest (rate increased)
```
