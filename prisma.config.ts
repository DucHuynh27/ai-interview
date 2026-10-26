import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Cấu hình Prisma CLI (Prisma ORM 7).
// - Đọc biến môi trường từ .env / .env.local thông qua `dotenv/config`.
// - Dùng `process.env.DATABASE_URL` trực tiếp (không dùng helper `env()`)
//   để các lệnh như `prisma generate` vẫn chạy được khi chưa cấu hình DB
//   (ví dụ trong CI chỉ cần type-check).
export default defineConfig({
    schema: path.join("prisma", "schema.prisma"),
    migrations: {
        path: path.join("prisma", "migrations"),
    },
    datasource: {
        // Ưu tiên URL direct (dành cho migrate/db push — pgbouncer không hỗ trợ
        // DDL/session). `POSTGRES_URL_NON_POOLING` là tên biến Supabase ↔ Vercel
        // inject cho kết nối trực tiếp; nếu không có mới rơi về URL pooled.
        url:
            process.env.POSTGRES_URL_NON_POOLING ??
            process.env.DATABASE_URL ??
            process.env.POSTGRES_PRISMA_URL ??
            process.env.POSTGRES_URL ??
            "",
    },
});
