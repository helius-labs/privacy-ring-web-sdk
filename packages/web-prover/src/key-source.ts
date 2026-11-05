import { KEY_DIGESTS } from "./key-digests.js";
import { WasmProverError } from "./errors.js";

/** Trusted release metadata, for example the protocol SDK's attested key set. */
export interface ProvingKeySource {
  readonly cacheKey: string;
  key(name: string): SourceKey;
}

type SourceKey = Readonly<{
  file: string;
  size: number;
  sha256: string;
  keySha256: string;
  url: string;
}>;

const sha256Hex = /^[0-9a-f]{64}$/u;

/** Snapshot the source once so a proof never mixes releases. */
export function sourceKeys(source: ProvingKeySource): Readonly<{
  cacheKey: string;
  keys: ReadonlyMap<string, SourceKey>;
}> {
  if (source === null || typeof source !== "object" || typeof source.key !== "function") throw invalid();
  const cacheKey = source.cacheKey;
  if (typeof cacheKey !== "string" || !sha256Hex.test(cacheKey)) throw invalid();
  const keys = new Map<string, SourceKey>();
  for (const name of Object.keys(KEY_DIGESTS)) {
    let entry: SourceKey;
    try {
      entry = source.key(name);
    } catch {
      throw invalid();
    }
    if (
      entry === null ||
      typeof entry !== "object" ||
      entry.file !== name.replace(/\.key$/u, ".zopro") ||
      !Number.isSafeInteger(entry.size) ||
      entry.size < 1 ||
      entry.size > 0xffff_ffff ||
      typeof entry.sha256 !== "string" ||
      !sha256Hex.test(entry.sha256) ||
      typeof entry.keySha256 !== "string" ||
      !sha256Hex.test(entry.keySha256) ||
      typeof entry.url !== "string"
    )
      throw invalid();
    keys.set(
      name,
      Object.freeze({
        file: entry.file,
        size: entry.size,
        sha256: entry.sha256,
        keySha256: entry.keySha256,
        url: checkedUrl(entry.url),
      }),
    );
  }
  return { cacheKey, keys };
}

/** An absolute HTTPS URL, or HTTP on loopback, without credentials or a fragment. */
function checkedUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw invalid();
  }
  const loopback =
    url.hostname === "localhost" ||
    url.hostname.endsWith(".localhost") ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]";
  if (
    (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) ||
    url.username !== "" ||
    url.password !== "" ||
    url.hash !== ""
  )
    throw invalid();
  return url.href;
}

function invalid(): WasmProverError {
  return new WasmProverError("wasm_key_source_invalid");
}
