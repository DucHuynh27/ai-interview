import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
    variable: "--font-sans",
    subsets: ["latin", "vietnamese"],
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin", "vietnamese"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "AI-Interview | Luyện phỏng vấn thông minh chuẩn STAR",
    description:
        "Nền tảng luyện phỏng vấn giả lập AI với 3 Persona phỏng vấn viên, chấm điểm chuẩn STAR Framework, bảo mật PII tự động và tương tác giọng nói trực tiếp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="vi"
            className={`${beVietnamPro.variable} ${jetbrainsMono.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col font-sans">{children}</body>
        </html>
    );
}
