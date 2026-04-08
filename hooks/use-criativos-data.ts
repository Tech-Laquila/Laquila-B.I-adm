"use client";

import { useQuery } from "@tanstack/react-query";
import { getCriativosDataAction } from "@/app/actions/criativos";

export function useCriativosData(
    inicio: string,
    fim: string,
    teses?: string[],
    criativoSelecionado?: string,
    conjuntoSelecionado?: string
) {
    return useQuery({
        queryKey: ["criativos", inicio, fim, teses, criativoSelecionado, conjuntoSelecionado],
        queryFn: () => getCriativosDataAction(inicio, fim, teses, criativoSelecionado, conjuntoSelecionado),
    });
}
