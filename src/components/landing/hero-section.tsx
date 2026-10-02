import { buttonVariants } from "@/components/ui/button";
import {
    ArrowRight,
    CheckCircle2,
    Mic,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import Link from "next/link";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                        <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Dành cho sinh viên &amp; người chuyển ngành</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                            Chuẩn STAR Framework
                        </span>
                    </div>

                    <h1 className="mt-6 max-w-4xl text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                        Luyện phỏng vấn thông minh với{" "}
                        <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            AI 3 phong cách
                        </span>{" "}
                        chuẩn hóa
                    </h1>

                    <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
                        Tải lên CV PDF, đối soát tức thì với Job Description. Tự
                        động che thông tin cá nhân (PII), tương tác trực tiếp
                        bằng giọng nói và nhận báo cáo đánh giá kèm câu trả lời
                        mẫu điểm 10.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Link
                            href="/interview/setup"
                            className={buttonVariants({
                                size: "lg",
                                className:
                                    "h-11 px-6 text-sm font-semibold shadow-md",
                            })}
                        >
                            Bắt đầu phỏng vấn ngay
                            <ArrowRight className="size-4" />
                        </Link>
                        <a
                            href="#personas"
                            className={buttonVariants({
                                variant: "outline",
                                size: "lg",
                                className: "h-11 px-6 text-sm font-semibold",
                            })}
                        >
                            Xem 3 người phỏng vấn ảo
                        </a>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="size-4 text-emerald-600" />
                            <span>Bảo mật PII tự động</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Mic className="size-4 text-blue-600" />
                            <span>Voice Turn-based không độ trễ</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="size-4 text-amber-500" />
                            <span>Chi phí ~2 lốp / lượt thực hành</span>
                        </div>
                    </div>
                </div>

                <div className="mt-14 rounded-2xl border border-border/80 bg-card/60 p-3 shadow-xl backdrop-blur-sm sm:p-4 md:mt-16">
                    <div className="overflow-hidden rounded-xl border border-border/60 bg-background p-4 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="size-3 rounded-full bg-red-400" />
                                <div className="size-3 rounded-full bg-amber-400" />
                                <div className="size-3 rounded-full bg-emerald-400" />
                                <span className="ml-2 font-mono text-xs text-muted-foreground">
                                    Phòng phỏng vấn mô phỏng • Persona:
                                    Challenging Manager
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="size-3" />
                                    Đã che PII an toàn
                                </span>
                                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                                    Câu hỏi 2 / 5
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-6 md:grid-cols-12">
                            <div className="flex flex-col gap-4 md:col-span-8">
                                <div className="rounded-xl border border-border/70 bg-muted/40 p-4">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                        <span className="size-2 rounded-full bg-primary" />
                                        Challenging Manager (Stress Test)
                                    </div>
                                    <p className="mt-2 text-sm leading-relaxed text-foreground">
                                        &ldquo;Trong CV bạn nói đã tối ưu hóa
                                        thời gian tải trang giảm 40%, nhưng bạn
                                        có thể nói rõ cụ thể chỉ số Web Vitals
                                        nào đã thay đổi và giải pháp kỹ thuật
                                        quyết định là gì? Đừng nói chung chung
                                        về team.&rdquo;
                                    </p>
                                </div>

                                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
                                    <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                                        <span className="flex items-center gap-1.5">
                                            <Mic className="size-3.5 animate-pulse" />
                                            Ứng viên đang trả lời bằng giọng nói
                                            (STT)...
                                        </span>
                                        <span className="font-mono text-[11px] text-muted-foreground">
                                            00:42
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm italic leading-relaxed text-muted-foreground">
                                        &ldquo;Em đã đo lường chỉ số Largest
                                        Contentful Paint (LCP) trên Lighthouse
                                        và phát hiện bundle kích thước lớn do
                                        import toàn bộ icons...&rdquo;
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-4 md:col-span-4">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Phân tích STAR tức thì
                                    </span>
                                    <div className="mt-3 space-y-2.5">
                                        <div>
                                            <div className="flex justify-between text-xs">
                                                <span className="font-medium">
                                                    Situation (Bối cảnh)
                                                </span>
                                                <span className="font-semibold text-emerald-600">
                                                    8.5/10
                                                </span>
                                            </div>
                                            <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                                                <div
                                                    className="h-1.5 rounded-full bg-emerald-500"
                                                    style={{ width: "85%" }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs">
                                                <span className="font-medium">
                                                    Action (Hành động cá nhân)
                                                </span>
                                                <span className="font-semibold text-blue-600">
                                                    9.0/10
                                                </span>
                                            </div>
                                            <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                                                <div
                                                    className="h-1.5 rounded-full bg-blue-500"
                                                    style={{ width: "90%" }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs">
                                                <span className="font-medium">
                                                    Result (Kết quả định lượng)
                                                </span>
                                                <span className="font-semibold text-amber-500">
                                                    7.0/10
                                                </span>
                                            </div>
                                            <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                                                <div
                                                    className="h-1.5 rounded-full bg-amber-500"
                                                    style={{ width: "70%" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
                                    💡{" "}
                                    <span className="font-semibold text-foreground">
                                        Gợi ý AI:
                                    </span>{" "}
                                    Bổ sung thêm tỷ lệ % cải thiện LCP cụ thể
                                    sau khi tách dynamic import.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
