-- ============================================================================
-- Migração: Otimização do Dashboard com RPCs PostgreSQL
-- Laquila B.I — Performance: Mover agregações de JS para SQL nativo
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Índices compostos adicionais para performance das RPCs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_facebook_ads_empresa_data
  ON public.facebook_ads (empresa_id, data);

CREATE INDEX IF NOT EXISTS idx_facebook_ads_empresa_data_conta
  ON public.facebook_ads (empresa_id, data, nome_conta);

CREATE INDEX IF NOT EXISTS idx_leads_empresa_data_inicial
  ON public.leads (empresa_id, data_inicial);

CREATE INDEX IF NOT EXISTS idx_leads_empresa_data_venda
  ON public.leads (empresa_id, data_venda);

CREATE INDEX IF NOT EXISTS idx_leads_empresa_conta
  ON public.leads (empresa_id, nome_conta);

CREATE INDEX IF NOT EXISTS idx_leads_empresa_id_anuncio
  ON public.leads (empresa_id, id_anuncio);

CREATE INDEX IF NOT EXISTS idx_leads_empresa_id_conjunto
  ON public.leads (empresa_id, id_conjunto);



-- ─────────────────────────────────────────────────────────────────────────────
-- RPC 1: rpc_dashboard_kpis
-- Retorna KPIs globais e dados diários para o gráfico da aba Resumo
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_dashboard_kpis(
  p_empresa_id uuid,
  p_data_inicio date,
  p_data_fim date,
  p_teses text[] DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_kpis jsonb;
  v_diarios jsonb;
  v_custo numeric;
  v_leads bigint;
  v_contratos bigint;
BEGIN
  -- Custo total dos anúncios no período
  SELECT COALESCE(SUM(valor_usado), 0)
  INTO v_custo
  FROM facebook_ads
  WHERE empresa_id = p_empresa_id
    AND data >= p_data_inicio
    AND data <= p_data_fim
    AND (p_teses IS NULL OR nome_conta = ANY(p_teses));

  -- Total de leads no período (por data_inicial)
  SELECT COUNT(*)
  INTO v_leads
  FROM leads
  WHERE empresa_id = p_empresa_id
    AND data_inicial >= p_data_inicio::timestamp
    AND data_inicial < (p_data_fim + 1)::timestamp
    AND (p_teses IS NULL OR nome_conta = ANY(p_teses));

  -- Total de contratos no período (por data_venda)
  SELECT COUNT(*)
  INTO v_contratos
  FROM leads
  WHERE empresa_id = p_empresa_id
    AND contrato_fechado = true
    AND data_venda >= p_data_inicio::timestamp
    AND data_venda < (p_data_fim + 1)::timestamp
    AND (p_teses IS NULL OR nome_conta = ANY(p_teses));

  v_kpis := jsonb_build_object(
    'custo', v_custo,
    'leads', v_leads,
    'contratos', v_contratos,
    'cac', CASE WHEN v_contratos > 0 THEN ROUND(v_custo / v_contratos, 2) ELSE 0 END,
    'cpa', CASE WHEN v_leads > 0 THEN ROUND(v_custo / v_leads, 2) ELSE 0 END,
    'txConversao', CASE WHEN v_leads > 0 THEN ROUND((v_contratos::numeric / v_leads) * 100, 2) ELSE 0 END
  );

  -- Dados diários para os gráficos
  SELECT COALESCE(jsonb_agg(row_data ORDER BY dia), '[]'::jsonb)
  INTO v_diarios
  FROM (
    SELECT
      d.dia,
      jsonb_build_object(
        'data', d.dia::text,
        'custo', COALESCE(a.custo_dia, 0),
        'leads', COALESCE(l.leads_dia, 0),
        'contratos', COALESCE(c.contratos_dia, 0),
        'txConversao', CASE
          WHEN COALESCE(l.leads_dia, 0) > 0
          THEN ROUND((COALESCE(c.contratos_dia, 0)::numeric / l.leads_dia) * 100, 2)
          ELSE 0
        END,
        'cac', CASE
          WHEN COALESCE(c.contratos_dia, 0) > 0
          THEN ROUND(COALESCE(a.custo_dia, 0) / c.contratos_dia, 2)
          ELSE 0
        END,
        'cpa', CASE
          WHEN COALESCE(l.leads_dia, 0) > 0
          THEN ROUND(COALESCE(a.custo_dia, 0) / l.leads_dia, 2)
          ELSE 0
        END
      ) AS row_data
    FROM generate_series(p_data_inicio, p_data_fim, '1 day'::interval) AS d(dia)
    LEFT JOIN LATERAL (
      SELECT SUM(valor_usado) AS custo_dia
      FROM facebook_ads
      WHERE empresa_id = p_empresa_id
        AND data = d.dia::date
        AND (p_teses IS NULL OR nome_conta = ANY(p_teses))
    ) a ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*) AS leads_dia
      FROM leads
      WHERE empresa_id = p_empresa_id
        AND data_inicial >= d.dia::timestamp
        AND data_inicial < (d.dia + '1 day'::interval)::timestamp
        AND (p_teses IS NULL OR nome_conta = ANY(p_teses))
    ) l ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*) AS contratos_dia
      FROM leads
      WHERE empresa_id = p_empresa_id
        AND contrato_fechado = true
        AND data_venda >= d.dia::timestamp
        AND data_venda < (d.dia + '1 day'::interval)::timestamp
        AND (p_teses IS NULL OR nome_conta = ANY(p_teses))
    ) c ON true
    -- Só incluir dias que tenham algum dado
    WHERE COALESCE(a.custo_dia, 0) > 0
       OR COALESCE(l.leads_dia, 0) > 0
       OR COALESCE(c.contratos_dia, 0) > 0
  ) sub;

  RETURN jsonb_build_object(
    'kpis', v_kpis,
    'dadosDiarios', v_diarios
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC 2: rpc_dashboard_periodos
-- Retorna as 3 linhas (Mês, Semana, Dia) para a tabela de resumo
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_dashboard_periodos(
  p_empresa_id uuid,
  p_inicio_mes date,
  p_inicio_semana date,
  p_inicio_dia date,
  p_teses text[] DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb := '[]'::jsonb;
  v_label text;
  v_inicio date;
  v_custo numeric;
  v_leads bigint;
  v_contratos bigint;
  v_row jsonb;
BEGIN
  FOREACH v_label IN ARRAY ARRAY['Mês', 'Semana', 'Dia'] LOOP
    v_inicio := CASE v_label
      WHEN 'Mês' THEN p_inicio_mes
      WHEN 'Semana' THEN p_inicio_semana
      WHEN 'Dia' THEN p_inicio_dia
    END;

    SELECT COALESCE(SUM(valor_usado), 0)
    INTO v_custo
    FROM facebook_ads
    WHERE empresa_id = p_empresa_id
      AND data >= v_inicio
      AND (p_teses IS NULL OR nome_conta = ANY(p_teses));

    SELECT COUNT(*)
    INTO v_leads
    FROM leads
    WHERE empresa_id = p_empresa_id
      AND data_inicial >= v_inicio::timestamp
      AND (p_teses IS NULL OR nome_conta = ANY(p_teses));

    SELECT COUNT(*)
    INTO v_contratos
    FROM leads
    WHERE empresa_id = p_empresa_id
      AND contrato_fechado = true
      AND data_venda >= v_inicio::timestamp
      AND (p_teses IS NULL OR nome_conta = ANY(p_teses));

    v_row := jsonb_build_object(
      'periodo', v_label,
      'custo', v_custo,
      'leads', v_leads,
      'contratos', v_contratos,
      'cac', CASE WHEN v_contratos > 0 THEN ROUND(v_custo / v_contratos, 2) ELSE 0 END,
      'cpa', CASE WHEN v_leads > 0 THEN ROUND(v_custo / v_leads, 2) ELSE 0 END,
      'txConversao', CASE WHEN v_leads > 0 THEN ROUND((v_contratos::numeric / v_leads) * 100, 2) ELSE 0 END
    );

    v_result := v_result || v_row;
  END LOOP;

  RETURN v_result;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC 3: rpc_criativos_data
-- Retorna criativos agrupados, conjuntos agrupados e funil para aba Criativos
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_criativos_data(
  p_empresa_id uuid,
  p_data_inicio date,
  p_data_fim date,
  p_teses text[] DEFAULT NULL,
  p_criativo_id text DEFAULT NULL,
  p_conjunto_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_criativos jsonb;
  v_conjuntos jsonb;
  v_funnel jsonb;
  v_ts_inicio timestamp := p_data_inicio::timestamp;
  v_ts_fim timestamp := (p_data_fim + 1)::timestamp;
  v_custo_base numeric;
  v_leads_total bigint;
  v_contratos_total bigint;
  v_dados_sol bigint;
  v_links bigint;
BEGIN
  -- ─── Custo base (filtrado por criativo ou conjunto se selecionado) ───
  SELECT COALESCE(SUM(valor_usado), 0)
  INTO v_custo_base
  FROM facebook_ads
  WHERE empresa_id = p_empresa_id
    AND data >= p_data_inicio
    AND data <= p_data_fim
    AND (p_teses IS NULL OR nome_conta = ANY(p_teses))
    AND (p_criativo_id IS NULL OR ad_anuncio = p_criativo_id)
    AND (p_conjunto_id IS NULL OR id_conjunto = p_conjunto_id);

  -- ─── Leads base (filtrados por criativo ou conjunto se selecionado) ───
  SELECT
    COUNT(*) FILTER (WHERE data_inicial >= v_ts_inicio AND data_inicial < v_ts_fim),
    COUNT(*) FILTER (WHERE contrato_fechado AND data_venda >= v_ts_inicio AND data_venda < v_ts_fim),
    COUNT(*) FILTER (WHERE dados_solicitados AND data_dados_solicitados >= v_ts_inicio AND data_dados_solicitados < v_ts_fim),
    COUNT(*) FILTER (WHERE link_enviado AND data_link >= v_ts_inicio AND data_link < v_ts_fim)
  INTO v_leads_total, v_contratos_total, v_dados_sol, v_links
  FROM leads
  WHERE empresa_id = p_empresa_id
    AND (p_teses IS NULL OR nome_conta = ANY(p_teses))
    AND (p_criativo_id IS NULL OR id_anuncio = p_criativo_id)
    AND (p_conjunto_id IS NULL OR id_conjunto = p_conjunto_id)
    AND (
      (data_inicial >= v_ts_inicio AND data_inicial < v_ts_fim)
      OR (data_venda >= v_ts_inicio AND data_venda < v_ts_fim)
      OR (data_dados_solicitados >= v_ts_inicio AND data_dados_solicitados < v_ts_fim)
      OR (data_link >= v_ts_inicio AND data_link < v_ts_fim)
    );

  v_funnel := jsonb_build_object(
    'custo', v_custo_base,
    'leads', v_leads_total,
    'links', v_links,
    'contratos', v_contratos_total,
    'dadosSolicitados', v_dados_sol,
    'cac', CASE WHEN v_contratos_total > 0 THEN ROUND(v_custo_base / v_contratos_total, 2) ELSE 0 END,
    'cpa', CASE WHEN v_leads_total > 0 THEN ROUND(v_custo_base / v_leads_total, 2) ELSE 0 END,
    'txConversao', CASE WHEN v_leads_total > 0 THEN ROUND((v_contratos_total::numeric / v_leads_total) * 100, 2) ELSE 0 END,
    'txLista', CASE WHEN v_leads_total > 0 THEN ROUND((v_dados_sol::numeric / v_leads_total) * 100, 2) ELSE 0 END,
    'txLink', CASE WHEN v_leads_total > 0 THEN ROUND((v_links::numeric / v_leads_total) * 100, 2) ELSE 0 END
  );

  -- ─── Criativos agrupados por ad_anuncio ───
  SELECT COALESCE(jsonb_agg(row_data ORDER BY contratos DESC, custo DESC), '[]'::jsonb)
  INTO v_criativos
  FROM (
    SELECT jsonb_build_object(
      'adAnuncioId', a.ad_id,
      'nome', a.nome,
      'custo', a.custo,
      'leads', COALESCE(l.leads_count, 0),
      'cpa', CASE WHEN COALESCE(l.leads_count, 0) > 0 THEN ROUND(a.custo / l.leads_count, 2) ELSE 0 END,
      'contratos', COALESCE(l.contratos_count, 0),
      'cac', CASE WHEN COALESCE(l.contratos_count, 0) > 0 THEN ROUND(a.custo / l.contratos_count, 2) ELSE 0 END,
      'links', COALESCE(l.links_count, 0),
      'dadosSolicitados', COALESCE(l.dados_sol_count, 0)
    ) AS row_data,
    COALESCE(l.contratos_count, 0) AS contratos,
    a.custo
    FROM (
      SELECT
        COALESCE(ad_anuncio, 'sem-id') AS ad_id,
        MAX(nome_anuncio) AS nome,
        COALESCE(SUM(valor_usado), 0) AS custo,
        COALESCE(SUM(clicks_acao), 0) AS clicks
      FROM facebook_ads
      WHERE empresa_id = p_empresa_id
        AND data >= p_data_inicio
        AND data <= p_data_fim
        AND (p_teses IS NULL OR nome_conta = ANY(p_teses))
      GROUP BY COALESCE(ad_anuncio, 'sem-id')
    ) a
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*) FILTER (WHERE data_inicial >= v_ts_inicio AND data_inicial < v_ts_fim) AS leads_count,
        COUNT(*) FILTER (WHERE contrato_fechado AND data_venda >= v_ts_inicio AND data_venda < v_ts_fim) AS contratos_count,
        COUNT(*) FILTER (WHERE link_enviado AND data_link >= v_ts_inicio AND data_link < v_ts_fim) AS links_count,
        COUNT(*) FILTER (WHERE dados_solicitados AND data_dados_solicitados >= v_ts_inicio AND data_dados_solicitados < v_ts_fim) AS dados_sol_count
      FROM leads
      WHERE empresa_id = p_empresa_id
        AND id_anuncio = a.ad_id
        AND (p_teses IS NULL OR nome_conta = ANY(p_teses))
    ) l ON true
    -- Filtro cruzado: se conjunto selecionado, só criativos que aparecem nos leads desse conjunto
    WHERE (p_conjunto_id IS NULL OR a.ad_id IN (
      SELECT DISTINCT id_anuncio FROM leads
      WHERE empresa_id = p_empresa_id AND id_conjunto = p_conjunto_id AND id_anuncio IS NOT NULL
    ))
  ) sub;

  -- ─── Conjuntos agrupados por id_conjunto ───
  SELECT COALESCE(jsonb_agg(row_data ORDER BY contratos DESC, custo DESC), '[]'::jsonb)
  INTO v_conjuntos
  FROM (
    SELECT jsonb_build_object(
      'conjuntoId', a.conj_id,
      'nome', a.nome,
      'custo', a.custo,
      'leads', COALESCE(l.leads_count, 0),
      'cpa', CASE WHEN COALESCE(l.leads_count, 0) > 0 THEN ROUND(a.custo / l.leads_count, 2) ELSE 0 END,
      'dadosSolicitados', COALESCE(l.dados_sol_count, 0),
      'links', a.links,
      'contratos', COALESCE(l.contratos_count, 0),
      'txConversao', CASE WHEN COALESCE(l.leads_count, 0) > 0 THEN ROUND((COALESCE(l.contratos_count, 0)::numeric / l.leads_count) * 100, 2) ELSE 0 END,
      'cac', CASE WHEN COALESCE(l.contratos_count, 0) > 0 THEN ROUND(a.custo / l.contratos_count, 2) ELSE 0 END
    ) AS row_data,
    COALESCE(l.contratos_count, 0) AS contratos,
    a.custo
    FROM (
      SELECT
        COALESCE(id_conjunto, 'sem-id') AS conj_id,
        MAX(nome_do_conjunto_de_anuncios) AS nome,
        COALESCE(SUM(valor_usado), 0) AS custo,
        COALESCE(SUM(clicks_acao), 0) AS clicks,
        COALESCE(SUM(conversas_mensagem_iniciadas), 0) AS links
      FROM facebook_ads
      WHERE empresa_id = p_empresa_id
        AND data >= p_data_inicio
        AND data <= p_data_fim
        AND (p_teses IS NULL OR nome_conta = ANY(p_teses))
      GROUP BY COALESCE(id_conjunto, 'sem-id')
    ) a
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*) FILTER (WHERE data_inicial >= v_ts_inicio AND data_inicial < v_ts_fim) AS leads_count,
        COUNT(*) FILTER (WHERE contrato_fechado AND data_venda >= v_ts_inicio AND data_venda < v_ts_fim) AS contratos_count,
        COUNT(*) FILTER (WHERE dados_solicitados AND data_dados_solicitados >= v_ts_inicio AND data_dados_solicitados < v_ts_fim) AS dados_sol_count
      FROM leads
      WHERE empresa_id = p_empresa_id
        AND id_conjunto = a.conj_id
        AND (p_teses IS NULL OR nome_conta = ANY(p_teses))
    ) l ON true
    -- Filtro cruzado: se criativo selecionado, só conjuntos que aparecem nos leads desse criativo
    WHERE (p_criativo_id IS NULL OR a.conj_id IN (
      SELECT DISTINCT id_conjunto FROM leads
      WHERE empresa_id = p_empresa_id AND id_anuncio = p_criativo_id AND id_conjunto IS NOT NULL
    ))
  ) sub;

  RETURN jsonb_build_object(
    'criativos', v_criativos,
    'conjuntos', v_conjuntos,
    'funnel', v_funnel
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC 4: rpc_teses_list
-- Retorna lista distinta de teses (nome_conta) para filtros
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_teses_list(
  p_empresa_id uuid
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(DISTINCT nome_conta ORDER BY nome_conta), '[]'::jsonb)
  FROM leads
  WHERE empresa_id = p_empresa_id
    AND nome_conta IS NOT NULL;
$$;
