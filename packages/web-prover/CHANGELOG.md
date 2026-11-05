# Changelog

## 0.7.0-alpha — unreleased

- The first release as `@heliuslabs/spr-web-prover`: `SprWebProver` proves `@heliuslabs/spr` 0.9.0-alpha transfers and merges of up to 24 notes in a browser worker and verifies each proof, `createFetch()` answers the SDK's `/prove/<key>` requests in the page, and `spr-prover-keys` installs proving keys for self-hosting.
- `keySource` accepts the authenticated runtime key set from `@heliuslabs/spr` 0.9.0-alpha's `fetchProvingKeySet()`, including new download URLs, sizes and checksums, for compatible transfer and merge circuits.
- Runtime key sets stay fixed per prover instance and use separate caches; clear obsolete instances with `clearKeys()`.

