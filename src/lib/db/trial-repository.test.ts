import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mock Prisma Client & NextAuth ──────────────────────────────────────────
const {
    mockAuth,
    mockUserUpsert,
    mockTrialCreate,
    mockTrialFindUnique,
    mockTrialUpdate,
    mockTrialUpdateMany,
} = vi.hoisted(() => ({
    mockAuth: vi.fn(),
    mockUserUpsert: vi.fn(),
    mockTrialCreate: vi.fn(),
    mockTrialFindUnique: vi.fn(),
    mockTrialUpdate: vi.fn(),
    mockTrialUpdateMany: vi.fn(),
}));

vi.mock("@/auth", () => ({
    auth: mockAuth,
}));

vi.mock("@/lib/db/prisma", () => ({
    prisma: {
        user: { upsert: mockUserUpsert },
        trialRegistration: {
            create: mockTrialCreate,
            findUnique: mockTrialFindUnique,
            update: mockTrialUpdate,
            updateMany: mockTrialUpdateMany,
        },
    },
}));

import {
    consumeTrialQuota,
    resolveTrialAccess,
    submitTrialRegistration,
} from "./trial-repository";

const SIGNED_IN_USER = {
    id: "user-1",
    email: "a@b.com",
};

const REGISTRATION_INPUT = {
    fullName: "Nguyễn Minh Anh",
    email: "a@b.com",
    major: "Khoa học máy tính",
    targetPosition: "Frontend Developer",
};

