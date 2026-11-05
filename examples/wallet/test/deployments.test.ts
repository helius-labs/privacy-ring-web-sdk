import assert from "node:assert/strict";
import { test } from "node:test";
import { SHIELDED_POOL_PROGRAM_ID, USER_REGISTRY_PROGRAM_ID } from "@heliuslabs/spr/interface";
import { SignedTeePolicy, teePolicyFromJson } from "@heliuslabs/spr/client";
import { ZOLANA_PROGRAM_IDS } from "../../../packages/web-prover/src/protocol.ts";
import { deployments, remoteProverConfig } from "../src/deployments.ts";
import { burnerStorageKey, loadBurnerSeed, resetBurner } from "../src/burner.ts";

test("deployment pins agree with the SDK and select signed policies by network", async () => {
  assert.equal(SHIELDED_POOL_PROGRAM_ID, ZOLANA_PROGRAM_IDS.shieldedPool);
  assert.equal(USER_REGISTRY_PROGRAM_ID, ZOLANA_PROGRAM_IDS.userRegistry);
  for (const [network, { proverTee }] of Object.entries(deployments)) {
    assert.ok(proverTee instanceof SignedTeePolicy);
    const urls: string[] = [];
    await assert.rejects(proverTee.current(async (input) => {
      urls.push(String(input));
      return new Response("{}", { status: 200 });
    }));
    assert.deepEqual(urls, [`https://d3gbdb0egjwcw9.cloudfront.net/tee-policy/${network}.json`]);
  }
});

test("demo keys stay separate across networks", () => {
  const storage = new Map<string, string>();
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  } });
  try {
    const devnet = loadBurnerSeed("devnet");
    const mainnet = loadBurnerSeed("mainnet");
    assert.notDeepEqual(devnet, mainnet);
    assert.deepEqual(loadBurnerSeed("devnet"), devnet);
    resetBurner("devnet");
    assert.equal(storage.has(burnerStorageKey("devnet")), false);
    assert.deepEqual(loadBurnerSeed("mainnet"), mainnet);
  } finally {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});

test("application policies work at direct, unified and proxy URLs without hostname selection", () => {
  const policy = {
    platform: "aws-nitro", gpu: "optional", max_age_secs: 600,
    measurements: [{ pcr0: "00".repeat(48), pcr1: "01".repeat(48), pcr2: "02".repeat(48) }],
    hpke_public_key: "01".repeat(32),
  };
  const pinned = teePolicyFromJson(policy);
  for (const proverUrl of ["https://prover.example", "https://api.example/v1/spr?api-key=secret", "http://localhost:8788/prover"]) {
    assert.deepEqual(remoteProverConfig(proverUrl, { deployment: policy }), { proverUrl, proverTee: pinned });
    assert.deepEqual(remoteProverConfig(proverUrl, policy).proverTee, pinned);
    for (const bad of [undefined, null, {}, { deployment: null }]) assert.throws(() => remoteProverConfig(proverUrl, bad));
  }
});
