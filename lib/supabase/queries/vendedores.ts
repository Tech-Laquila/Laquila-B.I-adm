// lib/supabase/queries/vendedores.ts
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/supabase/queries/empresas";
import { startOfBR } from "@/lib/utils/date-params";
import { QUERY_MAX_ROWS } from "@/lib/constants";
import type { VendedorStats, VendedoresDataResult, Venda } from "@/types/database";

type LeadMinimo = {
    data_inicial: string | null;
    vendedor: string | null;
    nome_conta: string | null;
    contrato_fechado: boolean | null;
    fez_contato: boolean | null;
};

export async function getVendedoresData(
    dataInicio: string,
    dataFim: string,
    teses?: string[]
): Promise<VendedoresDataResult> {
    const supabase = await createClient();

    const empresa = await getCurrentCompany();
    const empresaId = empresa?.id ?? null;
    const personagemUrl = empresa?.personagem_url ?? null;

    let qVendas = supabase
        .from("vendas")
        .select(`
            *,
            usuarios:vendedor_id(nome)
        `)
        .gte("data_fechamento", dataInicio + "T00:00:00")
        .lte("data_fechamento", dataFim + "T23:59:59");

    if (empresaId) qVendas = qVendas.eq("empresa_id", empresaId);

    let qLeads = supabase
        .from("leads")
        .select("data_inicial, vendedor, nome_conta, contrato_fechado, fez_contato")
        .gte("data_inicial", dataInicio + "T00:00:00")
        .lte("data_inicial", dataFim + "T23:59:59")
        .not("vendedor", "is", null);
    if (teses && teses.length > 0) qLeads = qLeads.in("nome_conta", teses);

    let qAds = supabase
        .from("facebook_ads")
        .select("data, valor_usado, nome_conta")
        .gte("data", dataInicio)
        .lte("data", dataFim);
    if (teses && teses.length > 0) qAds = qAds.in("nome_conta", teses);

    const [
        { data: vendas, error: errVendas },
        { data: leads },
        { data: ads },
    ] = await Promise.all([
        qVendas.limit(QUERY_MAX_ROWS),
        qLeads.limit(QUERY_MAX_ROWS),
        qAds.limit(QUERY_MAX_ROWS),
    ]);

    if (errVendas) console.log("Erro Vendas:", errVendas);
    type VendaWithUser = Venda & { usuarios: { nome: string } | null };
    const vendasData = (vendas ?? []) as VendaWithUser[];
    const leadsData = (leads ?? []) as LeadMinimo[];

    const iniMes = startOfBR("month");
    const iniSemana = startOfBR("week");
    const iniDia = startOfBR("day");

    let custoTotal = 0;
    let custoTotalSemana = 0;
    let custoTotalDia = 0;

    for (const ad of (ads ?? [])) {
        const val = ad.valor_usado ?? 0;
        const dt = (ad.data ?? "").slice(0, 10);
        custoTotal += val;
        if (dt >= iniSemana) custoTotalSemana += val;
        if (dt >= iniDia) custoTotalDia += val;
    }

    let metaTotalDia = 0;
    let metaTotalSemana = 0;
    let metaTotalMes = 0;

    type MetaWithUser = { vendedor: string; contratos_dia: number; contratos_semana: number; contratos_mes: number; usuarios: { nome: string } | null };
    let metasData: MetaWithUser[] = [];

    const vendedorMap: Record<string, { metaDia: number, metaSemana: number, metaMes: number, vendas: VendaWithUser[]; leads: LeadMinimo[] }> = {};

    if (empresaId) {
        const { data } = await supabase
            .from("metas")
            .select("vendedor, contratos_dia, contratos_semana, contratos_mes, usuarios:vendedor(nome)")
            .eq("empresa_id", empresaId)
            .not("vendedor", "is", null);

        metasData = (data ?? []) as any as MetaWithUser[];

        metaTotalDia = metasData.reduce((s, m) => s + (m.contratos_dia ?? 0), 0);
        metaTotalSemana = metasData.reduce((s, m) => s + (m.contratos_semana ?? 0), 0);
        metaTotalMes = metasData.reduce((s, m) => s + (m.contratos_mes ?? 0), 0);

        for (const m of metasData) {
            const nome = m.usuarios?.nome ?? "Sem nome";
            vendedorMap[nome] = {
                metaDia: m.contratos_dia || 0,
                metaSemana: m.contratos_semana || 0,
                metaMes: m.contratos_mes || 0,
                vendas: [],
                leads: []
            };
        }
    }

    for (const venda of vendasData) {
        const nome = venda.usuarios?.nome ?? "Sem nome";
        if (vendedorMap[nome]) {
            vendedorMap[nome].vendas.push(venda);
        }
    }

    for (const lead of leadsData) {
        const nome = lead.vendedor ?? "Sem nome";
        if (vendedorMap[nome]) {
            vendedorMap[nome].leads.push(lead);
        }
    }

    const statsArray: VendedorStats[] = Object.entries(vendedorMap).map(([nome, dados]) => {
        const vendasM = dados.vendas.filter((v) => (v.data_fechamento ?? "").slice(0, 10) >= iniMes);
        const vendasS = dados.vendas.filter((v) => (v.data_fechamento ?? "").slice(0, 10) >= iniSemana);
        const vendasD = dados.vendas.filter((v) => (v.data_fechamento ?? "").slice(0, 10) >= iniDia);

        const leadsM = dados.leads.filter((l) => (l.data_inicial ?? "").slice(0, 10) >= iniMes);
        const leadsS = dados.leads.filter((l) => (l.data_inicial ?? "").slice(0, 10) >= iniSemana);
        const leadsD = dados.leads.filter((l) => (l.data_inicial ?? "").slice(0, 10) >= iniDia);

        return {
            nome,
            metaDia: dados.metaDia,
            metaSemana: dados.metaSemana,
            metaMes: dados.metaMes,

            contratosTotal: dados.vendas.length,
            contratosMes: vendasM.length,
            contratosSemana: vendasS.length,
            contratosDia: vendasD.length,

            leadsMes: leadsM.length,
            leadsSemana: leadsS.length,
            leadsDia: leadsD.length,
        };
    });

    // Totais globais calculados do dado bruto — independe de vendedores com meta cadastrada
    const totalMes = vendasData.filter((v) => (v.data_fechamento ?? "").slice(0, 10) >= iniMes).length;
    const totalSemana = vendasData.filter((v) => (v.data_fechamento ?? "").slice(0, 10) >= iniSemana).length;
    const totalDia = vendasData.filter((v) => (v.data_fechamento ?? "").slice(0, 10) >= iniDia).length;

    const totalLeadsMes = leadsData.filter((l) => (l.data_inicial ?? "").slice(0, 10) >= iniMes).length;
    const totalLeadsSemana = leadsData.filter((l) => (l.data_inicial ?? "").slice(0, 10) >= iniSemana).length;
    const totalLeadsDia = leadsData.filter((l) => (l.data_inicial ?? "").slice(0, 10) >= iniDia).length;

    const txMesGlobal = totalLeadsMes > 0 ? (totalMes / totalLeadsMes) * 100 : 0;
    const txSemanaGlobal = totalLeadsSemana > 0 ? (totalSemana / totalLeadsSemana) * 100 : 0;
    const txDiaGlobal = totalLeadsDia > 0 ? (totalDia / totalLeadsDia) * 100 : 0;

    return {
        vendedores: statsArray,
        totais: { mes: totalMes, semana: totalSemana, dia: totalDia },
        metas: { mes: metaTotalMes, semana: metaTotalSemana, dia: metaTotalDia },
        leads: { mes: totalLeadsMes, semana: totalLeadsSemana, dia: totalLeadsDia },
        txConversao: { mes: txMesGlobal, semana: txSemanaGlobal, dia: txDiaGlobal },
        custoTotal,
        custoTotalSemana,
        custoTotalDia,
        personagemUrl,
    };
}
