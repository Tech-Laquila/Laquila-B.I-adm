"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardDataAction, getResumoPeriodosAction, getTesesListAction } from "@/app/actions/dashboard";

export function useDashboardData(inicio: string, fim: string, teses?: string[]) {
    return useQuery({
        queryKey: ["dashboard", inicio, fim, teses],
        queryFn: () => getDashboardDataAction(inicio, fim, teses),
    });
}

export function useResumoPeriodos(teses?: string[]) {
    return useQuery({
        queryKey: ["resumoPeriodos", teses],
        queryFn: () => getResumoPeriodosAction(teses),
    });
}

export function useTesesList(teses?: string[]) {
    return useQuery({
        queryKey: ["tesesList", teses],
        queryFn: () => getTesesListAction(teses),
    });
}
