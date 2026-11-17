# Proof timing on main

Written by CI after every push to `main` (`scripts/proof-timing-history.mjs` on `main`), from headless Chrome on each CI runner. Runner numbers compare commits, not laptops: up to about 30 % between two commits can be the runner. The data is in `history/`, a line per commit.

## Linux x64, AMD EPYC 7763 64-Core Processor, 16 GiB, 4 threads, Chrome 157

**Before:** [`44344d0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/44344d095f3eff216ee447616e6ef789cb357840) of 2026-11-13. **After:** [`e040452`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/e040452b4de42a21c3532d06344d842eed7e2751) of 2026-11-17.

| by scenario | | 1 → 2 | 2 → 2 | 4 → 2 | 8 → 2 | 16 → 2 | 24 → 2 | merge 24 → 1 |
|---|---|---|---|---|---|---|---|---|
| first run, including download | before | 5.01 s (download: 1.26 s, 6.5 MiB) | 6.61 s (download: 0.33 s, 11.6 MiB) | 11.49 s (download: 0.52 s, 21.6 MiB) | 22.12 s (download: 0.76 s, 41.9 MiB) | 42.67 s (download: 1.49 s, 84.2 MiB) | 68.62 s (download: 2.36 s, 138.6 MiB) | 66.76 s (download: 2.16 s, 133.1 MiB) |
| | after | 6.11 s (download: 0.75 s, 6.5 MiB) (+22 %) | 11.26 s (download: 0.41 s, 11.6 MiB) (+70 % **!**) | 17.70 s (download: 0.59 s, 21.6 MiB) (+54 % **!**) | 33.10 s (download: 1.07 s, 41.9 MiB) (+50 % **!**) | 66.05 s (download: 3.43 s, 84.2 MiB) (+55 % **!**) | 103.06 s (download: 2.73 s, 138.6 MiB) (+50 % **!**) | 98.89 s (download: 2.56 s, 133.1 MiB) (+48 % **!**) |
| warm | before | 0.68 s | 1.36 s | 2.06 s | 3.67 s | 6.90 s | 11.20 s | 10.78 s |
| | after | 0.95 s (+38 % **!**) | 1.97 s (+45 % **!**) | 2.85 s (+38 % **!**) | 4.88 s (+33 %) | 9.17 s (+33 %) | 15.09 s (+35 %) | 14.68 s (+36 % **!**) |
| first run after restart | before | 0.99 s | 1.57 s | 2.27 s | 3.92 s | 7.52 s | 11.87 s | 11.73 s |
| | after | 1.13 s (+14 %) | 1.76 s (+12 %) | 3.21 s (+42 % **!**) | 5.39 s (+37 % **!**) | 10.14 s (+35 %) | 16.21 s (+37 % **!**) | 15.79 s (+35 %) |
| repeated after restart | before | 0.72 s | 1.36 s | 2.08 s | 3.57 s | 6.88 s | 11.09 s | 10.73 s |
| | after | 1.13 s (+56 % **!**) | 1.57 s (+15 %) | 2.86 s (+38 % **!**) | 4.88 s (+36 % **!**) | 9.14 s (+33 %) | 14.96 s (+35 %) | 14.88 s (+39 % **!**) |

| by stage | | 1 → 2 | 2 → 2 | 4 → 2 | 8 → 2 | 16 → 2 | 24 → 2 | merge 24 → 1 |
|---|---|---|---|---|---|---|---|---|
| key load | before | 0.03 s | 0.06 s | 0.09 s | 0.17 s | 0.35 s | 0.51 s | 0.49 s |
| | after | 0.04 s | 0.07 s | 0.12 s | 0.21 s | 0.42 s (+20 %) | 0.67 s (+31 %) | 0.67 s (+37 % **!**) |
| witness | before | 0.00 s | 0.00 s | 0.00 s | 0.00 s | 0.00 s | 0.00 s | 0.00 s |
| | after | 0.00 s | 0.00 s | 0.00 s | 0.00 s | 0.00 s | 0.00 s | 0.00 s |
| prove | before | 0.68 s | 1.33 s | 2.02 s | 3.54 s | 6.83 s | 11.10 s | 10.76 s |
| | after | 0.97 s (+43 % **!**) | 1.54 s (+16 %) | 2.80 s (+39 % **!**) | 4.84 s (+37 % **!**) | 9.15 s (+34 %) | 14.98 s (+35 % **!**) | 14.65 s (+36 % **!**) |

### Proof, last 20 commits

| commit | date | 1 → 2 | 2 → 2 | 4 → 2 | 8 → 2 | 16 → 2 | 24 → 2 | merge 24 → 1 |
|---|---|---|---|---|---|---|---|---|
| [`e040452`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/e040452b4de42a21c3532d06344d842eed7e2751) | 2026-11-17 | 0.97 s | 1.54 s | 2.80 s | 4.84 s | 9.15 s | 14.98 s | 14.65 s |
| [`44344d0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/44344d095f3eff216ee447616e6ef789cb357840) | 2026-11-13 | 0.68 s | 1.33 s | 2.02 s | 3.54 s | 6.83 s | 11.10 s | 10.76 s |
| [`3d6e44d`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/3d6e44da79f31a560eb54d5df5253fe927aabfe3) | 2026-11-05 | 0.84 s | 1.15 s | 2.04 s | 3.64 s | 6.87 s | 11.21 s | 10.99 s |
| [`087bc04`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/087bc04d779f2e8dc8e11f8b3633d5217b1e32d6) | 2026-11-05 | 0.49 s | 0.95 s | 1.47 s | 2.67 s | 4.97 s | 8.15 s | 7.70 s |
| [`7875105`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/7875105fc947499a04ae633eac2c99c8ee2b8c5f) | 2026-11-03 | 1.05 s | 1.51 s | 2.71 s | 4.73 s | 8.98 s | 14.48 s | 14.04 s |
| [`cb322e0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/cb322e08941aeb563022846cd8205b67c0ff037c) | 2026-10-29 | 0.52 s | 0.80 s | 1.44 s | 2.62 s | 4.94 s | 8.05 s | 7.82 s |
| [`a537558`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/a53755812cf4f3bb891babb39c5aa8bde98f0913) | 2026-10-29 | 0.94 s | 1.57 s | 2.86 s | 4.96 s | 9.25 s | 14.88 s | 14.52 s |
| [`e80b3e0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/e80b3e0076f08b880a260e2567d3db10f6ce1968) | 2026-10-29 | 0.95 s | 1.57 s | 2.84 s | 5.00 s | 9.27 s | 14.98 s | 14.64 s |
| [`ec81dbd`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/ec81dbd3e00b6683b91e37f10f10d152307f32a0) | 2026-10-29 | 1.30 s | 1.72 s | 3.05 s | 5.47 s | 10.34 s | 16.48 s | 15.97 s |
| [`ded898d`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/ded898dd414788780bf0b5479016cfd1535d31e8) | 2026-10-27 | 1.05 s | 1.59 s | 2.90 s | 5.02 s | 9.36 s | 15.12 s | 14.79 s |
| [`ce50ff4`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/ce50ff499e6f8d680c2277e79ca5cd7c3b9c8da8) | 2026-10-25 | 0.51 s | 1.03 s | 1.56 s | 2.82 s | 5.35 s | 8.92 s | 8.66 s |
| [`5347fc5`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/5347fc56552c3755c8ce78423ae879c398eb37c4) | 2026-10-25 | 1.29 s | 1.73 s | 3.11 s | 5.50 s | 10.35 s | 17.16 s | 16.60 s |
| [`3762798`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/3762798d6dd55700f8c64de09da9bde991d6b970) | 2026-10-25 | 0.88 s | 1.17 s | 2.09 s | 3.73 s | 7.02 s | 11.39 s | 11.05 s |
| [`a819d8b`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/a819d8b51327cfc08cfe336ea9057b9e7f387bb4) | 2026-10-25 | 0.52 s | 1.08 s | 1.56 s | 2.83 s | 5.46 s | 8.79 s | 8.38 s |
| [`a406059`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/a40605927bda90e78453df6bafc7f9b222743f89) | 2026-10-25 | 0.62 s | 0.92 s | 1.62 s | 2.88 s | 5.60 s | 9.16 s | 8.67 s |
| [`1a85579`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/1a85579e17ce668545ba6e0cbafb50aa21eba8d9) | 2026-10-23 | 0.53 s | 1.17 s | 1.65 s | 2.95 s | 5.37 s | 8.87 s | 8.48 s |
| [`1f24d21`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/1f24d212a540b687bc63799c8968fb5e8bf553a6) | 2026-10-23 | 0.70 s | 1.18 s | 2.11 s | 3.75 s | 7.08 s | 11.41 s | 11.11 s |
| [`6a6a0ee`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/6a6a0eeef8d35a743c29c98d5f8e8873e08f6674) | 2026-10-23 | 1.14 s | 1.60 s | 2.90 s | 5.09 s | 9.51 s | 15.27 s | 14.98 s |
| [`1efa1b3`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/1efa1b383a150debacecead29fb8047a34bcf1f4) | 2026-10-20 | 0.83 s | 1.23 s | 2.13 s | 4.02 s | 7.25 s | 11.71 s | 11.37 s |
| [`48cb1ed`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/48cb1ed62d90bd951f07e35f7616d5c01c0599f9) | 2026-10-20 | 1.15 s | 1.59 s | 2.81 s | 5.26 s | 9.57 s | 15.46 s | 15.11 s |

