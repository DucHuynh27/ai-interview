<p align="center">
  <img src="public/logo.png" alt="AI-Interview Logo" width="100" height="100" style="border-radius: 20%;" />
</p>

<h1 align="center">AI-Interview</h1>

<p align="center">
  <strong>Nền tảng phỏng vấn giả lập thông minh chuẩn STAR dành cho sinh viên và người chuyển ngành</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Gemini-2.0%20Flash-4285F4?style=flat-square&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

## 🎯 Giới Thiệu Dự Án

**AI-INTERVIEW** :Web phỏng vấn giả lập AI dành cho sinh viên và người chưa có kinh nghiệm phỏng vấn thực tế. Với mục tiêu: **trải nghiệm mượt mà, bảo mật thông tin cá nhân cao và chi phí vận hành siêu tối ưu**.

### ✨ Tính Năng Đột Phá (Unique Value Proposition)t

1. **Upload CV dạng PDF:** Phân tích trực tiếp kỹ năng và học vấn bằng Google Gemini AI đa phương thức.
2. **Khử định danh tự động (PII Masking):** Tự động phát hiện và che số điện thoại, email, địa chỉ trước khi truyền dữ liệu sang AI, bảo vệ quyền riêng tư người dùng.
3. **3 Phong cách phỏng vấn viên (Personas):**
    - _Friendly HR:_ Thân thiện, động viên ứng viên mới làm quen.
    - _Challenging Manager (Stress Test):_ Phản biện đào sâu, thử thách khả năng chịu áp lực và giải quyết xung đột.
    - _Technical Lead:_ Chuyên sâu kiến thức kỹ thuật, tư duy thuật toán và kinh nghiệm thực chiến.
4. **Hỗ trợ Song ngữ:** Phỏng vấn và nhận đánh giá bằng cả **Tiếng Việt** và **Tiếng Anh**.
5. **Tương tác giọng nói (Turn-based Voice):**
    - **STT (Speech-to-Text):** Chuyển đổi giọng nói người dùng theo thời gian thực (0đ độ trễ thấp qua Web Speech API).
    - **TTS (Text-to-Speech):** AI đọc to câu hỏi phỏng vấn tự nhiên.
6. **Báo cáo chuyên sâu chuẩn STAR Framework:**
    - Chấm điểm chi tiết 4 trụ cột: **Situation**, **Task**, **Action**, **Result** (thang điểm 10).
    - Phân tích điểm mạnh, điểm cần cải thiện cho từng câu hỏi.
    - Cung cấp **Câu trả lời mẫu điểm 10 (Gold Standard Answer)** tối ưu dựa trên chính CV của ứng viên.
7. **Chi phí vận hành siêu rẻ (Unit Economics):** ~20 - 50 VNĐ cho mỗi phiên phỏng vấn 5 câu hỏi.

---

## 🛠️ Tech Stack Chuẩn Hóa

