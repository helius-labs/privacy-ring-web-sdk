import { ClientError } from "@heliuslabs/spr";

export const MAX_LOCAL_INPUTS = 8;
export const MERGE_FIRST = `Merge notes with the TEE first. Local proofs use at most ${MAX_LOCAL_INPUTS} inputs.`;
/** The code of the guard's refusal, which the SDK reports in `CLIENT_PROVER_HTTP`'s `reason`. */
const TOO_MANY_INPUTS = "local_too_many_inputs";

export function localSpendLimit(notes: readonly { readonly amount: bigint }[]): bigint {
  return [...notes]
    .sort((a, b) => a.amount > b.amount ? -1 : a.amount < b.amount ? 1 : 0)
    .slice(0, MAX_LOCAL_INPUTS)
    .reduce((total, note) => total + note.amount, 0n);
}

/**
 * Enforce the demo's limit before a request reaches the local prover worker.
 * A refusal is a 422 answer, not a thrown error: the SDK retries a `fetch` that
 * throws as a transport failure, and fails at once on an error status.
 */
export function limitLocalProofs(localFetch: typeof fetch, proverUrl: string): typeof fetch {
  const origin = new URL(proverUrl).origin;
  return async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    if (url.origin === origin && /^\/prove(?:\/|$)/u.test(url.pathname)) {
      const request = new Request(input, init);
      if (request.method === "POST") {
        const body = await request.clone().json() as { inputs?: unknown };
        if (Array.isArray(body.inputs) && body.inputs.length > MAX_LOCAL_INPUTS) {
          return Response.json({ code: TOO_MANY_INPUTS, message: MERGE_FIRST }, { status: 422 });
        }
      }
    }
    return localFetch(input, init);
  };
}

/**
 * The guard's refusal becomes `MERGE_FIRST`; any other error is kept. The SDK
 * reports the refusal as a `CLIENT_PROVER_HTTP`, which the transaction
 * builders wrap in a `WalletError` as its `cause`.
 */
export function localProofError(error: unknown): unknown {
  let cause = error;
  for (let depth = 0; cause instanceof Error && depth < 4; depth++, cause = cause.cause) {
    if (!(cause instanceof ClientError) || cause.code !== "CLIENT_PROVER_HTTP") continue;
    const { reason } = (cause as ClientError<"CLIENT_PROVER_HTTP">).details ?? {};
    if (reason?.startsWith(`${TOO_MANY_INPUTS}:`) === true) return new Error(MERGE_FIRST);
  }
  return error;
}
