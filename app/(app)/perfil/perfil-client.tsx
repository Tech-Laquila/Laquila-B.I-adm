"use client";

import { useActionState } from "react";
import { atualizarPerfil } from "@/app/actions/perfil";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
    id: string;
    nome: string;
    email: string;
    avatar_url?: string | null;
}

interface Props {
    usuario: UserProfile;
}

export default function PerfilClient({ usuario }: Props) {
    const [state, formAction, isPending] = useActionState(atualizarPerfil, null);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-6">
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#1f1f1f]">
                    <Avatar className="h-20 w-20 border-2 border-neutral-800">
                        <AvatarImage src={usuario.avatar_url || ""} alt={usuario.nome} />
                        <AvatarFallback className="bg-neutral-900 text-lg uppercase">
                            {usuario.nome.substring(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-xl font-bold text-white">{usuario.nome}</h2>
                        <p className="text-gray-400">{usuario.email}</p>
                    </div>
                </div>

                <form action={formAction} className="space-y-4">
                    <h3 className="text-[#00e5a0] text-[10px] font-semibold uppercase tracking-widest mb-4">
                        Informações Básicas
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs text-gray-400">Nome Completo</label>
                        <Input name="nome" defaultValue={usuario.nome} required className="bg-neutral-900 border-neutral-800" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-gray-400">Email (Não editável)</label>
                        <Input type="email" value={usuario.email} disabled className="bg-neutral-900 border-neutral-800 opacity-60 text-gray-400" />
                    </div>
                    {/* Placeholder para upload de Avatar futuro, caso deseje adicionar Storage para isso, pode ser incluído no campo avatar_url */}
                    <input type="hidden" name="avatar_url" value={usuario.avatar_url || ""} />

                    <div className="pt-4">
                        {state?.error && <p className="text-red-400 text-sm mb-2">{state.error}</p>}
                        {state?.success && <p className="text-green-400 text-sm mb-2">Perfil atualizado com sucesso!</p>}
                        <Button type="submit" disabled={isPending} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                            {isPending ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
