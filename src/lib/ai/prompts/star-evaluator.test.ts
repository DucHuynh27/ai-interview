import { describe, expect, it } from "vitest";
import { buildStarEvaluatorPrompt } from "./star-evaluator";
import type { EvaluateSessionPayload } from "@/types/report";

describe("buildStarEvaluatorPrompt", () => {
    const mockPayload: EvaluateSessionPayload = {
        sessionId: "test-session-123",
        persona: "friendly_hr",
        language: "vi",
        turns: [
            {
                questionIndex: 0,
                questionText: "Hãy giới thiệu bản thân bạn?",
                category: "WARM_UP",
                candidateAnswer: "Tôi là kỹ sư frontend với 1 năm kinh nghiệm.",
                interviewerFeedback: "Rất vui được gặp bạn hôm nay.",
                answeredAt: "10:00:00",
            },
            {
                questionIndex: 1,
                questionText: "Kể về một lần bạn xử lý xung đột trong nhóm?",
                category: "BEHAVIORAL_STAR",
                candidateAnswer:
                    "Khi làm đồ án, tôi đã chủ động tổ chức họp 1-1 với bạn nhóm và thống nhất lại task theo bảng Kanban.",
                interviewerFeedback: "Cách xử lý rất chủ động.",
                answeredAt: "10:05:00",
            },
        ],
        jobDescription: "Tuyển dụng Frontend Developer biết React và Next.js",
        extractedSkills: ["React", "TypeScript", "Next.js"],
        identifiedGaps: ["Chưa có kinh nghiệm CI/CD"],
    };

    it("generates prompt containing STAR rubric and JSON schema constraints", () => {
        const { systemInstruction, userPrompt } =
            buildStarEvaluatorPrompt(mockPayload);

        expect(systemInstruction).toContain("STAR Framework");
        expect(systemInstruction).toContain("Situation (1-10)");
        expect(systemInstruction).toContain("Task (1-10)");
        expect(systemInstruction).toContain("Action (1-10)");
        expect(systemInstruction).toContain("Result (1-10)");
        expect(systemInstruction).toContain("overallScore");
        expect(systemInstruction).toContain("sampleBetterAnswer");
        expect(systemInstruction).toContain("Vietnamese (Tiếng Việt)");

        expect(userPrompt).toContain("TARGET JOB DESCRIPTION:");
        expect(userPrompt).toContain(
            "Tuyển dụng Frontend Developer biết React và Next.js",
        );
        expect(userPrompt).toContain("CANDIDATE TARGET SKILLS: React, TypeScript, Next.js");
        expect(userPrompt).toContain("IDENTIFIED CV GAPS: Chưa có kinh nghiệm CI/CD");
        expect(userPrompt).toContain("TURN 1 (Index: 0)");
        expect(userPrompt).toContain("TURN 2 (Index: 1)");
    });

    it("adopts challenging_manager persona perspective in English", () => {
        const enPayload: EvaluateSessionPayload = {
            ...mockPayload,
            persona: "challenging_manager",
            language: "en",
        };

        const { systemInstruction } = buildStarEvaluatorPrompt(enPayload);

        expect(systemInstruction).toContain("Tuấn Vũ");
        expect(systemInstruction).toContain("Engineering Delivery Director");
        expect(systemInstruction).toContain("ownership");
        expect(systemInstruction).toContain("English");
    });

    it("adopts tech_lead persona perspective in Vietnamese", () => {
        const techLeadPayload: EvaluateSessionPayload = {
            ...mockPayload,
            persona: "tech_lead",
            language: "vi",
        };

        const { systemInstruction } =
            buildStarEvaluatorPrompt(techLeadPayload);

        expect(systemInstruction).toContain("Minh Quân");
        expect(systemInstruction).toContain("Principal Software Architect");
        expect(systemInstruction).toContain("trade-offs");
    });
});
