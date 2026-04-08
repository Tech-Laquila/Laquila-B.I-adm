import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentCompanyWithRole } from "@/lib/supabase/queries/empresas";
import { getAllCompaniesKpis } from "@/lib/supabase/queries/visao-geral";
import { EmpresasKpisGrid } from "@/components/dashboard/visao-geral/empresas-kpis-grid";

interface Props {
    searchParams: Promise<{ inicio?: string; fim?: string }>;
}

export default async function VisaoGeralPage({ searchParams }: Props) {
    const { papel } = await getCurrentCompanyWithRole();

    if (papel !== "admin") {
        redirect("/dashboard");
    }

    const params = await searchParams;
    const hoje = new Date();
    const dataInicio =
        params.inicio ??
        new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
    const dataFim =
        params.fim ??
        new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10);

    const empresasKpis = await getAllCompaniesKpis(dataInicio, dataFim);

    return (
        <Suspense fallback={null}>
            <EmpresasKpisGrid
                empresas={empresasKpis}
                dataInicio={dataInicio}
                dataFim={dataFim}
            />
        </Suspense>
    );
}
