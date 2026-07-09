const { chromium } = require("playwright");

let pass = 0;
let fail = 0;
function log(label, ok, extra) {
  if (ok) pass++;
  else fail++;
  console.log(`[${ok ? "PASS" : "FAIL"}] ${label}${extra ? " — " + extra : ""}`);
}
function decodedText(href) {
  return decodeURIComponent((href || "").split("text=")[1] || "");
}

async function checkTrigger(page, { label, url, findTrigger, modalId, expectedTextIncludes, expectedNumber, checkBothCoaches }) {
  await page.goto(url, { waitUntil: "networkidle" });
  const trigger = await findTrigger(page);
  await trigger.click();
  const modal = page.locator(`#${modalId}`);
  try {
    await modal.waitFor({ state: "visible", timeout: 5000 });
  } catch (e) {
    log(`${label}: modal opens`, false, String(e));
    return;
  }
  log(`${label}: modal opens`, true);

  const cardCount = await modal.locator(".coach-select-card").count();
  log(`${label}: has 2 coach cards`, cardCount === 2, `count=${cardCount}`);

  // Button sizing check: both "Message X" buttons should have the same height (no wrap)
  const heights = await modal.locator(".coach-select-card .btn").evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().height)));
  log(`${label}: Message buttons equal height (no wrap)`, heights.length === 2 && heights[0] === heights[1], JSON.stringify(heights));

  const rajCard = modal.locator(".coach-select-card").filter({ hasText: "Raj" });
  const href = await rajCard.locator("a.btn").getAttribute("href");
  const text = decodedText(href);
  const numberOk = (href || "").startsWith(`https://wa.me/${expectedNumber}?text=`);
  const textOk = expectedTextIncludes.every((s) => text.includes(s));
  log(`${label}: Raj href number correct`, numberOk, href);
  log(`${label}: Raj message correct`, textOk, text);

  if (checkBothCoaches) {
    const nimayCard = modal.locator(".coach-select-card").filter({ hasText: "Nimay" });
    const nimayHref = await nimayCard.locator("a.btn").getAttribute("href");
    const nimayOk = (nimayHref || "").startsWith("https://wa.me/919168980624?text=");
    log(`${label}: Nimay href number correct`, nimayOk, nimayHref);
  }

  await page.keyboard.press("Escape");
  await modal.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("pageerror", (err) => console.log("PAGEERROR:", String(err)));

  const stacks = [
    { label: "React", base: "http://localhost:5183" },
    { label: "Legacy", base: "http://localhost:5184/html" },
  ];

  for (const stack of stacks) {
    const ext = stack.label === "Legacy" ? ".html" : "";

    // HOME — Chat on WhatsApp (CTA band) now uses trial modal
    await checkTrigger(page, {
      label: `${stack.label} Home 'Chat on WhatsApp'`,
      url: `${stack.base}/`,
      findTrigger: (p) => p.getByRole("button", { name: "Chat on WhatsApp" }),
      modalId: "trialCoachModal",
      expectedTextIncludes: ["Hi Raj!", "book a free trial"],
      expectedNumber: "917066131474",
      checkBothCoaches: true,
    });

    // COACHES — Book a Free Trial
    await checkTrigger(page, {
      label: `${stack.label} Coaches 'Book a Free Trial'`,
      url: `${stack.base}/coaches${ext}`,
      findTrigger: (p) => p.getByRole("button", { name: "Book a Free Trial" }),
      modalId: "coachesTrialCoachModal",
      expectedTextIncludes: ["Hi Raj!", "book a free trial"],
      expectedNumber: "917066131474",
      checkBothCoaches: true,
    });

    // MEMBERSHIP — Book on WhatsApp (Free Trial card)
    await checkTrigger(page, {
      label: `${stack.label} Membership 'Book on WhatsApp'`,
      url: `${stack.base}/membership${ext}`,
      findTrigger: (p) => p.getByRole("button", { name: "Book on WhatsApp" }),
      modalId: "membershipTrialCoachModal",
      expectedTextIncludes: ["Hi Raj!", "book a free trial"],
      expectedNumber: "917066131474",
      checkBothCoaches: true,
    });

    // MEMBERSHIP — Book Free Trial (CTA band, same modal)
    await checkTrigger(page, {
      label: `${stack.label} Membership 'Book Free Trial'`,
      url: `${stack.base}/membership${ext}`,
      findTrigger: (p) => p.getByRole("button", { name: "Book Free Trial" }),
      modalId: "membershipTrialCoachModal",
      expectedTextIncludes: ["Hi Raj!", "book a free trial"],
      expectedNumber: "917066131474",
      checkBothCoaches: false,
    });

    // No bypass wa.me links remain on these 3 newly-fixed pages (+ home)
    for (const pg of ["", "coaches", "membership"]) {
      const url = pg === "" ? `${stack.base}/` : `${stack.base}/${pg}${ext}`;
      await page.goto(url, { waitUntil: "networkidle" });
      const bypass = await page.$$eval('a[href^="https://wa.me/"]', (els) =>
        els.filter((el) => !el.classList.contains("sf-social-icon") && !el.closest(".modal")).map((el) => el.outerHTML)
      );
      log(`${stack.label} ${pg || "home"}: no bypass wa.me links`, bypass.length === 0, JSON.stringify(bypass));
    }
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
})().catch((e) => {
  console.error("SCRIPT ERROR:", e);
  process.exit(1);
});
