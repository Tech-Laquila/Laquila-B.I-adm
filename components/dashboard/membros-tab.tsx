"use client";

import { useActionState, useEffect, useState } from "react";
import { convidarMembro, atualizarPerfilEMetas, removerMembro } from "@/app/actions/empresa";
import type { MembroEmpresa } from "@/lib/supabase/queries/membros";
import type { MetaEmpresa } from "@/lib/supabase/queries/metas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
    membros: MembroEmpresa[];
    empresaId: string;
    metas?: MetaEmpresa[];
}

function MembroRow({ membro, empresaId, meta }: { membro: MembroEmpresa; empresaId: string; meta?: MetaEmpresa }) {
    const [isEditing, setIsEditing] = useState(false);
    const [stateAtualizar, formActionAtualizar, isPendingAtualizar] = useActionState(atualizarPerfilEMetas, null);
    const [stateRemover, formActionRemover, isPendingRemover] = useActionState(removerMembro, null);
    useEffect(() => {
        if (stateAtualizar?.success) setIsEditing(false);
    }, [stateAtualizar]);

    if (isEditing) {
        return (
            <tr className="border-b border-[#1f1f1f] bg-neutral-900/30">
                <td colSpan={4} className="p-4 space-y-4">

                    {/* ── Formulário: papel + metas ── */}
                    <form action={formActionAtualizar} className="space-y-4">
                        <input type="hidden" name="empresa_id" value={empresaId} />
                        <input type="hidden" name="rel_id" value={membro.id} />
                        <input type="hidden" name="usuario_id" value={membro.usuario_id} />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="font-medium text-white">
                                {membro.nome} <span className="text-gray-400 font-normal text-xs">({membro.email})</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline" type="button" onClick={() => setIsEditing(false)} className="border-neutral-700 text-white hover:bg-neutral-800">
                                    Cancelar
                                </Button>
                                <Button size="sm" className="bg-[#00e5a0] text-black hover:bg-[#00c08b]" type="submit" disabled={isPendingAtualizar}>
                                    {isPendingAtualizar ? "Salvando..." : "Salvar Alterações"}
                                </Button>
                            </div>
                        </div>

                        {stateAtualizar?.error && <p className="text-red-400 text-xs">{stateAtualizar.error}</p>}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Papel</label>
                                <select name="papel" defaultValue={membro.papel} className="w-full bg-neutral-950 border border-neutral-800 rounded-md text-sm px-3 py-2 text-white h-9">
                                    <option value="vendedor">Vendedor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Meta Contratos / Dia</label>
                                <Input type="number" name="meta_dia" defaultValue={meta?.contratos_dia || 0} className="bg-neutral-950 border-neutral-800 h-9" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Meta Contratos / Sem.</label>
                                <Input type="number" name="meta_semana" defaultValue={meta?.contratos_semana || 0} className="bg-neutral-950 border-neutral-800 h-9" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Meta Contratos / Mês</label>
                                <Input type="number" name="meta_mes" defaultValue={meta?.contratos_mes || 0} className="bg-neutral-950 border-neutral-800 h-9" />
                            </div>
                        </div>
                    </form>

                    {/* ── Formulário: excluir membro (separado para evitar conflito de formAction) ── */}
                    <form action={formActionRemover} className="border-t border-neutral-800 pt-4">
                        <input type="hidden" name="rel_id" value={membro.id} />
                        {stateRemover?.error && <p className="text-red-400 text-xs mb-2">{stateRemover.error}</p>}
                        <Button
                            size="sm"
                            variant="destructive"
                            type="submit"
                            disabled={isPendingRemover}
                            onClick={(e) => {
                                if (!confirm(`Tem certeza que deseja remover ${membro.nome} da empresa?`)) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            {isPendingRemover ? "Excluindo..." : "Excluir Membro"}
                        </Button>
                    </form>

                </td>
            </tr>
        );
    }

    return (
        <tr className="border-b border-[#1f1f1f] hover:bg-[#141414] transition-colors">
            <td className="p-3">{membro.nome}</td>
            <td className="p-3 text-gray-400">{membro.email}</td>
            <td className="p-3 capitalize">
                {membro.papel === "admin" ? <span className="text-[#00e5a0] font-medium">Admin</span> : membro.papel}
            </td>
            <td className="p-3 text-right">
                <Button size="sm" variant="outline" className="border-neutral-700 text-white bg-transparent hover:bg-neutral-800 h-8 text-xs" onClick={() => setIsEditing(true)}>
                    Editar Perfil
                </Button>
            </td>
        </tr>
    );
}

export default function MembrosTab({ membros, empresaId, metas }: Props) {
    const [conviteState, conviteAction, isPending] = useActionState(convidarMembro, null);

    return (
        <div className="space-y-6">
            {/* Lista de Membros */}
            <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl overflow-hidden">
                <table className="w-full text-sm text-white">
                    <thead className="border-b border-[#1f1f1f]">
                        <tr className="text-[#00e5a0] text-[10px] uppercase tracking-widest">
                            <th className="p-3 text-left">Nome</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Papel</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {membros.map((m) => {
                            const userMeta = metas?.find((meta) => meta.vendedor === m.usuario_id);
                            return (
                                <MembroRow key={m.id} membro={m} empresaId={empresaId} meta={userMeta} />
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Formulário de Convite */}
            <form action={conviteAction} className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-6 space-y-4">
                <h3 className="text-[#00e5a0] text-[10px] font-semibold uppercase tracking-widest">
                    Convidar Novo Membro
                </h3>
                <input type="hidden" name="empresa_id" value={empresaId} />
                <div className="flex flex-col sm:flex-row gap-4">
                    <Input name="email" type="email" placeholder="Email do usuário cadastrado" required className="flex-[2] bg-neutral-900 border-neutral-800" />
                    <select name="papel" className="flex-1 bg-neutral-900 border border-neutral-800 rounded-md text-sm px-3 text-white">
                        <option value="vendedor">Vendedor</option>
                        <option value="admin">Admin</option>
                    </select>
                    <Button type="submit" disabled={isPending} className="bg-[#00e5a0] hover:bg-[#00c08b] text-black font-semibold flex-1 sm:flex-none">
                        {isPending ? "Adicionando..." : "Convidar"}
                    </Button>
                </div>
                {conviteState?.error && <p className="text-red-400 text-sm">{conviteState.error}</p>}
                {conviteState?.success && <p className="text-green-400 text-sm">Membro adicionado com sucesso!</p>}
            </form>
        </div>
    );
}
