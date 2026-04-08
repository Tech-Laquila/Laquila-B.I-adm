"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function setActiveCompanyAction(empresaId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Usuário não autenticado");
    }

    const { data: vinculo } = await supabase
        .from("usuario_empresa")
        .select("id")
        .eq("usuario_id", user.id)
        .eq("empresa_id", empresaId)
        .maybeSingle();

    if (!vinculo) {
        throw new Error("Acesso negado.");
    }

    const { error } = await supabase
        .from("usuarios")
        .update({ empresa_atual_id: empresaId })
        .eq("id", user.id);

    if (error) {
        console.error("Erro ao atualizar empresa ativa:", error);
        throw new Error("Falha ao trocar de empresa");
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}
