import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { QuestionCategory } from "@/types/interview";
import type { QuestionFeedbackItem } from "@/types/report";
import {
    AlertTriangle,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Copy,
    Crown,
    User,
} from "lucide-react";
import { useState } from "react";

interface QuestionFeedbackCardProps {
    feedback: QuestionFeedbackItem;
    defaultOpen?: boolean;
}

const CATEGORY_MAP: Record<QuestionCategory, { label: string; color: string }> =
    {
        WARM_UP: {
            label: "Khởi động",
            color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        },
        BEHAVIORAL_STAR: {
            label: "STAR Hành vi",
            color: "bg-violet-500/10 text-violet-400 border-violet-500/20",
        },
        ROLE_SPECIFIC: {
            label: "Chuyên môn",
            color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        },
        SITUATIONAL: {
            label: "Tình huống",
            color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        },
    };

export function QuestionFeedbackCard({
    feedback,
    defaultOpen = false,
}: QuestionFeedbackCardProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(feedback.suggestedAnswer);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore
        }
    };

    const categoryMeta =
        CATEGORY_MAP[feedback.category] ?? CATEGORY_MAP.BEHAVIORAL_STAR;

    const starScores = [
        { label: "S (Situation)", score: feedback.situationScore },
        { label: "T (Task)", score: feedback.taskScore },
        { label: "A (Action)", score: feedback.actionScore },
        { label: "R (Result)", score: feedback.resultScore },
    ];

    return (
        <Card className="overflow-hidden border-zinc-800 bg-zinc-950/60 transition-all hover:border-zinc-700/80">
            {/* Header / Accordion trigger */}
            <CardHeader
                className="cursor-pointer border-b border-zinc-800/60 p-5 transition-colors hover:bg-zinc-900/40"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 font-mono text-xs font-bold text-zinc-300 border border-zinc-800">
                            {feedback.questionIndex}
                        </span>
                        <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] font-semibold ${categoryMeta.color}`}
                                >
                                    {categoryMeta.label}
                                </Badge>
                                <span className="font-mono text-xs font-bold text-emerald-400">
                                    {feedback.score}/100 điểm
                                </span>
                            </div>
                            <h4 className="text-sm font-semibold text-zinc-100 leading-snug">
                                {feedback.questionText}
                            </h4>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Mini Star Pills */}
                        <div className="hidden sm:flex items-center gap-1.5">
                            {starScores.map((s) => (
                                <span
                                    key={s.label}
                                    className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 border border-zinc-800"
                                >
                                    {s.label[0]}:{s.score}
                                </span>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="rounded-lg p-1 text-zinc-400 hover:text-zinc-200"
                            aria-label="Toggle details"
                        >
                            {isOpen ? (
                                <ChevronUp className="size-4" />
                            ) : (
                                <ChevronDown className="size-4" />
                            )}
                        </button>
                    </div>
                </div>
            </CardHeader>

            {/* Expandable Body */}
            {isOpen && (
                <CardContent className="space-y-5 p-5 sm:p-6">
                    {/* Candidate Answer Transcript */}
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                            <User className="size-3.5 text-zinc-400" />
                            <span>Câu trả lời của bạn:</span>
                        </div>
                        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-200 italic">
                            &ldquo;
                            {feedback.candidateAnswer ||
                                "(Ứng viên không có câu trả lời)"}
                            &rdquo;
                        </p>
                    </div>

                    {/* STAR 4 Pillar Badges on Mobile */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {starScores.map((s) => (
                            <div
                                key={s.label}
                                className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs"
                            >
                                <span className="text-zinc-400">{s.label}</span>
                                <span className="font-mono font-bold text-emerald-400">
                                    {s.score}/10
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Strengths & Weaknesses breakdown */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Strengths */}
                        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                                <CheckCircle2 className="size-3.5" />
                                <span>Điểm tốt:</span>
                            </div>
                            <ul className="mt-2 space-y-1.5 text-xs text-zinc-300">
                                {feedback.strengths.map((str, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-1.5"
                                    >
                                        <span className="text-emerald-400">
                                            •
                                        </span>
                                        <span>{str}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                                <AlertTriangle className="size-3.5" />
                                <span>Cần bổ sung:</span>
                            </div>
                            <ul className="mt-2 space-y-1.5 text-xs text-zinc-300">
                                {feedback.weaknesses.map((w, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-1.5"
                                    >
                                        <span className="text-amber-400">
                                            •
                                        </span>
                                        <span>{w}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Khung Câu trả lời mẫu điểm 10 chuẩn STAR */}
                    {feedback.suggestedAnswer && (
                        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-zinc-900/90 to-zinc-900/90 p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                                    <Crown className="size-4" />
                                    <span>
                                        Câu trả lời mẫu điểm 10 (Chuẩn STAR):
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 hover:text-amber-200"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="size-3 text-emerald-400" />
                                            <span className="text-emerald-400">
                                                Đã chép
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="size-3" />
                                            <span>Sao chép</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-zinc-200">
                                {feedback.suggestedAnswer}
                            </p>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
