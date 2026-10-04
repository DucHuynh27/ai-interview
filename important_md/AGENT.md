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
- **AI Engine:** Google Gemini (`gemini-3.8-flash`, hỗ trợ biến `GEMINI_MODEL`, SDK `@google/genai`).
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

### Quy tắc 5: Quy trình Git Workflow & Task Branching nghiêm ngặt (Strict Git Workflow)
- **Tuyệt đối KHÔNG commit trực tiếp lên nhánh `main`:**
  - Mọi công việc (tính năng mới, refactor, fix bug) đều BẮT BUỘC thực hiện trên một nhánh (branch) riêng biệt. Nhánh `main` chỉ nhận code thông qua Pull Request sau khi vượt qua toàn bộ CI/CD checks.
- **Quy tắc tạo nhánh theo Task (Task-based Branching):**
  - Trước khi bắt đầu một task trong `important_md/TASK_LIST.md`, Agent BẮT BUỘC phải checkout từ `main` mới nhất và tạo branch mới theo đúng quy ước:
    - Tính năng mới: `task-<id>-<kebab-case-description>` (Ví dụ: `task-04-pii-masking`, `task-05-voice-interaction-hooks`, `task-06-interview-page`)
    - Sửa lỗi/Hotfix: `fix/task-<id>-<kebab-case-description>` (Ví dụ: `fix/task-04-phone-regex-edgecase`)
- **Nguyên tắc Atomic Commits (Bắt buộc commit theo file hoặc nhóm file có cùng logic):**
  - **TUYỆT ĐỐI CẤM** dùng `git add .` bừa bãi để gom tất cả các thay đổi không liên quan (ví dụ: vừa sửa types, vừa sửa UI, vừa sửa test, vừa sửa docs) vào chung một commit khổng lồ.
  - **Mỗi commit phải là một đơn vị logic độc lập (Atomic unit):** Chỉ chứa một file hoặc một nhóm file có quan hệ mật thiết với nhau để dễ review, dễ trace bug và dễ `revert` khi cần thiết.
  - **Chia nhỏ commit theo từng tầng trách nhiệm:**
    1. *Tầng Định nghĩa Kiểu (Types & Schemas):* `git add src/types/...` $\rightarrow$ `feat(types): define ...`
    2. *Tầng Logic/Backend/AI:* `git add src/lib/ai/... src/app/actions/...` $\rightarrow$ `feat(evaluator): implement ...`
    3. *Tầng Giao diện (UI Components):* `git add src/components/...` $\rightarrow$ `feat(report-ui): add ...`
    4. *Tầng Kiểm thử (Unit/Integration Tests):* `git add src/.../*.test.ts` $\rightarrow$ `test(masker): add test cases for ...`
    5. *Tầng Tài liệu & Cấu hình:* `git add important_md/... .github/...` $\rightarrow$ `docs(agent): ...` hoặc `ci(github): ...`
- **Kiểm tra trước khi sửa:** BẮT BUỘC chạy `git status` trước khi thực hiện bất kỳ chỉnh sửa hoặc tạo file mới nào. Nếu còn thay đổi chưa commit, phải commit dứt điểm trước khi làm việc mới.
- **Commit ngay sau khi làm xong từng file/nhóm file:** Mỗi khi hoàn thành một chỉnh sửa có ý nghĩa trọn vẹn ở một file hoặc cụm file liên quan, BẮT BUỘC chạy commit ngay lập tức thay vì dồn lại cuối buổi.
- **Chuẩn commit:** Tuân thủ quy chuẩn Conventional Commits và **BẮT BUỘC PHẢI CÓ SCOPE**, viết hoàn toàn bằng tiếng Anh:
  - Cấu trúc: `<type>(<scope>): <description>`
  - Types: `feat`, `fix`, `docs`, `refactor`, `style`, `test`, `chore`.
  - Scopes ví dụ: `(landing)`, `(interview)`, `(voice)`, `(report)`, `(agent)`, `(ci)`, `(nix)`, `(auth)`, `(db)`, `(deps)`.
  - Ví dụ chuẩn:
    - `feat(landing): add hero section and CTA buttons`
    - `docs(agent): require mandatory scope in conventional commits`
    - `fix(pii): correct vietnamese phone regex pattern`
    - `chore(deps): install lucide-react icons`
    - `refactor(speech): split web speech hooks into separate modules`

### Quy tắc 6: Viết Code Tự Nhiên & Triệt Tiêu "Mùi AI" (Human-Grade Code Standards)
Codebase phải phản ánh chất lượng của một Senior Fullstack Engineer, tuyệt đối tránh các "dấu vết" điển hình của AI:
- **Xóa sạch comment hiển nhiên (No Redundant Comments):**
  - CẤM comment mô tả lại cú pháp hoặc hành động hiển nhiên (ví dụ: `// Check if user exists`, `// Return data`, `// Render header component`, `// Handle button click`).
  - CHỈ comment khi giải thích **lý do nghiệp vụ phức tạp**, workaround cho browser quirk / edge-case đặc thù, hoặc ghi chú kỹ thuật thật sự cần thiết.
- **Không phòng thủ quá đà (No Defensive Overkill):**
  - Không bọc `try-catch` vụn vặt ở mọi dòng code; ưu tiên xử lý lỗi tập trung qua Error Boundary hoặc centralized handler.
  - Tận dụng TypeScript strict mode và optional chaining (`?.`, `??`) thay vì lồng 3-4 tầng `if (obj !== null && obj !== undefined)`.
- **Tránh trừu tượng hóa vụn vặt (No Over-Abstraction & Avoid Utils Dumping):**
  - CẤM tự ý tạo các file helper/util chỉ chứa 1-2 dòng code đơn giản. Ưu tiên **Colocation** (viết trực tiếp tại nơi sử dụng).
  - Chỉ tách helper khi logic đó thực sự được tái sử dụng ở từ 2-3 nơi khác nhau trong hệ thống.
- **Đặt tên chuẩn nghiệp vụ (Domain-Driven Naming):**
  - CẤM dùng tên generic, sách giáo khoa: `data`, `item`, `res`, `payload`, `handleData()`, `UserHelper`.
  - BẮT BUỘC dùng tên phản ánh chính xác nghiệp vụ: `candidateCv`, `interviewSessionId`, `maskVietnamesePhone()`, `evaluateStarCriteria()`.
- **Áp dụng Idiom hiện đại của Next.js 15 & React 19:**
  - Tận dụng Server Components mặc định, Server Actions, modern hooks (`useTransition`, `useActionState`), Zod schema validation.
  - CẤM dùng các antipattern cũ (như `useEffect` để fetch data thủ công, state lồng nhau không kiểm soát).
  - Giữ code sạch, format thống nhất theo cấu hình linter/formatter của dự án.

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
