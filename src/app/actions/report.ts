"use server";

import {
    DEFAULT_GEMINI_MODEL,
    generateContentWithFallback,
} from "@/lib/ai/gemini-client";
import { buildStarEvaluatorPrompt } from "@/lib/ai/prompts/star-evaluator";
import { maskPiiText } from "@/lib/utils/pii-masker";
import type {
    EvaluateSessionPayload,
    InterviewEvaluationReport,
} from "@/types/report";
import { z } from "zod";

const StarScoreSchema = z
    .number()
    .transform((val) => Math.min(10, Math.max(1, Math.round(val))));

const OverallScoreSchema = z
    .number()
    .transform((val) => Math.min(100, Math.max(1, Math.round(val))));

const QuestionFeedbackSchema = z.object({
    questionIndex: z.number().int(),
    questionText: z.string().min(1),
    category: z
        .enum(["WARM_UP", "BEHAVIORAL_STAR", "ROLE_SPECIFIC", "SITUATIONAL"])
        .catch("BEHAVIORAL_STAR"),
    candidateAnswer: z.string(),
    situationScore: StarScoreSchema,
    taskScore: StarScoreSchema,
    actionScore: StarScoreSchema,
    resultScore: StarScoreSchema,
    score: OverallScoreSchema,
    strengths: z.array(z.string()).min(1),
    weaknesses: z.array(z.string()).min(1),
    suggestedAnswer: z.string().min(10),
});

const SampleBetterAnswerSchema = z.object({
    questionIndex: z.number().int().catch(0),
    questionText: z.string().min(1),
    goldStandardAnswer: z.string().min(10),
    keyTakeaway: z.string().min(5),
});

const RawEvaluationReportSchema = z.object({
    overallScore: OverallScoreSchema,
    situationScore: StarScoreSchema,
    taskScore: StarScoreSchema,
    actionScore: StarScoreSchema,
    resultScore: StarScoreSchema,
    summary: z.string().min(10),
    strengths: z.array(z.string()).min(1),
    weaknesses: z.array(z.string()).min(1),
    questionFeedbacks: z.array(QuestionFeedbackSchema).min(1),
    sampleBetterAnswer: SampleBetterAnswerSchema,
});

type EvaluateSuccess = { ok: true; data: InterviewEvaluationReport };
type EvaluateError = { ok: false; error: string };
export type EvaluateReportActionResult = EvaluateSuccess | EvaluateError;

export async function evaluateInterviewSession(
    payload: EvaluateSessionPayload,
): Promise<EvaluateReportActionResult> {
    if (!payload.turns || payload.turns.length === 0) {
        return {
            ok: false,
            error: "Phiên phỏng vấn chưa có câu trả lời nào để đánh giá.",
        };
    }

    const sanitizedTurns = payload.turns.map((turn) => ({
        ...turn,
        candidateAnswer: maskPiiText(turn.candidateAnswer.trim()),
    }));

    const sanitizedPayload: EvaluateSessionPayload = {
        ...payload,
        jobDescription: payload.jobDescription
            ? maskPiiText(payload.jobDescription)
            : undefined,
        turns: sanitizedTurns,
    };

    const { systemInstruction, userPrompt } =
        buildStarEvaluatorPrompt(sanitizedPayload);

    const response = await generateContentWithFallback({
        model: DEFAULT_GEMINI_MODEL,
        config: { systemInstruction },
        contents: [
            {
                role: "user",
                parts: [{ text: userPrompt }],
            },
        ],
    });

    const rawText = response.text?.trim() ?? "";
    const jsonText = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

    const parsed = (() => {
        try {
            return JSON.parse(jsonText);
        } catch {
            return null;
        }
    })();

    if (!parsed) {
        return {
            ok: false,
            error: "Hệ thống AI không thể trả về kết quả báo cáo đúng cấu trúc. Vui lòng thử lại.",
        };
    }

    const validated = RawEvaluationReportSchema.safeParse(parsed);

    if (!validated.success) {
        return {
            ok: false,
            error: `Định dạng dữ liệu báo cáo không hợp lệ: ${validated.error.issues[0]?.message ?? "unknown"}`,
        };
    }

    const data: InterviewEvaluationReport = {
        ...validated.data,
        sessionId: payload.sessionId,
        evaluatedAt: new Date().toISOString(),
    };

    return {
        ok: true,
        data,
    };
}
