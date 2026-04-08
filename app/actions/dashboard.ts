"use server";

import { getDashboardData as _getDashboardData, getResumoPeriodos as _getResumoPeriodos, getTesesList as _getTesesList } from "@/lib/supabase/queries/dashboard";

export async function getDashboardDataAction(inicio: string, fim: string, teses?: string[]) {
    return _getDashboardData(inicio, fim, teses);
}

export async function getResumoPeriodosAction(teses?: string[]) {
    return _getResumoPeriodos(teses);
}

export async function getTesesListAction(teses?: string[]) {
    return _getTesesList(teses);
}
