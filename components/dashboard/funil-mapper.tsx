"use client";

import { useActionState } from "react";
import { atualizarFunilConfig } from "@/app/actions/empresa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
    config: {
        fez_contato: string;
        dados_solicitados: string;
        link_enviado: string;
        contrato_fechado: string;
    };
    empresaId: string;
}

const ETAPAS = [
    { key: "fez_contato", label: "Fez Contato" },
    { key: "dados_solicitados", label: "Dados Solicitados" },
    { key: "link_enviado", label: "Link Enviado" },
    { key: "contrato_fechado", label: "Contrato Fechado" },
] as const;

export default function FunilMapper({ config, empresaId }: Props) {
    const [state, formAction, isPending] = useActionState(atualizarFunilConfig, null);

    return (
        <form action={formAction}
            className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-6 space-y-4">
            <h3 className="text-[#00e5a0] text-[10px] font-semibold uppercase tracking-widest">
                Mapeamento do Funil Tintim
            </h3>
            <p className="text-gray-400 text-sm">
                Configure os nomes das etapas no Tintim que correspondem a cada fase do funil.
            </p>
            <input type="hidden" name="empresa_id" value={empresaId} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ETAPAS.map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                        <label className="text-xs text-gray-400">{label}</label>
                        <Input name={key} defaultValue={config[key]} required />
                    </div>
                ))}
            </div>
            {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
            {state?.success && <p className="text-green-400 text-sm">Configuração salva!</p>}
            <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar Configuração"}
            </Button>
        </form>
    );
}
