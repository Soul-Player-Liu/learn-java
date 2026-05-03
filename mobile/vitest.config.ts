import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@learn-java/task-api": fileURLToPath(
        new URL("../packages/task-api/src/index.ts", import.meta.url),
      ),
      "@learn-java/task-api/generated": fileURLToPath(
        new URL("../packages/task-api/src/generated/index.ts", import.meta.url),
      ),
      "@learn-java/task-domain": fileURLToPath(
        new URL("../packages/task-domain/src/index.ts", import.meta.url),
      ),
      "@learn-java/mock-data": fileURLToPath(
        new URL("../packages/mock-data/src/index.ts", import.meta.url),
      ),
    },
  },
  define: {
    "import.meta.env.VITE_USE_MOCK": JSON.stringify("true"),
    "import.meta.env.VITE_MOCK_SCENARIO": JSON.stringify("many"),
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
