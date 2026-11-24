import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            // Client chặn CV ở 3MB; để 4mb cho phần JD + metadata, vẫn nằm dưới
            // trần request body ~4.5MB của Vercel.
            bodySizeLimit: "4mb",
            allowedOrigins: [
                "aiinterview.id.vn",
                "www.aiinterview.id.vn",
                "localhost:3000",
            ],
        },
    },
};

export default nextConfig;
