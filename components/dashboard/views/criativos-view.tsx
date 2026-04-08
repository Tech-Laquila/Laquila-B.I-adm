"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCriativosData } from "@/hooks/use-criativos-data";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { CriativosTable } from "@/components/dashboard/criativos-table";
import { ConjuntosTable } from "@/components/dashboard/conjuntos-table";
import Link from "next/link";

const neonHeader = "text-[#00e5a0] text-[10px] font-semibold uppercase tracking-widest";

export function CriativosView() {
    const searchParams = useSearchParams();

    const hoje = new Date();
    const dataInicio = searchParams.get("inicio") ?? new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
    const dataFim = searchParams.get("fim") ?? new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10);
    const tesesParam = searchParams.get("teses");
    const tesesFiltro = tesesParam ? tesesParam.split(",").filter(Boolean) : [];
    
    const criativoSelecionado = searchParams.get("criativo") ?? undefined;
    const conjuntoSelecionado = searchParams.get("conjunto") ?? undefined;

    const baseUrl = `?view=criativos&inicio=${dataInicio}&fim=${dataFim}${tesesFiltro.length ? `&teses=${tesesFiltro.join(",")}` : ""}`;
    const filtroAtivo = criativoSelecionado || conjuntoSelecionado;

    const { data, isLoading } = useCriativosData(
        dataInicio,
        dataFim,
        tesesFiltro.length > 0 ? tesesFiltro : undefined,
        criativoSelecionado,
        conjuntoSelecionado
    );

    if (isLoading || !data) {
        return <div className="animate-pulse space-y-6">
            <div className="grid lg:grid-cols-2 gap-4">
                <div className="h-96 bg-neutral-800/50 rounded-xl" />
                <div className="h-96 bg-neutral-800/50 rounded-xl" />
            </div>
            <div className="h-64 bg-neutral-800/50 rounded-xl" />
        </div>;
    }

    const { criativos, conjuntos, funnel } = data;

    return (
        <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Tabela de Criativos */}
                <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#1f1f1f] flex items-center justify-between">
                        <p className={neonHeader}>
                            Criativos ({criativos.length})
                            {conjuntoSelecionado && (
                                <span className="ml-2 text-[9px] text-amber-400 font-normal normal-case tracking-normal">
                                    filtrado por conjunto
                                </span>
                            )}
                        </p>
                        {filtroAtivo && (
                            <Link
                                href={baseUrl}
                                className="text-[9px] text-neutral-400 hover:text-[#00e5a0] transition-colors flex items-center gap-1"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] inline-block" />
                                Filtro ativo · limpar
                            </Link>
                        )}
                    </div>
                    <Suspense fallback={null}>
                        <CriativosTable
                            criativos={criativos}
                            criativoSelecionado={criativoSelecionado}
                        />
                    </Suspense>
                </div>

                {/* Funil Visual */}
                <FunnelChart {...funnel} />
            </div>

            {/* Tabela de Conjuntos */}
            <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1f1f1f] flex items-center justify-between">
                    <p className={neonHeader}>
                        Conjuntos de Anúncios ({conjuntos.length})
                        {criativoSelecionado && (
                            <span className="ml-2 text-[9px] text-amber-400 font-normal normal-case tracking-normal">
                                filtrado por criativo
                            </span>
                        )}
                    </p>
                    {filtroAtivo && (
                        <Link
                            href={baseUrl}
                            className="text-[9px] text-neutral-400 hover:text-[#00e5a0] transition-colors flex items-center gap-1"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] inline-block" />
                            Filtro ativo · limpar
                        </Link>
                    )}
                </div>
                <Suspense fallback={null}>
                    <ConjuntosTable
                        conjuntos={conjuntos}
                        conjuntoSelecionado={conjuntoSelecionado}
                    />
                </Suspense>
            </div>
        </div>
    );
}
