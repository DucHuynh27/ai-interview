export type PersonaType =
    | "friendly_hr"
    | "challenging_manager"
    | "tech_lead";

export type LanguageCode = "vi" | "en";

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
