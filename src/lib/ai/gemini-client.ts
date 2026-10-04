import { GoogleGenAI } from "@google/genai";

export const DEFAULT_GEMINI_MODEL =
    process.env.GEMINI_MODEL || "gemini-3.8-flash";

export const FALLBACK_GEMINI_MODEL = "gemini-3.5-flash-lite";

let _aiInstance: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI | null {
    const rawApiKey =
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.GOOGLE_GENAI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const apiKey = rawApiKey?.trim()?.replace(/^["']|["']$/g, "");
    if (!apiKey) {
        return null;
    }
    if (!_aiInstance) {
        _aiInstance = new GoogleGenAI({ apiKey });
    }
    return _aiInstance;
}

// Lazy proxy object to prevent top-level module crash when GEMINI_API_KEY is not configured yet on deployment
export const ai = new Proxy({} as GoogleGenAI, {
    get(_target, prop) {
        const client = getAiClient();
        if (!client) {
            throw new Error(
                "Chưa cấu hình biến môi trường GEMINI_API_KEY trên máy chủ. Vui lòng kiểm tra Vercel Environment Variables (mục Settings > Environment Variables, đảm bảo đã tick chọn môi trường Production).",
            );
        }
        return (client as unknown as Record<string | symbol, unknown>)[prop];
    },
});

export type GenerateContentParams = Parameters<
    GoogleGenAI["models"]["generateContent"]
>[0];

export async function generateContentWithFallback(
    params: GenerateContentParams,
) {
    const primaryModel = params.model || DEFAULT_GEMINI_MODEL;
    const modelsToTry = [primaryModel, FALLBACK_GEMINI_MODEL].filter(
        (m, idx, arr) => arr.indexOf(m) === idx,
    );

    let lastError: unknown = null;

    for (let i = 0; i < modelsToTry.length; i++) {
        const model = modelsToTry[i];
        try {
            return await ai.models.generateContent({
                ...params,
                model,
            });
        } catch (err: unknown) {
            lastError = err;
            const errStr = String(err instanceof Error ? err.message : err);
            const isOverloaded =
                errStr.includes("503") ||
                errStr.includes("UNAVAILABLE") ||
                errStr.includes("high demand") ||
                errStr.includes("429") ||
                errStr.includes("RESOURCE_EXHAUSTED");

            if (isOverloaded && i < modelsToTry.length - 1) {
                continue;
            }
            throw err;
        }
    }

    throw lastError;
}
