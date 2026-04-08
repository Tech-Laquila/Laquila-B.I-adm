"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ResumoTable } from "@/components/dashboard/resumo-table";
import { DashLineChart } from "@/components/dashboard/line-chart-client";

function moeda(v: number) {
    return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function pct(v: number) {
    return `${v.toFixed(2)}%`;
}

export function ResumoView() {
    const searchParams = useSearchParams();
    
    const hoje = new Date();
    const dataInicio = searchParams.get("inicio") ?? new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
    const dataFim = searchParams.get("fim") ?? new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10);
    const tesesParam = searchParams.get("teses");
    const tesesFiltro = tesesParam ? tesesParam.split(",").filter(Boolean) : [];

    const { data, isLoading } = useDashboardData(dataInicio, dataFim, tesesFiltro.length > 0 ? tesesFiltro : undefined);

    if (isLoading || !data) {
        return <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-neutral-800/50 rounded-xl" />)}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="h-80 bg-neutral-800/50 rounded-xl" />
                <div className="h-80 bg-neutral-800/50 rounded-xl" />
            </div>
        </div>;
    }

    const { kpis, dadosDiarios, periodos } = data;

    const dadosDiariosFormatados = dadosDiarios.map((d: any) => ({
        ...d,
        custo: parseFloat(d.custo.toFixed(2)),
        txConversao: parseFloat(d.txConversao.toFixed(2)),
        cac: parseFloat(d.cac.toFixed(2)),
        cpa: parseFloat(d.cpa.toFixed(2)),
    }));

    const seriesGraf1 = [
        { key: "leads", color: "#3b82f6", yAxisId: "left" as const, name: "Leads" },
        { key: "contratos", color: "#f97316", yAxisId: "left" as const, name: "Contratos" },
        { key: "txConversao", color: "#2bb84aff", yAxisId: "right" as const, name: "Tx. Conv. %" },
    ];
    const seriesGraf2 = [
        { key: "custo", color: "#3b82f6", yAxisId: "left" as const, name: "Custo" },
        { key: "cac", color: "#f97316", yAxisId: "right" as const, name: "CAC" },
        { key: "cpa", color: "#18dd53ff", yAxisId: "right" as const, name: "CPA" },
    ];

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <KpiCard label="Custo" value={moeda(kpis.custo)} />
                <KpiCard label="Total Contratos" value={String(kpis.contratos)} />
                <KpiCard label="CAC" value={moeda(kpis.cac)} />
                <KpiCard label="Leads" value={String(kpis.leads)} />
                <KpiCard label="CPA" value={moeda(kpis.cpa)} />
                <KpiCard label="Tx. Conversão" value={pct(kpis.txConversao)} />
            </div>

            {/* Gráficos */}
            <div className="grid md:grid-cols-2 gap-4">
                <DashLineChart
                    data={dadosDiariosFormatados}
                    series={seriesGraf1}
                    title="Leads + Contratos + Tx. Conversão"
                />
                <DashLineChart
                    data={dadosDiariosFormatados}
                    series={seriesGraf2}
                    title="Custo + CAC + CPA"
                />
            </div>

            {/* Tabela Mês / Semana / Dia */}
            <div>
                <ResumoTable rows={periodos} />
            </div>
        </div>
    );
}
