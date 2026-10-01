# AGENT GUIDELINES & CONTEXT: AI-INTERVIEW

Tài liệu này là "Bộ quy tắc ứng xử và ngữ cảnh dự án" dành cho tất cả các AI Coding Agents (Antigravity, Cursor, Claude Code, Windsurf, GitHub Copilot, v.v.) khi làm việc trong repository này. Mọi AI Agent khi bắt đầu phiên làm việc **BẮT BUỘC PHẢI ĐỌC VÀ TUÂN THỦ** các chỉ dẫn dưới đây.

---

## 1. Tổng Quan Dự Án (Project Identity)
- **Tên dự án:** `AI-Interview`
- **Mục tiêu:** Xây dựng Web App phỏng vấn giả lập thông minh phục vụ **sinh viên mới ra trường và người chuyển ngành** luyện tập phỏng vấn xin việc, hướng tới tham gia **cuộc thi khởi nghiệp trong 3 tháng**.
- **Tính năng đột phá (UVP - Unique Value Proposition):**
  1. **Upload CV dạng PDF:** Đọc trực tiếp nội dung bằng Gemini AI đa phương thức.
  2. **Bảo mật dữ liệu (PII Masking):** Tự động che số điện thoại, email, địa chỉ trước khi gửi dữ liệu sang AI.
  3. **3 Phong cách phỏng vấn (Interviewer Personas):**
     - *Friendly HR:* Thân thiện, khích lệ người mới.
     - *Challenging Manager (Stress Test):* Đào sâu, bắt bẻ phản biện.
     - *Technical Lead:* Trọng tâm kỹ năng chuyên môn và bài toán thực tế.
  4. **Song ngữ:** Hỗ trợ đầy đủ cả **Tiếng Việt** và **Tiếng Anh**.
  5. **Tương tác giọng nói (Turn-based Voice):** AI đọc câu hỏi qua TTS $\rightarrow$ Ứng viên trả lời bằng giọng nói qua STT $\rightarrow$ Phản hồi tự nhiên.
  6. **Báo cáo chuẩn STAR Framework:** Đánh giá Situation, Task, Action, Result; chỉ ra điểm mạnh/yếu và cung cấp câu trả lời mẫu điểm 10.
  7. **Chi phí siêu rẻ (Unit Economics):** ~200 VNĐ / phiên phỏng vấn 15 phút.

---

## 2. Tech Stack Chuẩn Hóa (Strict Stack Guardrails)
Tất cả AI Agent **TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ Ý THAY ĐỔI** công nghệ hoặc cài đặt các thư viện xung đột:

- **Framework:** Next.js 15 (App Router) - Fullstack Monolith (Frontend + Server Actions / Route Handlers).
- **Ngôn ngữ:** TypeScript (Chế độ strict mode, không sử dụng `any` bừa bãi).
- **Styling & UI:** Tailwind CSS + `shadcn/ui` + `lucide-react`.
- **Database:** PostgreSQL Serverless (Neon hoặc Supabase).
- **ORM:** Prisma ORM.
- **Authentication:** Clerk Auth hoặc NextAuth.js (ưu tiên Google OAuth).
- **AI Engine:** Google Gemini 2.0 Flash / 1.5 Flash (`@google/genai` hoặc `@google/generative-ai`).
- **Speech Engine:**
  - STT: Web Speech API (Client-side, 0 latency, 0 đồng).
  - TTS: Web Speech Synthesis / Edge-TTS (giọng đọc tự nhiên, 0 đồng).
- **Deployment:** Vercel.

---

## 3. Quy Tắc Dành Cho AI Agent (Agent Rules & Boundaries)

### Quy tắc 1: "Smart Vibe Coding" - Làm từng tính năng nhỏ
- **Không bao giờ** sinh một lúc hàng chục file code không liên quan.
- Bám sát danh sách công việc trong `important_md/TASK_LIST.md`.
- Mỗi lần chỉ tập trung giải quyết **ĐÚNG 1 TASK** được người dùng giao.

### Quy tắc 2: Tôn trọng cấu trúc và không tự ý phá vỡ
- Không tự ý xóa, đổi tên file hoặc thay đổi cấu trúc thư mục đã thống nhất.
- Không tự ý chạy `npm install` các thư viện lạ khi chưa giải thích lý do cho người dùng.

