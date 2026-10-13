# TASK LIST & SPRINT PROGRESS: AI-INTERVIEW

Bảng theo dõi tiến độ chi tiết từng Sprint và từng Task của dự án **AI-Interview**.
Mỗi khi bắt đầu hoặc hoàn thành một task, hãy cập nhật trạng thái `[ ]` thành `[x]` trong file này.

---

## 📊 Bảng Tổng Quan Tiến Độ

| Sprint       | Tên Sprint                   | Mục Tiêu Chính                                              |    Trạng Thái     | Tiến Độ |
| :----------- | :--------------------------- | :---------------------------------------------------------- | :---------------: | :-----: |
| **Sprint 1** | Khởi Tạo Nền Tảng & Setup UI | Dựng khung Next.js 15, UI Upload CV PDF & PII Masking       |   ✅ Hoàn thành   |  100%   |
| **Sprint 2** | Não Bộ AI (Gemini 2.0 Flash) | Parse PDF CV, đối soát JD, sinh 5 câu hỏi STAR & Persona    |   ✅ Hoàn thành   |  100%   |
| **Sprint 3** | Phòng Phỏng Vấn Giọng Nói    | Turn-based Voice (Web Speech STT & TTS), Waveform UI        |   ✅ Hoàn thành   |  100%   |
| **Sprint 4** | Đánh Giá STAR & Báo Cáo      | Chấm điểm Situation, Task, Action, Result & Câu mẫu điểm 10 |   ✅ Hoàn thành   |  100%   |
| **Sprint 5** | Database, Auth & Pitching    | Google Login, Cloud Database, Dashboard lịch sử & Demo deck |   Chưa bắt đầu    |   0%    |

---

## 🏃 Chi Tiết Từng Sprint & Task

### SPRINT 1: Khởi Tạo Nền Tảng, Agent Context & Setup UI (Tuần 1 - Tuần 2)

- [x] **Task 1.0:** Khởi tạo bộ 3 file Context `important_md/AGENT.md`, `important_md/ARCHITECTURE.md`, `important_md/TASK_LIST.md` để đồng bộ ngữ cảnh cho mọi AI agent.
    - _Tiêu chuẩn hoàn thành (DoD):_ Cả 3 file đã được tạo với đầy đủ thông số kỹ thuật, quy tắc stack và roadmap.
- [x] **Task 1.1:** Khởi tạo dự án Next.js 15 với TypeScript, Tailwind CSS và bộ UI `shadcn/ui`.
    - _Files:_ `package.json`, `tailwind.config.ts`, `components.json`, `src/app/layout.tsx`.
    - _Tiêu chuẩn hoàn thành (DoD):_ Chạy `pnpm dev` hiển thị trang chủ thành công, `pnpm build` không có lỗi lint/types.
- [x] **Task 1.2:** Thiết kế Landing Page giới thiệu tính năng & Nút "Bắt đầu phỏng vấn ngay".
    - _Files:_ `src/app/page.tsx`, `src/components/landing/*`.
    - _Tiêu chuẩn hoàn thành (DoD):_ Giao diện hiện đại, responsive trên cả mobile và desktop, giới thiệu 3 Persona và chuẩn STAR.
- [x] **Task 1.3:** Xây dựng màn hình Cấu hình phỏng vấn (`/interview/setup`):
    - _Files:_ `src/app/interview/setup/page.tsx`, `src/components/interview/SetupForm.tsx`.
    - _Tính năng:_ Drag & Drop file PDF CV, Textarea dán JD, Bộ chọn Ngôn ngữ (VI/EN), Bộ chọn Persona (3 lựa chọn trực quan).
    - _Tiêu chuẩn hoàn thành (DoD):_ Validate form đầy đủ (bắt buộc có CV PDF và JD, dung lượng PDF < 5MB).
- [x] **Task 1.4:** Xây dựng Module PII Masking (Khử định danh thông tin cá nhân):
    - _Files:_ `src/lib/utils/pii-masker.ts`, `src/lib/utils/pii-masker.test.ts`.
    - _Tiêu chuẩn hoàn thành (DoD):_ Tự động phát hiện và che SĐT, Email, Địa chỉ thành `[REDACTED_PHONE]`, `[REDACTED_EMAIL]`.

---

### SPRINT 2: Não Bộ AI - Gemini 2.0 Flash API (Tuần 3 - Tuần 4)

- [x] **Task 2.1:** Thiết lập Google Gemini SDK và cấu hình biến môi trường `.env.local`.
    - _Files:_ `src/lib/ai/gemini-client.ts`, `.env.example`.
    - _Tiêu chuẩn hoàn thành (DoD):_ Kết nối thành công tới Gemini 2.0 Flash API, có fallback error handling rõ ràng.
- [x] **Task 2.2:** Xây dựng Server Action xử lý CV PDF và JD (`generateInterviewQuestions`):
    - _Files:_ `src/app/actions/interview.ts`, `src/lib/ai/prompts/question-generator.ts`.
    - _Tiêu chuẩn hoàn thành (DoD):_ Đọc file PDF buffer, gửi kèm JD và prompt Persona sang Gemini, trả về JSON 5 câu hỏi chuẩn type.
- [x] **Task 2.3:** Xây dựng màn hình Preview & Xác nhận trước khi vào phòng (`/interview/[id]/preview`):
    - _Files:_ `src/app/interview/[id]/preview/page.tsx`, `src/components/interview/SetupForm.tsx` (updated).
    - _Tiêu chuẩn hoàn thành (DoD):_ Hiển thị tóm tắt các điểm mạnh, điểm khuyết AI vừa phân tích và danh sách 5 câu hỏi chuẩn bị phỏng vấn.

