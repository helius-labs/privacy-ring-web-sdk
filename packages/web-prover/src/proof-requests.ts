import { keyForProveRequest, MAX_BROWSER_MERGE_INPUTS, type ShapeKey } from "./shapes.js";

/**
 * A request to the prover's `/prove`. A proof goes to its proving key's own
 * `/prove/<key>`, `<key>` being the key file name without `.key`, or, on the
 * Helius gateway, which routes only the key-less path, to the bare `/prove`
 * with the key named in the body. Every other path below `/prove`, such as
 * `/prove/<key>/indexed` or `/prove/<key>/status`, is `unsupported`: it can
 * carry a witness too, so it is never forwarded.
 */
export type ProveRoute =
  | Readonly<{ kind: "prove"; keyFile?: string }>
  | Readonly<{ kind: "unsupported" }>;

/** How `url` addresses the prover at `proverUrl`; undefined if it is not a proving route. */
export function proveRoute(url: URL, proverUrl: string): ProveRoute | undefined {
  const endpoint = new URL(proverUrl);
  const prove = `${endpoint.pathname.replace(/\/+$/u, "")}/prove`;
  if (url.origin !== endpoint.origin) return undefined;
  if (url.pathname === prove) return { kind: "prove" };
  if (!url.pathname.startsWith(`${prove}/`)) return undefined;
  // A key segment is a key file name without `.key`, which always ends in its
  // shape; `/prove/status`, the poll path, is not one.
  const key = url.pathname.slice(prove.length + 1);
  return /^[a-z0-9_-]+_\d+_\d+$/u.test(key)
    ? { kind: "prove", keyFile: `${key}.key` }
    : { kind: "unsupported" };
}

/** Whether `body` is a merge of more notes than the browser proves. */
export function isWideMerge(body: string): boolean {
  try {
    const parsed: unknown = JSON.parse(body);
    return (
      typeof parsed === "object" &&
      parsed !== null &&
      "circuitType" in parsed &&
      parsed.circuitType === "merge" &&
      "inputs" in parsed &&
      Array.isArray(parsed.inputs) &&
      parsed.inputs.length > MAX_BROWSER_MERGE_INPUTS
    );
  } catch {
    return false;
  }
}

export function proofRequestShape(body: string): ShapeKey | undefined {
  try {
    const parsed: unknown = JSON.parse(body);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("circuitType" in parsed) ||
      typeof parsed.circuitType !== "string"
    )
      return undefined;
    if (parsed.circuitType === "merge") {
      if (!("inputs" in parsed) || !Array.isArray(parsed.inputs)) return undefined;
      return keyForProveRequest(parsed.circuitType, parsed.inputs.length, 1);
    }
    if (
      !("nInputs" in parsed) ||
      !("nOutputs" in parsed) ||
      typeof parsed.nInputs !== "number" ||
      typeof parsed.nOutputs !== "number"
    )
      return undefined;
    return keyForProveRequest(parsed.circuitType, parsed.nInputs, parsed.nOutputs);
  } catch {
    return undefined;
  }
}
