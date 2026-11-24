import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockEnsureCurrentUser, mockFindMany } = vi.hoisted(() => ({
    mockEnsureCurrentUser: vi.fn(),
    mockFindMany: vi.fn(),
}));

vi.mock("@/lib/db/current-user", () => ({
    ensureCurrentUser: mockEnsureCurrentUser,
}));

vi.mock("@/lib/db/prisma", () => ({
    prisma: {
        interviewSession: { findMany: mockFindMany },
    },
}));

import { listCurrentUserInterviewHistory } from "./interview-history-repository";

const SCORED_SESSION = {
    id: "s1",
    jobTitle: "Frontend Developer",
    persona: "CHALLENGING_MANAGER",
    language: "VI",
    status: "COMPLETED",
    createdAt: new Date("2026-11-20T03:00:00.000Z"),
    feedbackReport: {
        overallScore: 82,
        situationScore: 8,
        taskScore: 8,
        actionScore: 9,
        resultScore: 7,
    },
};

const UNSCORED_SESSION = {
    id: "s2",
    jobTitle: "DevOps Engineer",
    persona: "TECH_LEAD",
    language: "EN",
    status: "IN_PROGRESS",
    createdAt: new Date("2026-11-21T03:00:00.000Z"),
    feedbackReport: null,
};

describe("interview-history-repository", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("báo unauthenticated khi chưa đăng nhập", async () => {
        mockEnsureCurrentUser.mockResolvedValueOnce(null);

        const result = await listCurrentUserInterviewHistory();

        expect(result).toEqual({ ok: false, reason: "unauthenticated" });
        expect(mockFindMany).not.toHaveBeenCalled();
    });

    it("map session có báo cáo thành entry kèm điểm STAR", async () => {
        mockEnsureCurrentUser.mockResolvedValueOnce({
            id: "user-1",
            email: "a@b.com",
        });
        mockFindMany.mockResolvedValueOnce([SCORED_SESSION]);

        const result = await listCurrentUserInterviewHistory();

        expect(mockFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: "user-1" },
                orderBy: { createdAt: "desc" },
            }),
        );
        expect(result).toEqual({
            ok: true,
            entries: [
                {
                    sessionId: "s1",
                    jobTitle: "Frontend Developer",
                    persona: "challenging_manager",
                    language: "vi",
                    isCompleted: true,
                    createdAt: "2026-11-20T03:00:00.000Z",
                    overallScore: 82,
                    starScores: {
                        situation: 8,
                        task: 8,
                        action: 9,
                        result: 7,
                    },
                },
            ],
        });
    });

    it("session chưa chấm điểm thì điểm là null và isCompleted = false", async () => {
        mockEnsureCurrentUser.mockResolvedValueOnce({
            id: "user-1",
            email: "a@b.com",
        });
        mockFindMany.mockResolvedValueOnce([UNSCORED_SESSION]);

        const result = await listCurrentUserInterviewHistory();

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.entries[0]).toMatchObject({
                sessionId: "s2",
                isCompleted: false,
                overallScore: null,
                starScores: null,
            });
        }
    });

    it("báo db_error khi truy vấn lỗi", async () => {
        mockEnsureCurrentUser.mockResolvedValueOnce({
            id: "user-1",
            email: "a@b.com",
        });
        mockFindMany.mockRejectedValueOnce(new Error("DB down"));

        const result = await listCurrentUserInterviewHistory();

        expect(result).toEqual({ ok: false, reason: "db_error" });
    });
});
