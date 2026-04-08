// lib/supabase/queries/dashboard.ts
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "./empresas";
import { startOfBR } from "@/lib/utils/date-params";
import type { DashboardKPIs, DadosDiarios, ResumoperiodoRow } from "@/types/database";

/** Retorna os KPIs globais e dados diários via RPC nativa do PostgreSQL */
export async function getDashboardData(
    dataInicio: string,
    dataFim: string,
    teses?: string[]
) {
    const supabase = await createClient();
    const empresa = await getCurrentCompany();
    const empresaId = empresa?.id ?? null;

    if (!empresaId) {
        const kpis: DashboardKPIs = { custo: 0, contratos: 0, cac: 0, leads: 0, cpa: 0, txConversao: 0 };
        return { kpis, dadosDiarios: [] as DadosDiarios[], periodos: [] as ResumoperiodoRow[], ultimaAtualizacao: null, tesesList: [] as string[] };
    }

    // Executa KPIs+diários, períodos e teses em paralelo
    const [kpisResult, periodosResult, tesesResult] = await Promise.all([
        supabase.rpc("rpc_dashboard_kpis", {
            p_empresa_id: empresaId,
            p_data_inicio: dataInicio,
            p_data_fim: dataFim,
            p_teses: teses && teses.length > 0 ? teses : null,
        }),
        supabase.rpc("rpc_dashboard_periodos", {
            p_empresa_id: empresaId,
            p_inicio_mes: startOfBR("month"),
            p_inicio_semana: startOfBR("week"),
            p_inicio_dia: startOfBR("day"),
            p_teses: teses && teses.length > 0 ? teses : null,
        }),
        supabase.rpc("rpc_teses_list", {
            p_empresa_id: empresaId,
        }),
    ]);

    if (kpisResult.error) {
        console.error("rpc_dashboard_kpis error:", kpisResult.error);
    }
    if (periodosResult.error) {
        console.error("rpc_dashboard_periodos error:", periodosResult.error);
    }
    if (tesesResult.error) {
        console.error("rpc_teses_list error:", tesesResult.error);
    }

    const rpcData = (kpisResult.data ?? { kpis: { custo: 0, contratos: 0, cac: 0, leads: 0, cpa: 0, txConversao: 0 }, dadosDiarios: [] }) as {
        kpis: Record<string, unknown>;
        dadosDiarios: Array<Record<string, unknown>>;
    };

    const kpis: DashboardKPIs = {
        custo: Number(rpcData.kpis.custo),
        contratos: Number(rpcData.kpis.contratos),
        cac: Number(rpcData.kpis.cac),
        leads: Number(rpcData.kpis.leads),
        cpa: Number(rpcData.kpis.cpa),
        txConversao: Number(rpcData.kpis.txConversao),
    };

    const dadosDiarios: DadosDiarios[] = (rpcData.dadosDiarios ?? []).map((d: Record<string, unknown>) => ({
        data: String(d.data ?? ""),
        leads: Number(d.leads ?? 0),
        contratos: Number(d.contratos ?? 0),
        txConversao: Number(d.txConversao ?? 0),
        custo: Number(d.custo ?? 0),
        cac: Number(d.cac ?? 0),
        cpa: Number(d.cpa ?? 0),
    }));

    const rawPeriodos = (periodosResult.data ?? []) as Array<Record<string, unknown>>;
    const periodos: ResumoperiodoRow[] = rawPeriodos.map((p) => ({
        periodo: String(p.periodo) as ResumoperiodoRow["periodo"],
        custo: Number(p.custo ?? 0),
        contratos: Number(p.contratos ?? 0),
        cac: Number(p.cac ?? 0),
        leads: Number(p.leads ?? 0),
        cpa: Number(p.cpa ?? 0),
        txConversao: Number(p.txConversao ?? 0),
    }));

    const tesesList = ((tesesResult.data ?? []) as string[]).filter(Boolean).sort();

    // Última atualização: último dia com dados
    const ultimaAtualizacao = dadosDiarios.length > 0
        ? dadosDiarios[dadosDiarios.length - 1].data
        : null;

    return { kpis, dadosDiarios, periodos, ultimaAtualizacao, tesesList };
}

/** Retorna apenas os cards de Mês/Semana/Dia via RPC */
export const getResumoPeriodos = cache(async (teses?: string[]): Promise<ResumoperiodoRow[]> => {
    const supabase = await createClient();
    const empresa = await getCurrentCompany();
    const empresaId = empresa?.id ?? null;
    if (!empresaId) return [];

    const { data, error } = await supabase.rpc("rpc_dashboard_periodos", {
        p_empresa_id: empresaId,
        p_inicio_mes: startOfBR("month"),
        p_inicio_semana: startOfBR("week"),
        p_inicio_dia: startOfBR("day"),
        p_teses: teses && teses.length > 0 ? teses : null,
    });

    if (error) {
        console.error("rpc_dashboard_periodos error:", error);
        return [];
    }

    return ((data ?? []) as Array<Record<string, unknown>>).map((p) => ({
        periodo: String(p.periodo) as ResumoperiodoRow["periodo"],
        custo: Number(p.custo ?? 0),
        contratos: Number(p.contratos ?? 0),
        cac: Number(p.cac ?? 0),
        leads: Number(p.leads ?? 0),
        cpa: Number(p.cpa ?? 0),
        txConversao: Number(p.txConversao ?? 0),
    }));
});

/** Retorna a lista de teses (nome_conta) disponíveis para filtro via RPC */
export const getTesesList = cache(async (teses?: string[]): Promise<string[]> => {
    // O parâmetro `teses` anterior era usado para filtrar as teses a serem retornadas,
    // mas a RPC retorna todas. Mantemos a assinatura para compatibilidade.
    void teses;

    const supabase = await createClient();
    const empresa = await getCurrentCompany();
    const empresaId = empresa?.id ?? null;
    if (!empresaId) return [];

    const { data, error } = await supabase.rpc("rpc_teses_list", {
        p_empresa_id: empresaId,
    });

    if (error) {
        console.error("rpc_teses_list error:", error);
        return [];
    }

    return ((data ?? []) as string[]).filter(Boolean).sort();
});
