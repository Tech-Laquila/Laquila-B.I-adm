"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import type { EmpresaKPIsRow } from "@/types/database";

const brl = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const num = (v: number) => v.toLocaleString("pt-BR");

const pct = (v: number) => `${v.toFixed(2)}%`;

interface Props {
    empresas: EmpresaKPIsRow[];
    dataInicio: string;
    dataFim: string;
}

export function EmpresasKpisGrid({ empresas, dataInicio, dataFim }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [busca, setBusca] = useState("");

    const applyDates = useCallback(
        (novaInicio: string, novaFim: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("inicio", novaInicio);
            params.set("fim", novaFim);
            router.push(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams]
    );

    const empresasFiltradas = busca.trim()
        ? empresas.filter((e) =>
              e.nome.toLowerCase().includes(busca.toLowerCase())
          )
        : empresas;

    return (
        <div className="space-y-4">
            {/* Linha: título + filtros */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Visão Geral</h1>
                    <p className="text-neutral-500 text-sm mt-0.5">
                        KPIs consolidados de todas as empresas.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Busca por nome */}
                    <div className="flex items-center gap-2 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg px-3 py-2 min-w-[180px]">
                        <Search className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Filtrar empresa..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="bg-transparent text-neutral-300 text-xs outline-none placeholder:text-neutral-600 w-full"
                        />
                    </div>

                    {/* Filtro de data */}
                    <div className="flex items-center gap-2 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg px-3 py-2">
                        <input
                            type="date"
                            defaultValue={dataInicio}
                            className="bg-transparent text-neutral-300 text-xs outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-opacity"
                            onChange={(e) => applyDates(e.target.value, dataFim)}
                        />
                        <span className="text-neutral-600 text-xs">→</span>
                        <input
                            type="date"
                            defaultValue={dataFim}
                            className="bg-transparent text-neutral-300 text-xs outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-opacity"
                            onChange={(e) => applyDates(dataInicio, e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Painel com scroll */}
            <div className="border border-neutral-800 rounded-xl overflow-y-auto max-h-[calc(100vh-220px)] p-6 space-y-8">
                {empresasFiltradas.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                        <p className="text-neutral-500 text-sm">Nenhuma empresa encontrada.</p>
                    </div>
                ) : (
                    empresasFiltradas.map((empresa, i) => (
                        <div key={empresa.empresaId} className="space-y-3">
                            {/* Nome da empresa */}
                            <div className="flex items-center gap-3">
                                {empresa.logoUrl && (
                                    <img
                                        src={empresa.logoUrl}
                                        alt={empresa.nome}
                                        className="h-7 w-7 object-contain rounded flex-shrink-0"
                                    />
                                )}
                                <h2 className="text-base font-semibold text-white">
                                    {empresa.nome}
                                </h2>
                            </div>

                            {/* KPI Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                <KpiCard label="Custo" value={brl(empresa.custo)} />
                                <KpiCard label="Contratos" value={num(empresa.contratos)} />
                                <KpiCard label="CAC" value={brl(empresa.cac)} />
                                <KpiCard label="Leads" value={num(empresa.leads)} />
                                <KpiCard label="CPA" value={brl(empresa.cpa)} />
                                <KpiCard label="Tx. Conversão" value={pct(empresa.txConversao)} />
                            </div>

                            {/* Separador (exceto no último) */}
                            {i < empresasFiltradas.length - 1 && (
                                <div className="border-b border-neutral-800/60 pt-2" />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
