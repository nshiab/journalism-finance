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

## decodeMonteCarloMonthlyIterations

Decodes a columnar `monthlyIterations` result back into a flat object array.

**⚠️ Memory Warning:** This function can allocate millions of small objects
during large simulations. Proceed with caution or use pagination/UI
virtualization if rendering these arrays to the DOM.

Keys are `"category|group|variable"`. Each `Float64Array` has size
`iterations × months`. Access: `data[key][iteration * cols + monthIndex]`.

Records where `amount === 0` are omitted from the output, matching the
zero-filtering applied by the `onRecord` callback during data collection.

### Signature

```typescript
function decodeMonteCarloMonthlyIterations(
  c: ColumnarResult,
): {
  iteration: number;
  category: string;
  group: string;
  variable: string;
  monthIndex: number;
  amount: number;
}[];
```

## decodeMonteCarloMonthlyQuantiles

Decodes a columnar `monthlyQuantiles` result back into a flat record array.

Keys are `"category|group|variable"`. Layout:
`data[key][qIdx * cols + monthIndex]` where `rows` = number of quantile levels
and `cols` = number of months.

### Signature

```typescript
function decodeMonteCarloMonthlyQuantiles(
  c: ColumnarResult,
  quantiles: number[],
): {
  category: string;
  group: string;
  variable: string;
  monthIndex: number;
  quantile: number;
  value: number;
}[];
```

### Parameters

- **`c`**: The `ColumnarResult` returned as `monthlyQuantiles` by
  `simulateRentVsBuyMonteCarlo`.
- **`quantiles`**: The same quantile levels passed to `options.monthlyQuantiles`
  (e.g. `[0, 0.5, 1]`).

## decodeMonteCarloValues

Decodes a columnar `values` result back into the original object-array shape.

Keys are variable names. Each `Float64Array` has size `iterations × months`.

### Signature

```typescript
function decodeMonteCarloValues(
  c: ColumnarResult,
): { iteration: number; variable: string; value: number; monthIndex: number }[];
```

## decodeMonteCarloWinners

Decodes a columnar `winners` result back into the original object-array shape.

`category` bytes map to category names via `WINNER_CATEGORIES` (0 = "renter", 1
= "buyerFixed", 2 = "buyerVariable"). Records are returned in iteration order
(row 0 = iteration 0).

### Signature

```typescript
function decodeMonteCarloWinners(
  w: WinnersColumnar,
): {
  iteration: number;
  monthIndex: number;
  amount: number;
  category: "renter" | "buyerFixed" | "buyerVariable";
}[];
```

## getIncomeTax

Calculates a comprehensive breakdown of Canadian federal and provincial income
taxes, including capital gains.

Calculation Engine Methodology:

**1. Mandatory Payroll Deductions:**

- Calculates Tier 1 CPP/QPP base contribution (claimed as a Non-Refundable Tax
  Credit (NRTC)).
- Calculates Tier 1 CPP/QPP enhanced contribution (claimed as a tax deduction).
- Calculates Tier 2 CPP2/QPP2 based on the Yearly Additional Maximum Pensionable
  Earnings (YAMPE) (claimed as a tax deduction).
- Calculates EI (and QPIP for Quebec residents) up to their respective annual
  maximum insurable earnings.

**2. Federal Tax & Non-Refundable Tax Credits (NRTCs):**

- Calculates gross federal tax using progressive federal tax brackets.
- Determines the Federal Basic Personal Amount (BPA), applying a linear
  phase-out for high earners.
- Calculates the Canada Employment Amount (CEA) against employment income up to
  the annual maximum.
- Aggregates the federal NRTC base (BPA + Base CPP/QPP + EI + QPIP + CEA) and
  converts it to a credit amount, accounting for the 15% top-up credit rate for
  amounts above the first bracket threshold.
- Applies the Federal Abatement exclusively for Quebec residents.

**3. Provincial Tax & NRTCs:**

- Calculates gross provincial tax using the specific province's progressive tax
  brackets.
- **Quebec-Specific:** Applies the Deduction for Workers as an income reduction
  before tax calculation. Applies the Person Living Alone amount to the NRTC
  base (if applicable). Uses a decoupled NRTC rate.
- Retrieves the provincial BPA, executing a specific linear phase-out for
  Manitoba residents, and dynamically mirroring the federal BPA phase-out for
  Yukon residents.
- Aggregates the provincial NRTC base (Provincial BPA + Base CPP/QPP + EI + QPIP
  if in Quebec + CEA if in Yukon + Family Tax Benefit if in Manitoba).

**4. Provincial-Specific Modifiers (If Applicable):**

