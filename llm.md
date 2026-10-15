**Journalism Finance v2.0.0**

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

Requires **Node.js 24.21.0 or later**. Use `import`
and set `"type": "module"` in your project's `package.json`.

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

Financial calculations and data fetching.

## Finance

### adjustToInflation()

> **adjustToInflation**(`amount`, `amountCPI`, `targetCPI`, `options?`): `number`

Adjusts a monetary amount for inflation using the Consumer Price Index (CPI).

#### Parameters

##### amount

`number`

The initial amount of money to be adjusted.

##### amountCPI

`number`

The Consumer Price Index (CPI) corresponding to the period of the `amount`.

##### targetCPI

`number`

The Consumer Price Index (CPI) for the period to which the amount is being adjusted.

##### options?

Optional settings for the calculation.

###### decimals?

`number`

The number of decimal places to which the resulting adjusted amount should be rounded. If not specified, the result will not be rounded.

#### Returns

`number`

#### Throws

If either CPI value is not a positive finite number.

#### Examples

```ts
// Basic usage: Adjusting $100 from a time when the CPI was 120 to a time when the CPI is 150.
const adjustedValue = adjustToInflation(100, 120, 150);
console.log(adjustedValue); // Expected output: 125
```

```ts
// With rounding to two decimal places
const adjustedValueRounded = adjustToInflation(100, 120, 150.5, { decimals: 2 });
console.log(adjustedValueRounded); // Expected output: 125.42
```

```ts
// Calculating the value of a 1990 salary in 2023 terms
const salary1990 = 45000;
const cpi1990 = 60.5; // Hypothetical CPI for 1990
const cpi2023 = 135.2; // Hypothetical CPI for 2023
const adjustedSalary = adjustToInflation(salary1990, cpi1990, cpi2023, { decimals: 0 });
console.log(`A $45,000 salary in 1990 is equivalent to approximately ${adjustedSalary} in 2023.`);
// Expected output: "A $45,000 salary in 1990 is equivalent to approximately $100149 in 2023."
```

***

### getIncomeTax()

> **getIncomeTax**(`employmentIncome`, `province`, `year`, `options?`): `object`

Calculates a comprehensive breakdown of Canadian federal and provincial income taxes, including capital gains.

Calculation Engine Methodology:

**1. Mandatory Payroll Deductions:**
- Calculates Tier 1 CPP/QPP base contribution (claimed as a Non-Refundable Tax Credit (NRTC)).
- Calculates Tier 1 CPP/QPP enhanced contribution (claimed as a tax deduction).
- Calculates Tier 2 CPP2/QPP2 based on the Yearly Additional Maximum Pensionable Earnings (YAMPE) (claimed as a tax deduction).
- Calculates EI (and QPIP for Quebec residents) up to their respective annual maximum insurable earnings.

**2. Federal Tax & Non-Refundable Tax Credits (NRTCs):**
- Calculates gross federal tax using progressive federal tax brackets.
- Determines the Federal Basic Personal Amount (BPA), applying a linear phase-out for high earners.
- Calculates the Canada Employment Amount (CEA) against employment income up to the annual maximum.
- Aggregates the federal NRTC base (BPA + Base CPP/QPP + EI + QPIP + CEA) and converts it to a credit amount, accounting for the 15% top-up credit rate for amounts above the first bracket threshold.
- Applies the Federal Abatement exclusively for Quebec residents.

**3. Provincial Tax & NRTCs:**
- Calculates gross provincial tax using the specific province's progressive tax brackets.
- **Quebec-Specific:** Applies the Deduction for Workers as an income reduction before tax calculation. Applies the Person Living Alone amount to the NRTC base (if applicable). Uses a decoupled NRTC rate.
- Retrieves the provincial BPA, executing a specific linear phase-out for Manitoba residents, and dynamically mirroring the federal BPA phase-out for Yukon residents.
- Aggregates the provincial NRTC base (Provincial BPA + Base CPP/QPP + EI + QPIP if in Quebec + CEA if in Yukon + Family Tax Benefit if in Manitoba).

**4. Provincial-Specific Modifiers (If Applicable):**
- **B.C. Tax Reduction:** A non-refundable credit for B.C. residents with low-to-moderate taxable income (subject to phase-out).
- **New Brunswick Tax Reduction:** A non-refundable credit for N.B. residents with low-to-moderate taxable income (subject to phase-out).
- **Newfoundland and Labrador Tax Reduction:** A non-refundable credit for N.L. residents with low-to-moderate taxable income (subject to phase-out).
- **Nova Scotia Tax Reduction:** A non-refundable credit for N.S. residents with low-to-moderate taxable income (subject to phase-out).
- **Prince Edward Island Tax Reduction:** A non-refundable credit for P.E.I. residents with low-to-moderate taxable income (subject to phase-out).
- **Ontario Tax Reduction (OTR) & LIFT:** Reduces or eliminates basic Ontario tax for low-income earners, and applies the Low-income Individuals and Families Tax (LIFT) Credit.
- **Ontario Surtax:** Applies a two-tier cascading surtax on net provincial tax in Ontario.
- **Provincial Health Premiums:** Calculates the Ontario Health Premium based on strict taxable income bands, and the Quebec RAMQ premium based on income thresholds.

**5. Capital Gains:**
- Applies a 50% inclusion rate to any provided capital gains.
- Isolates the exact tax burden associated with those capital gains by computing the marginal difference between a "with gains" and "without gains" tax profile.

#### Parameters

##### employmentIncome

`number`

The individual's total gross annual taxable employment income (assumes T4 income).

##### province

`"Newfoundland and Labrador"` \| `"Prince Edward Island"` \| `"Nova Scotia"` \| `"New Brunswick"` \| `"Quebec"` \| `"Ontario"` \| `"Manitoba"` \| `"Saskatchewan"` \| `"Alberta"` \| `"British Columbia"` \| `"Yukon"` \| `"Northwest Territories"` \| `"Nunavut"`

The Canadian province or territory of residence.

##### year

`2025`

The specific tax year.

##### options?

Additional options for specific tax scenarios. Includes `quebec.ramq`, `quebec.livingAlone`, `capitalGains`, and `rrsp`.

###### capitalGains?

`number`

###### quebec?

\{ `livingAlone?`: `boolean`; `ramq?`: `boolean`; \}

###### quebec.livingAlone?

`boolean`

###### quebec.ramq?

`boolean`

###### rrsp?

`number`

#### Returns

`object`

A fully itemized object containing marginal rates, gross taxes, applied negative-valued credits, mandatory premiums, and the verified total deduction sum.
NOTE: The property `capitalGainsTax` is informational only and explicitly shows the isolated tax burden generated by `options.capitalGains`. The base properties (`grossFederalTax`, `grossProvincialTax`, etc.) already have the capital gains tax baked into them. Summing all itemized deductions plus `capitalGainsTax` will result in double-counting!

##### appliedFederalCredits

> **appliedFederalCredits**: `number`

##### appliedProvincialCredits

> **appliedProvincialCredits**: `number`

##### capitalGainsRate

> **capitalGainsRate**: `number`

##### capitalGainsTax

> **capitalGainsTax**: `number`

##### cpp2OrQpp2Premium

> **cpp2OrQpp2Premium**: `number`

##### cppOrQppBase

> **cppOrQppBase**: `number`

##### cppOrQppEnhanced

> **cppOrQppEnhanced**: `number`

##### eiPremium

> **eiPremium**: `number`

##### federalAbatement

> **federalAbatement**: `number`

##### federalRate

> **federalRate**: `number`

##### grossFederalTax

> **grossFederalTax**: `number`

##### grossProvincialTax

> **grossProvincialTax**: `number`

##### healthPremium

> **healthPremium**: `number`

##### provincialRate

> **provincialRate**: `number`

##### provincialSurtax

> **provincialSurtax**: `number`

##### provincialTaxReduction

> **provincialTaxReduction**: `number`

##### qpipPremium

> **qpipPremium**: `number`

##### taxableCapitalGains

> **taxableCapitalGains**: `number`

##### totalTaxAndPremiums

> **totalTaxAndPremiums**: `number`

#### Examples

```ts
// Basic scenario: $100k employment income in Ontario
getIncomeTax(100000, "Ontario", 2025);
```

```ts
// With options: $80k employment income in Quebec, with $10k RRSP contribution and $5k Capital Gains, excluding RAMQ
getIncomeTax(80000, "Quebec", 2025, {
  rrsp: 10000,
  capitalGains: 5000,
  quebec: { ramq: false }
});
```

***

### getLandTransferTax()

> **getLandTransferTax**(`city`, `propertyValue`, `year`, `firstTimeOwner?`): `number`

Calculates the standard Land Transfer Tax (or equivalent registration fee)
for a given city and property value based on 2026 tax frameworks.

**Rebate Limitations and Exclusions:**
The `firstTimeOwner` parameter applies structural, point-of-sale land transfer tax
rebates assuming the buyer meets all idealized programmatic criteria (e.g., absolute
zero global ownership history, Canadian citizenship/PR, and continuous provincial residency).

The following rebates and subsidies are intentionally excluded from this calculation:
- **Nova Scotia:** The First-Time Home Buyers Rebate is excluded because it is restricted
exclusively to a refund on the provincial portion of the HST for *newly built* properties,
not the 1.5% municipal Deed Transfer Tax calculated here.
- **Montreal (HPAP) & Quebec City (Programme Accès Famille):** Excluded because they operate
as localized financial grants or down payment assistance loans requiring specific household
compositions (e.g., dependents under 18) or new-build environmental certifications, rather
than structural tax base reductions.
- **Manitoba & Quebec (2026 Provincial):** Excluded because their respective FTHB relief
amounts are general income tax credits claimed on annual tax returns in the spring/fall,
not an upfront point-of-sale deduction from the land transfer tax.

#### Parameters

##### city

`"Quebec"` \| `"Toronto"` \| `"Montreal"` \| `"Calgary"` \| `"Ottawa"` \| `"Edmonton"` \| `"Winnipeg"` \| `"Vancouver"` \| `"Hamilton"` \| `"Halifax"` \| `"London"` \| `"Saskatoon"` \| `"Kitchener-Waterloo"` \| `"Regina"` \| `"Victoria"` \| `"Barrie"` \| `"Guelph"` \| `"Kingston"` \| `"Fredericton"` \| `"Moncton"` \| `"Saint John (NB)"` \| `"Saint John's (NL)"`

The metropolitan market.

##### propertyValue

`number`

The fair market value or purchase price of the property.

##### year

`2026`

The tax year (currently only 2026 is supported).

##### firstTimeOwner?

`boolean` = `false`

Indicates if the purchaser qualifies for strict FTHB exemptions.

#### Returns

`number`

