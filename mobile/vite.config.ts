import { fileURLToPath, URL } from "node:url";

import Uni from "@uni-helper/plugin-uni";
import { defineConfig } from "vite";

const apiTarget = process.env.VITE_API_TARGET ?? "http://localhost:8080";

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
  plugins: [Uni()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
});