- **B.C. Tax Reduction:** A non-refundable credit for B.C. residents with
  low-to-moderate taxable income (subject to phase-out).
- **New Brunswick Tax Reduction:** A non-refundable credit for N.B. residents
  with low-to-moderate taxable income (subject to phase-out).
- **Newfoundland and Labrador Tax Reduction:** A non-refundable credit for N.L.
  residents with low-to-moderate taxable income (subject to phase-out).
- **Nova Scotia Tax Reduction:** A non-refundable credit for N.S. residents with
  low-to-moderate taxable income (subject to phase-out).
- **Prince Edward Island Tax Reduction:** A non-refundable credit for P.E.I.
  residents with low-to-moderate taxable income (subject to phase-out).
- **Ontario Tax Reduction (OTR) & LIFT:** Reduces or eliminates basic Ontario
  tax for low-income earners, and applies the Low-income Individuals and
  Families Tax (LIFT) Credit.
- **Ontario Surtax:** Applies a two-tier cascading surtax on net provincial tax
  in Ontario.
- **Provincial Health Premiums:** Calculates the Ontario Health Premium based on
  strict taxable income bands, and the Quebec RAMQ premium based on income
  thresholds.

**5. Capital Gains:**

- Applies a 50% inclusion rate to any provided capital gains.
- Isolates the exact tax burden associated with those capital gains by computing
  the marginal difference between a "with gains" and "without gains" tax
  profile.

### Signature

```typescript
function getIncomeTax(
  employmentIncome: number,
  province:
    | "Newfoundland and Labrador"
    | "Prince Edward Island"
    | "Nova Scotia"
    | "New Brunswick"
    | "Quebec"
    | "Ontario"
    | "Manitoba"
    | "Saskatchewan"
    | "Alberta"
    | "British Columbia"
    | "Yukon"
    | "Northwest Territories"
    | "Nunavut",
  year: 2025,
  options?: {
    quebec?: { ramq?: boolean; livingAlone?: boolean };
    capitalGains?: number;
    rrsp?: number;
  },
): {
  federalRate: number;
  provincialRate: number;
  grossFederalTax: number;
  appliedFederalCredits: number;
  federalAbatement: number;
  grossProvincialTax: number;
  appliedProvincialCredits: number;
  provincialTaxReduction: number;
  provincialSurtax: number;
  healthPremium: number;
  cppOrQppBase: number;
  cppOrQppEnhanced: number;
  cpp2OrQpp2Premium: number;
  eiPremium: number;
  qpipPremium: number;
  taxableCapitalGains: number;
  capitalGainsTax: number;
  capitalGainsRate: number;
  totalTaxAndPremiums: number;
};
```

### Parameters

- **`employmentIncome`**: The individual's total gross annual taxable employment
  income (assumes T4 income).
- **`province`**: The Canadian province or territory of residence.
- **`year`**: The specific tax year.
- **`options`**: Additional options for specific tax scenarios. Includes
  `quebec.ramq`, `quebec.livingAlone`, `capitalGains`, and `rrsp`.

### Returns

A fully itemized object containing marginal rates, gross taxes, applied
negative-valued credits, mandatory premiums, and the verified total deduction
sum. NOTE: The property `capitalGainsTax` is informational only and explicitly
shows the isolated tax burden generated by `options.capitalGains`. The base
properties (`grossFederalTax`, `grossProvincialTax`, etc.) already have the
capital gains tax baked into them. Summing all itemized deductions plus
`capitalGainsTax` will result in double-counting!

### Examples

// Basic scenario: $100k employment income in Ontario getIncomeTax(100000,
"Ontario", 2025);

