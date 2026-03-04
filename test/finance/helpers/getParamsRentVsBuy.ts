import { round } from "@nshiab/journalism-format";
import adjustToInflation from "../../../src/finance/adjustToInflation.ts";
import allRates from "../../data/allRates.json" with { type: "json" };

export default function getParamsRentVsBuy(
  city: string,
  province: string,
  endingValues: {
    renterMonthlyInsurance: number;
    ownerMonthlyInsurance: number;
    sellingFixedFees: number;
    condoFees: number;
  },
  noRates: true,
): {
  startingYear: number;
  numberOfYears: number;
  tfsaContributions: boolean;
  combinedTaxRate: number;
  renter: {
    startingMonthlyRent: number;
    endingMonthlyRent: number;
    securityDeposit: number;
    startingMonthlyInsurance: number;
  };
  buyer: {
    purchasePrice: number;
    endingPurchasePrice: number;
    downPayment: number;
    purchaseFixedFees: number;
    fixedRateDiscount: number;
    variableRateMargin: number;
    startingAnnualMaintenanceCost: number;
    endingAnnualMaintenanceCost: number;
    startingMonthlyCondoFees: number;
    startingAnnualPropertyTax: number;
    endingAnnualPropertyTax: number;
    startingMonthlyInsurance: number;
    sellingFixedFees: number;
    sellingCommissionRate: number;
  };
};
export default function getParamsRentVsBuy(
  city: string,
  province: string,
  endingValues: {
    renterMonthlyInsurance: number;
    ownerMonthlyInsurance: number;
    sellingFixedFees: number;
    condoFees: number;
  },
  noRates?: false,
): {
  startingYear: number;
  numberOfYears: number;
  tfsaContributions: boolean;
  combinedTaxRate: number;
  renter: {
    startingMonthlyRent: number;
    endingMonthlyRent: number;
    securityDeposit: number;
    startingMonthlyInsurance: number;
  };
  buyer: {
    purchasePrice: number;
    endingPurchasePrice: number;
    downPayment: number;
    purchaseFixedFees: number;
    fixedRateDiscount: number;
    variableRateMargin: number;
    startingAnnualMaintenanceCost: number;
    endingAnnualMaintenanceCost: number;
    startingMonthlyCondoFees: number;
    startingAnnualPropertyTax: number;
    endingAnnualPropertyTax: number;
    startingMonthlyInsurance: number;
    sellingFixedFees: number;
    sellingCommissionRate: number;
  };
  rates: {
    marketReturnRate: number[];
    rentIncrease: number[];
    ownerInsuranceIncrease: number[];
    renterInsuranceIncrease: number[];
    fiveYearInterestRates: number[];
    fourYearInterestRates: number[];
    threeYearInterestRates: number[];
    twoYearInterestRates: number[];
    oneYearInterestRates: number[];
    variableInterestRates: number[];
    maintenanceIncrease: number[];
    propertyTaxIncrease: number[];
    condoFeeIncrease: number[];
    appreciationIncrease: number[];
    sellingFixedFeesIncrease: number[];
  };
  allRatesFiltered: any[];
};
export default function getParamsRentVsBuy(
  city: string,
  province: string,
  endingValues: {
    renterMonthlyInsurance: number;
    ownerMonthlyInsurance: number;
    sellingFixedFees: number;
    condoFees: number;
  },
  noRates?: boolean,
) {
  console.log("\ncity:", city);

  // Shared variables
  const numberOfYears = 25;
  let combinedTaxRate;
  // $75,000 dollars in 2025
  // https://turbotax.intuit.ca/tax-resources/canada-income-tax-calculator
  if (province === "Quebec") {
    combinedTaxRate = 0.21;
  }

  if (combinedTaxRate === undefined) {
    throw new Error(`No tax data for province: ${province}`);
  }

  // Renter
  const startingMonthlyRent = allRates.find((d) =>
    d.geo === city && d.variable === "Two-bedroom rent" && d.year === 2000 &&
    d.month === 1
  )?.value;

  const endingMonthlyRent = allRates.find((d) =>
    d.geo === city && d.variable === "Two-bedroom rent" && d.year === 2024 &&
    d.month === 12
  )?.value!;
  console.log(
    "endingMonthlyRent:",
    endingMonthlyRent,
  );

  if (startingMonthlyRent === undefined) {
    throw new Error(`No rent data for city: ${city}`);
  }

  const renterStartingMonthlyInsurance = adjustToInflation(
    endingValues.renterMonthlyInsurance,
    allRates.find((d) =>
      d.geo === province && d.variable === "CPI Rent" && d.year === 2024 &&
      d.month === 12
    )!.indexedValue,
    allRates.find((d) =>
      d.geo === province && d.variable === "CPI Rent" && d.year === 2000 &&
      d.month === 1
    )!.indexedValue,
    { decimals: 0 },
  );

  // Homeowner
  const purchasePrice = allRates.find((d) =>
    d.geo === city && d.variable === "Apartment price" && d.year === 2000 &&
    d.month === 1
  )?.value;

  if (purchasePrice === undefined) {
    throw new Error(`No purchase price data for city: ${city}`);
  }
  const endingHomeValue = allRates.find((d) =>
    d.geo === city && d.variable === "Apartment price" && d.year === 2024 &&
    d.month === 12
  )?.value;
  console.log("endingHomeValue:", endingHomeValue);

  if (endingHomeValue === undefined) {
    throw new Error(`No purchase price data for city: ${city} in 2024`);
  }

  let startingAnnualPropertyTax;
  let endingAnnualPropertyTax;
  if (city === "Montreal") {
    // https://wowa.ca/taxes/montreal-property-tax
    endingAnnualPropertyTax = round(0.00710320 * endingHomeValue, {
      decimals: 0,
    });
    startingAnnualPropertyTax = adjustToInflation(
      endingAnnualPropertyTax,
      allRates.find((d) =>
        d.geo === province && d.variable === "CPI Property taxes & others" &&
        d.year === 2024 && d.month === 12
      )!.indexedValue,
      allRates.find((d) =>
        d.geo === province && d.variable === "CPI Property taxes & others" &&
        d.year === 2000 && d.month === 1
      )!.indexedValue,
      { decimals: 0 },
    );
  }

  console.log("endingAnnualPropertyTax:", endingAnnualPropertyTax);

  if (
    startingAnnualPropertyTax === undefined ||
    endingAnnualPropertyTax === undefined
  ) {
    throw new Error(`No property tax data for city: ${city}`);
  }

  const ownerStartingMonthlyInsurance = adjustToInflation(
    endingValues.ownerMonthlyInsurance,
    allRates.find((d) =>
      d.geo === province && d.variable === "CPI Homeowners insurance" &&
      d.year === 2024 && d.month === 12
    )!.indexedValue,
    allRates.find((d) =>
      d.geo === province && d.variable === "CPI Homeowners insurance" &&
      d.year === 2000 && d.month === 1
    )!.indexedValue,
    { decimals: 0 },
  );

  const startingSellingFixedFees = adjustToInflation(
    endingValues.sellingFixedFees,
    allRates.find((d) =>
      d.geo === province && d.variable === "CPI All-items" && d.year === 2024 &&
      d.month === 12
    )!.indexedValue,
    allRates.find((d) =>
      d.geo === province && d.variable === "CPI All-items" && d.year === 2000 &&
      d.month === 1
    )!.indexedValue,
    { decimals: 0 },
  );
  console.log("startingSellingFixedFees:", startingSellingFixedFees);

  const startingMonthlyCondoFees = adjustToInflation(
    endingValues.condoFees,
    allRates.find((d) =>
      d.geo === province && d.variable === "CPI Homeowners maintenance" &&
      d.year === 2024 &&
      d.month === 12
    )!.indexedValue,
    allRates.find((d) =>
      d.geo === province && d.variable === "CPI Homeowners maintenance" &&
      d.year === 2000 &&
      d.month === 1
    )!.indexedValue,
    { decimals: 0 },
  );
  console.log("startingMonthlyCondoFees:", startingMonthlyCondoFees);

  // We use 1% overall estimate
  const endingMonthlyMaintenanceCost = ((endingHomeValue * 0.01) / 12) -
    endingValues.condoFees;
  const endingAnnualMaintenanceCost = endingMonthlyMaintenanceCost > 0
    ? Math.round(endingMonthlyMaintenanceCost * 12)
    : 0;
  console.log("endingAnnualMaintenanceCost:", endingAnnualMaintenanceCost);

  const startingAnnualMaintenanceCost = adjustToInflation(
    endingAnnualMaintenanceCost,
    allRates.find((d) =>
      d.geo === province && d.variable === "CPI Homeowners maintenance" &&
      d.year === 2024 &&
      d.month === 12
    )!.indexedValue,
    allRates.find((d) =>
      d.geo === province && d.variable === "CPI Homeowners maintenance" &&
      d.year === 2000 &&
      d.month === 1
    )!.indexedValue,
    { decimals: 0 },
  );
  console.log("startingAnnualMaintenanceCost:", startingAnnualMaintenanceCost);

  if (noRates) {
    return {
      startingYear: 2000,
      numberOfYears,
      tfsaContributions: true,
      combinedTaxRate,
      renter: {
        startingMonthlyRent,
        endingMonthlyRent,
        securityDeposit: startingMonthlyRent,
        startingMonthlyInsurance: renterStartingMonthlyInsurance,
      },
      buyer: {
        purchasePrice,
        endingPurchasePrice: endingHomeValue,
        downPayment: Math.round(purchasePrice * 0.10),
        purchaseFixedFees: Math.round(purchasePrice * 0.02),
        fixedRateDiscount: 0.01,
        variableRateMargin: 0.0015,
        startingAnnualMaintenanceCost,
        endingAnnualMaintenanceCost,
        startingMonthlyCondoFees,
        startingAnnualPropertyTax,
        endingAnnualPropertyTax,
        startingMonthlyInsurance: ownerStartingMonthlyInsurance,
        sellingFixedFees: startingSellingFixedFees,
        sellingCommissionRate: 0.04,
      },
    };
  } else {
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
      startingYear: 2000,
      numberOfYears,
      tfsaContributions: true,
      combinedTaxRate,
      renter: {
        startingMonthlyRent,
        endingMonthlyRent,
        securityDeposit: startingMonthlyRent,
        startingMonthlyInsurance: renterStartingMonthlyInsurance,
      },
      buyer: {
        purchasePrice,
        endingPurchasePrice: endingHomeValue,
        downPayment: Math.round(purchasePrice * 0.10),
        purchaseFixedFees: Math.round(purchasePrice * 0.02),
        fixedRateDiscount: 0.01,
        variableRateMargin: 0.0015,
        startingAnnualMaintenanceCost,
        endingAnnualMaintenanceCost,
        startingMonthlyCondoFees,
        startingAnnualPropertyTax,
        endingAnnualPropertyTax,
        startingMonthlyInsurance: ownerStartingMonthlyInsurance,
        sellingFixedFees: startingSellingFixedFees,
        sellingCommissionRate: 0.04,
      },
      rates: {
        marketReturnRate: marketReturnRate.map((d) => d.pctChange),
        rentIncrease: rentIncreaseCMCH.map((d) => d.pctChange),
        ownerInsuranceIncrease: ownerInsuranceIncrease.map((d) => d.pctChange),
        renterInsuranceIncrease: canadaRenterInsuranceIncrease.map((d) =>
          d.pctChange
        ),
        fiveYearInterestRates: fiveYearInterestRates.map((d) => d.value),
        fourYearInterestRates: fourYearInterestRates.map((d) => d.value),
        threeYearInterestRates: threeYearInterestRates.map((d) => d.value),
        twoYearInterestRates: twoYearInterestRates.map((d) => d.value),
        oneYearInterestRates: oneYearInterestRates.map((d) => d.value),
        variableInterestRates: variableInterestRates.map((d) => d.value),
        maintenanceIncrease: maintenanceIncrease.map((d) => d.pctChange),
        propertyTaxIncrease: propertyTaxIncrease.map((d) => d.pctChange),
        condoFeeIncrease: maintenanceIncrease.map((d) => d.pctChange),
        appreciationIncrease: appreciationIncrease.map((d) => d.pctChange),
        sellingFixedFeesIncrease: sellingFixedFeesIncrease.map((d) =>
          d.pctChange
        ),
      },
      allRatesFiltered: [
        ...appreciationIncrease,
        ...marketReturnRate,
        ...rentIncreaseCMCH,
        ...ownerInsuranceIncrease,
        ...canadaRenterInsuranceIncrease,
        ...maintenanceIncrease,
        ...propertyTaxIncrease,
        ...sellingFixedFeesIncrease,
        ...fiveYearInterestRates,
        ...fourYearInterestRates,
        ...threeYearInterestRates,
        ...twoYearInterestRates,
        ...oneYearInterestRates,
        ...variableInterestRates,
      ],
    };
  }
}
