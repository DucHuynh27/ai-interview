import { HeartHandshake, Flame, Terminal, CheckCircle2 } from "lucide-react";

const personas = [
  {
    id: "friendly_hr",
    title: "Friendly HR",
    subtitle: "Thân thiện & Khích lệ",
    icon: HeartHandshake,
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    description:
      "Tạo bầu không khí cởi mở, lắng nghe và khích lệ ứng viên bộc lộ tiềm năng cũng như thái độ tích cực.",
    focusList: [
      "Đánh giá độ phù hợp văn hóa doanh nghiệp (Culture Fit)",
      "Động lực ứng tuyển và định hướng nghề nghiệp",
      "Kỹ năng mềm, làm việc nhóm và giao tiếp",
      "Thích hợp cho sinh viên mới ra trường lấy lại tự tin",
    ],
    sampleQuote:
      "&ldquo;Chào bạn, đừng quá lo lắng nhé! Hãy chia sẻ với tôi về một dự án mà bạn cảm thấy tự hào nhất trong thời gian học tập?&rdquo;",
  },
  {
    id: "challenging_manager",
    title: "Challenging Manager",
    subtitle: "Stress Test & Đào sâu",
    icon: Flame,
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    description:
      "Bắt bẻ phản biện, xoáy sâu vào điểm mâu thuẫn hoặc lỗ hổng trong CV để kiểm tra bản lĩnh ứng phó áp lực.",
    focusList: [
      "Thử thách khả năng chịu áp lực và giải quyết xung đột",
      "Đào sâu vào kết quả thực tế (chất vấn con số định lượng)",
      "Kiểm tra tư duy phản biện và phản ứng khi bị bắt bẻ",
      "Rèn luyện tâm lý thép trước các hội đồng phỏng vấn gắt",
    ],
    sampleQuote:
      "&ldquo;Bạn viết đã tối ưu hóa hiệu năng 30%, nhưng công nghệ bạn dùng thời điểm đó có giới hạn X. Bạn đã đo lường con số đó bằng công cụ gì?&rdquo;",
  },
  {
    id: "tech_lead",
    title: "Technical Lead",
    subtitle: "Chuyên môn sâu & Thực chiến",
    icon: Terminal,
    badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    description:
      "Đánh giá năng lực giải quyết vấn đề kỹ thuật thực tế, kiến trúc hệ thống và cách xử lý sự cố trong mã nguồn.",
    focusList: [
      "Kiểm tra tư duy thuật toán và thiết kế kiến trúc",
      "Truy vấn sâu vào các trade-off kỹ thuật trong dự án cũ",
      "Xử lý bài toán mở và sự cố production thực tế",
      "Đánh giá hiểu bản chất thay vì học thuộc lý thuyết suông",
    ],
    sampleQuote:
      "&ldquo;Nếu lưu lượng truy cập đột ngột tăng gấp 10 lần và Database bị thắt nút cổ chai (bottleneck), bạn sẽ ưu tiên xử lý bước nào trước?&rdquo;",
  },
];

export function PersonasSection() {
  return (
    <section id="personas" className="py-20 border-t border-border/60">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary">
            3 Phong Cách Người Phỏng Vấn (Personas)
          </h2>
          <p className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Luyện Tập Đa Dạng Tình Huống Thực Chiến
          </p>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            Mỗi người phỏng vấn mang một phong cách độc bản, giúp bạn sẵn sàng ứng phó với bất kỳ nhà tuyển dụng nào.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {personas.map((persona) => {
            const Icon = persona.icon;
            return (
              <div
                key={persona.id}
                className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex size-12 items-center justify-center rounded-2xl ${persona.iconBg}`}>
                      <Icon className="size-6" />
                    </div>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${persona.badgeColor}`}>
                      {persona.subtitle}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-foreground">
                    {persona.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {persona.description}
                  </p>

                  <div className="mt-6 border-t border-border/60 pt-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Trọng tâm đánh giá:
                    </span>
                    <ul className="mt-3 space-y-2.5 text-xs sm:text-sm text-foreground/90">
                      {persona.focusList.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="size-4 shrink-0 text-primary mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-muted/60 p-3.5 border border-border/40 text-xs italic text-muted-foreground leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: persona.sampleQuote }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
