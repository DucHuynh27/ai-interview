import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/20 py-12 text-sm text-muted-foreground">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-4" />
            </div>
            <span className="font-bold text-foreground">AI-Interview</span>
            <span className="text-xs text-muted-foreground">
              — Nền tảng phỏng vấn giả lập thông minh cùng AI
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
            <a href="#features" className="hover:text-foreground transition-colors">
              Tính năng
            </a>
            <a href="#personas" className="hover:text-foreground transition-colors">
              3 Personas
            </a>
            <a href="#star-framework" className="hover:text-foreground transition-colors">
              Chuẩn STAR
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              Quy trình
            </a>
            <Link href="/interview/setup" className="font-semibold text-primary hover:underline">
              Bắt đầu ngay
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} AI-Interview. All rights reserved.</p>
          <p className="text-muted-foreground/80">
            Dành cho sinh viên mới ra trường và người chuyển ngành bứt phá sự nghiệp.
          </p>
        </div>
      </div>
    </footer>
  );
}
