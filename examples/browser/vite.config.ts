import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const isolationHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

/**
 * The repository's request fixtures at /fixtures/: the page's sample request
 * and the proof timing harness's shapes. The dev server serves them from
 * fixtures/ and the build emits them.
 */
function requestFixtures(): Plugin {
  const directory = fileURLToPath(new URL("../../fixtures/", import.meta.url));
  const names = readdirSync(directory).filter((name) => name.endsWith(".json"));
  return {
    name: "request-fixtures",
    configureServer(server) {
      server.middlewares.use("/fixtures", (request, response, next) => {
        const name = request.url?.slice(1).split("?")[0] ?? "";
        if (!names.includes(name)) return next();
        response.setHeader("Content-Type", "application/json");
        response.end(readFileSync(join(directory, name)));
      });
    },
    generateBundle() {
      for (const name of names)
        this.emitFile({ type: "asset", fileName: `fixtures/${name}`, source: readFileSync(join(directory, name)) });
    },
  };
}

export default defineConfig({
  plugins: [react(), requestFixtures()],
  // The SDK and the Poseidon hasher both use top-level await, so the output
  // target has to permit it. Vite 8 transforms through rolldown/oxc, which reads
  // this single target rather than the esbuild options earlier versions used.
  build: { target: "esnext" },
  worker: { format: "es" },
  server: {
    host: "127.0.0.1",
    port: 5178,
    strictPort: true,
    // Required for the prover runtime's shared-memory thread pool.
    headers: isolationHeaders,
  },
  preview: { host: "127.0.0.1", headers: isolationHeaders },
  // Proving keys are served from public/keys in local development so the browser
  // fetches them same-origin, with no CORS configuration on the key host.
  publicDir: "public",
});
