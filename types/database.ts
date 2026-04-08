// types/database.ts
export interface FacebookAd {
    data: string | null;
    nome_da_campanha: string | null;
    nome_do_conjunto_de_anuncios: string | null;
    nome_anuncio: string | null;
    valor_usado: number | null;
    conversas_mensagem_iniciadas: number | null;
    cpc: number | null;
    ctr: number | null;
    clicks_acao: number | null;
    impressoes: number | null;
    cpm: number | null;
    status: string | null;
    nome_conta: string | null;
    ad_anuncio: string | null;
    id_conjunto: string | null;
    id_campanha: string | null;
    empresa: string | null;
    excluir: boolean | null;
    thumb: string | null;
}

export interface Lead {
    id: string;
    data_inicial: string | null;
    data_venda: string | null;
    data_dados_solicitados: string | null;
    data_link: string | null;
    contrato_fechado: boolean | null;
    dados_solicitados: boolean | null;
    link_enviado: boolean | null;
    fez_contato: boolean | null;
    nome_campanha: string | null;
    nome_conjunto: string | null;
    nome_conta: string | null;
    vendedor: string | null;
    id_campanha: string | null;
    id_conjunto: string | null;
    id_anuncio: string | null;
}

export interface Vendedor {
    id: string;
    vendedor: string | null;
    cliente: string | null;
    telefone: string | null;
    data_fechamento: string | null;
    meta_leads: number | null;
    meta_contratos: number | null;
}

export interface Empresa {
    id: string;
    nome: string;
    cnpj?: string | null;
    segmento?: string;
    webhook_token?: string;
    logo_url?: string;
    personagem_url?: string;
    background_url?: string;
    meta_ad_account_id?: string;
    meta_access_token?: string;
    meta_token_expires_at?: string;
    criado_em?: string;
    ativo?: boolean;
    funil_config?: {
        fez_contato: string;
        dados_solicitados: string;
        link_enviado: string;
        contrato_fechado: string;
    };
}

export interface Venda {
    id: string;
    vendedor_id: string | null;
    cliente: string | null;
    telefone: string | null;
    data_fechamento: string | null;
    empresa_id: string | null;
}

// Tipos calculados para UI
export interface DashboardKPIs {
    custo: number;
    contratos: number;
    cac: number;
    leads: number;
    cpa: number;
    txConversao: number;
}

export interface DadosDiarios {
    data: string; // "01/02"
    leads: number;
    contratos: number;
    txConversao: number;
    custo: number;
    cac: number;
    cpa: number;
}

export interface ResumoperiodoRow {
    periodo: "Mês" | "Semana" | "Dia";
    custo: number;
    contratos: number;
    cac: number;
    leads: number;
    cpa: number;
    txConversao: number;
}

export interface VendedorStats {
    nome: string;
    metaDia: number;
    metaSemana: number;
    metaMes: number;
    contratosTotal: number;
    contratosMes: number;
    contratosSemana: number;
    contratosDia: number;
    leadsMes: number;
    leadsSemana: number;
    leadsDia: number;
}

export interface VendedoresDataResult {
    vendedores: VendedorStats[];
    totais: { mes: number; semana: number; dia: number };
    metas: { mes: number; semana: number; dia: number };
    leads: { mes: number; semana: number; dia: number };
    txConversao: { mes: number; semana: number; dia: number };
    custoTotal: number;
    custoTotalSemana: number;
    custoTotalDia: number;
    personagemUrl?: string | null;
}

export interface CriativoRow {
    adAnuncioId: string;
    nome: string;
    custo: number;
    leads: number;
    cpa: number;
    contratos: number;
    cac: number;
    links: number;
    dadosSolicitados: number;
}

export interface EmpresaKPIsRow {
    empresaId: string;
    nome: string;
    logoUrl: string | null;
    custo: number;
    leads: number;
    contratos: number;
    cac: number;
    cpa: number;
    txConversao: number;
}

export interface ConjuntoRow {
    conjuntoId: string;
    nome: string;
    custo: number;
    leads: number;
    cpa: number;
    dadosSolicitados: number;
    links: number;
    contratos: number;
    txConversao: number;
    cac: number;
}

export interface FunnelData {
    custo: number;
    leads: number;
    links: number;
    contratos: number;
    cac: number;
    cpa: number;
    dadosSolicitados: number;
    txConversao: number;
    txLista: number;
    txLink: number;
}
