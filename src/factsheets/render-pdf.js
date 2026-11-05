// Renders factsheet HTML sources to one-page A4 PDFs and fails if a sheet does not fit on one page.
// Usage: node src/factsheets/render-pdf.js <sourceDir> <outDir>   (requires Playwright with Chromium)
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const [SRC, OUT] = process.argv.slice(2).map((p) => path.resolve(p));
const NAMES = fs.readdirSync(SRC).filter((f) => f.endsWith(".html")).map((f) => f.replace(/\.html$/, ""));

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
    if (pages !== 1 || overflow > 0) process.exitCode = 1;
  }
  await browser.close();
})();
