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
    title: "AI-Interview | Luyện phỏng vấn thông minh chuẩn STAR",
    description:
        "Nền tảng luyện phỏng vấn giả lập AI với 3 Persona phỏng vấn viên, chấm điểm chuẩn STAR Framework, bảo mật PII tự động và tương tác giọng nói trực tiếp.",
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
