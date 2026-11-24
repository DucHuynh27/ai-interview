import { prisma } from "@/lib/db/prisma";
import { ensureCurrentUser } from "@/lib/db/current-user";
import { fromPrismaLanguage, fromPrismaPersona } from "@/lib/db/mappers";
import type { InterviewHistoryEntry } from "@/types/dashboard";

// ─────────────────────────────────────────────────────────────────────────────
// Đọc lịch sử phỏng vấn cho Dashboard cá nhân (Task 5.3).
//
// Khác tầng ghi dữ liệu (fail-soft), đây là màn hình chỉ để xem: lỗi DB được
// báo về để trang hiển thị trạng thái lỗi thay vì im lặng hiện danh sách rỗng.
// ─────────────────────────────────────────────────────────────────────────────

export type InterviewHistoryResult =
  | { ok: true; entries: InterviewHistoryEntry[] }
  | { ok: false; reason: "unauthenticated" | "db_error" };

export async function listCurrentUserInterviewHistory(): Promise<InterviewHistoryResult> {
  const currentUser = await ensureCurrentUser();
  if (!currentUser) {
    return { ok: false, reason: "unauthenticated" };
  }

  try {
    const sessions = await prisma.interviewSession.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        jobTitle: true,
        persona: true,
        language: true,
        status: true,
        createdAt: true,
        feedbackReport: {
          select: {
            overallScore: true,
            situationScore: true,
            taskScore: true,
            actionScore: true,
            resultScore: true,
          },
        },
      },
    });

    return {
      ok: true,
      entries: sessions.map((session) => ({
        sessionId: session.id,
        jobTitle: session.jobTitle,
        persona: fromPrismaPersona(session.persona),
        language: fromPrismaLanguage(session.language),
        isCompleted: session.status === "COMPLETED",
        createdAt: session.createdAt.toISOString(),
        overallScore: session.feedbackReport?.overallScore ?? null,
        starScores: session.feedbackReport
          ? {
                situation: session.feedbackReport.situationScore,
                task: session.feedbackReport.taskScore,
                action: session.feedbackReport.actionScore,
                result: session.feedbackReport.resultScore,
            }
          : null,
      })),
    };
  } catch (err) {
    console.warn("[interview-history] Không đọc được lịch sử phỏng vấn:", err);
    return { ok: false, reason: "db_error" };
  }
}
