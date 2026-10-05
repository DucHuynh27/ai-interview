import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StarRadarChart } from "@/components/report/StarRadarChart";
import type { InterviewEvaluationReport } from "@/types/report";
import type { PersonaType } from "@/types/interview";
import {
    Award,
    Clock,
    Flame,
    HeartHandshake,
    Sparkles,
    Target,
    Terminal,
} from "lucide-react";

interface ScoreOverviewCardProps {
    report: InterviewEvaluationReport;
    persona?: PersonaType;
}

const PERSONA_INFO: Record<
    PersonaType,
    { label: string; icon: typeof HeartHandshake; badgeColor: string }
> = {
    friendly_hr: {
        label: "Friendly HR",
        icon: HeartHandshake,
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    challenging_manager: {
        label: "Challenging Manager",
        icon: Flame,
        badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
    tech_lead: {
        label: "Technical Lead",
        icon: Terminal,
        badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
};

export function ScoreOverviewCard({ report, persona = "friendly_hr" }: ScoreOverviewCardProps) {
    const { overallScore, situationScore, taskScore, actionScore, resultScore } = report;

    const personaMeta = PERSONA_INFO[persona] ?? PERSONA_INFO.friendly_hr;
    const PersonaIcon = personaMeta.icon;

    const getScoreTier = (score: number) => {
        if (score >= 85) return { label: "Xuất sắc", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
        if (score >= 70) return { label: "Tốt", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" };
        if (score >= 50) return { label: "Khá", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
        return { label: "Cần cải thiện", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" };
    };

    const tier = getScoreTier(overallScore);

    const starDimensions = [
        {
            key: "situation",
            label: "Situation (Bối cảnh)",
            desc: "Độ cụ thể, rõ ràng của hoàn cảnh và vấn đề đối mặt",
            score: situationScore,
            color: "from-sky-500 to-blue-600",
            textColor: "text-sky-400",
        },
        {
            key: "task",
            label: "Task (Mục tiêu)",
            desc: "Mục tiêu cần hoàn thành và vai trò cá nhân được giao",
            score: taskScore,
            color: "from-violet-500 to-purple-600",
            textColor: "text-violet-400",
        },
        {
            key: "action",
            label: "Action (Hành động)",
            desc: "Hành động thực tế và giải pháp cá nhân đã chủ động thực hiện",
            score: actionScore,
            color: "from-amber-500 to-orange-600",
            textColor: "text-amber-400",
        },
        {
            key: "result",
            label: "Result (Kết quả)",
            desc: "Kết quả định lượng, giá trị tạo ra và bài học tích lũy",
            score: resultScore,
            color: "from-emerald-500 to-teal-600",
            textColor: "text-emerald-400",
        },
    ];

    return (
        <Card className="overflow-hidden border-zinc-800 bg-zinc-950/70 backdrop-blur-xl print:break-inside-avoid print:bg-white print:border-zinc-300 print:text-zinc-900 print:shadow-none">
            <CardContent className="p-6 sm:p-8">
                {/* Header badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-5 print:border-zinc-200">
                    <div className="flex items-center gap-2.5">
                        <Badge
                            variant="outline"
                            className={`flex items-center gap-1.5 px-3 py-1 font-semibold ${personaMeta.badgeColor}`}
                        >
                            <PersonaIcon className="size-3.5" />
                            {personaMeta.label}
                        </Badge>
                        <Badge variant="outline" className="border-zinc-800 bg-zinc-900/60 text-zinc-300 print:bg-white print:border-zinc-300 print:text-zinc-700">
                            <Clock className="mr-1 size-3 text-zinc-400 print:text-zinc-600" />
                            {new Date(report.evaluatedAt).toLocaleDateString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            })}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 print:text-zinc-600">Đánh giá chuẩn:</span>
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold print:border-emerald-300 print:bg-emerald-50 print:text-emerald-800">
                            STAR Framework 2026
                        </Badge>
                    </div>
                </div>

                {/* Score stats & Radar Chart Grid */}
                <div className="mt-6 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                    {/* Overall Score Dial */}
                    <div className="flex flex-col items-center justify-center text-center lg:col-span-4 lg:border-r lg:border-zinc-800/80 lg:pr-8 print:border-r print:border-zinc-200 print:pr-6">
                        <div className="relative flex size-40 items-center justify-center rounded-full border-4 border-zinc-800/80 bg-zinc-900/50 p-2 shadow-inner print:border-zinc-200 print:bg-zinc-50">
                            {/* Inner ring circle indicator */}
                            <div className="absolute inset-2 rounded-full border-2 border-dashed border-emerald-500/30" />
                            <div className="flex flex-col items-center justify-center">
                                <span className="font-mono text-5xl font-black tracking-tight text-white print:text-zinc-900">
                                    {overallScore}
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 print:text-zinc-600">
                                    / 100 điểm
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col items-center gap-1.5">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold ${tier.bg} ${tier.color}`}
                            >
                                <Award className="size-3.5" />
                                {tier.label}
                            </span>
                            <p className="mt-1 max-w-[240px] text-xs text-zinc-400 print:text-zinc-600">
                                Dựa trên mức độ hoàn thiện cấu trúc STAR và chiều sâu kỹ năng trong CV.
                            </p>
                        </div>
                    </div>

                    {/* Radar Chart */}
                    <div className="flex items-center justify-center lg:col-span-4">
                        <StarRadarChart
                            scores={{
                                situation: situationScore,
                                task: taskScore,
                                action: actionScore,
                                result: resultScore,
                            }}
                            size={280}
                        />
                    </div>

                    {/* 4 Pillars Bars */}
                    <div className="space-y-4 lg:col-span-4">
                        <div className="flex items-center gap-2">
                            <Target className="size-4 text-emerald-400" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 print:text-zinc-800">
                                Điểm theo 4 trụ cột
                            </h4>
                        </div>

                        <div className="space-y-3.5">
                            {starDimensions.map((dim) => (
                                <div key={dim.key} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-zinc-200 print:text-zinc-800">{dim.label}</span>
                                        <span className={`font-mono font-bold ${dim.textColor}`}>
                                            {dim.score}/10
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800 print:bg-zinc-200">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${dim.color} transition-all duration-500`}
                                            style={{ width: `${(dim.score / 10) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-400 print:text-zinc-600">{dim.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Executive Summary Quote */}
                {report.summary && (
                    <div className="mt-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-5 print:bg-zinc-50 print:border-zinc-200">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-700">
                            <Sparkles className="size-4" />
                            Nhận định tổng quan từ Hội đồng phỏng vấn AI
                        </div>
                        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-300 print:text-zinc-800">
                            {report.summary}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
