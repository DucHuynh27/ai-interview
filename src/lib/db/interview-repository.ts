import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { toPrismaLanguage, toPrismaPersona } from "@/lib/db/mappers";
import type { Prisma } from "@/generated/prisma/client";
import type { LanguageCode, PersonaType } from "@/types/interview";
import type {
  InterviewEvaluationReport,
  EvaluateSessionPayload,
} from "@/types/report";

/**
 * Prisma bắt buộc giá trị Json phải là `InputJsonValue`. Các domain type của
 * ta là interface cụ thể, không tự thoả index signature của Json, nên phải
 * qua JSON round-trip để có giá trị plain JSON.
 */
function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lớp data-access cho các phiên phỏng vấn (Task 5.2).
//
// Nguyên tắc thiết kế:
//  - FAIL-SOFT: mọi hàm bọc trong try/catch. Nếu DB chưa cấu hình hoặc query
//    lỗi, ta chỉ log cảnh báo và trả về thất bại — KHÔNG BAO GIỜ ném lỗi, để
//    luồng phỏng vấn chính (dựa trên sessionStorage) không bao giờ sập.
//  - CHỈ LƯU KHI ĐÃ ĐĂNG NHẬP: khách ẩn danh không được persist, vì
//    InterviewSession.userId là bắt buộc và gắn với bảng User.
// ─────────────────────────────────────────────────────────────────────────────

export type PersistResult =
  | { ok: true; sessionId: string }
  | { ok: false; reason: "unauthenticated" | "db_error" };

/**
 * Ánh xạ user hiện tại (từ NextAuth session) sang id nội bộ trong bảng User,
 * tạo row nếu chưa có. Trả về null khi chưa đăng nhập hoặc lỗi DB.
 *
 * Dùng upsert vì user Google có thể đăng nhập lần đầu mà chưa có row trong DB.
 */
async function ensureCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return null;
    }

    const user = await prisma.user.upsert({
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
      select: { id: true },
    });

    return user.id;
  } catch (err) {
    console.warn("[interview-repository] Không lấy được userId:", err);
    return null;
  }
}

export interface PersistSessionInput {
  sessionId: string;
  jobTitle: string;
  jobDescription: string;
  language: LanguageCode;
  persona: PersonaType;
  extractedSkills: string[];
  identifiedGaps: string[];
}

/**
 * Persist (tạo hoặc cập nhật) một InterviewSession sau khi AI sinh xong bộ
 * câu hỏi. Khách (chưa đăng nhập) bị bỏ qua im lặng.
 */
export async function persistInterviewSession(
  input: PersistSessionInput,
): Promise<PersistResult> {
  try {
    const userId = await ensureCurrentUserId();
    if (!userId) {
      return { ok: false, reason: "unauthenticated" };
    }

    await prisma.interviewSession.upsert({
      where: { id: input.sessionId },
      update: {
        jobTitle: input.jobTitle,
        jobDescription: input.jobDescription,
        language: toPrismaLanguage(input.language),
        persona: toPrismaPersona(input.persona),
        extractedSkills: toJson(input.extractedSkills),
        identifiedGaps: toJson(input.identifiedGaps),
        status: "IN_PROGRESS",
      },
      create: {
        id: input.sessionId,
        userId,
        jobTitle: input.jobTitle,
        jobDescription: input.jobDescription,
        language: toPrismaLanguage(input.language),
        persona: toPrismaPersona(input.persona),
        extractedSkills: toJson(input.extractedSkills),
        identifiedGaps: toJson(input.identifiedGaps),
        status: "IN_PROGRESS",
      },
    });

    return { ok: true, sessionId: input.sessionId };
  } catch (err) {
    console.warn("[interview-repository] Lỗi lưu session:", err);
    return { ok: false, reason: "db_error" };
  }
}

export interface PersistMessageInput {
  sessionId: string;
  role: "INTERVIEWER" | "CANDIDATE";
  content: string;
  orderIndex: number;
  durationSec?: number;
}

/**
 * Persist một lượt hội thoại (Message). Bỏ qua khi session không tồn tại
 * trong DB (khách, hoặc session chưa từng được persist).
 */
export async function persistMessage(
  input: PersistMessageInput,
): Promise<{ ok: boolean }> {
  try {
    const exists = await prisma.interviewSession.findUnique({
      where: { id: input.sessionId },
      select: { id: true },
    });
    if (!exists) {
      return { ok: false };
    }

    await prisma.message.create({
      data: {
        sessionId: input.sessionId,
        role: input.role,
        content: input.content,
        orderIndex: input.orderIndex,
        durationSec: input.durationSec ?? null,
      },
    });

    return { ok: true };
  } catch (err) {
    console.warn("[interview-repository] Lỗi lưu message:", err);
    return { ok: false };
  }
}

/**
 * Persist báo cáo đánh giá cuối cùng (FeedbackReport) và đánh dấu session
 * đã hoàn tất.
 */
export async function persistFeedbackReport(
  report: InterviewEvaluationReport,
  meta?: Pick<EvaluateSessionPayload, "persona" | "language">,
): Promise<{ ok: boolean }> {
  try {
    const exists = await prisma.interviewSession.findUnique({
      where: { id: report.sessionId },
      select: { id: true },
    });
    if (!exists) {
      return { ok: false };
    }

    await prisma.$transaction([
      prisma.feedbackReport.upsert({
        where: { sessionId: report.sessionId },
        update: {
          overallScore: report.overallScore,
          situationScore: report.situationScore,
          taskScore: report.taskScore,
          actionScore: report.actionScore,
          resultScore: report.resultScore,
          strengths: toJson(report.strengths),
          weaknesses: toJson(report.weaknesses),
          questionFeedbacks: toJson(report.questionFeedbacks),
          sampleBetterAnswer: toJson(report.sampleBetterAnswer),
        },
        create: {
          sessionId: report.sessionId,
          overallScore: report.overallScore,
          situationScore: report.situationScore,
          taskScore: report.taskScore,
          actionScore: report.actionScore,
          resultScore: report.resultScore,
          strengths: toJson(report.strengths),
          weaknesses: toJson(report.weaknesses),
          questionFeedbacks: toJson(report.questionFeedbacks),
          sampleBetterAnswer: toJson(report.sampleBetterAnswer),
        },
      }),
      prisma.interviewSession.update({
        where: { id: report.sessionId },
        data: {
          status: "COMPLETED",
          ...(meta?.persona ? { persona: toPrismaPersona(meta.persona) } : {}),
          ...(meta?.language
            ? { language: toPrismaLanguage(meta.language) }
            : {}),
        },
      }),
    ]);

    return { ok: true };
  } catch (err) {
    console.warn("[interview-repository] Lỗi lưu feedback report:", err);
    return { ok: false };
  }
}
