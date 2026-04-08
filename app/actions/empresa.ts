"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole, getCurrentCompany } from "@/lib/supabase/queries/empresas";
import crypto from "crypto";

type ActionState = { error?: string; success?: boolean } | null;

// ── Atualizar membro e metas (Inline na Aba Membros) ─────────────────────────
export async function atualizarPerfilEMetas(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado." };

    const empresa = await getCurrentCompany();
    if (!empresa) return { error: "Empresa não encontrada." };

    const relId = formData.get("rel_id") as string;
    const novoPapel = ((formData.get("papel") as string) || "vendedor").toLowerCase();
    const vendedorId = formData.get("usuario_id") as string;

    const metaDia = parseInt(formData.get("meta_dia") as string) || 0;
    const metaSemana = parseInt(formData.get("meta_semana") as string) || 0;
    const metaMes = parseInt(formData.get("meta_mes") as string) || 0;

    const papel = await getUserRole(empresa.id);
    if (papel !== "admin") return { error: "Sem permissão." };

    const adminClient = createAdminClient();

    // Usar adminClient para contornar RLS — admin alterando registro de outro usuário
    const { error: errorPapel } = await adminClient
        .from("usuario_empresa")
        .update({ papel: novoPapel })
        .eq("id", relId)
        .eq("empresa_id", empresa.id);

    if (errorPapel) {
        console.error("Erro ao atualizar papel:", errorPapel);
        return { error: "Erro ao atualizar papel do membro." };
    }

    if (metaDia === 0 && metaSemana === 0 && metaMes === 0) {
        await adminClient
            .from("metas")
            .delete()
            .match({ empresa_id: empresa.id, vendedor: vendedorId });
    } else {
        const { data: existing } = await adminClient
            .from("metas")
            .select("id")
            .match({ empresa_id: empresa.id, vendedor: vendedorId })
            .maybeSingle();

        if (existing) {
            const { error: errMeta } = await adminClient
                .from("metas")
                .update({ contratos_dia: metaDia, contratos_semana: metaSemana, contratos_mes: metaMes, ativa: true, atualizado_em: new Date().toISOString() })
                .eq("id", existing.id);
            if (errMeta) console.error("Erro ao atualizar meta:", errMeta);
        } else {
            const { error: errMeta } = await adminClient
                .from("metas")
                .insert({
                    empresa_id: empresa.id,
                    vendedor: vendedorId,
                    contratos_dia: metaDia,
                    contratos_semana: metaSemana,
                    contratos_mes: metaMes,
                    ativa: true,
                });
            if (errMeta) console.error("Erro ao inserir meta:", errMeta);
        }
    }

    revalidatePath("/configuracoes");
    return { success: true };
}

// ── Remover membro ───────────────────────────────────────────────────────────
export async function removerMembro(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado." };

    const empresa = await getCurrentCompany();
    if (!empresa) return { error: "Empresa não encontrada." };

    const relId = formData.get("rel_id") as string;

    const papelAdmin = await getUserRole(empresa.id);
    if (papelAdmin !== "admin") return { error: "Sem permissão." };

    const adminClient = createAdminClient();

    // Tenta pegar o usuario_id para remover as metas vinculadas a este membro na empresa
    const { data: rel } = await adminClient
        .from("usuario_empresa")
        .select("usuario_id")
        .eq("id", relId)
        .single();

    if (rel?.usuario_id) {
        await adminClient
            .from("metas")
            .delete()
            .match({ empresa_id: empresa.id, vendedor: rel.usuario_id });
    }

    const { error } = await adminClient
        .from("usuario_empresa")
        .delete()
        .eq("id", relId)
        .eq("empresa_id", empresa.id);

    if (error) {
        console.error("Erro ao remover membro:", error);
        return { error: "Erro ao remover membro." };
    }

    revalidatePath("/configuracoes");
    return { success: true };
}

