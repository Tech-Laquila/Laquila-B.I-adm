// components/dashboard/criativos-table.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { CriativoRow } from "@/types/database";

function moeda(v: number) {
    return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const neonHeader = "text-[#00e5a0] text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap";
const tdBase = "px-3 py-2 text-xs text-neutral-300 tabular-nums whitespace-nowrap";
const tdRight = `${tdBase} text-right`;

interface Props {
    criativos: CriativoRow[];
    criativoSelecionado?: string;
}

export function CriativosTable({ criativos, criativoSelecionado }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    function handleClick(adId: string) {
        const params = new URLSearchParams(searchParams.toString());
        // Limpa conjunto ao selecionar criativo (filtros são mutuamente exclusivos)
        params.delete("conjunto");
        if (params.get("criativo") === adId) {
            params.delete("criativo"); // toggle: deseleciona
        } else {
            params.set("criativo", adId);
        }
        router.push(`?${params.toString()}`);
    }

    return (
        <div className="overflow-auto max-h-[420px]">
            <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#0d0d0d] border-b border-[#1f1f1f]">
                    <tr>
                        <th className={`${neonHeader} px-3 py-2`}>Criativo</th>
                        <th className={`${neonHeader} px-3 py-2 text-right`}>Custo</th>
                        <th className={`${neonHeader} px-3 py-2 text-right`}>Leads</th>
                        <th className={`${neonHeader} px-3 py-2 text-right`}>CPA</th>
                        <th className={`${neonHeader} px-3 py-2 text-right`}>CAC</th>
                        <th className={`${neonHeader} px-3 py-2 text-right`}>Lista</th>
                        <th className={`${neonHeader} px-3 py-2 text-right`}>Links</th>
                        <th className={`${neonHeader} px-3 py-2 text-right`}>Contr.</th>
                    </tr>
                </thead>
                <tbody>
                    {criativos.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="px-3 py-8 text-center text-neutral-600 text-xs">
                                Nenhum criativo encontrado no período
                            </td>
                        </tr>
                    ) : (
                        criativos.map((c: CriativoRow, i: number) => {
                            const isSelected = criativoSelecionado === c.adAnuncioId;
                            return (
                                <tr
                                    key={i}
                                    onClick={() => handleClick(c.adAnuncioId)}
                                    className={`
                                        border-b border-[#131313] transition-colors cursor-pointer
                                        ${isSelected
                                            ? "bg-[#00e5a0]/10 border-l-2 border-l-[#00e5a0]"
                                            : "hover:bg-white/[0.02]"
                                        }
                                    `}
                                >
                                    <td
                                        className={`px-3 py-2 text-xs max-w-[180px] truncate ${isSelected ? "text-[#00e5a0] font-semibold" : "text-neutral-300"}`}
                                        title={c.nome}
                                    >
                                        {isSelected && (
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00e5a0] mr-1.5 mb-0.5" />
                                        )}
                                        {c.nome}
                                    </td>
                                    <td className={tdRight}>{moeda(c.custo)}</td>
                                    <td className={tdRight}>{c.leads}</td>
                                    <td className={tdRight}>{moeda(c.cpa)}</td>
                                    <td className={tdRight}>{moeda(c.cac)}</td>
                                    <td className={tdRight}>{c.dadosSolicitados}</td>
                                    <td className={tdRight}>{c.links}</td>
                                    <td className={`${tdRight} font-bold text-[#00e5a0]`}>{c.contratos}</td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
