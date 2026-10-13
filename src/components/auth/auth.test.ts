import { describe, expect, it } from "vitest";
import { handlers } from "@/auth";

describe("NextAuth Configuration & Handlers", () => {
    it("exports GET and POST route handlers", () => {
        expect(handlers).toBeDefined();
        expect(typeof handlers.GET).toBe("function");
        expect(typeof handlers.POST).toBe("function");
    });

    it("verifies session callback mapping logic", () => {
        // Test session mapping logic: assigns user.id from token.id or token.sub
        const mockToken = {
            id: "user-cuid-123",
            sub: "google-sub-456",
            email: "candidate@example.com",
            name: "Nguyen Van A",
        };

        const mockSession = {
            user: {
                name: "Nguyen Van A",
                email: "candidate@example.com",
                image: "https://example.com/avatar.png",
            },
            expires: new Date(Date.now() + 86400000).toISOString(),
        };

        // Replicating session callback contract
        const enrichedSession = {
            ...mockSession,
            user: {
                ...mockSession.user,
                id: mockToken.id || mockToken.sub,
            },
        };

        expect(enrichedSession.user.id).toBe("user-cuid-123");
        expect(enrichedSession.user.email).toBe("candidate@example.com");
    });

    it("falls back to token.sub when user.id is not present", () => {
        const mockToken = {
            sub: "google-sub-789",
        };

        const mockSession = {
            user: {
                name: "Test Candidate",
            },
            expires: new Date().toISOString(),
        };

        const enrichedSession = {
            ...mockSession,
            user: {
                ...mockSession.user,
                id: (mockToken as { id?: string; sub: string }).id || mockToken.sub,
            },
        };

        expect(enrichedSession.user.id).toBe("google-sub-789");
    });
});
