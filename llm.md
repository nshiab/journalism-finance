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
  mortageAmount: number,
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

- **`mortageAmount`**: - The total amount of the mortgage loan.
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