// With options: $80k employment income in Quebec, with $10k RRSP contribution
and $5k Capital Gains, excluding RAMQ getIncomeTax(80000, "Quebec", 2025, {
rrsp: 10000, capitalGains: 5000, quebec: { ramq: false } });

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
    rateAdjustmentFixed: number;
    rateAdjustmentVariable: number;
    currentPostedRates: Record<number, number>;
    mortgageType: "fixed" | "variable";
  },
): number;
```

### Parameters

- **`parameters`**: The mortgage details.
- **`parameters.remainingMonthsToTerm`**: Number of months left in the current
  mortgage term.
- **`parameters.mortgageBalance`**: The current outstanding mortgage balance.
- **`parameters.postedInterestRate`**: The original posted interest rate when
  the mortgage was signed.
- **`parameters.rateAdjustmentFixed`**: The adjustment applied to the fixed
  posted interest rate (added to the posted rate).
- **`parameters.rateAdjustmentVariable`**: The adjustment applied to the
  variable posted interest rate (added to the posted rate).
- **`parameters.currentPostedRates`**: A record mapping term lengths (in years)
  to current posted interest rates.
- **`parameters.mortgageType`**: Either "fixed" or "variable".

### Returns

The calculated mortgage penalty rounded to 2 decimal places.

### Throws

- **`Error`**: Error if no current posted rate is found for the remaining term
  length.

### Examples

```ts
const penalty = getMortgagePenalty({
  remainingMonthsToTerm: 24,
  mortgageBalance: 300000,
  postedInterestRate: 0.05,
  rateAdjustmentFixed: -0.0125,
  rateAdjustmentVariable: 0,
  currentPostedRates: { 1: 0.045, 2: 0.0475, 3: 0.05, 4: 0.0525, 5: 0.055 },
  mortgageType: "fixed",
});
```

```ts
const penalty = getMortgagePenalty({
  remainingMonthsToTerm: 36,
  mortgageBalance: 250000,
  postedInterestRate: 0.06,
  rateAdjustmentFixed: 0,
  rateAdjustmentVariable: 0.0025,
  currentPostedRates: {}, // Not used for variable
  mortgageType: "variable",
});
```

## getSalesTax

Calculates the Canadian sales tax for a given amount, province, and year.

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
  year: 2025,
): {
  gst: number;
  pst: number;
  hst: number;
  totalTax: number;
  totalAmount: number;
};
```

### Parameters

- **`amount`**: The base amount before tax.
- **`province`**: The province or territory.
- **`year`**: The tax year.

### Returns

An object containing the breakdown of taxes and the total amount.

### Examples

```ts
const salesTax = getSalesTax(100, "Quebec", 2025);
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

- **`symbol`**: The stock symbol (ticker) for which to fetch data (e.g., 'AAPL'
  for Apple Inc., '^GSPTSE' for S&P/TSX Composite Index).
- **`startDate`**: The start date for the data range (inclusive). Data will be
  fetched from this date onwards.
- **`endDate`**: The end date for the data range (inclusive). Data will be
  fetched up to this date.
- **`variable`**: The specific financial variable to retrieve. Can be one of: -
  `"open"`: The opening price for the period. - `"high"`: The highest price for
  the period. - `"low"`: The lowest price for the period. - `"close"`: The
  closing price for the period. - `"adjclose"`: The adjusted closing price,
  accounting for dividends and stock splits. - `"volume"`: The trading volume
  for the period.
- **`interval`**: The time interval for the data points. Can be one of: -
  `"1d"`: Daily data. - `"1h"`: Hourly data. - `"1m"`: Minute-by-minute data.
- **`useBrowser`**: If true, the function will use Playwright to fetch the data.
  This can be useful when facing rate limiting issues with the traditional
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

- **`purchasePrice`**: The total price of the property being purchased.
- **`downPayment`**: The amount of money paid upfront by the buyer towards the
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

- **`annualIncome`**: The borrower's gross annual income.
- **`downPayment`**: The amount of money the borrower is putting down as a down
  payment.
- **`rate`**: The current mortgage interest rate (e.g., 5.25 for 5.25%).
- **`options`**: Additional options to fine-tune the calculation:
- **`options.monthlyDebtPayment`**: The borrower's total monthly payments for
  other debts (e.g., car loans, credit cards). Defaults to `0`.
- **`options.monthlyHeating`**: The estimated monthly heating costs for the
  property. Defaults to `175` (a common estimate, e.g., by Royal Bank of
  Canada).
- **`options.monthlyTax`**: The estimated monthly property tax. Defaults to
  `1.5%` of the purchase price annually, divided by 12 (a common estimate, e.g.,
  by Royal Bank of Canada).
- **`options.monthlyCondoFees`**: The estimated monthly condo fees, if
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

- **`mortgageAmount`**: The total amount of the mortgage loan.
- **`rate`**: The annual interest rate of the mortgage (e.g., `6.00` for 6.00%).
- **`paymentFrequency`**: The frequency at which mortgage payments are made.
  Supported values are: `"weekly"`, `"biWeekly"`, `"monthly"`, `"semiMonthly"`,
  `"acceleratedWeekly"`, `"acceleratedBiWeekly"`.
- **`term`**: The term of the mortgage in years. This is the length of the
  current mortgage contract.
- **`amortizationPeriod`**: The total amortization period of the mortgage in
  years. This is the total time it will take to pay off the mortgage.
- **`options`**: Additional options for customizing the mortgage calculation and
  output.
- **`options.id`**: An optional string ID to be added to each payment object in
  the returned array. Useful for tracking payments related to a specific
  mortgage.
- **`options.decimals`**: The number of decimal places to round the financial
  values (payment, interest, capital, balance) to. Defaults to `2`.
- **`options.annualCompounding`**: The number of times the mortgage interest
  should be compounded per year. Defaults to `2` (semi-annual compounding, as is
  standard in Canada).
- **`options.debug`**: If `true`, enables debug logging to the console,
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
    annualInvestmentFeeRate: number;
    couple: boolean;
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
      fixedRateAdjustment: number;
      variableRateAdjustment: number;
      purchaseFixedFees: number;
      startingAnnualMaintenanceCost: number;
      startingAnnualPropertyTax: number;
      startingMonthlyCondoFees: number;
      startingMonthlyInsurance: number;
      sellingFixedFees: number;
      sellingCommissionRate: number;
      floorRate: number;
    };
    values: {
      employmentIncome: number[];
      fiveYearInterestRates: number[];
      fourYearInterestRates: number[];
      threeYearInterestRates: number[];
      twoYearInterestRates: number[];
      oneYearInterestRates: number[];
      variableInterestRates: number[];
    };
    rates: {
      marketReturnRate: number[];
      rentIncrease: number[];
      ownerInsuranceIncrease: number[];
      renterInsuranceIncrease: number[];
      maintenanceIncrease: number[];
      propertyTaxIncrease: number[];
      condoFeeIncrease: number[];
      appreciationIncrease: number[];
      sellingFixedFeesIncrease: number[];
    };
  },
  options?: {
    winVariableOnly?: boolean;
    onRecord?: (
      category: string,
      group: string,
      variable: string,
      monthIndex: number,
      amount: number,
    ) => void;
    winVariable?: "balance" | "balanceAfterSelling" | "assets";
    groups?: string[];
  },
): (
  & {
    monthIndex: number;
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
        | "insurancePremium"
        | "tfsaFees"
        | "stocksFees";
      effectiveInterestRate?: number;
      postedInterestRate?: number;
      fixedRateAdjustment?: number;
      variableRateAdjustment?: number;
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
      employmentIncome?: number;
    }
    | {
      group: "saleNetGains";
      variable:
        | "stockSellingGains"
        | "tfsaSellingGains"
        | "homeSellingGains"
        | "securityDeposit";
    }
    | {
      group: "totals";
      variable:
        | "monthlyExpenses"
        | "cumulativeExpenses"
        | "monthlyGains"
        | "cumulativeGains"
        | "assets"
        | "saleCosts"
        | "saleNetGains";
    }
  )
)[];
```

