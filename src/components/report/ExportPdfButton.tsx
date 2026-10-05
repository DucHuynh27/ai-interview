"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface ExportPdfButtonProps {
    sessionId?: string;
    className?: string;
    disabled?: boolean;
}

export function ExportPdfButton({
    sessionId,
    className,
    disabled = false,
}: ExportPdfButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        if (disabled || isExporting) return;

        setIsExporting(true);

        const originalTitle = document.title;
        const sanitizedId = sessionId ? `-${sessionId.slice(0, 8)}` : "";
        document.title = `Bao-Cao-Phong-Van-STAR${sanitizedId}`;

        // Giúp UI kích hoạt trạng thái trước khi mở hộp thoại in
        setTimeout(() => {
            window.print();
            document.title = originalTitle;
            setIsExporting(false);
        }, 150);
    };

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={disabled || isExporting}
            className={`border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white print:hidden ${className ?? ""}`}
            title="Tải toàn bộ báo cáo phân tích STAR về máy dưới định dạng PDF"
        >
            {isExporting ? (
                <>
                    <Loader2 className="mr-1.5 size-4 animate-spin text-emerald-400" />
                    <span>Đang tạo PDF...</span>
                </>
            ) : (
                <>
                    <Download className="mr-1.5 size-4 text-emerald-400" />
                    <span>Tải báo cáo (PDF)</span>
                </>
            )}
        </Button>
    );
}
