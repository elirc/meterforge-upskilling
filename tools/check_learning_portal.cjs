// Optional browser smoke check; no app dependencies or browser downloads required.
// Supply an existing Playwright installation through NODE_PATH, or set
// METERFORGE_PLAYWRIGHT_MODULE to its package directory. Start the API first.
// PowerShell example: $env:METERFORGE_BASE_URL='http://localhost:5012'; node tools/check_learning_portal.cjs
// Screenshots go to the OS temp directory unless METERFORGE_SCREENSHOT_DIR is set.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require(process.env.METERFORGE_PLAYWRIGHT_MODULE || "playwright");
const baseUrl = process.env.METERFORGE_BASE_URL || "http://localhost:5012";
const screenshotDir = process.env.METERFORGE_SCREENSHOT_DIR || os.tmpdir();

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    // A fresh browser context isolates this check from the learner's real notes.
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(new URL("/learn/", baseUrl).href);
    await page.waitForFunction(() => document.querySelector("#catalog-status").textContent.includes("documents included"));
    assert.equal(await page.locator(".challenge-card").count(), 5);
    assert.equal(await page.locator("#level").inputValue(), "beginner");
    assert.equal(await page.locator("#progress-count").textContent(), "0 / 12");
    const documents = await (await page.request.get(new URL("/api/learning/documents", baseUrl).href)).json();
    for (const required of ["start-here.md", "glossary.md", "practice-and-feedback.md", "foundations/05-small-change.md", "bridges/03-system-ownership.md", "bridges/04-reading-application-code.md"]) {
      assert.ok(documents.some(document => document.path === required), `Missing learning document: ${required}`);
    }
    for (const document of documents) {
      const response = await page.request.get(new URL(`/api/learning/documents/${document.path}`, baseUrl).href);
      assert.equal(response.status(), 200, `Could not open learning document: ${document.path}`);
      assert.ok((await response.text()).trim().length > 0, `Empty learning document: ${document.path}`);
    }

    await page.locator("#check-submit").click();
    assert.match(await page.locator("#check-feedback").textContent(), /Choose an answer/);
    await page.locator("#check-hint-button").click();
    assert.equal(await page.locator("#check-hint").isVisible(), true);
    await page.locator('input[name="understanding-answer"][value="0"]').check();
    await page.locator("#check-submit").click();
    assert.match(await page.locator("#check-feedback").textContent(), /skips the second line/);
    await page.locator('input[name="understanding-answer"][value="1"]').check();
    await page.locator("#check-submit").click();
    assert.match(await page.locator("#check-feedback").textContent(), /Correct reasoning/);
    await page.locator("#check-picker").selectOption("1");
    await page.locator('input[name="understanding-answer"][value="1"]').check();
    await page.locator("#check-submit").click();
    assert.match(await page.locator("#check-feedback").textContent(), /101 units/);
    await page.locator("#check-picker").selectOption("2");
    await page.locator('input[name="understanding-answer"][value="2"]').check();
    await page.locator("#check-submit").click();
    assert.match(await page.locator("#check-feedback").textContent(), /acknowledgment was lost/);
    assert.equal(await page.locator("#progress-count").textContent(), "0 / 12");

    await page.locator(".review-check input").first().click();
    assert.equal(await page.locator(".review-check input").first().isChecked(), false);
    assert.match(await page.locator(".practice-evidence").first().textContent(), /First record/);
    await page.locator("#evidence-read-code").fill("Predicted 20, observed 20. The second assignment changes quantity to 5; I also explained a new input.");
    await page.locator(".review-check input").first().check();
    await page.locator(".review-check input").first().uncheck();
    await page.locator("#level").selectOption("all");
    assert.equal(await page.locator(".challenge-card").count(), 12);
    await page.locator("#search").fill("concurrency");
    assert.equal(await page.locator(".challenge-card").count(), 1);
    await page.locator("#search").fill("");
    await page.locator("#level").selectOption("foundation");
    assert.equal(await page.locator(".challenge-card").count(), 2);
    await page.locator(".practice-evidence summary").first().click();
    await page.locator("#evidence-vertical-slice").fill("A cross-tenant request returned 404; the new test fails when tenant scope is removed.");
    await page.locator(".review-check input").first().check();
    assert.equal(await page.locator("#progress-count").textContent(), "1 / 12");
    await page.locator("#unfinished").check();
    assert.equal(await page.locator(".challenge-card").count(), 1);
    await page.locator("#notes").fill("Evidence: a failing boundary test now passes.");
    await page.reload();
    assert.equal(await page.locator("#notes").inputValue(), "Evidence: a failing boundary test now passes.");
    assert.equal(await page.locator("#progress-count").textContent(), "1 / 12");
    assert.match(await page.locator("#evidence-vertical-slice").inputValue(), /cross-tenant/);

    const downloaded = page.waitForEvent("download");
    await page.locator("#export").click();
    const download = await downloaded;
    const backup = JSON.parse(fs.readFileSync(await download.path(), "utf8"));
    assert.equal(backup.reviewed.length, 1);
    assert.equal(backup.notes, "Evidence: a failing boundary test now passes.");
    assert.match(backup.evidence["vertical-slice"], /cross-tenant/);
    page.on("dialog", dialog => dialog.accept());
    await page.locator("#import").setInputFiles({
      name: "backup.json", mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ version: 1, reviewed: ["capstone"], notes: "Imported evidence" }))
    });
    await page.waitForFunction(() => document.querySelector("#notes").value === "Imported evidence");
    await page.reload();
    assert.equal(await page.locator("#notes").inputValue(), "Imported evidence");
    assert.equal(await page.locator("#progress-count").textContent(), "1 / 12");
    assert.match(await page.locator(".challenge-card").last().textContent(), /Earlier review preserved/);
    await page.locator("#import").setInputFiles({
      name: "invalid.json", mimeType: "application/json", buffer: Buffer.from('{"version":9}')
    });
    await page.waitForFunction(() => document.querySelector("#save-status").textContent.includes("Import failed"));
    assert.equal(await page.locator("#notes").inputValue(), "Imported evidence");
    await page.locator("#import").setInputFiles({
      name: "invalid-evidence.json", mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ version: 1, reviewed: [], notes: "Must not replace notes", evidence: { capstone: ["invalid"] } }))
    });
    await page.waitForFunction(() => document.querySelector("#save-status").textContent.includes("Import failed"));
    assert.equal(await page.locator("#notes").inputValue(), "Imported evidence");
    await page.locator("#import").setInputFiles({ name: "roundtrip.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup)) });
    await page.waitForFunction(() => document.querySelector("#notes").value === "Evidence: a failing boundary test now passes.");
    assert.match(await page.locator("#evidence-read-code").inputValue(), /Predicted 20/);

    // First exercise real server document delivery and relative guide navigation.
    await page.locator("#document-picker").selectOption("README.md");
    await page.waitForFunction(() => !document.querySelector("#related-guides").hidden);
    await page.locator("#related-summary").click();
    assert.ok(await page.locator("#related-links button").count() > 0);
    await page.locator("#related-links button").first().click();
    await page.waitForFunction(() => document.querySelector("#document-body").textContent.startsWith("#"));
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#document-dialog").evaluate(node => node.open), false);

    // Mock one response only to probe unsafe Markdown. No server data is changed.
    await page.route("**/api/learning/documents/first-session.md", route => route.fulfill({
      contentType: "text/plain",
      body: '# Probe\n<img src=x onerror="window.injected=true">\n[Guide](learning-path.md)\n[Unsafe](javascript:alert(1))'
    }));
    await page.locator("#document-picker").selectOption("first-session.md");
    await page.waitForFunction(() => document.querySelector("#document-body").textContent.includes("<img"));
    assert.equal(await page.locator("#document-body img").count(), 0);
    assert.equal(await page.evaluate(() => !!window.injected), false);
    await page.locator("#related-summary").click();
    assert.equal(await page.locator("#related-links button").count(), 1);
    await page.keyboard.press("Escape");
    await page.unroute("**/api/learning/documents/first-session.md");

    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForFunction(() => document.querySelector("#catalog-status").textContent.includes("documents included"));
    fs.mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({ path: path.join(screenshotDir, "meterforge-learning-desktop.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: path.join(screenshotDir, "meterforge-learning-mobile.png"), fullPage: true });
    assert.deepEqual(errors, []);
    console.log(`PASS: learning portal browser smoke against ${baseUrl}. Screenshots: ${screenshotDir}`);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
