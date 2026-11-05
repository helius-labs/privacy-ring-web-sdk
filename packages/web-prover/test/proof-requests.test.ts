import { expect, it } from "vitest";
import { proofRequestShape, proveRoute } from "../src/proof-requests.js";

it.each([
  ["http://localhost/prover/prove", { kind: "prove" }],
  ["http://localhost/prover/prove?api-key=secret", { kind: "prove" }],
  ["http://localhost/prover/prove/", { kind: "unsupported" }],
  ["http://localhost/prover/prove/status", { kind: "unsupported" }],
  ["http://localhost/prover/prove/transfer_ring_authority_4_4", { kind: "prove", keyFile: "transfer_ring_authority_4_4.key" }],
  ["http://localhost/prover/prove/merge_8_1", { kind: "prove", keyFile: "merge_8_1.key" }],
  ["http://localhost/prover/prove/merge_8_1/indexed", { kind: "unsupported" }],
  ["http://localhost/prover/prove/merge_8_1%2Findexed", { kind: "unsupported" }],
  ["http://localhost/prover/prove/..%2Fhealth", { kind: "unsupported" }],
  ["http://localhost/prover/proves", undefined],
  ["http://localhost/prover/health", undefined],
  ["http://localhost/other/prove/merge_8_1", undefined],
  ["http://127.0.0.1/prover/prove", undefined],
])("routes %s", (url, route) => {
  expect(proveRoute(new URL(url), "http://localhost/prover/")).toEqual(route);
});
it("routes the Helius gateway's key-less prove path", () => {
  const gateway = "https://devnet.helius-rpc.com/v1/spr?api-key=secret";
  expect(
    proveRoute(new URL("https://devnet.helius-rpc.com/v1/spr/prove?api-key=secret"), gateway),
  ).toEqual({ kind: "prove" });
  expect(
    proveRoute(new URL("https://devnet.helius-rpc.com/v1/spr/prove/status?jobId=1"), gateway),
  ).toEqual({ kind: "unsupported" });
  expect(proveRoute(new URL("https://devnet.helius-rpc.com/v1/spr/getIndexerSlot"), gateway)).toBe(
    undefined,
  );
});
it("does not coerce malformed shape declarations", () => {
  expect(
    proofRequestShape('{"circuitType":"transfer-confidential","nInputs":"2","nOutputs":3}'),
  ).toBeUndefined();
  expect(proofRequestShape("null")).toBeUndefined();
  expect(proofRequestShape("{")).toBeUndefined();
});
