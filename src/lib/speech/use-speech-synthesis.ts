"use client";

import type { LanguageCode, PersonaType } from "@/types/interview";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Ambient type shims for Web Speech Synthesis API ─────────────────────────
// The typings shipped with TypeScript's lib.dom.d.ts cover SpeechSynthesis,
// but the `voiceschanged` event and some Chrome-specific quirks need care.

const TTS_LANG_MAP: Record<LanguageCode, string> = {
    vi: "vi-VN",
    en: "en-US",
};

// Persona-tuned prosody: challenging_manager speaks faster and lower-pitched
// to project authority; tech_lead is measured; friendly_hr is warm and natural.
const PERSONA_PROSODY: Record<
    PersonaType,
    { rate: number; pitch: number; volume: number }
> = {
    friendly_hr: { rate: 0.92, pitch: 1.1, volume: 1 },
    challenging_manager: { rate: 1.05, pitch: 0.9, volume: 1 },
    tech_lead: { rate: 0.97, pitch: 1.0, volume: 1 },
};

// ─── Public API ───────────────────────────────────────────────────────────────

export type SpeechSynthesisStatus = "idle" | "speaking" | "paused" | "unsupported";

interface UseSpeechSynthesisOptions {
    language: LanguageCode;
    persona: PersonaType;
}

interface UseSpeechSynthesisReturn {
    status: SpeechSynthesisStatus;
    isSupported: boolean;
    isMuted: boolean;
    speak: (text: string, onEnd?: () => void) => void;
    cancel: () => void;
    replay: () => void;
    toggleMute: () => void;
}

function pickBestVoice(
    voices: SpeechSynthesisVoice[],
    lang: string,
): SpeechSynthesisVoice | null {
    // Prefer an exact locale match that is "local" (not remote/network)
    const exact = voices.filter((v) => v.lang === lang);
    const local = exact.find((v) => v.localService);
    if (local) return local;
    if (exact.length > 0) return exact[0];

    // Fallback: match language prefix only (e.g. "vi" from "vi-VN")
    const prefix = lang.split("-")[0];
    return voices.find((v) => v.lang.startsWith(prefix)) ?? null;
}

export function useSpeechSynthesis({
    language,
    persona,
}: UseSpeechSynthesisOptions): UseSpeechSynthesisReturn {
    const [status, setStatus] = useState<SpeechSynthesisStatus>("idle");
    const [isMuted, setIsMuted] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    const lastTextRef = useRef<string>("");
    const pendingEndRef = useRef<(() => void) | undefined>(undefined);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const synth =
        typeof window !== "undefined" ? window.speechSynthesis : null;
    const isSupported = synth !== null;

    // ─── Load voices (Chrome fires voiceschanged async, Firefox syncs) ─────
    useEffect(() => {
        if (!synth) return;

        const load = () => {
            const available = synth.getVoices();
            if (available.length > 0) setVoices(available);
        };

        load();
        synth.addEventListener("voiceschanged", load);
        return () => synth.removeEventListener("voiceschanged", load);
    }, [synth]);

    const cancel = useCallback(() => {
        synth?.cancel();
        utteranceRef.current = null;
        pendingEndRef.current = undefined;
        setStatus("idle");
    }, [synth]);

    const speak = useCallback(
        (text: string, onEnd?: () => void) => {
            if (!synth || !text.trim()) return;

            // Cancel any in-progress speech before starting new
            synth.cancel();

            if (isMuted) {
                // When muted, skip TTS but still fire the completion callback so
                // the interview flow can advance normally.
                onEnd?.();
                return;
            }

            lastTextRef.current = text;
            pendingEndRef.current = onEnd;

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = TTS_LANG_MAP[language];

            const prosody = PERSONA_PROSODY[persona];
            utterance.rate = prosody.rate;
            utterance.pitch = prosody.pitch;
            utterance.volume = prosody.volume;

            const bestVoice = pickBestVoice(voices, TTS_LANG_MAP[language]);
            if (bestVoice) utterance.voice = bestVoice;

            utterance.onstart = () => setStatus("speaking");
            utterance.onend = () => {
                setStatus("idle");
                utteranceRef.current = null;
                const cb = pendingEndRef.current;
                pendingEndRef.current = undefined;
                cb?.();
            };
            utterance.onerror = (e) => {
                // "interrupted" fires when cancel() is called deliberately — not an error.
                if (e.error === "interrupted") return;
                setStatus("idle");
                utteranceRef.current = null;
                pendingEndRef.current = undefined;
            };

            utteranceRef.current = utterance;
            synth.speak(utterance);
        },
        [synth, language, persona, voices, isMuted],
    );

    const replay = useCallback(() => {
        if (lastTextRef.current) {
            speak(lastTextRef.current, pendingEndRef.current);
        }
    }, [speak]);

    const toggleMute = useCallback(() => {
        setIsMuted((prev) => {
            if (!prev) {
                // Muting mid-speech: cancel immediately
                synth?.cancel();
                setStatus("idle");
            }
            return !prev;
        });
    }, [synth]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            synth?.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        status: !isSupported ? "unsupported" : status,
        isSupported,
        isMuted,
        speak,
        cancel,
        replay,
        toggleMute,
    };
}
