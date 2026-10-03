import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2.5">
                    <Image
                        src="/logo.png"
                        alt="AI-Interview logo"
                        width={36}
                        height={36}
                        className="rounded-xl object-cover shadow-sm"
                    />
                    <div className="flex flex-col">
                        <span className="text-base font-bold tracking-tight">
                            AI-Interview
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                            STAR Simulator
                        </span>
                    </div>
                </Link>

                <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
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
                        3 Người phỏng vấn
                    </a>
                    <a
                        href="#star-framework"
                        className="transition-colors hover:text-foreground"
                    >
                        Chuẩn STAR
                    </a>
                    <a
                        href="#workflow"
                        className="transition-colors hover:text-foreground"
                    >
                        Quy trình
                    </a>
                </nav>

                <div className="flex items-center gap-3">
                    <Link
                        href="/interview/setup"
                        className={buttonVariants({
                            size: "sm",
                            className: "h-9 px-4 font-semibold shadow-sm",
                        })}
                    >
                        Bắt đầu ngay
                        <ArrowRight className="size-3.5" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
