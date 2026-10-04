"use client";

import { generateInterviewQuestions } from "@/app/actions/interview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    FileText,
    Flame,
    HeartHandshake,
    Loader2,
    ShieldCheck,
    Terminal,
    Upload,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";

// Key used to store the preview payload in sessionStorage before navigation.
export const PREVIEW_SESSION_KEY = "ai-interview:preview";

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

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
    "Dán Job Description",
    "Chọn người phỏng vấn",
];

function computeCompletionProgress(form: SetupFormValues): number {
    const steps = [
        form.cvFile !== null,
        form.jobDescription.trim().length >= 50,
        true, // persona luôn có giá trị mặc định
    ];
    return Math.round((steps.filter(Boolean).length / steps.length) * 100);
}

export function SetupForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [form, setForm] = useState<SetupFormValues>({
        cvFile: null,
        jobDescription: "",
        language: "vi",
        persona: "friendly_hr",
    });
    const [cvError, setCvError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const completionProgress = computeCompletionProgress(form);
    const isReadyToStart =
        form.cvFile !== null && form.jobDescription.trim().length >= 50;

    const handleCvFile = useCallback((file: File) => {
        if (file.type !== "application/pdf") {
            setCvError("Chỉ chấp nhận file PDF.");
            return;
        }
        if (file.size > MAX_CV_SIZE_BYTES) {
            setCvError("File CV vượt quá 5MB.");
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

    const selectedPersona = PERSONA_OPTIONS.find((p) => p.id === form.persona)!;
    const SelectedPersonaIcon = PERSONA_ICONS[form.persona];

    function handleStartInterview() {
        if (!isReadyToStart || !form.cvFile) return;
        setSubmitError(null);

        startTransition(async () => {
            const cvBuffer = await form.cvFile!.arrayBuffer();

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

            // Generate a temporary session ID until DB is wired up.
            const sessionId = crypto.randomUUID();

            sessionStorage.setItem(
                `${PREVIEW_SESSION_KEY}:${sessionId}`,
                JSON.stringify({
                    sessionId,
                    persona: form.persona,
                    language: form.language,
                    data: result.data,
                }),
            );

            router.push(`/interview/${sessionId}/preview`);
        });
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            {/* Progress tracker */}
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
                                  ? form.jobDescription.trim().length >= 50
                                  : true;
                        return (
                            <div
                                key={idx}
                                className={`flex items-center gap-1 text-[11px] ${done ? "text-primary" : "text-muted-foreground"}`}
                            >
                                <CheckCircle2 className="size-3" />
                                {step}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step 1: CV Upload */}
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
                                Chỉ nhận file PDF, tối đa 5MB
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

            {/* Step 2: Job Description */}
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
                <CardContent className="space-y-3">
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

            {/* Step 3: Language + Persona */}
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
                    {/* Language selector */}
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

                    {/* Persona cards */}
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

                    {/* Selected persona summary */}
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

            {/* CTA */}
            <div className="flex flex-col items-center gap-3 pb-8">
                <Button
                    size="lg"
                    className="h-12 w-full max-w-sm px-8 text-sm font-semibold shadow-md sm:w-auto"
                    disabled={!isReadyToStart || isPending}
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
                        Vui lòng tải CV và dán JD (tối thiểu 50 ký tự) để tiếp
                        tục
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
