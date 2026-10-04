import type {
    LanguageCode,
    PersonaType,
    QuestionCategory,
    InterviewTranscriptTurn,
} from "@/types/interview";

export type StarCriterion = "situation" | "task" | "action" | "result";

export interface StarScores {
    situation: number;
    task: number;
    action: number;
    result: number;
}

export interface QuestionFeedbackItem {
    questionIndex: number;
    questionText: string;
    category: QuestionCategory;
    candidateAnswer: string;
    situationScore: number;
    taskScore: number;
    actionScore: number;
    resultScore: number;
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestedAnswer: string;
}

export interface SampleBetterAnswer {
    questionIndex: number;
    questionText: string;
    goldStandardAnswer: string;
    keyTakeaway: string;
}

export interface InterviewEvaluationReport {
    sessionId: string;
    overallScore: number;
    situationScore: number;
    taskScore: number;
    actionScore: number;
    resultScore: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    questionFeedbacks: QuestionFeedbackItem[];
    sampleBetterAnswer: SampleBetterAnswer;
    evaluatedAt: string;
}

export interface EvaluateSessionPayload {
    sessionId: string;
    persona: PersonaType;
    language: LanguageCode;
    turns: InterviewTranscriptTurn[];
    jobDescription?: string;
    extractedSkills?: string[];
    identifiedGaps?: string[];
}

export const REPORT_STORAGE_PREFIX = "interview_report_";
