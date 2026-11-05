/** Progress of one proving key's load, for a download or preparation indicator. */
export interface KeyProgress {
  readonly keyFile: string;
  /**
   * `download` as bytes arrive from the network; `decode` once, when the worker
   * starts loading the key (seconds for a key's first load, then a fraction).
   */
  readonly stage: "download" | "decode";
  readonly loaded: number;
  readonly total: number;
}

/**
 * One timed step. `key-fetch` is a key's download or cache read and `key-load`
 * its load into the worker; `witness`, `prove` and `verify` are the runtime's
 * own times for one proof, without the worker's messaging.
 */
export interface Measurement {
  readonly step: "key-fetch" | "key-load" | "witness" | "prove" | "verify";
  readonly ms: number;
  readonly bytes?: number;
  /** The proof's circuit, on the `witness`, `prove` and `verify` steps. */
  readonly circuit?: "transfer" | "merge";
  readonly note?: string;
}
