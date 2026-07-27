import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "@autorent/schemas": fileURLToPath(new URL("../../packages/schemas/src/index.ts", import.meta.url)),
      "@autorent/tokens": fileURLToPath(new URL("../../packages/tokens/src/index.ts", import.meta.url)),
    },
  },
});
