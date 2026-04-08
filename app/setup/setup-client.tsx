"use client";

import { useActionState } from "react";
import { criarEmpresaInicial } from "@/app/actions/setup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SetupClient() {
    const [state, formAction, isPending] = useActionState(criarEmpresaInicial, null);

    return (
        <div className="w-full max-w-md bg-[#0a0a0a] border border-neutral-800 rounded-xl p-8 shadow-2xl">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo(a)!</h1>
                <p className="text-neutral-400 text-sm">
                    Para começar a usar o Laquila B.I, precisamos configurar sua primeira empresa no sistema.
                </p>
            </div>

            <form action={formAction} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400 uppercase">Nome da Empresa *</label>
                    <Input name="nome" placeholder="Ex: Minha Agência" required className="bg-neutral-900 border-neutral-800 focus:border-amber-500" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400 uppercase">CNPJ</label>
                    <Input name="cnpj" placeholder="00.000.000/0000-00" className="bg-neutral-900 border-neutral-800 focus:border-amber-500" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400 uppercase">Segmento</label>
                    <Input name="segmento" placeholder="Ex: Tecnologia, Varejo..." className="bg-neutral-900 border-neutral-800 focus:border-amber-500" />
                </div>

                {state?.error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                        <p className="text-red-400 text-sm">{state.error}</p>
                    </div>
                )}

                <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-11" disabled={isPending}>
                    {isPending ? "Criando ambiente..." : "Concluir Configuração"}
                </Button>
            </form>
        </div>
    );
}
