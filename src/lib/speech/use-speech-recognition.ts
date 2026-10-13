"use client";

import type { LanguageCode } from "@/types/interview";
import { useCallback, useEffect, useRef, useState } from "react";

const SPEECH_LANG_MAP: Record<LanguageCode, string> = {
    vi: "vi-VN",
    en: "en-US",
};

// ─── Khai báo type tạm cho Web Speech API không chuẩn ────────────────────────
// SpeechRecognition chưa nằm trong lib DOM chuẩn hoá của TypeScript.

interface SpeechRecognitionResultItem {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionResultEntry {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionResultItem;
    [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResultEntry;
    [index: number]: SpeechRecognitionResultEntry;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

interface WebSpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onspeechend: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

interface WebSpeechRecognitionConstructor {
    new (): WebSpeechRecognition;
}

function getSpeechRecognitionCtor(): WebSpeechRecognitionConstructor | null {
    if (typeof window === "undefined") return null;
    const win = window as typeof window & {
        SpeechRecognition?: WebSpeechRecognitionConstructor;
        webkitSpeechRecognition?: WebSpeechRecognitionConstructor;
    };
    return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

// ─── API công khai ────────────────────────────────────────────────────────────

export type SpeechRecognitionStatus =
    | "idle"
    | "listening"
    | "processing"
    | "error"
    | "unsupported";

interface UseSpeechRecognitionOptions {
    language: LanguageCode;
    onTranscriptChange: (partialText: string) => void;
    onFinalResult: (finalText: string) => void;
}

interface UseSpeechRecognitionReturn {
    status: SpeechRecognitionStatus;
    /** Biên độ micro trực tiếp 0–100, điều khiển chiều cao thanh sóng âm. */
    audioLevel: number;
    start: () => void;
    stop: () => void;
    isSupported: boolean;
}

export function useSpeechRecognition({
    language,
    onTranscriptChange,
    onFinalResult,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
    const [status, setStatus] = useState<SpeechRecognitionStatus>("idle");
    const [audioLevel, setAudioLevel] = useState(0);

    const recognitionRef = useRef<WebSpeechRecognition | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const accumulatedRef = useRef<string>("");
    const isStoppingRef = useRef(false);

    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    const isSupported = SpeechRecognitionCtor !== null;

    const startLevelPolling = useCallback(() => {
        const analyser = analyserRef.current;
        if (!analyser) return;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
            analyser.getByteFrequencyData(dataArray);
            const rms = Math.sqrt(
                dataArray.reduce((sum, val) => sum + val * val, 0) /
                    dataArray.length,
            );
            // Ánh xạ RMS (0–255) về 0–100, tăng nhẹ để nhìn rõ hơn
            setAudioLevel(Math.min(100, Math.round((rms / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(tick);
        };

        animFrameRef.current = requestAnimationFrame(tick);
    }, []);

    const teardownAudio = useCallback(() => {
        if (animFrameRef.current !== null) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        analyserRef.current?.disconnect();
        analyserRef.current = null;
        audioContextRef.current?.close();
        audioContextRef.current = null;
        micStreamRef.current?.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
        setAudioLevel(0);
    }, []);

    const stop = useCallback(() => {
        isStoppingRef.current = true;
        recognitionRef.current?.stop();
        teardownAudio();
        setStatus("idle");
    }, [teardownAudio]);

    const start = useCallback(() => {
        if (!SpeechRecognitionCtor) return;

        // Tắt nếu đang nghe
        if (status === "listening") {
            stop();
            return;
        }

        const recognition = new SpeechRecognitionCtor();
        recognition.lang = SPEECH_LANG_MAP[language];
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;
        accumulatedRef.current = "";
        isStoppingRef.current = false;

        recognition.onstart = () => setStatus("listening");

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interimSegment = "";
            let finalSegment = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalSegment += result[0].transcript;
                } else {
                    interimSegment += result[0].transcript;
                }
            }

            if (finalSegment) {
                accumulatedRef.current = (
                    accumulatedRef.current +
                    " " +
                    finalSegment
                ).trim();
            }

            const displayText = interimSegment
                ? (accumulatedRef.current + " " + interimSegment).trim()
                : accumulatedRef.current;

            onTranscriptChange(displayText);
        };

        recognition.onspeechend = () => setStatus("processing");

        recognition.onend = () => {
            if (!isStoppingRef.current) {
                // Trình duyệt tự đóng phiên do im lặng; khởi động lại để tiếp tục nghe.
                try {
                    recognition.start();
                } catch {
                    // Đã khởi động rồi hoặc quyền đã bị thu hồi.
                }
                return;
            }
            const finalText = accumulatedRef.current.trim();
            if (finalText) onFinalResult(finalText);
            teardownAudio();
            setStatus("idle");
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error === "no-speech") return;
            teardownAudio();
            setStatus("error");
        };

        recognition.start();

        // Gắn analyser AudioContext để hiển thị sóng âm trực tiếp.
        // Chạy độc lập với phiên SpeechRecognition nên sẽ tự fail mềm
        // khi getUserMedia bị từ chối.
        navigator.mediaDevices
            ?.getUserMedia({ audio: true, video: false })
            .then((stream) => {
                if (isStoppingRef.current) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                micStreamRef.current = stream;
                const ctx = new AudioContext();
                audioContextRef.current = ctx;
                const source = ctx.createMediaStreamSource(stream);
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                analyserRef.current = analyser;
                startLevelPolling();
            })
            .catch(() => {
                // STT vẫn hoạt động dù không có sóng âm nếu getUserMedia lỗi.
            });
    }, [
        SpeechRecognitionCtor,
        language,
        onTranscriptChange,
        onFinalResult,
        startLevelPolling,
        teardownAudio,
        status,
        stop,
    ]);

    useEffect(() => {
        return () => {
            isStoppingRef.current = true;
            recognitionRef.current?.abort();
            teardownAudio();
        };
    }, [teardownAudio]);

    return {
        status: !isSupported ? "unsupported" : status,
        audioLevel,
        start,
        stop,
        isSupported,
    };
}
