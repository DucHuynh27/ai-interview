import { z } from "zod";

/** Số lượt phỏng vấn miễn phí cấp cho mỗi đăng ký dùng thử. */
export const FREE_TRIAL_SESSION_LIMIT = 3;

export type TrialStatus = "pending" | "active" | "exhausted";

export const trialRegistrationSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, "Họ tên cần tối thiểu 2 ký tự.")
        .max(120, "Họ tên tối đa 120 ký tự."),
    email: z.email("Email không hợp lệ.").max(160, "Email tối đa 160 ký tự."),
    major: z
        .string()
        .trim()
        .min(2, "Ngành học cần tối thiểu 2 ký tự.")
        .max(120, "Ngành học tối đa 120 ký tự."),
    targetPosition: z
        .string()
        .trim()
        .min(2, "Vị trí ứng tuyển cần tối thiểu 2 ký tự.")
        .max(120, "Vị trí ứng tuyển tối đa 120 ký tự."),
});

export type TrialRegistrationInput = z.infer<typeof trialRegistrationSchema>;

/**
 * Trạng thái truy cập tính năng phỏng vấn của người dùng hiện tại.
 *
 * - `guest`: chưa đăng nhập — giữ nguyên luồng dùng thử ẩn danh qua
 *   `sessionStorage` (xem Task 5.2), không áp quota.
 * - `unregistered`: đã đăng nhập nhưng chưa có đăng ký dùng thử.
 * - `unavailable`: không xác minh được quota (DB lỗi) — xử lý như bị chặn, vì
 *   đây là ranh giới giữa bản miễn phí và bản trả phí.
 */
export type TrialAccess =
    | { state: "guest" }
    | { state: "unregistered" }
    | { state: "active"; freeSessionsLeft: number }
    | { state: "exhausted" }
    | { state: "unavailable" };
