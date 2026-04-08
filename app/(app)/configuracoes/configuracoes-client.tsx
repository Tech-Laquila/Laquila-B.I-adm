// app/(app)/configuracoes/configuracoes-client.tsx
"use client";

import { useState } from "react";
import type { Empresa } from "@/types/database";
import type { MembroEmpresa } from "@/lib/supabase/queries/membros";
import MembrosTab from "@/components/dashboard/membros-tab";
import FunilMapper from "@/components/dashboard/funil-mapper";
import VisualTab from "@/components/dashboard/visual-tab";
import EmpresaTab from "@/components/dashboard/empresa-tab";
import type { MetaEmpresa } from "@/lib/supabase/queries/metas";

interface Props {
    empresa: Empresa;
    membros: MembroEmpresa[];
    metaAtual: MetaEmpresa[];
}

export default function ConfiguracoesClient({ empresa, membros, metaAtual }: Props) {
    const [tab, setTab] = useState<"empresa" | "membros" | "funil" | "visual">("empresa");

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-[#1f1f1f] pb-2 overflow-x-auto">
                {(["empresa", "membros", "funil", "visual"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`text-sm font-medium capitalize pb-2 border-b-2 transition-colors whitespace-nowrap ${tab === t
                            ? "text-[#00e5a0] border-[#00e5a0]"
                            : "text-gray-400 border-transparent hover:text-white"
                            }`}
                    >
                        {t === "empresa" ? "Geral / Integração" : t === "membros" ? "Membros e Metas" : t === "funil" ? "Funil Tintim" : "Personalização Visual"}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {tab === "empresa" && <EmpresaTab empresa={empresa} />}
            {tab === "membros" && <MembrosTab membros={membros} empresaId={empresa.id} metas={metaAtual} />}
            {tab === "funil" && (
                <FunilMapper
                    config={empresa.funil_config ?? {
                        fez_contato: "Fez Contato",
                        dados_solicitados: "Lista",
                        link_enviado: "Link Enviado",
                        contrato_fechado: "Comprou",
                    }}
                    empresaId={empresa.id}
                />
            )}
            {tab === "visual" && <VisualTab empresa={empresa} />}
        </div>
    );
}