The total calculated transaction friction cost in Canadian Dollars.

#### Example

```ts
const tax = getLandTransferTax("Toronto", 500_000, 2026, true);
console.log(tax); // 4475
```

***

### getMinimumDownPayment()

> **getMinimumDownPayment**(`purchasePrice`, `options?`): `number`

Calculates the minimum down payment required for a property purchase in Canada, based on the purchase price.

The calculation follows the Financial Consumer Agency of Canada (FCAC) rules:
- For properties $500,000 or less: 5% of the purchase price.
- For properties between $500,000 and $1.5 million: 5% of the first $500,000, plus 10% of the portion above $500,000.
- For properties $1.5 million or more: 20% of the total purchase price.

#### Parameters

##### purchasePrice

`number`

The total price of the property being purchased.

##### options?

Additional calculation options.

###### decimals?

`number`

The number of decimal places to round the result to. By default, the result is not rounded.

#### Returns

`number`

The minimum down payment amount.

#### Throws

If `purchasePrice` is negative or not finite.

#### Example

```ts
// Minimum down payment for a $400,000 home (5%)
const downPayment400k = getMinimumDownPayment(400_000);
console.log(downPayment400k); // 20000

// Minimum down payment for a $600,000 home (5% of 500k + 10% of 100k)
const downPayment600k = getMinimumDownPayment(600_000);
console.log(downPayment600k); // 35000

// Minimum down payment for a $1,600,000 home (20%)
const downPayment1600k = getMinimumDownPayment(1_600_000);
console.log(downPayment1600k); // 320000

// Round the result to two decimal places
const downPaymentWithDecimals = getMinimumDownPayment(123.456, { decimals: 2 });
console.log(downPaymentWithDecimals); // 6.17
```

Reference: https://www.canada.ca/en/financial-consumer-agency/services/mortgages/down-payment.html

***

### getYahooFinanceData()

> **getYahooFinanceData**(`symbol`, `startDate`, `endDate`, `variable`, `interval`): `Promise`\<`object`[]\>

Fetches historical prices or trading volume for a symbol from Yahoo Finance.

**Yahoo Finance notice:** This function uses an undocumented Yahoo Finance
endpoint and is not affiliated with or endorsed by Yahoo. It is provided for
educational, research, and journalistic purposes. Before using it, review
Yahoo's terms and any applicable data-provider restrictions.

#### Parameters

##### symbol

`string`

The stock or index symbol, such as `"AAPL"` or `"^GSPTSE"`.

##### startDate

`Date`

The inclusive start of the requested range.

##### endDate

`Date`

The inclusive end of the requested range. The observation
beginning at this date or time is included when available.

##### variable

`"open"` \| `"high"` \| `"low"` \| `"close"` \| `"adjclose"` \| `"volume"`

The financial variable to retrieve.

##### interval

`"1d"` \| `"1h"` \| `"1m"`

The interval between observations: daily, hourly, or every
minute.

#### Returns

`Promise`\<`object`[]\>

The available observations, with Unix timestamps in milliseconds.
Missing values reported by Yahoo are omitted.

#### Example

```ts
const prices = await getYahooFinanceData(
  "^GSPTSE",
  new Date("2025-03-01"),
  new Date("2025-03-15"),
  "adjclose",
  "1d",
);
console.log(prices);
```

#### Throws

If either date is invalid or `endDate` is before
`startDate`.

#### Throws

If Yahoo rejects the request, returns no data, or provides invalid timestamps.

#### See

 - https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html
 - https://help.yahoo.com/kb/finance/SLN2310.html

***

### mortgageInsurancePremium()

> **mortgageInsurancePremium**(`purchasePrice`, `downPayment`): `number`

Calculates the mortgage insurance premium based on the property's purchase price and the down payment amount. This function is designed to reflect the premium rates typically applied in Canada, as outlined by institutions like the Financial Consumer Agency of Canada. The calculated premium is rounded to the nearest integer.

Mortgage insurance is generally required in Canada when the down payment is less than 20% of the home's purchase price.

#### Parameters

##### purchasePrice

`number`

The total price of the property being purchased.

##### downPayment

`number`

The amount of money paid upfront by the buyer towards the purchase price.

#### Returns

`number`

The calculated mortgage insurance premium, rounded to the nearest integer. Returns `0` if the down payment is 20% or more, as insurance is typically not required in such cases.

#### Throws

If the down payment is less than the minimum required down payment in Canada.

#### Examples

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
  // Expected output: "Error: The down payment is less than the minimum required down payment..."
}
```

***

### mortgageMaxAmount()

> **mortgageMaxAmount**(`annualIncome`, `downPayment`, `rate`, `options?`): `object`

Calculates the maximum affordable property purchase price and the corresponding mortgage amount a borrower can qualify for, based on their annual income, down payment, and current mortgage interest rates. This function is designed to simulate mortgage qualification criteria, taking into account various financial factors and debt service ratios.

The calculation incorporates a stress test, where the interest rate used for qualification is the higher of the provided rate + 2% or 5.25% (a common benchmark in Canada). It also considers monthly debt payments, heating costs, property taxes, and condo fees to determine the Gross Debt Service (GDS) and Total Debt Service (TDS) ratios, which are critical in mortgage approvals.

#### Parameters

##### annualIncome

`number`

The borrower's gross annual income.

##### downPayment

`number`

The amount of money the borrower is putting down as a down payment.

##### rate

`number`

The current mortgage interest rate (e.g., 5.25 for 5.25%).

##### options?

Additional options to fine-tune the calculation:

###### monthlyCondoFees?

`number`

The estimated monthly condo fees, if applicable. Defaults to `0`.

###### monthlyDebtPayment?

`number`

The borrower's total monthly payments for other debts (e.g., car loans, credit cards). Defaults to `0`.

###### monthlyHeating?

`number`

The estimated monthly heating costs for the property. Defaults to `175` (a common estimate, e.g., by Royal Bank of Canada).

###### monthlyTax?

`number`

The estimated monthly property tax. Defaults to `1.5%` of the purchase price annually, divided by 12 (a common estimate, e.g., by Royal Bank of Canada).

#### Returns

`object`

An object containing detailed results of the mortgage affordability calculation, including:
  - `annualIncome`: The annual income provided.
  - `downPayment`: The down payment provided.
  - `rate`: The mortgage interest rate provided.
  - `rateTested`: The interest rate used for the stress test (higher of `rate + 2%` or `5.25%`).
  - `purchasePrice`: The maximum affordable property purchase price.
  - `mortgageAmount`: The maximum mortgage amount the borrower qualifies for.
  - `insurancePremium`: The calculated mortgage insurance premium (if applicable).
  - `monthlyMortgagePayment`: The estimated monthly mortgage payment.
  - `grossDebtServiceRatio`: The calculated Gross Debt Service (GDS) ratio.
  - `totalDebtServiceRatio`: The calculated Total Debt Service (TDS) ratio.
  - `reason`: The limiting factor for the maximum amount (e.g., "debt limit", "downPayment limit", "max purchase price").
  - `monthlyDebtPayment`: The monthly debt payment used in the calculation.
  - `monthlyHeating`: The monthly heating cost used in the calculation.
  - `isHeatingEstimate`: `true` if `monthlyHeating` was an estimate, `false` if provided.
  - `monthlyTax`: The monthly property tax used in the calculation.
  - `isTaxEstimate`: `true` if `monthlyTax` was an estimate, `false` if provided.
  - `monthlyCondoFees`: The monthly condo fees used in the calculation.

##### annualIncome

> **annualIncome**: `number`

##### downPayment

> **downPayment**: `number`

##### grossDebtServiceRatio

> **grossDebtServiceRatio**: `number`

##### insurancePremium

> **insurancePremium**: `number`

##### isHeatingEstimate

> **isHeatingEstimate**: `boolean`

##### isTaxEstimate

> **isTaxEstimate**: `boolean`

##### monthlyCondoFees

> **monthlyCondoFees**: `number`

##### monthlyDebtPayment

> **monthlyDebtPayment**: `number`

##### monthlyHeating

> **monthlyHeating**: `number`

##### monthlyMortgagePayment

> **monthlyMortgagePayment**: `number`

##### monthlyTax

> **monthlyTax**: `number`

##### mortgageAmount

> **mortgageAmount**: `number`

##### purchasePrice

> **purchasePrice**: `number`

##### rate

> **rate**: `number`

##### rateTested

> **rateTested**: `number`

##### reason

> **reason**: `string`

##### totalDebtServiceRatio

> **totalDebtServiceRatio**: `number`

#### Examples

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
const customExpensesResults = mortgageMaxAmount(120_000, 40_000, 4.5,
  {
    monthlyDebtPayment: 300,
    monthlyTax: 450,
    monthlyCondoFees: 200,
  },
);
console.log(customExpensesResults);
```

***

### mortgagePayments()

> **mortgagePayments**(`mortgageAmount`, `rate`, `paymentFrequency`, `term`, `amortizationPeriod`, `options?`): `object`[]

Calculates and returns a detailed schedule of fixed-rate mortgage payments. This function is designed to provide a comprehensive breakdown of each payment, including the principal and interest portions, remaining balance, and cumulative amounts paid. It adheres to Canadian mortgage regulations, which typically require semi-annual compounding, but allows for customization of the compounding frequency.

The function is flexible, supporting various payment frequencies (weekly, bi-weekly, monthly, semi-monthly, accelerated weekly, accelerated bi-weekly) and allowing for the specification of the mortgage amount, interest rate, term, and amortization period. It also includes options for rounding payment values and enabling debug logging.

#### Parameters

##### mortgageAmount

`number`

The total amount of the mortgage loan.

##### rate

`number`

The annual interest rate of the mortgage (e.g., `6.00` for 6.00%).

##### paymentFrequency

`"weekly"` \| `"biWeekly"` \| `"monthly"` \| `"semiMonthly"` \| `"acceleratedWeekly"` \| `"acceleratedBiWeekly"`

The frequency at which mortgage payments are made. Supported values are: `"weekly"`, `"biWeekly"`, `"monthly"`, `"semiMonthly"`, `"acceleratedWeekly"`, `"acceleratedBiWeekly"`.

##### term

`number`

The term of the mortgage in years. This is the length of the current mortgage contract.

##### amortizationPeriod

`number`

The total amortization period of the mortgage in years. This is the total time it will take to pay off the mortgage.

##### options?

Additional options for customizing the mortgage calculation and output.

###### annualCompounding?

`number`

The number of times the mortgage interest should be compounded per year. Defaults to `2` (semi-annual compounding, as is standard in Canada).

###### debug?

`boolean`

If `true`, enables debug logging to the console, providing additional insights into the calculation process. Defaults to `false`.

###### decimals?

