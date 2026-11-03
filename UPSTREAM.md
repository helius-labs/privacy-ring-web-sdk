# Upstream

`upstream.lock.json` pins protocol SDK 0.8.0-alpha at release tag
`ts-sdk-v0.8.0-alpha`, source `6bb4f7008294695ebe614f08affb215d4321a538`
([#521](https://github.com/helius-labs/zolana/pull/521)). CI also builds and packs
this exact commit to check wallet compatibility. Local clients select
`proofDataSource: "client"`; remote merge clients use the SDK's signed policies
and `/v1/spr`, `/attestation`, `Spr-Tee*` protocol.

`key-catalog-source.json` pins the reviewed upstream `zopro-keys.lock` by commit
and SHA-256. `python3 scripts/sync-key-catalog.py` copies that manifest into this
repository, adding its CDN base URL; `--check` fails on drift. CI checks it and
compares each `key_sha256` with the protocol release's gnark pin and installed
SDK. Set `ZOLANA_SRC` to use an existing upstream Git checkout for these checks.

Each zopro key has its own byte checksum and the digest of the source gnark key.
The finalized core ceremony rotates all 41 transfer/merge conversions to
`78751f5d1c591777`. Both runtimes use the wide-transfer flag fix from zk-tools
[#7](https://github.com/helius-labs/zk-tools/pull/7). The new key set invalidates old
browser key caches. Program IDs, notes and witness layouts are unchanged; proofs
made with old keys must be rebuilt before submission.

Runtime `keyCatalog` input can change download URLs only for conversions whose
checksums and sizes match the bundled pins. It neither adds supported circuits
nor replaces the trusted conversion manifest.

The optional `keySource` API accepts the authenticated `ProvingKeySet` returned
by protocol SDK `0.8.1-alpha`'s `fetchProvingKeySet()`. This needs the matching
prover catalog deployment. It does not change the bundled default pins or the
example's protocol dependency. Runtime rotations must preserve the proof-input
contract and use solver features this pinned runtime supports.

The runtime is zopro-zolana at the revision `runtime.lock.json` pins (`scripts/build-runtime.sh`).

Source mapping:

- `poc/core` -> `packages/web-prover` (from branch `feat/mopro-browser-arkworks` at `87e9463b0d5b9527282ff7d77687258c92bb696e`)
- `poc/web` -> `examples/browser` (same branch and commit)

`fixtures/` holds valid requests for each benchmarked shape on trees of their own, from zk-tools' `zopro/tools/zolana/fixtures` at the runtime's revision: zolana's request and merge fixtures with the shape changed.
