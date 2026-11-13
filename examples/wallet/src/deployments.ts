// Application configuration. Policy selection is independent of the prover URL.
import { SignedTeePolicy, teePolicyFromJson } from "@heliuslabs/spr/client";

export function remoteProverConfig(proverUrl: string, policyFile: unknown) {
  return { proverUrl, proverTee: teePolicyFromJson(policyFile) };
}

// The Helius gateway serves the indexer and the attested prover on one keyed URL.
export function sprEndpoints(sprUrl: string, apiKey: string) {
  const url = `${sprUrl}?api-key=${encodeURIComponent(apiKey)}`;
  return { indexerUrl: url, proverUrl: url };
}

export const deployments = {
  devnet: {
    solanaRpcUrl: "https://api.devnet.solana.com",
    sprUrl: "https://devnet.helius-rpc.com/v1/spr",
    proverTee: SignedTeePolicy.forNetwork("devnet"),
  },
  mainnet: {
    solanaRpcUrl: "https://api.mainnet-beta.solana.com",
    sprUrl: "https://mainnet.helius-rpc.com/v1/spr",
    proverTee: SignedTeePolicy.forNetwork("mainnet"),
  },
} as const;
