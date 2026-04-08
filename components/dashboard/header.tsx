import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { getCurrentCompanyWithRole } from "@/lib/supabase/queries/empresas";
import { createClient } from "@/lib/supabase/server";
import { GlobalNav } from "./global-nav";

export async function Header() {
    const supabase = await createClient();

    const [{ empresa, papel }, { data: { user } }] = await Promise.all([
        getCurrentCompanyWithRole(),
        supabase.auth.getUser(),
    ]);

    const { data: userData } = user
        ? await supabase.from("usuarios").select("nome, avatar_url").eq("id", user.id).single()
        : { data: null };

    const initials = userData?.nome
        ? userData.nome.trim().split(/\s+/).map((n: string) => n[0].toUpperCase()).slice(0, 2).join("")
        : "US";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[#0a0a0a]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a0a]/60">
            <div className="container flex h-16 items-center px-4 max-w-full mx-auto">
                <div className="flex gap-6 items-center flex-1">
                    <Link href="/visao-geral" className="flex items-center gap-2">
                        {empresa?.logo_url ? (
                            <img src={empresa.logo_url} alt={empresa.nome} className="h-8 object-contain" />
                        ) : (
                            <>
                                <Image src="/assets/favicon.ico" alt="Laquila B.I" width={32} height={32} className="object-contain rounded" />
                                <span className="font-bold hidden sm:inline-block text-lg tracking-tight">Laquila B.I ADM</span>
                            </>
                        )}
                    </Link>

                    <GlobalNav isVendedor={papel === "vendedor"} />
                </div>

                <div className="flex items-center justify-end gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="h-8 w-8 border border-neutral-800 cursor-pointer">
                                <AvatarImage src={userData?.avatar_url ?? ""} alt={userData?.nome ?? "User"} />
                                <AvatarFallback className="bg-neutral-900 text-xs text-white hover:bg-neutral-800 transition-colors">{initials}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[#0a0a0a] border-neutral-800 text-white">
                            <DropdownMenuLabel>{userData?.nome ?? "Minha Conta"}</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-neutral-800" />
                            <DropdownMenuItem asChild className="focus:bg-neutral-800 focus:text-white cursor-pointer">
                                <Link href="/perfil" className="flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Perfil</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-neutral-800" />
                            <DropdownMenuItem asChild className="focus:bg-red-500/20 focus:text-red-500 text-red-400 cursor-pointer">
                                <form action={logoutAction} className="w-full">
                                    <button type="submit" className="flex items-center w-full">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sair</span>
                                    </button>
                                </form>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
