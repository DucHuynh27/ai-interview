import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    generateInterviewQuestions,
    submitCandidateAnswerTurn,
} from "./interview";

vi.mock("@/lib/ai/gemini-client", () => ({
    ai: {
        models: {
            generateContent: vi.fn(),
        },
    },
    DEFAULT_GEMINI_MODEL: "gemini-3.8-flash",
}));

import { ai, DEFAULT_GEMINI_MODEL } from "@/lib/ai/gemini-client";

describe("interview actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("generateInterviewQuestions", () => {
        it("calls gemini using DEFAULT_GEMINI_MODEL and parses valid plan", async () => {
            const mockQuestions = {
                summary: {
                    extractedSkills: ["React", "TypeScript"],
                    identifiedGaps: ["Next.js internals"],
                },
                questions: [
                    {
                        order: 1,
                        category: "WARM_UP",
                        questionVi: "Giới thiệu bản thân và kinh nghiệm của bạn?",
                        questionEn: "Please introduce yourself and your background?",
                        targetGoal: "Đánh giá khả năng giới thiệu tổng quan",
                    },
                    {
                        order: 2,
                        category: "ROLE_SPECIFIC",
                        questionVi: "Bạn xử lý state management như thế nào trong React?",
                        questionEn: "How do you manage state in React applications?",
                        targetGoal: "Đánh giá hiểu biết về frontend state",
                    },
                    {
                        order: 3,
                        category: "BEHAVIORAL_STAR",
                        questionVi: "Hãy kể về một lần bạn đối mặt với deadline gấp?",
                        questionEn: "Tell me about a time you handled a tight deadline?",
                        targetGoal: "Kỹ năng quản lý thời gian và áp lực",
                    },
                    {
                        order: 4,
                        category: "SITUATIONAL",
                        questionVi: "Nếu production gặp sự cố nghiêm trọng, bạn làm gì?",
                        questionEn: "What would you do if production went down?",
                        targetGoal: "Khả năng ứng phó sự cố",
                    },
                    {
                        order: 5,
                        category: "BEHAVIORAL_STAR",
                        questionVi: "Bạn có câu hỏi nào muốn hỏi nhà tuyển dụng không?",
                        questionEn: "Do you have any questions for our engineering team?",
                        targetGoal: "Độ quan tâm đến công ty",
                    },
                ],
            };

            const generateContentMock = vi.mocked(ai.models.generateContent);
            generateContentMock.mockResolvedValueOnce({
                text: JSON.stringify(mockQuestions),
            } as unknown as Awaited<ReturnType<typeof ai.models.generateContent>>);

            const dummyPdfBuffer = new ArrayBuffer(8);
            const result = await generateInterviewQuestions(
                dummyPdfBuffer,
                "Tuyển dụng Frontend Developer biết React và Next.js",
                "vi",
                "friendly_hr",
            );

            expect(result.ok).toBe(true);
            expect(generateContentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: DEFAULT_GEMINI_MODEL,
                }),
            );
            if (result.ok) {
                expect(result.data.questions).toHaveLength(5);
            }
        });
    });

    describe("submitCandidateAnswerTurn", () => {
        it("calls gemini using DEFAULT_GEMINI_MODEL and returns turn feedback", async () => {
            const mockFeedback = {
                acknowledgment: "Cảm ơn bạn đã chia sẻ về kinh nghiệm thực tế.",
                transition: "Bây giờ chúng ta sẽ đến câu hỏi tiếp theo.",
            };

            const generateContentMock = vi.mocked(ai.models.generateContent);
            generateContentMock.mockResolvedValueOnce({
                text: JSON.stringify(mockFeedback),
            } as unknown as Awaited<ReturnType<typeof ai.models.generateContent>>);

            const result = await submitCandidateAnswerTurn({
                sessionId: "test-session-123",
                questionIndex: 0,
                persona: "friendly_hr",
                language: "vi",
                questionText: "Hãy kể về một dự án gần đây của bạn?",
                category: "ROLE_SPECIFIC",
                targetGoal: "Kinh nghiệm thực chiến",
                candidateAnswer: "Tôi từng làm dự án Web thương mại điện tử với Next.js",
                isFinalQuestion: false,
            });

            expect(result.ok).toBe(true);
            expect(generateContentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: DEFAULT_GEMINI_MODEL,
                }),
            );
            if (result.ok) {
                expect(result.data.acknowledgment).toBe(mockFeedback.acknowledgment);
            }
        });
    });
});
