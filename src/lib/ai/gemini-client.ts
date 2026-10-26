import { GoogleGenAI } from "@google/genai";

export const DEFAULT_GEMINI_MODEL =
    process.env.GEMINI_MODEL || "gemini-3.8-flash";

export const FALLBACK_GEMINI_MODEL =
    process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite";

// SDK @google/genai mặc định tự retry 5 lần với backoff leo dần tới trần 60s,
// nên chỉ một lần model quá tải (503) là request có thể treo tới ~4 phút —
// trong khi tầng fallback của ta không hề hay biết. Ép timeout ngắn và tắt
// retry mù để chính hàm này quyết định việc đổi model.
// Thời gian xấu nhất: 25s x 2 model = 50s, vẫn nằm trong maxDuration = 60s.
// Lưu ý: Google API từ chối deadline < 10s ("Minimum allowed deadline is 10s"),
// nên luôn kẹp xuống tối thiểu 10s để cấu hình sai không gây lỗi 400 khó hiểu.
const MIN_REQUEST_TIMEOUT_MS = 10_000;
const REQUEST_TIMEOUT_MS = Math.max(
    MIN_REQUEST_TIMEOUT_MS,
    Number(process.env.GEMINI_TIMEOUT_MS) || 25_000,
);
const MAX_ATTEMPTS = Number(process.env.GEMINI_MAX_ATTEMPTS) || 1;

export const REQUEST_HTTP_OPTIONS = {
    timeout: REQUEST_TIMEOUT_MS,
    retryOptions: {
        attempts: MAX_ATTEMPTS,
        initialDelay: 0.5,
        maxDelay: 2,
    },
};

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

// Proxy lazy để tránh crash module ở top-level khi GEMINI_API_KEY chưa được cấu hình lúc deploy
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
                config: {
                    ...params.config,
                    httpOptions: REQUEST_HTTP_OPTIONS,
                },
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