---

### SPRINT 3: Phòng Phỏng Vấn Giọng Nói (Text $\rightarrow$ Voice) (Tuần 5 - Tuần 7)

- [x] **Task 3.1:** Dựng giao diện Phòng phỏng vấn giả lập (`/interview/[id]`):
    - _Files:_ `src/app/interview/[id]/page.tsx`, `src/components/interview/InterviewRoom.tsx`.
    - _Tiêu chuẩn hoàn thành (DoD):_ Mô phỏng phòng họp online chuyên nghiệp: Avatar người phỏng vấn tương ứng Persona, khung phụ đề, thanh tiến độ 5 câu hỏi.
- [x] **Task 3.2:** Luồng hỏi - đáp từng lượt bằng Text (Base Conversation Loop):
    - _Files:_ `src/types/interview.ts`, `src/lib/ai/prompts/turn-responder.ts`, `src/app/actions/interview.ts`, `src/components/interview/InterviewRoom.tsx`.
    - _Tiêu chuẩn hoàn thành (DoD):_ AI hiển thị câu hỏi $\rightarrow$ Ứng viên gõ trả lời $\rightarrow$ AI đưa ra phản hồi ngắn dẫn dắt $\rightarrow$ chuyển câu kế tiếp mượt mà.
- [x] **Task 3.3:** Tích hợp Web Speech API (Speech-to-Text) tiếng Việt & tiếng Anh:
    - _Files:_ `src/lib/speech/use-speech-recognition.ts`, `src/components/voice/MicButton.tsx`, `src/components/voice/Waveform.tsx`.
    - _Tiêu chuẩn hoàn thành (DoD):_ Bấm nút Mic nói $\rightarrow$ chữ hiện realtime vào ô trả lời $\rightarrow$ có hiệu ứng sóng âm nhấp nhô theo âm lượng.
- [x] **Task 3.4:** Tích hợp Text-to-Speech (TTS) phát âm giọng đọc AI:
    - _Files:_ `src/lib/speech/use-speech-synthesis.ts`.
    - _Tiêu chuẩn hoàn thành (DoD):_ AI tự động đọc to câu hỏi bằng tiếng Việt hoặc tiếng Anh chuẩn khi đến lượt.

---

### SPRINT 4: Đánh Giá STAR & Báo Cáo Chuyên Sâu (Tuần 8 - Tuần 10)

- [x] **Task 4.1:** Xây dựng Engine chấm điểm STAR trên Gemini (`evaluateInterviewSession`):
    - _Files:_ `src/lib/ai/prompts/star-evaluator.ts`, `src/app/actions/report.ts`.
    - _Tiêu chuẩn hoàn thành (DoD):_ Đọc toàn bộ Transcript buổi phỏng vấn, tính điểm 4 tiêu chí STAR (1-10), điểm tổng quan (1-100), chỉ ra điểm mạnh/yếu cụ thể cho từng câu.
- [x] **Task 4.2:** Thiết kế Giao diện Báo cáo kết quả (`/interview/[id]/result`):
    - _Files:_ `src/app/interview/[id]/result/page.tsx`, `src/components/report/*`.
    - _Tiêu chuẩn hoàn thành (DoD):_ Hiển thị Radar Chart STAR trực quan, Card phân tích điểm mạnh/yếu, và khung "Câu trả lời mẫu điểm 10" cho từng câu.
- [x] **Task 4.3:** Tính năng xuất báo cáo PDF (Export PDF Report):
    - _Files:_ `src/components/report/ExportPdfButton.tsx`, `src/components/report/InterviewResultView.tsx`, `src/app/globals.css`, `src/components/report/export-pdf.test.ts`.
    - _Tiêu chuẩn hoàn thành (DoD):_ Người dùng có thể nhấn nút tải toàn bộ bảng đánh giá về máy để ôn luyện offline.

---

### SPRINT 5: Database, Authentication & Chuẩn Bị Thi Khởi Nghiệp (Tuần 11 - Tuần 12)

- [ ] **Task 5.1:** Tích hợp Google OAuth qua Clerk Auth hoặc NextAuth:
    - _Tiêu chuẩn hoàn thành (DoD):_ Đăng nhập an toàn, lưu thông tin phiên người dùng.
- [ ] **Task 5.2:** Kết nối Database PostgreSQL Cloud (Neon/Supabase) qua Prisma:
    - _Files:_ `prisma/schema.prisma`, `src/lib/db/prisma.ts`.
    - _Tiêu chuẩn hoàn thành (DoD):_ Lưu trữ đầy đủ lịch sử các buổi phỏng vấn, transcript câu trả lời và báo cáo điểm số.
- [ ] **Task 5.3:** Màn hình Dashboard cá nhân (`/dashboard`):
    - _Files:_ `src/app/dashboard/page.tsx`.
    - _Tiêu chuẩn hoàn thành (DoD):_ Xem lại các buổi phỏng vấn cũ, biểu đồ tiến bộ điểm số qua thời gian.
- [ ] **Task 5.4:** Chuẩn bị Demo Khởi nghiệp (Startup Pitching Assets):
    - _Nội dung:_ Bài thuyết trình Unit Economics (~200đ/buổi), tài liệu bảo mật PII, kịch bản demo trực tiếp 3 phút "chuẩn không tì vết" trên sân khấu.
