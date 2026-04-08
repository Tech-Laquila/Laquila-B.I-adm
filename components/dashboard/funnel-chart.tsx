// components/dashboard/funnel-chart.tsx
import type { FunnelData } from "@/types/database";

function moeda(v: number) {
    return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function pct(v: number) {
    return `${v.toFixed(2)}%`;
}

export function FunnelChart({
    custo, leads, links, contratos, cac, cpa, dadosSolicitados, txConversao, txLista, txLink,
}: FunnelData) {
    const layers: {
        label: string;
        value: string;
        width: string;
        bg: string;
        border: string;
        badge?: { label: string; value: string } | null;
        valueColor?: string;
        sub?: { label: string; value: string; color?: string }[];
    }[] = [
            {
                label: "Custo",
                value: moeda(custo),
                width: "100%",
                bg: "from-[#1a3a5c] to-[#0d2a47]",
                border: "border-t-2 border-blue-500/40",
                badge: null,
            },
            {
                label: "Leads",
                value: String(leads),
                width: "82%",
                bg: "from-[#0d2a47] to-[#0a3d2e]",
                border: "",
                badge: null,
                sub: [{ label: "CPA", value: moeda(cpa) }],
            },
            {
                label: "Lista",
                value: String(dadosSolicitados),
                width: "68%",
                bg: "from-[#0a3d2e] to-[#065228]",
                border: "",
                badge: null,
                sub: [{ label: "Tx. Lista", value: pct(txLista), color: "text-neutral-400" }],
            },
            {
                label: "Links",
                value: String(links),
                width: "54%",
                bg: "from-[#0a3d2e] to-[#065228]",
                border: "",
                badge: null,
                sub: [{ label: "Tx. Link", value: pct(txLink), color: "text-neutral-400" }],
            },
            {
                label: "Contratos",
                value: String(contratos),
                width: "36%",
                bg: "from-[#065228] to-[#037a30]",
                border: "",
                badge: null,
                valueColor: "text-[#00ff80]",
                sub: [
                    { label: "CAC", value: moeda(cac), color: "text-amber-400" },
                    { label: "Tx.Conv", value: pct(txConversao), color: "text-[#00e5a0]" },
                ],
            },
        ];

    return (
        <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-6 flex flex-col items-center gap-0 relative">
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mb-4 self-start">Funil de Conversão</p>
            {layers.map((layer, i) => (
                <div
                    key={i}
                    className={`bg-gradient-to-b ${layer.bg} ${layer.border} flex flex-col items-center py-3 px-2 relative`}
                    style={{
                        width: layer.width,
                        clipPath: i === 0
                            ? "polygon(0 0, 100% 0, 95% 100%, 5% 100%)"
                            : i === layers.length - 1
                                ? "polygon(5% 0, 95% 0, 88% 100%, 12% 100%)"
                                : "polygon(5% 0, 95% 0, 90% 100%, 10% 100%)",
                    }}
                >
                    <span className="text-[10px] text-cyan-300 uppercase tracking-widest font-semibold">{layer.label}</span>
                    <span className={`text-xl font-bold text-white tabular-nums ${(layer as { valueColor?: string }).valueColor ?? ""}`}>
                        {layer.value}
                    </span>
                    {(layer as { sub?: { label: string; value: string; color: string }[] }).sub && (
                        <div className="flex gap-3 mt-1">
                            {(layer as { sub: { label: string; value: string; color: string }[] }).sub.map((s) => (
                                <span key={s.label} className={`text-[9px] ${s.color}`}>
                                    {s.label}: {s.value}
                                </span>
                            ))}
                        </div>
                    )}
                    {layer.badge && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            {layer.badge.label}: {layer.badge.value}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}
