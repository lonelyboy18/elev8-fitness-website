import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    testTimeout: 15_000,
    hookTimeout: 15_000,
    // Integration tests share one Postgres connection pool — run files serially to
    // avoid cross-test interference from the shared truncate-between-tests strategy.
    fileParallelism: false,
  },
});