### First run after a restart, last 20 commits

| commit | date | 1 → 2 | 2 → 2 | 4 → 2 | 8 → 2 | 16 → 2 | 24 → 2 | merge 24 → 1 |
|---|---|---|---|---|---|---|---|---|
| [`e040452`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/e040452b4de42a21c3532d06344d842eed7e2751) | 2026-11-17 | 1.13 s | 1.76 s | 3.21 s | 5.39 s | 10.14 s | 16.21 s | 15.79 s |
| [`44344d0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/44344d095f3eff216ee447616e6ef789cb357840) | 2026-11-13 | 0.99 s | 1.57 s | 2.27 s | 3.92 s | 7.52 s | 11.87 s | 11.73 s |
| [`3d6e44d`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/3d6e44da79f31a560eb54d5df5253fe927aabfe3) | 2026-11-05 | 0.99 s | 1.42 s | 2.27 s | 4.07 s | 7.66 s | 12.32 s | 12.12 s |
| [`087bc04`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/087bc04d779f2e8dc8e11f8b3633d5217b1e32d6) | 2026-11-05 | 0.65 s | 1.17 s | 1.69 s | 3.01 s | 5.50 s | 8.93 s | 8.61 s |
| [`7875105`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/7875105fc947499a04ae633eac2c99c8ee2b8c5f) | 2026-11-03 | 1.26 s | 1.72 s | 3.00 s | 5.25 s | 9.81 s | 15.80 s | 15.18 s |
| [`cb322e0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/cb322e08941aeb563022846cd8205b67c0ff037c) | 2026-10-29 | 0.79 s | 0.94 s | 1.64 s | 3.06 s | 5.52 s | 8.96 s | 8.57 s |
| [`a537558`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/a53755812cf4f3bb891babb39c5aa8bde98f0913) | 2026-10-29 | 1.29 s | 1.77 s | 3.31 s | 5.54 s | 10.09 s | 16.12 s | 15.78 s |
| [`e80b3e0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/e80b3e0076f08b880a260e2567d3db10f6ce1968) | 2026-10-29 | 1.16 s | 1.82 s | 3.30 s | 5.51 s | 10.03 s | 16.29 s | 15.91 s |
| [`ec81dbd`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/ec81dbd3e00b6683b91e37f10f10d152307f32a0) | 2026-10-29 | 1.73 s | 1.95 s | 3.48 s | 6.04 s | 11.10 s | 17.59 s | 17.20 s |
| [`ded898d`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/ded898dd414788780bf0b5479016cfd1535d31e8) | 2026-10-27 | 1.26 s | 1.79 s | 3.13 s | 5.42 s | 9.92 s | 15.92 s | 15.55 s |
| [`ce50ff4`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/ce50ff499e6f8d680c2277e79ca5cd7c3b9c8da8) | 2026-10-25 | 0.64 s | 1.18 s | 1.74 s | 3.05 s | 5.78 s | 9.57 s | 9.15 s |
| [`5347fc5`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/5347fc56552c3755c8ce78423ae879c398eb37c4) | 2026-10-25 | 1.48 s | 1.92 s | 3.50 s | 5.93 s | 11.03 s | 18.07 s | 17.52 s |
| [`3762798`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/3762798d6dd55700f8c64de09da9bde991d6b970) | 2026-10-25 | 1.01 s | 1.33 s | 2.31 s | 4.03 s | 7.42 s | 11.96 s | 11.66 s |
| [`a819d8b`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/a819d8b51327cfc08cfe336ea9057b9e7f387bb4) | 2026-10-25 | 0.67 s | 1.26 s | 1.73 s | 3.20 s | 5.85 s | 9.31 s | 8.89 s |
| [`a406059`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/a40605927bda90e78453df6bafc7f9b222743f89) | 2026-10-25 | 0.82 s | 1.04 s | 1.81 s | 3.13 s | 5.96 s | 9.79 s | 9.19 s |
| [`1a85579`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/1a85579e17ce668545ba6e0cbafb50aa21eba8d9) | 2026-10-23 | 0.66 s | 1.35 s | 1.83 s | 3.16 s | 5.74 s | 9.60 s | 8.93 s |
| [`1f24d21`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/1f24d212a540b687bc63799c8968fb5e8bf553a6) | 2026-10-23 | 0.90 s | 1.33 s | 2.34 s | 3.99 s | 7.56 s | 11.94 s | 11.78 s |
| [`6a6a0ee`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/6a6a0eeef8d35a743c29c98d5f8e8873e08f6674) | 2026-10-23 | 1.33 s | 1.82 s | 3.13 s | 5.44 s | 10.07 s | 16.15 s | 15.76 s |
| [`1efa1b3`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/1efa1b383a150debacecead29fb8047a34bcf1f4) | 2026-10-20 | 1.68 s | 1.88 s | 3.11 s | 5.56 s | 10.09 s | 16.11 s | 15.66 s |
| [`48cb1ed`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/48cb1ed62d90bd951f07e35f7616d5c01c0599f9) | 2026-10-20 | 2.05 s | 2.56 s | 4.18 s | 7.61 s | 13.84 s | 22.47 s | 21.77 s |

## macOS arm64, Apple M1 (Virtual), 7 GiB, 3 threads, Chrome 156

**Before:** [`44344d0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/44344d095f3eff216ee447616e6ef789cb357840) of 2026-11-13. **After:** [`e040452`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/e040452b4de42a21c3532d06344d842eed7e2751) of 2026-11-17.

