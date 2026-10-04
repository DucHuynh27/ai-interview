import type { StarScores } from "@/types/report";

interface StarRadarChartProps {
    scores: StarScores;
    size?: number;
}

export function StarRadarChart({ scores, size = 320 }: StarRadarChartProps) {
    const center = size / 2;
    const maxRadius = (size / 2) * 0.65;
    const maxScore = 10;

    const axes = [
        {
            key: "situation" as const,
            label: "Situation",
            vietnamese: "Bối cảnh",
            score: scores.situation,
            angle: -Math.PI / 2, // 12 o'clock
            anchor: "middle" as const,
            dy: -14,
            dx: 0,
        },
        {
            key: "task" as const,
            label: "Task",
            vietnamese: "Mục tiêu",
            score: scores.task,
            angle: 0, // 3 o'clock
            anchor: "start" as const,
            dy: 4,
            dx: 14,
        },
        {
            key: "action" as const,
            label: "Action",
            vietnamese: "Hành động",
            score: scores.action,
            angle: Math.PI / 2, // 6 o'clock
            anchor: "middle" as const,
            dy: 24,
            dx: 0,
        },
        {
            key: "result" as const,
            label: "Result",
            vietnamese: "Kết quả",
            score: scores.result,
            angle: Math.PI, // 9 o'clock
            anchor: "end" as const,
            dy: 4,
            dx: -14,
        },
    ];

    const gridLevels = [2.5, 5, 7.5, 10];

    const dataPoints = axes.map((axis) => {
        const radius = (Math.max(0, Math.min(10, axis.score)) / maxScore) * maxRadius;
        const x = center + radius * Math.cos(axis.angle);
        const y = center + radius * Math.sin(axis.angle);
        return { x, y, score: axis.score, key: axis.key };
    });

    const polygonPointsString = dataPoints
        .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(" ");

    return (
        <div className="flex flex-col items-center justify-center">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="overflow-visible"
            >
                <defs>
                    <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.15" />
                    </radialGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.4" />
                    </filter>
                </defs>

                {/* Concentric grid rings */}
                {gridLevels.map((lvl) => {
                    const r = (lvl / maxScore) * maxRadius;
                    const points = axes
                        .map((axis) => {
                            const x = center + r * Math.cos(axis.angle);
                            const y = center + r * Math.sin(axis.angle);
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .join(" ");

                    return (
                        <g key={lvl}>
                            <polygon
                                points={points}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                                className="text-zinc-800 dark:text-zinc-800/80"
                                strokeDasharray={lvl === 10 ? undefined : "3 3"}
                            />
                            {/* Level indicator label */}
                            <text
                                x={center + 4}
                                y={center - r + 3}
                                className="fill-zinc-400 text-[10px] font-mono select-none"
                            >
                                {lvl}
                            </text>
                        </g>
                    );
                })}

                {/* Axis lines */}
                {axes.map((axis) => {
                    const x = center + maxRadius * Math.cos(axis.angle);
                    const y = center + maxRadius * Math.sin(axis.angle);
                    return (
                        <line
                            key={axis.key}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke="currentColor"
                            strokeWidth="1.2"
                            className="text-zinc-700 dark:text-zinc-700/80"
                        />
                    );
                })}

                {/* Data polygon */}
                <polygon
                    points={polygonPointsString}
                    fill="url(#radarFill)"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                />

                {/* Data vertices */}
                {dataPoints.map((point) => (
                    <g key={point.key}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="5"
                            className="fill-emerald-400 stroke-zinc-950 dark:stroke-zinc-950"
                            strokeWidth="2"
                        />
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="8"
                            className="fill-emerald-400/20"
                        />
                    </g>
                ))}

                {/* Axis Labels */}
                {axes.map((axis) => {
                    const labelRadius = maxRadius + 18;
                    const x = center + labelRadius * Math.cos(axis.angle) + axis.dx;
                    const y = center + labelRadius * Math.sin(axis.angle) + axis.dy;

                    return (
                        <g key={`label-${axis.key}`}>
                            <text
                                x={x}
                                y={y}
                                textAnchor={axis.anchor}
                                className="fill-zinc-100 text-xs font-semibold select-none"
                            >
                                {axis.label}
                            </text>
                            <text
                                x={x}
                                y={y + 13}
                                textAnchor={axis.anchor}
                                className="fill-emerald-400 text-[11px] font-mono font-bold select-none"
                            >
                                {axis.score}/10
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Subtitle legend */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Thang điểm 10 theo từng trụ cột STAR
                </span>
            </div>
        </div>
    );
}
