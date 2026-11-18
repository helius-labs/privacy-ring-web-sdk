/// <reference lib="webworker" />
/**
 * Hosts the prover runtime off the main thread.
 *
 * The runtime is zopro-spr built for the browser: one WebAssembly module
 * that loads a key, builds the witness, proves on a thread pool (and WebGPU
 * where the page has it) and verifies the proof before it returns it. A
 * proof takes seconds, so this is a worker. Every operation is timed here
 * rather than on the page so the reported proving cost excludes postMessage
 * and structured-clone overhead.
 *
 * `threads` greater than zero needs a cross-origin isolated page and starts
 * the Rayon pool. `threads: 0` loads the runtime built without shared memory,
 * which proves on this worker alone and needs no isolation: key files are
 * decompressed across ordinary workers (`key-decoders.ts`) instead.
 */

import type { WorkerRequest, WorkerResponse } from "./wasm-prover.js";
import { operationError, WasmProverError } from "./errors.js";
import { decodeKey } from "./key-decoders.js";
import {
  importSingleRuntime,
  importThreadedRuntime,
  type ProofValue,
  type Runtime,
  type SprProver,
} from "./runtime.js";

let runtime: Runtime | undefined;
let pooled = false;
let activeThreads = 0;
let gpuAvailable = false;
type ResidentKey = { fileName: string; prover: SprProver; estimatedBytes: number };
let loaded: ResidentKey | undefined;
const residents = new Map<string, ResidentKey>();
let residentBudget = 0;

function evict(fileName: string): void {
  const entry = residents.get(fileName);
  if (entry === undefined) return;
  if (loaded === entry) loaded = undefined;
  residents.delete(fileName);
  entry.prover.free();
}

function makeRoom(bytes: number): void {
  let used = [...residents.values()].reduce((sum, entry) => sum + entry.estimatedBytes, 0);
  for (const [name, entry] of residents) {
    if (residentBudget > 0 && used + bytes <= residentBudget) break;
    used -= entry.estimatedBytes;
    evict(name);
  }
}

function selectKey(fileName: string, digest: string): void {
  const entry = residents.get(fileName);
  if (entry === undefined) throw new WasmProverError("wasm_key_load_failed");
  if (entry.prover.digest() !== digest) throw new WasmProverError("wasm_key_digest_mismatch");
  residents.delete(fileName);
  residents.set(fileName, entry);
  loaded = entry;
}

// Rayon's helpers wait for every thread to report ready, and a thread whose script
// the page refuses never does; a pool that has not started by then has failed.
const threadPoolTimeoutMs = 30_000;

/** Magic of a cached raw key (`zopro-raw-3`); those skip worker decompression. */
const rawKeyMagic = new TextEncoder().encode("zopro-raw3\0\0\0\0\0\0");

async function init(threads: number, gpu: "auto" | "off" | "required" = "auto", budget = 0): Promise<void> {
  if (runtime !== undefined) return;
  if (!Number.isSafeInteger(budget) || budget < 0 || budget > 1024 ** 3)
    throw new Error("Invalid resident key budget");
  residentBudget = budget;
  if (!Number.isInteger(threads) || threads < 0 || threads > 64) {
    throw new Error("Threads must be an integer between 0 and 64");
  }
  if (threads > 0) {
    if (!globalThis.crossOriginIsolated)
      throw new Error(
        "Threaded proving requires cross-origin isolation. Use the Vite server with COOP/COEP headers, or set threads: 0.",
      );
    const module = await importThreadedRuntime();
    await module.default();
    await withTimeout(module.initThreadPool(threads), threadPoolTimeoutMs);
    await initGpu(module, gpu);
    runtime = module;
    pooled = true;
    activeThreads = threads;
    return;
  }
  const module = await importSingleRuntime();
  await module.default();
  await initGpu(module, gpu);
  runtime = module;
  pooled = false;
  activeThreads = 0;
}

async function initGpu(module: Runtime, mode: "auto" | "off" | "required"): Promise<void> {
  if (mode === "off") return;
  const available = "gpu" in navigator && await module.init_gpu();
  gpuAvailable = available;
  if (!available && mode === "required") throw new WasmProverError("wasm_gpu_unavailable");
}

async function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const expired = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("the runtime's thread pool did not start")), ms);
  });
  try {
    return await Promise.race([work, expired]);
  } finally {
    clearTimeout(timer);
  }
}

function requireRuntime(): Runtime {
  if (runtime === undefined) throw new Error("the runtime is not initialized; send init first");
  return runtime;
}

function isRawKey(key: Uint8Array): boolean {
  if (key.byteLength < rawKeyMagic.byteLength) return false;
  for (let i = 0; i < rawKeyMagic.byteLength; i++) {
    if (key[i] !== rawKeyMagic[i]) return false;
  }
  return true;
}

/** Decoder workers for a key file on the single-thread path. */
function decoderWorkers(): number {
  const reported = globalThis.navigator?.hardwareConcurrency;
  if (reported === undefined || !Number.isFinite(reported) || reported < 1) return 4;
  return Math.min(8, Math.floor(reported));
}

