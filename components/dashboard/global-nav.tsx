"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function GlobalNav({ isVendedor }: { isVendedor: boolean }) {
    const pathname = usePathname();

    if (isVendedor) return null;

    return (
        <nav className="flex items-center gap-1 ml-6 text-sm font-medium">
            <Link
                href="/visao-geral"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                    pathname === "/visao-geral"
                        ? "bg-[#1f1f1f] text-[#00e5a0]"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                }`}
            >
                Visão Geral
            </Link>
        </nav>
    );
}
