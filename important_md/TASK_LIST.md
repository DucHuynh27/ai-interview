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
| **Sprint 5** | Database, Auth & Pitching    | Google Login, Cloud Database, Dashboard lịch sử & Demo deck | 🔄 Đang thực hiện |   60%   |

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

- [x] **Task 5.1:** Tích hợp Google OAuth qua NextAuth (Auth.js v5):
    - _Files:_ `src/auth.ts`, `src/types/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/components/auth/SessionProvider.tsx`, `src/components/auth/AuthButton.tsx`, `src/components/landing/header.tsx`, `src/app/layout.tsx`, `src/components/auth/auth.test.ts`.
    - _Tiêu chuẩn hoàn thành (DoD):_ Đăng nhập Google an toàn qua Auth.js v5, lưu trữ session token, cung cấp AuthButton (đăng nhập/đăng xuất/avatar) trên Header, bọc SessionProvider toàn cục và vượt qua bộ kiểm thử unit test.
- [x] **Task 5.2:** Kết nối Database PostgreSQL Cloud (Neon/Supabase) qua Prisma:
    - _Files:_ `prisma/schema.prisma`, `prisma.config.ts`, `src/lib/db/prisma.ts`, `src/lib/db/mappers.ts`, `src/lib/db/interview-repository.ts`, `src/app/actions/persistence.ts`, `src/lib/db/interview-repository.test.ts`.
    - _Tiêu chuẩn hoàn thành (DoD):_ Lưu trữ đầy đủ lịch sử các buổi phỏng vấn, transcript câu trả lời và báo cáo điểm số. Chiến lược fail-soft (không làm sập luồng chính khi DB lỗi) và chỉ lưu khi người dùng đã đăng nhập; khách ẩn danh vẫn dùng được qua sessionStorage. Vượt qua bộ kiểm thử unit test.
- [ ] **Task 5.3:** Màn hình Dashboard cá nhân (`/dashboard`):
    - _Files:_ `src/app/dashboard/page.tsx`.
    - _Tiêu chuẩn hoàn thành (DoD):_ Xem lại các buổi phỏng vấn cũ, biểu đồ tiến bộ điểm số qua thời gian.
- [ ] **Task 5.4:** Chuẩn bị Demo Khởi nghiệp (Startup Pitching Assets):
    - _Nội dung:_ Bài thuyết trình Unit Economics (~200đ/buổi), tài liệu bảo mật PII, kịch bản demo trực tiếp 3 phút "chuẩn không tì vết" trên sân khấu.

---

## 🐞 Nhật Ký Sửa Lỗi Go-Live — 26/10/2026

> **Triệu chứng khởi đầu:** sau khi gán lại domain `aiinterview.id.vn` cho project Vercel, bấm "Bắt đầu phỏng vấn ngay" (upload CV) thì UI báo `Lỗi kết nối máy chủ: Minified React error #441`; request `POST /interview/setup` trả **HTTP 500** với body `0:{"a":"$@1",...}` / `1:E{"digest":"3310694888"}`.

