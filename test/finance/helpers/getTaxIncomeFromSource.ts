import { chromium } from "npm:playwright";

const WEALTHSIMPLE_OUTPUT_DIR =
  "./test/data/taxIncomeExternalSource/WealthSimple/2025";
const TURBOTAX_OUTPUT_DIR = "./test/data/taxIncomeExternalSource/TurboTax/2025";

const PROVINCES = [
  { name: "Newfoundland and Labrador", slug: "newfoundland", tt: "NL" },
  { name: "Prince Edward Island", slug: "prince-edward-island", tt: "PE" },
  { name: "Nova Scotia", slug: "nova-scotia", tt: "NS" },
  { name: "New Brunswick", slug: "new-brunswick", tt: "NB" },
  { name: "Quebec", slug: "quebec", tt: "QC" },
  { name: "Ontario", slug: "ontario", tt: "ON" },
  { name: "Manitoba", slug: "manitoba", tt: "MB" },
  { name: "Saskatchewan", slug: "saskatchewan", tt: "SK" },
  { name: "Alberta", slug: "alberta", tt: "AB" },
  { name: "British Columbia", slug: "british-columbia", tt: "BC" },
  { name: "Yukon", slug: "yukon", tt: "YT" },
  { name: "Northwest Territories", slug: "northwest-territories", tt: "NT" },
  { name: "Nunavut", slug: "nunavut", tt: "NU" },
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

async function scrapeWealthsimple(page: any) {
  await Deno.mkdir(WEALTHSIMPLE_OUTPUT_DIR, { recursive: true });

  for (const { name, slug } of PROVINCES) {
    const filePath = `${WEALTHSIMPLE_OUTPUT_DIR}/${name}.json`;

    if (await fileExists(filePath)) {
      console.log(`Wealthsimple: ${name} already exists, skipping...`);
      continue;
    }

    console.log(`Wealthsimple: Scraping ${name}...`);
    const provinceResults: Record<number, number> = {};

    await page.goto(
      `https://www.wealthsimple.com/en-ca/tool/tax-calculator/${slug}`,
    );
    await page.waitForSelector("#employmentIncome", { timeout: 60000 });

    for (const income of INCOMES) {
      await page.locator("#employmentIncome").fill(income.toString());
      await page.keyboard.press("Tab"); // Trigger calculation

      // Wait for React to calculate and update the DOM
      await page.waitForTimeout(1000);

      // Target the #totalTax element directly
      const taxText = await page.locator("#totalTax").textContent() || "";
      const match = taxText.match(/[\d,]+/); // Extracts digits and commas, ignoring the $

      provinceResults[income] = match
        ? parseInt(match[0].replace(/,/g, ""), 10)
        : 0;
      console.log(`  ${income}: $${provinceResults[income]}`);
    }

    await Deno.writeTextFile(
      filePath,
      JSON.stringify(provinceResults, null, 2),
    );
    console.log(`Results saved to ${filePath}`);
  }
}

async function scrapeTurboTax(page: any) {
  await Deno.mkdir(TURBOTAX_OUTPUT_DIR, { recursive: true });

  const url =
    "https://turbotax.intuit.ca/tax-resources/canada-income-tax-calculator.jsp";
  console.log(`TurboTax: Navigating to ${url}...`);

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
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
      const provinceSelector =
        'select#province, select[name="province"], .province-select';
      await page.waitForSelector(provinceSelector, { timeout: 10000 });
      await page.selectOption(provinceSelector, tt);
    } catch (e) {
      console.warn(
        `TurboTax: Could not select province ${name}: ${JSON.stringify(e)}`,
      );
    }

    for (const income of INCOMES) {
      try {
        const incomeSelector =
          'input#totalIncome, input#employmentIncome, input[name="income"], .income-input';
        await page.fill(incomeSelector, income.toString());
        await page.keyboard.press("Tab");
        await page.waitForTimeout(1000);

        const taxSelector =
          '.total-tax, #totalTax, .tax-result, [data-testid="total-tax"]';
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

  await scrapeWealthsimple(page);
  await scrapeTurboTax(page);

  await browser.close();
}

if (import.meta.main) {
  runScrapers();
}
