const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.goto("http://localhost:5183/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Join the Community" }).click();
  await page.locator("#communityCoachModal").waitFor({ state: "visible" });
  await page.waitForTimeout(400);
  await page.locator("#communityCoachModal .modal-content").screenshot({
    path: "C:\\Users\\wilbu\\AppData\\Local\\Temp\\claude\\c--Users-wilbu-OneDrive-Desktop-elev8-fitness-website\\430ce27a-9510-4683-be7f-ce117270d75d\\scratchpad\\button-fix-check.png",
  });
  await browser.close();
})();
