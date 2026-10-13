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

function findVietnameseVoice(
    voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;

    // Tìm voice tiếng Việt theo thẻ ngôn ngữ chính xác.
    const viVoices = voices.filter((v) => {
        const lang = v.lang.toLowerCase().replace(/_/g, "-");
        return lang === "vi-vn" || lang.startsWith("vi");
    });

    if (viVoices.length > 0) {
        // Ưu tiên voice tự nhiên / Google.
        const natural = viVoices.find((v) => {
            const n = v.name.toLowerCase();
            return (
                n.includes("natural") ||
                n.includes("google") ||
                n.includes("online") ||
                n.includes("hoaimy") ||
                n.includes("namminh") ||
                n.includes("linh") ||
                n.includes("an")
            );
        });
        return natural || viVoices[0];
    }

    // Tìm voice theo tên.
    const nameMatch = voices.find((v) => {
        const n = v.name.toLowerCase();
        return (
            n.includes("vietnam") ||
            n.includes("tiếng việt") ||
            n.includes("vietnamese")
        );
    });

    return nameMatch || null;
}

function findEnglishVoice(
    voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;

    const enVoices = voices.filter((v) => {
        const lang = v.lang.toLowerCase().replace(/_/g, "-");
        return lang === "en-us" || lang.startsWith("en");
    });

    if (enVoices.length > 0) {
        const natural = enVoices.find((v) => {
            const n = v.name.toLowerCase();
            return (
                n.includes("natural") ||
                n.includes("google") ||
                n.includes("online")
            );
        });
        return natural || enVoices[0];
    }

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
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);

    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
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
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }
        if (synth) {
            synth.cancel();
        }
        utteranceRef.current = null;
        pendingEndRef.current = undefined;
        setStatus("idle");
    }, [synth]);

    const speak = useCallback(
        (text: string, onEnd?: () => void) => {
            const trimmed = text.trim();
            if (!trimmed) return;

            cancel();

            if (isMuted) {
                onEnd?.();
                return;
            }

            lastTextRef.current = trimmed;
            pendingEndRef.current = onEnd;

            const allVoices =
                voices.length > 0 ? voices : (synth?.getVoices() ?? []);

            // Nếu yêu cầu tiếng Việt:
            // Kiểm tra xem trình duyệt người dùng có voice tiếng Việt thật hay không.
            if (language === "vi") {
                const viVoice = findVietnameseVoice(allVoices);

                if (viVoice && synth) {
                    // Trình duyệt đã cài voice tiếng Việt native.
                    const utterance = new SpeechSynthesisUtterance(trimmed);
                    utterance.voice = viVoice;
                    utterance.lang = viVoice.lang || "vi-VN";

                    const prosody = PERSONA_PROSODY[persona];
                    utterance.rate = prosody.rate;
                    utterance.pitch = prosody.pitch;
                    utterance.volume = prosody.volume;

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
                    return;
                }

                // Nếu trình duyệt KHÔNG có voice tiếng Việt (ví dụ Linux / Windows
                // thiếu gói tiếng Việt), phát audio tiếng Việt native chất lượng cao
                // từ route server /api/tts.
                const audio = new Audio(
                    `/api/tts?text=${encodeURIComponent(trimmed)}&lang=vi`,
                );
                currentAudioRef.current = audio;

                audio.onplay = () => setStatus("speaking");
                audio.onended = () => {
                    setStatus("idle");
                    currentAudioRef.current = null;
                    const cb = pendingEndRef.current;
                    pendingEndRef.current = undefined;
                    cb?.();
                };
                audio.onerror = () => {
                    setStatus("idle");
                    currentAudioRef.current = null;
                    // Nếu audio lỗi vì bất kỳ lý do gì, kết thúc êm để không chặn phòng.
                    const cb = pendingEndRef.current;
                    pendingEndRef.current = undefined;
                    cb?.();
                };

                audio.play().catch(() => {
                    // Nếu trình duyệt chặn autoplay, gọi callback để ứng viên tiếp tục.
                    setStatus("idle");
                    currentAudioRef.current = null;
                    const cb = pendingEndRef.current;
                    pendingEndRef.current = undefined;
                    cb?.();
                });
                return;
            }

            // Tổng hợp giọng nói tiếng Anh.
            if (!synth) {
                onEnd?.();
                return;
            }

            const enVoice = findEnglishVoice(allVoices);
            const utterance = new SpeechSynthesisUtterance(trimmed);
            utterance.lang = TTS_LANG_MAP.en;

            const prosody = PERSONA_PROSODY[persona];
            utterance.rate = prosody.rate;
            utterance.pitch = prosody.pitch;
            utterance.volume = prosody.volume;

            if (enVoice) {
                utterance.voice = enVoice;
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
