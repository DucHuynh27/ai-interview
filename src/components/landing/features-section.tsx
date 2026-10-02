import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowRight,
    BarChart3,
    Coins,
    Cpu,
    FileCheck2,
    Languages,
    ShieldCheck,
    Upload,
    UserCheck,
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
    {
        icon: Cpu,
        title: "Tốc độ phản hồi Real-time",
        description:
            "Sử dụng Gemini 2.0 Flash thế hệ mới qua WebSockets cho tốc độ phản hồi gần như tức thì, mô phỏng nhịp độ phỏng vấn thực tế một cách chân thực nhất.",
    },
    {
        icon: ShieldCheck,
        title: "Bảo mật Dữ liệu PII",
        description:
            "Tự động ẩn/che các thông tin nhạy cảm (PII) trong CV như số điện thoại, email, địa chỉ trước khi gửi cho LLM xử lý, đảm bảo an toàn tuyệt đối.",
    },
    {
        icon: Languages,
        title: "Song ngữ Tiếng Việt & Tiếng Anh",
        description:
            "Luyện tập song ngữ linh hoạt: sẵn sàng cho các vòng phỏng vấn tại công ty nước ngoài (MNCs) hoặc doanh nghiệp hàng đầu trong nước.",
    },
    {
        icon: Coins,
        title: "Chi phí chỉ ~200đ / phiên",
        description:
            "Mô hình Unit Economics tối ưu đột phá. Sinh viên và người mới có thể thoải mái luyện tập nhiều lần mà không lo gánh nặng chi phí.",
    },
    {
        icon: FileCheck2,
        title: "Báo cáo Radar & Xuất PDF",
        description:
            "Tổng kết chi tiết điểm số STAR, phân tích từng câu trả lời và cho phép tải báo cáo PDF về máy để ôn luyện trước ngày phỏng vấn thật.",
    },
];

const WORKFLOW_STEPS = [
    {
        step: "01",
        icon: Upload,
        title: "Tải CV & Dán JD",
        description:
            "Kéo thả file PDF CV và nội dung yêu cầu tuyển dụng. Hệ thống tự động lọc PII bảo mật.",
    },
    {
        step: "02",
        icon: UserCheck,
        title: "Chọn Người phỏng vấn",
        description:
            "Lựa chọn giữa Friendly HR, Challenging Manager hoặc Technical Lead tùy theo mục tiêu luyện tập.",
    },
    {
        step: "03",
        icon: BarChart3,
        title: "Phỏng vấn & Nhận báo cáo",
        description:
            "Trả lời 5 câu hỏi chuẩn STAR qua giọng nói hoặc văn bản, sau đó nhận báo cáo kèm câu trả lời mẫu điểm 10.",
    },
];

export function FeaturesSection() {
    return (
        <>
            <section
                id="features"
                className="border-t border-border/60 bg-muted/20 py-20 md:py-28"
            >
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <Badge
                            variant="outline"
                            className="rounded-full bg-background font-semibold"
                        >
                            Công nghệ tiên tiến
                        </Badge>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Đột phá công nghệ hỗ trợ ứng viên
                        </h2>
                        <p className="mt-3 text-base text-muted-foreground">
                            Kết hợp giữa trí tuệ nhân tạo Gemini 2.0 Flash thế
                            hệ mới và các tiêu chuẩn bảo mật dữ liệu hiện đại.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <Card
                                    key={idx}
                                    className="border-border/70 shadow-sm transition-all hover:border-border hover:shadow-md"
                                >
                                    <CardHeader className="pb-4">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                                            <Icon className="size-5" />
                                        </div>
                                        <CardTitle className="text-base font-bold tracking-tight">
                                            {feature.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0 text-xs leading-relaxed text-muted-foreground">
                                        {feature.description}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section
                id="workflow"
                className="border-t border-border/60 py-20 md:py-28"
            >
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <Badge
                            variant="secondary"
                            className="rounded-full font-semibold"
                        >
                            Quy trình đơn giản
                        </Badge>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Sẵn sàng phỏng vấn chỉ sau 3 bước
                        </h2>
                        <p className="mt-3 text-base text-muted-foreground">
                            Không cần cài đặt phức tạp, không mất thời gian chờ
                            đợi. Bắt đầu ngay trên trình duyệt web của bạn.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-8 md:grid-cols-3">
                        {WORKFLOW_STEPS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Card
                                    key={item.step}
                                    className="relative border-border/70 text-center shadow-sm"
                                >
                                    <CardHeader className="flex flex-col items-center pb-2">
                                        <span className="font-mono tabular-nums text-2xl font-black text-muted-foreground/40">
                                            {item.step}
                                        </span>
                                        <div className="mt-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                                            <Icon className="size-5" />
                                        </div>
                                        <CardTitle className="mt-4 text-base font-bold tracking-tight">
                                            {item.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0 text-xs leading-relaxed text-muted-foreground">
                                        {item.description}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="mt-14 flex flex-col items-center rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-12">
                        <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Bạn đã sẵn sàng chinh phục nhà tuyển dụng?
                        </h3>
                        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                            Tải CV của bạn lên ngay bây giờ và trải nghiệm cảm
                            giác phỏng vấn thực chiến với AI.
                        </p>
                        <Link
                            href="/interview/setup"
                            className={buttonVariants({
                                size: "lg",
                                className:
                                    "mt-6 h-11 px-6 text-sm font-semibold shadow-md",
                            })}
                        >
                            Bắt đầu phỏng vấn ngay
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
