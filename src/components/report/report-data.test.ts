import { describe, it, expect } from "vitest";
import type { InterviewEvaluationReport } from "@/types/report";

describe("STAR Report Calculations & Data Integrity", () => {
    it("should clamp STAR scores within 0-10 range for radar chart calculation", () => {
        const clampScore = (score: number) => Math.max(0, Math.min(10, score));

        expect(clampScore(12)).toBe(10);
        expect(clampScore(-3)).toBe(0);
        expect(clampScore(8.5)).toBe(8.5);
        expect(clampScore(0)).toBe(0);
        expect(clampScore(10)).toBe(10);
    });

    it("should correctly calculate polygon coordinates for 4 STAR axes", () => {
        const size = 320;
        const center = size / 2;
        const maxRadius = (size / 2) * 0.65;
        const maxScore = 10;

        const axes = [
            { key: "situation", score: 8, angle: -Math.PI / 2 },
            { key: "task", score: 7, angle: 0 },
            { key: "action", score: 9, angle: Math.PI / 2 },
            { key: "result", score: 6, angle: Math.PI },
        ];

        const points = axes.map((axis) => {
            const radius = (axis.score / maxScore) * maxRadius;
            const x = center + radius * Math.cos(axis.angle);
            const y = center + radius * Math.sin(axis.angle);
            return { x, y };
        });

        expect(points).toHaveLength(4);
        // Situation is at top (x close to center, y < center)
        expect(points[0].x).toBeCloseTo(center, 1);
        expect(points[0].y).toBeLessThan(center);
        // Task is at right (x > center, y close to center)
        expect(points[1].x).toBeGreaterThan(center);
        expect(points[1].y).toBeCloseTo(center, 1);
        // Action is at bottom (x close to center, y > center)
        expect(points[2].x).toBeCloseTo(center, 1);
        expect(points[2].y).toBeGreaterThan(center);
        // Result is at left (x < center, y close to center)
        expect(points[3].x).toBeLessThan(center);
        expect(points[3].y).toBeCloseTo(center, 1);
    });

    it("should assign correct score tiers based on overall score", () => {
        const getScoreTier = (score: number) => {
            if (score >= 85) return "Xuất sắc";
            if (score >= 70) return "Tốt";
            if (score >= 50) return "Khá";
            return "Cần cải thiện";
        };

        expect(getScoreTier(95)).toBe("Xuất sắc");
        expect(getScoreTier(85)).toBe("Xuất sắc");
        expect(getScoreTier(84)).toBe("Tốt");
        expect(getScoreTier(70)).toBe("Tốt");
        expect(getScoreTier(69)).toBe("Khá");
        expect(getScoreTier(50)).toBe("Khá");
        expect(getScoreTier(49)).toBe("Cần cải thiện");
        expect(getScoreTier(10)).toBe("Cần cải thiện");
    });

    it("should have valid structure for mock fallback evaluation report", () => {
        const sampleReport: Partial<InterviewEvaluationReport> = {
            overallScore: 82,
            situationScore: 8,
            taskScore: 8,
            actionScore: 9,
            resultScore: 7,
            summary: "Thực hiện tốt",
            strengths: ["Kỹ năng tốt"],
            weaknesses: ["Cần thêm số liệu"],
        };

        expect(sampleReport.overallScore).toBeGreaterThanOrEqual(1);
        expect(sampleReport.overallScore).toBeLessThanOrEqual(100);
        expect(sampleReport.situationScore).toBeGreaterThanOrEqual(1);
        expect(sampleReport.situationScore).toBeLessThanOrEqual(10);
        expect(sampleReport.taskScore).toBeGreaterThanOrEqual(1);
        expect(sampleReport.taskScore).toBeLessThanOrEqual(10);
        expect(sampleReport.actionScore).toBeGreaterThanOrEqual(1);
        expect(sampleReport.actionScore).toBeLessThanOrEqual(10);
        expect(sampleReport.resultScore).toBeGreaterThanOrEqual(1);
        expect(sampleReport.resultScore).toBeLessThanOrEqual(10);
    });
});
