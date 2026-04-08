"use client";

// components/dashboard/vendedor-card.tsx
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { VendedorStats } from "@/types/database";

interface Props {
    vendedores: VendedorStats[];
    personagemUrl?: string | null;
}

export function VendedorCard({ vendedores, personagemUrl }: Props) {
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 5;

    if (vendedores.length === 0) {
        return (
            <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl p-8 flex items-center justify-center col-span-full">
                <p className="text-neutral-600 text-sm">Nenhum vendedor encontrado no período</p>
            </div>
        );
    }

    const totalPages = Math.ceil(vendedores.length / PAGE_SIZE) || 1;
    // Guarantee page is within bounds if data changes
    const safePage = Math.min(page, totalPages - 1);

    const startIndex = safePage * PAGE_SIZE;
    const visibleVendedores = vendedores.slice(startIndex, startIndex + PAGE_SIZE);

    // Destaque da visão atual (primeiro da lista p/ as badges ilustrativas)
    const destaque = visibleVendedores[0];

    // Para manter a tabela com tamanho fixo, preenchemos as linhas vazias
    const emptyRows = Math.max(0, PAGE_SIZE - visibleVendedores.length);

    return (
        <div className="bg-[#050505] border border-[#00e5a0]/40 rounded-2xl overflow-hidden flex flex-col h-full min-h-[460px]">
            {/* Header com Imagem e Badges Sobrepostas */}
            <div className="relative pt-6 pb-2 px-6 flex flex-col items-center bg-[#050505]">

                {/* Imagem do vendedor contida (não esticada) */}
                <div className="relative w-40 h-48 z-10 mx-auto">
                    <Image
                        src={personagemUrl || "/assets/vendedor.png"}
                        alt="Vendedor Destaque"
                        fill
                        className="object-contain object-bottom"
                        priority
                    />
                </div>

                {/* 3 badges Mês / Semana / Dia (Contratos) com borda branca e texto verde */}
                <div className="flex gap-2 sm:gap-4 w-full justify-center px-2 -mt-6 z-20 relative pb-1">
                    <div className="flex-1 max-w-[110px] bg-black border border-white/80 rounded-[1.25rem] py-1.5 sm:py-2 text-center shadow-lg pb-1.5">
                        <p className="text-[12px] sm:text-[14px] text-[#00e5a0] font-medium tracking-wide">Mês</p>
                        <p className="text-xl sm:text-3xl font-light text-[#00e5a0] tabular-nums mt-0.5 leading-none">{destaque?.contratosMes ?? 0}</p>
                    </div>
                    <div className="flex-1 max-w-[110px] bg-black border border-white/80 rounded-[1.25rem] py-1.5 sm:py-2 text-center shadow-lg pb-1.5">
                        <p className="text-[12px] sm:text-[14px] text-[#00e5a0] font-medium tracking-wide">Semana</p>
                        <p className="text-xl sm:text-3xl font-light text-[#00e5a0] tabular-nums mt-0.5 leading-none">{destaque?.contratosSemana ?? 0}</p>
                    </div>
                    <div className="flex-1 max-w-[110px] bg-black border border-white/80 rounded-[1.25rem] py-1.5 sm:py-2 text-center shadow-lg pb-1.5">
                        <p className="text-[12px] sm:text-[14px] text-[#00e5a0] font-medium tracking-wide">Dia</p>
                        <p className="text-xl sm:text-3xl font-light text-[#00e5a0] tabular-nums mt-0.5 leading-none">{destaque?.contratosDia ?? 0}</p>
                    </div>
                </div>
            </div>

            {/* Tabela interna responsiva espelhando a referência */}
            <div className="px-5 py-2 flex-1 flex flex-col bg-[#050505]">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-[#00e5a0] border-b border-[#1f1f1f]/80">
                            <th className="text-left py-2.5 font-bold text-[13px] tracking-wide">Consultor</th>
                            <th className="text-left py-2.5 font-bold text-[13px] tracking-wide">Meta</th>
                            <th className="text-right py-2.5 font-bold text-[13px] tracking-wide flex items-center justify-end gap-1">
                                Feitos <span className="text-[9px]">▼</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleVendedores.map((v, i) => (
                            <tr key={i} className="text-[#00e5a0] border-b border-[#1f1f1f]/60 last:border-0 hover:bg-white/5 transition-colors">
                                <td className="py-3 text-[13px] font-semibold tracking-wide">{v.nome}</td>
                                <td className="py-3 text-left text-[13px] font-semibold">{v.metaDia}</td>
                                <td className="py-3 text-right text-[13px] font-light pr-4">{v.contratosDia}</td>
                            </tr>
                        ))}
                        {/* Linhas vazias invisíveis para manter o tamanho do card fixo */}
                        {Array.from({ length: emptyRows }).map((_, i) => (
                            <tr key={`empty-${i}`} className="text-transparent border-b border-[#1f1f1f]/0">
                                <td className="py-3 text-[13px] select-none">-</td>
                                <td className="py-3 text-left text-[13px] select-none">-</td>
                                <td className="py-3 text-right text-[13px] select-none">-</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginação textual à direita, sem balões */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#050505] rounded-b-2xl">
                <div /> {/* Spacer esquerdo para empurrar o resto para direita ou centro */}
                <div className="flex items-center justify-center gap-6 w-full sm:justify-end sm:w-auto text-[#00e5a0]">
                    <span className="text-[13px] font-bold tracking-widest">
                        {startIndex + 1} - {Math.min(startIndex + PAGE_SIZE, vendedores.length)} / {vendedores.length}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={safePage === 0}
                            className="p-1 hover:text-white disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 pointer-events-none" />
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={safePage >= totalPages - 1}
                            className="p-1 hover:text-white disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 pointer-events-none" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
