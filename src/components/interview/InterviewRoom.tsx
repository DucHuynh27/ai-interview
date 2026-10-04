"use client";

import { PREVIEW_SESSION_KEY } from "@/components/interview/SetupForm";
import { Badge } from "@/components/ui/badge";
import type {
    InterviewQuestion,
    InterviewSessionData,
    PersonaType,
    QuestionCategory,
} from "@/types/interview";
import {
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ClosedCaption,
    Compass,
    Flame,
    HeartHandshake,
    Info,
    ListCollapse,
    Mic,
    MicOff,
    PhoneOff,
    Sparkles,
    Terminal,
    User,
    Video,
    VideoOff,
    Volume2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ─── Default Mock Data (Fallback khi vào thẳng link phòng) ───────────────────

const MOCK_QUESTIONS: InterviewQuestion[] = [
    {
        order: 1,
        category: "WARM_UP",
        questionVi:
            "Chào bạn, rất vui được gặp bạn trong buổi phỏng vấn hôm nay. Bạn hãy giới thiệu đôi nét về bản thân và chia sẻ lý do bạn ứng tuyển vị trí này?",
        questionEn:
            "Hello, welcome to our interview today. Could you briefly introduce yourself and tell us what motivated you to apply for this role?",
        targetGoal:
            "Đánh giá phong thái tự tin, khả năng tóm tắt bản thân ngắn gọn và mức độ nhiệt huyết đối với vị trí.",
    },
    {
        order: 2,
        category: "BEHAVIORAL_STAR",
        questionVi:
            "Hãy chia sẻ về một lần bạn gặp bất đồng ý kiến hoặc mâu thuẫn chuyên môn với đồng nghiệp trong nhóm. Bạn đã giải quyết tình huống đó như thế nào?",
        questionEn:
            "Can you tell me about a time you experienced a disagreement or technical conflict with a team member? How did you resolve it?",
        targetGoal:
            "Đánh giá kỹ năng giao tiếp, thái độ lắng nghe và năng lực xử lý xung đột mang tính xây dựng theo khung STAR.",
    },
    {
        order: 3,
        category: "BEHAVIORAL_STAR",
        questionVi:
            "Bạn đã từng phải đối mặt với một deadline rất gấp hoặc một sự cố bất ngờ trong dự án chưa? Bạn đã sắp xếp ưu tiên và hành động ra sao?",
        questionEn:
            "Have you ever faced a critical deadline or an unexpected roadblock during a project? How did you prioritize tasks and act?",
        targetGoal:
            "Đánh giá khả năng chịu áp lực, tư duy linh hoạt và kỹ năng quản lý thời gian thực chiến.",
    },
    {
        order: 4,
        category: "ROLE_SPECIFIC",
        questionVi:
            "Trong các dự án gần đây được nêu trong CV, bài toán kỹ thuật phức tạp nhất mà bạn trực tiếp thiết kế hoặc tối ưu là gì? Kết quả cụ thể đạt được ra sao?",
        questionEn:
            "Among your recent projects in your CV, what was the most complex technical challenge you personally tackled? What were the measurable results?",
        targetGoal:
            "Đào sâu vào năng lực chuyên môn thực tế, chiều sâu giải pháp và khả năng chứng minh kết quả định lượng.",
    },
    {
        order: 5,
        category: "SITUATIONAL",
        questionVi:
            "Nếu bạn nhận thấy một yêu cầu tính năng từ cấp trên có thể gây sụt giảm hiệu năng hoặc ảnh hưởng trải nghiệm người dùng, bạn sẽ phản hồi và xử lý thế nào?",
        questionEn:
            "If you found that a requested feature could severely degrade system performance or user experience, how would you address and resolve this with leadership?",
        targetGoal:
            "Đánh giá tư duy phản biện, tinh thần trách nhiệm với sản phẩm và kỹ năng đề xuất giải pháp thay thế.",
    },
];

const DEFAULT_MOCK_SESSION: InterviewSessionData = {
    sessionId: "demo-session",
    persona: "friendly_hr",
    language: "vi",
    data: {
        summary: {
            extractedSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
            identifiedGaps: ["Kinh nghiệm tối ưu hệ thống lớn"],
        },
        questions: MOCK_QUESTIONS,
    },
};

// ─── Persona Visual Configuration ───────────────────────────────────────────

interface PersonaPresentation {
    name: string;
    title: string;
    styleTag: string;
    avatarColor: string;
    borderColor: string;
    badgeStyle: string;
    glowStyle: string;
    icon: typeof HeartHandshake;
}

const PERSONA_CONFIGS: Record<PersonaType, PersonaPresentation> = {
    friendly_hr: {
        name: "Mai Anh",
        title: "Senior Talent Acquisition Specialist",
        styleTag: "Thân thiện & Khích lệ",
        avatarColor: "from-emerald-500 to-teal-700",
        borderColor: "border-emerald-500/50",
        badgeStyle: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        glowStyle: "shadow-emerald-500/25",
        icon: HeartHandshake,
    },
    challenging_manager: {
        name: "Tuấn Vũ",
        title: "Engineering Delivery Director",
        styleTag: "Stress Test & Đào sâu",
        avatarColor: "from-rose-500 to-amber-700",
        borderColor: "border-rose-500/50",
        badgeStyle: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        glowStyle: "shadow-rose-500/25",
        icon: Flame,
    },
    tech_lead: {
        name: "Minh Quân",
        title: "Principal Software Architect",
        styleTag: "Thực chiến & Chuyên môn",
        avatarColor: "from-indigo-500 to-sky-700",
        borderColor: "border-indigo-500/50",
        badgeStyle: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        glowStyle: "shadow-indigo-500/25",
        icon: Terminal,
    },
};

const CATEGORY_NAMES: Record<QuestionCategory, string> = {
    WARM_UP: "Khởi động",
    BEHAVIORAL_STAR: "STAR Hành vi",
    ROLE_SPECIFIC: "Chuyên môn",
    SITUATIONAL: "Tình huống",
};

const CATEGORY_BADGES: Record<QuestionCategory, string> = {
    WARM_UP: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    BEHAVIORAL_STAR: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    ROLE_SPECIFIC: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    SITUATIONAL: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

type AiState = "speaking" | "listening" | "thinking";

interface InterviewRoomProps {
    sessionId: string;
}

export function InterviewRoom({ sessionId }: InterviewRoomProps) {
    // ─── Session State ────────────────────────────────────────────────────────
    const [sessionData, setSessionData] =
        useState<InterviewSessionData>(DEFAULT_MOCK_SESSION);
    const [isDemoFallback, setIsDemoFallback] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // ─── Room Controls & Hardware Simulation ──────────────────────────────────
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [showCaptions, setShowCaptions] = useState(true);
    const [showBilingual, setShowBilingual] = useState(false);
    const [showGoalHint, setShowGoalHint] = useState(false);
    const [showQuestionDrawer, setShowQuestionDrawer] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);

    // ─── AI Persona State (Speaking / Listening / Thinking) ───────────────────
    const [aiState, setAiState] = useState<AiState>("speaking");

    // ─── Live Timer (Elapsed time) ────────────────────────────────────────────
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // ─── Candidate Camera Video Feed ──────────────────────────────────────────
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    // Load session data from sessionStorage or fallback
    useEffect(() => {
        const raw = sessionStorage.getItem(
            `${PREVIEW_SESSION_KEY}:${sessionId}`,
        );

        queueMicrotask(() => {
            if (raw) {
                try {
                    const parsed = JSON.parse(raw) as InterviewSessionData;
                    setSessionData(parsed);
                    setIsDemoFallback(false);
                    return;
                } catch {
                    // fallback below
                }
            }

            setSessionData({
                ...DEFAULT_MOCK_SESSION,
                sessionId,
            });
            setIsDemoFallback(true);
        });
    }, [sessionId]);

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Camera hardware stream setup
    useEffect(() => {
        if (!isCameraOn) {
            return;
        }

        let activeStream: MediaStream | null = null;
        const videoElement = videoRef.current;

        navigator.mediaDevices
            ?.getUserMedia({ video: true, audio: false })
            .then((stream) => {
                activeStream = stream;
                if (videoElement) {
                    videoElement.srcObject = stream;
                }
                setCameraStream(stream);
            })
            .catch(() => {
                setCameraStream(null);
            });

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach((track) => track.stop());
            }
            if (videoElement) {
                videoElement.srcObject = null;
            }
        };
    }, [isCameraOn]);

    const questions = sessionData.data.questions || MOCK_QUESTIONS;
    const currentQuestion = questions[currentQuestionIndex] || questions[0];
    const totalQuestions = questions.length;
    const persona = sessionData.persona;
    const personaMeta = PERSONA_CONFIGS[persona] || PERSONA_CONFIGS.friendly_hr;
    const PersonaIcon = personaMeta.icon;
    const isEnglishSession = sessionData.language === "en";

    const formatTimer = (totalSecs: number) => {
        const mins = Math.floor(totalSecs / 60)
            .toString()
            .padStart(2, "0");
        const secs = (totalSecs % 60).toString().padStart(2, "0");
        return `${mins}:${secs}`;
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setAiState("speaking");
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
            setAiState("speaking");
        }
    };

    const handleSelectQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
        setShowQuestionDrawer(false);
        setAiState("speaking");
    };

    const isCameraActive = isCameraOn && cameraStream !== null;

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-zinc-950 font-sans text-zinc-100 select-none">
            {/* ─── Top Header: Meeting Room Status & Question Progress ────────── */}
            <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-4 backdrop-blur-md sm:px-6">
                {/* Left: Meeting Branding & Persona Info */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="relative flex size-2.5">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex size-2.5 rounded-full bg-rose-500" />
                        </span>
                        <span className="font-mono text-xs font-semibold tabular-nums tracking-wider text-rose-400">
                            REC {formatTimer(elapsedSeconds)}
                        </span>
                    </div>

                    <div className="hidden h-4 w-px bg-zinc-800 sm:block" />

                    <div className="hidden items-center gap-2 sm:flex">
                        <span className="text-xs font-medium text-zinc-400">
                            Phòng phỏng vấn:
                        </span>
                        <div
                            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${personaMeta.badgeStyle}`}
                        >
                            <PersonaIcon className="size-3" />
                            <span>{personaMeta.name}</span>
                            <span className="text-zinc-500">·</span>
                            <span className="text-[11px] font-normal">
                                {personaMeta.styleTag}
                            </span>
                        </div>
                    </div>

                    {isDemoFallback && (
                        <Badge
                            variant="outline"
                            className="hidden border-amber-500/40 bg-amber-500/10 text-[10px] text-amber-300 md:inline-flex"
                        >
                            Chế độ mô phỏng
                        </Badge>
                    )}
                </div>

                {/* Center: 5 Questions Progress Steps */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {questions.map((q, idx) => {
                        const isDone = idx < currentQuestionIndex;
                        const isCurrent = idx === currentQuestionIndex;

                        return (
                            <button
                                key={q.order}
                                type="button"
                                onClick={() => handleSelectQuestion(idx)}
                                title={`Câu ${idx + 1}: ${CATEGORY_NAMES[q.category]}`}
                                className={`group relative flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-all ${
                                    isCurrent
                                        ? "bg-zinc-100 text-zinc-950 shadow-md ring-2 ring-primary/60 scale-105"
                                        : isDone
                                          ? "border border-zinc-700 bg-zinc-900/90 text-zinc-300 hover:border-zinc-500"
                                          : "border border-zinc-800/80 bg-zinc-950/60 text-zinc-500 hover:text-zinc-300"
                                }`}
                            >
                                {isDone ? (
                                    <Check className="size-3 text-emerald-400" />
                                ) : (
                                    <span className="font-mono text-[11px]">
                                        {idx + 1}
                                    </span>
                                )}
                                <span className="hidden text-[11px] font-medium lg:inline">
                                    {CATEGORY_NAMES[q.category]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Right: Drawer Toggle & Exit Button */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowQuestionDrawer((prev) => !prev)}
                        className={`flex size-9 items-center justify-center rounded-lg border text-zinc-400 transition-colors ${
                            showQuestionDrawer
                                ? "border-zinc-600 bg-zinc-800 text-zinc-100"
                                : "border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                        title="Danh sách câu hỏi"
                    >
                        <ListCollapse className="size-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowLeaveDialog(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-rose-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-rose-600"
                    >
                        <PhoneOff className="size-3.5" />
                        <span className="hidden sm:inline">Rời phòng</span>
                    </button>
                </div>
            </header>

            {/* ─── Main Meeting Stage: AI Video + Candidate PiP + Subtitles ────── */}
            <main className="relative flex flex-1 items-center justify-center overflow-hidden p-3 sm:p-5">
                {/* AI Interviewer Video Stage */}
                <div className="relative flex size-full max-w-6xl flex-col items-center justify-center rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 p-6 shadow-2xl overflow-hidden">
                    {/* Ambient Stage Lighting Glow based on Persona */}
                    <div
                        className={`pointer-events-none absolute -top-40 size-96 rounded-full bg-gradient-to-b ${personaMeta.avatarColor} opacity-15 blur-3xl`}
                    />

                    {/* AI Interviewer Main Visual / Avatar Presentation */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                        {/* Avatar container with dynamic audio pulsating waves */}
                        <div className="relative mb-5 flex items-center justify-center">
                            {/* Pulsing rings when AI is speaking */}
                            {aiState === "speaking" && (
                                <>
                                    <span className="absolute size-36 animate-ping rounded-full bg-emerald-500/20 duration-1000" />
                                    <span className="absolute size-44 animate-pulse rounded-full border border-emerald-500/30" />
                                    <span className="absolute size-52 animate-pulse rounded-full border border-emerald-500/10" />
                                </>
                            )}

                            {/* Outer avatar ring */}
                            <div
                                className={`relative flex size-32 items-center justify-center rounded-full border-2 bg-gradient-to-tr ${personaMeta.avatarColor} p-1 shadow-2xl transition-all ${personaMeta.borderColor} ${personaMeta.glowStyle}`}
                            >
                                <div className="flex size-full items-center justify-center rounded-full bg-zinc-950/80 backdrop-blur-sm">
                                    <PersonaIcon className="size-14 text-zinc-100" />
                                </div>

                                {/* Active Speaking / Status Dot */}
                                <div className="absolute right-1 bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-zinc-950 bg-emerald-500">
                                    <span className="size-2 rounded-full bg-white" />
                                </div>
                            </div>
                        </div>

                        {/* Name & Title Plate */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-center gap-2">
                                <h2 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">
                                    {personaMeta.name}
                                </h2>
                                <span
                                    className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${personaMeta.badgeStyle}`}
                                >
                                    {personaMeta.styleTag}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 font-medium">
                                {personaMeta.title}
                            </p>
                        </div>

                        {/* AI Audio Waveform Visualizer & State Badge */}
                        <div className="mt-4 flex flex-col items-center gap-2">
                            {aiState === "speaking" && (
                                <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                                    <Volume2 className="size-3.5 animate-pulse" />
                                    <span>AI đang đọc câu hỏi...</span>
                                    {/* 12 Animated Waveform Bars */}
                                    <div className="ml-2 flex items-center gap-0.5">
                                        {[14, 22, 10, 26, 18, 28, 16, 22, 12, 24, 18, 14].map(
                                            (h, i) => (
                                                <span
                                                    key={i}
                                                    style={{ height: `${h}px` }}
                                                    className="w-0.5 animate-pulse rounded-full bg-emerald-400"
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {aiState === "listening" && (
                                <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
                                    <span className="relative flex size-2">
                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                        <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
                                    </span>
                                    <span>Đang lắng nghe câu trả lời của bạn...</span>
                                </div>
                            )}

                            {aiState === "thinking" && (
                                <div className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300">
                                    <Sparkles className="size-3.5 animate-spin" />
                                    <span>AI đang phân tích & chuẩn bị phản hồi...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Interviewer Nameplate Tag (Bottom Left) */}
                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/80 px-3 py-1.5 backdrop-blur-md">
                        <div className="flex size-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-zinc-200">
                            {personaMeta.name} (AI Interviewer)
                        </span>
                        <div className="flex size-4 items-center justify-center rounded bg-emerald-500/20 text-emerald-400">
                            <Mic className="size-2.5" />
                        </div>
                    </div>

                    {/* Candidate Video Feed (Picture-in-Picture at Bottom Right) */}
                    <div className="group absolute right-4 bottom-4 z-20 h-36 w-48 sm:h-44 sm:w-60 overflow-hidden rounded-2xl border-2 border-zinc-700/80 bg-zinc-900 shadow-xl transition-all hover:border-zinc-500">
                        {isCameraActive ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="size-full object-cover -scale-x-100"
                            />
                        ) : (
                            <div className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-zinc-900 to-zinc-950 p-3 text-center">
                                <div className="flex size-11 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                                    <User className="size-6" />
                                </div>
                                <span className="text-[11px] font-medium text-zinc-400">
                                    {isCameraOn
                                        ? "Đang kết nối camera..."
                                        : "Camera đã tắt"}
                                </span>
                            </div>
                        )}

                        {/* Candidate Name & Mic Badge */}
                        <div className="absolute right-2 bottom-2 left-2 flex items-center justify-between rounded-lg bg-zinc-950/80 px-2.5 py-1 backdrop-blur-md">
                            <span className="truncate text-[11px] font-medium text-zinc-200">
                                Bạn (Ứng viên)
                            </span>
                            <div
                                className={`flex size-4 items-center justify-center rounded ${
                                    isMicOn
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "bg-rose-500/20 text-rose-400"
                                }`}
                                title={isMicOn ? "Micro đang bật" : "Micro đã tắt"}
                            >
                                {isMicOn ? (
                                    <Mic className="size-2.5" />
                                ) : (
                                    <MicOff className="size-2.5" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── Live Subtitles / Closed Captions ────────────────────── */}
                    {showCaptions && (
                        <div className="absolute bottom-20 sm:bottom-24 left-1/2 z-20 w-[92%] max-w-3xl -translate-x-1/2">
                            <div className="relative rounded-2xl border border-zinc-700/80 bg-zinc-950/85 p-4 shadow-2xl backdrop-blur-xl transition-all sm:p-5">
                                {/* Subtitle Header: Question index, category, toggle bilingual & goal */}
                                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className={`font-semibold text-xs ${CATEGORY_BADGES[currentQuestion.category]}`}
                                        >
                                            {CATEGORY_NAMES[currentQuestion.category]}
                                        </Badge>
                                        <span className="text-xs font-semibold text-zinc-400">
                                            Câu hỏi {currentQuestionIndex + 1}/
                                            {totalQuestions}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowBilingual((prev) => !prev)
                                            }
                                            className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
                                                showBilingual
                                                    ? "bg-zinc-800 text-zinc-100"
                                                    : "text-zinc-400 hover:text-zinc-200"
                                            }`}
                                        >
                                            Song ngữ (VI/EN)
                                        </button>
                                        <span className="text-zinc-700">·</span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowGoalHint((prev) => !prev)
                                            }
                                            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200"
                                        >
                                            <Compass className="size-3" />
                                            <span>Mục tiêu STAR</span>
                                            {showGoalHint ? (
                                                <ChevronUp className="size-3" />
                                            ) : (
                                                <ChevronDown className="size-3" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Primary Question Text */}
                                <div className="space-y-2">
                                    <p className="text-base font-semibold leading-relaxed text-zinc-100 sm:text-lg">
                                        {isEnglishSession
                                            ? currentQuestion.questionEn
                                            : currentQuestion.questionVi}
                                    </p>

                                    {/* Bilingual translation display */}
                                    {showBilingual && (
                                        <p className="border-t border-zinc-800/60 pt-2 text-sm italic leading-relaxed text-zinc-400">
                                            {isEnglishSession
                                                ? currentQuestion.questionVi
                                                : currentQuestion.questionEn}
                                        </p>
                                    )}

                                    {/* Collapsible STAR Goal Hint */}
                                    {showGoalHint && (
                                        <div className="mt-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary-foreground">
                                            <div className="flex items-start gap-2">
                                                <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                                <div>
                                                    <span className="font-bold text-primary">
                                                        Kỳ vọng từ người phỏng vấn:{" "}
                                                    </span>
                                                    <span className="text-zinc-300">
                                                        {currentQuestion.targetGoal}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Questions List Drawer (Slide-out panel) ─────────────── */}
                {showQuestionDrawer && (
                    <aside className="absolute top-0 right-0 z-40 flex h-full w-80 flex-col border-l border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl sm:w-96">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-zinc-100">
                                    Lộ trình 5 câu hỏi
                                </h3>
                                <p className="text-[11px] text-zinc-400">
                                    Bộ câu hỏi cá nhân hóa theo JD & CV
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowQuestionDrawer(false)}
                                className="flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 space-y-2.5 overflow-y-auto py-3">
                            {questions.map((q, idx) => {
                                const isCurrent = idx === currentQuestionIndex;
                                const isDone = idx < currentQuestionIndex;

                                return (
                                    <button
                                        key={q.order}
                                        type="button"
                                        onClick={() => handleSelectQuestion(idx)}
                                        className={`w-full rounded-xl border p-3 text-left transition-all ${
                                            isCurrent
                                                ? "border-primary/60 bg-zinc-900 shadow-md ring-1 ring-primary/40"
                                                : isDone
                                                  ? "border-zinc-800/80 bg-zinc-900/40 opacity-70 hover:opacity-100"
                                                  : "border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/30"
                                        }`}
                                    >
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <span
                                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${CATEGORY_BADGES[q.category]}`}
                                            >
                                                {CATEGORY_NAMES[q.category]}
                                            </span>
                                            <span className="text-[11px] font-mono font-medium text-zinc-400">
                                                {isCurrent
                                                    ? "Đang phỏng vấn"
                                                    : isDone
                                                      ? "Đã xong"
                                                      : `Câu ${idx + 1}`}
                                            </span>
                                        </div>
                                        <p className="line-clamp-2 text-xs font-medium text-zinc-200">
                                            {isEnglishSession
                                                ? q.questionEn
                                                : q.questionVi}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="border-t border-zinc-800 pt-3">
                            <p className="text-center text-[11px] text-zinc-500">
                                Persona: {personaMeta.name} ({personaMeta.title})
                            </p>
                        </div>
                    </aside>
                )}
            </main>

            {/* ─── Bottom Meeting Control Bar (Dock) ───────────────────────────── */}
            <footer className="z-30 flex h-20 shrink-0 items-center justify-between border-t border-zinc-800/80 bg-zinc-950/90 px-4 backdrop-blur-md sm:px-6">
                {/* Left: Quick Simulation State switchers for testing */}
                <div className="flex items-center gap-1.5">
                    <span className="hidden text-[11px] font-medium text-zinc-500 lg:inline">
                        Trạng thái AI:
                    </span>
                    <button
                        type="button"
                        onClick={() => setAiState("speaking")}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                            aiState === "speaking"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                        }`}
                    >
                        Nói
                    </button>
                    <button
                        type="button"
                        onClick={() => setAiState("listening")}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                            aiState === "listening"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                        }`}
                    >
                        Nghe
                    </button>
                    <button
                        type="button"
                        onClick={() => setAiState("thinking")}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                            aiState === "thinking"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                        }`}
                    >
                        Nghĩ
                    </button>
                </div>

                {/* Center: Meeting Hardware Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Mic toggle */}
                    <button
                        type="button"
                        onClick={() => setIsMicOn((prev) => !prev)}
                        className={`flex size-11 items-center justify-center rounded-2xl border transition-all ${
                            isMicOn
                                ? "border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                                : "border-rose-500/50 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                        }`}
                        title={isMicOn ? "Tắt Micro" : "Bật Micro"}
                    >
                        {isMicOn ? (
                            <Mic className="size-5" />
                        ) : (
                            <MicOff className="size-5" />
                        )}
                    </button>

                    {/* Camera toggle */}
                    <button
                        type="button"
                        onClick={() => setIsCameraOn((prev) => !prev)}
                        className={`flex size-11 items-center justify-center rounded-2xl border transition-all ${
                            isCameraOn
                                ? "border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                                : "border-rose-500/50 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                        }`}
                        title={isCameraOn ? "Tắt Camera" : "Bật Camera"}
                    >
                        {isCameraOn ? (
                            <Video className="size-5" />
                        ) : (
                            <VideoOff className="size-5" />
                        )}
                    </button>

                    {/* Closed Captions toggle */}
                    <button
                        type="button"
                        onClick={() => setShowCaptions((prev) => !prev)}
                        className={`flex size-11 items-center justify-center rounded-2xl border transition-all ${
                            showCaptions
                                ? "border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                                : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:bg-zinc-900"
                        }`}
                        title={showCaptions ? "Ẩn phụ đề" : "Hiện phụ đề"}
                    >
                        <ClosedCaption className="size-5" />
                    </button>
                </div>

                {/* Right: Question Navigation Controls */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="flex size-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 transition-colors hover:border-zinc-700 disabled:opacity-40"
                        title="Câu trước"
                    >
                        <ChevronLeft className="size-4" />
                    </button>

                    <button
                        type="button"
                        onClick={handleNextQuestion}
                        disabled={currentQuestionIndex === totalQuestions - 1}
                        className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-950 shadow transition-all hover:bg-white disabled:opacity-40"
                    >
                        <span>Câu kế tiếp</span>
                        <ChevronRight className="size-4" />
                    </button>
                </div>
            </footer>

            {/* ─── Leave Room Confirmation Dialog ─────────────────────────────── */}
            {showLeaveDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
                                <PhoneOff className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-zinc-100">
                                    Rời phòng phỏng vấn?
                                </h3>
                                <p className="text-xs text-zinc-400">
                                    Tiến độ phiên phỏng vấn này sẽ được lưu lại.
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Bạn đang ở câu hỏi {currentQuestionIndex + 1}/
                            {totalQuestions}. Bạn có thể xem lại bộ câu hỏi hoặc
                            bắt đầu một phiên phỏng vấn mới.
                        </p>

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowLeaveDialog(false)}
                                className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900"
                            >
                                Tiếp tục phỏng vấn
                            </button>
                            <Link
                                href={`/interview/${sessionId}/preview`}
                                className="rounded-xl bg-zinc-800 px-4 py-2 text-center text-xs font-semibold text-zinc-100 hover:bg-zinc-700"
                            >
                                Xem trước câu hỏi
                            </Link>
                            <Link
                                href="/interview/setup"
                                className="rounded-xl bg-rose-600 px-4 py-2 text-center text-xs font-semibold text-white hover:bg-rose-500"
                            >
                                Thoát về Setup
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