// ── Convidar membro (email) ─────────────────────────────────────────────────
export async function convidarMembro(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado." };

    const empresa = await getCurrentCompany();
    if (!empresa) return { error: "Empresa não encontrada." };

    const email = formData.get("email") as string;
    const novoPapel = ((formData.get("papel") as string) || "vendedor").toLowerCase();

    if (!email) return { error: "E-mail é obrigatório." };

    const papelAtual = await getUserRole(empresa.id);
    if (papelAtual !== "admin") return { error: "Sem permissão." };

    const adminClient = createAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Tentar enviar convite via Supabase Auth
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
        data: {
            empresa_id: empresa.id,
            papel: novoPapel,
        },
        redirectTo: `${appUrl}/auth/callback`,
    });

    if (!inviteError) {
        if (inviteData?.user) {
            const userId = inviteData.user.id;
            
            // 1. Criar registro na tabela usuarios
            const nomeDefault = email.split("@")[0] ?? "Usuário";
            await adminClient.from("usuarios").upsert({
                id: userId,
                email: email,
                nome: nomeDefault,
                empresa_atual_id: empresa.id,
            }, { onConflict: "id" });
            
            // 2. Criar registro na tabela usuario_empresa
            await adminClient.from("usuario_empresa").insert({
                usuario_id: userId,
                empresa_id: empresa.id,
                papel: novoPapel,
            });

            // 3. Criar registro na tabela metas se for vendedor
            if (novoPapel === "vendedor") {
                await adminClient.from("metas").insert({
                    empresa_id: empresa.id,
                    vendedor: userId,
                    contratos_dia: 0,
                    contratos_semana: 0,
                    contratos_mes: 0,
                    ativa: true,
                });
            }
        }

        revalidatePath("/configuracoes");
        return { success: true };
    }

    // Usuário já existe no Supabase Auth — vincular direto à empresa
    const jaExiste =
        inviteError.message.includes("already been registered") ||
        inviteError.message.includes("already exists") ||
        inviteError.message.includes("User already registered");

    if (!jaExiste) {
        console.error("Erro ao convidar membro:", inviteError.message);
        return { error: "Não foi possível enviar o convite." };
    }

    // Buscar o auth user pelo email
    const { data: listData } = await adminClient.auth.admin.listUsers();
    const existingUser = listData?.users?.find((u) => u.email === email);

    if (!existingUser) {
        return { error: "Erro ao localizar usuário existente." };
    }

    // Verificar se já é membro
    const { data: jaEMembro } = await supabase
        .from("usuario_empresa")
        .select("id")
        .eq("usuario_id", existingUser.id)
        .eq("empresa_id", empresa.id)
        .maybeSingle();

    if (jaEMembro) {
        return { error: "Este usuário já é membro da empresa." };
    }

    // Criar vínculo direto
    const { error: insertError } = await adminClient
        .from("usuario_empresa")
        .insert({
            usuario_id: existingUser.id,
            empresa_id: empresa.id,
            papel: novoPapel,
        });

    if (insertError) {
        if (insertError.code === "23505") return { error: "Este usuário já é membro da empresa." };
        console.error("Erro ao vincular usuário existente:", insertError);
        return { error: "Erro ao adicionar membro." };
    }

    // Criar registro na tabela metas se for vendedor
    if (novoPapel === "vendedor") {
        await adminClient.from("metas").insert({
            empresa_id: empresa.id,
            vendedor: existingUser.id,
            contratos_dia: 0,
            contratos_semana: 0,
            contratos_mes: 0,
            ativa: true,
        });
    }

    revalidatePath("/configuracoes");
    return { success: true };
}

// ── Atualizar Auth do Membro (email / senha) ─────────────────────────────────
export async function atualizarAuthMembro(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return { error: "Não autenticado." };

    const empresa = await getCurrentCompany();
    if (!empresa) return { error: "Empresa não encontrada." };

    const papelAtual = await getUserRole(empresa.id);
    if (papelAtual !== "admin") return { error: "Sem permissão." };

    const authUserId = formData.get("authUserId") as string;
    const novoEmail = (formData.get("novoEmail") as string)?.trim() || null;
    const novaSenha = (formData.get("novaSenha") as string) || null;

    if (!authUserId) return { error: "ID do usuário não informado." };
    if (!novoEmail && !novaSenha) return { error: "Informe pelo menos email ou senha para atualizar." };

    if (novaSenha && novaSenha.length < 6) {
        return { error: "A senha deve ter no mínimo 6 caracteres." };
    }

    const adminClient = createAdminClient();
    const updates: { email?: string; password?: string } = {};
    if (novoEmail) updates.email = novoEmail;
    if (novaSenha) updates.password = novaSenha;

    const { error } = await adminClient.auth.admin.updateUserById(authUserId, updates);

    if (error) {
        console.error("Erro ao atualizar auth do membro:", error.message);
        return { error: `Erro ao atualizar: ${error.message}` };
    }

    if (novoEmail) {
        await adminClient
            .from("usuarios")
            .update({ email: novoEmail })
            .eq("id", authUserId);
    }

    revalidatePath("/configuracoes");
    return { success: true };
}

