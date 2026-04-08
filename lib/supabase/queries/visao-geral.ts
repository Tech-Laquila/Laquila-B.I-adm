// lib/supabase/queries/visao-geral.ts
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EmpresaKPIsRow } from "@/types/database";

export async function getAllCompaniesKpis(
    dataInicio: string,
    dataFim: string
): Promise<EmpresaKPIsRow[]> {
    // Verifica se o usuário está autenticado
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Admin client para buscar todas as empresas sem restrição de RLS
    const adminClient = createAdminClient();

    const { data: empresas, error: empresasError } = await adminClient
        .from("empresas")
        .select("id")
        .eq("ativo", true);

    if (empresasError || !empresas || empresas.length === 0) return [];

    const empresaIds = empresas.map((e) => e.id);

    const { data, error } = await adminClient.rpc("rpc_kpis_todas_empresas", {
        p_empresa_ids: empresaIds,
        p_data_inicio: dataInicio,
        p_data_fim: dataFim,
    });

    if (error) {
        console.error("rpc_kpis_todas_empresas error:", error);
        return [];
    }

    return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
        empresaId: String(row.empresaId),
        nome: String(row.nome),
        logoUrl: row.logoUrl ? String(row.logoUrl) : null,
        custo: Number(row.custo ?? 0),
        leads: Number(row.leads ?? 0),
        contratos: Number(row.contratos ?? 0),
        cac: Number(row.cac ?? 0),
        cpa: Number(row.cpa ?? 0),
        txConversao: Number(row.txConversao ?? 0),
    }));
}
