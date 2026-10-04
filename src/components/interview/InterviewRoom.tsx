"use client";

import { submitCandidateAnswerTurn } from "@/app/actions/interview";
import { PREVIEW_SESSION_KEY } from "@/components/interview/SetupForm";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MicButton } from "@/components/voice/MicButton";
import { useSpeechRecognition } from "@/lib/speech/use-speech-recognition";
import { useSpeechSynthesis } from "@/lib/speech/use-speech-synthesis";
import type {
    CandidateAnswerSubmission,
    InterviewQuestion,
    InterviewSessionData,
    InterviewTranscriptTurn,
    PersonaType,
    QuestionCategory,
    SessionTranscript,
    TurnFeedbackResult,
} from "@/types/interview";
import { TRANSCRIPT_STORAGE_PREFIX } from "@/types/interview";
import {
    AlertCircle,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clock,
    ClosedCaption,
    Compass,
    FileText,
    Flame,
    HeartHandshake,
    Info,
    ListCollapse,
    Mic,
    MicOff,
    Pause,
    PhoneOff,
    Play,
    Send,
    Sparkles,
    Terminal,
    Trophy,
    User,
    Video,
    VideoOff,
    Volume2,
    VolumeX,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

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

const AUTO_ADVANCE_SECONDS = 6;

interface InterviewRoomProps {
    sessionId: string;
}

export function InterviewRoom({ sessionId }: InterviewRoomProps) {
    // ─── Session State ────────────────────────────────────────────────────────
    const [sessionData, setSessionData] =
        useState<InterviewSessionData>(DEFAULT_MOCK_SESSION);
    const [isDemoFallback, setIsDemoFallback] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // ─── Conversation Turns & Transcript State ────────────────────────────────
    const [transcriptTurns, setTranscriptTurns] = useState<
        InterviewTranscriptTurn[]
    >([]);
    const [draftAnswers, setDraftAnswers] = useState<Record<number, string>>(
        {},
    );
    const [activeTurnFeedback, setActiveTurnFeedback] =
        useState<TurnFeedbackResult | null>(null);
    const [countdownSec, setCountdownSec] = useState<number | null>(null);
    const [isPausedCountdown, setIsPausedCountdown] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isPendingSubmit, startSubmitTransition] = useTransition();

    // ─── Completion & Modals ──────────────────────────────────────────────────
    const [isSessionCompleted, setIsSessionCompleted] = useState(false);
    const [showTranscriptModal, setShowTranscriptModal] = useState(false);

    // ─── Room Controls & Hardware ─────────────────────────────────────────────
    const [isMicOn, setIsMicOn] = useState(false);
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

    // ─── Speech-to-Text (Web Speech API) ─────────────────────────────────────
    const {
        status: sttStatus,
        audioLevel,
        start: startListening,
        stop: stopListening,
    } = useSpeechRecognition({
        language: sessionData.language,
        onTranscriptChange: (partialText) => {
            setDraftAnswers((prev) => ({
                ...prev,
                [currentQuestionIndex]: partialText,
            }));
            if (aiState !== "listening") setAiState("listening");
        },
        onFinalResult: (finalText) => {
            setDraftAnswers((prev) => ({
                ...prev,
                [currentQuestionIndex]: finalText,
            }));
            setIsMicOn(false);
        },
    });

    const handleMicToggle = useCallback(() => {
        if (sttStatus === "listening") {
            stopListening();
            setIsMicOn(false);
        } else {
            startListening();
            setIsMicOn(true);
        }
    }, [sttStatus, startListening, stopListening]);

    // ─── Text-to-Speech (Web Speech Synthesis) ────────────────────────────────
    const {
        isMuted: isTtsMuted,
        speak,
        cancel: cancelSpeech,
        replay: replayQuestion,
        toggleMute: toggleTtsMute,
    } = useSpeechSynthesis({
        language: sessionData.language,
        persona: sessionData.persona,
    });

    // Track which question index has already been read aloud to avoid re-firing
    // on unrelated re-renders (e.g. countdown ticks, transcript updates).
    const spokenQuestionIndexRef = useRef<number>(-1);

    // Auto-speak the current question whenever the index advances
    useEffect(() => {
        if (isSessionCompleted) return;
        if (spokenQuestionIndexRef.current === currentQuestionIndex) return;

        // Only speak when it is AI's turn (entering a new question)
        if (aiState !== "speaking") return;

        // Guard: questions may not be loaded yet on first hydration tick
        const sessionQuestions =
            sessionData.data.questions || MOCK_QUESTIONS;
        const question = sessionQuestions[currentQuestionIndex];
        if (!question) return;

        spokenQuestionIndexRef.current = currentQuestionIndex;

        const questionText =
            sessionData.language === "en"
                ? question.questionEn
                : question.questionVi;

        speak(questionText, () => {
            // After AI finishes reading, flip state so candidate can answer
            setAiState("listening");
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestionIndex, aiState, isSessionCompleted, sessionData]);

    // Auto-speak AI feedback after each submitted answer
    const prevFeedbackRef = useRef<string | null>(null);
    useEffect(() => {
        if (!activeTurnFeedback) return;
        if (activeTurnFeedback.fullResponse === prevFeedbackRef.current) return;

        prevFeedbackRef.current = activeTurnFeedback.fullResponse;
        speak(activeTurnFeedback.fullResponse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTurnFeedback]);

    // Cancel TTS whenever the candidate starts typing or speaking (mic on)
    useEffect(() => {
        if (isMicOn || aiState === "listening") {
            cancelSpeech();
        }
    }, [isMicOn, aiState, cancelSpeech]);

    // Load session data and previous transcripts from sessionStorage
    useEffect(() => {
        const rawSession = sessionStorage.getItem(
            `${PREVIEW_SESSION_KEY}:${sessionId}`,
        );

        queueMicrotask(() => {
            if (rawSession) {
                try {
                    const parsed = JSON.parse(
                        rawSession,
                    ) as InterviewSessionData;
                    setSessionData(parsed);
                    setIsDemoFallback(false);
                } catch {
                    setSessionData({ ...DEFAULT_MOCK_SESSION, sessionId });
                    setIsDemoFallback(true);
                }
            } else {
                setSessionData({ ...DEFAULT_MOCK_SESSION, sessionId });
                setIsDemoFallback(true);
            }

            const rawTranscript = sessionStorage.getItem(
                `${TRANSCRIPT_STORAGE_PREFIX}${sessionId}`,
            );
            if (rawTranscript) {
                try {
                    const parsedTranscript = JSON.parse(
                        rawTranscript,
                    ) as SessionTranscript;
                    if (Array.isArray(parsedTranscript.turns)) {
                        setTranscriptTurns(parsedTranscript.turns);
                        if (parsedTranscript.isCompleted) {
                            setIsSessionCompleted(true);
                        }
                    }
                } catch {
                    // Ignore corrupted transcript cache
                }
            }
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

        let isCancelled = false;
        let activeStream: MediaStream | null = null;
        const videoElement = videoRef.current;

        navigator.mediaDevices
            ?.getUserMedia({ video: true, audio: false })
            .then((stream) => {
                if (isCancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                activeStream = stream;
                if (videoElement) {
                    videoElement.srcObject = stream;
                }
                setCameraStream(stream);
            })
            .catch(() => {
                if (!isCancelled) {
                    setCameraStream(null);
                }
            });

        return () => {
            isCancelled = true;
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

    // Completed turn for the currently selected question (if previously answered)
    const existingTurnForCurrent = transcriptTurns.find(
        (t) => t.questionIndex === currentQuestionIndex,
    );

    const formatTimer = (totalSecs: number) => {
        const mins = Math.floor(totalSecs / 60)
            .toString()
            .padStart(2, "0");
        const secs = (totalSecs % 60).toString().padStart(2, "0");
        return `${mins}:${secs}`;
    };

    const handleSelectQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
        setShowQuestionDrawer(false);
        setActiveTurnFeedback(null);
        setCountdownSec(null);
        setSubmitError(null);
        setAiState("speaking");
    };

    const handleAdvanceNext = useCallback(() => {
        setCountdownSec(null);
        setActiveTurnFeedback(null);
        setSubmitError(null);

        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setAiState("speaking");
        } else {
            setIsSessionCompleted(true);
        }
    }, [currentQuestionIndex, totalQuestions]);

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
            setActiveTurnFeedback(null);
            setCountdownSec(null);
            setSubmitError(null);
            setAiState("speaking");
        }
    };

    // Auto-advance countdown timer effect
    useEffect(() => {
        if (countdownSec === null || isPausedCountdown) {
            return;
        }

        const timer = setTimeout(() => {
            if (countdownSec <= 1) {
                handleAdvanceNext();
            } else {
                setCountdownSec((prev) => (prev !== null ? prev - 1 : null));
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdownSec, isPausedCountdown, handleAdvanceNext]);

    // Handle candidate answering current question
    const handleAnswerInputChange = (val: string) => {
        setDraftAnswers((prev) => ({
            ...prev,
            [currentQuestionIndex]: val,
        }));
        if (aiState !== "listening") {
            setAiState("listening");
        }
    };

    const handleSubmitAnswer = () => {
        const candidateAnswer = (
            draftAnswers[currentQuestionIndex] ?? ""
        ).trim();

        if (candidateAnswer.length < 5) {
            setSubmitError("Vui lòng trả lời chi tiết hơn (ít nhất 5 ký tự).");
            return;
        }

        setSubmitError(null);
        setAiState("thinking");

        const isFinalQuestion = currentQuestionIndex === totalQuestions - 1;
        const currentQuestionText = isEnglishSession
            ? currentQuestion.questionEn
            : currentQuestion.questionVi;

        const submissionPayload: CandidateAnswerSubmission = {
            sessionId,
            questionIndex: currentQuestionIndex,
            questionText: currentQuestionText,
            category: currentQuestion.category,
            candidateAnswer,
            persona,
            language: sessionData.language,
            targetGoal: currentQuestion.targetGoal,
            isFinalQuestion,
        };

        startSubmitTransition(async () => {
            const res = await submitCandidateAnswerTurn(submissionPayload);

            if (!res.ok) {
                setSubmitError(res.error);
                setAiState("listening");
                return;
            }

            const feedbackData = res.data;
            setActiveTurnFeedback(feedbackData);
            setAiState("speaking");

            const newTurn: InterviewTranscriptTurn = {
                questionIndex: currentQuestionIndex,
                questionText: currentQuestionText,
                category: currentQuestion.category,
                candidateAnswer,
                interviewerFeedback: feedbackData.fullResponse,
                answeredAt: new Date().toLocaleTimeString("vi-VN"),
            };

            const updatedTurns = [
                ...transcriptTurns.filter(
                    (t) => t.questionIndex !== currentQuestionIndex,
                ),
                newTurn,
            ].sort((a, b) => a.questionIndex - b.questionIndex);

            setTranscriptTurns(updatedTurns);

            // Persist entire transcript to sessionStorage for Sprint 4 evaluation
            const sessionTranscript: SessionTranscript = {
                sessionId,
                persona,
                language: sessionData.language,
                turns: updatedTurns,
                isCompleted: isFinalQuestion,
                completedAt: isFinalQuestion
                    ? new Date().toISOString()
                    : undefined,
            };

            sessionStorage.setItem(
                `${TRANSCRIPT_STORAGE_PREFIX}${sessionId}`,
                JSON.stringify(sessionTranscript),
            );

            if (isFinalQuestion) {
                setIsSessionCompleted(true);
            } else {
                setCountdownSec(AUTO_ADVANCE_SECONDS);
                setIsPausedCountdown(false);
            }
        });
    };

    const isCameraActive = isCameraOn && cameraStream !== null;
    const currentDraftAnswer = draftAnswers[currentQuestionIndex] ?? "";
    const wordCount = currentDraftAnswer
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

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
                        const isDone = transcriptTurns.some(
                            (t) => t.questionIndex === idx,
                        );
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
                                          ? "border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:border-emerald-500"
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

                {/* Right: Drawer Toggle, Transcript & Exit Button */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowTranscriptModal(true)}
                        className="flex size-9 items-center justify-center rounded-lg border border-zinc-800/80 bg-zinc-900/50 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                        title="Xem toàn bộ transcript"
                    >
                        <FileText className="size-4" />
                    </button>

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

            {/* ─── Main Meeting Stage: AI Video + Candidate PiP + Subtitles / Text Input ── */}
            <main className="relative flex flex-1 items-center justify-center overflow-hidden p-3 sm:p-5">
                {/* AI Interviewer Video Stage */}
                <div className="relative flex size-full max-w-6xl flex-col items-center justify-center rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 p-6 shadow-2xl overflow-hidden">
                    {/* Ambient Stage Lighting Glow based on Persona */}
                    <div
                        className={`pointer-events-none absolute -top-40 size-96 rounded-full bg-gradient-to-b ${personaMeta.avatarColor} opacity-15 blur-3xl`}
                    />

                    {/* Candidate Video Feed (Picture-in-Picture at Top Right) */}
                    <div className="group absolute top-4 right-4 z-20 h-28 w-40 sm:h-36 sm:w-52 overflow-hidden rounded-2xl border-2 border-zinc-700/80 bg-zinc-900 shadow-xl transition-all hover:border-zinc-500">
                        {isCameraActive ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="size-full object-cover -scale-x-100"
                            />
                        ) : (
                            <div className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-zinc-900 to-zinc-950 p-2 text-center">
                                <div className="flex size-9 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                                    <User className="size-5" />
                                </div>
                                <span className="text-[10px] font-medium text-zinc-400">
                                    {isCameraOn
                                        ? "Đang kết nối camera..."
                                        : "Camera đã tắt"}
                                </span>
                            </div>
                        )}

                        {/* Candidate Name & Mic Badge */}
                        <div className="absolute right-1.5 bottom-1.5 left-1.5 flex items-center justify-between rounded-lg bg-zinc-950/80 px-2 py-0.5 backdrop-blur-md">
                            <span className="truncate text-[10px] font-medium text-zinc-200">
                                Bạn (Ứng viên)
                            </span>
                            <div
                                className={`flex size-3.5 items-center justify-center rounded ${
                                    isMicOn
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "bg-rose-500/20 text-rose-400"
                                }`}
                                title={
                                    isMicOn ? "Micro đang bật" : "Micro đã tắt"
                                }
                            >
                                {isMicOn ? (
                                    <Mic className="size-2" />
                                ) : (
                                    <MicOff className="size-2" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Interviewer Main Visual / Avatar Presentation */}
                    <div className="relative z-10 -mt-10 flex flex-col items-center text-center">
                        {/* Avatar container with dynamic audio pulsating waves */}
                        <div className="relative mb-4 flex items-center justify-center">
                            {/* Pulsing rings when AI is speaking */}
                            {aiState === "speaking" && (
                                <>
                                    <span className="absolute size-32 animate-ping rounded-full bg-emerald-500/20 duration-1000" />
                                    <span className="absolute size-40 animate-pulse rounded-full border border-emerald-500/30" />
                                    <span className="absolute size-48 animate-pulse rounded-full border border-emerald-500/10" />
                                </>
                            )}

                            {/* Outer avatar ring */}
                            <div
                                className={`relative flex size-28 items-center justify-center rounded-full border-2 bg-gradient-to-tr ${personaMeta.avatarColor} p-1 shadow-2xl transition-all ${personaMeta.borderColor} ${personaMeta.glowStyle}`}
                            >
                                <div className="flex size-full items-center justify-center rounded-full bg-zinc-950/80 backdrop-blur-sm">
                                    <PersonaIcon className="size-12 text-zinc-100" />
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
                                <h2 className="text-lg font-bold tracking-tight text-zinc-100 sm:text-xl">
                                    {personaMeta.name}
                                </h2>
                                <span
                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${personaMeta.badgeStyle}`}
                                >
                                    {personaMeta.styleTag}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 font-medium">
                                {personaMeta.title}
                            </p>
                        </div>

                        {/* AI Audio Waveform Visualizer & State Badge */}
                        <div className="mt-3 flex flex-col items-center gap-2">
                            {aiState === "speaking" && (
                                <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                                    <Volume2 className="size-3.5 animate-pulse" />
                                    <span>
                                        {activeTurnFeedback
                                            ? `${personaMeta.name} đang phản hồi...`
                                            : "AI đang đọc câu hỏi..."}
                                    </span>
                                    {/* 10 Animated Waveform Bars */}
                                    <div className="ml-2 flex items-center gap-0.5">
                                        {[
                                            14, 22, 10, 26, 18, 24, 16, 22, 12,
                                            18,
                                        ].map((h, i) => (
                                            <span
                                                key={`bar-${i}`}
                                                style={{ height: `${h}px` }}
                                                className="w-0.5 animate-pulse rounded-full bg-emerald-400"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {aiState === "listening" && (
                                <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
                                    <span className="relative flex size-2">
                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                        <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
                                    </span>
                                    <span>
                                        Đang lắng nghe câu trả lời của bạn...
                                    </span>
                                </div>
                            )}

                            {aiState === "thinking" && (
                                <div className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300">
                                    <Sparkles className="size-3.5 animate-spin" />
                                    <span>
                                        AI đang phân tích & chuẩn bị phản hồi...
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Interviewer Nameplate Tag (Bottom Left) */}
                    <div className="absolute bottom-4 left-4 z-20 hidden items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/80 px-3 py-1.5 backdrop-blur-md sm:flex">
                        <div className="flex size-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-zinc-200">
                            {personaMeta.name} (AI Interviewer)
                        </span>
                        <div className="flex size-4 items-center justify-center rounded bg-emerald-500/20 text-emerald-400">
                            <Mic className="size-2.5" />
                        </div>
                    </div>

                    {/* ─── Main Conversation Panel: Subtitles + Text Input + Turn Feedback ─ */}
                    {showCaptions && (
                        <div className="absolute bottom-3 left-1/2 z-20 w-[94%] max-w-3xl -translate-x-1/2">
                            <div className="relative max-h-[58vh] overflow-y-auto rounded-2xl border border-zinc-700/80 bg-zinc-950/90 p-3.5 shadow-2xl backdrop-blur-xl transition-all sm:p-5">
                                {/* Subtitle Header: Question index, category, toggle bilingual & goal */}
                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className={`font-semibold text-xs ${CATEGORY_BADGES[currentQuestion.category]}`}
                                        >
                                            {
                                                CATEGORY_NAMES[
                                                    currentQuestion.category
                                                ]
                                            }
                                        </Badge>
                                        <span className="text-xs font-semibold text-zinc-400">
                                            Câu hỏi {currentQuestionIndex + 1}/
                                            {totalQuestions}
                                        </span>
                                        {existingTurnForCurrent && (
                                            <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                                                <Check className="size-2.5" />
                                                Đã trả lời
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowBilingual(
                                                    (prev) => !prev,
                                                )
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
                                <div className="space-y-1.5">
                                    <p className="text-sm font-semibold leading-relaxed text-zinc-100 sm:text-base">
                                        {isEnglishSession
                                            ? currentQuestion.questionEn
                                            : currentQuestion.questionVi}
                                    </p>

                                    {/* Bilingual translation display */}
                                    {showBilingual && (
                                        <p className="border-t border-zinc-800/60 pt-1.5 text-xs italic leading-relaxed text-zinc-400">
                                            {isEnglishSession
                                                ? currentQuestion.questionVi
                                                : currentQuestion.questionEn}
                                        </p>
                                    )}

                                    {/* Collapsible STAR Goal Hint */}
                                    {showGoalHint && (
                                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-xs text-primary-foreground">
                                            <div className="flex items-start gap-2">
                                                <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                                <div>
                                                    <span className="font-bold text-primary">
                                                        Kỳ vọng từ người phỏng
                                                        vấn:{" "}
                                                    </span>
                                                    <span className="text-zinc-300">
                                                        {
                                                            currentQuestion.targetGoal
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ─── Active Turn Feedback from AI (After Candidate Submits) ── */}
                                {activeTurnFeedback ? (
                                    <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 backdrop-blur-md">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`flex size-6 items-center justify-center rounded-full bg-gradient-to-tr ${personaMeta.avatarColor} text-white shadow`}
                                                >
                                                    <PersonaIcon className="size-3.5" />
                                                </div>
                                                <span className="text-xs font-bold text-zinc-100">
                                                    {personaMeta.name} (Phản
                                                    hồi)
                                                </span>
                                                <span
                                                    className={`rounded-full border px-1.5 py-0.2 text-[10px] font-semibold ${personaMeta.badgeStyle}`}
                                                >
                                                    {personaMeta.styleTag}
                                                </span>
                                            </div>

                                            {countdownSec !== null && (
                                                <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
                                                    <Clock className="size-3" />
                                                    <span className="text-[11px] font-medium">
                                                        Chuyển câu sau{" "}
                                                        {countdownSec}s
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-xs sm:text-sm font-medium leading-relaxed text-zinc-200">
                                            {activeTurnFeedback.acknowledgment}
                                        </p>
                                        <p className="mt-1.5 border-t border-zinc-800/80 pt-1.5 text-xs italic leading-relaxed text-zinc-400">
                                            {activeTurnFeedback.transition}
                                        </p>

                                        <div className="mt-3 flex items-center justify-between pt-1">
                                            {countdownSec !== null ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setIsPausedCountdown(
                                                            (prev) => !prev,
                                                        )
                                                    }
                                                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200"
                                                >
                                                    {isPausedCountdown ? (
                                                        <Play className="size-3 text-emerald-400" />
                                                    ) : (
                                                        <Pause className="size-3 text-amber-400" />
                                                    )}
                                                    <span>
                                                        {isPausedCountdown
                                                            ? "Tiếp tục đếm ngược"
                                                            : "Tạm dừng đếm ngược"}
                                                    </span>
                                                </button>
                                            ) : (
                                                <span />
                                            )}

                                            {currentQuestionIndex ===
                                            totalQuestions - 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setIsSessionCompleted(
                                                            true,
                                                        )
                                                    }
                                                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
                                                >
                                                    <Trophy className="size-3.5" />
                                                    <span>
                                                        Hoàn thành phỏng vấn
                                                    </span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleAdvanceNext}
                                                    className="flex items-center gap-1 rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 shadow-sm transition-colors hover:bg-white"
                                                >
                                                    <span>
                                                        Sang câu tiếp theo
                                                    </span>
                                                    <ChevronRight className="size-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : existingTurnForCurrent ? (
                                    /* ─── Previously Answered Question Review View ──────────────── */
                                    <div className="mt-3 space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-zinc-300">
                                                Câu trả lời đã lưu của bạn:
                                            </span>
                                            <span className="text-[10px] text-zinc-500">
                                                {
                                                    existingTurnForCurrent.answeredAt
                                                }
                                            </span>
                                        </div>
                                        <p className="rounded-lg bg-zinc-950/60 p-2 text-xs leading-relaxed text-zinc-200">
                                            {
                                                existingTurnForCurrent.candidateAnswer
                                            }
                                        </p>
                                        <div className="border-t border-zinc-800 pt-2">
                                            <span className="text-[11px] font-bold text-emerald-400">
                                                Phản hồi từ {personaMeta.name}:
                                            </span>
                                            <p className="mt-1 text-xs italic leading-relaxed text-zinc-300">
                                                {
                                                    existingTurnForCurrent.interviewerFeedback
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    /* ─── Candidate Text Input Form (Turn-based Answer Loop) ────── */
                                    <div className="mt-2.5 space-y-2 border-t border-zinc-800/80 pt-2.5">
                                        <div className="relative">
                                            <Textarea
                                                value={currentDraftAnswer}
                                                onChange={(e) =>
                                                    handleAnswerInputChange(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={
                                                    isEnglishSession
                                                        ? "Type your answer here using the STAR approach (Situation - Task - Action - Result)..."
                                                        : "Gõ câu trả lời của bạn theo phương pháp STAR (Bối cảnh - Nhiệm vụ - Hành động - Kết quả)..."
                                                }
                                                rows={3}
                                                disabled={isPendingSubmit}
                                                className="resize-none border-zinc-700/80 bg-zinc-900/90 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500"
                                                onKeyDown={(e) => {
                                                    if (
                                                        (e.metaKey ||
                                                            e.ctrlKey) &&
                                                        e.key === "Enter"
                                                    ) {
                                                        e.preventDefault();
                                                        handleSubmitAnswer();
                                                    }
                                                }}
                                            />
                                        </div>

                                        {submitError && (
                                            <div className="flex items-center gap-1.5 text-xs text-rose-400">
                                                <AlertCircle className="size-3.5 shrink-0" />
                                                <span>{submitError}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                                                <span className="hidden sm:inline">
                                                    Phím tắt:
                                                </span>
                                                <kbd className="rounded border border-zinc-700 bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                                                    Ctrl + Enter
                                                </kbd>
                                                <span className="text-zinc-600">
                                                    ·
                                                </span>
                                                <span>{wordCount} từ</span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <MicButton
                                                    status={sttStatus}
                                                    audioLevel={audioLevel}
                                                    onToggle={handleMicToggle}
                                                    disabled={isPendingSubmit}
                                                    language={
                                                        sessionData.language
                                                    }
                                                />

                                                <button
                                                    type="button"
                                                    onClick={handleSubmitAnswer}
                                                    disabled={
                                                        isPendingSubmit ||
                                                        currentDraftAnswer.trim()
                                                            .length === 0
                                                    }
                                                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {isPendingSubmit ? (
                                                        <>
                                                            <Sparkles className="size-3.5 animate-spin" />
                                                            <span>
                                                                AI đang suy
                                                                nghĩ...
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>
                                                                Gửi câu trả lời
                                                            </span>
                                                            <Send className="size-3.5" />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                    Đã hoàn thành {transcriptTurns.length}/
                                    {totalQuestions} câu hỏi
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
                                const isDone = transcriptTurns.some(
                                    (t) => t.questionIndex === idx,
                                );

                                return (
                                    <button
                                        key={q.order}
                                        type="button"
                                        onClick={() =>
                                            handleSelectQuestion(idx)
                                        }
                                        className={`w-full rounded-xl border p-3 text-left transition-all ${
                                            isCurrent
                                                ? "border-primary/60 bg-zinc-900 shadow-md ring-1 ring-primary/40"
                                                : isDone
                                                  ? "border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500/60"
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
                                                {isDone ? (
                                                    <span className="text-emerald-400 flex items-center gap-1">
                                                        <Check className="size-3" />{" "}
                                                        Đã trả lời
                                                    </span>
                                                ) : isCurrent ? (
                                                    "Đang phỏng vấn"
                                                ) : (
                                                    `Câu ${idx + 1}`
                                                )}
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
                                Persona: {personaMeta.name} ({personaMeta.title}
                                )
                            </p>
                        </div>
                    </aside>
                )}
            </main>

            {/* ─── Bottom Meeting Control Bar (Dock) ───────────────────────────── */}
            <footer className="z-30 flex h-20 shrink-0 items-center justify-between border-t border-zinc-800/80 bg-zinc-950/90 px-4 backdrop-blur-md sm:px-6">
                {/* Left: Dynamic AI State Indicator */}
                <div className="flex items-center gap-2">
                    <span className="hidden text-[11px] font-medium text-zinc-500 md:inline">
                        Trạng thái:
                    </span>
                    {aiState === "speaking" && (
                        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>AI đang nói</span>
                        </div>
                    )}
                    {aiState === "listening" && (
                        <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                            <span className="size-2 rounded-full bg-amber-400 animate-ping" />
                            <span>Đang lắng nghe</span>
                        </div>
                    )}
                    {aiState === "thinking" && (
                        <div className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-300">
                            <Sparkles className="size-3 animate-spin" />
                            <span>Đang suy nghĩ</span>
                        </div>
                    )}
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

                    {/* AI Voice: Replay question */}
                    <button
                        type="button"
                        onClick={replayQuestion}
                        className="hidden sm:flex size-11 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 text-zinc-100 transition-all hover:bg-zinc-800"
                        title="Nghe lại câu hỏi"
                    >
                        <Volume2 className="size-5" />
                    </button>

                    {/* AI Voice: Mute/Unmute toggle */}
                    <button
                        type="button"
                        onClick={toggleTtsMute}
                        className={`flex size-11 items-center justify-center rounded-2xl border transition-all ${
                            isTtsMuted
                                ? "border-rose-500/50 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                                : "border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                        }`}
                        title={isTtsMuted ? "Bật giọng AI" : "Tắt giọng AI"}
                    >
                        {isTtsMuted ? (
                            <VolumeX className="size-5" />
                        ) : (
                            <Volume2 className="size-5" />
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

                    {/* Full Transcript view */}
                    <button
                        type="button"
                        onClick={() => setShowTranscriptModal(true)}
                        className="hidden sm:flex size-11 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 text-zinc-100 transition-all hover:bg-zinc-800"
                        title="Bản ghi đối thoại"
                    >
                        <FileText className="size-5" />
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
                        onClick={handleAdvanceNext}
                        disabled={currentQuestionIndex === totalQuestions - 1}
                        className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-950 shadow transition-all hover:bg-white disabled:opacity-40"
                    >
                        <span>Câu kế tiếp</span>
                        <ChevronRight className="size-4" />
                    </button>
                </div>
            </footer>

            {/* ─── Interview Completion Dialog ─────────────────────────────────── */}
            {isSessionCompleted && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
                    <div className="w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-zinc-950 p-6 shadow-2xl">
                        <div className="mb-5 flex flex-col items-center text-center">
                            <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-8 ring-emerald-500/10">
                                <Trophy className="size-7" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-zinc-100">
                                Hoàn thành buổi phỏng vấn!
                            </h3>
                            <p className="mt-1 text-xs text-zinc-400">
                                Bạn đã hoàn thành xuất sắc{" "}
                                {transcriptTurns.length}/{totalQuestions} câu
                                hỏi cùng {personaMeta.name}.
                            </p>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="mb-6 grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                                <span className="text-[11px] text-zinc-400">
                                    Thời gian phỏng vấn
                                </span>
                                <p className="mt-0.5 text-base font-bold font-mono text-zinc-100">
                                    {formatTimer(elapsedSeconds)}
                                </p>
                            </div>
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                                <span className="text-[11px] text-zinc-400">
                                    Câu hỏi đã trả lời
                                </span>
                                <p className="mt-0.5 text-base font-bold text-emerald-400">
                                    {transcriptTurns.length}/{totalQuestions}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSessionCompleted(false);
                                    setShowTranscriptModal(true);
                                }}
                                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-center text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
                            >
                                Xem lại Transcript
                            </button>
                            <Link
                                href={`/interview/${sessionId}/result`}
                                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-center text-xs font-bold text-white shadow-lg transition-all hover:bg-emerald-500"
                            >
                                <span>Xem báo cáo đánh giá STAR</span>
                                <ChevronRight className="size-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Full Transcript Review Modal ───────────────────────────────── */}
            {showTranscriptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
                    <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <FileText className="size-5 text-emerald-400" />
                                <div>
                                    <h3 className="text-base font-bold text-zinc-100">
                                        Bản ghi phỏng vấn (Transcript)
                                    </h3>
                                    <p className="text-xs text-zinc-400">
                                        Chi tiết các câu hỏi và câu trả lời
                                        trong phiên này
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowTranscriptModal(false)}
                                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto p-6">
                            {transcriptTurns.length === 0 ? (
                                <p className="py-8 text-center text-xs text-zinc-500">
                                    Chưa có câu trả lời nào được ghi nhận. Hãy
                                    bắt đầu trả lời câu hỏi!
                                </p>
                            ) : (
                                transcriptTurns.map((turn) => (
                                    <div
                                        key={turn.questionIndex}
                                        className="space-y-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${CATEGORY_BADGES[turn.category]}`}
                                            >
                                                Câu {turn.questionIndex + 1}:{" "}
                                                {CATEGORY_NAMES[turn.category]}
                                            </span>
                                            <span className="text-[10px] text-zinc-500">
                                                {turn.answeredAt}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-zinc-200">
                                            {turn.questionText}
                                        </p>
                                        <div className="rounded-xl bg-zinc-950/70 p-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                                Ứng viên trả lời:
                                            </span>
                                            <p className="mt-1 text-xs text-zinc-300 whitespace-pre-wrap">
                                                {turn.candidateAnswer}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                                Phản hồi từ {personaMeta.name}:
                                            </span>
                                            <p className="mt-1 text-xs italic text-zinc-300">
                                                {turn.interviewerFeedback}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-3.5">
                            <span className="text-xs text-zinc-400">
                                Đã hoàn thành {transcriptTurns.length}/
                                {totalQuestions} câu hỏi
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowTranscriptModal(false)}
                                className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-100 hover:bg-zinc-700"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            {totalQuestions}. Đã hoàn thành{" "}
                            {transcriptTurns.length} câu trả lời.
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
