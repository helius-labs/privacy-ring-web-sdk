export {
  TRANSFER_SHAPES,
  MAX_BROWSER_MERGE_INPUTS,
  MERGE_SHAPES,
  keyForProveRequest,
  canonicalShape,
  neededKeys,
  shapeByLabel,
  type Shape,
  type ShapeKey,
} from "./shapes.js";

export { KEY_BASE_URL } from "./key-digests.js";
export type { ProvingKeySource } from "./key-source.js";
export type { KeyProgress, Measurement } from "./measurement.js";
export type { WasmProverErrorCode } from "./errors.js";

export {
  SprWebProver,
  WasmProverError,
  type SprWebProverOptions,
} from "./wasm-prover.js";

export type { ProvingKeyStatus } from "./key-store.js";
export { automaticProvingThreads } from "./proving-threads.js";
