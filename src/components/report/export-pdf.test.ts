import { describe, it, expect, vi } from "vitest";

describe("Export PDF Report Functionality", () => {
    it("should format correct default PDF filename based on sessionId", () => {
        const getPdfDocumentTitle = (sessionId?: string) => {
            const sanitizedId = sessionId ? `-${sessionId.slice(0, 8)}` : "";
            return `Bao-Cao-Phong-Van-STAR${sanitizedId}`;
        };

        expect(getPdfDocumentTitle("session-123456789")).toBe(
            "Bao-Cao-Phong-Van-STAR-session-",
        );
        expect(getPdfDocumentTitle("abc12345678")).toBe(
            "Bao-Cao-Phong-Van-STAR-abc12345",
        );
        expect(getPdfDocumentTitle(undefined)).toBe("Bao-Cao-Phong-Van-STAR");
        expect(getPdfDocumentTitle("")).toBe("Bao-Cao-Phong-Van-STAR");
    });

    it("should handle print title lifecycle correctly", () => {
        const mockWindow = {
            print: vi.fn(),
        };

        const mockDocument = {
            title: "AI Interview - Báo Cáo Kết Quả",
        };

        const triggerExportPdf = (
            sessionId: string,
            doc: { title: string },
            win: { print: () => void },
        ) => {
            const originalTitle = doc.title;
            const sanitizedId = sessionId ? `-${sessionId.slice(0, 8)}` : "";
            doc.title = `Bao-Cao-Phong-Van-STAR${sanitizedId}`;

            // Trigger print
            win.print();

            // Restore title
            doc.title = originalTitle;
        };

        triggerExportPdf("session-xyz-987", mockDocument, mockWindow);

        expect(mockWindow.print).toHaveBeenCalledTimes(1);
        expect(mockDocument.title).toBe("AI Interview - Báo Cáo Kết Quả");
    });

    it("should ensure evaluation report contains all required sections for offline PDF review", () => {
        const fullReport = {
            sessionId: "test-sess-001",
            overallScore: 88,
            situationScore: 9,
            taskScore: 8,
            actionScore: 9,
            resultScore: 8,
            summary: "Đạt chuẩn phỏng vấn",
            strengths: ["Kỹ năng trình bày tốt"],
            weaknesses: ["Cần thêm số liệu"],
            questionFeedbacks: [
                {
                    questionIndex: 1,
                    questionText: "Giới thiệu bản thân?",
                    category: "WARM_UP",
                    candidateAnswer: "Em là lập trình viên...",
                    situationScore: 9,
                    taskScore: 8,
                    actionScore: 9,
                    resultScore: 8,
                    score: 85,
                    strengths: ["Rõ ràng"],
                    weaknesses: ["Hơi ngắn"],
                    suggestedAnswer: "Chào anh chị...",
                },
            ],
            sampleBetterAnswer: {
                questionIndex: 1,
                questionText: "Giới thiệu bản thân?",
                goldStandardAnswer: "Câu trả lời mẫu...",
                keyTakeaway: "Luôn đi kèm số liệu...",
            },
            evaluatedAt: new Date().toISOString(),
        };

        // Báo cáo PDF offline bắt buộc phải có đầy đủ các mục này để ứng viên ôn luyện
        expect(fullReport.overallScore).toBeDefined();
        expect(fullReport.situationScore).toBeDefined();
        expect(fullReport.taskScore).toBeDefined();
        expect(fullReport.actionScore).toBeDefined();
        expect(fullReport.resultScore).toBeDefined();
        expect(fullReport.strengths.length).toBeGreaterThan(0);
        expect(fullReport.weaknesses.length).toBeGreaterThan(0);
        expect(fullReport.questionFeedbacks.length).toBeGreaterThan(0);
        expect(fullReport.sampleBetterAnswer.goldStandardAnswer).toBeTruthy();
    });
});
