import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-20 border-t border-border/60 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-8 sm:p-12 md:p-16 text-center shadow-xl">
          {/* Subtle glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
            <div className="size-96 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>Sẵn Sàng Cho Cơ Hội Việc Làm Mới?</span>
          </div>

          <h2 className="mt-4 text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-foreground">
            Bắt Đầu Buổi Phỏng Vấn Giả Lập Của Bạn Ngay Hôm Nay
          </h2>

          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            Chỉ mất 2 phút để tải CV và bắt đầu phiên phỏng vấn tương tác giọng nói với trợ lý AI. Nhận ngay nhận xét chi tiết và nâng tầm câu trả lời theo chuẩn STAR.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/interview/setup"
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className: "w-full sm:w-auto font-semibold text-base px-8 h-12 shadow-lg shadow-primary/20 gap-2",
              })}
            >
              <span>Bắt đầu phỏng vấn ngay</span>
              <ArrowRight className="size-5" />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              100% Bảo mật thông tin PII
            </span>
            <span>•</span>
            <span>Không yêu cầu thẻ tín dụng</span>
            <span>•</span>
            <span>Miễn phí 3 buổi phỏng vấn đầu tiên</span>
          </div>
        </div>
      </div>
    </section>
  );
}
