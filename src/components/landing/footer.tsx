import Image from "next/image";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-border/60 bg-muted/40 py-12">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
                <div className="flex items-center gap-2.5">
                    <Image
                        src="/logo.png"
                        alt="AI-Interview logo"
                        width={28}
                        height={28}
                        className="rounded-lg object-cover"
                    />
                    <span className="text-sm font-bold tracking-tight">
                        AI-Interview
                    </span>
                    <span className="text-xs text-muted-foreground">
                        • Nền tảng luyện phỏng vấn thông minh chuẩn STAR
                    </span>
                </div>

                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    <Link
                        href="/interview/setup"
                        className="transition-colors hover:text-foreground"
                    >
                        Thử nghiệm ngay
                    </Link>
                    <a
                        href="#features"
                        className="transition-colors hover:text-foreground"
                    >
                        Tính năng
                    </a>
                    <a
                        href="#personas"
                        className="transition-colors hover:text-foreground"
                    >
                        Người phỏng vấn
                    </a>
                    <a
                        href="#star-framework"
                        className="transition-colors hover:text-foreground"
                    >
                        Chuẩn STAR
                    </a>
                </div>

                <p className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} AI-Interview. All rights
                    reserved.
                </p>
            </div>
        </footer>
    );
}