| by scenario | | 1 → 2 | 2 → 2 | 4 → 2 | 8 → 2 | 16 → 2 | 24 → 2 | merge 24 → 1 |
|---|---|---|---|---|---|---|---|---|
| first run, including download | before | 10.93 s (download: 1.74 s, 6.5 MiB) | 7.14 s (download: 0.66 s, 11.6 MiB) | 18.13 s (download: 1.07 s, 21.6 MiB) | 28.37 s (download: 6.55 s, 41.9 MiB) | 50.10 s (download: 9.15 s, 84.2 MiB) | 77.77 s (download: 11.98 s, 138.6 MiB) | 78.77 s (download: 14.36 s, 133.1 MiB) |
| | after | 14.42 s (download: 3.99 s, 6.5 MiB) (+32 %) | 9.63 s (download: 0.84 s, 11.6 MiB) (+35 %) | 17.57 s (download: 0.91 s, 21.6 MiB) (-3 %) | 34.32 s (download: 7.56 s, 41.9 MiB) (+21 %) | 64.48 s (download: 10.62 s, 84.2 MiB) (+29 %) | 130.23 s (download: 28.15 s, 138.6 MiB) (+67 % **!**) | 102.10 s (download: 14.49 s, 133.1 MiB) (+30 %) |
| warm | before | 0.32 s | 0.38 s | 0.63 s | 0.91 s | 1.53 s | 3.15 s | 2.47 s |
| | after | 0.44 s (+35 %) | 0.41 s | 0.65 s | 0.94 s | 1.56 s | 3.06 s (-3 %) | 2.92 s (+18 %) |
| first run after restart | before | 6.45 s | 6.76 s | 6.99 s | 6.20 s | 7.21 s | 10.30 s | 11.48 s |
| | after | 9.67 s (+50 % **!**) | 9.34 s (+38 % **!**) | 8.27 s (+18 %) | 8.69 s (+40 % **!**) | 10.51 s (+46 % **!**) | 15.62 s (+52 % **!**) | 15.34 s (+34 %) |
| repeated after restart | before | 0.28 s | 0.37 s | 0.61 s | 0.92 s | 1.57 s | 2.52 s | 2.85 s |
| | after | 0.29 s | 0.48 s (+28 %) | 0.65 s | 0.92 s | 1.98 s (+26 %) | 3.28 s (+30 %) | 3.66 s (+28 %) |

