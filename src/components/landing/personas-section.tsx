import { CheckCircle2, Flame, HeartHandshake, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PersonaCardProps {
    id: string;
    badge: string;
    name: string;
    role: string;
    description: string;
    icon: typeof HeartHandshake;
    accentColor: string;
    highlights: string[];
    sampleQuestion: string;
}

const PERSONAS: PersonaCardProps[] = [
    {
        id: "friendly_hr",
        badge: "Thân thiện & Khích lệ",
        name: "Friendly HR",
        role: "Chuyên viên Nhân sự",
        description:
            "Tạo bầu không khí thoải mái, giảm căng thẳng cho sinh viên mới ra trường. Tập trung vào động lực ứng tuyển, sự hòa nhập văn hóa và kỹ năng giao tiếp.",
        icon: HeartHandshake,
        accentColor:
            "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
        highlights: [
            "Khích lệ ứng viên bộc lộ tiềm năng",
            "Đánh giá EQ và kỹ năng mềm",
            "Phản hồi nhẹ nhàng, định hướng tích cực",
        ],
        sampleQuestion:
            "&ldquo;Điều gì ở môi trường công ty chúng tôi thôi thúc bạn nộp đơn, và bạn kỳ vọng mình sẽ học hỏi được gì nhất trong năm đầu tiên?&rdquo;",
    },
    {
        id: "challenging_manager",
        badge: "Stress Test & Đào sâu",
        name: "Challenging Manager",
        role: "Quản lý Dự án / Trưởng phòng",
        description:
            "Phong cách phản biện sắc sảo, truy vấn sâu vào các số liệu và thành tích trong CV. Giúp bạn rèn luyện bản lĩnh trước những câu hỏi hóc búa.",
        icon: Flame,
        accentColor:
            "border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400",
        highlights: [
            "Đào sâu vào số liệu thực tế trong CV",
            "Thử thách phản ứng dưới áp lực",
            "Yêu cầu dẫn chứng cụ thể theo STAR",
        ],
        sampleQuestion:
            "&ldquo;Bạn khẳng định dự án này vượt tiến độ 2 tuần, nhưng nếu thành viên chủ chốt nghỉ đột xuất giữa sprint, giải pháp cụ thể của riêng bạn là gì?&rdquo;",
    },
    {
        id: "tech_lead",
        badge: "Thực chiến & Chuyên môn",
        name: "Technical Lead",
        role: "Kiến trúc sư Trưởng / Lead Kỹ thuật",
        description:
            "Đánh giá tư duy kỹ thuật nền tảng, kiến trúc hệ thống và cách giải quyết bài toán thực tế. Đối soát thẳng vào yêu cầu kỹ thuật trong JD.",
        icon: Terminal,
        accentColor:
            "border-indigo-500/30 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400",
        highlights: [
            "Kiểm tra sâu tư duy giải quyết vấn đề",
            "So khớp kỹ năng lập trình với JD",
            "Đánh giá khả năng tối ưu và mở rộng",
        ],
        sampleQuestion:
            "&ldquo;Khi xử lý lượng request tăng đột biến trong đợt sale, bạn sẽ lựa chọn caching ở tầng nào và làm thế nào để đảm bảo tính nhất quán dữ liệu?&rdquo;",
    },
];

export function PersonasSection() {
    return (
        <section
            id="personas"
            className="border-t border-border/60 bg-muted/20 py-20 md:py-28"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <Badge variant="outline" className="rounded-full bg-background font-semibold">
                        3 Người phỏng vấn AI độc bản
                    </Badge>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        Tập dượt với mọi phong cách phỏng vấn
                    </h2>
                    <p className="mt-3 text-base text-muted-foreground">
                        Không còn bỡ ngỡ khi bước vào phòng phỏng vấn thực tế.
                        Bạn có thể tự do lựa chọn phong cách người phỏng vấn phù
                        hợp với mục tiêu rèn luyện.
                    </p>
                </div>

                <div className="mt-14 grid gap-8 md:grid-cols-3">
                    {PERSONAS.map((persona) => {
                        const Icon = persona.icon;
                        return (
                            <Card
                                key={persona.id}
                                className="flex flex-col justify-between border-border/70 shadow-sm transition-all hover:border-border hover:shadow-md"
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div
                                            className={`flex size-11 items-center justify-center rounded-xl border ${persona.accentColor}`}
                                        >
                                            <Icon className="size-5" />
                                        </div>
                                        <Badge variant="secondary" className="font-medium text-muted-foreground">
                                            {persona.badge}
                                        </Badge>
                                    </div>

                                    <CardTitle className="text-xl font-bold tracking-tight">
                                        {persona.name}
                                    </CardTitle>
                                    <div className="text-xs font-semibold text-muted-foreground mt-0">
                                        {persona.role}
                                    </div>

                                    <CardDescription className="mt-2 text-sm leading-relaxed">
                                        {persona.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <Separator className="mb-4" />
                                    <div className="space-y-2">
                                        {persona.highlights.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 text-xs text-foreground"
                                            >
                                                <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-0 pb-6">
                                    <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5 w-full">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Ví dụ câu hỏi:
                                        </div>
                                        <div
                                            className="mt-1 text-xs italic text-muted-foreground"
                                            dangerouslySetInnerHTML={{
                                                __html: persona.sampleQuestion,
                                            }}
                                        />
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
