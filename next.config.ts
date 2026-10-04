import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "6mb",
            allowedOrigins: [
                "aiinterview.id.vn",
                "www.aiinterview.id.vn",
                "localhost:3000",
            ],
        },
    },
};

export default nextConfig;
