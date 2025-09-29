// import path from "path"
// import tailwindcss from "@tailwindcss/vite"
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// })
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: "stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react/") ||
              id.includes("react-dom/") ||
              id.includes("scheduler/") ||
              id.includes("react-refresh")
            ) {
              return "vendor-react";
            }
            if (
              id.includes("framer-motion") ||
              id.includes("motion-dom") ||
              id.includes("animation") ||
              id.includes("gestures") ||
              id.includes("drag") ||
              id.includes("pan") ||
              id.includes("projection")
            ) {
              return "vendor-animation";
            }
            if (id.includes("axios")) {
              return "vendor-axios";
            }
            if (
              id.includes("lodash/") ||
              id.includes("date-fns/") ||
              id.includes("utils") ||
              id.includes("helpers")
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


