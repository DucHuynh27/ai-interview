import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    generateInterviewQuestions,
    submitCandidateAnswerTurn,
} from "./interview";

const { mockGenerateContent } = vi.hoisted(() => ({
    mockGenerateContent: vi.fn(),
}));

vi.mock("@/lib/ai/gemini-client", () => ({
    ai: {
        models: {
            generateContent: mockGenerateContent,
        },
    },
    DEFAULT_GEMINI_MODEL: "gemini-3.8-flash",
    generateContentWithFallback: (args: unknown) => mockGenerateContent(args),
}));

const { mockResolveTrialAccess, mockConsumeTrialQuota } = vi.hoisted(() => ({
    mockResolveTrialAccess: vi.fn(),
    mockConsumeTrialQuota: vi.fn(),
}));

vi.mock("@/lib/db/trial-repository", () => ({
    resolveTrialAccess: mockResolveTrialAccess,
    consumeTrialQuota: mockConsumeTrialQuota,
}));

import { ai, DEFAULT_GEMINI_MODEL } from "@/lib/ai/gemini-client";

function buildMockQuestions(count: number) {
    return {
        summary: {
            extractedSkills: ["React"],
            identifiedGaps: ["Next.js internals"],
        },
        questions: Array.from({ length: count }, (_, index) => ({
            order: index + 1,
            category: index % 2 === 0 ? "WARM_UP" : "BEHAVIORAL_STAR",
            questionVi: `Câu hỏi số ${index + 1} đủ dài để vượt qua validator?`,
            questionEn: `Is question number ${index + 1} long enough for the validator?`,
            targetGoal: "Mục tiêu đánh giá đủ dài cho validator",
        })),
    };
}

describe("interview actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mặc định coi như khách ẩn danh: không bị áp quota dùng thử.
        mockResolveTrialAccess.mockResolvedValue({ state: "guest" });
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

        it("chặn và không gọi AI khi tài khoản chưa đăng ký dùng thử", async () => {
            mockResolveTrialAccess.mockResolvedValueOnce({
                state: "unregistered",
            });

            const result = await generateInterviewQuestions(
                new ArrayBuffer(8),
                "Tuyển dụng Frontend Developer biết React và Next.js",
                "vi",
                "friendly_hr",
            );

            expect(result.ok).toBe(false);
            expect(mockGenerateContent).not.toHaveBeenCalled();
        });

        it("chặn khi đã dùng hết lượt miễn phí", async () => {
            mockResolveTrialAccess.mockResolvedValueOnce({
                state: "exhausted",
            });

            const result = await generateInterviewQuestions(
                new ArrayBuffer(8),
                "Tuyển dụng Frontend Developer biết React và Next.js",
                "vi",
                "friendly_hr",
            );

            expect(result.ok).toBe(false);
            expect(mockGenerateContent).not.toHaveBeenCalled();
        });

        it("trừ một lượt và trả về số lượt còn lại cho tài khoản đang có quota", async () => {
            mockResolveTrialAccess.mockResolvedValueOnce({
                state: "active",
                freeSessionsLeft: 3,
            });
            mockConsumeTrialQuota.mockResolvedValueOnce({
                ok: true,
                freeSessionsLeft: 2,
            });
            vi.mocked(ai.models.generateContent).mockResolvedValueOnce({
                text: JSON.stringify(buildMockQuestions(5)),
            } as unknown as Awaited<ReturnType<typeof ai.models.generateContent>>);

            const result = await generateInterviewQuestions(
                new ArrayBuffer(8),
                "Tuyển dụng Frontend Developer biết React và Next.js",
                "vi",
                "friendly_hr",
            );

            expect(mockConsumeTrialQuota).toHaveBeenCalledTimes(1);
            expect(result).toMatchObject({
                ok: true,
                remainingFreeSessions: 2,
            });
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
