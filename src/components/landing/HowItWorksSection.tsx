import { UploadCloud, Sliders, Mic, FileBarChart } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UploadCloud,
    title: "Tải Lên CV & Dán JD",
    description:
      "Tải lên file PDF CV của bạn và dán mô tả công việc (JD). Hệ thống tự động kích hoạt bộ lọc PII để bảo mật thông tin cá nhân.",
  },
  {
    step: "02",
    icon: Sliders,
    title: "Chọn Persona & Ngôn Ngữ",
    description:
      "Lựa chọn 1 trong 3 phong cách phỏng vấn (Friendly HR, Challenging Manager, Technical Lead) và ngôn ngữ bạn muốn luyện tập (VI/EN).",
  },
  {
    step: "03",
    icon: Mic,
    title: "Đối Thoại Giọng Nói Trực Tiếp",
    description:
      "AI đọc câu hỏi qua giọng nói tự nhiên. Bạn chỉ cần nhấn micro và trả lời như trong một buổi phỏng vấn online thực thụ.",
  },
  {
    step: "04",
    icon: FileBarChart,
    title: "Nhận Báo Cáo Điểm 10",
    description:
      "Xem chi tiết điểm số STAR, điểm mạnh, điểm cần khắc phục và mở khóa câu trả lời mẫu điểm 10 được 'đo ni đóng giày' cho bạn.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 border-t border-border/60">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary">
            Quy Trình Hoạt Động
          </h2>
          <p className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Bắt Đầu Chỉ Với 4 Bước Đơn Giản
          </p>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            Không cần cài đặt phức tạp, bạn có thể hoàn thành một buổi phỏng vấn giả lập trọn vẹn chỉ trong 15 phút.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-mono text-2xl font-black text-muted-foreground/30">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base sm:text-lg font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
