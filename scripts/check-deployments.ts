// Live read-only checks. No wallet, signer or transaction submission is used.
import assert from "node:assert/strict";
import { createSprClient } from "@heliuslabs/spr";
import { address } from "@solana/kit";
import { ZOLANA_PROGRAM_IDS } from "../packages/web-prover/src/protocol.ts";
import { deployments, sprEndpoints } from "../examples/wallet/src/deployments.ts";

const genesis = {
  devnet: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG",
  mainnet: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
};

const apiKey = process.env["HELIUS_API_KEY"];
if (apiKey === undefined) throw new Error("Set HELIUS_API_KEY");

for (const network of ["devnet", "mainnet"] as const) {
  try {
    const deployment = deployments[network];
    const client = await createSprClient({
      ...sprEndpoints(deployment.sprUrl, apiKey),
      proverTee: deployment.proverTee,
      solanaRpcUrl: process.env[`ZOLANA_${network.toUpperCase()}_RPC_URL`] ?? deployment.solanaRpcUrl,
    });
    assert.equal(await client.solanaRpc.getGenesisHash().send(), genesis[network]);
    const programs = Object.values(ZOLANA_PROGRAM_IDS).map((id) => address(id));
    const { value: accounts } = await client.solanaRpc.getMultipleAccounts(programs, { encoding: "base64" }).send();
    assert.equal(accounts.length, programs.length);
    for (const account of accounts) assert.equal(account?.executable, true);
    await client.attestProver();
    await client.checkProverProvingKeys();
    console.log(`${network}: genesis, programs, signed-policy attestation and proving-key pins verified`);
  } catch (error) {
    // RPC URLs can contain credentials. Do not print transport error details.
    console.error(`${network}: deployment check failed (${error instanceof Error ? error.name : "unknown error"})`);
    process.exitCode = 1;
  }
}