### Parameters

- **`parameters`**: The input parameters for the simulation.
- **`parameters.startingYear`**: The year the simulation begins.
- **`parameters.numberOfYears`**: The duration of the simulation in years.
- **`parameters.tfsaContributions`**: Whether to prioritize TFSA contributions
  for investments (tax-free gains).
- **`parameters.annualInvestmentFeeRate`**: Annual investment fee rate (e.g. ETF
  MER or platform/advisor fee) expressed as a decimal (e.g. `0.0025` for 0.25%).
  Applied monthly to TFSA and stock portfolio balances using a multiplicative
  model — the fee is charged on the grown balance. The monthly dollar cost is
  also tracked as `tfsaFees` and `stocksFees` under `monthlyExpenses` and
  `cumulativeExpenses` in the output.
- **`parameters.couple`**: Whether to simulate investments and taxes for a
  couple doubling TFSA contribution room and splitting capital gains in 2.
  Assumes each per-month value in parameters.values.employmentIncome represents
  the per-partner income.
- **`parameters.province`**: The province used to calculate sales tax on the
  selling fixed fees and commission when selling the home.
- **`parameters.renter`**: Configuration for the renter scenario.
- **`parameters.renter.startingMonthlyRent`**: The initial monthly rent payment.
- **`parameters.renter.securityDeposit`**: The initial security deposit.
- **`parameters.renter.startingMonthlyInsurance`**: The initial monthly renter's
  insurance.
- **`parameters.buyer`**: Configuration for the buyer scenarios.
- **`parameters.buyer.downPayment`**: The down payment amount.
- **`parameters.buyer.purchasePrice`**: The purchase price of the home.
- **`parameters.buyer.fixedRateAdjustment`**: The adjustment applied to the
  posted fixed mortgage rate (added to the posted rate).
- **`parameters.buyer.variableRateAdjustment`**: The adjustment applied to the
  variable mortgage rate (added to the posted rate).
- **`parameters.buyer.purchaseFixedFees`**: Fixed fees associated with the
  purchase (e.g., notary, land transfer tax).
- **`parameters.buyer.startingAnnualMaintenanceCost`**: The initial annual
  maintenance cost.
