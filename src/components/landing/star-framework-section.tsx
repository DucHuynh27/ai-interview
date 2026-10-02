import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Award, Check, Compass, ListTodo, TrendingUp, Zap } from "lucide-react";

const STAR_PILLARS = [
    {
        letter: "S",
        title: "Situation (Bối cảnh)",
        question: "Tình huống bạn đối mặt là gì?",
        description:
            "Đặt ngữ cảnh cho câu chuyện. Thông tin cần súc tích, đủ để người phỏng vấn hiểu quy mô dự án hoặc độ khó của vấn đề.",
        icon: Compass,
        weight: "25%",
    },
    {
        letter: "T",
        title: "Task (Nhiệm vụ)",
        question: "Mục tiêu và trách nhiệm cụ thể của bạn là gì?",
        description:
            "Chỉ rõ vai trò của bản thân, mục tiêu bắt buộc phải hoàn thành và các rào cản về thời gian, nguồn lực phải đối mặt.",
        icon: ListTodo,
        weight: "25%",
    },
    {
        letter: "A",
        title: "Action (Hành động)",
        question: "Bạn đã trực tiếp làm những gì để tháo gỡ vấn đề?",
        description:
            "Trọng tâm quan trọng nhất. AI bắt lỗi khi bạn nói 'chúng em/nhóm em' và khuyến khích nêu bật đóng góp, giải pháp của riêng bạn.",
        icon: Zap,
        weight: "30%",
    },
    {
        letter: "R",
        title: "Result (Kết quả)",
        question: "Kết quả đo lường được là gì và bài học rút ra?",
        description:
            "Chứng minh hiệu quả qua các con số cụ thể (% tăng trưởng, thời gian tiết kiệm, giải thưởng) và giá trị lâu dài tạo ra cho tổ chức.",
        icon: TrendingUp,
        weight: "20%",
    },
];

export function StarFrameworkSection() {
    return (
        <section
            id="star-framework"
            className="border-t border-border/60 py-20 md:py-28"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <Badge
                        variant="secondary"
                        className="rounded-full font-semibold"
                    >
                        Phương pháp phỏng vấn chuẩn quốc tế
                    </Badge>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        Làm chủ mô hình STAR Framework
                    </h2>
                    <p className="mt-3 text-base text-muted-foreground">
                        Các tập đoàn đa quốc gia và công ty công nghệ hàng đầu
                        luôn dùng STAR để sàng lọc ứng viên. AI-Interview giúp
                        bạn biến câu trả lời bản năng thành cấu trúc thuyết
                        phục.
                    </p>
                </div>

                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {STAR_PILLARS.map((pillar) => {
                        const Icon = pillar.icon;
                        return (
                            <Card
                                key={pillar.letter}
                                className="relative flex flex-col justify-between rounded-2xl border-border/70 shadow-sm transition-all hover:border-border hover:shadow-md"
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-base font-extrabold text-primary-foreground">
                                            {pillar.letter}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className="font-mono tabular-nums text-xs text-muted-foreground"
                                        >
                                            Tỷ trọng {pillar.weight}
                                        </Badge>
                                    </div>

                                    <CardTitle className="text-base font-bold tracking-tight">
                                        {pillar.title}
                                    </CardTitle>
                                    <div className="mt-1 text-xs font-medium text-primary">
                                        {pillar.question}
                                    </div>

                                    <CardDescription className="mt-3 text-xs leading-relaxed">
                                        {pillar.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardFooter className="pt-0">
                                    <div className="flex items-center gap-1.5 border-t border-border/60 pt-4 w-full text-xs font-medium text-muted-foreground">
                                        <Icon className="size-3.5 text-primary" />
                                        <span>Chấm thang điểm 10</span>
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                <div className="mt-12 rounded-2xl border border-border/70 bg-muted/30 p-6 md:p-8">
                    <div className="grid gap-6 md:grid-cols-12 md:items-center">
                        <div className="md:col-span-7">
                            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                <Award className="size-4" />
                                Tính năng độc quyền: Câu trả lời mẫu điểm 10
                            </div>
                            <h3 className="mt-2 text-xl font-bold tracking-tight">
                                Không chỉ chấm điểm, AI còn viết lại câu trả lời
                                hoàn hảo cho bạn
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                Sau mỗi câu hỏi hoặc khi kết thúc buổi phỏng
                                vấn, Gemini đối chiếu trực tiếp dữ liệu từ CV
                                của bạn để biên soạn một câu trả lời mẫu chuẩn
                                mực theo đúng STAR. Bạn học hỏi được ngay cách
                                dùng thuật ngữ chuyên môn và cách nhấn mạnh kết
                                quả.
                            </p>
                        </div>

                        <Card className="rounded-xl border-border/80 bg-background shadow-sm md:col-span-5">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-emerald-600 dark:text-emerald-400">
                                        Gold Standard Answer
                                    </span>
                                    <Badge className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-transparent font-mono tabular-nums text-[11px]">
                                        10/10 STAR
                                    </Badge>
                                </div>
                                <p className="mt-2 text-xs leading-relaxed text-muted-foreground italic">
                                    &ldquo;Tại công ty X (Situation), hệ thống
                                    báo lỗi 504 khi đạt 10.000 CCU (Task). Tôi
                                    đã chủ động phân tích memory leak bằng
                                    pprof, tái cấu trúc connection pool và áp
                                    dụng Redis cache (Action). Kết quả giảm 80%
                                    tải DB và latency trung bình giảm từ 450ms
                                    xuống 45ms (Result).&rdquo;
                                </p>
                                <Separator className="my-3" />
                                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                                    <Check className="size-3.5" />
                                    <span>
                                        Số liệu rõ ràng • Nêu bật hành động cá
                                        nhân
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
