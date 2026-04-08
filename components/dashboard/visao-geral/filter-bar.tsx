"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface Props {
    dataInicio: string;
    dataFim: string;
}

export function VisaoGeralFilterBar({ dataInicio, dataFim }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const applyFilters = useCallback(
        (novaInicio: string, novaFim: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("inicio", novaInicio);
            params.set("fim", novaFim);
            router.push(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams]
    );

    return (
        <div className="flex items-center gap-2 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg px-3 py-2 text-sm text-neutral-300">
            <input
                type="date"
                defaultValue={dataInicio}
                className="bg-transparent text-neutral-300 text-xs outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-opacity"
                onChange={(e) => applyFilters(e.target.value, dataFim)}
            />
            <span className="text-neutral-600">→</span>
            <input
                type="date"
                defaultValue={dataFim}
                className="bg-transparent text-neutral-300 text-xs outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-opacity"
                onChange={(e) => applyFilters(dataInicio, e.target.value)}
            />
        </div>
    );
}