| by stage | | 1 → 2 | 2 → 2 | 4 → 2 | 8 → 2 | 16 → 2 | 24 → 2 | merge 24 → 1 |
|---|---|---|---|---|---|---|---|---|
| key load | before | 0.05 s | 0.08 s | 0.09 s | 0.16 s | 0.33 s | 0.73 s | 0.88 s |
| | after | 0.08 s | 0.08 s | 0.13 s | 0.24 s (+50 % **!**) | 0.29 s | 1.34 s (+84 % **!**) | 1.47 s (+67 % **!**) |
| witness | before | 0.00 s | 0.00 s | 0.00 s | 0.00 s | 0.00 s | 0.00 s | 0.00 s |
| | after | 0.00 s | 0.00 s | 0.00 s | 0.00 s | 0.00 s | 0.00 s | 0.00 s |
| prove | before | 0.24 s | 0.34 s | 0.60 s | 0.88 s | 1.57 s | 2.69 s | 2.62 s |
| | after | 0.35 s (+44 % **!**) | 0.39 s | 0.60 s | 0.89 s | 1.72 s (+9 %) | 3.45 s (+28 %) | 3.61 s (+38 % **!**) |

### Proof, last 20 commits

| commit | date | 1 → 2 | 2 → 2 | 4 → 2 | 8 → 2 | 16 → 2 | 24 → 2 | merge 24 → 1 |
|---|---|---|---|---|---|---|---|---|
| [`e040452`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/e040452b4de42a21c3532d06344d842eed7e2751) | 2026-11-17 | 0.35 s | 0.39 s | 0.60 s | 0.89 s | 1.72 s | 3.45 s | 3.61 s |
| [`44344d0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/44344d095f3eff216ee447616e6ef789cb357840) | 2026-11-13 | 0.24 s | 0.34 s | 0.60 s | 0.88 s | 1.57 s | 2.69 s | 2.62 s |
| [`3d6e44d`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/3d6e44da79f31a560eb54d5df5253fe927aabfe3) | 2026-11-05 | 0.26 s | 0.36 s | 0.59 s | 0.96 s | 1.79 s | 3.46 s | 2.84 s |
| [`087bc04`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/087bc04d779f2e8dc8e11f8b3633d5217b1e32d6) | 2026-11-05 | 0.35 s | 0.51 s | 0.60 s | 0.99 s | 1.80 s | 3.26 s | 2.58 s |
| [`7875105`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/7875105fc947499a04ae633eac2c99c8ee2b8c5f) | 2026-11-03 | 0.32 s | 0.45 s | 0.60 s | 0.98 s | 2.32 s | 4.83 s | 4.73 s |
| [`cb322e0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/cb322e08941aeb563022846cd8205b67c0ff037c) | 2026-10-29 | 0.29 s | 0.49 s | 0.62 s | 0.97 s | 2.30 s | 4.16 s | 2.74 s |
| [`a537558`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/a53755812cf4f3bb891babb39c5aa8bde98f0913) | 2026-10-29 | 0.29 s | 0.41 s | 0.67 s | 1.05 s | 2.34 s | 5.38 s | 4.23 s |
| [`e80b3e0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/e80b3e0076f08b880a260e2567d3db10f6ce1968) | 2026-10-29 | 0.37 s | 0.43 s | 0.60 s | 0.95 s | 1.75 s | 3.29 s | 3.32 s |
| [`ec81dbd`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/ec81dbd3e00b6683b91e37f10f10d152307f32a0) | 2026-10-29 | 0.27 s | 0.43 s | 0.61 s | 0.93 s | 1.86 s | 4.40 s | 3.34 s |
| [`ded898d`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/ded898dd414788780bf0b5479016cfd1535d31e8) | 2026-10-27 | 0.39 s | 0.47 s | 0.61 s | 1.00 s | 1.84 s | 4.70 s | 3.32 s |
| [`ce50ff4`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/ce50ff499e6f8d680c2277e79ca5cd7c3b9c8da8) | 2026-10-25 | 0.33 s | 0.43 s | 0.65 s | 0.96 s | 2.44 s | 3.24 s | 4.06 s |
| [`5347fc5`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/5347fc56552c3755c8ce78423ae879c398eb37c4) | 2026-10-25 | 0.24 s | 0.35 s | 0.59 s | 0.90 s | 1.81 s | 3.81 s | 2.57 s |
| [`3762798`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/3762798d6dd55700f8c64de09da9bde991d6b970) | 2026-10-25 | 0.36 s | 0.38 s | 0.64 s | 0.97 s | 1.96 s | 2.76 s | 5.94 s |
| [`a819d8b`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/a819d8b51327cfc08cfe336ea9057b9e7f387bb4) | 2026-10-25 | 0.25 s | 0.34 s | 0.64 s | 0.93 s | 1.63 s | 2.60 s | 2.62 s |
| [`a406059`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/a40605927bda90e78453df6bafc7f9b222743f89) | 2026-10-25 | 0.37 s | 0.57 s | 0.65 s | 0.94 s | 1.76 s | 2.67 s | 3.33 s |
| [`1a85579`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/1a85579e17ce668545ba6e0cbafb50aa21eba8d9) | 2026-10-23 | 0.34 s | 0.46 s | 0.76 s | 1.06 s | 3.63 s | 4.52 s | 5.03 s |
| [`1f24d21`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/1f24d212a540b687bc63799c8968fb5e8bf553a6) | 2026-10-23 | 0.26 s | 0.41 s | 0.64 s | 0.92 s | 1.64 s | 3.81 s | 2.54 s |
| [`6a6a0ee`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/6a6a0eeef8d35a743c29c98d5f8e8873e08f6674) | 2026-10-23 | 0.44 s | 0.38 s | 0.65 s | 0.96 s | 1.80 s | 3.31 s | 3.19 s |
| [`1efa1b3`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/1efa1b383a150debacecead29fb8047a34bcf1f4) | 2026-10-20 | 0.56 s | 0.86 s | 2.40 s | 3.60 s | 6.94 s | 10.72 s | 9.29 s |
| [`48cb1ed`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/48cb1ed62d90bd951f07e35f7616d5c01c0599f9) | 2026-10-20 | 0.44 s | 0.79 s | 1.83 s | 2.42 s | 4.42 s | 6.95 s | 7.10 s |

### First run after a restart, last 20 commits

| commit | date | 1 → 2 | 2 → 2 | 4 → 2 | 8 → 2 | 16 → 2 | 24 → 2 | merge 24 → 1 |
|---|---|---|---|---|---|---|---|---|
| [`e040452`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/e040452b4de42a21c3532d06344d842eed7e2751) | 2026-11-17 | 9.67 s | 9.34 s | 8.27 s | 8.69 s | 10.51 s | 15.62 s | 15.34 s |
| [`44344d0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/44344d095f3eff216ee447616e6ef789cb357840) | 2026-11-13 | 6.45 s | 6.76 s | 6.99 s | 6.20 s | 7.21 s | 10.30 s | 11.48 s |
| [`3d6e44d`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/3d6e44da79f31a560eb54d5df5253fe927aabfe3) | 2026-11-05 | 9.59 s | 7.25 s | 8.39 s | 7.86 s | 12.09 s | 20.90 s | 12.46 s |
| [`087bc04`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/087bc04d779f2e8dc8e11f8b3633d5217b1e32d6) | 2026-11-05 | 9.87 s | 11.84 s | 7.93 s | 8.61 s | 11.57 s | 20.32 s | 12.86 s |
| [`7875105`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/7875105fc947499a04ae633eac2c99c8ee2b8c5f) | 2026-11-03 | 10.42 s | 10.38 s | 8.37 s | 9.62 s | 13.02 s | 20.06 s | 18.45 s |
| [`cb322e0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/cb322e08941aeb563022846cd8205b67c0ff037c) | 2026-10-29 | 11.44 s | 11.29 s | 9.21 s | 10.71 s | 15.84 s | 16.42 s | 14.87 s |
| [`a537558`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/a53755812cf4f3bb891babb39c5aa8bde98f0913) | 2026-10-29 | 12.79 s | 12.49 s | 11.13 s | 13.72 s | 16.30 s | 24.16 s | 23.64 s |
| [`e80b3e0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/e80b3e0076f08b880a260e2567d3db10f6ce1968) | 2026-10-29 | 9.01 s | 10.82 s | 8.07 s | 8.90 s | 12.32 s | 19.33 s | 14.96 s |
| [`ec81dbd`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/ec81dbd3e00b6683b91e37f10f10d152307f32a0) | 2026-10-29 | 9.16 s | 9.13 s | 8.62 s | 9.50 s | 12.35 s | 22.62 s | 20.49 s |
| [`ded898d`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/ded898dd414788780bf0b5479016cfd1535d31e8) | 2026-10-27 | 11.21 s | 12.01 s | 8.32 s | 14.12 s | 14.40 s | 18.13 s | 12.73 s |
| [`ce50ff4`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/ce50ff499e6f8d680c2277e79ca5cd7c3b9c8da8) | 2026-10-25 | 12.70 s | 10.40 s | 9.30 s | 10.75 s | 15.14 s | 20.35 s | 17.70 s |
| [`5347fc5`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/5347fc56552c3755c8ce78423ae879c398eb37c4) | 2026-10-25 | 7.55 s | 7.74 s | 7.16 s | 8.23 s | 15.15 s | 16.77 s | 10.03 s |
| [`3762798`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/3762798d6dd55700f8c64de09da9bde991d6b970) | 2026-10-25 | 11.49 s | 10.44 s | 9.26 s | 10.38 s | 12.13 s | 12.58 s | 24.86 s |
| [`a819d8b`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/a819d8b51327cfc08cfe336ea9057b9e7f387bb4) | 2026-10-25 | 9.46 s | 8.42 s | 7.50 s | 10.07 s | 9.23 s | 9.69 s | 8.91 s |
| [`a406059`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/a40605927bda90e78453df6bafc7f9b222743f89) | 2026-10-25 | 9.78 s | 9.94 s | 11.59 s | 12.61 s | 9.10 s | 10.57 s | 9.96 s |
| [`1a85579`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/1a85579e17ce668545ba6e0cbafb50aa21eba8d9) | 2026-10-23 | 14.83 s | 14.49 s | 14.51 s | 15.56 s | 20.72 s | 20.95 s | 25.80 s |
| [`1f24d21`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/1f24d212a540b687bc63799c8968fb5e8bf553a6) | 2026-10-23 | 11.04 s | 10.57 s | 9.14 s | 11.59 s | 9.13 s | 18.16 s | 11.49 s |
| [`6a6a0ee`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/6a6a0eeef8d35a743c29c98d5f8e8873e08f6674) | 2026-10-23 | 9.01 s | 8.07 s | 8.23 s | 8.66 s | 12.52 s | 18.98 s | 14.33 s |
| [`1efa1b3`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/1efa1b383a150debacecead29fb8047a34bcf1f4) | 2026-10-20 | 1.85 s | 2.25 s | 5.32 s | 6.79 s | 12.30 s | 18.82 s | 16.65 s |
| [`48cb1ed`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/48cb1ed62d90bd951f07e35f7616d5c01c0599f9) | 2026-10-20 | 0.93 s | 1.56 s | 2.75 s | 4.37 s | 7.20 s | 13.10 s | 12.34 s |

