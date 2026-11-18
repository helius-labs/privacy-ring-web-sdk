/**
 * The proving keys the browser prover loads, by the gnark key's file name:
 * `transfer_confidential_<inputs>_<outputs>.key` for a confidential transfer
 * and `merge_<inputs>_1.key` for a merge. The other keys of `zopro-keys.lock`,
 * the ring rail's, are not the browser's.
 *
 * The repository's scripts import this file as TypeScript, so it imports nothing.
 */

/** A browser proving key's circuit, as a `/prove` request names it, and its note counts. */
export interface KeyCircuit {
  readonly circuitType: "transfer-confidential" | "merge";
  readonly inputs: number;
  readonly outputs: number;
}

const TRANSFER_KEY = /^transfer_confidential_(\d+)_(\d+)\.key$/u;
const MERGE_KEY = /^merge_(\d+)_1\.key$/u;

/** The circuit the browser proving key `name` proves, or undefined when `name` is not one. */
export function browserKeyCircuit(name: string): KeyCircuit | undefined {
  const transfer = TRANSFER_KEY.exec(name);
  if (transfer !== null)
    return { circuitType: "transfer-confidential", inputs: Number(transfer[1]), outputs: Number(transfer[2]) };
  const merge = MERGE_KEY.exec(name);
  if (merge !== null) return { circuitType: "merge", inputs: Number(merge[1]), outputs: 1 };
  return undefined;
}