### Bug 1 — Server Action 500, React rút gọn thành `#441`
- **Nguyên nhân gốc:** `src/lib/db/prisma.ts` chỉ đọc `process.env.DATABASE_URL` và **ném lỗi ngay tại thời điểm nạp module** khi biến trống. Supabase ↔ Vercel integration **không tạo** biến tên `DATABASE_URL` (nó inject `POSTGRES_PRISMA_URL`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`), nên trên Production route chết trước khi hàm Server Action kịp chạy. Digest không có hậu tố `@E<code>` ⇒ đây là lỗi code app (không phải lỗi nội bộ Next), và Production đã ẩn message nên React bọc thành `#441`.
- **Khắc phục:**
    - `src/lib/db/prisma.ts`: thêm `resolveConnectionString()` → `DATABASE_URL ?? POSTGRES_PRISMA_URL ?? POSTGRES_URL`.
    - `prisma.config.ts`: ưu tiên `POSTGRES_URL_NON_POOLING` cho `db push`/migrate (pgbouncer không chạy được DDL).
    - Commit `a770366` — `fix(db): resolve connection string from Supabase POSTGRES_* env vars`.

### Bug 2 — Server Action có thể bị Vercel cắt giữa chừng
- **Nguyên nhân:** dự án chưa khai báo `maxDuration` ở bất kỳ đâu; serverless function của gói Hobby mặc định chỉ ~10s, trong khi các call Gemini (đọc CV, phản hồi từng lượt, chấm STAR) và route TTS chia chunk cần lâu hơn.
- **Khắc phục:** thêm `export const maxDuration = 60;` tại `src/app/interview/setup/page.tsx`, `src/app/interview/[id]/page.tsx`, `src/app/interview/[id]/result/page.tsx`, `src/app/api/tts/route.ts`. Commit `ec19cb5`.

### Bug 3 — Upload CV treo ~3,9 phút mới xong
- **Nguyên nhân:** SDK `@google/genai` mặc định **tự retry 5 lần** với backoff leo dần tới trần **60s** (`DEFAULT_RETRY_ATTEMPTS = 5`, `DEFAULT_RETRY_MAX_DELAY = 60.0`). Khi `gemini-3.8-flash` quá tải (503), SDK âm thầm thử lại nên request treo gần 4 phút, tầng fallback của app không hề hay biết. Log đo được: `POST /interview/setup 200 in 3.9min`.
- **Khắc phục (`src/lib/ai/gemini-client.ts`):**
    - Truyền `config.httpOptions = { timeout, retryOptions: { attempts: 1, ... } }` cho mọi lần gọi ⇒ tắt retry mù để chính `generateContentWithFallback` quyết định đổi model.
    - Timeout mặc định 25s, **kẹp sàn 10s** (Google API từ chối deadline < 10s), chỉnh qua `GEMINI_TIMEOUT_MS` / `GEMINI_MAX_ATTEMPTS`.
    - `FALLBACK_GEMINI_MODEL` cho phép override qua `GEMINI_FALLBACK_MODEL`.
    - Đổi model mặc định sang `gemini-3.5-flash-lite` (qua `GEMINI_MODEL` trong `.env`) vì `gemini-3.8-flash` đang quá tải.
- **Kết quả đo lại:** `POST /interview/setup` **3,9 phút → 5,4 giây**; `gemini-3.8-flash` bị cắt đúng hạn ở **23,8s** (`504 DEADLINE_EXCEEDED`) thay vì treo 4 phút.

### Bug 4 — NextAuth báo "problem with the server configuration"
- **Nguyên nhân:** `/api/auth/session` lỗi cấu hình vì deployment Production thiếu `AUTH_SECRET`/`NEXTAUTH_SECRET` và `NEXTAUTH_URL`.
- **Khắc phục:** bổ sung biến môi trường trên Vercel; tạo `.env` local với `AUTH_SECRET`/`NEXTAUTH_SECRET` sinh bằng `openssl rand -base64 32`.
- **Còn lại:** `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` + redirect URI `https://www.aiinterview.id.vn/api/auth/callback/google` nếu muốn đăng nhập Google (chưa có thì lớp persistence bỏ qua theo đúng thiết kế fail-soft).

### 🕳️ Các task có lỗ hổng dẫn tới những lỗi trên

| Task | Lỗ hổng / Thiếu sót | Đề xuất bổ sung vào DoD |
| :--- | :------------------ | :---------------------- |
| **2.1** | DoD có "fallback error handling rõ ràng" nhưng không quy định **timeout & retry policy**; không có ca kiểm thử cho model bị **treo** (chỉ tính tới 503 trả về nhanh). | Quy định timeout/lần gọi, tắt retry mặc định của SDK, thêm test giả lập model treo. |
| **2.2** | Không xử lý trường hợp action **không bao giờ trả về** → nút quay vô hạn, người dùng không biết đang chờ gì. | Thêm trạng thái timeout/huỷ phía UI và thông báo tiến trình. |
| **5.2** | DoD chỉ yêu cầu "kết nối DB cloud" nhưng bỏ qua **biến môi trường tại môi trường deploy** và tính đa dạng tên biến của nhà cung cấp; `prisma.ts` ném lỗi ở **top-level** nên sập cả route thay vì fail-soft. | Bổ sung checklist biến môi trường theo từng môi trường (Local / Vercel Production / Preview); không throw ở top-level. |
| **5.1** | DoD không yêu cầu cấu hình `AUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_*` trên Production ⇒ `/api/auth/session` lỗi cấu hình. | Bổ sung checklist biến auth bắt buộc cho Production + kiểm tra sau deploy. |
| **1.3** | Giới hạn client 5MB không khớp trần payload thực tế (Vercel ~4.5MB; `bodySizeLimit` đang là 6mb) ⇒ CV lớn sẽ lỗi ở tầng hạ tầng. | Thống nhất một con số (~3MB) hoặc chuyển sang upload qua Route Handler/FormData rồi trả về URL. |
| *(không thuộc task nào)* | Thiếu phần **observability & checklist go-live**: lỗi Production bị React ẩn thành digest nên rất khó chẩn đoán; không có bước kiểm tra `maxDuration`, biến môi trường, và "redeploy sau khi thêm biến". | Thêm task Sprint 5: checklist go-live (env theo môi trường, maxDuration, redeploy) + hiển thị `error.digest` ra UI/log để trace nhanh. |
| **Quy trình** | Vi phạm **Quy tắc 5** (`AGENT.md`): hai commit `a770366`, `ec19cb5` đã được push **trực tiếp lên `main`** thay vì qua branch + Pull Request. | Thống nhất cách xử lý hậu kiểm (mở PR bổ sung/ngoại lệ hoá cho hotfix) và nhắc agent tạo branch trước khi sửa. |

### 📌 Việc còn nợ (Follow-up)
- Cập nhật `.env.example` với các biến mới: `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL`, `GEMINI_TIMEOUT_MS`, `GEMINI_MAX_ATTEMPTS`, `POSTGRES_URL_NON_POOLING`.
- Chốt lại giới hạn dung lượng CV (client vs `bodySizeLimit` vs trần của Vercel).
- Cân nhắc bật lại `gemini-3.8-flash` làm primary sau khi có timeout (chấp nhận tối đa ~25s trước khi fallback) nếu cần chất lượng câu hỏi cao hơn.
