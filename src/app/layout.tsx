import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI-Interview | Luyện Phỏng Vấn Giả Lập Chuẩn STAR Cùng AI",
  description:
    "Nền tảng phỏng vấn giả lập thông minh hỗ trợ sinh viên và người chuyển ngành. Tải CV PDF, bảo mật PII, đối thoại giọng nói với 3 Personas và nhận báo cáo STAR cùng câu trả lời mẫu điểm 10.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
