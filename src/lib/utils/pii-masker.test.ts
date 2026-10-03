import { describe, expect, it } from "vitest";
import { maskPii, maskPiiText } from "./pii-masker";

// ─── Phone numbers ────────────────────────────────────────────────────────────

describe("maskPii — Vietnamese phone numbers", () => {
    it("masks 10-digit mobile starting with 09x", () => {
        const { masked, hits } = maskPii("Liên hệ: 0912 345 678");
        expect(masked).toContain("[REDACTED_PHONE]");
        expect(masked).not.toContain("0912");
        expect(hits.phones).toBe(1);
    });

    it("masks 10-digit mobile starting with 08x", () => {
        const { masked } = maskPii("SĐT: 0856-123-456");
        expect(masked).toContain("[REDACTED_PHONE]");
        expect(masked).not.toContain("0856");
    });

    it("masks phone with +84 country code", () => {
        const { masked } = maskPii("Call me at +84 912 345 678");
        expect(masked).toContain("[REDACTED_PHONE]");
        expect(masked).not.toContain("912 345 678");
    });

    it("masks phone with 0084 international prefix", () => {
        const { masked } = maskPii("WhatsApp: 0084 976 543 210");
        expect(masked).toContain("[REDACTED_PHONE]");
    });

    it("counts multiple phone numbers correctly", () => {
        const text = "SĐT1: 0901234567 — SĐT2: 0876543210";
        const { hits } = maskPii(text);
        expect(hits.phones).toBe(2);
    });

    it("does not mask unrelated number sequences", () => {
        const { masked } = maskPii("Năm 2023, doanh thu tăng 12345678");
        expect(masked).not.toContain("[REDACTED_PHONE]");
    });
});

// ─── Email addresses ──────────────────────────────────────────────────────────

describe("maskPii — emails", () => {
    it("masks a standard personal email", () => {
        const { masked, hits } = maskPii("Email: nguyenvana@gmail.com");
        expect(masked).toContain("[REDACTED_EMAIL]");
        expect(masked).not.toContain("nguyenvana@gmail.com");
        expect(hits.emails).toBe(1);
    });

    it("masks corporate email", () => {
        const { masked } = maskPii("Contact: dev.john@company.io");
        expect(masked).toContain("[REDACTED_EMAIL]");
    });

    it("masks email with plus addressing", () => {
        const { masked } = maskPii("me+newsletter@example.com");
        expect(masked).toContain("[REDACTED_EMAIL]");
    });

    it("masks multiple emails in one block", () => {
        const text = "Primary: a@b.com — Secondary: c@d.vn";
        const { hits } = maskPii(text);
        expect(hits.emails).toBe(2);
    });
});

// ─── Social media links ───────────────────────────────────────────────────────

describe("maskPii — social media links", () => {
    it("masks a Facebook profile URL", () => {
        const { masked, hits } = maskPii(
            "Facebook: https://facebook.com/nguyen.van.a",
        );
        expect(masked).toContain("[REDACTED_SOCIAL]");
        expect(masked).not.toContain("facebook.com/nguyen");
        expect(hits.socialLinks).toBe(1);
    });

    it("masks an Instagram profile URL", () => {
        const { masked } = maskPii("Instagram: https://www.instagram.com/user_123");
        expect(masked).toContain("[REDACTED_SOCIAL]");
    });

    it("masks a TikTok profile URL", () => {
        const { masked } = maskPii("TikTok: https://tiktok.com/@myhandle");
        expect(masked).toContain("[REDACTED_SOCIAL]");
    });

    it("does NOT mask LinkedIn or GitHub (project / professional links)", () => {
        const text =
            "GitHub: https://github.com/user/repo — LinkedIn: https://linkedin.com/in/user";
        const { masked, hits } = maskPii(text);
        expect(hits.socialLinks).toBe(0);
        expect(masked).toContain("github.com");
        expect(masked).toContain("linkedin.com");
    });
});

// ─── Mixed PII in realistic CV text ──────────────────────────────────────────

describe("maskPii — realistic CV block", () => {
    const cvBlock = `
Nguyễn Văn A
Email: nguyenvana@gmail.com
Điện thoại: 0912 345 678
Facebook: https://facebook.com/nguyenvana
GitHub: https://github.com/nguyenvana
Kinh nghiệm: 3 năm làm React tại Công ty ABC
`.trim();

    it("redacts phone, email and Facebook but preserves GitHub", () => {
        const { masked, hits } = maskPii(cvBlock);
        expect(masked).not.toContain("nguyenvana@gmail.com");
        expect(masked).not.toContain("0912 345 678");
        expect(masked).not.toContain("facebook.com/nguyenvana");
        expect(masked).toContain("github.com/nguyenvana");
        expect(hits.phones).toBe(1);
        expect(hits.emails).toBe(1);
        expect(hits.socialLinks).toBe(1);
    });

    it("preserves non-PII content intact", () => {
        const { masked } = maskPii(cvBlock);
        expect(masked).toContain("Nguyễn Văn A");
        expect(masked).toContain("3 năm làm React");
        expect(masked).toContain("Công ty ABC");
    });
});

// ─── maskPiiText convenience wrapper ─────────────────────────────────────────

describe("maskPiiText", () => {
    it("returns only the sanitised string", () => {
        const result = maskPiiText("Call 0987654321 or email x@y.com");
        expect(typeof result).toBe("string");
        expect(result).not.toContain("0987654321");
        expect(result).not.toContain("x@y.com");
    });

    it("is a pure function — does not mutate the input", () => {
        const input = "test@test.com";
        maskPiiText(input);
        expect(input).toBe("test@test.com");
    });
});
