"use server";

import { ai, DEFAULT_GEMINI_MODEL } from "@/lib/ai/gemini-client";
import { buildQuestionGeneratorSystemPrompt } from "@/lib/ai/prompts/question-generator";
import { buildTurnResponderPrompt } from "@/lib/ai/prompts/turn-responder";
import { maskPiiText } from "@/lib/utils/pii-masker";
import type {
    CandidateAnswerSubmission,
    GenerateQuestionsResult,
    LanguageCode,
    PersonaType,
    TurnFeedbackResult,
} from "@/types/interview";
import { createPartFromBase64 } from "@google/genai";
import { z } from "zod";

// ─── Zod schema: validates + types the raw Gemini JSON output ────────────────

const InterviewQuestionSchema = z.object({
    order: z.number().int().min(1).max(5),
    category: z.enum([
        "WARM_UP",
        "BEHAVIORAL_STAR",
        "ROLE_SPECIFIC",
        "SITUATIONAL",
    ]),
    questionVi: z.string().min(10),
    questionEn: z.string().min(10),
    targetGoal: z.string().min(5),
});

const GenerateQuestionsSchema = z.object({
    summary: z.object({
        extractedSkills: z.array(z.string()).min(1),
        identifiedGaps: z.array(z.string()).min(1),
    }),
    questions: z.array(InterviewQuestionSchema).length(5),
});

// ─── Types for Server Action response ────────────────────────────────────────

type ActionSuccess = { ok: true; data: GenerateQuestionsResult };
type ActionError = { ok: false; error: string };
export type GenerateQuestionsActionResult = ActionSuccess | ActionError;

// ─── Server Action ────────────────────────────────────────────────────────────

export async function generateInterviewQuestions(
    cvBuffer: ArrayBuffer,
    rawJobDescription: string,
    language: LanguageCode,
    persona: PersonaType,
): Promise<GenerateQuestionsActionResult> {
    try {
        const sanitizedJd = maskPiiText(rawJobDescription);

        const cvBase64 = Buffer.from(cvBuffer).toString("base64");
        const cvPart = createPartFromBase64(cvBase64, "application/pdf");

        const systemInstruction = buildQuestionGeneratorSystemPrompt(
            persona,
            language,
        );

        const userPrompt = `JOB DESCRIPTION:
${sanitizedJd}

Above is the CV (attached as PDF) and the Job Description.
Analyze them and generate the interview plan now. Remember: respond with ONLY the JSON object, no markdown, no explanation.`;

        const response = await ai.models.generateContent({
            model: DEFAULT_GEMINI_MODEL,
            config: { systemInstruction },
            contents: [
                {
                    role: "user",
                    parts: [cvPart, { text: userPrompt }],
                },
            ],
        });

        const rawText = response.text?.trim() ?? "";

        // Strip accidental markdown code fences that some model outputs include
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
                error: "AI trả về định dạng không hợp lệ. Vui lòng thử lại.",
            };
        }

        const validated = GenerateQuestionsSchema.safeParse(parsed);

        if (!validated.success) {
            return {
                ok: false,
                error: `Dữ liệu từ AI không đúng chuẩn: ${validated.error.issues[0]?.message ?? "unknown"}`,
            };
        }

        return { ok: true, data: validated.data };
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Lỗi hệ thống máy chủ.";
        return {
            ok: false,
            error: `Không thể kết nối AI: ${message}`,
        };
    }
}

// ─── Turn Feedback Schema & Action ───────────────────────────────────────────

const TurnFeedbackSchema = z.object({
    acknowledgment: z.string().min(2),
    transition: z.string().min(2),
});

type TurnActionSuccess = { ok: true; data: TurnFeedbackResult };
type TurnActionError = { ok: false; error: string };
export type SubmitAnswerActionResult = TurnActionSuccess | TurnActionError;

export async function submitCandidateAnswerTurn(
    submission: CandidateAnswerSubmission,
): Promise<SubmitAnswerActionResult> {
    try {
        if (
            !submission.candidateAnswer ||
            submission.candidateAnswer.trim().length === 0
        ) {
            return {
                ok: false,
                error: "Câu trả lời không được để trống.",
            };
        }

        const sanitizedAnswer = maskPiiText(submission.candidateAnswer.trim());

        const { systemInstruction, userPrompt } = buildTurnResponderPrompt({
            persona: submission.persona,
            language: submission.language,
            questionText: submission.questionText,
            category: submission.category,
            targetGoal: submission.targetGoal,
            candidateAnswer: sanitizedAnswer,
            isFinalQuestion: submission.isFinalQuestion,
        });

        const response = await ai.models.generateContent({
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
                error: "AI không thể xử lý phản hồi lúc này. Vui lòng thử lại.",
            };
        }

        const validated = TurnFeedbackSchema.safeParse(parsed);

        if (!validated.success) {
            return {
                ok: false,
                error: "Định dạng phản hồi từ AI không đúng cấu trúc.",
            };
        }

        const { acknowledgment, transition } = validated.data;
        const fullResponse = `${acknowledgment} ${transition}`.trim();

        return {
            ok: true,
            data: {
                acknowledgment,
                transition,
                fullResponse,
            },
        };
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Lỗi kết nối máy chủ AI.";
        return {
            ok: false,
            error: `Lỗi kết nối AI: ${message}`,
        };
    }
}
