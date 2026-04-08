"use server";

import { getVendedoresData as _getVendedoresData } from "@/lib/supabase/queries/vendedores";

export async function getVendedoresDataAction(dataInicio: string, dataFim: string, teses?: string[]) {
    return _getVendedoresData(dataInicio, dataFim, teses);
}
