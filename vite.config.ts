import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 8080,
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: resolve(projectRoot, "index.html"),
        dorinha: resolve(projectRoot, "autora/dorinha-barroso/index.html"),
        dorinhaShort: resolve(projectRoot, "dorinha-barroso/index.html"),
      },
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/node_modules\/(react|react-dom|react-router|react-router-dom)\//.test(id)) return "react-vendor";
          if (id.includes("node_modules/@supabase/")) return "supabase-vendor";
          if (id.includes("node_modules/lucide-react/")) return "icons-vendor";
          if (/node_modules\/(jspdf|jspdf-autotable|html2canvas|canvg)\//.test(id)) return "pdf-vendor";
        },
      },
    },
  },
  test: {
    // Os testes ponta a ponta rodam no Playwright, não no Vitest.
    exclude: ["**/node_modules/**", "**/dist/**", "src/tests/e2e/**"],
  },
});
