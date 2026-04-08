"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = {
    error?: string;
    success?: boolean;
} | null;

export async function atualizarPerfil(
    _prev: ProfileActionState,
    formData: FormData
): Promise<ProfileActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Não autenticado." };

    const nome = formData.get("nome") as string;
    const avatar_url = formData.get("avatar_url") as string | null;

    if (!nome || nome.trim() === "") {
        return { error: "O nome não pode estar vazio." };
    }

    const payload: { nome: string; avatar_url?: string } = { nome };
    if (avatar_url) payload.avatar_url = avatar_url;

    const { error } = await supabase
        .from("usuarios")
        .update(payload)
        .eq("id", user.id);

    if (error) {
        return { error: "Erro ao atualizar o perfil." };
    }

    // Opcional: Atualizar metadata no auth
    await supabase.auth.updateUser({
        data: { name: nome, avatar_url: avatar_url || user.user_metadata.avatar_url }
    });

    revalidatePath("/perfil");
    return { success: true };
}
