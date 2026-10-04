"use client";

import { PREVIEW_SESSION_KEY } from "@/components/interview/SetupForm";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type {
    InterviewSessionData,
    PersonaType,
    QuestionCategory,
} from "@/types/interview";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Flame,
    HeartHandshake,
    Lightbulb,
    ListChecks,
    Sparkles,
    Terminal,
    TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type PreviewPayload = InterviewSessionData;

// ─── Static maps ─────────────────────────────────────────────────────────────

const PERSONA_META: Record<
    PersonaType,
    { label: string; icon: typeof HeartHandshake; color: string }
> = {
    friendly_hr: {
        label: "Friendly HR",
        icon: HeartHandshake,
        color: "text-emerald-600 dark:text-emerald-400",
    },
    challenging_manager: {
        label: "Challenging Manager",
        icon: Flame,
        color: "text-rose-600 dark:text-rose-400",
    },
    tech_lead: {
        label: "Technical Lead",
        icon: Terminal,
        color: "text-indigo-600 dark:text-indigo-400",
    },
};

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
    WARM_UP: "Khởi động",
    BEHAVIORAL_STAR: "STAR Hành vi",
    ROLE_SPECIFIC: "Chuyên môn",
    SITUATIONAL: "Tình huống",
};

const CATEGORY_COLORS: Record<QuestionCategory, string> = {
    WARM_UP: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
    BEHAVIORAL_STAR:
        "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
    ROLE_SPECIFIC:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    SITUATIONAL:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function InterviewPreviewPage() {
    const { id: sessionId } = useParams<{ id: string }>();

    const [payload, setPayload] = useState<PreviewPayload | null>(null);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        const raw = sessionStorage.getItem(
            `${PREVIEW_SESSION_KEY}:${sessionId}`,
        );

        queueMicrotask(() => {
            if (!raw) {
                setLoadError(true);
                return;
            }

            try {
                setPayload(JSON.parse(raw) as PreviewPayload);
            } catch {
                setLoadError(true);
            }
        });
    }, [sessionId]);

    if (loadError) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
                <TriangleAlert className="size-10 text-destructive" />
                <h1 className="text-lg font-bold">Phiên không hợp lệ</h1>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Không tìm thấy dữ liệu phỏng vấn. Vui lòng quay lại và thiết
                    lập lại.
                </p>
                <Link
                    href="/interview/setup"
                    className={buttonVariants({ variant: "outline" })}
                >
                    <ArrowLeft className="size-4" />
                    Quay lại Setup
                </Link>
            </div>
        );
    }

    if (!payload) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    const { data, persona, language } = payload;
    const personaMeta = PERSONA_META[persona];
    const PersonaIcon = personaMeta.icon;
    const displayLanguage = language === "vi" ? "Tiếng Việt" : "English";

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3 sm:px-6">
                    <Link
                        href="/interview/setup"
                        className={buttonVariants({
                            variant: "ghost",
                            size: "sm",
                            className: "gap-1.5 text-muted-foreground",
                        })}
                    >
                        <ArrowLeft className="size-4" />
                        Thiết lập lại
                    </Link>
                    <div className="h-4 w-px bg-border" />
                    <h1 className="text-sm font-semibold tracking-tight">
                        Xem trước bộ câu hỏi
                    </h1>
                </div>
            </header>

            <main className="flex-1 px-4 py-10 sm:px-6">
                <div className="mx-auto max-w-3xl space-y-8">
                    {/* Hero summary */}
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                            AI đã sẵn sàng!
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Bộ câu hỏi cá nhân hóa đã được tạo từ CV và JD của
                            bạn.
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-1">
                            <div
                                className={`flex items-center gap-1.5 text-xs font-semibold ${personaMeta.color}`}
                            >
                                <PersonaIcon className="size-3.5" />
                                {personaMeta.label}
                            </div>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">
                                {displayLanguage}
                            </span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">
                                {data.questions.length} câu hỏi
                            </span>
                        </div>
                    </div>

                    {/* AI Analysis Summary */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Strengths */}
                        <Card className="border-emerald-500/20 bg-emerald-500/5">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
                                    <CardTitle className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                        Điểm mạnh nổi bật
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Kỹ năng CV khớp tốt với JD
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-1.5">
                                    {data.summary.extractedSkills.map(
                                        (skill, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 text-xs"
                                            >
                                                <Lightbulb className="size-3 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                                <span>{skill}</span>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Gaps */}
                        <Card className="border-amber-500/20 bg-amber-500/5">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
                                    <CardTitle className="text-sm font-bold text-amber-700 dark:text-amber-400">
                                        Điểm cần chuẩn bị
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Lỗ hổng so với yêu cầu JD
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-1.5">
                                    {data.summary.identifiedGaps.map(
                                        (gap, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 text-xs"
                                            >
                                                <TriangleAlert className="size-3 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                                                <span>{gap}</span>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Question list */}
                    <Card className="border-border/70 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <ListChecks className="size-4 text-primary" />
                                <CardTitle className="text-base font-bold tracking-tight">
                                    5 Câu hỏi phỏng vấn
                                </CardTitle>
                            </div>
                            <CardDescription className="text-xs">
                                AI sẽ hỏi theo thứ tự này. Hãy chuẩn bị câu trả
                                lời theo cấu trúc STAR.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-0 p-0">
                            {data.questions.map((q, idx) => (
                                <div key={q.order}>
                                    {idx > 0 && (
                                        <Separator className="mx-6 w-auto" />
                                    )}
                                    <div className="flex gap-4 px-6 py-5">
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold tabular-nums text-muted-foreground">
                                            {q.order}
                                        </div>
                                        <div className="space-y-2 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] px-1.5 py-0 h-4 rounded-sm font-semibold ${CATEGORY_COLORS[q.category]}`}
                                                >
                                                    {
                                                        CATEGORY_LABELS[
                                                            q.category
                                                        ]
                                                    }
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-semibold leading-snug text-foreground">
                                                {language === "vi"
                                                    ? q.questionVi
                                                    : q.questionEn}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                                                {language === "en"
                                                    ? q.questionVi
                                                    : q.questionEn}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                <span className="font-semibold not-italic">
                                                    Mục tiêu:{" "}
                                                </span>
                                                {q.targetGoal}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* CTA */}
                    <div className="flex flex-col items-center gap-3 pb-8">
                        <Link
                            href={`/interview/${sessionId}`}
                            className={buttonVariants({
                                size: "lg",
                                className:
                                    "h-12 w-full max-w-sm px-8 text-sm font-semibold shadow-md sm:w-auto",
                            })}
                        >
                            Vào phòng phỏng vấn
                            <ArrowRight className="size-4" />
                        </Link>
                        <p className="text-xs text-muted-foreground text-center">
                            Đảm bảo mic đã bật và bạn đang ở nơi yên tĩnh
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
