import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const root = new URL("../outputs/", import.meta.url);
await mkdir(root, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const widths = [360, 390, 768, 1024, 1440];
const report = [];

for (const width of widths) {
  const height = width <= 520 ? 844 : width <= 768 ? 900 : 900;
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:4177/", { waitUntil: "networkidle" });
  await page.locator(".pcx-product:not(.pcx-product--skeleton)").first().waitFor({ timeout: 15000 });
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    h1: document.querySelector("h1")?.textContent?.trim(),
    products: document.querySelectorAll(".pcx-product:not(.pcx-product--skeleton)").length,
    visibleProducts: [...document.querySelectorAll(".pcx-product:not(.pcx-product--skeleton)")].filter((node) => getComputedStyle(node).display !== "none").length,
  }));
  if (width === 1440) await page.screenshot({ path: new URL("homepage-desktop-1440.png", root).pathname.slice(1), fullPage: true });
  if (width === 390) await page.screenshot({ path: new URL("homepage-mobile-390.png", root).pathname.slice(1), fullPage: true });
  await page.locator(".pcx-product:not(.pcx-product--skeleton)").first().click();
  const modalOpen = await page.getByRole("dialog").isVisible();
  await page.keyboard.press("Escape");
  const modalClosed = await page.getByRole("dialog").count() === 0;
  report.push({ width, ...metrics, overflow: metrics.scrollWidth > metrics.clientWidth, modalOpen, modalClosed, errors });
  await page.close();
}

console.log(JSON.stringify(report, null, 2));
await browser.close();
