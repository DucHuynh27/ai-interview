import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { InterviewHistoryEntry } from "@/types/dashboard";
import type { PersonaType } from "@/types/interview";
import { CheckCircle2, Clock } from "lucide-react";

const PERSONA_LABELS: Record<PersonaType, string> = {
    friendly_hr: "Friendly HR",
    challenging_manager: "Challenging Manager",
    tech_lead: "Technical Lead",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
});

const STAR_CRITERIA = [
    { key: "situation", label: "Situation" },
    { key: "task", label: "Task" },
    { key: "action", label: "Action" },
    { key: "result", label: "Result" },
] as const;

export function InterviewHistoryList({
    entries,
}: {
    entries: InterviewHistoryEntry[];
}) {
    return (
        <ul className="space-y-3">
            {entries.map((entry) => (
                <li key={entry.sessionId}>
                    <Card className="border-border/70 shadow-sm">
                        <CardContent className="space-y-4 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-foreground">
                                        {entry.jobTitle}
                                    </p>
                                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                                        <span>
                                            {DATE_FORMATTER.format(
                                                new Date(entry.createdAt),
                                            )}
                                        </span>
                                        <span aria-hidden>·</span>
                                        <span>
                                            {PERSONA_LABELS[entry.persona]}
                                        </span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {entry.isCompleted ? (
                                        <Badge
                                            variant="outline"
                                            className="gap-1 rounded-full border-emerald-500/30 text-[11px] text-emerald-600 dark:text-emerald-400"
                                        >
                                            <CheckCircle2 className="size-3" />
                                            Đã chấm điểm
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="gap-1 rounded-full text-[11px] text-muted-foreground"
                                        >
                                            <Clock className="size-3" />
                                            Chưa hoàn thành
                                        </Badge>
                                    )}
                                    {entry.overallScore !== null && (
                                        <span className="font-mono tabular-nums text-lg font-bold text-foreground">
                                            {entry.overallScore}
                                            <span className="text-xs font-medium text-muted-foreground">
                                                /100
                                            </span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {entry.starScores && (
                                <div className="grid gap-2 sm:grid-cols-4">
                                    {STAR_CRITERIA.map((criterion) => {
                                        const score =
                                            entry.starScores?.[criterion.key] ??
                                            0;
                                        return (
                                            <div key={criterion.key}>
                                                <div className="mb-1 flex justify-between text-[11px]">
                                                    <span className="text-muted-foreground">
                                                        {criterion.label}
                                                    </span>
                                                    <span className="font-mono tabular-nums font-semibold text-foreground">
                                                        {score}/10
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-muted">
                                                    <div
                                                        className="h-1.5 rounded-full bg-primary"
                                                        style={{
                                                            width: `${score * 10}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </li>
            ))}
        </ul>
    );
}
