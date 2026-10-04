import { beforeEach, describe, expect, it, vi } from "vitest";
import { evaluateInterviewSession } from "./report";
import type { EvaluateSessionPayload } from "@/types/report";

vi.mock("@/lib/ai/gemini-client", () => ({
    ai: {
        models: {
            generateContent: vi.fn(),
        },
    },
    DEFAULT_GEMINI_MODEL: "gemini-3.8-flash",
}));

import { ai } from "@/lib/ai/gemini-client";

describe("evaluateInterviewSession", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockPayload: EvaluateSessionPayload = {
        sessionId: "session-abc-123",
        persona: "friendly_hr",
        language: "vi",
        turns: [
            {
                questionIndex: 0,
                questionText: "Hãy giới thiệu bản thân?",
                category: "WARM_UP",
                candidateAnswer: "Liên hệ tôi qua 0987654321 hoặc test@gmail.com",
                interviewerFeedback: "Cảm ơn bạn đã giới thiệu.",
                answeredAt: "10:00:00",
            },
        ],
    };

    it("returns error when turns is empty", async () => {
        const result = await evaluateInterviewSession({
            ...mockPayload,
            turns: [],
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error).toContain("chưa có câu trả lời nào");
        }
    });

    it("masks PII in candidate answer and parses successful Gemini response", async () => {
        const mockGeminiReport = {
            overallScore: 85,
            situationScore: 8,
            taskScore: 9,
            actionScore: 8,
            resultScore: 9,
            summary: "Ứng viên thể hiện thái độ tự tin và câu trả lời súc tích.",
            strengths: ["Giao tiếp rõ ràng", "Tự tin"],
            weaknesses: ["Cần thêm số liệu định lượng"],
            questionFeedbacks: [
                {
                    questionIndex: 0,
                    questionText: "Hãy giới thiệu bản thân?",
                    category: "WARM_UP",
                    candidateAnswer: "Đã làm nhiều dự án.",
                    situationScore: 8,
                    taskScore: 9,
                    actionScore: 8,
                    resultScore: 9,
                    score: 85,
                    strengths: ["Ngắn gọn"],
                    weaknesses: ["Chưa nêu rõ mục tiêu"],
                    suggestedAnswer:
                        "Tôi là kỹ sư phần mềm với 2 năm kinh nghiệm tối ưu hóa hiệu năng web...",
                },
            ],
            sampleBetterAnswer: {
                questionIndex: 0,
                questionText: "Hãy giới thiệu bản thân?",
                goldStandardAnswer:
                    "Tôi là kỹ sư phần mềm với 2 năm kinh nghiệm...",
                keyTakeaway: "Tập trung vào giá trị mang lại cho dự án.",
            },
        };

        const generateContentMock = vi.mocked(ai.models.generateContent);
        generateContentMock.mockResolvedValueOnce({
            text: JSON.stringify(mockGeminiReport),
        } as unknown as Awaited<ReturnType<typeof ai.models.generateContent>>);

        const result = await evaluateInterviewSession(mockPayload);

        const calledArg = generateContentMock.mock.calls[0][0] as {
            contents?: Array<{ parts?: Array<{ text?: string }> }>;
        };
        const sentContent = calledArg.contents?.[0]?.parts?.[0]?.text ?? "";

        // Verify PII is masked before passing to Gemini
        expect(sentContent).toContain("[REDACTED_PHONE]");
        expect(sentContent).toContain("[REDACTED_EMAIL]");
        expect(sentContent).not.toContain("0987654321");
        expect(sentContent).not.toContain("test@gmail.com");

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.sessionId).toBe("session-abc-123");
            expect(result.data.overallScore).toBe(85);
            expect(result.data.situationScore).toBe(8);
            expect(result.data.questionFeedbacks).toHaveLength(1);
            expect(result.data.sampleBetterAnswer.questionIndex).toBe(0);
        }
    });

    it("handles invalid JSON from Gemini gracefully", async () => {
        const generateContentMock = vi.mocked(ai.models.generateContent);
        generateContentMock.mockResolvedValueOnce({
            text: "This is not JSON",
        } as unknown as Awaited<ReturnType<typeof ai.models.generateContent>>);

        const result = await evaluateInterviewSession(mockPayload);

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error).toContain("không thể trả về kết quả báo cáo đúng cấu trúc");
        }
    });
});
