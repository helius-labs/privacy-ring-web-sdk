// Application configuration. Policy selection is independent of the prover URL.
import { SignedTeePolicy, teePolicyFromJson } from "@heliuslabs/zolana/client";

export function remoteProverConfig(proverUrl: string, policyFile: unknown) {
  return { proverUrl, proverTee: teePolicyFromJson(policyFile) };
}

export const deployments = {
  devnet: {
    solanaRpcUrl: "https://api.devnet.solana.com",
    indexerUrl: "https://d34xe1hqb2ibg2.cloudfront.net",
    proverUrl: "https://dd73hh473h6ha.cloudfront.net",
    proverTee: SignedTeePolicy.forNetwork("devnet"),
  },
  mainnet: {
    solanaRpcUrl: "https://api.mainnet-beta.solana.com",
    indexerUrl: "https://dgcj4pjarvo65.cloudfront.net",
    proverUrl: "https://d3ky2kt0ntqxt1.cloudfront.net",
    proverTee: SignedTeePolicy.forNetwork("mainnet"),
  },
} as const;
