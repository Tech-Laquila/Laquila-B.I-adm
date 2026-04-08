"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface Props {
    mesReferencia: string;
}

export function MonthFilterBar({ mesReferencia }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const applyFilter = useCallback(
        (novoMes: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("mes", novoMes);
            router.push(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams]
    );

    return (
        <form className="flex items-center gap-2 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg px-3 py-2 text-sm text-neutral-300">
            <span className="text-xs text-neutral-500 font-medium">Período:</span>
            <input
                type="month"
                name="mes"
                defaultValue={mesReferencia}
                className="bg-transparent text-neutral-300 text-xs outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-opacity"
                onChange={(e) => applyFilter(e.target.value)}
            />
        </form>
    );
}