async function loadKey(
  fileName: string,
  key: Uint8Array,
  keySha256: string,
  exportRaw: boolean,
  keyBytes = key.byteLength,
): Promise<{ key: string; inputs: number; outputs: number; raw?: Uint8Array; loadedKeys: string[] }> {
  const module = requireRuntime();
  // Budget conservatively for decoded points, solver and GPU state. This is
  // admission accounting, not a measurement of allocator/GPU memory. The 1 GiB
  // ceiling leaves room in wasm32 for transient decoding and proof buffers.
  let estimatedBytes = Math.max(keyBytes * 8, key.byteLength * 3);
  evict(fileName);
  makeRoom(estimatedBytes);
  loaded = undefined;
  let prover: SprProver;
  if (pooled || isRawKey(key)) {
    prover = new module.SprProver(key);
  } else {
    const vectors = await decodeKey(module, key, decoderWorkers());
    if (vectors.length !== 5) throw new Error("key decompress returned the wrong vectors");
    prover = module.SprProver.from_vectors(
      key,
      vectors[0]!,
      vectors[1]!,
      vectors[2]!,
      vectors[3]!,
      vectors[4]!,
    );
  }
  if (prover.digest() !== keySha256) {
    prover.free();
    throw new WasmProverError("wasm_key_digest_mismatch");
  }
  try {
    const info = { key: prover.name(), inputs: prover.inputs(), outputs: prover.outputs() };
    // Drain temporary source state for retained keys, even without disk caching.
    const raw = exportRaw || residentBudget > 0 ? prover.export_raw() : new Uint8Array();
    estimatedBytes = Math.max(estimatedBytes, raw.byteLength * 3);
    makeRoom(estimatedBytes);
    loaded = { fileName, prover, estimatedBytes };
    residents.set(fileName, loaded);
    return { ...info, loadedKeys: [...residents.keys()],
      ...(exportRaw && raw.byteLength > 0 ? { raw } : {}) };
  } catch (error) {
    prover.free();
    throw error;
  }
}

async function prove(body: string): Promise<ProofValue & { backend: "gpu" | "cpu" }> {
  if (loaded === undefined) throw new Error("no key is loaded");
  const { prover } = loaded;
  try {
    return { ...await prover.prove(body), backend: prover.has_gpu() ? "gpu" : "cpu" };
  } catch (error) {
    // A request the runtime refuses, such as one the circuit does not
    // satisfy, fails on the CPU too and keeps the GPU.
    if (!prover.has_gpu() || !gpuFault(error)) {
      if (error === "unverified") throw new WasmProverError("wasm_verify_failed");
      throw error;
    }
    // A GPU that failed, or whose arithmetic went wrong: the CPU proves
    // from now on.
    prover.drop_gpu();
    try {
      return { ...await prover.prove(body), backend: "cpu" };
    } catch (retried) {
      if (retried === "unverified") throw new WasmProverError("wasm_verify_failed");
      throw retried;
    }
  }
}

/**
 * Whether a rejected proof was the GPU's fault: the runtime rejects with
 * "unverified" when a proof did not verify, and with "the GPU failed: ..."
 * when the GPU's work did not finish. Every other rejection is the request's.
 */
function gpuFault(error: unknown): boolean {
  return error === "unverified" || (error instanceof Error && error.message.startsWith("the GPU failed"));
}

async function handle(request: WorkerRequest): Promise<unknown> {
  switch (request.kind) {
    case "init":
      await init(request.threads, request.gpu, request.residentKeyBudgetBytes);
      return {
        initialized: true,
        threads: activeThreads,
        gpuAvailable,
        rawKeyFormat: requireRuntime().raw_format(),
      };
    case "loadKey":
      return await loadKey(
        request.fileName,
        new Uint8Array(request.key),
        request.keySha256,
        request.exportRaw,
        request.keyBytes,
      );
    case "selectKey":
      selectKey(request.fileName, request.keySha256);
      return { keys: [...residents.keys()] };
    case "prove":
      return await prove(request.body);
    case "loadedKeys":
      return { keys: [...residents.keys()] };
  }
}

let queue = Promise.resolve();
self.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  const started = performance.now();
  queue = queue
    .then(() => handle(request))
    .then(
      (value) => {
        const response: WorkerResponse = {
          id: request.id,
          ok: true,
          value,
          ms: performance.now() - started,
        };
        // A raw key is tens of megabytes; move it rather than copy it.
        const raw = (value as { raw?: unknown } | undefined)?.raw;
        self.postMessage(response, raw instanceof Uint8Array ? [raw.buffer] : []);
      },
      (error: unknown) => {
        // Only a code crosses the boundary: the runtime's messages may echo
        // the request.
        const response: WorkerResponse = {
          id: request.id,
          ok: false,
          error: error instanceof WasmProverError ? error.code : operationError(request.kind).code,
          ms: performance.now() - started,
        };
        self.postMessage(response);
      },
    );
});
