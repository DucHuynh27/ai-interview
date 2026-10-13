import type { LanguageCode, PersonaType } from "@/types/interview";
import type { PersonaType as PrismaPersonaType, LanguageCode as PrismaLanguageCode } from "@prisma/client";

// Prisma enum dùng chữ HOA (FRIENDLY_HR), còn app type dùng chữ thường
// (friendly_hr). Các mapper dưới đây chuyển đổi qua lại an toàn.

const PERSONA_TO_PRISMA: Record<PersonaType, PrismaPersonaType> = {
    friendly_hr: "FRIENDLY_HR",
    challenging_manager: "CHALLENGING_MANAGER",
    tech_lead: "TECH_LEAD",
};

const PERSONA_FROM_PRISMA: Record<PrismaPersonaType, PersonaType> = {
    FRIENDLY_HR: "friendly_hr",
    CHALLENGING_MANAGER: "challenging_manager",
    TECH_LEAD: "tech_lead",
};

const LANGUAGE_TO_PRISMA: Record<LanguageCode, PrismaLanguageCode> = {
    vi: "VI",
    en: "EN",
};

const LANGUAGE_FROM_PRISMA: Record<PrismaLanguageCode, LanguageCode> = {
    VI: "vi",
    EN: "en",
};

export function toPrismaPersona(persona: PersonaType): PrismaPersonaType {
    return PERSONA_TO_PRISMA[persona];
}

export function fromPrismaPersona(persona: PrismaPersonaType): PersonaType {
    return PERSONA_FROM_PRISMA[persona];
}

export function toPrismaLanguage(language: LanguageCode): PrismaLanguageCode {
    return LANGUAGE_TO_PRISMA[language];
}

export function fromPrismaLanguage(
    language: PrismaLanguageCode,
): LanguageCode {
    return LANGUAGE_FROM_PRISMA[language];
}
