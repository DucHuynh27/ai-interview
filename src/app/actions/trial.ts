"use server";

import { submitTrialRegistration } from "@/lib/db/trial-repository";
import {
    trialRegistrationSchema,
    type TrialRegistrationInput,
} from "@/types/trial";

export type SubmitTrialActionResult = { ok: true } | { ok: false; error: string };

/**
 * Ghi đăng ký dùng thử. Quota chỉ được kích hoạt sau khi người dùng đăng nhập
 * Google bằng đúng email đã đăng ký (xem `resolveTrialAccess`).
 */
export async function submitTrialRegistrationAction(
    input: TrialRegistrationInput,
): Promise<SubmitTrialActionResult> {
    const validated = trialRegistrationSchema.safeParse(input);
    if (!validated.success) {
        return {
            ok: false,
            error:
                validated.error.issues[0]?.message ??
                "Dữ liệu đăng ký không hợp lệ.",
        };
    }

    const stored = await submitTrialRegistration(validated.data);
    if (stored.ok) {
        return { ok: true };
    }

    return {
        ok: false,
        error:
            stored.reason === "duplicate_email"
                ? "Email này đã đăng ký dùng thử rồi. Hãy đăng nhập Google bằng email đó để nhận 3 lượt của bạn."
                : "Chưa lưu được đăng ký do lỗi hệ thống. Vui lòng thử lại sau.",
    };
}