`number`

The number of decimal places to round the financial values (payment, interest, capital, balance) to. Defaults to `2`.

###### id?

`string`

An optional string ID to be added to each payment object in the returned array. Useful for tracking payments related to a specific mortgage.

#### Returns

`object`[]

An array of objects, where each object represents a single mortgage payment and contains:
  - `paymentId`: A 0-based index for the payment.
  - `payment`: The total amount of the payment.
  - `interest`: The portion of the payment that goes towards interest.
  - `capital`: The portion of the payment that goes towards the principal (capital).
  - `balance`: The remaining mortgage balance after the payment.
  - `amountPaid`: The cumulative total amount paid so far.
  - `interestPaid`: The cumulative total interest paid so far.
  - `capitalPaid`: The cumulative total capital reimbursed so far.
  - `id` (optional): The ID provided in `options.id`.

#### Throws

If the `amortizationPeriod` is less than the `term`, as this is an invalid mortgage configuration.

#### Examples

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

***

### variableMortgagePayments()

> **variableMortgagePayments**(`mortgageAmount`, `rates`, `term`, `amortizationPeriod`, `options?`): `object`[]

Calculates and returns a detailed schedule of variable-rate monthly mortgage payments (VRM). This function models a Variable Rate Mortgage where the payment amount stays FIXED for the term, but rate changes affect how much goes to interest vs. principal. If rates rise too high, payments may not cover interest, causing negative amortization (balance increases).

#### Parameters

##### mortgageAmount

`number`

The total amount of the mortgage loan.

##### rates

`number`[]

An array of annual interest rates (e.g., `[6.00, 6.00, 5.50, 5.50, ...]` for rates in percentages). The array must contain at least as many rates as there are payments in the term. Each element corresponds to the rate for that payment period (0-based index).

##### term

`number`

The term of the mortgage in years. This is the length of the current mortgage contract.

##### amortizationPeriod

`number`

The total amortization period of the mortgage in years. This is the total time it will take to pay off the mortgage.

##### options?

Additional options for customizing the mortgage calculation and output.

###### annualCompounding?

`number`

The number of times the mortgage interest should be compounded per year. Defaults to `12` (monthly compounding). Set to `2` for semi-annual compounding as is standard in Canada.

###### debug?

`boolean`

If `true`, enables debug logging to the console, providing additional insights into the calculation process. Defaults to `false`.

###### decimals?

`number`

The number of decimal places to round the financial values (payment, interest, capital, balance) to. Defaults to `2`.

###### id?

`string`

An optional string ID to be added to each payment object in the returned array. Useful for tracking payments related to a specific mortgage.

#### Returns

`object`[]

An array of objects, where each object represents a single mortgage payment and contains:
  - `paymentId`: A 0-based index for the payment.
  - `payment`: The total amount of the payment (fixed for the term).
  - `interest`: The portion that goes towards interest (varies with rate changes).
  - `capital`: The portion that goes towards the principal (can be negative during negative amortization).
  - `balance`: The remaining mortgage balance after the payment (can increase if interest exceeds payment).
  - `amountPaid`: The cumulative total amount paid so far.
  - `interestPaid`: The cumulative total interest paid so far.
  - `capitalPaid`: The cumulative total capital reimbursed so far (can be negative).
  - `rate`: The annual interest rate in effect for this payment.
  - `id` (optional): The ID provided in `options.id`.

#### Throws

If the `amortizationPeriod` is less than the `term`, as this is an invalid mortgage configuration.

#### Throws

If the `rates` array does not contain enough rates for all payments in the term.

#### Example

```ts
// VRM: Payment stays fixed, but rate changes affect interest/principal split
// If rates rise high enough, balance can increase (negative amortization)
const rates = [
  ...Array(12).fill(6),    // Months 0-11 at 6%
  ...Array(12).fill(5.5),  // Months 12-23 at 5.5% (more goes to principal)
  ...Array(36).fill(7.5)   // Months 24-59 at 7.5% (might trigger negative amortization)
];
const payments = variableMortgagePayments(250_000, rates, 5, 25);
console.log(payments[0]);  // Payment amount set based on initial rate
console.log(payments[12]); // Same payment, but less interest (rate dropped)
console.log(payments[24]); // Same payment, but more interest (rate increased)
```

## Other

### decodeMonteCarloMonthlyIterations()

> **decodeMonteCarloMonthlyIterations**(`c`): `object`[]

Decodes a columnar `monthlyIterations` result back into a flat object array.

**⚠️ Memory Warning:** This function can allocate millions of small objects during large simulations.
Proceed with caution or use pagination/UI virtualization if rendering these arrays to the DOM.

Keys are `"category|group|variable"`. Each `Float64Array` has size `iterations × months`.
Access: `data[key][iteration * cols + monthIndex]`.

Records where `amount === 0` are omitted from the output, matching the zero-filtering
applied by the `onRecord` callback during data collection.

#### Parameters

##### c

###### cols

`number`

###### data

`Record`\<`string`, `Float64Array`\>

###### keys

`string`[]

###### rows

`number`

#### Returns

`object`[]

***

### decodeMonteCarloMonthlyQuantiles()

> **decodeMonteCarloMonthlyQuantiles**(`c`, `quantiles`): `object`[]

Decodes a columnar `monthlyQuantiles` result back into a flat record array.

Keys are `"category|group|variable"`. Layout: `data[key][qIdx * cols + monthIndex]`
where `rows` = number of quantile levels and `cols` = number of months.

#### Parameters

##### c

The `ColumnarResult` returned as `monthlyQuantiles` by `simulateRentVsBuyMonteCarlo`.

###### cols

`number`

###### data

`Record`\<`string`, `Float64Array`\>

###### keys

`string`[]

###### rows

`number`

##### quantiles

`number`[]

The same quantile levels passed to `options.monthlyQuantiles` (e.g. `[0, 0.5, 1]`).

#### Returns

`object`[]

***

### decodeMonteCarloValues()

> **decodeMonteCarloValues**(`c`): `object`[]

Decodes a columnar `values` result back into the original object-array shape.

Keys are variable names. Each `Float64Array` has size `iterations × months`.

#### Parameters

##### c

###### cols

`number`

###### data

`Record`\<`string`, `Float64Array`\>

###### keys

`string`[]

###### rows

`number`

#### Returns

`object`[]

***

### decodeMonteCarloWinners()

> **decodeMonteCarloWinners**(`w`): `object`[]

`category` bytes map to category names via `WINNER_CATEGORIES`
(0 = "renter", 1 = "buyerFixed", 2 = "buyerVariable").
Records are returned in iteration order (row 0 = iteration 0).

#### Parameters

##### w

###### amount

`Float64Array`

Final `amount` of the winning scenario for each iteration.

###### category

`Uint8Array`

Winning scenario category encoded as a byte.
Decode with `WINNER_CATEGORIES[category[i]]` or use `decodeMonteCarloWinners`.

###### monthIndex

`Float64Array`

Final `monthIndex` of the winning scenario for each iteration.

#### Returns

`object`[]

***

### decodeMonteCarloWinnerSnapshots()

> **decodeMonteCarloWinnerSnapshots**(`ws`): `object`[]

Decodes a `winnerSnapshots` result into a flat record array.

Each record represents one 5-year checkpoint (strictly before `numberOfYears`).
`renter`, `buyerFixed`, and `buyerVariable` are win rates strictly in the range [0.01, 0.98] (smoothed to [0.01, 0.01, 0.98] in extreme scenarios) and sum to 1.
The median fields hold the median `winVariable` amount for that category at the checkpoint.

#### Parameters

##### ws

###### buyerFixed

`Float64Array`

Fraction of iterations (strictly in the range [0.01, 0.98]) where the buyerFixed scenario
had the highest `winVariable` at this checkpoint. Win rates are clipped/smoothed to reflect
unmodeled tail risks and prevent deterministic misinterpretation (e.g., [1.0, 0.0, 0.0] becomes [0.98, 0.01, 0.01]).

###### buyerFixedMedian

`Float64Array`

###### buyerVariable

`Float64Array`

Fraction of iterations (strictly in the range [0.01, 0.98]) where the buyerVariable scenario
had the highest `winVariable` at this checkpoint. Win rates are clipped/smoothed to reflect
unmodeled tail risks and prevent deterministic misinterpretation (e.g., [1.0, 0.0, 0.0] becomes [0.98, 0.01, 0.01]).

###### buyerVariableMedian

`Float64Array`

###### renter

`Float64Array`

Fraction of iterations (strictly in the range [0.01, 0.98]) where the renter scenario
had the highest `winVariable` at this checkpoint. Win rates are clipped/smoothed to reflect
unmodeled tail risks and prevent deterministic misinterpretation (e.g., [1.0, 0.0, 0.0] becomes [0.98, 0.01, 0.01]).

###### renterMedian

`Float64Array`

Median `winVariable` amount for each category at each snapshot.

###### snapshotMonths

`number`[]

Month indices of each snapshot (e.g. `[59, 119, 179, 239, 299]` for a 25-year sim, i.e. end of years 5, 10, 15, 20, 25).

#### Returns

`object`[]

***

### getMortgagePenalty()

> **getMortgagePenalty**(`parameters`): `number`

Calculates the mortgage prepayment penalty.

For variable mortgages, the penalty is typically three months of interest.
For fixed mortgages, the penalty is usually the greater of three months of interest or the Interest Rate Differential (IRD).

#### Parameters

##### parameters

The mortgage details.

###### currentPostedRates

`Record`\<`number`, `number`\>

A record mapping term lengths (in years) to current posted interest rates.

###### mortgageBalance

`number`

The current outstanding mortgage balance.

###### mortgageType

`"fixed"` \| `"variable"`

Either "fixed" or "variable".

###### postedInterestRate

`number`

The original posted interest rate when the mortgage was signed.

###### rateAdjustmentFixed

`number`

The adjustment applied to the fixed posted interest rate (added to the posted rate).

###### rateAdjustmentVariable

`number`

The adjustment applied to the variable posted interest rate (added to the posted rate).

###### remainingMonthsToTerm

`number`

Number of months left in the current mortgage term.

#### Returns

`number`

The calculated mortgage penalty rounded to 2 decimal places.

#### Throws

Error if no current posted rate is found for the remaining term length.

#### Examples

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

***

### getRentVsBuyCholeskyMatrix()

> **getRentVsBuyCholeskyMatrix**(`data?`, `options?`): `number`[][]

Generates a Cholesky decomposition matrix from historical variable data,
formatted specifically for the `simulateRentVsBuyMonteCarlo` function.

This helper calculates the covariance matrix of the provided data arrays,
normalizes it into a correlation matrix, and computes the Cholesky decomposition,
mapping variables internally to the correct 16x16 matrix indices.