// ── Atualizar Configuração do Funil ──────────────────────────────────────────
export async function atualizarFunilConfig(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado." };

    const empresa = await getCurrentCompany();
    if (!empresa) return { error: "Empresa não encontrada." };

    const papel = await getUserRole(empresa.id);
    if (papel !== "admin") return { error: "Sem permissão." };

    const funilConfig = {
        fez_contato: formData.get("fez_contato") as string,
        dados_solicitados: formData.get("dados_solicitados") as string,
        link_enviado: formData.get("link_enviado") as string,
        contrato_fechado: formData.get("contrato_fechado") as string,
    };

    const values = Object.values(funilConfig);
    if (new Set(values).size !== values.length) {
        return { error: "Os nomes das etapas devem ser únicos." };
    }

    const { error } = await supabase
        .from("empresas")
        .update({ funil_config: funilConfig })
        .eq("id", empresa.id);

    if (error) return { error: "Erro ao salvar configuração." };

    revalidatePath("/configuracoes");
    return { success: true };
}

// ── Atualizar Visuais da Empresa ─────────────────────────────────────────────
export async function atualizarVisuais(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado." };

    const empresa = await getCurrentCompany();
    if (!empresa) return { error: "Empresa não encontrada." };

    const papel = await getUserRole(empresa.id);
    if (papel !== "admin") return { error: "Sem permissão." };

    const logo_url = formData.get("logo_url") as string | null;
    const personagem_url = formData.get("personagem_url") as string | null;
    const background_url = formData.get("background_url") as string | null;

    const updatePayload: Record<string, string | null> = {};
    if (logo_url) updatePayload.logo_url = logo_url;
    if (personagem_url) updatePayload.personagem_url = personagem_url;
    if (background_url) updatePayload.background_url = background_url;

    if (Object.keys(updatePayload).length === 0) {
        return { error: "Nenhuma alteração logada." };
    }

    const { error } = await supabase
        .from("empresas")
        .update(updatePayload)
        .eq("id", empresa.id);

    if (error) return { error: "Erro ao atualizar visuais." };

    revalidatePath("/configuracoes");
    revalidatePath("/dashboard");
    return { success: true };
}

// ── Gerar Token de Webhook ───────────────────────────────────────────────────
export async function gerarWebhookToken(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado." };

    const empresa = await getCurrentCompany();
    if (!empresa) return { error: "Empresa não encontrada." };

    const papel = await getUserRole(empresa.id);
    if (papel !== "admin") return { error: "Sem permissão." };

    const newToken = crypto.randomUUID();

    const { error } = await supabase
        .from("empresas")
        .update({ webhook_token: newToken })
        .eq("id", empresa.id);

    if (error) return { error: "Erro ao gerar webhook token." };

    revalidatePath("/configuracoes");
    return { success: true };
}

// ── Atualizar Dados da Empresa (Geral) ───────────────────────────────────────
export async function atualizarEmpresa(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado." };

    const empresa = await getCurrentCompany();
    if (!empresa) return { error: "Empresa não encontrada." };

    const papel = await getUserRole(empresa.id);
    if (papel !== "admin") return { error: "Sem permissão." };

    const nome = formData.get("nome") as string;
    const cnpj = formData.get("cnpj") as string;
    const segmento = formData.get("segmento") as string;

    if (!nome) return { error: "Nome da empresa é obrigatório." };

    const { error } = await supabase
        .from("empresas")
        .update({ nome, cnpj: cnpj || null, segmento: segmento || null })
        .eq("id", empresa.id);

    if (error) return { error: "Erro ao atualizar dados da empresa." };

    revalidatePath("/configuracoes");
    revalidatePath("/dashboard");
    return { success: true };
}
