import { RegisterForm } from "@/components/trial/RegisterForm";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { resolveTrialAccess } from "@/lib/db/trial-repository";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

export const metadata: Metadata = {
    title: "Đăng ký dùng thử 3 lượt miễn phí | AI-Interview",
    description:
        "Điền họ tên, email, ngành học và vị trí muốn ứng tuyển để nhận 3 lượt phỏng vấn thử miễn phí cùng AI-Interview.",
};

const TRIAL_BENEFITS = [
    "3 buổi phỏng vấn đầy đủ 5 câu hỏi theo CV và JD của bạn",
    "Chấm điểm theo STAR Framework kèm câu trả lời mẫu điểm 10",
    "3 Persona phỏng vấn viên và chế độ luyện nói bằng giọng nói",
];

export default async function TrialRegisterPage() {
    // Quota phụ thuộc phiên đăng nhập nên trang luôn render theo từng request.
    await connection();
    const trialAccess = await resolveTrialAccess();

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3 sm:px-6">
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
                        Đăng ký dùng thử
                    </h1>
                </div>
            </header>

            <main className="flex-1 px-4 py-10 sm:px-6">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-8 text-center">
                        <Badge
                            variant="outline"
                            className="mb-4 rounded-full border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        >
                            <CheckCircle2 className="mr-1 size-3" />
                            Miễn phí 3 buổi đầu tiên
                        </Badge>
                        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                            Nhận 3 lượt phỏng vấn miễn phí
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
                            Điền 4 thông tin bên dưới, sau đó đăng nhập Google
                            bằng đúng email đó để kích hoạt lượt dùng thử.
                        </p>
                    </div>

                    <ul className="mx-auto mb-8 max-w-xl space-y-2">
                        {TRIAL_BENEFITS.map((benefit) => (
                            <li
                                key={benefit}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                {benefit}
                            </li>
                        ))}
                    </ul>

                    <RegisterForm trialAccess={trialAccess} />

                    <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <ShieldCheck className="size-3.5 text-emerald-500" />
                        Thông tin của bạn chỉ dùng để liên hệ và tuyệt đối không
                        chia sẻ cho bên thứ ba.
                    </p>
                </div>
            </main>
        </div>
    );
}