If no data object is provided, it returns the Cholesky decomposition of an
identity matrix (which results in independent, uncorrelated paths).

#### Parameters

##### data?

An object containing arrays of equal-length historical values for all 16 variables.

###### appreciation

`number`[]

###### condoFee

`number`[]

###### employmentIncome

`number`[]

###### fiveYearInterestRates

`number`[]

###### fourYearInterestRates

`number`[]

###### maintenance

`number`[]

###### market

`number`[]

###### oneYearInterestRates

`number`[]

###### ownerInsurance

`number`[]

###### propertyTax

`number`[]

###### rent

`number`[]

###### renterInsurance

`number`[]

###### sellingFixedFees

`number`[]

###### threeYearInterestRates

`number`[]

###### twoYearInterestRates

`number`[]

###### variableInterestRates

`number`[]

##### options?

Optional configuration.

###### jitter?

`number`

A tiny positive value (e.g., 1e-9) added to the diagonal of the correlation matrix to force positive-definiteness. This can be useful if the decomposition fails due to numerical precision issues.

#### Returns

`number`[][]

#### Example

```ts
// Using an identity matrix (no correlation)
const choleskyMatrixId = getRentVsBuyCholeskyMatrix();

// Using historical data to capture true economic correlations
const choleskyMatrixCorrelated = getRentVsBuyCholeskyMatrix({
  employmentIncome: [75000, 76000, 78000, ...],
  market: [0.05, 0.07, -0.02, ...],
  rent: [1500, 1550, 1600, ...],
  // ... and the remaining 13 variables
});

// Using jitter to handle numerical precision issues
const choleskyMatrixWithJitter = getRentVsBuyCholeskyMatrix(historicalData, { jitter: 1e-9 });

const results = simulateRentVsBuyMonteCarlo({
  // ... other parameters
  choleskyMatrix: choleskyMatrixCorrelated,
});
```

***

### getSalesTax()

> **getSalesTax**(`amount`, `province`, `year`): `object`

Calculates the Canadian sales tax for a given amount, province, and year.

#### Parameters

##### amount

`number`

The base amount before tax.

##### province

`"Newfoundland and Labrador"` \| `"Prince Edward Island"` \| `"Nova Scotia"` \| `"New Brunswick"` \| `"Quebec"` \| `"Ontario"` \| `"Manitoba"` \| `"Saskatchewan"` \| `"Alberta"` \| `"British Columbia"` \| `"Yukon"` \| `"Northwest Territories"` \| `"Nunavut"`

The province or territory.

##### year

`2025`

The tax year.

#### Returns

`object`

An object containing the breakdown of taxes and the total amount.

##### gst

> **gst**: `number`

##### hst

> **hst**: `number`

##### pst

> **pst**: `number`

##### totalAmount

> **totalAmount**: `number`

##### totalTax

> **totalTax**: `number`

#### Example

```ts
const salesTax = getSalesTax(100, "Quebec", 2025);
console.log(salesTax);
// { gst: 5, pst: 9.975, hst: 0, totalTax: 14.975, totalAmount: 114.975 }
```

Reference: https://www.retailcouncil.org/resources/quick-facts/sales-tax-rates-by-province/

***

### simulateRentVsBuy()

> **simulateRentVsBuy**(`parameters`, `options?`): `object` & \{ `effectiveInterestRate?`: `number`; `fixedRateAdjustment?`: `number`; `group`: `"monthlyExpenses"` \| `"cumulativeExpenses"`; `postedInterestRate?`: `number`; `variable`: `"mortgageCapital"` \| `"mortgageInterests"` \| `"rent"` \| `"insurance"` \| `"securityDeposit"` \| `"maintenance"` \| `"propertyTax"` \| `"condoFees"` \| `"downPayment"` \| `"purchaseFixedFees"` \| `"landTransferTax"` \| `"insurancePremiumTax"` \| `"tfsaFees"` \| `"stocksFees"`; `variableRateAdjustment?`: `number`; \} \| \{ `group`: `"monthlyGains"` \| `"cumulativeGains"`; `homeValue?`: `number`; `variable`: `"tfsaGains"` \| `"tfsaContribution"` \| `"stocksGains"` \| `"newStocks"` \| `"homeEquityGains"`; \} \| \{ `group`: `"assets"`; `variable`: `"securityDeposit"` \| `"tfsa"` \| `"stocks"` \| `"homeEquity"`; \} \| \{ `group`: `"summary"`; `variable`: `"balance"`; \} \| \{ `group`: `"summaryCumulative"`; `variable`: `"balance"` \| `"balanceAfterSelling"`; \} \| \{ `employmentIncome?`: `number`; `group`: `"saleCosts"`; `variable`: `"mortgageBalance"` \| `"stockTaxes"` \| `"homeSellingCommission"` \| `"homeSellingFixedFees"` \| `"mortgagePenalty"`; \} \| \{ `group`: `"saleNetGains"`; `variable`: `"securityDeposit"` \| `"stockSellingGains"` \| `"tfsaSellingGains"` \| `"homeSellingGains"`; \} \| \{ `group`: `"monthlyRecurringExpenses"`; `variable`: `"mortgageCapital"` \| `"mortgageInterests"` \| `"rent"` \| `"insurance"` \| `"maintenance"` \| `"propertyTax"` \| `"condoFees"` \| `"tfsaFees"` \| `"stocksFees"`; \} \| \{ `group`: `"monthlyNonRecurringExpenses"`; `variable`: `"securityDeposit"` \| `"downPayment"` \| `"purchaseFixedFees"` \| `"landTransferTax"` \| `"insurancePremiumTax"`; \} \| \{ `group`: `"totals"`; `variable`: `"monthlyExpenses"` \| `"cumulativeExpenses"` \| `"monthlyGains"` \| `"cumulativeGains"` \| `"assets"` \| `"saleCosts"` \| `"saleNetGains"` \| `"monthlyRecurringExpenses"` \| `"monthlyNonRecurringExpenses"`; \}[]

Simulates and compares the financial outcomes of renting versus buying a home over a specified number of years.
This comprehensive simulation accounts for various factors including mortgage payments (fixed and variable),
property taxes, maintenance costs, condo fees, insurance, rent increases, market returns on savings, and
the eventual sale of the property. Tailored for a Canadian context, it includes specific features like
tax-free TFSA contributions and standard Canadian mortgage structures.

The simulation tracks three scenarios:
1. **Renter**: Pays rent and invests the difference between their expenses and the buyer's expenses into the market.
2. **Buyer (Fixed)**: Purchases a home using a fixed-rate mortgage and invests any remaining surplus.
3. **Buyer (Variable)**: Purchases a home using a variable-rate mortgage and invests any remaining surplus.

It provides a detailed breakdown of monthly expenses, gains, assets, and a final summary including the
net balance after selling the property and paying all associated costs (taxes, legal fees, penalties).

#### Parameters

##### parameters

The input parameters for the simulation.

###### annualInvestmentFeeRate

`number`

Annual investment fee rate (e.g. ETF MER or platform/advisor fee) expressed as a decimal (e.g. `0.0025` for 0.25%). Applied monthly to TFSA and stock portfolio balances using a multiplicative model — the fee is charged on the grown balance. The monthly dollar cost is also tracked as `tfsaFees` and `stocksFees` under `monthlyExpenses` and `cumulativeExpenses` in the output.

###### buyer

\{ `downPayment`: `number`; `firstTimeOwner`: `boolean`; `fixedRateAdjustment`: `number`; `floorRate`: `number`; `investsSavings`: `boolean`; `purchaseFixedFees`: `number`; `purchasePrice`: `number`; `sellingCommissionRate`: `number`; `sellingFixedFees`: `number`; `startingAnnualMaintenanceCost`: `number`; `startingAnnualPropertyTax`: `number`; `startingMonthlyCondoFees`: `number`; `startingMonthlyInsurance`: `number`; `variableRateAdjustment`: `number`; \}

Configuration for the buyer scenarios.

###### buyer.downPayment

`number`

The down payment amount. Must meet the minimum required down payment in Canada based on the purchase price.

###### buyer.firstTimeOwner

`boolean`

Whether the buyer is a first-time owner, used to calculate land transfer tax rebates.

###### buyer.fixedRateAdjustment

`number`

The adjustment applied to the posted fixed mortgage rate (added to the posted rate).

###### buyer.floorRate

`number`

The minimum interest rate (posted + adjustment) for mortgages.

###### buyer.investsSavings

`boolean`

