"use server";

import { getCriativosData as _getCriativosData } from "@/lib/supabase/queries/criativos";

export async function getCriativosDataAction(
    dataInicio: string,
    dataFim: string,
    teses?: string[],
    criativoSelecionado?: string,
    conjuntoSelecionado?: string
) {
    return _getCriativosData(dataInicio, dataFim, teses, criativoSelecionado, conjuntoSelecionado);
}
