"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { EmpresaKPIsRow } from "@/types/database";

type SortKey = keyof Omit<EmpresaKPIsRow, "empresaId" | "nome" | "logoUrl">;
type SortDir = "asc" | "desc";

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
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "desc" ? "asc" : "desc"));
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
    };

    const applyDates = useCallback(
        (novaInicio: string, novaFim: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("inicio", novaInicio);
            params.set("fim", novaFim);
            router.push(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams]
    );

    const empresasFiltradas = (() => {
        let lista = busca.trim()
            ? empresas.filter((e) => e.nome.toLowerCase().includes(busca.toLowerCase()))
            : [...empresas];

        if (sortKey) {
            lista.sort((a, b) =>
                sortDir === "desc" ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]
            );
        }

        return lista;
    })();

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

            {/* Tabela */}
            <div className="rounded-xl border border-neutral-800 overflow-hidden">
                <div className="overflow-auto max-h-[calc(100vh-220px)]">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-neutral-800 bg-neutral-900">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                    Empresa
                                </th>
                                {(["custo", "leads", "contratos", "cac", "cpa", "txConversao"] as SortKey[]).map((key) => (
                                    <th
                                        key={key}
                                        onClick={() => handleSort(key)}
                                        className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:text-white select-none transition-colors"
                                    >
                                        <span className="inline-flex items-center justify-end gap-1">
                                            {{ custo: "Custo", leads: "Leads", contratos: "Contratos", cac: "CAC", cpa: "CPA", txConversao: "TX Conv." }[key]}
                                            {sortKey === key ? (
                                                sortDir === "desc"
                                                    ? <ChevronDown className="w-3 h-3" />
                                                    : <ChevronUp className="w-3 h-3" />
                                            ) : (
                                                <ChevronsUpDown className="w-3 h-3 opacity-30" />
                                            )}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {empresasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center text-neutral-500 text-sm">
                                        Nenhuma empresa encontrada.
                                    </td>
                                </tr>
                            ) : (
                                empresasFiltradas.map((empresa, i) => (
                                    <tr
                                        key={empresa.empresaId}
                                        className={`border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors ${
                                            i % 2 === 0 ? "bg-transparent" : "bg-neutral-900/20"
                                        }`}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {empresa.logoUrl && (
                                                    <img
                                                        src={empresa.logoUrl}
                                                        alt={empresa.nome}
                                                        className="h-6 w-6 object-contain rounded flex-shrink-0"
                                                    />
                                                )}
                                                <span className="font-medium text-white">{empresa.nome}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right tabular-nums text-neutral-300">
                                            {brl(empresa.custo)}
                                        </td>
                                        <td className="px-5 py-4 text-right tabular-nums text-neutral-300">
                                            {num(empresa.leads)}
                                        </td>
                                        <td className="px-5 py-4 text-right tabular-nums font-semibold text-[#00e5a0]">
                                            {num(empresa.contratos)}
                                        </td>
                                        <td className="px-5 py-4 text-right tabular-nums text-neutral-300">
                                            {brl(empresa.cac)}
                                        </td>
                                        <td className="px-5 py-4 text-right tabular-nums text-neutral-300">
                                            {brl(empresa.cpa)}
                                        </td>
                                        <td className="px-5 py-4 text-right tabular-nums text-neutral-300">
                                            {pct(empresa.txConversao)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
