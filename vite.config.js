import { defineConfig } from "vite";
import removeConsole from "vite-plugin-remove-console";

export default defineConfig({
  root: "client",
  publicDir: "public",
  build: {
    outDir: "../dist",
    emptyOutDir: true
  },
  plugins: [
    removeConsole()
  ]
});