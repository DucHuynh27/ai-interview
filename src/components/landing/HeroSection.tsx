import Link from "next/link";
import { ArrowRight, Mic, ShieldCheck, Sparkles, CheckCircle2, Bot, Volume2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      {/* Background glowing decorations */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[360px] w-[560px] rounded-full bg-gradient-to-tr from-primary/10 via-primary/5 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-muted">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-primary">AI-Interview v1.0</span>
            <span className="text-muted-foreground">•</span>
            <span>Trợ lý luyện phỏng vấn chuẩn STAR</span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 max-w-4xl text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            Tự tin chinh phục nhà tuyển dụng với{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Phỏng Vấn Giả Lập AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
            Tải lên CV PDF & bản mô tả công việc (JD), đối thoại giọng nói thời gian thực với 3 phong cách phỏng vấn viên, và nhận báo cáo đánh giá chuyên sâu kèm câu trả lời mẫu điểm 10.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <Link
              href="/interview/setup"
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className: "w-full sm:w-auto font-semibold text-base px-7 h-12 shadow-lg shadow-primary/20 gap-2",
              })}
            >
              <span>Bắt đầu phỏng vấn ngay</span>
              <ArrowRight className="size-5" />
            </Link>

            <a
              href="#star-framework"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "w-full sm:w-auto text-base px-6 h-12 font-medium",
              })}
            >
              Tìm hiểu chuẩn STAR
            </a>
          </div>

          {/* Quick Value Badges */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-6 text-xs sm:text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5 justify-center">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Bảo mật dữ liệu (PII Masking)</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <Mic className="size-4 text-primary" />
              <span>Tương tác giọng nói trực tiếp</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <Sparkles className="size-4 text-amber-500" />
              <span>3 Persona phỏng vấn thực chiến</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <CheckCircle2 className="size-4 text-sky-500" />
              <span>Báo cáo STAR & Câu mẫu điểm 10</span>
            </div>
          </div>
        </div>

        {/* Visual Interactive Mockup Card */}
        <div className="mt-14 sm:mt-16 mx-auto max-w-4xl rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-2xl shadow-primary/5">
          {/* Header of Mockup */}
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-3 rounded-full bg-red-400" />
              <div className="size-3 rounded-full bg-amber-400" />
              <div className="size-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-semibold text-muted-foreground">
                Phòng Phỏng Vấn Trực Tuyến • Câu hỏi 2/5
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Turn-based Voice
              </span>
            </div>
          </div>

          {/* Interviewer Dialog Bubble */}
          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4 border border-border/40">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
                <Bot className="size-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Người phỏng vấn • Friendly HR
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Volume2 className="size-3.5 text-primary" /> Đang phát âm thanh
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  &ldquo;Chào bạn! Trong CV bạn có nhắc đến dự án thương mại điện tử kỳ trước. Bạn có thể chia sẻ một tình huống khi deadline cận kề nhưng hệ thống phát sinh lỗi nghiêm trọng và cách bạn cùng nhóm giải quyết không?&rdquo;
                </p>
              </div>
            </div>

            {/* Candidate Voice Response Bubble */}
            <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-4 border border-primary/20">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                <Mic className="size-5 animate-pulse" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Ứng viên (Giọng nói qua Web Speech)
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Đang nhận diện giọng nói...
                  </span>
                </div>
                <p className="text-sm italic text-foreground/90">
                  &ldquo;Vâng ạ, vào tuần cuối trước khi bàn giao (Situation), chúng em gặp lỗi nghẽn cổng thanh toán. Em được giao nhiệm vụ tìm nguyên nhân gốc rễ (Task)...&rdquo;
                </p>
                {/* Simulated Waveform */}
                <div className="flex items-center gap-1 pt-1">
                  {[40, 75, 55, 90, 60, 80, 45, 95, 70, 50, 85, 65, 40].map((height, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-primary/70 transition-all duration-300"
                      style={{ height: `${height * 0.22}px` }}
                    />
                  ))}
                  <span className="ml-2 text-[11px] text-muted-foreground font-mono">00:18s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
