// Headless Chrome under selenium for the repository's browser scripts, and the
// bench page's controls its scripts drive.
import { Builder, By, logging, type WebDriver, type WebElement } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

export interface ChromeSetup {
  readonly window?: { readonly width: number; readonly height: number };
  /** The log types the driver keeps at every level, e.g. `logging.Type.BROWSER`. */
  readonly logs?: readonly string[];
  /** More Chrome switches. */
  readonly args?: readonly string[];
  /** A Chrome binary in place of CHROME_BIN or the installed Chrome. */
  readonly binary?: string;
  /** The chromedriver for `binary`. */
  readonly chromedriver?: string;
}

/**
 * Headless Chrome. CHROME_BIN names its binary; CHROME_NO_SANDBOX=1 starts it
 * without the sandbox, which a CI container cannot give it.
 */
export function startChrome(setup: ChromeSetup = {}): Promise<WebDriver> {
  const options = new chrome.Options();
  options.addArguments("--headless=new", ...(setup.args ?? []));
  if (setup.window !== undefined)
    options.addArguments(`--window-size=${String(setup.window.width)},${String(setup.window.height)}`);
  if (process.env["CHROME_NO_SANDBOX"] === "1") options.addArguments("--no-sandbox");
  const binary = setup.binary ?? process.env["CHROME_BIN"];
  if (binary) options.setChromeBinaryPath(binary);
  if (setup.logs?.length) {
    const preferences = new logging.Preferences();
    for (const type of setup.logs) preferences.setLevel(type, logging.Level.ALL);
    options.setLoggingPrefs(preferences);
  }
  const builder = new Builder().forBrowser("chrome").setChromeOptions(options);
  if (setup.chromedriver !== undefined) builder.setChromeService(new chrome.ServiceBuilder(setup.chromedriver));
  return builder.build();
}

/** The bench page's controls (examples/browser), as its browser test and timing harness drive them. */
export interface BenchPage {
  /** The button labelled `text`. */
  button(text: string): Promise<WebElement>;
  /** Types `value` into a React-controlled input or textarea at once. */
  editValue(element: WebElement, value: string): Promise<void>;
  openOptions(): Promise<void>;
  closeOptions(): Promise<void>;
  /**
   * Waits until the page shows a verified proof, polling every `pollMs`
   * (selenium's 200 ms by default); an alert on the page fails the wait with its text.
   */
  waitForProof(timeoutMs: number, pollMs?: number): Promise<void>;
}

export function benchPage(driver: WebDriver): BenchPage {
  return {
    button: (text) => driver.findElement(By.xpath(`//button[normalize-space(.)='${text}']`)),
    async editValue(element, value) {
      await driver.executeScript(
        `const [el, next] = arguments;
        const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, "value").set.call(el, next);
        el.dispatchEvent(new Event("input", { bubbles: true }));`,
        element,
        value,
      );
    },
    openOptions: () => driver.findElement(By.css('button[aria-label="Options"]')).click(),
    closeOptions: () => driver.findElement(By.css('button[aria-label="Close options"]')).click(),
    async waitForProof(timeoutMs, pollMs) {
      await driver.wait(
        async () => {
          const [alert] = await driver.findElements(By.css('[role="alert"]'));
          if (alert !== undefined) throw new Error(await alert.getText());
          return (await driver.findElements(By.css(".verified"))).length > 0;
        },
        timeoutMs,
        undefined,
        pollMs,
      );
    },
  };
}
