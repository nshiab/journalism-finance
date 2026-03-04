import { round } from "@nshiab/journalism-format";
import adjustToInflation from "../../../src/finance/adjustToInflation.ts";
import allRates from "../../data/allRates.json" with { type: "json" };
import { getGbmParameters } from "@nshiab/journalism-statistics";
import getParamsRentVsBuy from "./getParamsRentVsBuy.ts";

export default function getParamsRentVsBuyMonteCarlo(
  iterations: number,
  city: string,
  province: string,
  endingValues: {
    renterMonthlyInsurance: number;
    ownerMonthlyInsurance: number;
    sellingFixedFees: number;
    condoFees: number;
  },
) {
  console.log("\ncity:", city);

  const params = getParamsRentVsBuy(city, province, endingValues, true);

  // RATES
  // Yahoo Finance S&P/TSX
  const marketReturnRate = allRates.filter((d) =>
    d.geo === "Stock market" && d.variable === "S&P/TSX"
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
    tfsaContributions: true,
    combinedTaxRate: 0.21,
    renter: {
      startingMonthlyRent: params.renter.endingMonthlyRent,
      securityDeposit: params.renter.endingMonthlyRent,
      startingMonthlyInsurance: endingValues.renterMonthlyInsurance,
    },
    buyer: {
      purchasePrice: params.buyer.endingPurchasePrice,
      downPayment: Math.round(params.buyer.endingPurchasePrice * 0.1),
      purchaseFixedFees: Math.round(params.buyer.endingPurchasePrice * 0.02),
      fixedRateDiscount: 0.01,
      variableRateMargin: 0.0015,
      startingAnnualMaintenanceCost: params.buyer.endingAnnualMaintenanceCost,
      startingMonthlyCondoFees: endingValues.condoFees,
      startingAnnualPropertyTax: params.buyer.endingAnnualPropertyTax,
      startingMonthlyInsurance: endingValues.ownerMonthlyInsurance,
      sellingFixedFees: endingValues.sellingFixedFees,
      sellingCommissionRate: 0.04,
    },
    gbmParameters: {
      market: {
        // Actual values
        startValue: marketReturnRate.at(-1)!.value,
        ...getGbmParameters(
          marketReturnRate.map((d) => d.value),
          12,
        ),
      },
      rent: {
        // Using CMHC data
        startValue: rentIncreaseCMCH.at(-1)!.value,
        ...getGbmParameters(
          rentIncreaseCMCH.map((d) => d.value),
          12,
        ),
      },
      ownerInsurance: {
        // CPI
        startValue: endingValues.ownerMonthlyInsurance,
        ...getGbmParameters(
          ownerInsuranceIncrease.map((d) =>
            d.indexedValue * params.buyer.startingMonthlyInsurance
          ),
          12,
        ),
      },
      renterInsurance: {
        // CPI
        startValue: endingValues.renterMonthlyInsurance,
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
        ...getGbmParameters(
          fiveYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      fourYearInterestRates: {
        // Actual values
        startValue: fourYearInterestRates.at(-1)!.value,
        ...getGbmParameters(
          fourYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      threeYearInterestRates: {
        // Actual values
        startValue: threeYearInterestRates.at(-1)!.value,
        ...getGbmParameters(
          threeYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      twoYearInterestRates: {
        // Actual values
        startValue: twoYearInterestRates.at(-1)!.value,
        ...getGbmParameters(
          twoYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      oneYearInterestRates: {
        // Actual values
        startValue: oneYearInterestRates.at(-1)!.value,
        ...getGbmParameters(
          oneYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      variableInterestRates: {
        // Actual values
        startValue: variableInterestRates.at(-1)!.value,
        ...getGbmParameters(
          variableInterestRates.map((d) => d.value),
          12,
        ),
      },
      maintenance: {
        // CPI
        startValue: params.buyer.endingAnnualMaintenanceCost,
        ...getGbmParameters(
          maintenanceIncrease.map((d) =>
            d.indexedValue * params.buyer.startingAnnualMaintenanceCost
          ),
          12,
        ),
      },
      propertyTax: {
        // CPI
        startValue: params.buyer.endingAnnualPropertyTax,
        ...getGbmParameters(
          propertyTaxIncrease.map((d) =>
            d.indexedValue * params.buyer.startingAnnualPropertyTax
          ),
          12,
        ),
      },
      // We use the homeowners maintenance CPI as a proxy for condo fee increases
      condoFee: {
        startValue: endingValues.condoFees,
        ...getGbmParameters(
          maintenanceIncrease.map((d) =>
            d.indexedValue * params.buyer.startingMonthlyCondoFees
          ),
          12,
        ),
      },
      appreciation: {
        // Actual values
        startValue: appreciationIncrease.at(-1)!.value,
        ...getGbmParameters(
          appreciationIncrease.map((d) => d.value),
          12,
        ),
      },
      sellingFixedFees: {
        // CPI
        startValue: endingValues.sellingFixedFees,
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
