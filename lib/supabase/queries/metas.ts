import { createClient } from "@/lib/supabase/server";

export interface MetaEmpresa {
    id: string;
    vendedor: string;
    contratos_dia: number;
    contratos_semana: number;
    contratos_mes: number;
    ativa: boolean;
}

export async function getMetasEmpresa(empresaId: string): Promise<MetaEmpresa[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("metas")
        .select("id, vendedor, contratos_dia, contratos_semana, contratos_mes, ativa")
        .eq("empresa_id", empresaId)
        .not("vendedor", "is", null);

    if (error) {
        console.error("Erro ao buscar metas:", error.message);
        return [];
    }

    return data as MetaEmpresa[];
}
