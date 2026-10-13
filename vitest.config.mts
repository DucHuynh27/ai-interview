import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        exclude: [
            "**/node_modules/**",
            "**/.direnv/**",
            "**/dist/**",
        ],
        server: {
            deps: {
                inline: ["next-auth"],
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "next/server": "next/server.js",
        },
    },
});
