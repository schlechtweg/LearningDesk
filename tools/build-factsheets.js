// Renders the factsheet HTML sources in tools/factsheets/ to one-page A4 PDFs in docs/factsheets/.
// Usage: node tools/build-factsheets.js   (requires Playwright with Chromium)
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const SRC = path.join(__dirname, "factsheets");
const OUT = path.join(__dirname, "..", "docs", "factsheets");
const NAMES = ["osmose", "natrium-kalium-pumpe", "ableiten", "binomische-formeln", "bruchterme", "classpad"];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const name of NAMES) {
    await page.goto("file://" + path.join(SRC, name + ".html"), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    // fail loudly if the content does not fit on one page
    const overflow = await page.evaluate(() => { const p = document.querySelector(".page"); return p.scrollHeight - p.clientHeight; });
    const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
    const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
    fs.writeFileSync(path.join(OUT, name + ".pdf"), pdf);
    console.log(`${name}.pdf  pages=${pages}  overflow=${overflow}px`);
  }
  await browser.close();
})();
