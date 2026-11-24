import type { LanguageCode, PersonaType } from "@/types/interview";
import type { StarScores } from "@/types/report";

/** Một buổi phỏng vấn trong lịch sử của người dùng hiện tại (Task 5.3). */
export interface InterviewHistoryEntry {
    sessionId: string;
    jobTitle: string;
    persona: PersonaType;
    language: LanguageCode;
    /** true khi buổi phỏng vấn đã có báo cáo chấm điểm STAR. */
    isCompleted: boolean;
    createdAt: string;
    overallScore: number | null;
    starScores: StarScores | null;
}
