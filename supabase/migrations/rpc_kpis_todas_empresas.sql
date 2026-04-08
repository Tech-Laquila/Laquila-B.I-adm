-- ============================================================================
-- Migração: RPC para visão geral de KPIs de todas as empresas
-- Laquila B.I — Tela interna de consolidação por empresa
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rpc_kpis_todas_empresas(
  p_empresa_ids uuid[],
  p_data_inicio date,
  p_data_fim date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result    jsonb := '[]'::jsonb;
  v_id        uuid;
  v_nome      text;
  v_logo      text;
  v_custo     numeric;
  v_leads     bigint;
  v_contratos bigint;
  v_row       jsonb;
BEGIN
  FOREACH v_id IN ARRAY p_empresa_ids LOOP
    SELECT nome, logo_url INTO v_nome, v_logo
    FROM empresas
    WHERE id = v_id;

    SELECT COALESCE(SUM(valor_usado), 0) INTO v_custo
    FROM facebook_ads
    WHERE empresa_id = v_id
      AND data >= p_data_inicio
      AND data <= p_data_fim;

    SELECT COUNT(*) INTO v_leads
    FROM leads
    WHERE empresa_id = v_id
      AND data_inicial >= p_data_inicio::timestamp
      AND data_inicial < (p_data_fim + 1)::timestamp;

    SELECT COUNT(*) INTO v_contratos
    FROM leads
    WHERE empresa_id = v_id
      AND contrato_fechado = true
      AND data_venda >= p_data_inicio::timestamp
      AND data_venda < (p_data_fim + 1)::timestamp;

    v_row := jsonb_build_object(
      'empresaId',   v_id,
      'nome',        v_nome,
      'logoUrl',     v_logo,
      'custo',       v_custo,
      'leads',       v_leads,
      'contratos',   v_contratos,
      'cac',         CASE WHEN v_contratos > 0 THEN ROUND(v_custo / v_contratos, 2) ELSE 0 END,
      'cpa',         CASE WHEN v_leads > 0 THEN ROUND(v_custo / v_leads, 2) ELSE 0 END,
      'txConversao', CASE WHEN v_leads > 0 THEN ROUND((v_contratos::numeric / v_leads) * 100, 2) ELSE 0 END
    );

    v_result := v_result || jsonb_build_array(v_row);
  END LOOP;

  RETURN v_result;
END;
$$;
