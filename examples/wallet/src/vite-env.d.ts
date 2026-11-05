/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOLANA_RPC_URL?: string;
  readonly VITE_INDEXER_URL?: string;
  readonly VITE_ZOLANA_NETWORK?: string;
  readonly VITE_TEE_PROVER_URL?: string;
  readonly VITE_TEE_POLICY?: string;
}
