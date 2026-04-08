// lib/supabase/queries/criativos.ts
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "./empresas";
import type { CriativoRow, ConjuntoRow, FunnelData } from "@/types/database";

export async function getCriativosData(
    dataInicio: string,
    dataFim: string,
    teses?: string[],
    criativoSelecionado?: string,
    conjuntoSelecionado?: string
) {
    const supabase = await createClient();

    const empresa = await getCurrentCompany();
    const empresaId = empresa?.id ?? null;

    if (!empresaId) {
        const emptyFunnel: FunnelData = {
            custo: 0, leads: 0, links: 0, contratos: 0,
            cac: 0, cpa: 0, dadosSolicitados: 0,
            txConversao: 0, txLista: 0, txLink: 0,
        };
        return { criativos: [] as CriativoRow[], conjuntos: [] as ConjuntoRow[], funnel: emptyFunnel };
    }

    const { data, error } = await supabase.rpc("rpc_criativos_data", {
        p_empresa_id: empresaId,
        p_data_inicio: dataInicio,
        p_data_fim: dataFim,
        p_teses: teses && teses.length > 0 ? teses : null,
        p_criativo_id: criativoSelecionado ?? null,
        p_conjunto_id: conjuntoSelecionado ?? null,
    });

    if (error) {
        console.error("rpc_criativos_data error:", error);
        const emptyFunnel: FunnelData = {
            custo: 0, leads: 0, links: 0, contratos: 0,
            cac: 0, cpa: 0, dadosSolicitados: 0,
            txConversao: 0, txLista: 0, txLink: 0,
        };
        return { criativos: [] as CriativoRow[], conjuntos: [] as ConjuntoRow[], funnel: emptyFunnel };
    }

    const rpcData = (data ?? { criativos: [], conjuntos: [], funnel: {} }) as {
        criativos: Array<Record<string, unknown>>;
        conjuntos: Array<Record<string, unknown>>;
        funnel: Record<string, unknown>;
    };

    // Mapeia os criativos garantindo tipos numéricos
    const criativos: CriativoRow[] = (rpcData.criativos ?? []).map((c) => ({
        adAnuncioId: String(c.adAnuncioId ?? ""),
        nome: String(c.nome ?? ""),
        custo: Number(c.custo ?? 0),
        leads: Number(c.leads ?? 0),
        cpa: Number(c.cpa ?? 0),
        contratos: Number(c.contratos ?? 0),
        cac: Number(c.cac ?? 0),
        links: Number(c.links ?? 0),
        dadosSolicitados: Number(c.dadosSolicitados ?? 0),
    }));

    // Mapeia os conjuntos garantindo tipos numéricos
    const conjuntos: ConjuntoRow[] = (rpcData.conjuntos ?? []).map((c) => ({
        conjuntoId: String(c.conjuntoId ?? ""),
        nome: String(c.nome ?? ""),
        custo: Number(c.custo ?? 0),
        leads: Number(c.leads ?? 0),
        cpa: Number(c.cpa ?? 0),
        dadosSolicitados: Number(c.dadosSolicitados ?? 0),
        links: Number(c.links ?? 0),
        contratos: Number(c.contratos ?? 0),
        txConversao: Number(c.txConversao ?? 0),
        cac: Number(c.cac ?? 0),
    }));

    // Mapeia o funnel
    const f = rpcData.funnel ?? {};
    const funnel: FunnelData = {
        custo: Number(f.custo ?? 0),
        leads: Number(f.leads ?? 0),
        links: Number(f.links ?? 0),
        contratos: Number(f.contratos ?? 0),
        cac: Number(f.cac ?? 0),
        cpa: Number(f.cpa ?? 0),
        dadosSolicitados: Number(f.dadosSolicitados ?? 0),
        txConversao: Number(f.txConversao ?? 0),
        txLista: Number(f.txLista ?? 0),
        txLink: Number(f.txLink ?? 0),
    };

    return { criativos, conjuntos, funnel };
}
