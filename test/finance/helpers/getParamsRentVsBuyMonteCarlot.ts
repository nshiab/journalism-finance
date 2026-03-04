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
    ...params,
    gbmParameters: {
      market: {
        // Actual values
        startValue: marketReturnRate[0].value,
        ...getGbmParameters(
          marketReturnRate.map((d) => d.value),
          12,
        ),
      },
      rent: {
        // Using CMHC data
        startValue: params.renter.startingMonthlyRent,
        ...getGbmParameters(
          rentIncreaseCMCH.map((d) => d.value),
          12,
        ),
      },
      ownerInsurance: {
        // CPI
        startValue: params.buyer.startingMonthlyInsurance,
        ...getGbmParameters(
          ownerInsuranceIncrease.map((d) =>
            d.indexedValue * params.buyer.startingMonthlyInsurance
          ),
          12,
        ),
      },
      renterInsurance: {
        // CPI
        startValue: params.renter.startingMonthlyInsurance,
        ...getGbmParameters(
          canadaRenterInsuranceIncrease.map((d) =>
            d.indexedValue * params.renter.startingMonthlyInsurance
          ),
          12,
        ),
      },
      fiveYearInterestRates: {
        // Actual values
        startValue: fiveYearInterestRates[0].value,
        ...getGbmParameters(
          fiveYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      fourYearInterestRates: {
        // Actual values
        startValue: fourYearInterestRates[0].value,
        ...getGbmParameters(
          fourYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      threeYearInterestRates: {
        // Actual values
        startValue: threeYearInterestRates[0].value,
        ...getGbmParameters(
          threeYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      twoYearInterestRates: {
        // Actual values
        startValue: twoYearInterestRates[0].value,
        ...getGbmParameters(
          twoYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      oneYearInterestRates: {
        // Actual values
        startValue: oneYearInterestRates[0].value,
        ...getGbmParameters(
          oneYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      variableInterestRates: {
        // Actual values
        startValue: variableInterestRates[0].value,
        ...getGbmParameters(
          variableInterestRates.map((d) => d.value),
          12,
        ),
      },
      maintenance: {
        // CPI
        startValue: params.buyer.startingAnnualMaintenanceCost,
        ...getGbmParameters(
          maintenanceIncrease.map((d) =>
            d.indexedValue * params.buyer.startingAnnualMaintenanceCost
          ),
          12,
        ),
      },
      propertyTax: {
        // CPI
        startValue: params.buyer.startingAnnualPropertyTax,
        ...getGbmParameters(
          propertyTaxIncrease.map((d) =>
            d.indexedValue * params.buyer.startingAnnualPropertyTax
          ),
          12,
        ),
      },
      // We use the homeowners maintenance CPI as a proxy for condo fee increases
      condoFee: {
        startValue: params.buyer.startingMonthlyCondoFees,
        ...getGbmParameters(
          maintenanceIncrease.map((d) =>
            d.indexedValue * params.buyer.startingMonthlyCondoFees
          ),
          12,
        ),
      },
      appreciation: {
        // Actual values
        startValue: appreciationIncrease[0].value,
        ...getGbmParameters(
          appreciationIncrease.map((d) => d.value),
          12,
        ),
      },
      sellingFixedFees: {
        // CPI
        startValue: params.buyer.sellingFixedFees,
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