- **`parameters.buyer.startingAnnualPropertyTax`**: The initial annual property
  tax.
- **`parameters.buyer.startingMonthlyCondoFees`**: The initial monthly condo
  fees.
- **`parameters.buyer.startingMonthlyInsurance`**: The initial monthly
  homeowner's insurance.
- **`parameters.buyer.sellingFixedFees`**: Fixed fees associated with selling
  the home (before sales tax).
- **`parameters.buyer.sellingCommissionRate`**: The real estate commission rate
  for selling the home (e.g., 0.05 for 5%).
- **`parameters.buyer.floorRate`**: The minimum interest rate (posted +
  adjustment) for mortgages.
- **`parameters.values`**: Shared absolute values over the simulation period.
  Each array should have a length of `numberOfYears * 12`.
- **`parameters.values.employmentIncome`**: Monthly employment income used for
  calculating income taxes on investment gains.
- **`parameters.values.fiveYearInterestRates`**: Monthly 5-year fixed mortgage
  interest rates.
- **`parameters.values.fourYearInterestRates`**: Monthly 4-year fixed mortgage
  interest rates.
- **`parameters.values.threeYearInterestRates`**: Monthly 3-year fixed mortgage
  interest rates.
- **`parameters.values.twoYearInterestRates`**: Monthly 2-year fixed mortgage
  interest rates.
- **`parameters.values.oneYearInterestRates`**: Monthly 1-year fixed mortgage
  interest rates.
- **`parameters.values.variableInterestRates`**: Monthly variable mortgage
  interest rates.
- **`parameters.rates`**: Annualized growth rates over the simulation period.
  Each array should have a length of `numberOfYears * 12`. These can be
  historical or projected rates.
- **`parameters.rates.marketReturnRate`**: Monthly market return rates.
- **`parameters.rates.rentIncrease`**: Monthly rent increase rates.
- **`parameters.rates.ownerInsuranceIncrease`**: Monthly homeowner's insurance
  increase rates.
- **`parameters.rates.renterInsuranceIncrease`**: Monthly renter's insurance
  increase rates.
- **`parameters.rates.maintenanceIncrease`**: Monthly maintenance cost increase
  rates.
- **`parameters.rates.propertyTaxIncrease`**: Monthly property tax increase
  rates.
- **`parameters.rates.condoFeeIncrease`**: Monthly condo fee increase rates.
- **`parameters.rates.appreciationIncrease`**: Monthly home appreciation rates.
- **`parameters.rates.sellingFixedFeesIncrease`**: Monthly increase rates for
  selling fixed fees.
- **`options`**: Additional simulation options.
- **`options.winVariableOnly`**: If `true`, the returned results will only
  include the final `winVariable` record for each scenario (one entry per
  scenario at the final month). Requires `winVariable` to be set — throws if
  `winVariableOnly` is `true` but `winVariable` is not provided. Defaults to
  `false`.
- **`options.winVariable`**: The variable used to identify the winner when
  extracting the final record. Use `"balanceAfterSelling"` for net balance after
  a simulated sale, `"balance"` for cumulative balance, or `"assets"` for total
  raw assets.
- **`options.onRecord`**: Internal callback used by
  `simulateRentVsBuyMonteCarlo` when `details.iterations` or `details.quantiles`
  is enabled. When provided, numeric values are streamed directly to the
  accumulator instead of being wrapped in result objects, avoiding the
  per-record heap allocation cost. At the final month, one winner record (the
  `winVariable` entry) per category is still pushed to the results array for
  winner extraction.
- **`options.groups`**: Internal filter used by `simulateRentVsBuyMonteCarlo`
  via `details.iterationsGroups`. Restricts which groups are emitted by
  `onRecord` and pushed to results.

### Returns

A detailed array of monthly results for each scenario (renter, buyerFixed,
buyerVariable). Each object in the array represents a specific data point for a
given month, categorized by:

- `monthlyExpenses` or `cumulativeExpenses`:
- `rent`, `insurance`, `securityDeposit` (for Renter)
- `mortgageCapital`, `mortgageInterests`, `maintenance`, `propertyTax`,
  `condoFees`, `downPayment`, `purchaseFixedFees`, `insurancePremium` (for
  Buyers)
- `tfsaFees`, `stocksFees` (for all scenarios)
- `monthlyGains` or `cumulativeGains`:
- `tfsaGains`, `tfsaContribution`, `stocksGains`, `newStocks` (for all
  scenarios)
