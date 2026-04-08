"use client";

import { useTransition } from "react";
import { Check, ChevronsUpDown, Building } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { setActiveCompanyAction } from "@/app/actions/user";
import type { Empresa } from "@/types/database";
import { useState } from "react";

interface CompanySwitcherProps {
    currentCompany: Empresa | null;
    allCompanies: Empresa[];
}

export function CompanySwitcher({ currentCompany, allCompanies }: CompanySwitcherProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Se só tiver 1 ou 0 empresas, mostra como texto simples estático ou botão desabilitado
    if (allCompanies.length <= 1) {
        return (
            <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-md text-white/80 text-sm flex items-center gap-2">
                <Building className="h-4 w-4 text-neutral-500" />
                <span className="truncate max-w-[150px]">{currentCompany?.nome || "Empresa"}</span>
            </div>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={isPending}
                    className="w-[200px] justify-between bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:text-white"
                >
                    <div className="flex items-center gap-2 truncate">
                        <Building className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="truncate">
                            {currentCompany?.nome || "Selecionar empresa..."}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 bg-[#0a0a0a] border-neutral-800 text-white">
                <Command className="bg-transparent">
                    <CommandInput placeholder="Buscar empresa..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                        <CommandGroup>
                            {allCompanies.map((empresa) => (
                                <CommandItem
                                    key={empresa.id}
                                    value={empresa.nome}
                                    onSelect={() => {
                                        setOpen(false);
                                        // Só dispara action se for diferente da atual
                                        if (empresa.id !== currentCompany?.id) {
                                            startTransition(async () => {
                                                await setActiveCompanyAction(empresa.id);
                                            });
                                        }
                                    }}
                                    className="cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800 focus:text-white"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            currentCompany?.id === empresa.id ? "opacity-100 text-amber-500" : "opacity-0"
                                        )}
                                    />
                                    <span className="truncate">{empresa.nome}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
