import { expect, test } from "@playwright/test";

const appUrl = process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://localhost:8080/";

async function openProductResults(page: import("@playwright/test").Page) {
  await page.goto(appUrl);
  const search = page.locator("#pcx-search-input");
  await search.fill("leite");
  const results = page.locator("#pcx-search-results");
  await expect(results).toBeVisible();
  await expect(results.getByRole("option").first()).toBeVisible();
  return { search, results };
}

for (const viewport of [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 375, height: 811 },
]) {
  test(`search results stay fully visible at the top on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const { search, results } = await openProductResults(page);

    const geometry = await results.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const headerBottom = document.querySelector(".pcx-header")?.getBoundingClientRect().bottom ?? 0;
      return {
        top: rect.top,
        bottom: rect.bottom,
        headerBottom,
        viewportHeight: window.innerHeight,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
      };
    });

    expect(geometry.top).toBeGreaterThanOrEqual(geometry.headerBottom);
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight);
    expect(geometry.scrollHeight).toBeLessThanOrEqual(geometry.clientHeight + 1);

    const optionCount = await results.getByRole("option").count();
    for (let index = 0; index < optionCount; index += 1) await search.press("ArrowDown");
    const selected = results.getByRole("option", { selected: true });
    await expect(selected).toBeVisible();
    await expect(selected).toHaveAttribute("id", `pcx-result-${optionCount - 1}`);
  });
}
