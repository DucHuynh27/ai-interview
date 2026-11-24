"use client";

import { submitTrialRegistrationAction } from "@/app/actions/trial";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    FREE_TRIAL_SESSION_LIMIT,
    trialRegistrationSchema,
    type TrialAccess,
    type TrialRegistrationInput,
} from "@/types/trial";
import { AlertCircle, ArrowRight, Loader2, PartyPopper } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const EMPTY_FORM: TrialRegistrationInput = {
    fullName: "",
    email: "",
    major: "",
    targetPosition: "",
};

const FORM_FIELDS: Array<{
    name: keyof TrialRegistrationInput;
    label: string;
    placeholder: string;
    type?: string;
}> = [
    {
        name: "fullName",
        label: "Họ và tên",
        placeholder: "VD: Nguyễn Minh Anh",
    },
    {
        name: "email",
        label: "Email",
        placeholder: "ban@example.com",
        type: "email",
    },
    {
        name: "major",
        label: "Ngành học",
        placeholder: "VD: Khoa học máy tính",
    },
    {
        name: "targetPosition",
        label: "Vị trí muốn ứng tuyển",
        placeholder: "VD: Frontend Developer",
    },
];

export function RegisterForm({ trialAccess }: { trialAccess: TrialAccess }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState<TrialRegistrationInput>(EMPTY_FORM);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const googleEmail = session?.user?.email ?? null;

    // Khi đã đăng nhập, email lấy thẳng từ tài khoản Google (không cho sửa) vì
    // chính email này phải khớp thì quota mới được kích hoạt.
    const emailInputValue = googleEmail ?? form.email;
    const isEmailLocked = googleEmail !== null;

    if (trialAccess.state === "active") {
        return (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardHeader>
                    <CardTitle className="text-base font-bold">
                        Bạn đang có {trialAccess.freeSessionsLeft}/
                        {FREE_TRIAL_SESSION_LIMIT} lượt miễn phí
                    </CardTitle>
                    <CardDescription>
                        Mỗi lượt là một buổi phỏng vấn đầy đủ 5 câu hỏi kèm báo
                        cáo STAR. Lượt sẽ được trừ khi AI sinh xong bộ câu hỏi.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link
                        href="/interview/setup"
                        className={buttonVariants({
                            className: "h-11 px-6 font-semibold",
                        })}
                    >
                        Vào phòng phỏng vấn
                        <ArrowRight className="ml-2 size-4" />
                    </Link>
                </CardContent>
            </Card>
        );
    }

    if (trialAccess.state === "exhausted") {
        return (
            <Card className="border-amber-500/30 bg-amber-500/5">
                <CardHeader>
                    <CardTitle className="text-base font-bold">
                        Bạn đã dùng hết {FREE_TRIAL_SESSION_LIMIT} lượt miễn phí
                    </CardTitle>
                    <CardDescription>
                        Cảm ơn bạn đã luyện tập cùng AI-Interview. Gói trả phí
                        đang được chuẩn bị — hãy để lại phản hồi để tụi tui ưu
                        tiên mở sớm cho bạn nhé.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (isSubmitted) {
        return (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                        <PartyPopper className="size-4 text-emerald-600" />
                        Đã ghi nhận đăng ký
                    </CardTitle>
                    <CardDescription>
                        Còn một bước cuối: đăng nhập Google bằng đúng email{" "}
                        <strong>{emailInputValue}</strong> để kích hoạt{" "}
                        {FREE_TRIAL_SESSION_LIMIT} lượt miễn phí.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        className="h-11 px-6 font-semibold"
                        onClick={() =>
                            signIn("google", { callbackUrl: "/register" })
                        }
                    >
                        Đăng nhập Google để nhận lượt
                        <ArrowRight className="ml-2 size-4" />
                    </Button>
                </CardContent>
            </Card>
        );
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitError(null);

        const validated = trialRegistrationSchema.safeParse({
            ...form,
            email: emailInputValue,
        });
        if (!validated.success) {
            setSubmitError(
                validated.error.issues[0]?.message ?? "Dữ liệu chưa hợp lệ.",
            );
            return;
        }

        startTransition(async () => {
            const result = await submitTrialRegistrationAction(validated.data);

            if (!result.ok) {
                setSubmitError(result.error);
                return;
            }

            if (googleEmail) {
                router.refresh();
                return;
            }

            setIsSubmitted(true);
        });
    }

    return (
        <Card className="border-border/70 shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-bold">
                    Đăng ký nhận {FREE_TRIAL_SESSION_LIMIT} lượt miễn phí
                </CardTitle>
                <CardDescription>
                    Điền đủ 4 thông tin dưới đây. Sau khi đăng nhập Google bằng
                    email này, bạn dùng ngay {FREE_TRIAL_SESSION_LIMIT} buổi
                    phỏng vấn miễn phí.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                    {FORM_FIELDS.map((field) => (
                        <div key={field.name} className="space-y-2">
                            <Label
                                htmlFor={`trial-${field.name}`}
                                className="text-xs font-semibold"
                            >
                                {field.label}
                            </Label>
                            <Input
                                id={`trial-${field.name}`}
                                type={field.type ?? "text"}
                                placeholder={field.placeholder}
                                maxLength={160}
                                className="text-sm"
                                readOnly={
                                    field.name === "email" && isEmailLocked
                                }
                                value={
                                    field.name === "email"
                                        ? emailInputValue
                                        : form[field.name]
                                }
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        [field.name]: event.target.value,
                                    }))
                                }
                            />
                        </div>
                    ))}

                    {submitError && (
                        <div className="flex items-start gap-1.5 text-xs text-destructive">
                            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                            {submitError}
                        </div>
                    )}

                    <Button
                        type="submit"
                        size="lg"
                        disabled={isPending}
                        className="h-11 w-full font-semibold sm:w-auto sm:px-8"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Đang lưu đăng ký...
                            </>
                        ) : (
                            <>
                                Nhận {FREE_TRIAL_SESSION_LIMIT} lượt miễn phí
                                <ArrowRight className="ml-2 size-4" />
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
