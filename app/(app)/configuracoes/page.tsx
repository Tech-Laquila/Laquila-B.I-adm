// app/(app)/configuracoes/page.tsx
import { redirect } from "next/navigation";
import { getCurrentCompany, getUserRole } from "@/lib/supabase/queries/empresas";
import { getMembrosDaEmpresa } from "@/lib/supabase/queries/membros";
import { getMetasEmpresa } from "@/lib/supabase/queries/metas";
import ConfiguracoesClient from "./configuracoes-client";

export default async function ConfiguracoesPage() {
    const empresa = await getCurrentCompany();
    if (!empresa) redirect("/login");

    const papel = await getUserRole(empresa.id);
    if (papel !== "admin") redirect("/dashboard");

    const membros = await getMembrosDaEmpresa(empresa.id);
    const metaAtual = await getMetasEmpresa(empresa.id);

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold text-white mb-6">Configurações</h1>
            <ConfiguracoesClient empresa={empresa} membros={membros} metaAtual={metaAtual} />
        </div>
    );
}
