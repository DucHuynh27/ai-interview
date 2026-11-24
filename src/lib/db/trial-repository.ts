import { prisma } from "@/lib/db/prisma";
import { ensureCurrentUser } from "@/lib/db/current-user";
import { toPrismaTrialStatus } from "@/lib/db/mappers";
import {
  FREE_TRIAL_SESSION_LIMIT,
  type TrialAccess,
  type TrialRegistrationInput,
} from "@/types/trial";

// ─────────────────────────────────────────────────────────────────────────────
// Quota dùng thử (Task 5.5).
//
// Khác với tầng persistence của phiên phỏng vấn, đây KHÔNG phải đường fail-soft:
// quota là ranh giới giữa bản miễn phí và bản trả phí, nên khi DB lỗi ta báo
// thất bại (chặn truy cập) thay vì lặng lẽ cho qua.
// ─────────────────────────────────────────────────────────────────────────────

export type SubmitTrialResult =
  | { ok: true }
  | { ok: false; reason: "duplicate_email" | "db_error" };

export type ConsumeTrialResult =
  | { ok: true; freeSessionsLeft: number }
  | {
      ok: false;
      reason:
        | "unauthenticated"
        | "no_registration"
        | "exhausted"
        | "db_error";
    };

function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2002"
  );
}

/**
 * Ghi đăng ký dùng thử ở trạng thái PENDING. Việc kích hoạt quota diễn ra sau
 * khi người dùng đăng nhập Google bằng đúng email đã đăng ký.
 */
export async function submitTrialRegistration(
  input: TrialRegistrationInput,
): Promise<SubmitTrialResult> {
  try {
    await prisma.trialRegistration.create({
      data: {
        ...input,
        freeSessionsLeft: FREE_TRIAL_SESSION_LIMIT,
        status: toPrismaTrialStatus("pending"),
      },
    });

    return { ok: true };
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { ok: false, reason: "duplicate_email" };
    }
    console.warn("[trial-repository] Lỗi lưu đăng ký dùng thử:", err);
    return { ok: false, reason: "db_error" };
  }
}

/**
 * Trạng thái truy cập của người dùng hiện tại, đồng thời là nơi kích hoạt đăng
 * ký PENDING khi email Google khớp email đã đăng ký. Hàm idempotent nên gọi
 * được ở mọi lần render trang.
 */
export async function resolveTrialAccess(): Promise<TrialAccess> {
  const currentUser = await ensureCurrentUser();
  if (!currentUser) {
    return { state: "guest" };
  }

  try {
    const registration = await prisma.trialRegistration.findUnique({
      where: { email: currentUser.email },
      select: { id: true, freeSessionsLeft: true, userId: true },
    });

    if (!registration) {
      return { state: "unregistered" };
    }

    const activated =
      registration.userId === currentUser.id
        ? registration
        : await prisma.trialRegistration.update({
            where: { id: registration.id },
            data: {
              userId: currentUser.id,
              status: toPrismaTrialStatus("active"),
            },
            select: { freeSessionsLeft: true },
          });

    return activated.freeSessionsLeft > 0
      ? { state: "active", freeSessionsLeft: activated.freeSessionsLeft }
      : { state: "exhausted" };
  } catch (err) {
    console.warn("[trial-repository] Không xác minh được quota dùng thử:", err);
    return { state: "unavailable" };
  }
}

/**
 * Trừ một lượt của người dùng hiện tại. Phép trừ là nguồn tin cậy duy nhất về
 * số lượt còn lại — phía client không được tự quyết định.
 */
export async function consumeTrialQuota(): Promise<ConsumeTrialResult> {
  const currentUser = await ensureCurrentUser();
  if (!currentUser) {
    return { ok: false, reason: "unauthenticated" };
  }

  try {
    const registration = await prisma.trialRegistration.findUnique({
      where: { email: currentUser.email },
      select: { id: true, freeSessionsLeft: true, userId: true },
    });

    if (!registration || registration.userId !== currentUser.id) {
      return { ok: false, reason: "no_registration" };
    }

    const freeSessionsLeft = registration.freeSessionsLeft - 1;

    // Điều kiện `gt: 0` nằm ngay trong WHERE để phép trừ là thao tác nguyên tử:
    // hai request song song không thể cùng tiêu lượt cuối.
    const updated = await prisma.trialRegistration.updateMany({
      where: { id: registration.id, freeSessionsLeft: { gt: 0 } },
      data: {
        freeSessionsLeft: { decrement: 1 },
        ...(freeSessionsLeft <= 0
          ? { status: toPrismaTrialStatus("exhausted") }
          : {}),
      },
    });

    if (updated.count === 0) {
      return { ok: false, reason: "exhausted" };
    }

    return { ok: true, freeSessionsLeft: Math.max(freeSessionsLeft, 0) };
  } catch (err) {
    console.warn("[trial-repository] Lỗi trừ lượt dùng thử:", err);
    return { ok: false, reason: "db_error" };
  }
}
