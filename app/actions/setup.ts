"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export type SetupActionState = {
    error?: string;
} | null;

export async function criarEmpresaInicial(
    _prev: SetupActionState,
    formData: FormData
): Promise<SetupActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Usuário não autenticado." };
    }

    const nome = formData.get("nome") as string;
    const cnpj = formData.get("cnpj") as string;
    const segmento = formData.get("segmento") as string;

    if (!nome || nome.trim() === "") {
        return { error: "O nome da empresa é obrigatório." };
    }

    // Criar a empresa usando o cliente normal (já habilitamos INSERT RLS para autenticados)
    const { data: novaEmpresa, error: empresaError } = await supabase
        .from("empresas")
        .insert({
            nome,
            cnpj: cnpj || null,
            segmento: segmento || null,
        })
        .select("id")
        .single();

    if (empresaError || !novaEmpresa) {
        console.error("Erro ao criar empresa:", empresaError);
        return { error: "Não foi possível criar a empresa." };
    }

    // Vincular o usuário à nova empresa como admin.
    // Usamos o Admin Client para contornar RLS de `usuario_empresa`, pois o usuário ainda não pertence a ela.
    const adminSupabase = createAdminClient();
    const { error: relError } = await adminSupabase
        .from("usuario_empresa")
        .insert({
            usuario_id: user.id,
            empresa_id: novaEmpresa.id,
            papel: "admin"
        });

    if (relError) {
        console.error("Erro ao vincular usuário à empresa:", relError);
        return { error: "Empresa criada, mas ocorreu um erro no vínculo." };
    }

    redirect("/dashboard");
}
