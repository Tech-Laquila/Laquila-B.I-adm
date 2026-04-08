"use client";

import { useActionState, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { criarVenda, atualizarVenda, deletarVenda } from "@/app/actions/vendas";
import type { VendaComVendedor } from "@/lib/supabase/queries/vendas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface Props {
    vendas: VendaComVendedor[];
}

export default function VendasClient({ vendas }: Props) {
    const router = useRouter();
    const [criarState, criarAction, isPendingCriar] = useActionState(criarVenda, null);
    const [editarState, editarAction, isPendingEditar] = useActionState(atualizarVenda, null);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [deletandoId, setDeletandoId] = useState<string | null>(null);
    const [isPendingDelete, startDelete] = useTransition();

    useEffect(() => {
        if (editarState?.success) {
            setEditandoId(null);
        }
    }, [editarState]);

    function handleDelete(id: string) {
        if (!window.confirm("Confirmar exclusão desta venda?")) return;
        setDeletandoId(id);
        startDelete(async () => {
            await deletarVenda(id);
            setDeletandoId(null);
            router.refresh();
        });
    }

    return (
        <div className="space-y-8">
            {/* ── Formulário de Lançamento ─────────────────── */}
            <form action={criarAction}
                className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-6 space-y-4">
                <h2 className="text-[#00e5a0] text-[10px] font-semibold uppercase tracking-widest">
                    Nova Venda
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input name="cliente" placeholder="Nome do cliente" required />
                    <Input name="telefone" placeholder="Telefone" />
                    <Input name="data_fechamento" type="date" required />
                </div>
                {criarState?.error && (
                    <p className="text-red-400 text-sm">{criarState.error}</p>
                )}
                <Button type="submit" disabled={isPendingCriar}>
                    {isPendingCriar ? "Salvando..." : "Registrar Venda"}
                </Button>
            </form>

            {/* ── Tabela de Vendas ──────────────────────────── */}
            <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl overflow-hidden">
                {editarState?.error && (
                    <p className="text-red-400 text-sm px-4 py-2 border-b border-[#1f1f1f]">{editarState.error}</p>
                )}
                <table className="w-full text-sm text-white">
                    <thead className="border-b border-[#1f1f1f]">
                        <tr className="text-[#00e5a0] text-[10px] uppercase tracking-widest">
                            <th className="p-3 text-left">Cliente</th>
                            <th className="p-3 text-left">Telefone</th>
                            <th className="p-3 text-left">Data</th>
                            <th className="p-3 text-left">Vendedor</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendas.map((v) => (
                            <tr key={v.id} className="border-b border-[#1f1f1f]">
                                {editandoId === v.id ? (
                                    <>
                                        <td className="p-2">
                                            <form id={`edit-${v.id}`} action={editarAction}>
                                                <input type="hidden" name="id" value={v.id} />
                                                <Input
                                                    name="cliente"
                                                    defaultValue={v.cliente}
                                                    required
                                                    className="h-8 text-xs bg-neutral-900 border-neutral-700"
                                                />
                                            </form>
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                form={`edit-${v.id}`}
                                                name="telefone"
                                                defaultValue={v.telefone ?? ""}
                                                className="h-8 text-xs bg-neutral-900 border-neutral-700"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                form={`edit-${v.id}`}
                                                name="data_fechamento"
                                                type="date"
                                                defaultValue={v.data_fechamento?.slice(0, 10)}
                                                required
                                                className="h-8 text-xs bg-neutral-900 border-neutral-700"
                                            />
                                        </td>
                                        <td className="p-3">{v.vendedor_nome}</td>
                                        <td className="p-3 text-right space-x-1">
                                            <button
                                                type="submit"
                                                form={`edit-${v.id}`}
                                                disabled={isPendingEditar}
                                                className="inline-flex items-center justify-center p-1.5 rounded hover:bg-neutral-800 transition-colors"
                                                title="Salvar"
                                            >
                                                <Check className="w-4 h-4 text-green-400" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditandoId(null)}
                                                className="inline-flex items-center justify-center p-1.5 rounded hover:bg-neutral-800 transition-colors"
                                                title="Cancelar"
                                            >
                                                <X className="w-4 h-4 text-neutral-400" />
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-3">{v.cliente}</td>
                                        <td className="p-3">{v.telefone ?? "—"}</td>
                                        <td className="p-3">{v.data_fechamento?.slice(0, 10)}</td>
                                        <td className="p-3">{v.vendedor_nome}</td>
                                        <td className="p-3 text-right space-x-1">
                                            <button
                                                type="button"
                                                onClick={() => setEditandoId(v.id)}
                                                className="inline-flex items-center justify-center p-1.5 rounded hover:bg-neutral-800 transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4 text-neutral-400 hover:text-white" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(v.id)}
                                                disabled={isPendingDelete && deletandoId === v.id}
                                                className="inline-flex items-center justify-center p-1.5 rounded hover:bg-neutral-800 transition-colors disabled:opacity-50"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
