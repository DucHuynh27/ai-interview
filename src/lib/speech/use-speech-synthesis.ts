"use client";

import type { LanguageCode, PersonaType } from "@/types/interview";
import { useCallback, useEffect, useRef, useState } from "react";

const TTS_LANG_MAP: Record<LanguageCode, string> = {
    vi: "vi-VN",
    en: "en-US",
};

const PERSONA_PROSODY: Record<
    PersonaType,
    { rate: number; pitch: number; volume: number }
> = {
    friendly_hr: { rate: 0.92, pitch: 1.1, volume: 1 },
    challenging_manager: { rate: 1.05, pitch: 0.9, volume: 1 },
    tech_lead: { rate: 0.97, pitch: 1.0, volume: 1 },
};

export type SpeechSynthesisStatus =
    | "idle"
    | "speaking"
    | "paused"
    | "unsupported";

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

function splitTextIntoTtsChunks(text: string, maxLen = 160): string[] {
    const sentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
    const chunks: string[] = [];
    let current = "";

    for (const s of sentences) {
        if ((current + " " + s).trim().length <= maxLen) {
            current = (current + " " + s).trim();
        } else {
            if (current) chunks.push(current);
            if (s.length > maxLen) {
                const words = s.split(" ");
                let sub = "";
                for (const w of words) {
                    if ((sub + " " + w).trim().length <= maxLen) {
                        sub = (sub + " " + w).trim();
                    } else {
                        if (sub) chunks.push(sub);
                        sub = w;
                    }
                }
                current = sub;
            } else {
                current = s.trim();
            }
        }
    }
    if (current) chunks.push(current);
    return chunks;
}

function playAudioChunks(
    chunks: string[],
    lang: string,
    onStart: () => void,
    onEnd: () => void,
    onError: () => void,
): { cancel: () => void } {
    let currentIndex = 0;
    let isCancelled = false;
    let currentAudio: HTMLAudioElement | null = null;

    onStart();

    function playNext() {
        if (isCancelled) return;
        if (currentIndex >= chunks.length) {
            onEnd();
            return;
        }

        const chunk = chunks[currentIndex];
        currentIndex++;

        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
        currentAudio = new Audio(url);

        currentAudio.onended = () => {
            if (!isCancelled) playNext();
        };
        currentAudio.onerror = () => {
            if (!isCancelled) {
                onEnd();
            }
        };

        currentAudio.play().catch(() => {
            if (!isCancelled) onError();
        });
    }

    playNext();

    return {
        cancel: () => {
            isCancelled = true;
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }
        },
    };
}

