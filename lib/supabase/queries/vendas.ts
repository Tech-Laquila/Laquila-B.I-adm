// lib/supabase/queries/vendas.ts
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "./empresas";
import { QUERY_MAX_ROWS } from "@/lib/constants";

export interface VendaComVendedor {
    id: string;
    cliente: string;
    telefone: string | null;
    data_fechamento: string;
    vendedor_nome: string;
    vendedor_id: string;
}

export async function getVendas(): Promise<VendaComVendedor[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const empresa = await getCurrentCompany();
    if (!empresa) return [];

    // Buscar papel do usuário
    const { data: rel } = await supabase
        .from("usuario_empresa")
        .select("papel")
        .eq("usuario_id", user.id)
        .eq("empresa_id", empresa.id)
        .single();

    // Query de vendas com join no vendedor
    let query = supabase
        .from("vendas")
        .select("id, cliente, telefone, data_fechamento, vendedor_id, usuarios(nome)")
        .eq("empresa_id", empresa.id)
        .order("data_fechamento", { ascending: false });

    // Se não for admin, filtra só as vendas do vendedor
    if (rel?.papel !== "admin") {
        query = query.eq("vendedor_id", user.id);
    }

    const { data, error } = await query.limit(QUERY_MAX_ROWS);
    if (error || !data) return [];

    return data.map((v) => ({
        id: v.id,
        cliente: v.cliente,
        telefone: v.telefone,
        data_fechamento: v.data_fechamento,
        vendedor_id: v.vendedor_id,
        // @ts-ignore — Supabase join typing
        vendedor_nome: v.usuarios?.nome ?? "Desconhecido",
    }));
}
