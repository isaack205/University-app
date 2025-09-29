import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

const isAnalyze = process.env.ANALYZE === "true";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    isAnalyze &&
      visualizer({
        filename: "stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force all React / React DOM imports to same copy
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/scheduler/") ||
              id.includes("node_modules/react-refresh")
            ) {
              return "vendor-react";
            }
            if (
              id.includes("node_modules/framer-motion") ||
              id.includes("node_modules/motion-dom") ||
              id.includes("node_modules/animation") ||
              id.includes("node_modules/gestures") ||
              id.includes("node_modules/drag") ||
              id.includes("node_modules/pan") ||
              id.includes("node_modules/projection")
            ) {
              return "vendor-animation";
            }
            if (id.includes("node_modules/axios")) {
              return "vendor-axios";
            }
            if (
              id.includes("node_modules/lodash/") ||
              id.includes("node_modules/date-fns/") ||
              id.includes("node_modules/utils") ||
              id.includes("node_modules/helpers")
            ) {
              return "vendor-utils";
            }
            return "vendor";
          }
        },
      },
    },
  },
});