import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

/**
 * Ánh xạ phiên NextAuth sang row `User` trong DB, tạo mới nếu đây là lần đăng
 * nhập đầu tiên. Trả về null khi chưa đăng nhập hoặc không truy cập được DB.
 */
export async function ensureCurrentUser(): Promise<{
  id: string;
  email: string;
} | null> {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return null;
    }

    return await prisma.user.upsert({
      where: { email },
      update: {
        name: session.user?.name ?? undefined,
        avatarUrl: session.user?.image ?? undefined,
      },
      create: {
        email,
        name: session.user?.name ?? undefined,
        avatarUrl: session.user?.image ?? undefined,
      },
      select: { id: true, email: true },
    });
  } catch (err) {
    console.warn("[current-user] Không lấy được user hiện tại:", err);
    return null;
  }
}
