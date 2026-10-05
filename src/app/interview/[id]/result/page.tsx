import { InterviewResultView } from "@/components/report/InterviewResultView";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface InterviewResultPageProps {
    params: Promise<{ id: string }>;
}

export default async function InterviewResultPage({
    params,
}: InterviewResultPageProps) {
    const { id: sessionId } = await params;

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30 print:bg-white print:text-zinc-900 print:min-h-0">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md print:hidden">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/interview/setup"
                            className={buttonVariants({
                                variant: "ghost",
                                size: "sm",
                                className:
                                    "gap-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
                            })}
                        >
                            <ArrowLeft className="size-4" />
                            <span className="hidden sm:inline">Thiết lập mới</span>
                        </Link>
                        <div className="h-4 w-px bg-zinc-800" />
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs sm:text-sm font-semibold tracking-tight text-zinc-200">
                                Báo cáo phân tích phỏng vấn STAR
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="hidden items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400 sm:inline-flex">
                            <Sparkles className="size-3 text-emerald-400" />
                            Google Gemini 2.0 Flash
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 px-4 py-8 sm:px-6 print:p-0 print:m-0">
                <div className="mx-auto max-w-6xl print:max-w-none">
                    <InterviewResultView sessionId={sessionId} />
                </div>
            </main>
        </div>
    );
}
