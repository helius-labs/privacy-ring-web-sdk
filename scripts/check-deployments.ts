// Live read-only checks. No wallet, signer or transaction submission is used.
import assert from "node:assert/strict";
import { createSprClient } from "@heliuslabs/spr";
import { address } from "@solana/kit";
import { ZOLANA_PROGRAM_IDS } from "../packages/web-prover/src/protocol.ts";
import { deployments, genesisHashes } from "../examples/wallet/src/deployments.ts";

for (const network of ["devnet", "mainnet"] as const) {
  try {
    const deployment = deployments[network];
    const client = await createSprClient({
      ...deployment,
      solanaRpcUrl: process.env[`ZOLANA_${network.toUpperCase()}_RPC_URL`] ?? deployment.solanaRpcUrl,
    });
    assert.equal(await client.solanaRpc.getGenesisHash().send(), genesisHashes[network]);
    const programs = Object.values(ZOLANA_PROGRAM_IDS).map((id) => address(id));
    const { value: accounts } = await client.solanaRpc.getMultipleAccounts(programs, { encoding: "base64" }).send();
    assert.equal(accounts.length, programs.length);
    for (const account of accounts) assert.equal(account?.executable, true);
    const response = await fetch(deployment.indexerUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getIndexerHealth", params: [] }),
      signal: AbortSignal.timeout(30_000),
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json() as { result?: unknown }).result, "ok");
    await client.attestProver();
    await client.checkProverProvingKeys();
    console.log(`${network}: genesis, programs, Photon health, signed-policy attestation and proving-key pins verified`);
  } catch (error) {
    // RPC URLs can contain credentials. Do not print transport error details.
    console.error(`${network}: deployment check failed (${error instanceof Error ? error.name : "unknown error"})`);
    process.exitCode = 1;
  }
}
