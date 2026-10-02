import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ArrowRight,
    CheckCircle2,
    Code2,
    Mic,
    Play,
    Shield,
} from "lucide-react";
import Link from "next/link";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
            {/* Background elements */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
            <div className="absolute top-0 right-0 -z-10 h-125 w-125 rounded-full bg-primary/5 blur-3xl" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <Badge
                        variant="outline"
                        className="rounded-full bg-background/50 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-primary mb-6"
                    >
                        <span className="flex size-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                        Powered by Gemini 2.0 Flash
                    </Badge>

                    <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                        Nâng tầm phỏng vấn với{" "}
                        <span className="bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            AI-Interview
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                        Luyện tập phỏng vấn như thật với 3 Persona khó nhằn. AI
                        tự động chấm điểm theo STAR Framework, che giấu dữ liệu
                        cá nhân (PII) và hỗ trợ giao tiếp bằng giọng nói thời
                        gian thực.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/interview/setup"
                            className={buttonVariants({
                                size: "lg",
                                className: "h-12 px-8 text-base shadow-sm",
                            })}
                        >
                            Trải nghiệm miễn phí
                            <ArrowRight className="size-4" />
                        </Link>
                        <Link
                            href="#demo"
                            className={buttonVariants({
                                variant: "outline",
                                size: "lg",
                                className:
                                    "h-12 px-8 text-base bg-background/50 backdrop-blur-sm",
                            })}
                        >
                            <Play className="size-4 mr-2" />
                            Xem Demo
                        </Link>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Shield className="size-4 text-emerald-500" />
                            Bảo mật 100% CV
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Code2 className="size-4" />
                            Mã nguồn mở
                        </div>
                    </div>
                </div>

                {/* Mock UI Demo */}
                <div className="mt-16 sm:mt-24">
                    <Card className="mx-auto max-w-5xl rounded-2xl border-border/60 bg-background/50 shadow-2xl backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 px-6 py-4">
                            <div className="flex gap-2">
                                <div className="size-3 rounded-full bg-rose-500/80" />
                                <div className="size-3 rounded-full bg-amber-500/80" />
                                <div className="size-3 rounded-full bg-emerald-500/80" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-transparent">
                                    <CheckCircle2 className="size-3 mr-1" />
                                    Đã che PII an toàn
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className="font-mono tabular-nums text-muted-foreground"
                                >
                                    Câu hỏi 2 / 5
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6">
                            <div className="grid gap-6 md:grid-cols-12">
                                <div className="flex flex-col gap-4 md:col-span-8">
                                    <Card className="rounded-xl border-border/70 bg-muted/40 shadow-none">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                                <span className="size-2 rounded-full bg-primary" />
                                                Challenging Manager (Stress
                                                Test)
                                            </div>
                                            <p className="mt-2 text-sm leading-relaxed text-foreground">
                                                &ldquo;Trong CV bạn nói đã tối
                                                ưu hóa thời gian tải trang giảm
                                                40%, nhưng bạn có thể nói rõ cụ
                                                thể chỉ số Web Vitals nào đã
                                                thay đổi và giải pháp kỹ thuật
                                                quyết định là gì? Đừng nói chung
                                                chung về team.&rdquo;
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-xl border-blue-500/30 bg-blue-500/5 shadow-none">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Mic className="size-3.5 animate-pulse" />
                                                    Ứng viên đang trả lời bằng
                                                    giọng nói (STT)...
                                                </span>
                                                <span className="font-mono tabular-nums text-[11px] text-muted-foreground">
                                                    00:42
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm italic leading-relaxed text-muted-foreground">
                                                &ldquo;Em đã đo lường chỉ số
                                                Largest Contentful Paint (LCP)
                                                trên Lighthouse và phát hiện
                                                bundle kích thước lớn do import
                                                toàn bộ icons...&rdquo;
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="flex flex-col justify-between rounded-xl border-border/70 shadow-sm md:col-span-4 bg-card">
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Phân tích STAR tức thì
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-2">
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="font-medium">
                                                        Situation
                                                    </span>
                                                    <span className="font-mono tabular-nums font-semibold text-emerald-600">
                                                        8.5/10
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-muted">
                                                    <div
                                                        className="h-1.5 rounded-full bg-emerald-500"
                                                        style={{ width: "85%" }}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="font-medium">
                                                        Action
                                                    </span>
                                                    <span className="font-mono tabular-nums font-semibold text-blue-600">
                                                        9.0/10
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-muted">
                                                    <div
                                                        className="h-1.5 rounded-full bg-blue-500"
                                                        style={{ width: "90%" }}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="font-medium">
                                                        Result
                                                    </span>
                                                    <span className="font-mono tabular-nums font-semibold text-amber-500">
                                                        7.0/10
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-muted">
                                                    <div
                                                        className="h-1.5 rounded-full bg-amber-500"
                                                        style={{ width: "70%" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <div className="w-full rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
                                            💡{" "}
                                            <span className="font-semibold text-foreground">
                                                Gợi ý AI:
                                            </span>{" "}
                                            Bổ sung thêm tỷ lệ % cải thiện LCP
                                            cụ thể sau khi tách dynamic import.
                                        </div>
                                    </CardFooter>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
