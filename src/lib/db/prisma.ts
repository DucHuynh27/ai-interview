import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Singleton Prisma Client.
// Prisma ORM 7 yêu cầu truyền connection qua driver adapter (PrismaPg),
// vì thuộc tính `url` trong schema không còn được hỗ trợ.
// Trong môi trường dev, Next.js hot-reload tạo lại module liên tục, dẫn tới
// việc khởi tạo nhiều kết nối Database. Ta cache instance trên `globalThis`
// để tránh rò rỉ connection. Ở production chỉ tạo một lần duy nhất.
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Supabase ↔ Vercel integration KHÔNG tạo biến tên `DATABASE_URL`, mà inject
// `POSTGRES_PRISMA_URL` (pooled, dành cho Prisma) và `POSTGRES_URL`. Chấp nhận
// cả ba tên để chạy được ở mọi môi trường mà không phải khai báo trùng.
function resolveConnectionString(): string | undefined {
    return (
        process.env.DATABASE_URL ??
        process.env.POSTGRES_PRISMA_URL ??
        process.env.POSTGRES_URL
    );
}

function createPrismaClient(): PrismaClient {
    const connectionString = resolveConnectionString();

    if (!connectionString) {
        throw new Error(
            "Thiếu biến môi trường DATABASE_URL (hoặc POSTGRES_PRISMA_URL / POSTGRES_URL). Vui lòng cấu hình chuỗi kết nối PostgreSQL (Supabase) trong .env.local.",
        );
    }

    const adapter = new PrismaPg({ connectionString });

    return new PrismaClient({
        adapter,
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "warn", "error"]
                : ["error"],
    });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
