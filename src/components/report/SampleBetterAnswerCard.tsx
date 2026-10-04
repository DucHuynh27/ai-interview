import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SampleBetterAnswer } from "@/types/report";
import { Check, Copy, Crown, Lightbulb, Sparkles } from "lucide-react";
import { useState } from "react";

interface SampleBetterAnswerCardProps {
    sampleBetterAnswer: SampleBetterAnswer;
}

export function SampleBetterAnswerCard({
    sampleBetterAnswer,
}: SampleBetterAnswerCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(
                sampleBetterAnswer.goldStandardAnswer,
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard write might fail in some contexts
        }
    };

    return (
        <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-zinc-950/80 to-zinc-950 shadow-xl backdrop-blur-xl">
            <CardHeader className="border-b border-amber-500/20 bg-amber-500/5 px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                            <Crown className="size-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-amber-400">
                                    Câu Trả Lời Mẫu Điểm 10 (Gold Standard Answer)
                                </h3>
                                <Badge
                                    variant="outline"
                                    className="border-amber-500/40 bg-amber-500/20 text-[10px] font-bold text-amber-300"
                                >
                                    STAR 10/10
                                </Badge>
                            </div>
                            <p className="text-xs text-zinc-400">
                                Phiên bản trả lời lý tưởng được AI tinh chỉnh dựa trên chính kinh nghiệm thực tế trong CV
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 hover:text-amber-200"
                    >
                        {copied ? (
                            <>
                                <Check className="size-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Đã sao chép</span>
                            </>
                        ) : (
                            <>
                                <Copy className="size-3.5" />
                                <span>Sao chép câu trả lời</span>
                            </>
                        )}
                    </button>
                </div>
            </CardHeader>

            <CardContent className="space-y-5 p-6">
                {/* Question Context */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        <span>Áp dụng cho Câu hỏi #{sampleBetterAnswer.questionIndex || 1}:</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-zinc-200">
                        &ldquo;{sampleBetterAnswer.questionText}&rdquo;
                    </p>
                </div>

                {/* The 10/10 Gold Standard Answer */}
                <div className="relative rounded-2xl border border-amber-500/20 bg-zinc-900/80 p-5 shadow-inner">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                        <Sparkles className="size-4" />
                        Nội dung phát biểu mẫu chuẩn STAR:
                    </div>
                    <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-100">
                        {sampleBetterAnswer.goldStandardAnswer}
                    </div>
                </div>

                {/* Key Takeaway / Lesson */}
                {sampleBetterAnswer.keyTakeaway && (
                    <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <Lightbulb className="size-5 shrink-0 text-emerald-400" />
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-emerald-400">
                                Bài học cốt lõi (Key Takeaway):
                            </span>
                            <p className="text-xs leading-relaxed text-zinc-300">
                                {sampleBetterAnswer.keyTakeaway}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
