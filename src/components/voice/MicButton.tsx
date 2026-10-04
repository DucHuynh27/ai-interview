"use client";

import type { SpeechRecognitionStatus } from "@/lib/speech/use-speech-recognition";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface WaveformProps {
    audioLevel: number; // 0–100
    isActive: boolean;
    barCount?: number;
}

/**
 * Animated waveform visualizer.
 * Bar heights are seeded with a sinusoidal base pattern and scaled by the
 * live `audioLevel` (0–100) coming from the AnalyserNode in the hook.
 */
export function Waveform({ audioLevel, isActive, barCount = 12 }: WaveformProps) {
    // Base heights define the "resting" sinusoidal shape of the waveform
    const baseHeights = Array.from(
        { length: barCount },
        (_, i) => 4 + Math.round(Math.sin((i / barCount) * Math.PI) * 14),
    );

    return (
        <div className="flex items-center gap-0.5" aria-hidden>
            {baseHeights.map((base, i) => {
                const scaledHeight = isActive
                    ? base + Math.round((audioLevel / 100) * 18)
                    : base;

                return (
                    <span
                        key={i}
                        style={{ height: `${scaledHeight}px` }}
                        className={`w-0.5 rounded-full transition-all duration-75 ${
                            isActive
                                ? "bg-emerald-400 animate-pulse"
                                : "bg-zinc-600"
                        }`}
                    />
                );
            })}
        </div>
    );
}

interface MicButtonProps {
    status: SpeechRecognitionStatus;
    audioLevel: number;
    onToggle: () => void;
    disabled?: boolean;
    language: "vi" | "en";
}

const STATUS_LABELS: Record<SpeechRecognitionStatus, string> = {
    idle: "Nhấn để nói",
    listening: "Đang nghe — nhấn để dừng",
    processing: "Đang xử lý...",
    error: "Lỗi micro — thử lại",
    unsupported: "Trình duyệt không hỗ trợ STT",
};

const STATUS_LABELS_EN: Record<SpeechRecognitionStatus, string> = {
    idle: "Click to speak",
    listening: "Listening — click to stop",
    processing: "Processing...",
    error: "Mic error — try again",
    unsupported: "Browser does not support STT",
};

export function MicButton({
    status,
    audioLevel,
    onToggle,
    disabled = false,
    language,
}: MicButtonProps) {
    const isListening = status === "listening";
    const isProcessing = status === "processing";
    const isError = status === "error";
    const isUnsupported = status === "unsupported";

    const labelMap = language === "en" ? STATUS_LABELS_EN : STATUS_LABELS;

    const ringStyle = isListening
        ? "ring-2 ring-emerald-500 ring-offset-1 ring-offset-zinc-950"
        : isError
          ? "ring-2 ring-rose-500 ring-offset-1 ring-offset-zinc-950"
          : "";

    const bgStyle = isListening
        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
        : isError
          ? "bg-rose-600/80 hover:bg-rose-600 text-white"
          : isUnsupported
            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200";

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                type="button"
                onClick={onToggle}
                disabled={disabled || isUnsupported || isProcessing}
                aria-label={labelMap[status]}
                aria-pressed={isListening}
                className={`relative flex size-11 items-center justify-center rounded-full transition-all ${bgStyle} ${ringStyle} disabled:cursor-not-allowed disabled:opacity-50`}
            >
                {/* Pulsing outer ring when listening */}
                {isListening && (
                    <span className="absolute size-14 animate-ping rounded-full bg-emerald-500/25" />
                )}

                {isProcessing ? (
                    <Loader2 className="size-5 animate-spin" />
                ) : isListening ? (
                    <Mic className="size-5" />
                ) : isUnsupported ? (
                    <MicOff className="size-5" />
                ) : (
                    <Mic className="size-5" />
                )}
            </button>

            <Waveform
                audioLevel={audioLevel}
                isActive={isListening}
                barCount={12}
            />

            <span className="text-[10px] font-medium text-zinc-400">
                {labelMap[status]}
            </span>
        </div>
    );
}
