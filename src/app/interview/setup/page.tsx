import { SetupForm } from "@/components/interview/SetupForm";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Cấu hình phỏng vấn | AI-Interview",
    description:
        "Tải CV, dán Job Description và chọn phong cách người phỏng vấn AI để bắt đầu buổi luyện tập.",
};

export default function InterviewSetupPage() {
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
                        Cấu hình phỏng vấn
                    </h1>
                </div>
            </header>

            <main className="flex-1 px-4 py-10 sm:px-6">
                <div className="mx-auto max-w-3xl text-center mb-10">
                    <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                        Thiết lập buổi phỏng vấn
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        AI sẽ đọc CV và JD để sinh ra bộ câu hỏi STAR cá nhân
                        hóa cho riêng bạn.
                    </p>
                </div>
                <SetupForm />
            </main>
        </div>
    );
}