describe("trial-repository", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUserUpsert.mockResolvedValue(SIGNED_IN_USER);
    });

    describe("submitTrialRegistration", () => {
        it("tạo đăng ký PENDING với đúng số lượt miễn phí", async () => {
            mockTrialCreate.mockResolvedValueOnce({ id: "t1" });

            const result = await submitTrialRegistration(REGISTRATION_INPUT);

            expect(result).toEqual({ ok: true });
            expect(mockTrialCreate).toHaveBeenCalledWith({
                data: {
                    ...REGISTRATION_INPUT,
                    freeSessionsLeft: 3,
                    status: "PENDING",
                },
            });
        });

        it("báo trùng email khi Prisma ném lỗi ràng buộc P2002", async () => {
            mockTrialCreate.mockRejectedValueOnce(
                Object.assign(new Error("Unique constraint failed"), {
                    code: "P2002",
                }),
            );

            const result = await submitTrialRegistration(REGISTRATION_INPUT);

            expect(result).toEqual({ ok: false, reason: "duplicate_email" });
        });

        it("trả db_error khi lỗi khác", async () => {
            mockTrialCreate.mockRejectedValueOnce(new Error("DB down"));

            const result = await submitTrialRegistration(REGISTRATION_INPUT);

            expect(result).toEqual({ ok: false, reason: "db_error" });
        });
    });

    describe("resolveTrialAccess", () => {
        it("là guest và không truy vấn DB khi chưa đăng nhập", async () => {
            mockAuth.mockResolvedValueOnce(null);

            const result = await resolveTrialAccess();

            expect(result).toEqual({ state: "guest" });
            expect(mockTrialFindUnique).not.toHaveBeenCalled();
        });

        it("là unregistered khi đã đăng nhập nhưng chưa có đăng ký", async () => {
            mockAuth.mockResolvedValueOnce({ user: { email: "a@b.com" } });
            mockTrialFindUnique.mockResolvedValueOnce(null);

            const result = await resolveTrialAccess();

            expect(result).toEqual({ state: "unregistered" });
        });

        it("kích hoạt PENDING -> ACTIVE khi email Google khớp và trả số lượt", async () => {
            mockAuth.mockResolvedValueOnce({ user: { email: "a@b.com" } });
            mockTrialFindUnique.mockResolvedValueOnce({
                id: "t1",
                freeSessionsLeft: 3,
                userId: null,
            });
            mockTrialUpdate.mockResolvedValueOnce({ freeSessionsLeft: 3 });

            const result = await resolveTrialAccess();

            expect(result).toEqual({ state: "active", freeSessionsLeft: 3 });
            expect(mockTrialUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: "t1" },
                    data: { userId: "user-1", status: "ACTIVE" },
                }),
            );
        });

        it("không cập nhật lại khi đăng ký đã gắn với chính user này", async () => {
            mockAuth.mockResolvedValueOnce({ user: { email: "a@b.com" } });
            mockTrialFindUnique.mockResolvedValueOnce({
                id: "t1",
                freeSessionsLeft: 2,
                userId: "user-1",
            });

            const result = await resolveTrialAccess();

            expect(result).toEqual({ state: "active", freeSessionsLeft: 2 });
            expect(mockTrialUpdate).not.toHaveBeenCalled();
        });

        it("là exhausted khi hết lượt", async () => {
            mockAuth.mockResolvedValueOnce({ user: { email: "a@b.com" } });
            mockTrialFindUnique.mockResolvedValueOnce({
                id: "t1",
                freeSessionsLeft: 0,
                userId: "user-1",
            });

            const result = await resolveTrialAccess();

            expect(result).toEqual({ state: "exhausted" });
        });

        it("là unavailable khi DB lỗi — chặn thay vì cho qua", async () => {
            mockAuth.mockResolvedValueOnce({ user: { email: "a@b.com" } });
            mockTrialFindUnique.mockRejectedValueOnce(new Error("DB down"));

            const result = await resolveTrialAccess();

            expect(result).toEqual({ state: "unavailable" });
        });
    });

    describe("consumeTrialQuota", () => {
        it("từ chối khi chưa đăng nhập", async () => {
            mockAuth.mockResolvedValueOnce(null);

            const result = await consumeTrialQuota();

            expect(result).toEqual({ ok: false, reason: "unauthenticated" });
        });

        it("từ chối khi chưa có đăng ký dùng thử", async () => {
            mockAuth.mockResolvedValueOnce({ user: { email: "a@b.com" } });
            mockTrialFindUnique.mockResolvedValueOnce(null);

            const result = await consumeTrialQuota();

            expect(result).toEqual({ ok: false, reason: "no_registration" });
        });

        it("từ chối khi đăng ký chưa gắn với user hiện tại", async () => {
            mockAuth.mockResolvedValueOnce({ user: { email: "a@b.com" } });
            mockTrialFindUnique.mockResolvedValueOnce({
                id: "t1",
                freeSessionsLeft: 3,
                userId: "another-user",
            });

            const result = await consumeTrialQuota();

            expect(result).toEqual({ ok: false, reason: "no_registration" });
            expect(mockTrialUpdateMany).not.toHaveBeenCalled();
        });

        it("trừ đúng một lượt và trả số lượt còn lại", async () => {
            mockAuth.mockResolvedValueOnce({ user: { email: "a@b.com" } });
            mockTrialFindUnique.mockResolvedValueOnce({
                id: "t1",
                freeSessionsLeft: 3,
                userId: "user-1",
            });
            mockTrialUpdateMany.mockResolvedValueOnce({ count: 1 });

            const result = await consumeTrialQuota();

            expect(result).toEqual({ ok: true, freeSessionsLeft: 2 });
            expect(mockTrialUpdateMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: "t1", freeSessionsLeft: { gt: 0 } },
                    data: { freeSessionsLeft: { decrement: 1 } },
                }),
            );
        });

        it("đánh dấu EXHAUSTED khi tiêu lượt cuối", async () => {
            mockAuth.mockResolvedValueOnce({ user: { email: "a@b.com" } });
            mockTrialFindUnique.mockResolvedValueOnce({
                id: "t1",
                freeSessionsLeft: 1,
                userId: "user-1",
            });
            mockTrialUpdateMany.mockResolvedValueOnce({ count: 1 });

            const result = await consumeTrialQuota();

            expect(result).toEqual({ ok: true, freeSessionsLeft: 0 });
            expect(mockTrialUpdateMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        freeSessionsLeft: { decrement: 1 },
                        status: "EXHAUSTED",
                    },
                }),
            );
        });

        it("từ chối khi lượt đã cạn (updateMany không khớp điều kiện)", async () => {
            mockAuth.mockResolvedValueOnce({ user: { email: "a@b.com" } });
            mockTrialFindUnique.mockResolvedValueOnce({
                id: "t1",
                freeSessionsLeft: 0,
                userId: "user-1",
            });
            mockTrialUpdateMany.mockResolvedValueOnce({ count: 0 });

            const result = await consumeTrialQuota();

            expect(result).toEqual({ ok: false, reason: "exhausted" });
        });

        it("trả db_error khi DB lỗi", async () => {
            mockAuth.mockResolvedValueOnce({ user: { email: "a@b.com" } });
            mockTrialFindUnique.mockRejectedValueOnce(new Error("DB down"));

            const result = await consumeTrialQuota();

            expect(result).toEqual({ ok: false, reason: "db_error" });
        });
    });
});
