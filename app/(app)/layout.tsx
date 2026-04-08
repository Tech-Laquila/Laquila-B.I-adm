import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { getCurrentCompany } from "@/lib/supabase/queries/empresas";

function isSafeImageUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:";
    } catch {
        return false;
    }
}

export default async function AppLayout({ children }: { children: ReactNode }) {
    const empresa = await getCurrentCompany();

    if (!empresa) {
        redirect("/setup");
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden">
            <div
                className="fixed inset-0 -z-10 pointer-events-none"
                style={isSafeImageUrl(empresa?.background_url)
                    ? { backgroundImage: `url(${empresa!.background_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : undefined
                }
            >
                {!empresa?.background_url && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/10 rounded-full blur-[100px]" />
                )}
            </div>

            <Header />
            <main className="flex-1 p-6 relative z-10 w-full max-w-full mx-auto">
                {children}
            </main>
        </div>
    );
}
