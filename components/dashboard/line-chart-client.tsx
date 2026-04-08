"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { DashLineChart as DashLineChartType } from "./line-chart";

const DashLineChartLazy = dynamic(
    () => import("@/components/dashboard/line-chart").then(m => ({ default: m.DashLineChart })),
    {
        loading: () => <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl h-72 animate-pulse" />,
        ssr: false,
    }
);

export function DashLineChart(props: ComponentProps<typeof DashLineChartType>) {
    return <DashLineChartLazy {...props} />;
}
