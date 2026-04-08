"use client";

import { useSearchParams } from "next/navigation";
import { useVendedoresData } from "@/hooks/use-vendedores-data";
import { todayBR } from "@/lib/utils/date-params";
import { VendedorCard } from "@/components/dashboard/vendedor-card";

function moeda(v: number) {
    return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pct(v: number) {
    return `${v.toFixed(2)}%`;
}

export function VendedoresView() {
    const searchParams = useSearchParams();

    // Default: mês atual no fuso de São Paulo (GMT-3)
    const mesReferencia = searchParams.get("mes") ?? todayBR().slice(0, 7);

    // Converte o mês recebido para dataInicio (1º dia do mês) e dataFim (último dia do mês)
    const [anoStr, mesStr] = mesReferencia.split("-");
    const ano = parseInt(anoStr, 10);
    const mes = parseInt(mesStr, 10) - 1; // 0 indexado

    const dataInicio = `${ano}-${mesStr}-01`;
    const lastDay = new Date(ano, mes + 1, 0).getDate();
    const dataFim = `${ano}-${mesStr}-${String(lastDay).padStart(2, "0")}`;

    const { data, isLoading } = useVendedoresData(dataInicio, dataFim);

    if (isLoading || !data) {
        return <div className="animate-pulse space-y-6">
            <div className="flex justify-center">
                <div className="w-full max-w-sm h-64 bg-neutral-800/50 rounded-xl" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-neutral-800/50 rounded-xl" />)}
            </div>
        </div>;
    }

    const { vendedores, totais, metas, txConversao, custoTotal, custoTotalSemana, custoTotalDia, personagemUrl, leads } = data;

    // O CAC global é o custo total / Vendas
    const cacGlobalMes = totais.mes > 0 ? custoTotal / totais.mes : 0;
    const cacGlobalSemana = totais.semana > 0 ? custoTotalSemana / totais.semana : 0;
    const cacGlobalDia = totais.dia > 0 ? custoTotalDia / totais.dia : 0;

    return (
        <div className="space-y-6">
            {/* Card Central de Vendedor */}
            <div className="flex justify-center">
                <div className="w-full max-w-sm">
                    <VendedorCard vendedores={vendedores} personagemUrl={personagemUrl} />
                </div>
            </div>

            {/* 3 Blocos KPI */}
            <div className="grid md:grid-cols-3 gap-4">

                {/* ── Bloco 1 — CONTRATOS & TX CONVERSÃO (Global) ── */}
                <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl overflow-hidden flex flex-col">
                    {/* ▶ Seção Contratos */}
                    <div className="p-5 flex-1">
                        <p className="text-[18px] font-semibold text-[#00e5a0] uppercase tracking-widest text-center mb-3">Contratos</p>
                        <div className="grid grid-cols-3 text-center">
                            {/* Mês */}
                            <div className="px-1">
                                <p className="text-[15px] text-[#00e5a0] font-semibold uppercase tracking-wider">Mês</p>
                                <p className="text-2xl font-black text-[#00e5a0] tabular-nums leading-tight">{totais.mes}</p>
                            </div>
                            {/* Semana */}
                            <div className="px-1 border-x border-[#1f1f1f]">
                                <p className="text-[15px] text-cyan-400 font-semibold uppercase tracking-wider">Semana</p>
                                <p className="text-2xl font-black text-cyan-400 tabular-nums leading-tight">{totais.semana}</p>
                            </div>
                            {/* Dia */}
                            <div className="px-1">
                                <p className="text-[15px] text-white font-semibold uppercase tracking-wider">Dia</p>
                                <p className="text-2xl font-black text-white tabular-nums leading-tight">{totais.dia}</p>
                            </div>
                        </div>
                    </div>

                    {/* Divisor */}
                    <div className="border-t border-[#1f1f1f] mx-4" />

                    {/* ▶ Seção Tx. Conversão */}
                    <div className="p-5 flex-1">
                        <p className="text-[18px] font-semibold text-[#00e5a0] uppercase tracking-widest text-center mb-3">Tx. Conversão</p>
                        <div className="grid grid-cols-3 text-center">
                            {/* Mês */}
                            <div className="px-1">
                                <p className="text-[15px] text-[#00e5a0] font-semibold uppercase tracking-wider">Mês</p>
                                <p className="text-2xl font-black text-[#00e5a0] tabular-nums leading-tight">{pct(txConversao.mes)}</p>
                            </div>
                            {/* Semana */}
                            <div className="px-1 border-x border-[#1f1f1f]">
                                <p className="text-[15px] text-cyan-400 font-semibold uppercase tracking-wider">Semana</p>
                                <p className="text-2xl font-black text-cyan-400 tabular-nums leading-tight">{pct(txConversao.semana)}</p>
                            </div>
                            {/* Dia */}
                            <div className="px-1">
                                <p className="text-[15px] text-white font-semibold uppercase tracking-wider">Dia</p>
                                <p className="text-2xl font-black text-white tabular-nums leading-tight">{pct(txConversao.dia)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Bloco 2 — CAC (Global) ── */}
                <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl flex flex-col justify-center p-5">
                    <p className="text-[25px] font-semibold text-[#00e5a0] uppercase tracking-widest text-center mb-3">CAC</p>
                    <div className="grid grid-cols-3 text-center gap-x-1">
                        {/* Mês */}
                        <div className="min-w-0">
                            <p className="text-[13px] text-[#00e5a0] font-bold uppercase tracking-wider">Mês</p>
                            <p className="text-sm font-black text-[#00e5a0] tabular-nums leading-tight break-all">{moeda(cacGlobalMes)}</p>
                        </div>
                        {/* Semana */}
                        <div className="min-w-0 border-x border-[#1f1f1f]">
                            <p className="text-[13px] text-cyan-400 font-bold uppercase tracking-wider">Semana</p>
                            <p className="text-sm font-black text-cyan-400 tabular-nums leading-tight break-all">{moeda(cacGlobalSemana)}</p>
                        </div>
                        {/* Dia */}
                        <div className="min-w-0">
                            <p className="text-[13px] text-white font-bold uppercase tracking-wider">Dia</p>
                            <p className="text-sm font-black text-white tabular-nums leading-tight break-all">{moeda(cacGlobalDia)}</p>
                        </div>
                    </div>
                </div>

                {/* ── Bloco 3 — META + LEADS ── */}
                <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl overflow-hidden flex flex-col">
                    {/* ▶ Seção META */}
                    <div className="p-5 flex-1">
                        <p className="text-[20px] font-semibold text-amber-400 uppercase tracking-widest text-center mb-3">META</p>
                        <div className="grid grid-cols-3 text-center">
                            {/* Mês */}
                            <div className="px-1">
                                <p className="text-[15px] text-[#00e5a0] font-semibold uppercase tracking-wider">Mês</p>
                                <p className="text-2xl font-black text-amber-400 tabular-nums leading-tight">{metas.mes}</p>
                            </div>
                            {/* Semana */}
                            <div className="px-1 border-x border-[#1f1f1f]">
                                <p className="text-[15px] text-cyan-400 font-semibold uppercase tracking-wider">Semana</p>
                                <p className="text-2xl font-black text-amber-400 tabular-nums leading-tight">{metas.semana}</p>
                            </div>
                            {/* Dia */}
                            <div className="px-1">
                                <p className="text-[15px] text-white font-semibold uppercase tracking-wider">Dia</p>
                                <p className="text-2xl font-black text-amber-400 tabular-nums leading-tight">{metas.dia}</p>
                            </div>
                        </div>
                    </div>

                    {/* Divisor */}
                    <div className="border-t border-[#1f1f1f] mx-4" />

                    {/* ▶ Seção LEADS */}
                    <div className="p-5 flex-1">
                        <p className="text-[20px] font-semibold text-cyan-400 uppercase tracking-widest text-center mb-3">Leads</p>
                        <div className="grid grid-cols-3 text-center">
                            {/* Mês */}
                            <div className="px-1">
                                <p className="text-[15px] text-[#00e5a0] font-semibold uppercase tracking-wider">Mês</p>
                                <p className="text-2xl font-black text-[#00e5a0] tabular-nums leading-tight">
                                    {leads.mes.toLocaleString("pt-BR")}
                                </p>
                            </div>
                            {/* Semana */}
                            <div className="px-1 border-x border-[#1f1f1f]">
                                <p className="text-[15px] text-cyan-400 font-semibold uppercase tracking-wider">Semana</p>
                                <p className="text-2xl font-black text-cyan-400 tabular-nums leading-tight">
                                    {leads.semana.toLocaleString("pt-BR")}
                                </p>
                            </div>
                            {/* Dia */}
                            <div className="px-1">
                                <p className="text-[15px] text-white font-semibold uppercase tracking-wider">Dia</p>
                                <p className="text-2xl font-black text-white tabular-nums leading-tight">
                                    {leads.dia.toLocaleString("pt-BR")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