function pickBestVoice(
    voices: SpeechSynthesisVoice[],
    lang: string,
): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;

    const targetLang = lang.toLowerCase().replace(/_/g, "-");
    const targetPrefix = targetLang.split("-")[0];

    // Priority 1: Exact locale match (e.g. "vi-VN" or "vi-vn")
    const exact = voices.filter(
        (v) => v.lang.toLowerCase().replace(/_/g, "-") === targetLang,
    );
    if (exact.length > 0) {
        const naturalVoice = exact.find(
            (v) =>
                v.name.includes("Natural") ||
                v.name.includes("Google") ||
                v.name.includes("Online") ||
                v.name.includes("HoaiMy") ||
                v.name.includes("NamMinh") ||
                v.name.includes("Linh") ||
                v.name.includes("An"),
        );
        return naturalVoice || exact[0];
    }

    // Priority 2: Language prefix match (e.g. "vi")
    const prefixMatches = voices.filter((v) =>
        v.lang.toLowerCase().replace(/_/g, "-").startsWith(targetPrefix),
    );
    if (prefixMatches.length > 0) {
        const naturalVoice = prefixMatches.find(
            (v) =>
                v.name.includes("Natural") ||
                v.name.includes("Google") ||
                v.name.includes("Online") ||
                v.name.includes("HoaiMy") ||
                v.name.includes("NamMinh"),
        );
        return naturalVoice || prefixMatches[0];
    }

    // Priority 3: Name match containing "vietnam" or "tiếng việt"
    const nameMatch = voices.find((v) => {
        const nameLower = v.name.toLowerCase();
        return (
            nameLower.includes("vietnam") ||
            nameLower.includes("tiếng việt") ||
            nameLower.includes("vietnamese")
        );
    });
    if (nameMatch) return nameMatch;

    return null;
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
    const audioControllerRef = useRef<{ cancel: () => void } | null>(null);

    const synth =
        typeof window !== "undefined" ? window.speechSynthesis : null;
    const isSupported = synth !== null;

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
        if (audioControllerRef.current) {
            audioControllerRef.current.cancel();
            audioControllerRef.current = null;
        }
        setStatus("idle");
    }, [synth]);

    const speak = useCallback(
        async (text: string, onEnd?: () => void) => {
            if (!text.trim()) return;

            cancel();

            if (isMuted) {
                onEnd?.();
                return;
            }

            lastTextRef.current = text;
            pendingEndRef.current = onEnd;

            let availableVoices =
                voices.length > 0 ? voices : (synth?.getVoices() ?? []);

            if (synth && availableVoices.length === 0) {
                availableVoices = await new Promise<SpeechSynthesisVoice[]>(
                    (resolve) => {
                        let timer: ReturnType<typeof setTimeout> | null = null;
                        const onVoices = () => {
                            if (timer) clearTimeout(timer);
                            synth.removeEventListener("voiceschanged", onVoices);
                            const updated = synth.getVoices();
                            setVoices(updated);
                            resolve(updated);
                        };
                        synth.addEventListener("voiceschanged", onVoices);
                        timer = setTimeout(() => {
                            synth.removeEventListener("voiceschanged", onVoices);
                            resolve(synth.getVoices() ?? []);
                        }, 250);
                    },
                );
            }

            const targetLang = TTS_LANG_MAP[language];
            const bestVoice = pickBestVoice(availableVoices, targetLang);

            // If Vietnamese is chosen and no Vietnamese voice exists on this device/browser,
            // fall back to clean native Google TTS audio so the English voice never reads Vietnamese.
            if (language === "vi" && !bestVoice) {
                const chunks = splitTextIntoTtsChunks(text);
                audioControllerRef.current = playAudioChunks(
                    chunks,
                    "vi",
                    () => setStatus("speaking"),
                    () => {
                        setStatus("idle");
                        audioControllerRef.current = null;
                        const cb = pendingEndRef.current;
                        pendingEndRef.current = undefined;
                        cb?.();
                    },
                    () => {
                        setStatus("idle");
                        audioControllerRef.current = null;
                    },
                );
                return;
            }

            if (!synth) {
                onEnd?.();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = targetLang;

            const prosody = PERSONA_PROSODY[persona];
            utterance.rate = prosody.rate;
            utterance.pitch = prosody.pitch;
            utterance.volume = prosody.volume;

            if (bestVoice) {
                utterance.voice = bestVoice;
                utterance.lang = bestVoice.lang;
            }

            utterance.onstart = () => setStatus("speaking");
            utterance.onend = () => {
                setStatus("idle");
                utteranceRef.current = null;
                const cb = pendingEndRef.current;
                pendingEndRef.current = undefined;
                cb?.();
            };
            utterance.onerror = (e) => {
                if (e.error === "interrupted") return;
                setStatus("idle");
                utteranceRef.current = null;
                pendingEndRef.current = undefined;
            };

            utteranceRef.current = utterance;
            synth.speak(utterance);
        },
        [synth, language, persona, voices, isMuted, cancel],
    );

    const replay = useCallback(() => {
        if (lastTextRef.current) {
            speak(lastTextRef.current, pendingEndRef.current);
        }
    }, [speak]);

    const toggleMute = useCallback(() => {
        setIsMuted((prev) => {
            if (!prev) {
                cancel();
            }
            return !prev;
        });
    }, [cancel]);

    useEffect(() => {
        return () => {
            cancel();
        };
    }, [cancel]);

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
