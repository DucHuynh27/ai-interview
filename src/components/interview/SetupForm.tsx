"use client";

import { generateInterviewQuestions } from "@/app/actions/interview";
import { saveInterviewSessionAction } from "@/app/actions/persistence";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
    LanguageCode,
    PersonaOption,
    PersonaType,
    SetupFormValues,
} from "@/types/interview";
import { FREE_TRIAL_SESSION_LIMIT, type TrialAccess } from "@/types/trial";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    FileText,
    Flame,
    HeartHandshake,
    Loader2,
    LogIn,
    ShieldCheck,
    Terminal,
    Ticket,
    Upload,
    X,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";

// Khoá dùng để lưu payload preview vào sessionStorage trước khi điều hướng.
export const PREVIEW_SESSION_KEY = "ai-interview:preview";

// Trần an toàn: request body của Vercel chỉ ~4.5MB, và file được gửi dạng
// multipart (Blob thô, không base64) nên 3MB còn dư địa cho JD + metadata.
const MAX_CV_SIZE_BYTES = 3 * 1024 * 1024; // 3MB

const PERSONA_OPTIONS: PersonaOption[] = [
    {
        id: "friendly_hr",
        name: "Friendly HR",
        role: "Chuyên viên Nhân sự",
        badge: "Thân thiện",
        description: "Bầu không khí thoải mái, tập trung động lực & EQ.",
        accentColor:
            "border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    },
    {
        id: "challenging_manager",
        name: "Challenging Manager",
        role: "Quản lý / Trưởng phòng",
        badge: "Stress Test",
        description: "Phản biện sắc sảo, truy vấn sâu số liệu trong CV.",
        accentColor:
            "border-rose-500/40 bg-rose-500/5 text-rose-600 dark:text-rose-400",
    },
    {
        id: "tech_lead",
        name: "Technical Lead",
        role: "Kiến trúc sư Trưởng",
        badge: "Thực chiến",
        description: "Kiểm tra tư duy kỹ thuật, so khớp trực tiếp với JD.",
        accentColor:
            "border-indigo-500/40 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400",
    },
];

const PERSONA_ICONS: Record<PersonaType, typeof HeartHandshake> = {
    friendly_hr: HeartHandshake,
    challenging_manager: Flame,
    tech_lead: Terminal,
};

const COMPLETION_STEPS = [
    "Tải CV PDF",
    "Nhập vị trí & JD",
    "Chọn người phỏng vấn",
];

function computeCompletionProgress(form: SetupFormValues): number {
    const steps = [
        form.cvFile !== null,
        form.jobTitle.trim().length >= 2 &&
            form.jobDescription.trim().length >= 50,
        true, // persona luôn có giá trị mặc định nên luôn tính là hoàn thành
    ];
    return Math.round((steps.filter(Boolean).length / steps.length) * 100);
}

export function SetupForm({ trialAccess }: { trialAccess: TrialAccess }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [form, setForm] = useState<SetupFormValues>({
        cvFile: null,
        jobTitle: "",
        jobDescription: "",
        language: "vi",
        persona: "friendly_hr",
    });
    const [cvError, setCvError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [freeSessionsLeft, setFreeSessionsLeft] = useState(
        trialAccess.state === "active" ? trialAccess.freeSessionsLeft : 0,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Phỏng vấn yêu cầu đăng nhập Google + còn lượt dùng thử; mọi trạng thái
    // khác đều bị chặn ở đây và một lần nữa ở Server Action.
    const isQuotaBlocked = trialAccess.state !== "active";

    const quotaNotice =
        trialAccess.state === "guest"
            ? `Bạn cần đăng nhập Google để bắt đầu. Chưa có lượt? Đăng ký dùng thử để nhận ${FREE_TRIAL_SESSION_LIMIT} lượt miễn phí.`
            : trialAccess.state === "unregistered"
              ? `Bạn đang đăng nhập nhưng chưa đăng ký dùng thử. Đăng ký để nhận ${FREE_TRIAL_SESSION_LIMIT} lượt miễn phí.`
              : trialAccess.state === "exhausted"
                ? `Bạn đã dùng hết ${FREE_TRIAL_SESSION_LIMIT} lượt miễn phí.`
                : trialAccess.state === "unavailable"
                  ? "Chưa kiểm tra được số lượt còn lại của bạn. Vui lòng tải lại trang."
                  : null;

    const completionProgress = computeCompletionProgress(form);
    const isReadyToStart =
        form.cvFile !== null &&
        form.jobTitle.trim().length >= 2 &&
        form.jobDescription.trim().length >= 50;

    const handleCvFile = useCallback((file: File) => {
        if (file.type !== "application/pdf") {
            setCvError("Chỉ chấp nhận file PDF.");
            return;
        }
        if (file.size > MAX_CV_SIZE_BYTES) {
            setCvError("File CV vượt quá 3MB.");
            return;
        }
        setCvError(null);
        setForm((prev) => ({ ...prev, cvFile: file }));
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) handleCvFile(droppedFile);
        },
        [handleCvFile],
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => setIsDragging(false), []);

    const removeCv = () => setForm((prev) => ({ ...prev, cvFile: null }));

    const selectedPersona =
        PERSONA_OPTIONS.find((p) => p.id === form.persona) ??
        PERSONA_OPTIONS[0];
    const SelectedPersonaIcon = PERSONA_ICONS[form.persona];

    function handleStartInterview() {
        const cvFile = form.cvFile;
        if (!isReadyToStart || !cvFile) return;
        setSubmitError(null);

        startTransition(async () => {
            try {
                const cvBuffer = await cvFile.arrayBuffer();

                const result = await generateInterviewQuestions(
                    cvBuffer,
                    form.jobDescription,
                    form.language,
                    form.persona,
                );

                if (!result.ok) {
                    setSubmitError(result.error);
                    return;
                }

                if (result.remainingFreeSessions !== null) {
                    setFreeSessionsLeft(result.remainingFreeSessions);
                }

                const sessionId = crypto.randomUUID();

                sessionStorage.setItem(
                    `${PREVIEW_SESSION_KEY}:${sessionId}`,
                    JSON.stringify({
                        sessionId,
                        persona: form.persona,
                        language: form.language,
                        jobTitle: form.jobTitle.trim(),
                        data: result.data,
                    }),
                );

                // Lưu phiên phỏng vấn vào DB (fail-soft: bỏ qua nếu chưa đăng nhập).
                void saveInterviewSessionAction({
                    sessionId,
                    jobTitle: form.jobTitle.trim(),
                    jobDescription: form.jobDescription.trim(),
                    language: form.language,
                    persona: form.persona,
                    extractedSkills: result.data.summary.extractedSkills,
                    identifiedGaps: result.data.summary.identifiedGaps,
                });

                router.push(`/interview/${sessionId}/preview`);
            } catch (err: unknown) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Đã xảy ra sự cố khi gửi dữ liệu.";
                setSubmitError(
                    `Lỗi kết nối máy chủ: ${message}. Vui lòng kiểm tra dung lượng file hoặc thử lại.`,
                );
            }
        });
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            {trialAccess.state === "active" && (
                <div className="flex justify-center">
                    <Badge
                        variant="outline"
                        className="flex items-center gap-1.5 rounded-full border-amber-500/40 text-[11px] text-amber-600 dark:text-amber-400"
                    >
                        <Ticket className="size-3" />
                        Còn {freeSessionsLeft}/{FREE_TRIAL_SESSION_LIMIT} lượt
                        miễn phí
                    </Badge>
                </div>
            )}

            {/* Thanh tiến độ hoàn tất */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Chuẩn bị phỏng vấn</span>
                    <span className="font-mono tabular-nums font-semibold text-foreground">
                        {completionProgress}%
                    </span>
                </div>
                <Progress value={completionProgress} className="h-1.5" />
                <div className="flex gap-4 mt-1">
                    {COMPLETION_STEPS.map((step, idx) => {
                        const done =
                            idx === 0
                                ? form.cvFile !== null
                                : idx === 1
                                  ? form.jobTitle.trim().length >= 2 &&
                                    form.jobDescription.trim().length >= 50
                                  : true;
                        return (
                            <div
                                key={step}
                                className={`flex items-center gap-1 text-[11px] ${done ? "text-primary" : "text-muted-foreground"}`}
                            >
                                <CheckCircle2 className="size-3" />
                                {step}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bước 1: Tải CV */}
            <Card className="border-border/70 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Upload className="size-4" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold tracking-tight">
                                Bước 1 — Tải CV của bạn
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                Chỉ nhận file PDF, tối đa 3MB
                            </CardDescription>
                        </div>
                        <Badge
                            variant="outline"
                            className="ml-auto flex items-center gap-1 rounded-full text-[11px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        >
                            <ShieldCheck className="size-3" />
                            PII tự động bảo mật
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {form.cvFile ? (
                        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
                            <FileText className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {form.cvFile.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    {(form.cvFile.size / 1024).toFixed(0)} KB
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={removeCv}
                                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                aria-label="Xóa file CV"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    ) : (
                        <div
                            role="button"
                            tabIndex={0}
                            aria-label="Kéo thả hoặc nhấn để chọn file CV PDF"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ")
                                    fileInputRef.current?.click();
                            }}
                            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                isDragging
                                    ? "border-primary bg-primary/5"
                                    : "border-border/60 hover:border-border hover:bg-muted/30"
                            }`}
                        >
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                <Upload className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Kéo thả file CV vào đây
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    hoặc{" "}
                                    <span className="font-semibold text-primary underline-offset-2 hover:underline">
                                        nhấn để chọn từ máy
                                    </span>
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf"
                                className="sr-only"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleCvFile(f);
                                }}
                            />
                        </div>
                    )}
                    {cvError && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                            <AlertCircle className="size-3.5 shrink-0" />
                            {cvError}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bước 2: Mô tả công việc */}
            <Card className="border-border/70 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="size-4" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold tracking-tight">
                                Bước 2 — Dán Job Description
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                Sao chép toàn bộ nội dung JD từ trang tuyển dụng
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label
                            htmlFor="job-title"
                            className="text-xs font-semibold"
                        >
                            Vị trí ứng tuyển
                        </Label>
                        <Input
                            id="job-title"
                            placeholder="VD: Frontend Developer, Data Analyst..."
                            className="text-sm"
                            maxLength={120}
                            value={form.jobTitle}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    jobTitle: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="job-description" className="sr-only">
                            Nội dung Job Description
                        </Label>
                        <Textarea
                            id="job-description"
                            placeholder="Dán toàn bộ nội dung Job Description vào đây... (tối thiểu 50 ký tự)"
                            className="min-h-[180px] resize-none text-sm leading-relaxed"
                            value={form.jobDescription}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    jobDescription: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                            Tối thiểu 50 ký tự để AI phân tích chính xác
                        </span>
                        <span
                            className={`font-mono tabular-nums ${form.jobDescription.trim().length < 50 ? "text-muted-foreground" : "text-primary font-semibold"}`}
                        >
                            {form.jobDescription.trim().length} ký tự
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Bước 3: Ngôn ngữ + Persona */}
            <Card className="border-border/70 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <HeartHandshake className="size-4" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold tracking-tight">
                                Bước 3 — Chọn người phỏng vấn & ngôn ngữ
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                Phong cách phỏng vấn và ngôn ngữ tương tác
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Chọn ngôn ngữ */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="language"
                            className="text-xs font-semibold"
                        >
                            Ngôn ngữ phỏng vấn
                        </Label>
                        <Select
                            value={form.language}
                            onValueChange={(val) =>
                                setForm((prev) => ({
                                    ...prev,
                                    language: val as LanguageCode,
                                }))
                            }
                        >
                            <SelectTrigger
                                id="language"
                                className="w-52 text-sm"
                            >
                                <span
                                    data-slot="select-value"
                                    className="flex flex-1 text-left text-sm"
                                >
                                    {form.language === "vi"
                                        ? "🇻🇳 Tiếng Việt"
                                        : "🇬🇧 English"}
                                </span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vi">
                                    🇻🇳 Tiếng Việt
                                </SelectItem>
                                <SelectItem value="en">🇬🇧 English</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Các thẻ chọn người phỏng vấn */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold">
                            Người phỏng vấn AI
                        </Label>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {PERSONA_OPTIONS.map((persona) => {
                                const Icon = PERSONA_ICONS[persona.id];
                                const isSelected = form.persona === persona.id;
                                return (
                                    <button
                                        key={persona.id}
                                        type="button"
                                        onClick={() =>
                                            setForm((prev) => ({
                                                ...prev,
                                                persona: persona.id,
                                            }))
                                        }
                                        className={`rounded-xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                            isSelected
                                                ? "border-primary bg-primary/5 shadow-sm"
                                                : "border-border/60 hover:border-border hover:bg-muted/30"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div
                                                className={`flex size-8 items-center justify-center rounded-lg border ${persona.accentColor}`}
                                            >
                                                <Icon className="size-4" />
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className="size-4 text-primary" />
                                            )}
                                        </div>
                                        <p className="text-xs font-bold tracking-tight">
                                            {persona.name}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                                            {persona.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tóm tắt persona đã chọn */}
                    <div
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${selectedPersona.accentColor}`}
                    >
                        <SelectedPersonaIcon className="size-4 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs font-bold">
                                {selectedPersona.name}
                            </p>
                            <p className="text-[11px] opacity-80">
                                {selectedPersona.role}
                            </p>
                        </div>
                        <Badge
                            variant="secondary"
                            className="ml-auto shrink-0 text-[11px]"
                        >
                            {selectedPersona.badge}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Nút CTA */}
            <div className="flex flex-col items-center gap-3 pb-8">
                {quotaNotice && (
                    <div className="w-full max-w-md rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                            <span>{quotaNotice}</span>
                        </div>
                        {trialAccess.state === "guest" ? (
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() =>
                                        signIn("google", {
                                            callbackUrl: "/interview/setup",
                                        })
                                    }
                                    className="h-8 gap-1.5 px-3 text-xs font-semibold"
                                >
                                    <LogIn className="size-3.5" />
                                    Đăng nhập Google
                                </Button>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline"
                                >
                                    Đăng ký dùng thử
                                    <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        ) : (
                            trialAccess.state === "unregistered" && (
                                <Link
                                    href="/register"
                                    className="mt-2 inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline"
                                >
                                    Đăng ký dùng thử ngay
                                    <ArrowRight className="size-3" />
                                </Link>
                            )
                        )}
                    </div>
                )}

                <Button
                    size="lg"
                    className="h-12 w-full max-w-sm px-8 text-sm font-semibold shadow-md sm:w-auto"
                    disabled={!isReadyToStart || isPending || isQuotaBlocked}
                    onClick={handleStartInterview}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            AI đang phân tích CV...
                        </>
                    ) : (
                        <>
                            Bắt đầu phỏng vấn ngay
                            <ArrowRight className="size-4" />
                        </>
                    )}
                </Button>
                {!isReadyToStart && !isPending && (
                    <p className="text-xs text-muted-foreground text-center">
                        Vui lòng tải CV, nhập vị trí ứng tuyển và dán JD (tối
                        thiểu 50 ký tự) để tiếp tục
                    </p>
                )}
                {submitError && (
                    <div className="flex items-center gap-1.5 text-xs text-destructive">
                        <AlertCircle className="size-3.5 shrink-0" />
                        {submitError}
                    </div>
                )}
            </div>
        </div>
    );
}
