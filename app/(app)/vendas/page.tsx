// app/(app)/vendas/page.tsx
import { getVendas } from "@/lib/supabase/queries/vendas";
import VendasClient from "./vendas-client";
import { BackButton } from "./back-button";

export default async function VendasPage() {
    const vendas = await getVendas();

    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            <BackButton />
            <h1 className="text-2xl font-bold text-white mb-6">
                Lançamento de Vendas
            </h1>
            <VendasClient vendas={vendas} />
        </div>
    );
}
