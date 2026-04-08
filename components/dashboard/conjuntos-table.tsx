// components/dashboard/conjuntos-table.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ConjuntoRow } from "@/types/database";

function moeda(v: number) {
    return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function pct(v: number) {
    return `${v.toFixed(2)}%`;
}

const neonHeader = "text-[#00e5a0] text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap";
const tdBase = "px-3 py-2 text-xs text-neutral-300 tabular-nums whitespace-nowrap";
const tdRight = `${tdBase} text-right`;

interface Props {
    conjuntos: ConjuntoRow[];
    conjuntoSelecionado?: string;
}

export function ConjuntosTable({ conjuntos, conjuntoSelecionado }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    function handleClick(conjId: string) {
        const params = new URLSearchParams(searchParams.toString());
        // Limpa criativo ao selecionar conjunto (filtros são mutuamente exclusivos)
        params.delete("criativo");
        if (params.get("conjunto") === conjId) {
            params.delete("conjunto"); // toggle: deseleciona
        } else {
            params.set("conjunto", conjId);
        }
        router.push(`?${params.toString()}`);
    }

    return (
        <div className="overflow-auto">
            <table className="w-full text-left min-w-[900px]">
                <thead className="border-b border-[#1f1f1f]">
                    <tr>
                        <th className={`${neonHeader} px-3 py-2`}>#</th>
                        <th className={`${neonHeader} px-3 py-2`}>Conjunto</th>
                        <th className={`${neonHeader} px-3 py-2 text-right`}>Custo</th>
                        <th className={`${neonHeader} px-3 py-2 text-right`}>Leads</th>
                        <th className={`${neonHeader} px-3 py-2 text-right`}>CPA</th>
                        <th className={`${neonHeader} px-3 py-2 text-right`}>Da.</th>
                        <th className={`${neonHeader} px-3 py-2 text-right`}>Links</th>
                        <th className={`${neonHeader} px-3 py-2 text-right`}>Contr.</th>
                        <th className={`${neonHeader} px-3 py-2 text-right`}>Tx.Conv.</th>
                        <th className={`${neonHeader} px-3 py-2 text-right`}>CAC</th>
                    </tr>
                </thead>
                <tbody>
                    {conjuntos.length === 0 ? (
                        <tr>
                            <td colSpan={10} className="px-3 py-8 text-center text-neutral-600 text-xs">
                                Nenhum conjunto encontrado no período
                            </td>
                        </tr>
                    ) : (
                        conjuntos.map((c: ConjuntoRow, i: number) => {
                            const isSelected = conjuntoSelecionado === c.conjuntoId;
                            return (
                                <tr
                                    key={i}
                                    onClick={() => handleClick(c.conjuntoId)}
                                    className={`
                                        border-b border-[#131313] transition-colors cursor-pointer
                                        ${isSelected
                                            ? "bg-[#00e5a0]/10 border-l-2 border-l-[#00e5a0]"
                                            : "hover:bg-white/[0.02]"
                                        }
                                    `}
                                >
                                    <td className={`px-3 py-2 text-xs ${isSelected ? "text-[#00e5a0]" : "text-neutral-600"}`}>
                                        {i + 1}
                                    </td>
                                    <td
                                        className={`px-3 py-2 text-xs max-w-[200px] truncate ${isSelected ? "text-[#00e5a0] font-semibold" : "text-neutral-300"}`}
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
                                    <td className={tdRight}>{c.dadosSolicitados}</td>
                                    <td className={tdRight}>{c.links}</td>
                                    <td className={`${tdRight} font-bold text-[#00e5a0]`}>{c.contratos}</td>
                                    <td className={tdRight}>{pct(c.txConversao)}</td>
                                    <td className={tdRight}>{moeda(c.cac)}</td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
