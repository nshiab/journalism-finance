import { chromium } from "npm:playwright";

const TURBOTAX_OUTPUT_DIR = "./test/data/taxIncomeExternalSource/TurboTax/2025";

const PROVINCES = [
  { name: "Newfoundland and Labrador", slug: "newfoundland", tt: "10" },
  { name: "Prince Edward Island", slug: "prince-edward-island", tt: "9" },
  { name: "Nova Scotia", slug: "nova-scotia", tt: "8" },
  { name: "New Brunswick", slug: "new-brunswick", tt: "7" },
  { name: "Quebec", slug: "quebec", tt: "6" },
  { name: "Ontario", slug: "ontario", tt: "5" },
  { name: "Manitoba", slug: "manitoba", tt: "4" },
  { name: "Saskatchewan", slug: "saskatchewan", tt: "3" },
  { name: "Alberta", slug: "alberta", tt: "2" },
  { name: "British Columbia", slug: "british-columbia", tt: "1" },
  { name: "Yukon", slug: "yukon", tt: "11" },
  { name: "Northwest Territories", slug: "northwest-territories", tt: "12" },
  { name: "Nunavut", slug: "nunavut", tt: "17" },
];

const INCOMES = [
  0,
  5000,
  10000,
  15000,
  20000,
  25000,
  30000,
  35000,
  40000,
  45000,
  50000,
  60000,
  70000,
  80000,
  90000,
  100000,
  110000,
  120000,
  130000,
  140000,
  150000,
  160000,
  170000,
  180000,
  190000,
  200000,
  300000,
  400000,
  500000,
];

async function fileExists(path: string) {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}

async function scrapeTurboTax(page: any) {
  await Deno.mkdir(TURBOTAX_OUTPUT_DIR, { recursive: true });

  const url =
    "https://turbotax.intuit.ca/tax-resources/canada-income-tax-calculator";
  console.log(`TurboTax: Navigating to ${url}...`);

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Handle TurboTax popup
    const popupCloseButton =
      "#email-capture-modal-2026 > div > div.Modal-controlsWrapper-3cf3cc3 > button";
    try {
      await page.waitForSelector(popupCloseButton, { timeout: 5000 });
      await page.click(popupCloseButton);
      console.log("TurboTax: Closed popup");
    } catch (e) {
      console.log("TurboTax: Popup not found or already closed");
    }
  } catch (e) {
    console.error("TurboTax: Failed to load page:", JSON.stringify(e));
    return;
  }

  for (const { name, tt } of PROVINCES) {
    const filePath = `${TURBOTAX_OUTPUT_DIR}/${name}.json`;

    if (await fileExists(filePath)) {
      console.log(`TurboTax: ${name} already exists, skipping...`);
      continue;
    }

    console.log(`TurboTax: Scraping ${name}...`);
    const provinceResults: Record<number, number> = {};

    try {
      const provinceSelector = "#province";
      await page.waitForSelector(provinceSelector, { timeout: 10000 });
      await page.selectOption(provinceSelector, tt);
    } catch (e) {
      console.warn(
        `TurboTax: Could not select province ${name}: ${JSON.stringify(e)}`,
      );
    }

    for (const income of INCOMES) {
      try {
        const incomeSelector = "#income";
        await page.fill(incomeSelector, income.toString());
        await page.keyboard.press("Tab");
        await page.waitForTimeout(2000);

        const taxSelector =
          "#collapsible-panel-1 > div > table > tbody > tr.border-top > td > strong";
        const taxText = await page.innerText(taxSelector).catch(() => "0");
        const match = taxText.match(/[\d,]+/);
        provinceResults[income] = match
          ? parseInt(match[0].replace(/,/g, ""), 10)
          : 0;
        console.log(`  ${income}: $${provinceResults[income]}`);
      } catch (e) {
        provinceResults[income] = 0;
      }
    }

    await Deno.writeTextFile(
      filePath,
      JSON.stringify(provinceResults, null, 2),
    );
    console.log(`Results saved to ${filePath}`);
  }
}

async function runScrapers() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    locale: "en-CA",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  await scrapeTurboTax(page);

  await browser.close();
}

if (import.meta.main) {
  runScrapers();
}
