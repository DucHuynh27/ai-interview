import {
  FileText,
  ShieldCheck,
  Mic,
  Award,
  Globe2,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Phân Tích CV PDF & JD Chuẩn Xác",
    description:
      "Tải trực tiếp CV file PDF và dán yêu cầu công việc (JD). Gemini 2.0 Flash phân tích đa phương thức để tìm ra các điểm mạnh nổi bật và lỗ hổng kỹ năng cần đào sâu.",
    tag: "Multimodal AI",
  },
  {
    icon: ShieldCheck,
    title: "Bảo Mật Dữ Liệu (PII Masking)",
    description:
      "Tự động phát hiện và che số điện thoại, email, địa chỉ cá nhân thành [REDACTED] trước khi dữ liệu được gửi đến AI, đảm bảo quyền riêng tư tuyệt đối cho ứng viên.",
    tag: "100% Privacy",
  },
  {
    icon: Mic,
    title: "Luyện Nói 2 Chiều (Turn-based Voice)",
    description:
      "AI phát âm câu hỏi bằng giọng đọc tự nhiên (TTS), ứng viên trả lời bằng giọng nói qua Web Speech API (STT) với độ trễ cực thấp và sóng âm trực quan.",
    tag: "Voice Interaction",
  },
  {
    icon: Award,
    title: "Đánh Giá Theo Chuẩn STAR",
    description:
      "Bóc tách từng câu trả lời theo 4 tiêu chí cốt lõi: Situation, Task, Action, Result. Cung cấp câu trả lời mẫu điểm 10 dựa trên chính kinh nghiệm thực tế của bạn.",
    tag: "STAR Framework",
  },
  {
    icon: Globe2,
    title: "Song Ngữ Việt - Anh Linh Hoạt",
    description:
      "Hỗ trợ trọn vẹn cả phỏng vấn bằng Tiếng Việt và Tiếng Anh. Lựa chọn ngôn ngữ phù hợp với mục tiêu ứng tuyển doanh nghiệp trong nước hay tập đoàn toàn cầu.",
    tag: "Bilingual Support",
  },
  {
    icon: Zap,
    title: "Chi Phí Tối Ưu Siêu Rẻ (~200đ / phiên)",
    description:
      "Tối ưu hóa prompt và tận dụng sức mạnh Web Speech API trên trình duyệt giúp chi phí mỗi buổi phỏng vấn 15 phút chỉ từ 20 đến 200 VNĐ, dễ dàng tiếp cận mọi sinh viên.",
    tag: "Unit Economics",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 border-t border-border/60 bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary">
            Tính Năng Đột Phá (UVP)
          </h2>
          <p className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Trang Bị Mọi Thứ Bạn Cần Để Tỏa Sáng
          </p>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            Được thiết kế chuyên biệt cho sinh viên mới ra trường và người chuyển ngành muốn bứt phá trong kỳ phỏng vấn xin việc.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/60">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base sm:text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
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
