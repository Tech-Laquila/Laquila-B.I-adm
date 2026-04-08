// components/dashboard/resumo-table.tsx
import type { ResumoperiodoRow } from "@/types/database";

function moeda(v: number) {
    return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function pct(v: number) {
    return `${v.toFixed(2)}%`;
}

const colorMap: Record<string, string> = {
    Mês: "text-[#00e5a0]",
    Semana: "text-cyan-400",
    Dia: "text-white",
};

const borderColorMap: Record<string, string> = {
    Mês: "border-[#00e5a0]/30",
    Semana: "border-cyan-400/30",
    Dia: "border-neutral-800",
};

export function ResumoTable({ rows }: { rows: ResumoperiodoRow[] }) {
    return (
        <div className="flex flex-col gap-3">
            {rows.map((row) => (
                <div
                    key={row.periodo}
                    className={`flex items-center justify-between p-4 rounded-xl border bg-black/40 hover:bg-white/[0.02] transition-all ${borderColorMap[row.periodo]}`}
                >
                    {/* Lado Esquerdo - 3 Métricas */}
                    <div className="flex flex-1 items-center justify-between gap-4">
                        <div className="flex-1 text-center sm:text-left">
                            <p className="text-[10px] text-[#00e5a0] uppercase tracking-widest font-semibold mb-1">custo</p>
                            <p className={`text-sm md:text-base font-bold tabular-nums ${colorMap[row.periodo]}`}>{moeda(row.custo)}</p>
                        </div>
                        <div className="flex-1 text-center">
                            <p className="text-[10px] text-[#00e5a0] uppercase tracking-widest font-semibold mb-1">Total Contratos</p>
                            <p className={`text-sm md:text-base font-bold tabular-nums ${colorMap[row.periodo]}`}>{row.contratos}</p>
                        </div>
                        <div className="flex-1 text-center">
                            <p className="text-[10px] text-[#00e5a0] uppercase tracking-widest font-semibold mb-1">CAC</p>
                            <p className={`text-sm md:text-base font-bold tabular-nums ${colorMap[row.periodo]}`}>{moeda(row.cac)}</p>
                        </div>
                    </div>

                    {/* Centro - Período */}
                    <div className="mx-6 min-w-[100px] text-center flex flex-col items-center justify-center">
                        <p className={`text-lg md:text-xl font-black ${colorMap[row.periodo]}`}>{row.periodo}</p>
                    </div>

                    {/* Lado Direito - 3 Métricas */}
                    <div className="flex flex-1 items-center justify-between gap-4">
                        <div className="flex-1 text-center">
                            <p className="text-[10px] text-[#00e5a0] uppercase tracking-widest font-semibold mb-1">Leads</p>
                            <p className={`text-sm md:text-base font-bold tabular-nums ${colorMap[row.periodo]}`}>{row.leads}</p>
                        </div>
                        <div className="flex-1 text-center">
                            <p className="text-[10px] text-[#00e5a0] uppercase tracking-widest font-semibold mb-1">CPA</p>
                            <p className={`text-sm md:text-base font-bold tabular-nums ${colorMap[row.periodo]}`}>{moeda(row.cpa)}</p>
                        </div>
                        <div className="flex-1 text-center sm:text-right">
                            <p className="text-[10px] text-[#00e5a0] uppercase tracking-widest font-semibold mb-1">Tx. Conversão</p>
                            <p className={`text-sm md:text-base font-bold tabular-nums ${colorMap[row.periodo]}`}>{pct(row.txConversao)}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
