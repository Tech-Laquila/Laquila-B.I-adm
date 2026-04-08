"use client";

import { useQuery } from "@tanstack/react-query";
import { getVendedoresDataAction } from "@/app/actions/vendedores";

export function useVendedoresData(inicio: string, fim: string, teses?: string[]) {
    return useQuery({
        queryKey: ["vendedores", inicio, fim, teses],
        queryFn: () => getVendedoresDataAction(inicio, fim, teses),
    });
}
