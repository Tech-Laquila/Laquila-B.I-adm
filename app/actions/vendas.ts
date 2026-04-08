"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany, getUserRole } from "@/lib/supabase/queries/empresas";

type ActionState = { error?: string; success?: boolean } | null;

// ── CREATE ──────────────────────────────────────────────────────────────────
export async function criarVenda(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado." };

    const empresa = await getCurrentCompany();
    if (!empresa) return { error: "Empresa não encontrada." };

    const cliente = formData.get("cliente") as string;
    const telefone = formData.get("telefone") as string;
    const dataFechamento = formData.get("data_fechamento") as string;

    if (!cliente || !dataFechamento) {
        return { error: "Cliente e data de fechamento são obrigatórios." };
    }

    const { error } = await supabase.from("vendas").insert({
        vendedor_id: user.id,
        empresa_id: empresa.id,
        cliente,
        telefone: telefone || null,
        data_fechamento: dataFechamento,
    });

    if (error) return { error: "Erro ao registrar venda." };

    revalidatePath("/vendas");
    return { success: true };
}

// ── UPDATE ──────────────────────────────────────────────────────────────────
export async function atualizarVenda(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado." };

    const empresa = await getCurrentCompany();
    if (!empresa) return { error: "Empresa não encontrada." };

    const id = formData.get("id") as string;
    const cliente = formData.get("cliente") as string;
    const telefone = formData.get("telefone") as string;
    const dataFechamento = formData.get("data_fechamento") as string;

    const papel = await getUserRole(empresa.id);

    let query = supabase
        .from("vendas")
        .update({ cliente, telefone: telefone || null, data_fechamento: dataFechamento })
        .eq("id", id)
        .eq("empresa_id", empresa.id);

    if (papel !== "admin") {
        query = query.eq("vendedor_id", user.id);
    }

    const { error } = await query;
    if (error) return { error: "Erro ao atualizar venda." };

    revalidatePath("/vendas");
    return { success: true };
}

// ── DELETE ──────────────────────────────────────────────────────────────────
export async function deletarVenda(id: string): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado." };

    const empresa = await getCurrentCompany();
    if (!empresa) return { error: "Empresa não encontrada." };

    const papel = await getUserRole(empresa.id);

    let query = supabase.from("vendas").delete().eq("id", id).eq("empresa_id", empresa.id);

    if (papel !== "admin") {
        query = query.eq("vendedor_id", user.id);
    }

    const { error } = await query;
    if (error) return { error: "Erro ao excluir venda." };

    revalidatePath("/vendas");
    return { success: true };
}