## chrome

**After:** [`c7595d0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/c7595d09889d88b992db7abaf1f654962c7c4dad) of 2026-10-17. No report of `main` to compare with yet.

| by scenario | 1 → 2 | 2 → 2 | 4 → 2 | 8 → 2 | 16 → 2 | 24 → 2 | merge 24 → 1 |
|---|---|---|---|---|---|---|---|
| first run, including download | 5.75 s (download: 1.94 s, 8.8 MiB) | 7.81 s (download: 0.64 s, 15.6 MiB) | 12.08 s (download: 1.32 s, 28.9 MiB) | 22.52 s (download: 1.80 s, 55.9 MiB) | 41.95 s (download: 2.16 s, 109.5 MiB) | 66.68 s (download: 3.10 s, 171.6 MiB) | 64.38 s (download: 2.81 s, 165.0 MiB) |
| warm | 1.07 s | 1.88 s | 2.86 s | 5.32 s | 9.53 s | 15.21 s | 14.95 s |
| first run after restart | 1.73 s | 2.46 s | 4.17 s | 7.24 s | 13.17 s | 20.63 s | 20.27 s |
| repeated after restart | 1.15 s | 1.66 s | 2.94 s | 5.30 s | 9.55 s | 15.32 s | 15.06 s |

| by stage | 1 → 2 | 2 → 2 | 4 → 2 | 8 → 2 | 16 → 2 | 24 → 2 | merge 24 → 1 |
|---|---|---|---|---|---|---|---|
| key load | 0.28 s | 0.41 s | 0.74 s | 1.45 s | 2.80 s | 4.53 s | 4.52 s |
| witness | 0.00 s | 0.00 s | 0.00 s | 0.00 s | 0.00 s | 0.00 s | 0.00 s |
| prove | 1.00 s | 1.61 s | 2.82 s | 5.25 s | 9.49 s | 15.16 s | 14.87 s |

### Proof, last 1 commits

| commit | date | 1 → 2 | 2 → 2 | 4 → 2 | 8 → 2 | 16 → 2 | 24 → 2 | merge 24 → 1 |
|---|---|---|---|---|---|---|---|---|
| [`c7595d0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/c7595d09889d88b992db7abaf1f654962c7c4dad) | 2026-10-17 | 1.00 s | 1.61 s | 2.82 s | 5.25 s | 9.49 s | 15.16 s | 14.87 s |

### First run after a restart, last 1 commits

| commit | date | 1 → 2 | 2 → 2 | 4 → 2 | 8 → 2 | 16 → 2 | 24 → 2 | merge 24 → 1 |
|---|---|---|---|---|---|---|---|---|
| [`c7595d0`](https://github.com/helius-labs/privacy-ring-web-sdk/commit/c7595d09889d88b992db7abaf1f654962c7c4dad) | 2026-10-17 | 1.73 s | 2.46 s | 4.17 s | 7.24 s | 13.17 s | 20.63 s | 20.27 s |
