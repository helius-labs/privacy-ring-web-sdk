import { createHash } from "node:crypto";
import { expect, it, vi } from "vitest";
import { KEY_DIGESTS } from "../src/key-digests.js";
import type { ProvingKeySource } from "../src/key-catalog.js";
import { KeyStore } from "../src/key-store.js";
import { shapeByLabel } from "../src/shapes.js";
import { WasmProver } from "../src/wasm-prover.js";
import { body, current, proverTestHooks } from "./support/prover.js";

proverTestHooks();
const bytes = new Uint8Array([8, 9, 10]);
const sha256 = createHash("sha256").update(bytes).digest("hex");
const name = "transfer_confidential_2_2.key";
const keySha256 = "cd".repeat(32);

function source(cacheKey = "ab".repeat(32)): ProvingKeySource {
  return { cacheKey, key(name) {
    const original = KEY_DIGESTS[name];
    if (original === undefined) throw new Error("unknown test key");
    return { file: original.file, size: bytes.length, sha256, keySha256,
      url: `https://keys.example/${original.file}` };
  } };
}

it("uses a downloaded release's URL, bytes and source digest for the worker", async () => {
  const fetch = vi.fn<typeof globalThis.fetch>(async () => new Response(bytes));
  const prover = new WasmProver({ proverUrl: "http://localhost", keySource: source(), fetch });
  try {
    await prover.proveRequest(body);
    expect(String(fetch.mock.calls[0]![0])).toBe("https://keys.example/transfer_confidential_2_2.zopro");
    expect(current().requests.find((request) => request.kind === "loadKey"))
      .toMatchObject({ keySha256, key: bytes.buffer });
    expect((await prover.provingKeys()).find((key) => key.keyFile === name)?.size).toBe(bytes.length);
  } finally { prover.terminate(); }
});

it("does not send tampered downloads to the worker", async () => {
  const fetch = vi.fn<typeof globalThis.fetch>(async () => new Response(new Uint8Array([1, 2, 3])));
  const prover = new WasmProver({ proverUrl: "http://localhost", keySource: source(), fetch });
  try {
    await expect(prover.proveRequest(body)).rejects.toMatchObject({ code: "wasm_key_digest_mismatch" });
    expect(current().requests.some((request) => request.kind === "loadKey" || request.kind === "prove")).toBe(false);
  } finally { prover.terminate(); }
});

it("snapshots metadata and rejects missing keys or conflicting options before HTTP", () => {
  const entry = { ...source().key(name) };
  const fetch = vi.fn<typeof globalThis.fetch>();
  const trusted = source();
  const store = new KeyStore({ keySource: { ...trusted, key: (candidate) => candidate === name ? entry : trusted.key(candidate) }, fetch });
  entry.sha256 = "ff".repeat(32);
  entry.url = "https://changed.example/key";
  expect(store.digest(shapeByLabel("2x2")).sha256).toBe(sha256);
  expect(store.url(shapeByLabel("2x2"))).toBe("https://keys.example/transfer_confidential_2_2.zopro");
  expect(() => new KeyStore({ keySource: { ...trusted, key: () => { throw new Error("absent"); } }, fetch })).toThrow();
  expect(() => new KeyStore({ keySource: trusted, keyBaseUrl: "/keys", fetch })).toThrow();
  expect(() => new KeyStore({ keySource: trusted, keyCatalog: { keys: [] }, fetch })).toThrow();
  expect(fetch).not.toHaveBeenCalled();
});

function storage(names: readonly string[], open: () => Promise<unknown> = async () => ({ match: vi.fn(async () => undefined) })) {
  const caches = { open: vi.fn(open), keys: vi.fn(async () => names), delete: vi.fn(async (_name: string) => true) };
  vi.stubGlobal("caches", caches);
  return caches;
}

it("deletes the caches of other key sets once its own opens", async () => {
  const current = `zolana-runtime-proving-keys-${"01".repeat(32)}`;
  const caches = storage([
    current,
    `zolana-runtime-proving-keys-${"02".repeat(32)}`,
    `zolana-runtime-proving-keys-${"03".repeat(32)}`,
    "zolana-proving-keys-0123456789abcdef",
    "app-assets",
  ]);
  const store = new KeyStore({ keySource: source("01".repeat(32)), fetch });
  const signal = new AbortController().signal;
  await store.status(signal);
  await store.status(signal);
  expect(caches.open.mock.calls).toEqual([[current]]);
  expect(caches.delete.mock.calls.map(([name]) => name)).toEqual([
    `zolana-runtime-proving-keys-${"02".repeat(32)}`,
    `zolana-runtime-proving-keys-${"03".repeat(32)}`,
    "zolana-proving-keys-0123456789abcdef",
  ]);
});

it("deletes nothing when its own cache does not open", async () => {
  const caches = storage(["zolana-proving-keys-0123456789abcdef", `zolana-runtime-proving-keys-${"02".repeat(32)}`], async () => {
    throw new DOMException("quota", "QuotaExceededError");
  });
  const signal = new AbortController().signal;
  await new KeyStore({ fetch }).status(signal);
  await new KeyStore({ keySource: source("04".repeat(32)), fetch }).status(signal);
  expect(caches.delete).not.toHaveBeenCalled();
});

it("keeps the key sets of every store in the page and clears only the selected one", async () => {
  const stale = `zolana-runtime-proving-keys-${"05".repeat(32)}`;
  const caches = storage([
    `zolana-runtime-proving-keys-${"ab".repeat(32)}`,
    `zolana-runtime-proving-keys-${"ef".repeat(32)}`,
    stale,
  ]);
  const first = new KeyStore({ keySource: source(), fetch });
  const second = new KeyStore({ keySource: source("ef".repeat(32)), fetch });
  const signal = new AbortController().signal;
  await first.status(signal);
  await second.status(signal);
  expect(caches.open.mock.calls).toEqual([
    [`zolana-runtime-proving-keys-${"ab".repeat(32)}`],
    [`zolana-runtime-proving-keys-${"ef".repeat(32)}`],
  ]);
  expect(caches.delete.mock.calls).toEqual([[stale], [stale]]);
  caches.delete.mockClear();
  await second.clear(signal);
  expect(caches.delete).toHaveBeenCalledExactlyOnceWith(`zolana-runtime-proving-keys-${"ef".repeat(32)}`);
});
