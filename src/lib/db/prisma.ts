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

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error(
            "Thiếu biến môi trường DATABASE_URL. Vui lòng cấu hình chuỗi kết nối PostgreSQL (Supabase) trong .env.local.",
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