- `homeEquityGains` (for Buyers)
- `assets`:
- `tfsa`, `stocks` (for all scenarios)
- `securityDeposit` (for Renter)
- `homeEquity` (for Buyers)
- `summary`: `balance` (monthly net worth)
- `summaryCumulative`: `balance` (cumulative net worth), `balanceAfterSelling`
  (net worth after hypothetical property sale and associated taxes/fees)
- `saleCosts`: `stockTaxes` (includes `employmentIncome` used for calculation),
  `homeSellingCommission`, `homeSellingFixedFees`, `mortgagePenalty`,
  `mortgageBalance` (hypothetical costs incurred upon selling)
- `saleNetGains`: `stockSellingGains`, `tfsaSellingGains`, `homeSellingGains`,
  `securityDeposit` (hypothetical gains realized upon selling)
- `totals`: `monthlyExpenses`, `cumulativeExpenses`, `monthlyGains`,
  `cumulativeGains`, `assets`, `saleCosts`, `saleNetGains` (sum of all variables
  in each respective group; always emitted even when zero)

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
  appreciationIncrease: new Array(120).fill(0.003),
  sellingFixedFeesIncrease: new Array(120).fill(0.002),
};

const values = {
  employmentIncome: new Array(120).fill(75000),
  fiveYearInterestRates: new Array(120).fill(0.05),
  fourYearInterestRates: new Array(120).fill(0.05),
  threeYearInterestRates: new Array(120).fill(0.05),
  twoYearInterestRates: new Array(120).fill(0.05),
  oneYearInterestRates: new Array(120).fill(0.05),
  variableInterestRates: new Array(120).fill(0.06),
};

