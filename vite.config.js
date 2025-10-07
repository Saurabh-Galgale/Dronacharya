import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // local dev settings
  server: {
    port: 3000,
    open: true, // auto-opens in browser
    host: true,
    // 👇 This ensures your SPA routes (like /app/dashboard) don't 404 in dev
    historyApiFallback: true,
  },

  // build output directory for Vercel (default: dist)
  build: {
    outDir: "dist",
    sourcemap: false,
  },

  // 👇 Ensure proper base path handling on Vercel
  base: "/",
});
