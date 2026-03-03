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

  // CPI province
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
    ...params,
    gbmParameters: {
      marketReturn: {
        startValue: marketReturnRate[0].value,
        ...getGbmParameters(
          marketReturnRate.map((d) => d.value),
          12,
        ),
      },
      rentIncrease: {
        startValue: rentIncreaseCPI[0].value,
        ...getGbmParameters(
          rentIncreaseCPI.map((d) => d.value),
          12,
        ),
      },
      ownerInsuranceIncrease: {
        startValue: ownerInsuranceIncrease[0].value,
        ...getGbmParameters(
          ownerInsuranceIncrease.map((d) => d.value),
          12,
        ),
      },
      renterInsuranceIncrease: {
        startValue: canadaRenterInsuranceIncrease[0].value,
        ...getGbmParameters(
          canadaRenterInsuranceIncrease.map((d) => d.value),
          12,
        ),
      },
      fiveYearInterestRates: {
        startValue: fiveYearInterestRates[0].value,
        ...getGbmParameters(
          fiveYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      fourYearInterestRates: {
        startValue: fourYearInterestRates[0].value,
        ...getGbmParameters(
          fourYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      threeYearInterestRates: {
        startValue: threeYearInterestRates[0].value,
        ...getGbmParameters(
          threeYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      twoYearInterestRates: {
        startValue: twoYearInterestRates[0].value,
        ...getGbmParameters(
          twoYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      oneYearInterestRates: {
        startValue: oneYearInterestRates[0].value,
        ...getGbmParameters(
          oneYearInterestRates.map((d) => d.value),
          12,
        ),
      },
      variableInterestRates: {
        startValue: variableInterestRates[0].value,
        ...getGbmParameters(
          variableInterestRates.map((d) => d.value),
          12,
        ),
      },
      maintenanceIncrease: {
        startValue: maintenanceIncrease[0].value,
        ...getGbmParameters(
          maintenanceIncrease.map((d) => d.value),
          12,
        ),
      },
      propertyTaxIncrease: {
        startValue: propertyTaxIncrease[0].value,
        ...getGbmParameters(
          propertyTaxIncrease.map((d) => d.value),
          12,
        ),
      },
      // We use the homeowners maintenance CPI as a proxy for condo fee increases
      condoFeeIncrease: {
        startValue: maintenanceIncrease[0].value,
        ...getGbmParameters(
          maintenanceIncrease.map((d) => d.value),
          12,
        ),
      },
      appreciationIncrease: {
        startValue: appreciationIncrease[0].value,
        ...getGbmParameters(
          appreciationIncrease.map((d) => d.value),
          12,
        ),
      },
      sellingFixedFeesIncrease: {
        startValue: sellingFixedFeesIncrease[0].value,
        ...getGbmParameters(
          sellingFixedFeesIncrease.map((d) => d.value),
          12,
        ),
      },
    },
  };
}
