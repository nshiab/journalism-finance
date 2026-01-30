export type MortgagePayment = {
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
};
