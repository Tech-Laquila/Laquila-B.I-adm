-- Backfill stage-specific date fields for existing leads where they are NULL
-- Uses data_inicial as the best available approximation for when the stage was reached

UPDATE leads
SET data_venda = data_inicial
WHERE contrato_fechado = true
  AND data_venda IS NULL;

UPDATE leads
SET data_link = data_inicial
WHERE link_enviado = true
  AND data_link IS NULL;

UPDATE leads
SET data_dados_solicitados = data_inicial
WHERE dados_solicitados = true
  AND data_dados_solicitados IS NULL;
