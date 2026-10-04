"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function InterviewErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Interview Error Boundary caught an error:", error);
    }, [error]);

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400 mb-5">
                <AlertCircle className="size-7" />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">
                Không thể tải trang phỏng vấn
            </h1>

            <p className="mt-2 max-w-md text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {error.message ||
                    "Đã xảy ra sự cố trong quá trình giao tiếp với máy chủ. Vui lòng thử lại hoặc quay lại trang chủ."}
            </p>

            {error.digest && (
                <p className="mt-3 font-mono text-[11px] text-zinc-400">
                    Mã lỗi (Digest): {error.digest}
                </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={() => reset()}
                    className={buttonVariants({
                        size: "sm",
                        className:
                            "bg-emerald-600 font-semibold text-white hover:bg-emerald-500",
                    })}
                >
                    <RotateCcw className="mr-2 size-4" />
                    Thử tải lại trang
                </button>

                <Link
                    href="/"
                    className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className:
                            "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
                    })}
                >
                    <Home className="mr-2 size-4" />
                    Về Trang chủ
                </Link>
            </div>
        </div>
    );
}
