export type PersonaType =
    | "friendly_hr"
    | "challenging_manager"
    | "tech_lead";

export type LanguageCode = "vi" | "en";

export type QuestionCategory =
    | "WARM_UP"
    | "BEHAVIORAL_STAR"
    | "ROLE_SPECIFIC"
    | "SITUATIONAL";

export interface SetupFormValues {
    cvFile: File | null;
    jobDescription: string;
    language: LanguageCode;
    persona: PersonaType;
}

export interface PersonaOption {
    id: PersonaType;
    name: string;
    role: string;
    badge: string;
    description: string;
    accentColor: string;
}

export interface InterviewQuestion {
    order: number;
    category: QuestionCategory;
    questionVi: string;
    questionEn: string;
    targetGoal: string;
}

export interface InterviewSummary {
    extractedSkills: string[];
    identifiedGaps: string[];
}

export interface GenerateQuestionsResult {
    summary: InterviewSummary;
    questions: InterviewQuestion[];
}

export interface InterviewSessionData {
    sessionId: string;
    persona: PersonaType;
    language: LanguageCode;
    data: GenerateQuestionsResult;
}
