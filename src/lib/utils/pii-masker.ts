/**
 * Che dấu PII — làm sạch nội dung CV của ứng viên trước khi gửi tới Gemini.
 *
 * Lý do tồn tại: Tuyệt đối không được chuyển thông tin liên hệ cá nhân của
 * ứng viên (số điện thoại, email, địa chỉ nhà, link mạng xã hội) cho API AI
 * bên thứ ba. Module này xử lý ngay phía server trước khi payload rời khỏi hạ
 * tầng của mình, đảm bảo cam kết quyền riêng tư đã hiển thị trên UI.
 */

export type MaskingReport = {
    masked: string;
    hits: {
        phones: number;
        emails: number;
        addresses: number;
        socialLinks: number;
    };
};

// ─── Danh mục regex ──────────────────────────────────────────────────────────

/**
 * Số di động Việt Nam — tổng 10 chữ số, nhóm 4-3-3 (hoặc viết liền), có thể
 * kèm dấu cách/dấu chấm/gạch ngang phân tách.
 *
 * Đầu số theo nhà mạng: 03x, 05x, 07x, 08x, 09x
 * Quốc tế: +84 hoặc 0084 (9 chữ số thuê bao = bỏ số 0 ở đầu)
 *
 * Ví dụ khớp:
 *   0912 345 678  |  0912.345.678  |  0912-345-678  |  0912345678
 *   +84 912 345 678  |  0084 912 345 678
 */
const PHONE_VN_SOURCE = [
    // Đầu +84 / 0084 + 9 chữ số thuê bao (nhóm 3-3-3)
    "(?:\\+84|0084)[\\s.\\-]?[3-9]\\d{2}[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}",
    // Số 0xxx 10 chữ số dạng thô (nhóm 4-3-3)
    "0[3-9]\\d{2}[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}",
].join("|");

const EMAIL_SOURCE = "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}";

/**
 * Mẫu địa chỉ đường phố Việt Nam.
 * Bắt được: "123 Đường Lê Lợi", "Số 45 Nguyễn Huệ", "123/4 Hẻm Trần Hưng Đạo"
 * cùng các viết tắt phổ biến (P., Q., TP., Tp., Huyện, Tỉnh, Phường, Xã).
 */
const ADDRESS_VN_SOURCE =
    "(?:số\\s+\\d+[\\/\\-]?\\d*|^\\d+[\\/\\-]\\d+|\\d{1,4}\\s+(?:đường|phố|ngõ|hẻm|ngách|alley|street|road|blvd|avenue|ave|lane|ln|dr|drive|court|ct|way|st\\.?))\\s+[^\\n,;]{3,50}";

const DISTRICT_WARD_SOURCE =
    "(?:phường|xã|thị trấn|quận|huyện|thành phố|tỉnh|tp\\.?|q\\.?|p\\.?)\\s+[^\\n,;]{2,30}";

/** Link hồ sơ mạng xã hội cá nhân (không phải link dự án / chuyên môn). */
const SOCIAL_LINK_SOURCE =
    "https?:\\/\\/(?:www\\.)?(?:facebook|fb|twitter|x|instagram|tiktok|zalo)\\.com\\/[^\\s\"'<>]+";

// ─── Bộ masker lõi ───────────────────────────────────────────────────────────

function countMatches(text: string, pattern: string, flags = "g"): number {
    return (text.match(new RegExp(pattern, flags)) ?? []).length;
}

/**
 * Che dấu PII trong nội dung CV thô.
 *
 * Đầu vào:  văn bản thuần trích xuất từ CV của ứng viên.
 * Đầu ra:   văn bản đã làm sạch + thống kê những gì đã bị che (để log).
 *
 * Hàm thuần và đồng bộ — không I/O, dễ viết unit test.
 * Mỗi lần gọi tạo một RegExp mới để tránh `lastIndex` bị lệch khi gọi lặp lại
 * cùng một regex với cờ `g`.
 */
export function maskPii(rawText: string): MaskingReport {
    const phones = countMatches(rawText, PHONE_VN_SOURCE);
    const emails = countMatches(rawText, EMAIL_SOURCE);
    const addresses =
        countMatches(rawText, ADDRESS_VN_SOURCE, "gi") +
        countMatches(rawText, DISTRICT_WARD_SOURCE, "gi");
    const socialLinks = countMatches(rawText, SOCIAL_LINK_SOURCE, "gi");

    const masked = rawText
        .replace(new RegExp(PHONE_VN_SOURCE, "g"), "[REDACTED_PHONE]")
        .replace(new RegExp(EMAIL_SOURCE, "g"), "[REDACTED_EMAIL]")
        .replace(new RegExp(ADDRESS_VN_SOURCE, "gi"), "[REDACTED_ADDRESS]")
        .replace(new RegExp(DISTRICT_WARD_SOURCE, "gi"), "[REDACTED_ADDRESS]")
        .replace(new RegExp(SOCIAL_LINK_SOURCE, "gi"), "[REDACTED_SOCIAL]");

    return {
        masked,
        hits: { phones, emails, addresses, socialLinks },
    };
}

/**
 * Hàm bao tiện dụng: chỉ trả về chuỗi đã được làm sạch.
 * Dùng trong Server Actions khi không cần báo cáo kiểm toán.
 */
export function maskPiiText(rawText: string): string {
    return maskPii(rawText).masked;
}
