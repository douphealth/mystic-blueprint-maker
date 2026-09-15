import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // The PDF suites generate real documents, so a single test can take a few
    // seconds and the 5s default leaves no headroom when the files run in
    // parallel. Worth knowing: a per-call `timeout` on findBy* cannot help here,
    // because the test-level timeout caps it.
    //
    // This is not a cure for flakiness in general — the intermittent failure in
    // app.test.tsx was a race between a dynamic import and a fixed sleep, and
    // was fixed by awaiting the real condition there, not by this.
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
