-- Migration: Habilitar Realtime nas tabelas de dashboard
-- Story 1.1 — Realtime Dashboard
-- Data: 2026-03-25
--
-- REPLICA IDENTITY FULL: garante que UPDATE/DELETE entreguem payload completo
-- (sem isso, apenas o id é retornado nos eventos de mudança)
--
-- supabase_realtime publication: registra as tabelas no canal Realtime do Supabase

-- REPLICA IDENTITY FULL: garante payload completo em UPDATE/DELETE
ALTER TABLE public.vendas REPLICA IDENTITY FULL;
ALTER TABLE public.leads REPLICA IDENTITY FULL;
ALTER TABLE public.facebook_ads REPLICA IDENTITY FULL;

-- Adicionar à publication apenas se ainda não estiver (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'vendas'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vendas;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'leads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'facebook_ads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.facebook_ads;
  END IF;
END $$;
