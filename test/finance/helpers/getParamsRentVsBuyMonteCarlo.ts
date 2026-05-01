import allRates from "../../data/allRates.json" with { type: "json" };
import {
  getCirParameters,
  getGbmParameters,
} from "@nshiab/journalism-statistics";
import getParamsRentVsBuy from "./getParamsRentVsBuy.ts";
import getRentVsBuyCholeskyMatrix from "../../../src/finance/helpers/rentVsBuy/getRentVsBuyCholeskyMatrix.ts";
import {
  type City,
  getProvinceFromCity,
} from "../../../src/finance/getLandTransferTax.ts";

/**
 * Helper function to get the parameters for the simulateRentVsBuyMonteCarlo function.
 */
export default function getParamsRentVsBuyMonteCarlo(
  iterations: number,
  city: City,
  percentages: {
    downPayment: number;
    purchaseFixedFees: number;
  },
  endingValues: {
    renterMonthlyInsurance: number;
    ownerMonthlyInsurance: number;
    sellingFixedFees: number;
    condoFees: number;
  },
  couple: boolean,
): {
  iterations: number;
  startingYear: number;
  numberOfYears: number;
  tfsaContributions: boolean;
  annualInvestmentFeeRate: number;
  couple: boolean;
  city: City;
  renter: {
    securityDeposit: number;
  };
  buyer: {
    downPayment: number;
    purchaseFixedFees: number;
    fixedRateAdjustment: number;
    variableRateAdjustment: number;
    city: City;
    firstTimeOwner: boolean;
    sellingCommissionRate: number;
    floorRate: number;
    investsSavings: boolean;
  };
  choleskyMatrix: number[][];
  stochasticParameters: {
    employmentIncome: { initialValue: number; mu: number; sigma: number };
    market: {
      mu: number;
      sigma: number;
      // Actual values
      initialValue: number;
    };
    rent: {
      mu: number;
      sigma: number;
      // Using CMHC data for initial amount but CPI for growth rate
      initialValue: number;
    };
    ownerInsurance: {
      mu: number;
      sigma: number;
      // Ending value
      initialValue: number;
    };
    renterInsurance: {
      mu: number;
      sigma: number;
      // Ending value
      initialValue: number;
    };
    fiveYearInterestRates: {
      a: number;
      b: number;
      sigma: number;
      // Actual values
      initialValue: number;
    };
    fourYearInterestRates: {
      a: number;
      b: number;
      sigma: number;
      // Actual values
      initialValue: number;
    };
    threeYearInterestRates: {
      a: number;
      b: number;
      sigma: number;
      // Actual values
      initialValue: number;
    };
    twoYearInterestRates: {
      a: number;
      b: number;
      sigma: number;
      // Actual values
      initialValue: number;
    };
    oneYearInterestRates: {
      a: number;
      b: number;
      sigma: number;
      // Actual values
      initialValue: number;
    };
    variableInterestRates: {
      a: number;
      b: number;
      sigma: number;
      // Actual values
      initialValue: number;
    };
    maintenance: {
      mu: number;
      sigma: number;
      // Ending value
      initialValue: number;
    };
    propertyTax: {
      mu: number;
      sigma: number;
      // Ending value
      initialValue: number;
    };
    // We use the homeowners maintenance CPI as a proxy for condo fee increases
    condoFee: { mu: number; sigma: number; initialValue: number };
    appreciation: {
      mu: number;
      sigma: number;
      // Ending value
      initialValue: number;
    };
    sellingFixedFees: {
      mu: number;
      sigma: number;
      // Ending value
      initialValue: number;
    };
  };
  winVariable: "balance" | "balanceAfterSelling" | "assets";
  rawHistoricalData: Record<string, number[]>;
} {
  console.log("\ncity:", city);

  const province = getProvinceFromCity(city);

  const params = getParamsRentVsBuy(
    city,
    percentages,
    endingValues,
    couple,
    true,
  );

  // RATES
  // Yahoo Finance S&P/TSX
  const marketReturnRate = allRates.filter((d) =>
    d.geo === "Stock market" && d.variable === "Balanced"
  );
  // CPI Canada
  const canadaRenterInsuranceIncrease = allRates.filter((d) =>
    d.geo === "Canada" && d.variable === "CPI Tenants insurance"
  );
  // Bank of Canada
  const fiveYearInterestRates = allRates.filter((d) =>
    d.geo === "Canada" && d.variable === "Five-year fixed mortgage rate"
  );
  // Bank of Canada interpolated
  const fourYearInterestRates = allRates.filter((d) =>
    d.geo === "Canada" && d.variable === "Four-year fixed mortgage rate"
  );
  // Bank of Canada
  const threeYearInterestRates = allRates.filter((d) =>
    d.geo === "Canada" && d.variable === "Three-year fixed mortgage rate"
  );
  // Bank of Canada interpolated
  const twoYearInterestRates = allRates.filter((d) =>
    d.geo === "Canada" && d.variable === "Two-year fixed mortgage rate"
  );
  // Bank of Canada
  const oneYearInterestRates = allRates.filter((d) =>
    d.geo === "Canada" && d.variable === "One-year fixed mortgage rate"
  );
  const variableInterestRates = allRates.filter((d) =>
    d.geo === "Canada" && d.variable === "Bank of Canada prime rate"
  );

  // CMHC city
  const rentIncreaseCMCH = allRates.filter((d) =>
    d.geo === city && d.variable === "Two-bedroom rent"
  );

  // CPI rent
  const rentIncreaseCPI = allRates.filter((d) =>
    d.geo === province && d.variable === "CPI Rent"
  );
  // CPI province
  const ownerInsuranceIncrease = allRates.filter((d) =>
    d.geo === province && d.variable === "CPI Homeowners insurance"
  );
  // CPI province
  const maintenanceIncrease = allRates.filter((d) =>
    d.geo === province && d.variable === "CPI Homeowners maintenance"
  );
  // CPI province
  const propertyTaxIncrease = allRates.filter((d) =>
    d.geo === province && d.variable === "CPI Property taxes & others"
  );
  // CREA Apartment city
  const appreciationIncrease = allRates.filter((d) =>
    d.geo === city && d.variable === "Apartment price"
  );
  // All-items CPI province
  const sellingFixedFeesIncrease = allRates.filter((d) =>
    d.geo === province && d.variable === "CPI All-items"
  );

  const rawMarket = marketReturnRate.map((d) => d.value);
  const rawRent = rentIncreaseCPI.map((d) =>
    d.indexedValue * rentIncreaseCMCH.at(-1)!.value
  );
  const rawOwnerIns = ownerInsuranceIncrease.map((d) =>
    d.indexedValue * params.buyer.startingMonthlyInsurance
  );
  const rawRenterIns = canadaRenterInsuranceIncrease.map((d) =>
    d.indexedValue * params.renter.startingMonthlyInsurance
  );
  const raw5Y = fiveYearInterestRates.map((d) => d.value);
  const raw4Y = fourYearInterestRates.map((d) => d.value);
  const raw3Y = threeYearInterestRates.map((d) => d.value);
  const raw2Y = twoYearInterestRates.map((d) => d.value);
  const raw1Y = oneYearInterestRates.map((d) => d.value);
  const rawVar = variableInterestRates.map((d) => d.value);
  const rawMaint = maintenanceIncrease.map((d) =>
    d.indexedValue * params.buyer.startingAnnualMaintenanceCost
  );
  const rawPropTax = propertyTaxIncrease.map((d) =>
    d.indexedValue * params.buyer.startingAnnualPropertyTax
  );
  const rawCondo = maintenanceIncrease.map((d) =>
    d.indexedValue * params.buyer.startingMonthlyCondoFees
  );
  const rawAppreciation = appreciationIncrease.map((d) => d.value);
  const rawSellingFixed = sellingFixedFeesIncrease.map((d) =>
    d.indexedValue * params.buyer.sellingFixedFees
  );

  // We simulate employment income using a standard constant growth for the correlation matrix test
  const minLength = Math.min(
    rawMarket.length,
    rawRent.length,
    rawOwnerIns.length,
    rawRenterIns.length,
    raw5Y.length,
    raw4Y.length,
    raw3Y.length,
    raw2Y.length,
    raw1Y.length,
    rawVar.length,
    rawMaint.length,
    rawPropTax.length,
    rawCondo.length,
    rawAppreciation.length,
    rawSellingFixed.length,
  );

  const trim = (arr: number[]) => arr.slice(-minLength);

  return {
    iterations,
    startingYear: 2025,
    numberOfYears: 25,
    tfsaContributions: params.tfsaContributions,
    annualInvestmentFeeRate: params.annualInvestmentFeeRate,
    couple: params.couple,
    city,
    renter: {
      securityDeposit: params.renter.securityDeposit,
    },
    buyer: {
      downPayment: Math.round(
        params.buyer.endingPurchasePrice * percentages.downPayment,
      ),
      purchaseFixedFees: Math.round(
        params.buyer.endingPurchasePrice * percentages.purchaseFixedFees,
      ),
      fixedRateAdjustment: params.buyer.fixedRateAdjustment,
      variableRateAdjustment: params.buyer.variableRateAdjustment,
      city: city as City,
      firstTimeOwner: true,
      sellingCommissionRate: params.buyer.sellingCommissionRate,
      floorRate: params.buyer.floorRate,
      investsSavings: true,
    },
    choleskyMatrix: getRentVsBuyCholeskyMatrix(), // Default identity for all general tests
    stochasticParameters: {
      employmentIncome: {
        initialValue: 75_000,
        mu: 0.02,
        sigma: 0.01,
      },
      market: {
        initialValue: marketReturnRate.at(-1)!.value,
        ...getGbmParameters(rawMarket, 12),
      },
      rent: {
        initialValue: rentIncreaseCMCH.at(-1)!.value,
        ...getGbmParameters(rawRent, 12),
      },
      ownerInsurance: {
        initialValue: endingValues.ownerMonthlyInsurance,
        ...getGbmParameters(rawOwnerIns, 12),
      },
      renterInsurance: {
        initialValue: endingValues.renterMonthlyInsurance,
        ...getGbmParameters(rawRenterIns, 12),
      },
      fiveYearInterestRates: {
        initialValue: fiveYearInterestRates.at(-1)!.value,
        ...getCirParameters(raw5Y, 12),
      },
      fourYearInterestRates: {
        initialValue: fourYearInterestRates.at(-1)!.value,
        ...getCirParameters(raw4Y, 12),
      },
      threeYearInterestRates: {
        initialValue: threeYearInterestRates.at(-1)!.value,
        ...getCirParameters(raw3Y, 12),
      },
      twoYearInterestRates: {
        initialValue: twoYearInterestRates.at(-1)!.value,
        ...getCirParameters(raw2Y, 12),
      },
      oneYearInterestRates: {
        initialValue: oneYearInterestRates.at(-1)!.value,
        ...getCirParameters(raw1Y, 12),
      },
      variableInterestRates: {
        initialValue: variableInterestRates.at(-1)!.value,
        ...getCirParameters(rawVar, 12),
      },
      maintenance: {
        initialValue: params.buyer.endingAnnualMaintenanceCost,
        ...getGbmParameters(rawMaint, 12),
      },
      propertyTax: {
        initialValue: params.buyer.endingAnnualPropertyTax,
        ...getGbmParameters(rawPropTax, 12),
      },
      condoFee: {
        initialValue: endingValues.condoFees,
        ...getGbmParameters(rawCondo, 12),
      },
      appreciation: {
        initialValue: appreciationIncrease.at(-1)!.value,
        ...getGbmParameters(rawAppreciation, 12),
      },
      sellingFixedFees: {
        initialValue: endingValues.sellingFixedFees,
        ...getGbmParameters(rawSellingFixed, 12),
      },
    },
    winVariable: "balanceAfterSelling" as const,
    rawHistoricalData: {
      employmentIncome: Array.from(
        { length: minLength },
        (_, i) => 75000 * Math.pow(1.02, i / 12),
      ),
      market: trim(rawMarket),
      rent: trim(rawRent),
      ownerInsurance: trim(rawOwnerIns),
      renterInsurance: trim(rawRenterIns),
      maintenance: trim(rawMaint),
      propertyTax: trim(rawPropTax),
      condoFee: trim(rawCondo),
      appreciation: trim(rawAppreciation),
      sellingFixedFees: trim(rawSellingFixed),
      fiveYearInterestRates: trim(raw5Y),
      fourYearInterestRates: trim(raw4Y),
      threeYearInterestRates: trim(raw3Y),
      twoYearInterestRates: trim(raw2Y),
      oneYearInterestRates: trim(raw1Y),
      variableInterestRates: trim(rawVar),
    },
  };
}
