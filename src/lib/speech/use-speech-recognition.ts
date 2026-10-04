"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LanguageCode } from "@/types/interview";

const SPEECH_LANG_MAP: Record<LanguageCode, string> = {
    vi: "vi-VN",
    en: "en-US",
};

// ─── Ambient type shims for the non-standard Web Speech API ─────────────────
// SpeechRecognition is not part of the standardised TypeScript DOM lib yet.

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

// ─── Public API ───────────────────────────────────────────────────────────────

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
    /** Live microphone amplitude 0–100, drives waveform bar heights. */
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
            // Map RMS (0–255) to 0–100, boosted slightly for visual clarity
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

        // Toggle off if already listening
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
                // Browser closed the session due to silence; restart to keep listening
                try {
                    recognition.start();
                } catch {
                    // Already started or permission revoked
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

        // Attach AudioContext analyser for live waveform visualisation.
        // Runs independently of the SpeechRecognition session so it fails
        // gracefully when getUserMedia is denied.
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
                // STT still works without waveform if getUserMedia fails
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
