
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
    plugins: [tailwindcss()],

    publicDir: "public",

    build: {
        outDir: "dist",
        emptyOutDir: true,
        manifest: true,
        rollupOptions: {
            input: resolve(rootDir, "index.html"),
        },
    },

    server: {
        host: "localhost",
        port: 5173,
        strictPort: true,

        proxy: {
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
