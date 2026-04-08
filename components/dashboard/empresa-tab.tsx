"use client";

import { useActionState, useEffect, useState } from "react";
import { gerarWebhookToken, atualizarEmpresa } from "@/app/actions/empresa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Empresa } from "@/types/database";
import { Copy, Check } from "lucide-react";

interface Props {
    empresa: Empresa;
}

export default function EmpresaTab({ empresa }: Props) {
    const [stateToken, formActionToken, isPendingToken] = useActionState(gerarWebhookToken, null);
    const [stateDados, formActionDados, isPendingDados] = useActionState(atualizarEmpresa, null);
    const [origin, setOrigin] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    const webhookUrl = empresa.webhook_token ? `${origin}/api/webhook/${empresa.webhook_token}` : null;

    const copyToClipboard = () => {
        if (!webhookUrl) return;
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-6 space-y-6">
            <form action={formActionDados} className="space-y-4">
                <div>
                    <h3 className="text-[#00e5a0] text-[10px] font-semibold uppercase tracking-widest mb-1">
                        Dados da Empresa
                    </h3>
                    <p className="text-gray-400 text-sm">Gerencie informações gerais e dados de integração da empresa.</p>
                </div>

                <input type="hidden" name="empresa_id" value={empresa.id} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 block">Nome da Empresa</label>
                        <Input name="nome" defaultValue={empresa.nome} required className="bg-neutral-900 border-neutral-800" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 block">CNPJ</label>
                        <Input name="cnpj" defaultValue={empresa.cnpj || ""} placeholder="00.000.000/0000-00" className="bg-neutral-900 border-neutral-800" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 block">Segmento</label>
                        <Input name="segmento" defaultValue={empresa.segmento || ""} placeholder="Ex: Tecnologia" className="bg-neutral-900 border-neutral-800" />
                    </div>
                </div>

                <div className="pt-2">
                    {stateDados?.error && <p className="text-red-400 text-sm mb-2">{stateDados.error}</p>}
                    {stateDados?.success && <p className="text-green-400 text-sm mb-2">Dados atualizados com sucesso!</p>}
                    <Button type="submit" disabled={isPendingDados} className="bg-[#00e5a0] hover:bg-[#00c08b] text-black font-semibold border-none">
                        {isPendingDados ? "Salvando..." : "Salvar Dados"}
                    </Button>
                </div>
            </form>

            <div className="pt-4 border-t border-[#1f1f1f]">
                <h3 className="text-[#00e5a0] text-[10px] font-semibold uppercase tracking-widest mb-3">
                    Integração Tintim CRM (Webhook)
                </h3>
                {webhookUrl ? (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-400">Copie a URL abaixo e configure no painel do Tintim CRM.</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 p-3 bg-neutral-900 border border-neutral-800 rounded-md text-sm text-white font-mono overflow-x-auto">
                                {webhookUrl}
                            </div>
                            <Button variant="outline" size="icon" onClick={copyToClipboard}>
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form action={formActionToken} className="space-y-3">
                        <input type="hidden" name="empresa_id" value={empresa.id} />
                        <p className="text-sm text-gray-400">Você ainda não gerou um token de webhook para recebimento de leads.</p>
                        {stateToken?.error && <p className="text-red-400 text-sm">{stateToken.error}</p>}
                        <Button type="submit" disabled={isPendingToken}>
                            {isPendingToken ? "Gerando..." : "Gerar Webhook URL"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
