// lib/supabase/queries/membros.ts
import { createClient } from "@/lib/supabase/server";

export interface MembroEmpresa {
    id: string;       // usuario_empresa.id
    usuario_id: string;
    nome: string;
    email: string;
    papel: "admin" | "vendedor";
}

export async function getMembrosDaEmpresa(empresaId: string): Promise<MembroEmpresa[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("usuario_empresa")
        .select("id, usuario_id, papel, usuarios(nome, email)")
        .eq("empresa_id", empresaId);

    if (error || !data) return [];

    return data.map((r) => ({
        id: r.id,
        usuario_id: r.usuario_id,
        // @ts-ignore — Supabase join typing
        nome: r.usuarios?.nome ?? "—",
        // @ts-ignore
        email: r.usuarios?.email ?? "—",
        papel: r.papel?.toLowerCase() as "admin" | "vendedor",
    }));
}
