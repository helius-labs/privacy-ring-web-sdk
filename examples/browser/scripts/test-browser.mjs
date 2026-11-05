import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { By, until } from "selenium-webdriver";
import { createServer } from "vite";
import { automaticProvingThreads } from "../../../packages/web-prover/src/proving-threads.ts";
import { benchPage, startChrome } from "../../../scripts/browser.ts";

const demoUrl = process.env.DEMO_URL || "http://127.0.0.1:5178/";
const server = process.env.DEMO_URL
  ? undefined
  : await createServer({ root: fileURLToPath(new URL("../", import.meta.url)), logLevel: "warn" });
await server?.listen();
const out =
  process.env.DEMO_REPORT_DIR ||
  fileURLToPath(new URL("../../../target/browser-ui/", import.meta.url));
await mkdir(out, { recursive: true });
const driver = await startChrome({ window: { width: 1440, height: 1100 } });
const proofs = [];
const results = [];
const { button, editValue, openOptions, closeOptions, waitForProof } = benchPage(driver);
async function run(expectedEngine) {
  await driver.findElement(By.css(".main-action .primary-button")).click();
  await waitForProof(180000);
  await (await button("View proof")).click();
  const details = await driver.findElement(By.css(".proof-facts")).getText();
  assert.ok(details.includes(expectedEngine), details);
  const proof = await driver.findElement(By.css(".proof-json")).getText();
  proofs.push(JSON.parse(proof));
  results.push({ details, result: await driver.findElement(By.css(".result-area")).getText() });
  await driver.findElement(By.css('button[aria-label="Close proof"]')).click();
  console.log(results.at(-1).result.replaceAll("\n", " "));
}
try {
  await driver.get(demoUrl);
  await driver.wait(until.elementLocated(By.css(".primary-button")), 30000);
  await driver.wait(async () => (await button("Generate proof")).isEnabled(), 30000);
  const visible = await driver.findElement(By.css("body")).getText();
  assert.doesNotMatch(
    visible,
    /Cross-origin|Funding|Endpoints|localnet|transaction|Ready when|One sample|Powered by|On your device/i,
  );
  assert.equal(await driver.executeScript("return crossOriginIsolated"), true);
  const automaticThreads = automaticProvingThreads(
    await driver.executeScript("return navigator.hardwareConcurrency"),
  );
  await writeFile(`${out}/desktop-idle.png`, await driver.takeScreenshot(), "base64");

  await (await button("Generate proof")).click();
  await (await button("Cancel")).click();
  await driver.wait(async () => (await button("Generate proof")).isEnabled(), 10000);
  await run(`zopro · ${automaticThreads} threads`);
  await writeFile(`${out}/desktop-result.png`, await driver.takeScreenshot(), "base64");
  await (await button("Benchmark")).click();
  await run(`zopro · ${automaticThreads} threads`);
  assert.match(await driver.findElement(By.css(".verified")).getText(), /5 proofs verified/);
  await (await button("Single proof")).click();

  await openOptions();
  await driver.findElement(By.css(".input-details summary")).click();
  const textarea = await driver.findElement(By.id("proof-input"));
  const invalid = JSON.parse(await textarea.getAttribute("value"));
  invalid.publicInputHash = "0x01";
  await editValue(textarea, JSON.stringify(invalid));
  await closeOptions();
  await (await button("Generate proof")).click();
  await driver.wait(until.elementLocated(By.css('[role="alert"]')), 180000);
  assert.equal((await driver.findElements(By.css(".verified"))).length, 0);
  await openOptions();
  await (await button("Restore sample")).click();
  await driver.wait(
    async () => JSON.parse(await textarea.getAttribute("value")).publicInputHash !== "0x01",
    10000,
  );
  await closeOptions();
  await run(`zopro · ${automaticThreads} threads`);

  await openOptions();
  const mode = await driver.findElement(By.id("proving-mode"));
  await mode.findElement(By.css('option[value="custom"]')).click();
  await editValue(await driver.findElement(By.id("thread-count")), "2");
  await closeOptions();
  await run("zopro · 2 threads");
  await openOptions();
  await mode.findElement(By.css('option[value="single"]')).click();
  await closeOptions();
  await run("zopro · single thread");
  await openOptions();
  await mode.findElement(By.css('option[value="auto"]')).click();
  await closeOptions();

  const requests = await driver.executeScript(
    'return performance.getEntriesByType("resource").map(r=>r.name)',
  );
  assert.ok(requests.some((url) => url.includes("prover.worker")));
  assert.ok(requests.every((url) => new URL(url).origin === new URL(demoUrl).origin));
  assert.ok(requests.every((url) => !/\/devnet\//.test(url)));
  await driver.manage().window().setRect({ width: 390, height: 844 });
  assert.equal(
    await driver.executeScript("return document.documentElement.scrollWidth > innerWidth"),
    false,
  );
  await writeFile(`${out}/mobile.png`, await driver.takeScreenshot(), "base64");
  await openOptions();
  await writeFile(`${out}/mobile-options.png`, await driver.takeScreenshot(), "base64");
  await driver.actions().sendKeys("\uE00C").perform();
  assert.equal(
    await driver.executeScript('return !!document.querySelector("dialog[open]")'),
    false,
  );
  assert.equal(
    await driver.executeScript('return document.activeElement.getAttribute("aria-label")'),
    "Options",
  );
  await writeFile(`${out}/proofs.json`, JSON.stringify(proofs, null, 2));
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
  console.log(
    "PASS: proving, benchmark, cancellation, invalid input recovery, automatic/custom/single threads, mobile dialog, focus return, and no external API requests.",
  );
} catch (error) {
  await writeFile(`${out}/failure.png`, await driver.takeScreenshot(), "base64");
  console.error(await driver.findElement(By.css("body")).getText());
  throw error;
} finally {
  await driver.quit();
  await server?.close();
}