const results = simulateRentVsBuy({
  startingYear: 2024,
  numberOfYears: 10,
  tfsaContributions: true,
  annualInvestmentFeeRate: 0,
  couple: false,
  province: "Ontario",
  renter: {
    startingMonthlyRent: 2000,
    securityDeposit: 2000,
    startingMonthlyInsurance: 30,
  },
  buyer: {
    downPayment: 100000,
    purchasePrice: 500000,
    fixedRateAdjustment: -0.015,
    variableRateAdjustment: -0.005,
    purchaseFixedFees: 5000,
    startingAnnualMaintenanceCost: 2000,
    startingAnnualPropertyTax: 3000,
    startingMonthlyCondoFees: 300,
    startingMonthlyInsurance: 100,
    sellingFixedFees: 2000,
    sellingCommissionRate: 0.05,
    floorRate: 0.01,
  },
  values,
  rates,
}, { winVariableOnly: true, winVariable: "balanceAfterSelling" });
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
  parameters: SimParams,
  options?: BaseOptions,
): ColumnarReturn;
```

### Parameters

- **`parameters`**: The input parameters for the Monte Carlo simulation.
- **`parameters.iterations`**: The number of simulation iterations to run.
- **`parameters.winVariable`**: The variable used to determine the winner of
  each iteration. Use `"balanceAfterSelling"` for the net balance after
  simulated sale of all assets, `"balance"` for the cumulative balance before
  any sale simulation, or `"assets"` for the total raw asset value (TFSA +
  stocks + home equity + security deposit).
- **`parameters.startingYear`**: The year the simulation begins.
- **`parameters.numberOfYears`**: The duration of each simulation in years.
- **`parameters.tfsaContributions`**: Whether to prioritize TFSA contributions
  for investments (tax-free gains).
- **`parameters.annualInvestmentFeeRate`**: Annual investment fee rate (e.g. ETF
  MER or platform/advisor fee) expressed as a decimal (e.g. `0.0025` for 0.25%).
  Applied monthly to TFSA and stock portfolio balances using a multiplicative
  model — the fee is charged on the grown balance. The monthly dollar cost is
  also tracked as `tfsaFees` and `stocksFees` under `monthlyExpenses` and
  `cumulativeExpenses` in the output.
- **`parameters.couple`**: Whether to simulate investments and taxes for a
  couple doubling TFSA contribution room and splitting capital gains in 2.
  Assumes the stochastic employmentIncome parameter represents the per-partner
  income.
- **`parameters.province`**: The Canadian province or territory, used for
  calculating sales taxes.
- **`parameters.renter`**: Configuration for the renter scenario.
- **`parameters.renter.securityDeposit`**: The initial security deposit or last
  month's rent (scenario-dependent).
- **`parameters.buyer`**: Configuration for the buyer scenarios.
- **`parameters.buyer.downPayment`**: The total down payment amount paid at the
  start.
- **`parameters.buyer.fixedRateAdjustment`**: The adjustment applied to the
  posted fixed mortgage rate (added to the posted rate).
- **`parameters.buyer.variableRateAdjustment`**: The adjustment applied to the
  variable mortgage rate (added to the posted rate).
- **`parameters.buyer.purchaseFixedFees`**: One-time costs at purchase (notary,
  land transfer tax, etc.).
- **`parameters.buyer.sellingCommissionRate`**: The commission rate paid to real
  estate agents upon sale (e.g., `0.05` for 5%).
- **`parameters.buyer.floorRate`**: The minimum interest rate (posted +
  adjustment) for mortgages.
- **`parameters.stochasticParameters`**: Parameters for the stochastic models.
  For all parameters (market return rate, dollar amounts, interest rates),
  use: - `initialValue`: The starting value (e.g., `0.07` for 7% market return,
  `1500` for $1,500 monthly rent, or `0.05` for a 5% interest rate). For
  **Geometric Brownian Motion (GBM)** models (income, market, rent, expenses,
  appreciation): - `mu`: The drift or expected annual growth rate. - `sigma`:
  The annual volatility. For **Cox-Ingersoll-Ross (CIR)** models (interest
  rates): - `a`: Speed of mean reversion. - `b`: Long-term mean. - `sigma`:
  Annual volatility.
- **`parameters.stochasticParameters.employmentIncome`**: Employment income
  trajectory (GBM).
- **`parameters.stochasticParameters.market`**: Market return rates for savings
  (GBM).
- **`parameters.stochasticParameters.rent`**: Rent increase rates (GBM).
- **`parameters.stochasticParameters.ownerInsurance`**: Homeowner's insurance
  increase rates (GBM).
- **`parameters.stochasticParameters.renterInsurance`**: Renter's insurance
  increase rates (GBM).
- **`parameters.stochasticParameters.maintenance`**: Maintenance cost increase
  rates (GBM).
- **`parameters.stochasticParameters.propertyTax`**: Property tax increase rates
  (GBM).
- **`parameters.stochasticParameters.condoFee`**: Condo fee increase rates
  (GBM).
- **`parameters.stochasticParameters.appreciation`**: Home value appreciation
  rates (GBM).
- **`parameters.stochasticParameters.sellingFixedFees`**: Selling fixed fees
  increase rates (GBM).
- **`parameters.stochasticParameters.fiveYearInterestRates`**: 5-year fixed
  interest rates (CIR).
- **`parameters.stochasticParameters.fourYearInterestRates`**: 4-year fixed
  interest rates (CIR).
- **`parameters.stochasticParameters.threeYearInterestRates`**: 3-year fixed
  interest rates (CIR).
- **`parameters.stochasticParameters.twoYearInterestRates`**: 2-year fixed
  interest rates (CIR).
- **`parameters.stochasticParameters.oneYearInterestRates`**: 1-year fixed
  interest rates (CIR).
- **`parameters.stochasticParameters.variableInterestRates`**: Variable interest
  rates (CIR).
- **`options`**: Additional simulation options.
- **`options.verbose`**: If `true`, logs the current iteration number to the
  console at the frequency set by `verboseStep`. Also logs the total elapsed
  time upon completion via `prettyDuration`. Useful for long-running
  simulations.
- **`options.verboseStep`**: The frequency of progress logging. For example,
  setting this to `50` will log progress every 50 iterations. Defaults to `1`.
- **`options.values`**: If `true`, the function will capture and return detailed
  monthly financial data (such as asset balances and net gains) for every
  iteration of the simulation. Be cautious with high iteration counts as this
  can consume significant memory.
- **`options.details`**: When provided, enables detailed monthly data
  collection. Both sub-options share the same internal column-major buffer, so
  enabling both together is more memory-efficient than the sum of their
  individual costs.
- **`options.details.iterations`**: If `true`, captures and returns the raw
  monthly financial data for every variable, group, and category for each
  individual iteration. Requires `details.iterationsGroups` to be set and
  non-empty — throws otherwise. Each record includes `iteration` (0-based
  index), `category`, `group`, `variable`, `monthIndex`, and `amount`. Useful
  for custom aggregations or visualization of individual paths. Be aware that
  this can produce a very large number of records (iterations × months ×
  variables × 3 categories), so use `iterationsGroups` to limit scope.
- **`options.details.quantiles`**: When provided, pre-computes the specified
  quantile levels (e.g. `[0, 0.5, 1]` for min/median/max) across all iterations
  for every variable/group/category/month combination. Layout:
  `data[key][qIdx * cols + monthIndex]`. Decode with
  `decodeMonteCarloMonthlyQuantiles`.
- **`options.details.iterationsGroups`**: Required when `details.iterations` is
  `true`. Restricts which groups are included in the `monthlyIterations` output
  (e.g. `["assets", "summaryCumulative"]`), reducing memory usage. Also filters
  the shared column-major buffer used by `details.quantiles`.

### Returns

An object with all large arrays in columnar format (flat `Float64Array`
matrices, transferable via `postMessage`). Use `decodeMonteCarloWinners`,
`decodeMonteCarloValues`, `decodeMonteCarloMonthlyIterations`, and
`decodeMonteCarloMonthlyQuantiles` from `@nshiab/journalism-finance` to restore
object-array shapes.

- `winners`: A `WinnersColumnar` with `monthIndex`, `amount` (`Float64Array`)
  and `category` (`Uint8Array`) indicating which scenario won each iteration.
  Decode with `decodeMonteCarloWinners`.
- `values`: A `ColumnarResult` with stochastic path values per iteration
  (enabled with `options.values`). Decode with `decodeMonteCarloValues`.
- `details.monthlyIterations`: A `ColumnarResult` with raw monthly records per
  iteration (enabled with `options.details.iterations`). Decode with
  `decodeMonteCarloMonthlyIterations`.
- `details.monthlyQuantiles`: A `ColumnarResult` with pre-computed quantile
  summaries (enabled with `options.details.quantiles`). Decode with
  `decodeMonteCarloMonthlyQuantiles`.

### Examples

```ts
const results = simulateRentVsBuyMonteCarlo({
  iterations: 1000,
  winVariable: "balanceAfterSelling",
  startingYear: 2026,
  numberOfYears: 25,
  tfsaContributions: true,
  annualInvestmentFeeRate: 0.0025,
  couple: false,
  province: "Ontario",
  renter: {
    securityDeposit: 1500,
  },
  buyer: {
    downPayment: 50000,
    fixedRateAdjustment: -0.015,
    variableRateAdjustment: -0.005,
    purchaseFixedFees: 5000,
    sellingCommissionRate: 0.05,
    floorRate: 0.01,
  },
  stochasticParameters: {
    employmentIncome: { initialValue: 80000, mu: 0.03, sigma: 0.05 },
    market: { initialValue: 0.07, mu: 0.07, sigma: 0.15 },
    rent: { initialValue: 1500, mu: 0.03, sigma: 0.02 },
    ownerInsurance: { initialValue: 120, mu: 0.03, sigma: 0.02 },
    renterInsurance: { initialValue: 30, mu: 0.03, sigma: 0.02 },
    maintenance: { initialValue: 200, mu: 0.03, sigma: 0.02 },
    propertyTax: { initialValue: 300, mu: 0.03, sigma: 0.02 },
    condoFee: { initialValue: 300, mu: 0.03, sigma: 0.02 },
    appreciation: { initialValue: 500000, mu: 0.04, sigma: 0.1 },
    sellingFixedFees: { initialValue: 2000, mu: 0.02, sigma: 0.01 },
    fiveYearInterestRates: { initialValue: 0.05, a: 0.2, b: 0.05, sigma: 0.02 },
    fourYearInterestRates: { initialValue: 0.05, a: 0.2, b: 0.05, sigma: 0.02 },
    threeYearInterestRates: {
      initialValue: 0.05,
      a: 0.2,
      b: 0.05,
      sigma: 0.02,
    },
    twoYearInterestRates: { initialValue: 0.05, a: 0.2, b: 0.05, sigma: 0.02 },
    oneYearInterestRates: { initialValue: 0.05, a: 0.2, b: 0.05, sigma: 0.02 },
    variableInterestRates: { initialValue: 0.06, a: 0.2, b: 0.06, sigma: 0.02 },
  },
});
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

- **`mortgageAmount`**: The total amount of the mortgage loan.
- **`rates`**: An array of annual interest rates (e.g.,
  `[6.00, 6.00, 5.50, 5.50, ...]` for rates in percentages). The array must
  contain at least as many rates as there are payments in the term. Each element
  corresponds to the rate for that payment period (0-based index).
- **`term`**: The term of the mortgage in years. This is the length of the
  current mortgage contract.
- **`amortizationPeriod`**: The total amortization period of the mortgage in
  years. This is the total time it will take to pay off the mortgage.
- **`options`**: Additional options for customizing the mortgage calculation and
  output.
- **`options.id`**: An optional string ID to be added to each payment object in
  the returned array. Useful for tracking payments related to a specific
  mortgage.
- **`options.decimals`**: The number of decimal places to round the financial
  values (payment, interest, capital, balance) to. Defaults to `2`.
- **`options.annualCompounding`**: The number of times the mortgage interest
  should be compounded per year. Defaults to `12` (monthly compounding). Set to
  `2` for semi-annual compounding as is standard in Canada.
- **`options.debug`**: If `true`, enables debug logging to the console,
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
