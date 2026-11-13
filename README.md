# Zolana Web SDK

Local Groth16 proving for Solana Privacy Rings in the browser: [`@heliuslabs/spr-web-prover`](packages/web-prover/README.md), a [wallet example](examples/wallet/README.md) that proves every transaction in the page, and a [prover benchmark](examples/browser).

**Performance.** In Chrome at four threads on an Apple M5 Pro with WebGPU, a warm proof takes about 0.06–0.43 s for 1–24 notes (0.08 s for 2×2). CPU-only is slower (0.28 s for 2×2, 2.6 s for 24×2). The first load of a shape adds key download and decode; later loads use a cached raw form (tens of milliseconds).

## Packages

- [`@heliuslabs/spr-web-prover`](packages/web-prover/README.md) — worker, keys, local prove/verify, and a `fetch` shim for the protocol SDK. Matches `@heliuslabs/spr` 0.9.0-alpha (merges of up to 24 notes).
- [`examples/wallet`](examples/wallet/README.md) — private wallet on devnet-e (register, shield, send, unshield); start here for an end-to-end flow.
- `examples/browser` — synthetic-request benchmark and timing harness.

The protocol pin is **v0.8.0-alpha**,
`c4062d3860965855e47268f61b01a27e774096eb`. Applications supply their RPC,
indexer and remote prover URLs and reviewed TEE policy. Deployment configuration
lives in the [wallet example](examples/wallet/src/deployments.ts), which selects
`SignedTeePolicy.forNetwork("devnet" | "mainnet")` from the protocol SDK. The prover
package does not select remote deployments or policies.

The example defaults to devnet-e. Set `VITE_ZOLANA_NETWORK=mainnet` and a matching
`VITE_SOLANA_RPC_URL` for mainnet testing. `VITE_TEE_PROVER_URL` and `VITE_TEE_POLICY`
(JSON contents) override the remote merge configuration. Run
`HELIUS_API_KEY=<key> npm run test:deployments` for live read-only checks of the example configuration.

## Setup

```sh
npm ci
npm run setup
npm run dev         # benchmark
npm run dev:wallet  # after setup in examples/wallet/README.md
```

`npm run setup` builds the prover (needs Rust `nightly-2025-11-15` with `wasm32-unknown-unknown` and `rust-src`, plus wasm-bindgen 0.2.128) and installs the demo 2×2 key. Apps that only `npm install` the published package need a bundler, not Rust.

Threaded proving needs cross-origin isolation (the demo Vite server sends COOP/COEP). Use `threads: 0` when isolation is unavailable.

## Develop

```sh
npm run typecheck
npm run check        # unit tests and builds
npm run check:full   # also browser + packed-consumer gates
```

Devnet e2e (funded key, keyed RPC):

```sh
npm run build:prover
ZOLANA_E2E_FUNDER=~/.config/solana/id.json \
VITE_SOLANA_RPC_URL="https://beta-devnet.helius-rpc.com/?api-key=$API_KEY" \
npm run test:devnet
```

Proof timing and GPU profiling live under `examples/browser/scripts/` (`proof-timing.mjs`, `gpu-profile.mjs`).

## Use the package

```ts
import { SprWebProver } from "@heliuslabs/spr-web-prover";

const prover = new SprWebProver({ proverUrl: "http://localhost:3001" });
const { proof, proveMs, verifyMs } = await prover.proveRequest(requestJson);
const localFetch = prover.createFetch();
```

See the [package guide](packages/web-prover/README.md) for isolation headers, `threads: 0`, extensions, keys, and lifecycle.
