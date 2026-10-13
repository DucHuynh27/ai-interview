import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mock Prisma Client & NextAuth ──────────────────────────────────────────
const {
    mockAuth,
    mockUserUpsert,
    mockSessionUpsert,
    mockSessionFindUnique,
    mockSessionUpdate,
    mockMessageCreate,
    mockFeedbackUpsert,
    mockTransaction,
} = vi.hoisted(() => ({
    mockAuth: vi.fn(),
    mockUserUpsert: vi.fn(),
    mockSessionUpsert: vi.fn(),
    mockSessionFindUnique: vi.fn(),
    mockSessionUpdate: vi.fn(),
    mockMessageCreate: vi.fn(),
    mockFeedbackUpsert: vi.fn(),
    mockTransaction: vi.fn(),
}));

vi.mock("@/auth", () => ({
    auth: mockAuth,
}));

vi.mock("@/lib/db/prisma", () => ({
    prisma: {
        user: { upsert: mockUserUpsert },
        interviewSession: {
            upsert: mockSessionUpsert,
            findUnique: mockSessionFindUnique,
            update: mockSessionUpdate,
        },
        message: { create: mockMessageCreate },
        feedbackReport: { upsert: mockFeedbackUpsert },
        $transaction: mockTransaction,
    },
}));

import type { InterviewEvaluationReport } from "@/types/report";
import {
    persistFeedbackReport,
    persistInterviewSession,
    persistMessage,
} from "./interview-repository";

describe("interview-repository", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("persistInterviewSession", () => {
        it("bỏ qua (unauthenticated) khi chưa đăng nhập", async () => {
            mockAuth.mockResolvedValueOnce(null);

            const result = await persistInterviewSession({
                sessionId: "s1",
                jobTitle: "Frontend Developer",
                jobDescription: "JD...",
                language: "vi",
                persona: "friendly_hr",
                extractedSkills: ["React"],
                identifiedGaps: ["Testing"],
            });

            expect(result).toEqual({ ok: false, reason: "unauthenticated" });
            expect(mockUserUpsert).not.toHaveBeenCalled();
            expect(mockSessionUpsert).not.toHaveBeenCalled();
        });

        it("upsert User rồi upsert Session khi đã đăng nhập", async () => {
            mockAuth.mockResolvedValueOnce({
                user: { email: "a@b.com", name: "A", image: null },
            });
            mockUserUpsert.mockResolvedValueOnce({ id: "user-1" });
            mockSessionUpsert.mockResolvedValueOnce({ id: "s1" });

            const result = await persistInterviewSession({
                sessionId: "s1",
                jobTitle: "Frontend Developer",
                jobDescription: "JD...",
                language: "vi",
                persona: "tech_lead",
                extractedSkills: ["React"],
                identifiedGaps: ["Testing"],
            });

            expect(result).toEqual({ ok: true, sessionId: "s1" });
            expect(mockUserUpsert).toHaveBeenCalledWith(
                expect.objectContaining({ where: { email: "a@b.com" } }),
            );
            expect(mockSessionUpsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: "s1" },
                    create: expect.objectContaining({
                        userId: "user-1",
                        persona: "TECH_LEAD",
                        language: "VI",
                        status: "IN_PROGRESS",
                    }),
                }),
            );
        });

        it("fail-soft: không ném lỗi khi DB lỗi ở bước lấy userId", async () => {
            mockAuth.mockResolvedValueOnce({
                user: { email: "a@b.com" },
            });
            mockUserUpsert.mockRejectedValueOnce(new Error("DB down"));

            // Lỗi DB ở ensureCurrentUserId được nuốt thành null -> coi như
            // không xác định được user, KHÔNG ném ra ngoài.
            const result = await persistInterviewSession({
                sessionId: "s1",
                jobTitle: "X",
                jobDescription: "Y",
                language: "vi",
                persona: "friendly_hr",
                extractedSkills: [],
                identifiedGaps: [],
            });

            expect(result.ok).toBe(false);
        });

        it("fail-soft: trả về db_error khi lỗi xảy ra ở bước upsert Session", async () => {
            mockAuth.mockResolvedValueOnce({
                user: { email: "a@b.com" },
            });
            mockUserUpsert.mockResolvedValueOnce({ id: "user-1" });
            mockSessionUpsert.mockRejectedValueOnce(new Error("DB down"));

            const result = await persistInterviewSession({
                sessionId: "s1",
                jobTitle: "X",
                jobDescription: "Y",
                language: "vi",
                persona: "friendly_hr",
                extractedSkills: [],
                identifiedGaps: [],
            });

            expect(result).toEqual({ ok: false, reason: "db_error" });
        });
    });

    describe("persistMessage", () => {
        it("bỏ qua khi session chưa tồn tại trong DB", async () => {
            mockSessionFindUnique.mockResolvedValueOnce(null);

            const result = await persistMessage({
                sessionId: "missing",
                role: "CANDIDATE",
                content: "Hello",
                orderIndex: 0,
            });

            expect(result).toEqual({ ok: false });
            expect(mockMessageCreate).not.toHaveBeenCalled();
        });

        it("tạo Message khi session tồn tại", async () => {
            mockSessionFindUnique.mockResolvedValueOnce({ id: "s1" });
            mockMessageCreate.mockResolvedValueOnce({ id: "m1" });

            const result = await persistMessage({
                sessionId: "s1",
                role: "INTERVIEWER",
                content: "Câu hỏi",
                orderIndex: 1,
            });

            expect(result).toEqual({ ok: true });
            expect(mockMessageCreate).toHaveBeenCalledWith({
                data: {
                    sessionId: "s1",
                    role: "INTERVIEWER",
                    content: "Câu hỏi",
                    orderIndex: 1,
                    durationSec: null,
                },
            });
        });
    });

    describe("persistFeedbackReport", () => {
        const report: InterviewEvaluationReport = {
            sessionId: "s1",
            overallScore: 82,
            situationScore: 8,
            taskScore: 8,
            actionScore: 9,
            resultScore: 7,
            summary: "Tổng quan đánh giá chi tiết về ứng viên.",
            strengths: ["Điểm mạnh A"],
            weaknesses: ["Điểm yếu B"],
            questionFeedbacks: [],
            sampleBetterAnswer: {
                questionIndex: 1,
                questionText: "Câu hỏi mẫu đủ dài để hợp lệ.",
                goldStandardAnswer: "Câu trả lời mẫu rất chi tiết và đầy đủ.",
                keyTakeaway: "Bài học cốt lõi.",
            },
            evaluatedAt: new Date().toISOString(),
        };

        it("bỏ qua khi session chưa tồn tại", async () => {
            mockSessionFindUnique.mockResolvedValueOnce(null);

            const result = await persistFeedbackReport(report);

            expect(result).toEqual({ ok: false });
            expect(mockTransaction).not.toHaveBeenCalled();
        });

        it("lưu report + cập nhật status COMPLETED trong một transaction", async () => {
            mockSessionFindUnique.mockResolvedValueOnce({ id: "s1" });
            mockFeedbackUpsert.mockReturnValueOnce({ op: "feedback" });
            mockSessionUpdate.mockReturnValueOnce({ op: "session" });
            mockTransaction.mockResolvedValueOnce([{}, {}]);

            const result = await persistFeedbackReport(report);

            expect(result).toEqual({ ok: true });
            expect(mockTransaction).toHaveBeenCalledTimes(1);
            expect(mockSessionUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: "s1" },
                    data: expect.objectContaining({ status: "COMPLETED" }),
                }),
            );
        });
    });
});
