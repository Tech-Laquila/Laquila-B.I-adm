// lib/supabase/queries/empresas.ts
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Empresa } from "@/types/database";

export const getCurrentCompany = cache(async (): Promise<Empresa | null> => {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 1. Tentar pegar a empresa ativa definida no perfil do usuário
    const { data: userData } = await supabase
        .from("usuarios")
        .select("empresa_atual_id")
        .eq("id", user.id)
        .single();

    if (userData?.empresa_atual_id) {
        // Verifica se o usuário ainda tem acesso à essa empresa ativa
        const { data: rels } = await supabase
            .from("usuario_empresa")
            .select("empresa_id, papel, empresas(id, nome, logo_url, personagem_url, background_url, funil_config, segmento, ativo)")
            .eq("usuario_id", user.id)
            .eq("empresa_id", userData.empresa_atual_id)
            .limit(1);

        const rel = rels?.[0];

        if (rel && rel.empresas) {
            return rel.empresas as unknown as Empresa;
        }
    }

    // 2. Fallback: Se não tem empresa ativa configurada (ou perdeu acesso), pega a primeira disponível
    const { data: fallbackRels } = await supabase
        .from("usuario_empresa")
        .select("empresa_id, papel, empresas(id, nome, logo_url, personagem_url, background_url, funil_config, segmento, ativo)")
        .eq("usuario_id", user.id)
        .limit(1);

    const fallbackRel = fallbackRels?.[0];

    if (!fallbackRel || !fallbackRel.empresas) return null;

    // 3. Opcional: já define essa primeira como a ativa para os próximos requests
    // Ignore error here to not block the render if the update fails
    await supabase.from("usuarios").update({ empresa_atual_id: fallbackRel.empresa_id }).eq("id", user.id);

    return fallbackRel.empresas as unknown as Empresa;
});

export const getAllUserCompanies = cache(async (): Promise<Empresa[]> => {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: rels } = await supabase
        .from("usuario_empresa")
        .select("empresa_id, empresas(id, nome)")
        .eq("usuario_id", user.id);

    if (!rels) return [];

    // @ts-ignore
    return rels.map(r => r.empresas).filter(Boolean) as Empresa[];
});

export async function getUserRole(empresaId: string): Promise<"admin" | "vendedor" | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from("usuario_empresa")
        .select("papel")
        .eq("usuario_id", user.id)
        .eq("empresa_id", empresaId)
        .single();

    return (data?.papel?.toLowerCase() as "admin" | "vendedor") ?? null;
}

/** Retorna empresa atual + papel do usuário em uma única query (sem chamadas extras a getUserRole) */
export const getCurrentCompanyWithRole = cache(async (): Promise<{ empresa: Empresa | null; papel: string | null }> => {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { empresa: null, papel: null };

    const { data: userData } = await supabase
        .from("usuarios")
        .select("empresa_atual_id")
        .eq("id", user.id)
        .single();

    if (userData?.empresa_atual_id) {
        const { data: rels } = await supabase
            .from("usuario_empresa")
            .select("papel, empresas(id, nome, logo_url, personagem_url, background_url, funil_config, segmento, ativo)")
            .eq("usuario_id", user.id)
            .eq("empresa_id", userData.empresa_atual_id)
            .limit(1);

        const rel = rels?.[0];
        if (rel?.empresas) {
            return { empresa: rel.empresas as unknown as Empresa, papel: rel.papel ?? null };
        }
    }

    // Fallback: primeira empresa disponível
    const { data: fallbackRels } = await supabase
        .from("usuario_empresa")
        .select("empresa_id, papel, empresas(id, nome, logo_url, personagem_url, background_url, funil_config, segmento, ativo)")
        .eq("usuario_id", user.id)
        .limit(1);

    const fallbackRel = fallbackRels?.[0];
    if (!fallbackRel?.empresas) return { empresa: null, papel: null };

    await supabase.from("usuarios").update({ empresa_atual_id: fallbackRel.empresa_id }).eq("id", user.id);

    return { empresa: fallbackRel.empresas as unknown as Empresa, papel: fallbackRel.papel ?? null };
});
