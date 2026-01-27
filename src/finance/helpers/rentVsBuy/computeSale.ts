import getMortgagePenalty from "./getMortgagePenalty.ts";

export default function computeSale(
  monthIndex: number,
  persona: {
    params: {
      homeValue: number;
      purchaseFixedFees: number;
      sellingFixedFees: number;
      sellingCommissionRate: number;
    };
    cumulativeGains: {
      newStocks: number;
    };
    assets: {
      tfsa: number;
      stocks: number;
      securityDeposit: number;
      homeEquity: number;
    };
    saleCosts: {
      stockTaxes: number;
      homeSellingCommission: number;
      homeSellingFixedFees: number;
      mortgagePenalty: number;
    };
    saleNetGains: {
      stockSellingGains: number;
      tfsaSellingGains: number;
      homeSellingGains: number;
      securityDeposit: number;
    };
  },
  combinedTaxRate: number,
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
    fixedRateDiscount: number;
    variableRateMargin: number;
  } | null,
  currentPostedRates: Record<number, number> | null,
  mortgageType: "fixed" | "variable" | null,
) {
  // First we calculate the sale costs
  const stockGains = persona.assets.stocks - persona.cumulativeGains.newStocks;
  persona.saleCosts.stockTaxes = stockGains > 0
    ? Math.round((stockGains / 2) * combinedTaxRate)
    : 0;

  // Then we calculate the home selling costs
  if (mortgagePayment && currentPostedRates && mortgageType) {
    persona.saleCosts.homeSellingCommission = Math.round(
      persona.params.homeValue * persona.params.sellingCommissionRate,
    );
    persona.saleCosts.homeSellingFixedFees = persona.params.sellingFixedFees;
    const remainingMonthsToTerm = 60 - (monthIndex % 60) - 1;
    const mortgagePenalty = getMortgagePenalty({
      remainingMonthsToTerm,
      mortgageBalance: mortgagePayment.balance,
      postedInterestRate: mortgagePayment.postedInterestRate,
      rateDiscount: mortgagePayment.fixedRateDiscount,
      currentPostedRates,
      mortgageType,
    });
    persona.saleCosts.mortgagePenalty = mortgagePenalty;
  }

  // Now we calculate the sale gains
  persona.saleNetGains.stockSellingGains = persona.assets.stocks -
    persona.saleCosts.stockTaxes;
  persona.saleNetGains.tfsaSellingGains = persona.assets.tfsa;
  persona.saleNetGains.homeSellingGains = Math.round(
    persona.params.homeValue -
      persona.saleCosts.homeSellingCommission -
      persona.saleCosts.homeSellingFixedFees -
      persona.saleCosts.mortgagePenalty,
  );
  persona.saleNetGains.securityDeposit = persona.assets.securityDeposit;
}
