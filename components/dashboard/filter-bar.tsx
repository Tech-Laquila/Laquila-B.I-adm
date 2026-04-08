"use client";

// components/dashboard/filter-bar.tsx
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

interface Props {
    tesesDisponiveis: string[];
    tesesSelecionadas: string[];
    dataInicio: string;
    dataFim: string;
}

export function FilterBar({ tesesDisponiveis, tesesSelecionadas, dataInicio, dataFim }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [tesesOpen, setTesesOpen] = useState(false);
    const [teses, setTeses] = useState<string[]>(tesesSelecionadas);
    const ref = useRef<HTMLDivElement>(null);

    // Fecha dropdown ao clicar fora
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setTesesOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const applyFilters = useCallback(
        (newTeses: string[], novaInicio: string, novaFim: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("inicio", novaInicio);
            params.set("fim", novaFim);
            if (newTeses.length > 0) {
                params.set("teses", newTeses.join(","));
            } else {
                params.delete("teses");
            }
            router.push(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams]
    );

    const toggleTese = (t: string) => {
        const next = teses.includes(t) ? teses.filter((x) => x !== t) : [...teses, t];
        setTeses(next);
        applyFilters(next, dataInicio, dataFim);
    };

    const toggleAll = () => {
        const next = teses.length === tesesDisponiveis.length ? [] : [...tesesDisponiveis];
        setTeses(next);
        applyFilters(next, dataInicio, dataFim);
    };

    const todosSelected = teses.length === tesesDisponiveis.length || teses.length === 0;

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Date range — simple inputs */}
            <div className="flex items-center gap-2 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg px-3 py-2 text-sm text-neutral-300">
                <input
                    type="date"
                    defaultValue={dataInicio}
                    className="bg-transparent text-neutral-300 text-xs outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-opacity"
                    onChange={(e) => applyFilters(teses, e.target.value, dataFim)}
                />
                <span className="text-neutral-600">→</span>
                <input
                    type="date"
                    defaultValue={dataFim}
                    className="bg-transparent text-neutral-300 text-xs outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-opacity"
                    onChange={(e) => applyFilters(teses, dataInicio, e.target.value)}
                />
            </div>

            {/* Seletor Tese */}
            {tesesDisponiveis.length > 0 && (
                <div ref={ref} className="relative">
                    <button
                        onClick={() => setTesesOpen((o) => !o)}
                        className="flex items-center gap-2 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg px-3 py-2 text-sm text-neutral-300 hover:border-[#00e5a0]/40 transition-colors"
                    >
                        <span className="text-xs text-neutral-500">Tese:</span>
                        <span className="text-xs font-medium text-white">
                            {todosSelected ? "Todas" : `${teses.length} selecionadas`}
                        </span>
                        <ChevronDown className={`w-3 h-3 text-neutral-500 transition-transform ${tesesOpen ? "rotate-180" : ""}`} />
                    </button>

                    {tesesOpen && (
                        <div className="absolute top-full mt-1 left-0 z-50 bg-[#111] border border-[#1f1f1f] rounded-xl shadow-xl shadow-black/50 min-w-[200px] overflow-hidden">
                            <button
                                onClick={toggleAll}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-[#1f1f1f]"
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${todosSelected ? "bg-[#00e5a0] border-[#00e5a0]" : "border-[#333]"}`}>
                                    {todosSelected && <span className="text-black text-[10px] font-black">✓</span>}
                                </div>
                                <span className="text-xs font-medium text-white">Tese (Todas)</span>
                            </button>
                            {tesesDisponiveis.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => toggleTese(t)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${teses.includes(t) ? "bg-[#00e5a0] border-[#00e5a0]" : "border-[#333]"}`}>
                                        {teses.includes(t) && <span className="text-black text-[10px] font-black">✓</span>}
                                    </div>
                                    <span className="text-xs text-neutral-300">{t}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
