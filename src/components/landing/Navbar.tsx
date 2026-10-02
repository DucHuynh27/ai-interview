import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg sm:text-xl tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            AI-Interview
          </span>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            v1.0
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a
            href="#features"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Tính Năng
          </a>
          <a
            href="#personas"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            3 Personas
          </a>
          <a
            href="#star-framework"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Chuẩn STAR
          </a>
          <a
            href="#how-it-works"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Quy Trình
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/interview/setup"
            className={buttonVariants({
              variant: "default",
              size: "default",
              className: "font-semibold shadow-sm gap-1.5",
            })}
          >
            <span>Bắt đầu ngay</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
