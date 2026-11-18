// The browser's proving keys in zopro-keys.lock by the shape labels of the
// timing scripts and the request fixtures: `<inputs>x<outputs>` for a
// confidential transfer (fixtures/transfer-8x2.json) and `merge-<inputs>x1` for
// a merge (fixtures/merge-24x1.json).
import { readFileSync } from "node:fs";
import { browserKeyCircuit } from "../packages/web-prover/src/key-names.ts";

export interface LockedKey {
  /** The gnark key's name, as the lock and `/prove/<key>` name it. */
  readonly name: string;
  /** The zopro key file, under the key set's URL or `public/keys`. */
  readonly file: string;
  /** The zopro key file's size in bytes. */
  readonly size: number;
  /** The shape's request in fixtures/. */
  readonly fixture: string;
}

const lock = JSON.parse(readFileSync(new URL("../zopro-keys.lock", import.meta.url), "utf8")) as {
  readonly keys: Record<string, { readonly file: string; readonly size: number }>;
};

const keys = new Map<string, LockedKey>();
for (const [name, { file, size }] of Object.entries(lock.keys)) {
  const circuit = browserKeyCircuit(name);
  if (circuit === undefined) continue;
  const merge = circuit.circuitType === "merge";
  const label = `${merge ? "merge-" : ""}${String(circuit.inputs)}x${String(circuit.outputs)}`;
  keys.set(label, { name, file, size, fixture: `${merge ? "" : "transfer-"}${label}.json` });
}

/** The locked key of the shape `label`. */
export function lockedKey(label: string): LockedKey {
  const key = keys.get(label);
  if (key === undefined) throw new Error(`zopro-keys.lock has no browser key for the shape ${label}`);
  return key;
}
