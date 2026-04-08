"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/queries/empresas";

type ActionState = { error?: string; success?: boolean } | null;

export async function atualizarMetas(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado." };

    const empresaId = formData.get("empresa_id") as string;
    const vendedorId = formData.get("vendedor_id") as string;
    const papel = await getUserRole(empresaId);

    if (papel !== "admin") return { error: "Sem permissão." };

    const contratos_dia = Number(formData.get("contratos_dia")) || 0;
    const contratos_semana = Number(formData.get("contratos_semana")) || 0;
    const contratos_mes = Number(formData.get("contratos_mes")) || 0;

    // Se todos os campos estiverem vazios/zero, deletar a meta desse vendedor
    if (contratos_dia === 0 && contratos_semana === 0 && contratos_mes === 0) {
        const { error } = await supabase
            .from("metas")
            .delete()
            .match({ empresa_id: empresaId, vendedor: vendedorId });

        if (error) return { error: "Erro ao remover meta." };
    } else {
        // Obter meta existente
        const { data: existing } = await supabase
            .from("metas")
            .select("id")
            .match({ empresa_id: empresaId, vendedor: vendedorId })
            .maybeSingle();

        if (existing) {
            const { error } = await supabase
                .from("metas")
                .update({ contratos_dia, contratos_semana, contratos_mes, ativa: true, atualizado_em: new Date().toISOString() })
                .eq("id", existing.id);
            if (error) return { error: "Erro ao atualizar meta." };
        } else {
            const { error } = await supabase
                .from("metas")
                .insert({
                    empresa_id: empresaId,
                    vendedor: vendedorId,
                    contratos_dia,
                    contratos_semana,
                    contratos_mes,
                    ativa: true
                });
            if (error) return { error: "Erro ao inserir meta." };
        }
    }

    revalidatePath("/configuracoes");
    return { success: true };
}
