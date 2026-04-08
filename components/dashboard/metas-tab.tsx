"use client";

import { useActionState } from "react";
import { atualizarMetas } from "@/app/actions/metas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MetaEmpresa } from "@/lib/supabase/queries/metas";

import { MembroEmpresa } from "@/lib/supabase/queries/membros";

interface Props {
    empresaId: string;
    metaAtual: MetaEmpresa[];
    membros: MembroEmpresa[];
}

export default function MetasTab({ empresaId, metaAtual, membros }: Props) {
    const [state, formAction, isPending] = useActionState(atualizarMetas, null);

    return (
        <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-6 space-y-6">
            <div>
                <h3 className="text-[#00e5a0] text-[10px] font-semibold uppercase tracking-widest mb-1">
                    Metas por Vendedor
                </h3>
                <p className="text-gray-400 text-sm">Defina a meta individual de cada membro. Perfis sem meta definida não aparecerão no relatório de Vendedores.</p>
            </div>

            <div className="space-y-6">
                {membros.map(membro => {
                    const metaMembro = metaAtual.find(m => m.vendedor === membro.usuario_id);
                    return (
                        <form key={membro.id} action={formAction} className="border-t border-[#1f1f1f] pt-6 relative">
                            <input type="hidden" name="empresa_id" value={empresaId} />
                            <input type="hidden" name="vendedor_id" value={membro.usuario_id} />

                            <div className="mb-4">
                                <h4 className="text-white font-medium text-sm flex items-center gap-2">
                                    {membro.nome} <span className="text-xs text-neutral-500 font-normal">({membro.email})</span>
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 block">Contratos / Dia</label>
                                    <Input name="contratos_dia" type="number" defaultValue={metaMembro?.contratos_dia ?? ""} placeholder="Ex: 2" className="bg-neutral-900 border-neutral-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 block">Contratos / Sem.</label>
                                    <Input name="contratos_semana" type="number" defaultValue={metaMembro?.contratos_semana ?? ""} placeholder="Ex: 10" className="bg-neutral-900 border-neutral-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 block">Contratos / Mês</label>
                                    <Input name="contratos_mes" type="number" defaultValue={metaMembro?.contratos_mes ?? ""} placeholder="Ex: 40" className="bg-neutral-900 border-neutral-800" />
                                </div>
                                <div>
                                    <Button type="submit" variant="outline" className="w-full border-neutral-700 text-white hover:bg-neutral-800 hover:text-white">
                                        Salvar Meta
                                    </Button>
                                </div>
                            </div>
                        </form>
                    );
                })}
            </div>
            {state?.error && <p className="text-red-400 text-sm mt-4">{state.error}</p>}
            {state?.success && <p className="text-green-400 text-sm mt-4">Metas atualizadas com sucesso!</p>}
        </div>
    );
}
