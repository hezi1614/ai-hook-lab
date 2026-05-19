import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const srcPath = fileURLToPath(new URL("./src", import.meta.url));
const setupPath = fileURLToPath(new URL("./src/test/setup-tests.ts", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": srcPath,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: [setupPath],
  },
});