### Quy tắc 3: Luôn giải thích "Tại sao?" (Why-first Explanation)
- Sau khi viết một đoạn code logic quan trọng (như Server Action, xử lý Web Speech, gọi Gemini API, Prisma query), hãy giải thích ngắn gọn **2-3 gạch đầu dòng**:
  - Đoạn code này giải quyết vấn đề gì?
  - Dữ liệu đi vào và đi ra như thế nào?
  - Giúp người dùng hiểu sâu bản chất để tự tin trả lời ban giám khảo cuộc thi khởi nghiệp.

### Quy tắc 4: An toàn kiểu dữ liệu (Type Safety)
- Luôn định nghĩa rõ ràng interface / type trong `src/types/`.
- Kết quả trả về từ Gemini AI **phải luôn được validate** (ưu tiên dùng Zod hoặc Typed Schema) trước khi đưa vào Database hoặc render lên giao diện.

### Quy tắc 5: Quy trình Git Commit nghiêm ngặt (Strict Git Workflow)
- **Kiểm tra trước khi sửa:** BẮT BUỘC chạy `git status` trước khi thực hiện bất kỳ chỉnh sửa hoặc tạo file mới nào. Nếu còn thay đổi chưa commit, phải commit dứt điểm trước khi làm việc mới.
- **Commit ngay sau khi làm xong:** Mỗi khi hoàn thành một chỉnh sửa hoặc tạo mới file, BẮT BUỘC chạy commit ngay lập tức.
- **Chuẩn commit:** Tuân thủ quy chuẩn Conventional Commits và **BẮT BUỘC PHẢI CÓ SCOPE**, viết hoàn toàn bằng tiếng Anh:
  - Cấu trúc: `<type>(<scope>): <description>`
  - Types: `feat`, `fix`, `docs`, `refactor`, `style`, `test`, `chore`.
  - Scopes ví dụ: `(landing)`, `(interview)`, `(voice)`, `(report)`, `(agent)`, `(nix)`, `(auth)`, `(db)`, `(deps)`.
  - Ví dụ chuẩn:
    - `feat(landing): add hero section and CTA buttons`
    - `docs(agent): require mandatory scope in conventional commits`
    - `fix(pii): correct vietnamese phone regex pattern`
    - `chore(deps): install lucide-react icons`
    - `refactor(speech): split web speech hooks into separate modules`

---

## 4. Môi Trường Hệ Điều Hành: NixOS
- Máy trạm phát triển đang chạy **NixOS 26.11 (Zokor)**.
- Khi cần cấu hình dev shell hoặc công cụ môi trường, sử dụng giải pháp chuẩn của Nix (`shell.nix`, `flake.nix` hoặc `devenv`) để đảm bảo tính tái lập (reproducible build).

---

## 5. Các Lệnh Terminal Thường Dùng (Sử dụng pnpm)
```bash
# Chạy môi trường development
pnpm dev

# Kiểm tra lỗi TypeScript và build
pnpm build

# Chạy linter
pnpm lint

# Cài đặt package mới
pnpm add <package-name>
pnpm add -D <package-name>

# Đồng bộ Database Schema (Prisma)
pnpm prisma db push

# Mở giao diện xem trực tiếp Database
pnpm prisma studio
```

---

## 6. Quy Ước Thư Mục (Folder Conventions)
```text
src/
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   ├── (auth)/           # Route nhóm xác thực
│   ├── (dashboard)/      # Route lịch sử, phân tích
│   ├── interview/        # Setup, Room phỏng vấn, Kết quả
│   └── api/              # Route Handlers
├── components/           # UI Components tái sử dụng (chia theo domain)
│   ├── ui/               # shadcn/ui components (button, dialog, input...)
│   ├── voice/            # Micro button, Waveform visualizer
│   ├── interview/        # Khung đối thoại, Avatar AI
│   └── report/           # Radar chart STAR, Score card
├── lib/                  # Utilities, DB client, AI SDK helpers
│   ├── ai/               # Gemini client & Prompts
│   ├── db/               # Prisma client
│   └── utils/            # Helper functions, PII Masking
└── types/                # TypeScript type definitions
```