Whether the buyer invests any monthly savings (difference between their expenses and the renter's/max expenses) into the stock market. If `false`, these savings are discarded (simulating lifestyle inflation or other spending).

###### buyer.purchaseFixedFees

`number`

Fixed fees associated with the purchase (e.g., notary). Do not include land transfer tax here, as it is calculated automatically based on the city.

###### buyer.purchasePrice

`number`

The purchase price of the home.

###### buyer.sellingCommissionRate

`number`

The real estate commission rate for selling the home (e.g., 0.05 for 5%).

###### buyer.sellingFixedFees

`number`

Fixed fees associated with selling the home (before sales tax).

###### buyer.startingAnnualMaintenanceCost

`number`

The initial annual maintenance cost.

###### buyer.startingAnnualPropertyTax

`number`

The initial annual property tax.

###### buyer.startingMonthlyCondoFees

`number`

The initial monthly condo fees.

###### buyer.startingMonthlyInsurance

`number`

The initial monthly homeowner's insurance.

###### buyer.variableRateAdjustment

`number`

The adjustment applied to the variable mortgage rate (added to the posted rate).

###### city

`"Quebec"` \| `"Toronto"` \| `"Montreal"` \| `"Calgary"` \| `"Ottawa"` \| `"Edmonton"` \| `"Winnipeg"` \| `"Vancouver"` \| `"Hamilton"` \| `"Halifax"` \| `"London"` \| `"Saskatoon"` \| `"Kitchener-Waterloo"` \| `"Regina"` \| `"Victoria"` \| `"Barrie"` \| `"Guelph"` \| `"Kingston"` \| `"Fredericton"` \| `"Moncton"` \| `"Saint John (NB)"` \| `"Saint John's (NL)"`

The city where the home is located, used to calculate land transfer tax and derive the province for sales and income taxes.

###### couple

`boolean`

Whether to simulate investments and taxes for a couple doubling TFSA contribution room and splitting capital gains in 2. Assumes each per-month value in parameters.values.employmentIncome represents the per-partner income.

###### numberOfYears

`number`

The duration of the simulation in years.

###### rates

\{ `appreciationIncrease`: `number`[]; `condoFeeIncrease`: `number`[]; `maintenanceIncrease`: `number`[]; `marketReturnRate`: `number`[]; `ownerInsuranceIncrease`: `number`[]; `propertyTaxIncrease`: `number`[]; `renterInsuranceIncrease`: `number`[]; `rentIncrease`: `number`[]; `sellingFixedFeesIncrease`: `number`[]; \}

Annualized growth rates over the simulation period. Each array should have a length of `numberOfYears * 12`. These can be historical or projected rates.

###### rates.appreciationIncrease

`number`[]

Monthly home appreciation rates.

###### rates.condoFeeIncrease

`number`[]

Monthly condo fee increase rates.

###### rates.maintenanceIncrease

`number`[]

Monthly maintenance cost increase rates.

###### rates.marketReturnRate

`number`[]

Monthly market return rates.

###### rates.ownerInsuranceIncrease

`number`[]

Monthly homeowner's insurance increase rates.

###### rates.propertyTaxIncrease

`number`[]

Monthly property tax increase rates.

###### rates.renterInsuranceIncrease

`number`[]

Monthly renter's insurance increase rates.

###### rates.rentIncrease

`number`[]

Monthly rent increase rates.

###### rates.sellingFixedFeesIncrease

`number`[]

Monthly increase rates for selling fixed fees.

###### renter

\{ `securityDeposit`: `number`; `startingMonthlyInsurance`: `number`; `startingMonthlyRent`: `number`; \}

Configuration for the renter scenario.

###### renter.securityDeposit

`number`

The initial security deposit.

###### renter.startingMonthlyInsurance

`number`

The initial monthly renter's insurance.

###### renter.startingMonthlyRent

`number`

The initial monthly rent payment.

###### startingYear

`number`

The year the simulation begins.

###### tfsaContributions

`boolean`

Whether to prioritize TFSA contributions for investments (tax-free gains).

###### values

\{ `employmentIncome`: `number`[]; `fiveYearInterestRates`: `number`[]; `fourYearInterestRates`: `number`[]; `oneYearInterestRates`: `number`[]; `threeYearInterestRates`: `number`[]; `twoYearInterestRates`: `number`[]; `variableInterestRates`: `number`[]; \}

Shared absolute values over the simulation period. Each array should have a length of `numberOfYears * 12`.

###### values.employmentIncome

`number`[]

Annual employment income at each simulated month, used for calculating marginal income tax rates on investment gains.

###### values.fiveYearInterestRates

`number`[]

Monthly 5-year fixed mortgage interest rates.

###### values.fourYearInterestRates

`number`[]

Monthly 4-year fixed mortgage interest rates.

###### values.oneYearInterestRates

`number`[]

Monthly 1-year fixed mortgage interest rates.

###### values.threeYearInterestRates

`number`[]

Monthly 3-year fixed mortgage interest rates.

###### values.twoYearInterestRates

`number`[]

Monthly 2-year fixed mortgage interest rates.

###### values.variableInterestRates

`number`[]

Monthly variable mortgage interest rates.

##### options?

Additional simulation options.

###### adjustToInflation?

`"marketReturnRate"` \| `"rentIncrease"` \| `"ownerInsuranceIncrease"` \| `"renterInsuranceIncrease"` \| `"maintenanceIncrease"` \| `"propertyTaxIncrease"` \| `"condoFeeIncrease"` \| `"appreciationIncrease"` \| `"sellingFixedFeesIncrease"`

The rate parameter used as a proxy for inflation to express future dollar values in today's constant dollars. When set (e.g. to `"sellingFixedFeesIncrease"`), point-in-time metrics (like `monthlyExpenses`, `assets`, and `balance`) are discounted by the current month's inflation factor. Cumulative totals (like `cumulativeExpenses` and `cumulativeGains`) accumulate real values incrementally — meaning each nominal monthly contribution is discounted before being added to the running sum. One-time upfront costs paid at month 0 (`downPayment`, `purchaseFixedFees`, `landTransferTax`, `insurancePremiumTax`, `securityDeposit`) are **not** discounted because their real value already equals their nominal value. Defaults to `undefined` (no adjustment).

###### groups?

`string`[]

Internal filter used by `simulateRentVsBuyMonteCarlo` via `details.filterGroups`. Restricts which groups are emitted by `onRecord` and pushed to results.

###### onRecord?

(`category`, `group`, `variable`, `monthIndex`, `amount`) => `void`

Internal callback used by `simulateRentVsBuyMonteCarlo` when `details.iterations` or `details.quantiles` is enabled. When provided, numeric values are streamed directly to the accumulator instead of being wrapped in result objects, avoiding the per-record heap allocation cost. At the final month, one winner record (the `winVariable` entry) per category is still pushed to the results array for winner extraction.

###### onSnapshotRecord?

(`category`, `monthIndex`, `amount`) => `void`

###### snapshotMonths?

`Set`\<`number`\>

###### variables?

`string`[]

Internal filter used by `simulateRentVsBuyMonteCarlo` via `details.filterVariables`. Restricts which individual variables within allowed groups are emitted by `onRecord`. An empty array is treated as no filter.

###### winVariable?

`"balance"` \| `"balanceAfterSelling"` \| `"assets"`

The variable used to identify the winner when extracting the final record. Use `"balanceAfterSelling"` for net balance after a simulated sale, `"balance"` for cumulative balance, or `"assets"` for total raw assets.

###### winVariableOnly?

`boolean`

If `true`, the returned results will only include the final `winVariable` record for each scenario (one entry per scenario at the final month). Requires `winVariable` to be set — throws if `winVariableOnly` is `true` but `winVariable` is not provided. Defaults to `false`.

#### Returns

`object` & \{ `effectiveInterestRate?`: `number`; `fixedRateAdjustment?`: `number`; `group`: `"monthlyExpenses"` \| `"cumulativeExpenses"`; `postedInterestRate?`: `number`; `variable`: `"mortgageCapital"` \| `"mortgageInterests"` \| `"rent"` \| `"insurance"` \| `"securityDeposit"` \| `"maintenance"` \| `"propertyTax"` \| `"condoFees"` \| `"downPayment"` \| `"purchaseFixedFees"` \| `"landTransferTax"` \| `"insurancePremiumTax"` \| `"tfsaFees"` \| `"stocksFees"`; `variableRateAdjustment?`: `number`; \} \| \{ `group`: `"monthlyGains"` \| `"cumulativeGains"`; `homeValue?`: `number`; `variable`: `"tfsaGains"` \| `"tfsaContribution"` \| `"stocksGains"` \| `"newStocks"` \| `"homeEquityGains"`; \} \| \{ `group`: `"assets"`; `variable`: `"securityDeposit"` \| `"tfsa"` \| `"stocks"` \| `"homeEquity"`; \} \| \{ `group`: `"summary"`; `variable`: `"balance"`; \} \| \{ `group`: `"summaryCumulative"`; `variable`: `"balance"` \| `"balanceAfterSelling"`; \} \| \{ `employmentIncome?`: `number`; `group`: `"saleCosts"`; `variable`: `"mortgageBalance"` \| `"stockTaxes"` \| `"homeSellingCommission"` \| `"homeSellingFixedFees"` \| `"mortgagePenalty"`; \} \| \{ `group`: `"saleNetGains"`; `variable`: `"securityDeposit"` \| `"stockSellingGains"` \| `"tfsaSellingGains"` \| `"homeSellingGains"`; \} \| \{ `group`: `"monthlyRecurringExpenses"`; `variable`: `"mortgageCapital"` \| `"mortgageInterests"` \| `"rent"` \| `"insurance"` \| `"maintenance"` \| `"propertyTax"` \| `"condoFees"` \| `"tfsaFees"` \| `"stocksFees"`; \} \| \{ `group`: `"monthlyNonRecurringExpenses"`; `variable`: `"securityDeposit"` \| `"downPayment"` \| `"purchaseFixedFees"` \| `"landTransferTax"` \| `"insurancePremiumTax"`; \} \| \{ `group`: `"totals"`; `variable`: `"monthlyExpenses"` \| `"cumulativeExpenses"` \| `"monthlyGains"` \| `"cumulativeGains"` \| `"assets"` \| `"saleCosts"` \| `"saleNetGains"` \| `"monthlyRecurringExpenses"` \| `"monthlyNonRecurringExpenses"`; \}[]

A detailed array of monthly results for each scenario (renter, buyerFixed, buyerVariable).

#### Throws

If the down payment is less than the minimum required down payment in Canada.
Each object in the array represents a specific data point for a given month, categorized by:
- `monthlyExpenses` or `cumulativeExpenses`:
  - `rent`, `insurance`, `securityDeposit` (for Renter)
  - `mortgageCapital`, `mortgageInterests`, `maintenance`, `propertyTax`, `condoFees`, `downPayment`, `purchaseFixedFees`, `insurancePremiumTax` (for Buyers)
  - `tfsaFees`, `stocksFees` (for all scenarios)
- `monthlyGains` or `cumulativeGains`:
  - `tfsaGains`, `tfsaContribution`, `stocksGains`, `newStocks` (for all scenarios)
  - `homeEquityGains` (for Buyers)
- `assets`:
  - `tfsa`, `stocks` (for all scenarios)
  - `securityDeposit` (for Renter)
  - `homeEquity` (for Buyers)
- `summary`: `balance` (monthly net worth)
- `summaryCumulative`: `balance` (cumulative net worth), `balanceAfterSelling` (net worth after hypothetical property sale and associated taxes/fees)
- `saleCosts`: `stockTaxes` (includes `employmentIncome` used for calculation), `homeSellingCommission`, `homeSellingFixedFees`, `mortgagePenalty`, `mortgageBalance` (hypothetical costs incurred upon selling)
- `saleNetGains`: `stockSellingGains`, `tfsaSellingGains`, `homeSellingGains`, `securityDeposit` (hypothetical gains realized upon selling)
- `monthlyRecurringExpenses`: `rent`, `insurance`, `mortgageCapital`, `mortgageInterests`, `maintenance`, `propertyTax`, `condoFees`, `tfsaFees`, `stocksFees` — same values as the corresponding `monthlyExpenses` variables, restricted to costs that recur every month.
- `monthlyNonRecurringExpenses`: `downPayment`, `purchaseFixedFees`, `landTransferTax`, `insurancePremiumTax`, `securityDeposit` — same values as the corresponding `monthlyExpenses` variables, restricted to one-time upfront costs (nonzero only at month 0).
- `totals`: `monthlyExpenses`, `cumulativeExpenses`, `monthlyGains`, `cumulativeGains`, `assets`, `saleCosts`, `saleNetGains`, `monthlyRecurringExpenses`, `monthlyNonRecurringExpenses` (sum of all variables in each respective group; always emitted even when zero)

#### Example

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
  city: "Toronto",
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
    firstTimeOwner: true, investsSavings: true,
    purchaseFixedFees: 2000,
    startingAnnualMaintenanceCost: 2000,
    startingAnnualPropertyTax: 3000,
    startingMonthlyCondoFees: 300,
    startingMonthlyInsurance: 100,
    sellingFixedFees: 2000,
    sellingCommissionRate: 0.05,
    floorRate: 0.01,
    investsSavings: true,
  },
  values,
  rates,
}, { winVariableOnly: true, winVariable: "balanceAfterSelling" });
```

***

### simulateRentVsBuyMonteCarlo()

> **simulateRentVsBuyMonteCarlo**(`parameters`, `options?`): `object`

Performs a Monte Carlo simulation for a rent versus buy analysis tailored for a Canadian context.
This function runs multiple iterations of the `simulateRentVsBuy` function, using stochastic paths
for various economic factors like market returns, interest rates, and inflation-related costs.
It helps evaluate the probability of different financial outcomes under uncertainty.

The simulation uses:
- **Geometric Brownian Motion (GBM)** for paths like market returns, rent increases, and home appreciation.
- **Cox-Ingersoll-Ross (CIR)** models for interest rate paths.

Parameters for these models can be generated from historical data using `getCirParameters` and `getGbmParameters` from `@nshiab/journalism`.

#### Parameters

##### parameters

The input parameters for the Monte Carlo simulation.

###### annualInvestmentFeeRate

`number`

Annual investment fee rate (e.g. ETF MER or platform/advisor fee) expressed as a decimal (e.g. `0.0025` for 0.25%). Applied monthly to TFSA and stock portfolio balances using a multiplicative model — the fee is charged on the grown balance. The monthly dollar cost is also tracked as `tfsaFees` and `stocksFees` under `monthlyExpenses` and `cumulativeExpenses` in the output.

###### buyer

\{ `downPayment`: `number`; `firstTimeOwner`: `boolean`; `fixedRateAdjustment`: `number`; `floorRate`: `number`; `investsSavings`: `boolean`; `purchaseFixedFees`: `number`; `sellingCommissionRate`: `number`; `variableRateAdjustment`: `number`; \}

Configuration for the buyer scenarios.

###### buyer.downPayment

`number`

The total down payment amount paid at the start. Must meet the minimum required down payment in Canada based on the initial property appreciation value.

###### buyer.firstTimeOwner

`boolean`

Whether the buyer is a first-time owner, used to calculate land transfer tax rebates.

###### buyer.fixedRateAdjustment

`number`

The adjustment applied to the posted fixed mortgage rate (added to the posted rate).

###### buyer.floorRate

`number`

The minimum interest rate (posted + adjustment) for mortgages.

###### buyer.investsSavings

`boolean`

Whether the buyer invests any monthly savings (difference between their expenses and the renter's/max expenses) into the stock market. If `false`, these savings are discarded.

###### buyer.purchaseFixedFees

`number`

One-time costs at purchase (notary, etc.). Do not include land transfer tax here, as it is calculated automatically based on the city.

###### buyer.sellingCommissionRate

`number`

The commission rate paid to real estate agents upon sale (e.g., `0.05` for 5%).

###### buyer.variableRateAdjustment

`number`

The adjustment applied to the variable mortgage rate (added to the posted rate).

###### choleskyMatrix

`number`[][]

Mandatory Cholesky decomposition matrix for the 16 stochastic variables.
You must pre-compute this using `getRentVsBuyCholeskyMatrix` and pass it
into the simulation.

###### city

`"Quebec"` \| `"Toronto"` \| `"Montreal"` \| `"Calgary"` \| `"Ottawa"` \| `"Edmonton"` \| `"Winnipeg"` \| `"Vancouver"` \| `"Hamilton"` \| `"Halifax"` \| `"London"` \| `"Saskatoon"` \| `"Kitchener-Waterloo"` \| `"Regina"` \| `"Victoria"` \| `"Barrie"` \| `"Guelph"` \| `"Kingston"` \| `"Fredericton"` \| `"Moncton"` \| `"Saint John (NB)"` \| `"Saint John's (NL)"`

The city where the home is located, used to calculate land transfer tax and derive the province for sales and income taxes.

###### couple

`boolean`

Whether to simulate investments and taxes for a couple doubling TFSA contribution room and splitting capital gains in 2. Assumes the stochastic employmentIncome parameter represents the per-partner income.

###### iterations

`number`

The number of simulation iterations to run.

###### numberOfYears

`number`

The duration of each simulation in years.

###### renter

\{ `securityDeposit`: `number`; \}

Configuration for the renter scenario.

###### renter.securityDeposit

`number`

The initial security deposit or last month's rent (scenario-dependent).

###### startingYear

`number`

The year the simulation begins.

###### stochasticParameters

\{ `appreciation`: \{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}; `condoFee`: \{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}; `employmentIncome`: \{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}; `fiveYearInterestRates`: \{ `a`: `number`; `b`: `number`; `initialValue`: `number`; `sigma`: `number`; \}; `fourYearInterestRates`: \{ `a`: `number`; `b`: `number`; `initialValue`: `number`; `sigma`: `number`; \}; `maintenance`: \{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}; `market`: \{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}; `oneYearInterestRates`: \{ `a`: `number`; `b`: `number`; `initialValue`: `number`; `sigma`: `number`; \}; `ownerInsurance`: \{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}; `propertyTax`: \{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}; `rent`: \{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}; `renterInsurance`: \{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}; `sellingFixedFees`: \{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}; `threeYearInterestRates`: \{ `a`: `number`; `b`: `number`; `initialValue`: `number`; `sigma`: `number`; \}; `twoYearInterestRates`: \{ `a`: `number`; `b`: `number`; `initialValue`: `number`; `sigma`: `number`; \}; `variableInterestRates`: \{ `a`: `number`; `b`: `number`; `initialValue`: `number`; `sigma`: `number`; \}; \}

Parameters for the stochastic models.
  For all parameters (market return rate, dollar amounts, interest rates), use:
  - `initialValue`: The starting value (e.g., `0.07` for 7% market return, `1500` for $1,500 monthly rent, or `0.05` for a 5% interest rate).

  For **Geometric Brownian Motion (GBM)** models (income, market, rent, expenses, appreciation):
  - `mu`: The drift or expected annual growth rate.
  - `sigma`: The annual volatility.

  For **Cox-Ingersoll-Ross (CIR)** models (interest rates):
  - `a`: Speed of mean reversion.
  - `b`: Long-term mean.
  - `sigma`: Annual volatility.

###### stochasticParameters.appreciation

\{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}

Home value appreciation rates (GBM).

###### stochasticParameters.appreciation.initialValue

`number`

###### stochasticParameters.appreciation.mu

`number`

###### stochasticParameters.appreciation.sigma

`number`

###### stochasticParameters.condoFee

\{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}

Condo fee increase rates (GBM).

###### stochasticParameters.condoFee.initialValue

`number`

###### stochasticParameters.condoFee.mu

`number`

###### stochasticParameters.condoFee.sigma

`number`

###### stochasticParameters.employmentIncome

\{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}

Employment income trajectory (GBM).

###### stochasticParameters.employmentIncome.initialValue

`number`

###### stochasticParameters.employmentIncome.mu

`number`

###### stochasticParameters.employmentIncome.sigma

`number`

###### stochasticParameters.fiveYearInterestRates

\{ `a`: `number`; `b`: `number`; `initialValue`: `number`; `sigma`: `number`; \}

5-year fixed interest rates (CIR).

###### stochasticParameters.fiveYearInterestRates.a

`number`

###### stochasticParameters.fiveYearInterestRates.b

`number`

###### stochasticParameters.fiveYearInterestRates.initialValue

`number`

###### stochasticParameters.fiveYearInterestRates.sigma

`number`

###### stochasticParameters.fourYearInterestRates

\{ `a`: `number`; `b`: `number`; `initialValue`: `number`; `sigma`: `number`; \}

4-year fixed interest rates (CIR).

###### stochasticParameters.fourYearInterestRates.a

`number`

###### stochasticParameters.fourYearInterestRates.b

`number`

###### stochasticParameters.fourYearInterestRates.initialValue

`number`

###### stochasticParameters.fourYearInterestRates.sigma

`number`

###### stochasticParameters.maintenance

\{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}

Maintenance cost increase rates (GBM).

###### stochasticParameters.maintenance.initialValue

`number`

###### stochasticParameters.maintenance.mu

`number`

###### stochasticParameters.maintenance.sigma

`number`

###### stochasticParameters.market

\{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}

Market return rates for savings (GBM).

###### stochasticParameters.market.initialValue

`number`

###### stochasticParameters.market.mu

`number`

###### stochasticParameters.market.sigma

`number`

###### stochasticParameters.oneYearInterestRates

\{ `a`: `number`; `b`: `number`; `initialValue`: `number`; `sigma`: `number`; \}

1-year fixed interest rates (CIR).

###### stochasticParameters.oneYearInterestRates.a

`number`

###### stochasticParameters.oneYearInterestRates.b

`number`

###### stochasticParameters.oneYearInterestRates.initialValue

`number`

###### stochasticParameters.oneYearInterestRates.sigma

`number`

###### stochasticParameters.ownerInsurance

\{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}

Homeowner's insurance increase rates (GBM).

###### stochasticParameters.ownerInsurance.initialValue

`number`

###### stochasticParameters.ownerInsurance.mu

`number`

###### stochasticParameters.ownerInsurance.sigma

`number`

###### stochasticParameters.propertyTax

\{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}

Property tax increase rates (GBM).

###### stochasticParameters.propertyTax.initialValue

`number`

###### stochasticParameters.propertyTax.mu

`number`

###### stochasticParameters.propertyTax.sigma

`number`

###### stochasticParameters.rent

\{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}

Rent increase rates (GBM).

###### stochasticParameters.rent.initialValue

`number`

###### stochasticParameters.rent.mu

`number`

###### stochasticParameters.rent.sigma

`number`

###### stochasticParameters.renterInsurance

\{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}

Renter's insurance increase rates (GBM).

###### stochasticParameters.renterInsurance.initialValue

`number`

###### stochasticParameters.renterInsurance.mu

`number`

###### stochasticParameters.renterInsurance.sigma

`number`

###### stochasticParameters.sellingFixedFees

\{ `initialValue`: `number`; `mu`: `number`; `sigma`: `number`; \}

Selling fixed fees increase rates (GBM).

###### stochasticParameters.sellingFixedFees.initialValue

`number`

###### stochasticParameters.sellingFixedFees.mu

`number`

###### stochasticParameters.sellingFixedFees.sigma

`number`

###### stochasticParameters.threeYearInterestRates

\{ `a`: `number`; `b`: `number`; `initialValue`: `number`; `sigma`: `number`; \}

3-year fixed interest rates (CIR).

###### stochasticParameters.threeYearInterestRates.a

`number`

###### stochasticParameters.threeYearInterestRates.b

`number`

###### stochasticParameters.threeYearInterestRates.initialValue

`number`

###### stochasticParameters.threeYearInterestRates.sigma

`number`

###### stochasticParameters.twoYearInterestRates

\{ `a`: `number`; `b`: `number`; `initialValue`: `number`; `sigma`: `number`; \}

2-year fixed interest rates (CIR).

###### stochasticParameters.twoYearInterestRates.a

`number`

###### stochasticParameters.twoYearInterestRates.b

`number`

###### stochasticParameters.twoYearInterestRates.initialValue

`number`

###### stochasticParameters.twoYearInterestRates.sigma

`number`

###### stochasticParameters.variableInterestRates

\{ `a`: `number`; `b`: `number`; `initialValue`: `number`; `sigma`: `number`; \}

Variable interest rates (CIR).

###### stochasticParameters.variableInterestRates.a

`number`

###### stochasticParameters.variableInterestRates.b

`number`

###### stochasticParameters.variableInterestRates.initialValue

`number`

###### stochasticParameters.variableInterestRates.sigma

`number`

###### tfsaContributions

`boolean`

Whether to prioritize TFSA contributions for investments (tax-free gains).

###### winVariable

`"balance"` \| `"balanceAfterSelling"` \| `"assets"`

The variable used to determine the winner of each iteration. Use `"balanceAfterSelling"` for the net balance after simulated sale of all assets, `"balance"` for the cumulative balance before any sale simulation, or `"assets"` for the total raw asset value (TFSA + stocks + home equity + security deposit).

##### options?

Additional simulation options.

###### adjustToInflation?

`"marketReturnRate"` \| `"rentIncrease"` \| `"ownerInsuranceIncrease"` \| `"renterInsuranceIncrease"` \| `"maintenanceIncrease"` \| `"propertyTaxIncrease"` \| `"condoFeeIncrease"` \| `"appreciationIncrease"` \| `"sellingFixedFeesIncrease"`

The rate parameter used as a proxy for inflation to express future dollar values in today's constant dollars. When set (e.g. to `"sellingFixedFeesIncrease"`), point-in-time metrics (like `monthlyExpenses`, `assets`, and `balance`) are discounted by the current month's simulated inflation factor. Cumulative totals (like `cumulativeExpenses` and `cumulativeGains`) accumulate real values incrementally — meaning each nominal monthly contribution is discounted before being added to the running sum. One-time upfront costs paid at month 0 (`downPayment`, `purchaseFixedFees`, `landTransferTax`, `insurancePremium`, `securityDeposit`) are **not** discounted because their real value already equals their nominal value. Defaults to `undefined` (no adjustment).

###### details?

\{ `filterGroups?`: (`"monthlyExpenses"` \| `"cumulativeExpenses"` \| `"monthlyGains"` \| `"cumulativeGains"` \| `"assets"` \| `"summary"` \| `"summaryCumulative"` \| `"saleCosts"` \| `"saleNetGains"` \| `"monthlyRecurringExpenses"` \| `"monthlyNonRecurringExpenses"` \| `"totals"`)[]; `filterVariables?`: (`"mortgageBalance"` \| `"mortgageCapital"` \| `"mortgageInterests"` \| `"rent"` \| `"insurance"` \| `"securityDeposit"` \| `"maintenance"` \| `"propertyTax"` \| `"condoFees"` \| `"downPayment"` \| `"purchaseFixedFees"` \| `"landTransferTax"` \| `"insurancePremiumTax"` \| `"tfsaFees"` \| `"stocksFees"` \| `"tfsaGains"` \| `"tfsaContribution"` \| `"stocksGains"` \| `"newStocks"` \| `"homeEquityGains"` \| `"tfsa"` \| `"stocks"` \| `"homeEquity"` \| `"balance"` \| `"balanceAfterSelling"` \| `"stockTaxes"` \| `"homeSellingCommission"` \| `"homeSellingFixedFees"` \| `"mortgagePenalty"` \| `"stockSellingGains"` \| `"tfsaSellingGains"` \| `"homeSellingGains"` \| `"monthlyExpenses"` \| `"cumulativeExpenses"` \| `"monthlyGains"` \| `"cumulativeGains"` \| `"assets"` \| `"saleCosts"` \| `"saleNetGains"` \| `"monthlyRecurringExpenses"` \| `"monthlyNonRecurringExpenses"`)[]; `firstMonth?`: `boolean`; `iterations?`: `boolean`; `quantiles?`: `number`[]; \}

When provided, enables detailed monthly data collection for all iterations.
- `iterations`: if `true`, captures raw per-iteration monthly records returned in `details.monthlyIterations`. Requires `filterGroups` to be set and non-empty — throws otherwise. Decode with `decodeMonteCarloMonthlyIterations`.
- `quantiles`: pre-computes the specified quantile levels (e.g. `[0, 0.5, 1]` for min/median/max) across all iterations for every variable/group/category/month, returned in `details.monthlyQuantiles`. Layout: `data[key][qIdx * cols + monthIndex]`. Decode with `decodeMonteCarloMonthlyQuantiles`.
- `firstMonth`: if `true`, captures data for all available groups and variables for the first month (monthIndex 0) during the first iteration. Returned as an array of objects in `details.firstMonth`. This capture is independent of `filterGroups` and `filterVariables`.
- `filterGroups`: required when `iterations: true`; restricts which groups are collected (e.g. `["assets", "summaryCumulative"]`), reducing memory usage. Also filters the shared column-major buffer used by `details.quantiles`.
- `filterVariables`: optional finer-grained filter; restricts which individual variables are stored within the allowed groups (e.g. `["balance", "homeEquity"]`), further reducing memory usage. Also filters the shared column-major buffer used by `details.quantiles`. An empty array is treated as no filter.
Both `iterations` and `quantiles` share the same internal column-major buffer, so enabling both together is more memory-efficient than the sum of their individual costs.

###### details.filterGroups?

(`"monthlyExpenses"` \| `"cumulativeExpenses"` \| `"monthlyGains"` \| `"cumulativeGains"` \| `"assets"` \| `"summary"` \| `"summaryCumulative"` \| `"saleCosts"` \| `"saleNetGains"` \| `"monthlyRecurringExpenses"` \| `"monthlyNonRecurringExpenses"` \| `"totals"`)[]

Required when `details.iterations` is `true`. Restricts which groups are included in the `monthlyIterations` output (e.g. `["assets", "summaryCumulative"]`), reducing memory usage. Also filters the shared column-major buffer used by `details.quantiles`.

  Available groups:
  - `monthlyExpenses`: Monthly cash outlays (rent, mortgage, taxes, fees, etc.).
  - `cumulativeExpenses`: Total cash outlays from start to current month.
  - `monthlyRecurringExpenses`: Recurring monthly costs (same as monthlyExpenses but excluding one-time items).
  - `monthlyNonRecurringExpenses`: One-time costs (down payment, closing costs).
  - `monthlyGains`: Monthly asset appreciation and contribution (market gains, home equity).
  - `cumulativeGains`: Total accumulated gains from start to current month.
  - `assets`: Current value of assets (stocks, TFSA, home equity, deposit).
  - `summary`: Point-in-time metrics like `balance`.
  - `summaryCumulative`: Final snapshot metrics like `balanceAfterSelling`.
  - `saleCosts`: Costs incurred upon selling (taxes, commission, penalties).
  - `saleNetGains`: Gains realized upon selling.
  - `totals`: Group-level sums of all variables in each of the above groups (e.g., `variable: "monthlyExpenses"` under `group: "totals"`).

###### details.filterVariables?

(`"mortgageBalance"` \| `"mortgageCapital"` \| `"mortgageInterests"` \| `"rent"` \| `"insurance"` \| `"securityDeposit"` \| `"maintenance"` \| `"propertyTax"` \| `"condoFees"` \| `"downPayment"` \| `"purchaseFixedFees"` \| `"landTransferTax"` \| `"insurancePremiumTax"` \| `"tfsaFees"` \| `"stocksFees"` \| `"tfsaGains"` \| `"tfsaContribution"` \| `"stocksGains"` \| `"newStocks"` \| `"homeEquityGains"` \| `"tfsa"` \| `"stocks"` \| `"homeEquity"` \| `"balance"` \| `"balanceAfterSelling"` \| `"stockTaxes"` \| `"homeSellingCommission"` \| `"homeSellingFixedFees"` \| `"mortgagePenalty"` \| `"stockSellingGains"` \| `"tfsaSellingGains"` \| `"homeSellingGains"` \| `"monthlyExpenses"` \| `"cumulativeExpenses"` \| `"monthlyGains"` \| `"cumulativeGains"` \| `"assets"` \| `"saleCosts"` \| `"saleNetGains"` \| `"monthlyRecurringExpenses"` \| `"monthlyNonRecurringExpenses"`)[]

Optional finer-grained filter applied within the allowed groups. Restricts which individual variables are stored in the columnar buffer (e.g. `["balance", "homeEquity"]`), reducing memory usage. Also filters the shared column-major buffer used by `details.quantiles`. An empty array is treated as no filter (all variables are stored).

  Commonly used variables:
  - `rent`, `mortgageCapital`, `mortgageInterests`, `maintenance`, `propertyTax`, `condoFees` (expenses).
  - `tfsa`, `stocks`, `homeEquity` (assets).
  - `balance`, `balanceAfterSelling` (summary).
  - `monthlyRecurringExpenses`, `monthlyExpenses`, `assets` (totals).

###### details.firstMonth?

`boolean`

If `true`, captures data for all available groups and variables for the first month (monthIndex 0) during the first iteration. Returned as an array of objects in `details.firstMonth`. This capture is independent of `filterGroups` and `filterVariables`, making it useful for a complete manifest of initial costs.

###### details.iterations?

`boolean`

If `true`, captures and returns the raw monthly financial data for every variable, group, and category for each individual iteration. Requires `details.filterGroups` to be set and non-empty — throws otherwise. Each record includes `iteration` (0-based index), `category`, `group`, `variable`, `monthIndex`, and `amount`. Useful for custom aggregations or visualization of individual paths. Be aware that this can produce a very large number of records (iterations × months × variables × 3 categories), so use `filterGroups` and `filterVariables` to limit scope.

###### details.quantiles?

`number`[]

When provided, pre-computes the specified quantile levels (e.g. `[0, 0.5, 1]` for min/median/max) across all iterations for every variable/group/category/month combination. Layout: `data[key][qIdx * cols + monthIndex]`. Decode with `decodeMonteCarloMonthlyQuantiles`.

###### values?

`boolean`

If `true`, captures the stochastic path values for all 16 variables (e.g. employment income, market returns, interest rates) across all iterations. Dollar-amount paths (employment income, rent, insurances, maintenance, property tax, condo fees, appreciation, selling fixed fees) are expressed in real (inflation-adjusted) dollars when `options.adjustToInflation` is set, using the same deflation factor as `details`. Rate paths (market returns, all six interest rates) are always nominal. Decode with `decodeMonteCarloValues`. Be cautious with high iteration counts as this can consume significant memory.

###### verbose?

`boolean`

If `true`, logs the current iteration number to the console at the frequency set by `verboseStep`. Also logs the total elapsed time upon completion via `prettyDuration`. Useful for long-running simulations.

###### verboseStep?

`number`

The frequency of progress logging. For example, setting this to `50` will log progress every 50 iterations. Defaults to `1`.

#### Returns

An object with all large arrays in columnar format (flat `Float64Array` matrices, transferable via `postMessage`). Use `decodeMonteCarloWinners`, `decodeMonteCarloValues`, `decodeMonteCarloMonthlyIterations`, and `decodeMonteCarloMonthlyQuantiles` from `@nshiab/journalism-finance` to restore object-array shapes.
  - `winners`: A `WinnersColumnar` with `monthIndex`, `amount` (`Float64Array`) and `category` (`Uint8Array`) indicating which scenario won each iteration. Decode with `decodeMonteCarloWinners`.
  - `winnerSnapshots`: A `WinnerSnapshots` containing per-checkpoint win rates and median amounts. Win rates are clipped/smoothed to the range `[0.01, 0.98]` (for a single dominant winner, with other scenarios receiving 1% each, yielding `[0.01, 0.01, 0.98]`) so they never return exactly 0% or 100%, reflecting unmodeled tail risks and preventing deterministic misinterpretation of statistical estimates.
  - `values`: A `ColumnarResult` with stochastic path values per iteration (enabled with `options.values`). Decode with `decodeMonteCarloValues`.
  - `details.monthlyIterations`: A `ColumnarResult` with raw monthly records per iteration (enabled with `options.details.iterations`). Decode with `decodeMonteCarloMonthlyIterations`.
  - `details.monthlyQuantiles`: A `ColumnarResult` with pre-computed quantile summaries (enabled with `options.details.quantiles`). Decode with `decodeMonteCarloMonthlyQuantiles`.

##### details

> **details**: `object`

Per-iteration and per-quantile monthly data, populated when `options.details` is provided.
- `monthlyIterations`: raw per-iteration monthly records. Layout: `data[key][iteration * cols + monthIndex]`. Decode with `decodeMonteCarloMonthlyIterations`.
- `monthlyQuantiles`: pre-computed quantile summaries. Layout: `data[key][qIdx * cols + monthIndex]`. Decode with `decodeMonteCarloMonthlyQuantiles`.
- `firstMonth`: simple record of all data for category/group/variable at monthIndex 0, captured during the first iteration (assuming month 0 is deterministic).

###### details.firstMonth?

> `optional` **firstMonth?**: `object` & \{ `effectiveInterestRate?`: `number`; `fixedRateAdjustment?`: `number`; `group`: `"monthlyExpenses"` \| `"cumulativeExpenses"`; `postedInterestRate?`: `number`; `variable`: `"mortgageCapital"` \| `"mortgageInterests"` \| `"rent"` \| `"insurance"` \| `"securityDeposit"` \| `"maintenance"` \| `"propertyTax"` \| `"condoFees"` \| `"downPayment"` \| `"purchaseFixedFees"` \| `"landTransferTax"` \| `"insurancePremiumTax"` \| `"tfsaFees"` \| `"stocksFees"`; `variableRateAdjustment?`: `number`; \} \| \{ `group`: `"monthlyGains"` \| `"cumulativeGains"`; `homeValue?`: `number`; `variable`: `"tfsaGains"` \| `"tfsaContribution"` \| `"stocksGains"` \| `"newStocks"` \| `"homeEquityGains"`; \} \| \{ `group`: `"assets"`; `variable`: `"securityDeposit"` \| `"tfsa"` \| `"stocks"` \| `"homeEquity"`; \} \| \{ `group`: `"summary"`; `variable`: `"balance"`; \} \| \{ `group`: `"summaryCumulative"`; `variable`: `"balance"` \| `"balanceAfterSelling"`; \} \| \{ `employmentIncome?`: `number`; `group`: `"saleCosts"`; `variable`: `"mortgageBalance"` \| `"stockTaxes"` \| `"homeSellingCommission"` \| `"homeSellingFixedFees"` \| `"mortgagePenalty"`; \} \| \{ `group`: `"saleNetGains"`; `variable`: `"securityDeposit"` \| `"stockSellingGains"` \| `"tfsaSellingGains"` \| `"homeSellingGains"`; \} \| \{ `group`: `"monthlyRecurringExpenses"`; `variable`: `"mortgageCapital"` \| `"mortgageInterests"` \| `"rent"` \| `"insurance"` \| `"maintenance"` \| `"propertyTax"` \| `"condoFees"` \| `"tfsaFees"` \| `"stocksFees"`; \} \| \{ `group`: `"monthlyNonRecurringExpenses"`; `variable`: `"securityDeposit"` \| `"downPayment"` \| `"purchaseFixedFees"` \| `"landTransferTax"` \| `"insurancePremiumTax"`; \} \| \{ `group`: `"totals"`; `variable`: `"monthlyExpenses"` \| `"cumulativeExpenses"` \| `"monthlyGains"` \| `"cumulativeGains"` \| `"assets"` \| `"saleCosts"` \| `"saleNetGains"` \| `"monthlyRecurringExpenses"` \| `"monthlyNonRecurringExpenses"`; \}[]

###### details.monthlyIterations

> **monthlyIterations**: `object`

###### details.monthlyIterations.cols

> **cols**: `number`

###### details.monthlyIterations.data

> **data**: `Record`\<`string`, `Float64Array`\>

###### details.monthlyIterations.keys

> **keys**: `string`[]

###### details.monthlyIterations.rows

> **rows**: `number`

###### details.monthlyQuantiles

> **monthlyQuantiles**: `object`

###### details.monthlyQuantiles.cols

> **cols**: `number`

###### details.monthlyQuantiles.data

> **data**: `Record`\<`string`, `Float64Array`\>

###### details.monthlyQuantiles.keys

> **keys**: `string`[]

###### details.monthlyQuantiles.rows

> **rows**: `number`

##### values

> **values**: `object`

###### values.cols

> **cols**: `number`

###### values.data

> **data**: `Record`\<`string`, `Float64Array`\>

###### values.keys

> **keys**: `string`[]

###### values.rows

> **rows**: `number`

##### winners

> **winners**: `object`

###### winners.amount

> **amount**: `Float64Array`

Final `amount` of the winning scenario for each iteration.

###### winners.category

> **category**: `Uint8Array`

Winning scenario category encoded as a byte.
Decode with `WINNER_CATEGORIES[category[i]]` or use `decodeMonteCarloWinners`.

###### winners.monthIndex

> **monthIndex**: `Float64Array`

Final `monthIndex` of the winning scenario for each iteration.

##### winnerSnapshots

> **winnerSnapshots**: `object`

###### winnerSnapshots.buyerFixed

> **buyerFixed**: `Float64Array`

Fraction of iterations (strictly in the range [0.01, 0.98]) where the buyerFixed scenario
had the highest `winVariable` at this checkpoint. Win rates are clipped/smoothed to reflect
unmodeled tail risks and prevent deterministic misinterpretation (e.g., [1.0, 0.0, 0.0] becomes [0.98, 0.01, 0.01]).

###### winnerSnapshots.buyerFixedMedian

> **buyerFixedMedian**: `Float64Array`

###### winnerSnapshots.buyerVariable

> **buyerVariable**: `Float64Array`

Fraction of iterations (strictly in the range [0.01, 0.98]) where the buyerVariable scenario
had the highest `winVariable` at this checkpoint. Win rates are clipped/smoothed to reflect
unmodeled tail risks and prevent deterministic misinterpretation (e.g., [1.0, 0.0, 0.0] becomes [0.98, 0.01, 0.01]).

###### winnerSnapshots.buyerVariableMedian

> **buyerVariableMedian**: `Float64Array`

###### winnerSnapshots.renter

> **renter**: `Float64Array`

Fraction of iterations (strictly in the range [0.01, 0.98]) where the renter scenario
had the highest `winVariable` at this checkpoint. Win rates are clipped/smoothed to reflect
unmodeled tail risks and prevent deterministic misinterpretation (e.g., [1.0, 0.0, 0.0] becomes [0.98, 0.01, 0.01]).

###### winnerSnapshots.renterMedian

> **renterMedian**: `Float64Array`

Median `winVariable` amount for each category at each snapshot.

###### winnerSnapshots.snapshotMonths

> **snapshotMonths**: `number`[]

Month indices of each snapshot (e.g. `[59, 119, 179, 239, 299]` for a 25-year sim, i.e. end of years 5, 10, 15, 20, 25).

#### Throws

If the down payment is less than the minimum required down payment in Canada.

#### Example

```ts
import { simulateRentVsBuyMonteCarlo, getRentVsBuyCholeskyMatrix } from "@nshiab/journalism-finance";

