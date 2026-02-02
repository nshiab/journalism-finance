import adjustToInflation from "../../../src/finance/adjustToInflation.ts";
import allRates from "../../data/allRates.json" with { type: "json" };

export default function getParams(
  city: string,
  province: string,
  combinedTaxRate: number,
  endingAnnualPropertyTax: number,
) {
  // Shared variables
  const numberOfYears = 25;

  const startingMonthlyRent = allRates.find((d) =>
    d.geo === city && d.variable === "Two-bedroom rent" && d.year === 2000.0 &&
    d.month === 1.0
  )?.value;

  if (startingMonthlyRent === undefined) {
    throw new Error(`No rent data for city: ${city}`);
  }

  const purchasePrice = allRates.find((d) =>
    d.geo === city && d.variable === "Apartment price" && d.year === 2000.0 &&
    d.month === 1.0
  )?.value;

  if (purchasePrice === undefined) {
    throw new Error(`No purchase price data for city: ${city}`);
  }

  const renterStartingMonthlyInsurance = 50;
  // console.log(
  //   {
  //     renterStartingMonthlyInsurance,
  //     renterEndingMonthlyInsurance: adjustToInflation(
  //       renterStartingMonthlyInsurance,
  //       allRates.find((d) =>
  //         d.geo === "Canada" && d.variable === "CPI Tenants insurance" &&
  //         d.year === 2000.0 && d.month === 1.0
  //       )!.indexedValue,
  //       allRates.find((d) =>
  //         d.geo === "Canada" && d.variable === "CPI Tenants insurance" &&
  //         d.year === 2024.0 && d.month === 12.0
  //       )!.indexedValue,
  //       { decimals: 0 },
  //     ),
  //   },
  // );

  const startingAnnualMaintenanceCost = 500;
  // console.log(
  //   {
  //     startingAnnualMaintenanceCost,
  //     endingAnnualMaintenanceCost: adjustToInflation(
  //       startingAnnualMaintenanceCost,
  //       allRates.find((d) =>
  //         d.geo === province && d.variable === "CPI Homeowners maintenance" &&
  //         d.year === 2000.0 && d.month === 1.0
  //       )!.indexedValue,
  //       allRates.find((d) =>
  //         d.geo === province && d.variable === "CPI Homeowners maintenance" &&
  //         d.year === 2024.0 && d.month === 12.0
  //       )!.indexedValue,
  //       { decimals: 0 },
  //     ),
  //   },
  // );

  const startingMonthlyCondoFees = 150;
  // console.log(
  //   {
  //     startingMonthlyCondoFees,
  //     endingMonthlyCondoFees: adjustToInflation(
  //       startingMonthlyCondoFees,
  //       allRates.find((d) =>
  //         d.geo === province && d.variable === "CPI Homeowners maintenance" &&
  //         d.year === 2000.0 && d.month === 1.0
  //       )!.indexedValue,
  //       allRates.find((d) =>
  //         d.geo === province && d.variable === "CPI Homeowners maintenance" &&
  //         d.year === 2024.0 && d.month === 12.0
  //       )!.indexedValue,
  //       { decimals: 0 },
  //     ),
  //   },
  // );

  const startingAnnualPropertyTax = adjustToInflation(
    endingAnnualPropertyTax,
    allRates.find((d) =>
      d.geo === province && d.variable === "CPI Property taxes & others" &&
      d.year === 2024.0 && d.month === 12.0
    )!.indexedValue,
    allRates.find((d) =>
      d.geo === province && d.variable === "CPI Property taxes & others" &&
      d.year === 2000.0 && d.month === 1.0
    )!.indexedValue,
    { decimals: 0 },
  );
  // console.log({ startingAnnualPropertyTax, endingAnnualPropertyTax });

  const buyerStartingMonthlyInsurance = 55;
  // console.log(
  //   {
  //     buyerStartingMonthlyInsurance,
  //     buyerEndingMonthlyInsurance: adjustToInflation(
  //       buyerStartingMonthlyInsurance,
  //       allRates.find((d) =>
  //         d.geo === province && d.variable === "CPI Homeowners insurance" &&
  //         d.year === 2000.0 && d.month === 1.0
  //       )!.indexedValue,
  //       allRates.find((d) =>
  //         d.geo === province && d.variable === "CPI Homeowners insurance" &&
  //         d.year === 2024.0 && d.month === 12.0
  //       )!.indexedValue,
  //       { decimals: 0 },
  //     ),
  //   },
  // );

  const sellingFixedFees = 1000;
  // console.log(
  //   {
  //     sellingFixedFees,
  //     endingSellingFixedFees: adjustToInflation(
  //       sellingFixedFees,
  //       allRates.find((d) =>
  //         d.geo === province && d.variable === "CPI All-items" &&
  //         d.year === 2000.0 && d.month === 1.0
  //       )!.indexedValue,
  //       allRates.find((d) =>
  //         d.geo === province && d.variable === "CPI All-items" &&
  //         d.year === 2024.0 && d.month === 12.0
  //       )!.indexedValue,
  //       { decimals: 0 },
  //     ),
  //   },
  // );

  return {
    startingYear: 2000,
    numberOfYears,
    tfsaContributions: true,
    combinedTaxRate,
    renter: {
      startingMonthlyRent,
      securityDeposit: startingMonthlyRent,
      startingMonthlyInsurance: renterStartingMonthlyInsurance,
    },
    buyer: {
      purchasePrice,
      downpayment: Math.round(purchasePrice * 0.10),
      purchaseFixedFees: Math.round(purchasePrice * 0.02),
      fixedRateDiscount: 0.01,
      variableRateMargin: 0.0015,
      startingAnnualMaintenanceCost,
      startingMonthlyCondoFees,
      startingAnnualPropertyTax,
      startingMonthlyInsurance: buyerStartingMonthlyInsurance,
      sellingFixedFees,
      sellingCommissionRate: 0.04,
    },
  };
}
