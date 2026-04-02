import allRates from "../../data/allRates.json" with { type: "json" };
import {
  getCirParameters,
  getGbmParameters,
} from "@nshiab/journalism-statistics";
import getParamsRentVsBuy from "./getParamsRentVsBuy.ts";

/**
 * Helper function to get the parameters for the simulateRentVsBuyMonteCarlo function.
 */
export default function getParamsRentVsBuyMonteCarlo(
  iterations: number,
  city: string,
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
  employmentIncome: number;
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
    securityDeposit: number;
  };
  buyer: {
    downPayment: number;
    purchaseFixedFees: number;
    fixedRateAdjustment: number;
    variableRateAdjustment: number;
    sellingCommissionRate: number;
    floorRate: number;
  };
  stochasticParameters: {
    market: {
      mu: number;
      sigma: number;
      // Actual values
      startValue: number;
    };
    rent: {
      mu: number;
      sigma: number;
      // Using CMHC data for initial amount but CPI for growth rate
      initialAmount: number;
    };
    ownerInsurance: {
      mu: number;
      sigma: number;
      // Ending value
      initialAmount: number;
    };
    renterInsurance: {
      mu: number;
      sigma: number;
      // Ending value
      initialAmount: number;
    };
    fiveYearInterestRates: {
      a: number;
      b: number;
      sigma: number;
      // Actual values
      startValue: number;
    };
    fourYearInterestRates: {
      a: number;
      b: number;
      sigma: number;
      // Actual values
      startValue: number;
    };
    threeYearInterestRates: {
      a: number;
      b: number;
      sigma: number;
      // Actual values
      startValue: number;
    };
    twoYearInterestRates: {
      a: number;
      b: number;
      sigma: number;
      // Actual values
      startValue: number;
    };
    oneYearInterestRates: {
      a: number;
      b: number;
      sigma: number;
      // Actual values
      startValue: number;
    };
    variableInterestRates: {
      a: number;
      b: number;
      sigma: number;
      // Actual values
      startValue: number;
    };
    maintenance: {
      mu: number;
      sigma: number;
      // Ending value
      initialAmount: number;
    };
    propertyTax: {
      mu: number;
      sigma: number;
      // Ending value
      initialAmount: number;
    };
    // We use the homeowners maintenance CPI as a proxy for condo fee increases
    condoFee: { mu: number; sigma: number; initialAmount: number };
    appreciation: {
      mu: number;
      sigma: number;
      // Ending value
      initialAmount: number;
    };
    sellingFixedFees: {
      mu: number;
      sigma: number;
      // Ending value
      initialAmount: number;
    };
  };
} {
  console.log("\ncity:", city);

  const params = getParamsRentVsBuy(
    city,
    province,
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

  return {
    iterations,
    startingYear: 2025,
    numberOfYears: 25,
    tfsaContributions: params.tfsaContributions,
    annualInvestmentFeeRate: params.annualInvestmentFeeRate,
    couple: params.couple,
    employmentIncome: params.employmentIncome,
    province,
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
      sellingCommissionRate: params.buyer.sellingCommissionRate,
      floorRate: params.buyer.floorRate,
    },
    stochasticParameters: {
      market: {
        // Actual values
        startValue: marketReturnRate.at(-1)!.value,
        ...getGbmParameters(
          marketReturnRate.map((d) => d.value),
          12,
        ),
      },
      rent: {
        // Using CMHC data for initial amount but CPI for growth rate
        initialAmount: rentIncreaseCMCH.at(-1)!.value,
        ...getGbmParameters(
          rentIncreaseCPI.map((d) =>
            d.indexedValue * rentIncreaseCMCH.at(-1)!.value
          ),
          12,
        ),
      },
      ownerInsurance: {
        initialAmount: endingValues.ownerMonthlyInsurance,
        ...getGbmParameters(
          ownerInsuranceIncrease.map((d) =>
            d.indexedValue * params.buyer.startingMonthlyInsurance
          ),
          12,
        ),
      },
      renterInsurance: {
        initialAmount: endingValues.renterMonthlyInsurance,
        ...getGbmParameters(
          canadaRenterInsuranceIncrease.map((d) =>
            d.indexedValue * params.renter.startingMonthlyInsurance
          ),
          12,
        ),
      },
      fiveYearInterestRates: {
        // Actual values
        startValue: fiveYearInterestRates.at(-1)!.value,
        ...getCirParameters(
          fiveYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      fourYearInterestRates: {
        // Actual values
        startValue: fourYearInterestRates.at(-1)!.value,
        ...getCirParameters(
          fourYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      threeYearInterestRates: {
        // Actual values
        startValue: threeYearInterestRates.at(-1)!.value,
        ...getCirParameters(
          threeYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      twoYearInterestRates: {
        // Actual values
        startValue: twoYearInterestRates.at(-1)!.value,
        ...getCirParameters(
          twoYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      oneYearInterestRates: {
        // Actual values
        startValue: oneYearInterestRates.at(-1)!.value,
        ...getCirParameters(
          oneYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      variableInterestRates: {
        // Actual values
        startValue: variableInterestRates.at(-1)!.value,
        ...getCirParameters(
          variableInterestRates.map((d) => d.value),
          12,
        ),
      },
      maintenance: {
        initialAmount: params.buyer.endingAnnualMaintenanceCost,
        ...getGbmParameters(
          maintenanceIncrease.map((d) =>
            d.indexedValue * params.buyer.startingAnnualMaintenanceCost
          ),
          12,
        ),
      },
      propertyTax: {
        initialAmount: params.buyer.endingAnnualPropertyTax,
        ...getGbmParameters(
          propertyTaxIncrease.map((d) =>
            d.indexedValue * params.buyer.startingAnnualPropertyTax
          ),
          12,
        ),
      },
      // We use the homeowners maintenance CPI as a proxy for condo fee increases
      condoFee: {
        initialAmount: endingValues.condoFees,
        ...getGbmParameters(
          maintenanceIncrease.map((d) =>
            d.indexedValue * params.buyer.startingMonthlyCondoFees
          ),
          12,
        ),
      },
      appreciation: {
        initialAmount: appreciationIncrease.at(-1)!.value,
        ...getGbmParameters(
          appreciationIncrease.map((d) => d.value),
          12,
        ),
      },
      sellingFixedFees: {
        initialAmount: endingValues.sellingFixedFees,
        ...getGbmParameters(
          sellingFixedFeesIncrease.map((d) =>
            d.indexedValue * params.buyer.sellingFixedFees
          ),
          12,
        ),
      },
    },
  };
}