- **Frontend & Backend:** [Next.js](https://nextjs.org/) (App Router, Server Actions) + [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Giao diện & UI:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [lucide-react](https://lucide.dev/)
- **Trí tuệ nhân tạo (AI Engine):** [Google Gemini 2.0 Flash](https://ai.google.dev/) (`@google/genai`)
- **Speech Engine:** Web Speech API (Client-side Speech Recognition & Synthesis)
- **Database & ORM:** PostgreSQL Serverless ([Neon](https://neon.tech/) / [Supabase](https://supabase.com/)) + [Prisma ORM](https://www.prisma.io/)
- **Xác thực (Authentication):** Clerk Auth / NextAuth.js
- **Package Manager:** `pnpm`

---

## 🏗️ Kiến Trúc Hệ Thống

```mermaid
graph LR
    User([Ứng viên]) -->|Upload PDF + JD| Client[Next.js Client]
    Client -->|PII Masking Client| Server[Server Actions]
    Server -->|Sanitized Prompt| Gemini[Gemini 2.0 Flash]
    Gemini -->|5 STAR Questions| Server
    Server -->|Sync Session| DB[(PostgreSQL)]
    Client <-->|Voice Q&A Loop| Server
    Server -->|STAR Report| Client
```

Chi tiết kiến trúc và luồng dữ liệu xem tại [ARCHITECTURE.md](important_md/ARCHITECTURE.md).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Môi Trường Cục Bộ

### 1. Yêu cầu hệ thống

- **Node.js:** `>= 20.x`
- **Package Manager:** `pnpm` (`npm install -g pnpm`)

### 2. Cài đặt các gói phụ thuộc

```bash
git clone https://github.com/DucHuynh27/ngocdieu.git AI-Interview
cd AI-Interview
pnpm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env.local` dựa trên mẫu:

```bash
cp .env.example .env.local
```

Cập nhật các khóa API cần thiết:

```env
# Google Gemini API (Bắt buộc)
GEMINI_API_KEY="your-gemini-api-key"

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# NextAuth / Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Khởi động môi trường phát triển

```bash
pnpm dev
```

Truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt để trải nghiệm.

### 5. Kiểm tra mã nguồn & Tests

```bash
# Kiểm tra định dạng mã nguồn
pnpm lint

# Chạy Unit Tests
pnpm test

# Kiểm tra build production
pnpm build
```

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
AI-Interview/
├── important_md/           # Tài liệu định hướng và đặc tả kiến trúc
│   ├── AGENT.md            # Quy tắc bắt buộc cho AI Agents và nhà phát triển
│   ├── ARCHITECTURE.md     # Đặc tả kiến trúc, Data flow, DB schema
│   └── TASK_LIST.md        # Lộ trình Sprint và bảng tiến độ
├── public/                 # Static assets (logo.png, icons, fonts)
├── src/
│   ├── app/                # Next.js App Router (Pages, Layouts, Server Actions)
│   │   ├── (auth)/         # Routes xác thực
│   │   ├── (dashboard)/    # Quản lý lịch sử và báo cáo
│   │   ├── interview/      # Luồng phỏng vấn (setup, room, result)
│   │   └── api/            # API Route Handlers
│   ├── components/         # Giao diện người dùng tái sử dụng
│   │   ├── landing/        # Các section trên Landing Page
│   │   ├── interview/      # Khung đối thoại, Avatar AI
│   │   ├── voice/          # Nút micro, Waveform visualizer
│   │   ├── report/         # Bảng điểm STAR, Radar Chart
│   │   └── ui/             # shadcn/ui components
│   ├── lib/                # Logic nghiệp vụ, SDKs, Database clients
│   │   ├── ai/             # Gemini API client và prompts
│   │   ├── db/             # Prisma client
│   │   └── utils/          # Helper functions, PII Masking regex
│   └── types/              # Type definitions (TypeScript interfaces)
├── package.json
└── README.md
```

---

## 🗺️ Lộ Trình Phát Triển (Roadmap)

- [x] **Sprint 1:** Khởi tạo nền tảng, Landing page, Setup UI và PII Masking.
- [x] **Sprint 2:** Xử lý CV PDF đa phương thức, sinh 5 câu hỏi phỏng vấn STAR qua Gemini 2.0 Flash.
- [ ] **Sprint 3:** Tích hợp phòng phỏng vấn giọng nói (Web Speech STT + TTS).
- [ ] **Sprint 4:** Bộ chấm điểm STAR và xuất báo cáo điểm số chi tiết.
- [ ] **Sprint 5:** Xác thực người dùng, lưu trữ Database và chuẩn bị Pitching deck.

Theo dõi tiến độ chi tiết tại [TASK_LIST.md](important_md/TASK_LIST.md).

---

## 📜 Quy Ước Đóng Góp (Git Guidelines)

Dự án áp dụng chặt chẽ quy chuẩn **Conventional Commits** có **Scope bắt buộc**:

```text
<type>(<scope>): <description>
```

- **Types:** `feat`, `fix`, `docs`, `refactor`, `style`, `test`, `chore`
- **Scopes:** `(landing)`, `(interview)`, `(voice)`, `(report)`, `(agent)`, `(auth)`, `(db)`, `(deps)`, `(pii)`, `(readme)`
- **Ví dụ:**
    - `feat(landing): replace sparkles icon with project logo image`
    - `docs(readme): add comprehensive project documentation`
    - `fix(pii): update vietnamese phone number sanitization regex`

---

## 📄 Bản Quyền & Giấy Phép

Dự án được phân phối dưới giấy phép **MIT License**. Mọi đóng góp xin vui lòng tạo issue hoặc pull request.
