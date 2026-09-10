import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import packageJson from './package.json'

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
  },
  plugins: [react(), tailwindcss(),
    VitePWA({
      // registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,webp}'],
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'Campus Hub University App', // Your app's full name
        short_name: 'Campus Hub',    // Short name for home screen
        description: 'Track assignments, upcoming classes and upcoming school events.',
        theme_color: '#0a2df0ff',      // Primary color of your app (yellow from your form)
        background_color: '#FFFFFF', // Background color for splash screen
        display: 'standalone',       // How the app should be displayed (standalone, fullscreen, minimal-ui, browser)
        scope: '/',                  // Scope of your PWA
        start_url: '/',              // Starting URL when launched from home screen
        icons: [
          {
            "purpose": "maskable",
            "sizes": "192x192",
            "src": "/icons/maskable_icon_x192.png",
            "type": "image/png"
          },
          {
            "purpose": "maskable",
            "sizes": "512x512",
            "src": "/icons/maskable_icon_x512.png",
            "type": "image/png"
          },{
            "src": "/icons/maskable_icon_x192.png", // Re-use the same file
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any" // Explicitly set purpose to "any"
          },
          {
            "src": "/icons/maskable_icon_x512.png", // Re-use the same file
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any" // Explicitly set purpose to "any"
          }
        ]
      },
    }),
  ],
  build: {
    minify: 'terser', // Ensure terser is used for minification
    terserOptions: {
      compress: {
        drop_console: true, // This option removes console.log, console.warn, console.error
        drop_debugger: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})