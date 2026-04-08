"use client";

// components/dashboard/line-chart.tsx
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    Area,
    AreaChart,
} from "recharts";

interface Serie {
    key: string;
    color: string;
    yAxisId?: "left" | "right";
    name?: string;
}

interface Props {
    data: Record<string, unknown>[];
    series: Serie[];
    xKey?: string;
    title?: string;
}

const tooltipStyle = {
    backgroundColor: "#111",
    border: "1px solid #1f1f1f",
    borderRadius: 8,
    color: "#e5e5e5",
    fontSize: 11,
};

export function DashLineChart({ data, series, xKey = "data", title }: Props) {
    // Format date for display
    const formattedData = data.map((d) => ({
        ...d,
        [xKey]: typeof d[xKey] === "string"
            ? (d[xKey] as string).slice(5) // MM-DD
            : d[xKey],
    }));

    return (
        <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-4 h-72 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                {title && (
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                        {title}
                    </p>
                )}
                <div className="flex items-center gap-3">
                    {series.map((s) => (
                        <div key={s.key} className="flex items-center gap-1.5">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: s.color }}
                            />
                            <span className="text-[10px] text-neutral-400 font-medium">
                                {s.name ?? s.key}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            {series.map((s) => (
                                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={s.color} stopOpacity={0.15} />
                                    <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                        <XAxis
                            dataKey={xKey}
                            tick={{ fill: "#4b5563", fontSize: 9 }}
                            tickLine={false}
                            axisLine={false}
                            dy={5}
                        />
                        <YAxis
                            yAxisId="left"
                            tick={{ fill: "#4b5563", fontSize: 9 }}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fill: "#4b5563", fontSize: 9 }}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                        />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#ffffff20" }} />
                        {series.map((s) => (
                            <Area
                                key={s.key}
                                yAxisId={s.yAxisId ?? "left"}
                                type="monotone"
                                dataKey={s.key}
                                name={s.name ?? s.key}
                                stroke={s.color}
                                fill={`url(#grad-${s.key})`}
                                dot={false}
                                strokeWidth={2}
                                activeDot={{ r: 4, fill: s.color }}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
