import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PerfilClient from "./perfil-client";

export default async function PerfilPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: usuario } = await supabase
        .from("usuarios")
        .select("id, nome, email, avatar_url")
        .eq("id", user.id)
        .single();

    if (!usuario) {
        // Se o usuário logou mas o trigger não criou a linha na tabela usuarios (fallback)
        redirect("/login");
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
                <p className="text-gray-400 text-sm">Gerencie suas informações pessoais e preferências.</p>
            </div>
            <PerfilClient usuario={usuario} />
        </div>
    );
}
