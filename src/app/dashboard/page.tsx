import { AuthButton } from "@/components/auth/AuthButton";
import { InterviewHistoryList } from "@/components/dashboard/InterviewHistoryList";
import { ScoreProgressChart } from "@/components/dashboard/ScoreProgressChart";
import { buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { listCurrentUserInterviewHistory } from "@/lib/db/interview-history-repository";
import type { InterviewHistoryEntry } from "@/types/dashboard";
import { ArrowLeft, ArrowRight, AlertCircle, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

export const metadata: Metadata = {
    title: "Lịch sử luyện tập | AI-Interview",
    description:
        "Xem lại các buổi phỏng vấn đã luyện và tiến bộ điểm số STAR theo thời gian.",
};

export default async function DashboardPage() {
    // Lịch sử gắn với tài khoản đang đăng nhập nên trang luôn render theo request.
    await connection();
    const history = await listCurrentUserInterviewHistory();

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
                    <Link
                        href="/"
                        className={buttonVariants({
                            variant: "ghost",
                            size: "sm",
                            className: "gap-1.5 text-muted-foreground",
                        })}
                    >
                        <ArrowLeft className="size-4" />
                        Trang chủ
                    </Link>
                    <div className="h-4 w-px bg-border" />
                    <h1 className="text-sm font-semibold tracking-tight">
                        Lịch sử luyện tập
                    </h1>
                </div>
            </header>

            <main className="flex-1 px-4 py-10 sm:px-6">
                <div className="mx-auto max-w-5xl space-y-8">
                    {!history.ok && history.reason === "unauthenticated" && (
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-bold">
                                    Đăng nhập để xem lịch sử
                                </CardTitle>
                                <CardDescription>
                                    Lịch sử buổi phỏng vấn và biểu đồ tiến bộ
                                    được lưu theo tài khoản Google của bạn.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-wrap items-center gap-3">
                                <AuthButton />
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-1 text-xs font-semibold underline-offset-2 hover:underline"
                                >
                                    Chưa có lượt? Đăng ký dùng thử
                                    <ArrowRight className="size-3" />
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {!history.ok && history.reason === "db_error" && (
                        <Card className="border-destructive/40 bg-destructive/5">
                            <CardContent className="flex items-start gap-2 p-4 text-sm text-destructive">
                                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                Không tải được lịch sử lúc này. Vui lòng tải
                                lại trang hoặc thử lại sau ít phút.
                            </CardContent>
                        </Card>
                    )}

                    {history.ok && history.entries.length === 0 && (
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-bold">
                                    Chưa có buổi phỏng vấn nào
                                </CardTitle>
                                <CardDescription>
                                    Hoàn thành buổi đầu tiên để bắt đầu theo dõi
                                    tiến bộ điểm STAR của bạn.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link
                                    href="/interview/setup"
                                    className={buttonVariants({
                                        className:
                                            "h-11 px-6 font-semibold",
                                    })}
                                >
                                    Bắt đầu phỏng vấn
                                    <ArrowRight className="ml-2 size-4" />
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {history.ok && history.entries.length > 0 && (
                        <>
                            <DashboardStats entries={history.entries} />

                            <Card className="border-border/70 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                        <TrendingUp className="size-4 text-primary" />
                                        Tiến bộ điểm tổng quan
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Thang điểm 100, tính từ các buổi đã hoàn
                                        thành.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScoreProgressChart
                                        entries={history.entries}
                                    />
                                </CardContent>
                            </Card>

                            <div className="space-y-3">
                                <h2 className="text-sm font-bold tracking-tight">
                                    Các buổi đã luyện (
                                    {history.entries.length})
                                </h2>
                                <InterviewHistoryList
                                    entries={history.entries}
                                />
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

function DashboardStats({
    entries,
}: {
    entries: InterviewHistoryEntry[];
}) {
    const scored = entries.filter((entry) => entry.overallScore !== null);
    const bestScore =
        scored.length > 0
            ? Math.max(
                  ...scored.map((entry) => entry.overallScore as number),
              )
            : null;
    // entries đã sắp theo createdAt giảm dần nên phần tử đầu là buổi gần nhất.
    const latestScore = scored[0]?.overallScore ?? null;

    const stats = [
        { label: "Tổng buổi luyện", value: String(entries.length) },
        { label: "Buổi đã chấm điểm", value: String(scored.length) },
        { label: "Điểm cao nhất", value: bestScore === null ? "—" : `${bestScore}/100` },
        { label: "Điểm gần nhất", value: latestScore === null ? "—" : `${latestScore}/100` },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="border-border/70 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-[11px] font-medium text-muted-foreground">
                            {stat.label}
                        </p>
                        <p className="mt-1 font-mono tabular-nums text-xl font-bold">
                            {stat.value}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
