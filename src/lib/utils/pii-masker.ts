/**
 * PII Masking — sanitize candidate CV text before sending to Gemini.
 *
 * Why it exists: We must never forward a candidate's personal contact details
 * (phone, email, home address, social profile links) to a third-party AI API.
 * This module scrubs that data server-side before the payload leaves our
 * infrastructure, fulfilling the privacy guarantee shown on the UI.
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

// ─── Regex catalogue ─────────────────────────────────────────────────────────

/**
 * Vietnamese mobile numbers — 10 digits total, grouped as 4-3-3
 * (or written continuously), with optional space/dot/hyphen separators.
 *
 * Operators by prefix: 03x, 05x, 07x, 08x, 09x
 * International: +84 or 0084 (9-digit subscriber = drop leading 0)
 *
 * Examples matched:
 *   0912 345 678  |  0912.345.678  |  0912-345-678  |  0912345678
 *   +84 912 345 678  |  0084 912 345 678
 */
const PHONE_VN_SOURCE = [
    // +84 / 0084 prefix + 9-digit subscriber (3-3-3 grouping)
    "(?:\\+84|0084)[\\s.\\-]?[3-9]\\d{2}[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}",
    // Raw 0xxx 10-digit (4-3-3 grouping)
    "0[3-9]\\d{2}[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}",
].join("|");

const EMAIL_SOURCE =
    "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}";

/**
 * Vietnamese street address patterns.
 * Catches: "123 Đường Lê Lợi", "Số 45 Nguyễn Huệ", "123/4 Hẻm Trần Hưng Đạo"
 * and common abbreviations (P., Q., TP., Tp., Huyện, Tỉnh, Phường, Xã).
 */
const ADDRESS_VN_SOURCE =
    "(?:số\\s+\\d+[\\/\\-]?\\d*|^\\d+[\\/\\-]\\d+|\\d{1,4}\\s+(?:đường|phố|ngõ|hẻm|ngách|alley|street|road|blvd|avenue|ave|lane|ln|dr|drive|court|ct|way|st\\.?))\\s+[^\\n,;]{3,50}";

const DISTRICT_WARD_SOURCE =
    "(?:phường|xã|thị trấn|quận|huyện|thành phố|tỉnh|tp\\.?|q\\.?|p\\.?)\\s+[^\\n,;]{2,30}";

/** Personal social-media profile URLs (not professional / project links). */
const SOCIAL_LINK_SOURCE =
    "https?:\\/\\/(?:www\\.)?(?:facebook|fb|twitter|x|instagram|tiktok|zalo)\\.com\\/[^\\s\"'<>]+";

// ─── Core masker ─────────────────────────────────────────────────────────────

function countMatches(text: string, pattern: string, flags = "g"): number {
    return (text.match(new RegExp(pattern, flags)) ?? []).length;
}

/**
 * Masks PII in raw CV text.
 *
 * Input:  plain-text content extracted from the candidate's CV.
 * Output: sanitised text + a summary of what was redacted (for logging).
 *
 * The function is pure and synchronous — no I/O, easy to unit-test.
 * A fresh RegExp is constructed for every call to avoid `lastIndex` drift
 * across repeated invocations of the same regex with the `g` flag.
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
 * Convenience wrapper: returns only the sanitised string.
 * Use this in Server Actions where you don't need the audit report.
 */
export function maskPiiText(rawText: string): string {
    return maskPii(rawText).masked;
}
