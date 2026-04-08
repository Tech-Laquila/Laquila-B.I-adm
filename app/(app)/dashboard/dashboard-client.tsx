"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ResumoView } from "@/components/dashboard/views/resumo-view";
import { CriativosView } from "@/components/dashboard/views/criativos-view";
import { VendedoresView } from "@/components/dashboard/views/vendedores-view";
import { useTesesList } from "@/hooks/use-dashboard-data";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { MonthFilterBar } from "@/components/dashboard/month-filter-bar";
import { RealtimeStatus } from "@/components/dashboard/realtime-status";
import { todayBR } from "@/lib/utils/date-params";

export function DashboardContent({ isVendedor }: { isVendedor: boolean }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryView = searchParams.get("view");
    
    // Estado local para a view atual (garante transição instantânea sem delay do servidor)
    const [activeView, setActiveView] = useState(() => {
        if (isVendedor) return "vendedores";
        // 1. Prioriza Link Direto: Se o usuário acessou via URL direta (ex: /dashboard?view=criativos)
        if (queryView) return queryView;
        
        // 2. Tenta recuperar a última aba acessada na memória temporária do nav.
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem("dashboard_view");
            if (saved) return saved;
        }
        
        return "resumo";
    });

    // Mantém o SessionStorage e avisa o GlobalNav no Header
    useEffect(() => {
        sessionStorage.setItem("dashboard_view", activeView);
        window.dispatchEvent(new CustomEvent("dashboardStateChanged", { detail: activeView }));
    }, [activeView]);

    const hoje = new Date();
    const dataInicio = searchParams.get("inicio") ?? new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
    const dataFim = searchParams.get("fim") ?? new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10);
    const tesesParam = searchParams.get("teses");
    const tesesFiltro = tesesParam ? tesesParam.split(",").filter(Boolean) : [];
    
    const mesReferencia = searchParams.get("mes") ?? todayBR().slice(0, 7);

    // Precisamos buscar as teses disponíveis para o FilterBar
    const { data: tesesList = [] } = useTesesList(tesesFiltro.length > 0 ? tesesFiltro : undefined);

    const switchView = (newView: string) => {
        setActiveView(newView);
    };

    // Escuta o GlobalNav do cabeçalho
    useEffect(() => {
        const handler = (e: any) => setActiveView(e.detail);
        window.addEventListener("switchDashboardView", handler);
        return () => window.removeEventListener("switchDashboardView", handler);
    }, []);

    // Navegação por teclado (Setas para o lado)
    useEffect(() => {
        if (isVendedor) return;

        const views = ["resumo", "criativos", "vendedores"];
        
        const handleKeyDown = (e: KeyboardEvent) => {
            // Se o usuário estiver digitando em um input, não muda de aba
            if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) return;

            const currentIndex = views.indexOf(activeView);
            
            if (e.key === "ArrowRight") {
                const next = views[currentIndex + 1];
                if (next) switchView(next);
            } else if (e.key === "ArrowLeft") {
                const prev = views[currentIndex - 1];
                if (prev) switchView(prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeView, isVendedor]);

    let pageTitle = "Dashboard Executivo";
    let pageSubtitle = "Visão geral do desempenho de marketing e vendas.";

    if (activeView === "criativos") {
        pageTitle = "Dashboard de Criativos";
        pageSubtitle = "Análise de performance dos anúncios nas campanhas ativas.";
    } else if (activeView === "vendedores") {
        pageTitle = "Desempenho dos Vendedores";
        pageSubtitle = "Acompanhamento mês a mês das metas de contratos e performance da equipe.";
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
                        <p className="text-neutral-500 text-sm mt-0.5">{pageSubtitle}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <RealtimeStatus />
                        {activeView === "vendedores" ? (
                            <Suspense fallback={null}>
                                <MonthFilterBar mesReferencia={mesReferencia} />
                            </Suspense>
                        ) : (
                            <Suspense fallback={null}>
                                <FilterBar
                                    tesesDisponiveis={tesesList}
                                    tesesSelecionadas={tesesFiltro}
                                    dataInicio={dataInicio}
                                    dataFim={dataFim}
                                />
                            </Suspense>
                        )}
                    </div>
                </div>
            </div>

            {/* Conteúdo em Abas da SPA - PRÉ-CARREGADAS NA MEMÓRIA */}
            <div className="relative">
                <div className={`${activeView === "resumo" ? "block animate-in slide-in-from-right-4 fade-in duration-200" : "hidden"}`}>
                    {!isVendedor && <ResumoView />}
                </div>

                <div className={`${activeView === "criativos" ? "block animate-in slide-in-from-right-4 fade-in duration-200" : "hidden"}`}>
                    {!isVendedor && <CriativosView />}
                </div>

                <div className={`${activeView === "vendedores" ? "block animate-in slide-in-from-right-4 fade-in duration-200" : "hidden"}`}>
                    <VendedoresView />
                </div>
            </div>
        </div>
    );
}
