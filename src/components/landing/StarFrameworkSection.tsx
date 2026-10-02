import { CheckCircle2, TrendingUp, Sparkles, Award } from "lucide-react";

const starCriteria = [
  {
    letter: "S",
    title: "Situation (Bối cảnh)",
    description:
      "Bạn có mô tả bối cảnh và thử thách rõ ràng không? Nêu cụ thể dự án, mốc thời gian và vấn đề phát sinh thay vì nói mơ hồ.",
    scoreCriteria: "Thang điểm 10 • Yêu cầu tính cụ thể và ngữ cảnh rõ ràng",
  },
  {
    letter: "T",
    title: "Task (Nhiệm vụ)",
    description:
      "Trách nhiệm và mục tiêu cá nhân của bạn là gì? Bạn cần hoàn thành điều gì để giải quyết tình huống trên?",
    scoreCriteria: "Thang điểm 10 • Yêu cầu phân định rõ vai trò cá nhân",
  },
  {
    letter: "A",
    title: "Action (Hành động)",
    description:
      "Bạn đã chủ động thực hiện những hành động nào? Nhấn mạnh vào hành động của CHÍNH BẠN thay vì nói chung chung 'chúng em / team em'.",
    scoreCriteria: "Thang điểm 10 • Điểm then chốt thể hiện năng lực hành động",
  },
  {
    letter: "R",
    title: "Result (Kết quả)",
    description:
      "Kết quả đạt được ra sao? Có số liệu đo lường định lượng (KPI, % tăng trưởng, số người dùng) và bài học kinh nghiệm không?",
    scoreCriteria: "Thang điểm 10 • Bắt buộc có kết quả định lượng & bài học",
  },
];

export function StarFrameworkSection() {
  return (
    <section id="star-framework" className="py-20 border-t border-border/60 bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Award className="size-3.5" />
            <span>Tiêu Chuẩn Đánh Giá Quốc Tế</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Báo Cáo Phân Tích Chuẩn STAR Framework
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            STAR là phương pháp phỏng vấn hành vi được các tập đoàn hàng đầu thế giới (Google, Amazon, Microsoft) tin dùng.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {starCriteria.map((item) => (
            <div
              key={item.letter}
              className="flex gap-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:border-primary/40"
            >
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-2xl shadow-sm">
                {item.letter}
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <CheckCircle2 className="size-3.5" />
                    {item.scoreCriteria}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Highlight: Gold Standard Answer */}
        <div className="mt-10 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/5 via-card to-primary/5 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                <span>Tính Năng Độc Quyền</span>
              </div>
              <h4 className="text-xl font-bold text-foreground">
                Câu Trả Lời Mẫu Điểm 10 (Gold Standard Answer)
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Không chỉ dừng lại ở việc chấm điểm, AI sẽ tự động tái cấu trúc câu trả lời của bạn thành một phiên bản điểm 10 hoàn hảo dựa trên chính kinh nghiệm thực tế trong CV của bạn, giúp bạn học cách diễn đạt cuốn hút nhất.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-border/80 bg-background/90 p-4 shadow-sm w-full md:w-auto">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-foreground">92/100</div>
                <div className="text-xs font-medium text-muted-foreground">
                  Điểm trung bình sau 3 buổi luyện tập
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