// Assuming you have an object `historicalData` of type `StochasticData`
// where each key holds an array of historical values for that variable.
const choleskyMatrix = getRentVsBuyCholeskyMatrix(historicalData);

const results = simulateRentVsBuyMonteCarlo({
  iterations: 1000,
  choleskyMatrix,
  winVariable: "balanceAfterSelling",
  startingYear: 2026,
  numberOfYears: 25,
  tfsaContributions: true,
  annualInvestmentFeeRate: 0.0025,
  couple: false,
  city: "Toronto",
  renter: {
    securityDeposit: 1500,
  },
  buyer: {
    downPayment: 50000,
    fixedRateAdjustment: -0.015,
    variableRateAdjustment: -0.005,
    firstTimeOwner: true, investsSavings: true,
    purchaseFixedFees: 2000,
    sellingCommissionRate: 0.05,
    floorRate: 0.01,
    investsSavings: true,
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
    threeYearInterestRates: { initialValue: 0.05, a: 0.2, b: 0.05, sigma: 0.02 },
    twoYearInterestRates: { initialValue: 0.05, a: 0.2, b: 0.05, sigma: 0.02 },
    oneYearInterestRates: { initialValue: 0.05, a: 0.2, b: 0.05, sigma: 0.02 },
    variableInterestRates: { initialValue: 0.06, a: 0.2, b: 0.06, sigma: 0.02 },
  },
});
```
