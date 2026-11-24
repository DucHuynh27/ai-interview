import type { InterviewHistoryEntry } from "@/types/dashboard";

const CHART_WIDTH = 640;
const CHART_HEIGHT = 200;
const PADDING_X = 28;
const PADDING_Y = 20;

interface ScoreProgressChartProps {
    entries: InterviewHistoryEntry[];
}

/**
 * Biểu đồ đường đơn giản bằng SVG thuần (không thêm thư viện chart).
 * Chỉ vẽ các buổi đã có điểm, sắp theo thời gian tăng dần.
 */
export function ScoreProgressChart({ entries }: ScoreProgressChartProps) {
    const scored = entries
        .filter(
            (entry): entry is InterviewHistoryEntry & { overallScore: number } =>
                entry.overallScore !== null,
        )
        .sort(
            (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
        );

    if (scored.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Chưa có buổi nào được chấm điểm. Hoàn thành một buổi phỏng vấn
                để thấy tiến bộ ở đây.
            </p>
        );
    }

    const innerWidth = CHART_WIDTH - PADDING_X * 2;
    const innerHeight = CHART_HEIGHT - PADDING_Y * 2;
    const step = scored.length > 1 ? innerWidth / (scored.length - 1) : 0;

    const points = scored.map((entry, index) => {
        const x = PADDING_X + index * step;
        const y =
            PADDING_Y + innerHeight - (entry.overallScore / 100) * innerHeight;
        return { x, y, entry };
    });

    const linePath = points.map(({ x, y }) => `${x},${y}`).join(" ");

    return (
        <div className="overflow-x-auto">
            <svg
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                className="h-52 w-full min-w-[520px]"
                role="img"
                aria-label="Biểu đồ điểm tổng quan qua các buổi phỏng vấn"
            >
                {[0, 50, 100].map((value) => {
                    const y =
                        PADDING_Y +
                        innerHeight -
                        (value / 100) * innerHeight;
                    return (
                        <g key={value}>
                            <line
                                x1={PADDING_X}
                                x2={CHART_WIDTH - PADDING_X}
                                y1={y}
                                y2={y}
                                className="stroke-border"
                                strokeDasharray="4 4"
                                strokeWidth={1}
                            />
                            <text
                                x={PADDING_X - 6}
                                y={y + 4}
                                textAnchor="end"
                                className="fill-muted-foreground text-[10px]"
                            >
                                {value}
                            </text>
                        </g>
                    );
                })}

                {points.length > 1 && (
                    <polyline
                        points={linePath}
                        fill="none"
                        className="stroke-primary"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {points.map(({ x, y, entry }) => (
                    <g key={entry.sessionId}>
                        <circle
                            cx={x}
                            cy={y}
                            r={4}
                            className="fill-background stroke-primary"
                            strokeWidth={2.5}
                        />
                        <text
                            x={x}
                            y={y - 10}
                            textAnchor="middle"
                            className="fill-foreground text-[10px] font-semibold"
                        >
                            {entry.overallScore}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}
