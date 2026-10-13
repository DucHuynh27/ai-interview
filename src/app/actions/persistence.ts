"use server";

import {
    persistFeedbackReport,
    persistInterviewSession,
    persistMessage,
    type PersistSessionInput,
} from "@/lib/db/interview-repository";
import type { InterviewEvaluationReport } from "@/types/report";

// ─────────────────────────────────────────────────────────────────────────────
// Server Actions bọc lớp persistence (Task 5.2).
//
// Mọi action đều fail-soft: trả về { ok: false } thay vì ném lỗi, để phía
// client gọi "fire-and-forget" mà không ảnh hưởng tới luồng phỏng vấn.
// ─────────────────────────────────────────────────────────────────────────────

export async function saveInterviewSessionAction(
    input: PersistSessionInput,
): Promise<{ ok: boolean }> {
    const result = await persistInterviewSession(input);
    return { ok: result.ok };
}

export async function saveMessageAction(input: {
    sessionId: string;
    role: "INTERVIEWER" | "CANDIDATE";
    content: string;
    orderIndex: number;
    durationSec?: number;
}): Promise<{ ok: boolean }> {
    return persistMessage(input);
}

export async function saveFeedbackReportAction(
    report: InterviewEvaluationReport,
): Promise<{ ok: boolean }> {
    return persistFeedbackReport(report);
}
