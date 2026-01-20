import getTfsaContribution from "./getTfsaContribution.ts";

export default function computeGains(
  year: number,
  persona: {
    params: {
      homeValue: number;
    };
    monthlyGains: {
      tfsaGains: number;
      tfsaContribution: number;
      stocksGains: number;
      newStocks: number;
      homeSellingGains: number;
      homeEquityGains: number;
    };
    cumulativeGains: {
      tfsaGains: number;
      tfsaContribution: number;
      stocksGains: number;
      newStocks: number;
      homeSellingGains: number;
      homeEquityGains: number;
    };
    assets: {
      tfsa: number;
      stocks: number;
      securityDeposit: number;
      homeEquity: number;
    };
  },
  mortgagePayment: {
    paymentId: number;
    payment: number;
    interest: number;
    capital: number;
    balance: number;
    amountPaid: number;
    interestPaid: number;
    capitalPaid: number;
    effectiveInterestRate: number;
    postedInterestRate: number;
    rateDiscount: number;
  } | null,
  marketReturnRate: number,
  annualAppreciationIncrease: number,
  totalMonthlyExpenses: number,
  maxMonthlyExpenses: number,
  tfsaContributions: boolean,
) {
  // We start by calculating the current month TFSA and stock gains
  persona.monthlyGains.tfsaGains = persona.assets.tfsa * marketReturnRate;
  persona.monthlyGains.stocksGains = persona.assets.stocks * marketReturnRate;

  persona.cumulativeGains.tfsaGains += persona.monthlyGains.tfsaGains;
  persona.cumulativeGains.stocksGains += persona.monthlyGains.stocksGains;

  persona.assets.tfsa += persona.monthlyGains.tfsaGains;
  persona.assets.stocks += persona.monthlyGains.stocksGains;

  // We appreciate the home value with a monthly appreciation rate and calculate home equity gains
  if (mortgagePayment) {
    const monthlyRate = Math.pow(1 + annualAppreciationIncrease, 1 / 12) - 1;
    persona.params.homeValue = Math.round(
      (1 + monthlyRate) * persona.params.homeValue,
    );

    const previousHomeEquity = persona.assets.homeEquity;
    persona.assets.homeEquity = Math.round(
      persona.params.homeValue -
        mortgagePayment.balance,
    );
    persona.monthlyGains.homeEquityGains = persona.assets.homeEquity -
      previousHomeEquity;
    persona.cumulativeGains.homeEquityGains +=
      persona.monthlyGains.homeEquityGains;
  }

  // Now we deal with any savings from reduced expenses
  let monthlySavings = maxMonthlyExpenses - totalMonthlyExpenses;

  // We check if we can invest these savings in the TFSA first
  if (tfsaContributions && monthlySavings > 0) {
    const tfsaRoom = getTfsaContribution(
      year,
      persona.cumulativeGains.tfsaContribution,
    );
    const tfsaContribution = Math.min(tfsaRoom, monthlySavings);

    persona.monthlyGains.tfsaContribution = tfsaContribution;
    persona.cumulativeGains.tfsaContribution += tfsaContribution;
    persona.assets.tfsa += tfsaContribution;
  } else {
    persona.monthlyGains.tfsaContribution = 0;
  }

  // Any remaining savings go into stocks
  monthlySavings -= persona.monthlyGains.tfsaContribution;
  if (monthlySavings > 0) {
    persona.monthlyGains.newStocks = monthlySavings;
    persona.cumulativeGains.newStocks += monthlySavings;
    persona.assets.stocks += monthlySavings;
  } else {
    persona.monthlyGains.newStocks = 0;
  }
}
