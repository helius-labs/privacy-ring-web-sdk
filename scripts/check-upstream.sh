#!/usr/bin/env bash
# Fails when the zopro key pins or the wallet example's SDK pin drift from
# the zolana release pinned in upstream.lock.json: every zopro key must be
# built from the gnark key upstream pins for its circuit. The example installs
# the SDK from npm, so its pin may lag the release's until that version is
# published there. Set ZOLANA_SRC to an existing checkout to skip the clone.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
python3 "$root/scripts/sync-key-catalog.py" --check
lock="$root/upstream.lock.json"

json() { python3 -c 'import json, sys; print(json.load(open(sys.argv[1]))[sys.argv[2]])' "$@"; }
repository="$(json "$lock" repository)"
tag="$(json "$lock" tag)"
revision="$(json "$lock" revision)"
sdk="$(json "$lock" sdk)"
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || { echo "upstream.lock.json revision must be a full commit" >&2; exit 1; }

failed=0
fail() { echo "drift: $*" >&2; failed=1; }

# The tag must still name the pinned commit: a moved tag means a re-cut release.
tagged="$(git ls-remote --tags "$repository" "refs/tags/$tag^{}" "refs/tags/$tag" | awk '{ direct = $1 } /\^\{\}$/ { peeled = $1 } END { print peeled ? peeled : direct }')"
[[ "$tagged" == "$revision" ]] || fail "tag $tag is at ${tagged:-<missing>}, upstream.lock.json pins $revision"

source_dir="${ZOLANA_SRC:-}"
if [[ -z "$source_dir" ]]; then
  source_dir="$(mktemp -d "${TMPDIR:-/tmp}/zolana-upstream.XXXXXX")"
  trap 'rm -rf "$source_dir"' EXIT
  git -C "$source_dir" init -q
  git -C "$source_dir" remote add origin "$repository"
  git -C "$source_dir" fetch -q --depth=1 --filter=blob:none origin "$revision"
fi
upstream() { git -C "$source_dir" show "$revision:$1"; }
# The browser's key names, which the package defines.
key_names="$root/packages/web-prover/src/key-names.ts"

upstream_keys="$(mktemp "${TMPDIR:-/tmp}/zolana-keys.XXXXXX")"
upstream prover/server/prover/provingkeys/proving-keys.lock > "$upstream_keys"
node --input-type=module - "$key_names" "$root/zopro-keys.lock" "$upstream_keys" <<'JS' || failed=1
import { readFileSync } from "node:fs";
const [names, zoproPath, upstreamPath] = process.argv.slice(2);
const { browserKeyCircuit } = await import(names);
const zopro = JSON.parse(readFileSync(zoproPath, "utf8")).keys;
const upstream = JSON.parse(readFileSync(upstreamPath, "utf8")).keys;
let ok = true;
const fail = (message) => { console.error(`drift: ${message}`); ok = false; };
for (const name of Object.keys(upstream).sort()) {
  if (browserKeyCircuit(name) !== undefined && !(name in zopro)) fail(`upstream pins ${name}, zopro-keys.lock has no zopro key for it`);
}
for (const [name, entry] of Object.entries(zopro).sort(([a], [b]) => a.localeCompare(b))) {
  if (!(name in upstream)) fail(`zopro-keys.lock has ${name}, absent upstream`);
  else if (entry.key_sha256 !== upstream[name].sha256) fail(`${name}'s zopro key was built from gnark key ${entry.key_sha256}, upstream pins ${upstream[name].sha256}`);
}
process.exit(ok ? 0 : 1);
JS
rm -f "$upstream_keys"

# The wallet example's SDK is the pinned release, and it expects the gnark keys
# ours are built from. Until that release is on npm the example keeps the
# version npm has, and its installed SDK is not checked against our keys.
pinned="$(json "$root/examples/wallet/package.json" dependencies | python3 -c 'import ast, sys; print(ast.literal_eval(sys.stdin.read())["@heliuslabs/spr"])')"
if [[ "$pinned" != "$sdk" ]]; then
  if ! published="$(npm view @heliuslabs/spr versions --json)"; then
    fail "cannot list @heliuslabs/spr's versions on npm"
  elif python3 -c 'import json, sys; sys.exit(0 if sys.argv[1] in json.loads(sys.argv[2]) else 1)' "$sdk" "$published"; then
    fail "examples/wallet pins @heliuslabs/spr $pinned, upstream.lock.json says $sdk, which is on npm"
  else
    echo "note: examples/wallet stays on @heliuslabs/spr $pinned until $sdk is on npm; its installed SDK is not checked against the keys" >&2
  fi
fi
installed="$root/node_modules/@heliuslabs/spr"
if [[ "$pinned" == "$sdk" && -d "$installed" ]]; then
  got="$(json "$installed/package.json" version)"
  [[ "$got" == "$sdk" ]] || fail "installed @heliuslabs/spr is $got, upstream.lock.json says $sdk"
  node --input-type=module - "$key_names" "$installed/dist/interface/proving-keys.js" "$root/zopro-keys.lock" <<'JS' || failed=1
import { readFileSync } from "node:fs";
const [names, file, lock] = process.argv.slice(2);
const { browserKeyCircuit } = await import(names);
const sdk = (await import(file)).PROVING_KEY_SHA256S;
const keys = JSON.parse(readFileSync(lock, "utf8")).keys;
let ok = true;
for (const [name, sha256] of Object.entries(sdk)) {
  if (browserKeyCircuit(name) === undefined) continue;
  if (!(name in keys)) { console.error(`drift: the SDK pins ${name}, absent from zopro-keys.lock`); ok = false; }
  else if (keys[name].key_sha256 !== sha256) { console.error(`drift: the SDK pins ${name} at ${sha256}, its zopro key was built from ${keys[name].key_sha256}`); ok = false; }
}
process.exit(ok ? 0 : 1);
JS
elif [[ "$pinned" == "$sdk" ]]; then
  echo "note: node_modules absent, skipping the installed SDK check (run npm ci)" >&2
fi

if [[ "$failed" -ne 0 ]]; then
  echo "zopro keys or pins are out of sync with zolana $tag ($revision)" >&2
  exit 1
fi
if [[ "$pinned" != "$sdk" ]]; then
  echo "zopro keys and pins match zolana $tag ($revision); examples/wallet waits for @heliuslabs/spr $sdk on npm"
else
  echo "zopro keys and pins match zolana $tag ($revision) and @heliuslabs/spr $sdk"
fi
