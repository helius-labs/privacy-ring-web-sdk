import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const isolationHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

export default defineConfig({
  plugins: [react()],
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
});
