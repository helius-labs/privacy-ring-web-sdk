import assert from "node:assert/strict";
import { test } from "node:test";
import { ClientError, WalletError } from "@heliuslabs/spr";
import { ProverClient, expectedProvingKey } from "@heliuslabs/spr/internal";
import { limitLocalProofs, localProofError, localSpendLimit, MERGE_FIRST } from "../src/local-proving.ts";

test("the local spend limit uses the eight largest notes without changing them", () => {
  const notes = Array.from({ length: 9 }, (_, i) => ({ amount: BigInt(i + 1) }));
  assert.equal(localSpendLimit(notes), 44n);
  assert.equal(notes[0]?.amount, 1n);
  assert.equal(localSpendLimit([]), 0n);
});

test("a ninth input is refused before starting a local proof", async () => {
  let calls = 0;
  const localFetch: typeof fetch = async () => { calls++; return new Response("ok"); };
  const guarded = limitLocalProofs(localFetch, "http://127.0.0.1:3001");
  const prove = (inputs: number) => guarded("http://127.0.0.1:3001/prove/key", {
    method: "POST", body: JSON.stringify({ inputs: Array(inputs).fill({}) }),
  });
  await prove(8);
  assert.equal(calls, 1);
  const refused = await prove(9);
  assert.equal(refused.status, 422);
  assert.equal((await refused.json() as { message?: unknown }).message, MERGE_FIRST);
  assert.equal(calls, 1);
  await guarded(new Request("http://127.0.0.1:3001/prove/key", {
    method: "POST", body: JSON.stringify({ inputs: Array(8).fill({}) }),
  }));
  assert.equal(calls, 2);
});

test("the SDK reports the refusal at once, and the wallet shows the merge hint", async () => {
  let requests = 0;
  const guarded = limitLocalProofs(async () => new Response("unreachable", { status: 500 }), "http://127.0.0.1:3001");
  const prover = new ProverClient({
    url: "http://127.0.0.1:3001",
    fetch: async (input, init) => {
      requests++;
      return guarded(input, init);
    },
  });
  const key = expectedProvingKey({ circuit: "transfer-confidential", nInputs: 12, nOutputs: 2 });
  const body = JSON.stringify({ circuitType: "transfer-confidential", nInputs: 12, nOutputs: 2, inputs: Array(12).fill({}) });
  const error = await prover.send(body, "sync", key).then(() => assert.fail("proved"), (cause: unknown) => cause);
  assert.equal(requests, 1);
  assert.ok(error instanceof ClientError);
  assert.deepEqual(
    { code: error.code, details: error.details },
    { code: "CLIENT_PROVER_HTTP", details: { method: "prove", status: 422, attempts: 1, reason: `local_too_many_inputs: ${MERGE_FIRST}` } },
  );
  assert.equal((localProofError(error) as Error).message, MERGE_FIRST);
  // The transaction builders wrap it.
  const wrapped = new WalletError("WALLET_BUILD_TRANSFER", { causeCode: "CLIENT_PROVER_HTTP", cause: error });
  assert.equal((localProofError(wrapped) as Error).message, MERGE_FIRST);
  const other = new Error("CLIENT_PROVER_HTTP");
  assert.equal(localProofError(other), other);
});

test("RPC and remote merge requests do not use the local proof limit", async () => {
  let calls = 0;
  const guarded = limitLocalProofs(async () => { calls++; return new Response("ok"); }, "http://127.0.0.1:3001");
  await guarded("https://rpc.example/getBalance", { method: "POST", body: "{}" });
  await guarded("https://tee.example/prove/key", { method: "POST", body: JSON.stringify({ inputs: Array(24).fill({}) }) });
  assert.equal(calls, 2);
});
