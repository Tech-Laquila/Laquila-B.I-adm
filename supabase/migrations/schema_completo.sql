-- Schema Completo Consolidado - Laquila B.I SaaS

-- 1. Criação das Tabelas

CREATE TABLE IF NOT EXISTS public.empresas (
  id uuid not null default gen_random_uuid (),
  nome text not null,
  cnpj text null,
  logo_url text null,
  segmento text null,
  webhook_token text not null default encode(extensions.gen_random_bytes (24), 'hex'::text),
  meta_ad_account_id text null,
  meta_access_token text null,
  meta_token_expires_at timestamp with time zone null,
  background_url text null,
  personagem_url text null,
  funil_config jsonb default '{ "fez_contato": "Fez Contato", "dados_solicitados": "Lista", "link_enviado": "Link Enviado", "contrato_fechado": "Comprou" }'::jsonb null,
  criado_em timestamp with time zone null default now(),
  ativo boolean null default true,
  constraint empresas_pkey primary key (id),
  constraint empresas_webhook_token_key unique (webhook_token)
);

CREATE TABLE IF NOT EXISTS public.usuarios (
  id uuid not null,
  nome text not null,
  email text not null,
  avatar_url text null,
  criado_em timestamp with time zone null default now(),
  constraint usuarios_pkey primary key (id),
  constraint usuarios_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
);

CREATE TABLE IF NOT EXISTS public.usuario_empresa (
  id uuid not null default gen_random_uuid (),
  usuario_id uuid not null,
  empresa_id uuid not null,
  papel text not null default 'vendedor'::text,
  criado_em timestamp with time zone null default now(),
  constraint usuario_empresa_pkey primary key (id),
  constraint usuario_empresa_usuario_id_empresa_id_key unique (usuario_id, empresa_id),
  constraint usuario_empresa_empresa_id_fkey foreign KEY (empresa_id) references empresas (id) on delete CASCADE,
  constraint usuario_empresa_usuario_id_fkey foreign KEY (usuario_id) references usuarios (id) on delete CASCADE
);

CREATE TABLE IF NOT EXISTS public.metas (
  id uuid not null default gen_random_uuid (),
  empresa_id uuid not null,
  contratos_dia integer null default 6,
  contratos_semana integer null default 30,
  contratos_mes integer null default 120,
  atualizado_em timestamp with time zone null default now(),
  vendedor uuid null,
  ativa boolean null,
  constraint metas_pkey primary key (id),
  constraint metas_empresa_id_fkey foreign KEY (empresa_id) references empresas (id) on delete CASCADE,
  constraint metas_vendedor_fkey foreign KEY (vendedor) references usuarios (id)
);

CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id uuid not null default gen_random_uuid (),
  empresa_id uuid null,
  payload jsonb null,
  sucesso boolean null,
  status text null default 'recebido'::text,
  recebido_em timestamp with time zone null default now(),
  constraint webhook_logs_pkey primary key (id),
  constraint webhook_logs_empresa_id_fkey foreign KEY (empresa_id) references empresas (id)
);

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid not null default gen_random_uuid (),
  empresa_id uuid null,
  origem text null,
  cod_conta text null,
  nome_conta text null,
  conta_ativa text null,
  facebook_pixel text null,
  nome_contato text null,
  whatsapp_contato text null,
  etapa_jornada text null,
  data_inicial timestamp with time zone null default now(),
  fez_contato boolean null default true,
  valor_venda numeric null,
  link_rastreável text null,
  id_campanha text null,
  id_conjunto text null,
  id_anuncio text null,
  nome_campanha text null,
  nome_conjunto text null,
  nome_anúncio text null,
  id_anuncio_google text null,
  id_grupo_google text null,
  id_campanha_google text null,
  nome_anuncio_google text null,
  nome_grupo_google text null,
  nome_campanha_google text null,
  utm_source text null,
  utm_medium text null,
  utm_campaign text null,
  utm_term text null,
  utm_content text null,
  país text null,
  estado text null,
  ctwa_clid text null,
  quantidade_vendas smallint null,
  valor_acumulado numeric null,
  dados_solicitados boolean null default false,
  data_dados_solicitados timestamp with time zone null,
  link_enviado boolean null default false,
  data_link timestamp with time zone null,
  contrato_fechado boolean null default false,
  data_venda timestamp with time zone null,
  constraint leads_pkey primary key (id),
  constraint leads_empresa_id_fkey foreign KEY (empresa_id) references empresas (id)
);

CREATE TABLE IF NOT EXISTS public.vendas (
  id uuid not null default gen_random_uuid (),
  vendedor_id uuid null,
  cliente text null,
  telefone text null,
  data_fechamento timestamp with time zone null default now(),
  empresa_id uuid null,
  constraint vendas_pkey primary key (id),
  constraint vendas_empresa_id_fkey foreign KEY (empresa_id) references empresas (id),
  constraint vendas_vendedor_id_fkey foreign KEY (vendedor_id) references usuarios (id) on delete set null
);

CREATE TABLE IF NOT EXISTS public.facebook_ads (
  id uuid not null default gen_random_uuid (),
  data date null,
  nome_da_campanha text null,
  nome_do_conjunto_de_anuncios text null,
  nome_anuncio text null,
  valor_usado numeric null,
  custo_conversa_mensagem_iniciada numeric null,
  conversas_mensagem_iniciadas bigint null,
  cpc numeric null,
  ctr numeric null,
  frequencia numeric null,
  clicks_acao bigint null,
  impressoes bigint null,
  cpm numeric null,
  link_previa text null,
  status text null,
  nome_conta text null,
  ad_anuncio text null,
  id_conjunto text null,
  id_campanha text null,
  empresa text null,
  empresa_id uuid null,
  excluir boolean null default true,
  thumb text null,
  constraint facebook_ads_pkey primary key (id),
  constraint facebook_ads_empresa_id_fkey foreign KEY (empresa_id) references empresas (id)
);

-- 2. Índices Recomendados Legado + Novos

create index IF not exists leads_empresa_id_idx on public.leads using btree (empresa_id) TABLESPACE pg_default;
create index IF not exists vendas_empresa_id_idx on public.vendas using btree (empresa_id) TABLESPACE pg_default;

create index IF not exists leads_data_inicial_idx on public.leads using btree (data_inicial) TABLESPACE pg_default;
create index IF not exists leads_etapa_jornada_idx on public.leads using btree (etapa_jornada) TABLESPACE pg_default;
create index IF not exists leads_data_link_idx on public.leads using btree (data_link) TABLESPACE pg_default;
create index IF not exists leads_data_venda_idx on public.leads using btree (data_venda) TABLESPACE pg_default;

create index IF not exists facebook_ads_ad_anuncio_idx on public.facebook_ads using btree (ad_anuncio) TABLESPACE pg_default;
create index IF not exists facebook_ads_data_idx on public.facebook_ads using btree (data) TABLESPACE pg_default;
create index IF not exists facebook_ads_excluir_idx on public.facebook_ads using btree (excluir) TABLESPACE pg_default;

-- Unique constraint para o webhook upsert funcionar
CREATE UNIQUE INDEX IF NOT EXISTS leads_empresa_whatsapp_uniq
    ON leads (empresa_id, whatsapp_contato)
    WHERE whatsapp_contato IS NOT NULL;

-- 3. RLS (Row Level Security) Policies

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_ads ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso multi-tenant (exemplo: usuário vê apenas dados da sua empresa vinculada)

DROP POLICY IF EXISTS "Usuário vê as empresas a que pertence" ON public.empresas;
CREATE POLICY "Usuário vê as empresas a que pertence" ON public.empresas
  FOR SELECT USING (
    id IN (SELECT empresa_id FROM public.usuario_empresa WHERE usuario_id = auth.uid())
  );

DROP POLICY IF EXISTS "Usuários autenticados podem criar empresas" ON public.empresas;
CREATE POLICY "Usuários autenticados podem criar empresas" ON public.empresas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins podem atualizar a empresa" ON public.empresas;
CREATE POLICY "Admins podem atualizar a empresa" ON public.empresas
  FOR UPDATE USING (
    id IN (SELECT empresa_id FROM public.usuario_empresa WHERE usuario_id = auth.uid() AND papel = 'admin')
  );

DROP POLICY IF EXISTS "Usuário vê seu próprio perfil" ON public.usuarios;
CREATE POLICY "Usuário vê seu próprio perfil" ON public.usuarios
  FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Usuário vê seus vínculos" ON public.usuario_empresa;
CREATE POLICY "Usuário vê seus vínculos" ON public.usuario_empresa
  FOR SELECT USING (
    empresa_id IN (SELECT empresa_id FROM public.usuario_empresa WHERE usuario_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins podem atualizar vínculos" ON public.usuario_empresa;
CREATE POLICY "Admins podem atualizar vínculos" ON public.usuario_empresa
  FOR UPDATE USING (
    empresa_id IN (
      SELECT e.id FROM public.empresas e
      INNER JOIN public.usuario_empresa ue ON ue.empresa_id = e.id
      WHERE ue.usuario_id = auth.uid() AND ue.papel = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins podem remover vínculos" ON public.usuario_empresa;
CREATE POLICY "Admins podem remover vínculos" ON public.usuario_empresa
  FOR DELETE USING (
    empresa_id IN (
      SELECT e.id FROM public.empresas e
      INNER JOIN public.usuario_empresa ue ON ue.empresa_id = e.id
      WHERE ue.usuario_id = auth.uid() AND ue.papel = 'admin'
    )
  );

DROP POLICY IF EXISTS "Usuário vê apenas leads da sua empresa" ON public.leads;
CREATE POLICY "Usuário vê apenas leads da sua empresa" ON public.leads
  FOR SELECT USING (
    empresa_id IN (SELECT empresa_id FROM public.usuario_empresa WHERE usuario_id = auth.uid())
  );

DROP POLICY IF EXISTS "Usuário vê metas da sua empresa" ON public.metas;
CREATE POLICY "Usuário vê metas da sua empresa" ON public.metas
  FOR SELECT USING (
    empresa_id IN (SELECT empresa_id FROM public.usuario_empresa WHERE usuario_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins podem inserir metas" ON public.metas;
CREATE POLICY "Admins podem inserir metas" ON public.metas
  FOR INSERT WITH CHECK (
    empresa_id IN (SELECT empresa_id FROM public.usuario_empresa WHERE usuario_id = auth.uid() AND papel = 'admin')
  );

DROP POLICY IF EXISTS "Admins podem atualizar metas" ON public.metas;
CREATE POLICY "Admins podem atualizar metas" ON public.metas
  FOR UPDATE USING (
    empresa_id IN (SELECT empresa_id FROM public.usuario_empresa WHERE usuario_id = auth.uid() AND papel = 'admin')
  );

DROP POLICY IF EXISTS "Admins podem deletar metas" ON public.metas;
CREATE POLICY "Admins podem deletar metas" ON public.metas
  FOR DELETE USING (
    empresa_id IN (SELECT empresa_id FROM public.usuario_empresa WHERE usuario_id = auth.uid() AND papel = 'admin')
  );

DROP POLICY IF EXISTS "Usuário vê logs de sua empresa" ON public.webhook_logs;
CREATE POLICY "Usuário vê logs de sua empresa" ON public.webhook_logs
  FOR SELECT USING (
    empresa_id IN (SELECT empresa_id FROM public.usuario_empresa WHERE usuario_id = auth.uid())
  );

DROP POLICY IF EXISTS "Usuário vê vendas da sua empresa" ON public.vendas;
CREATE POLICY "Usuário vê vendas da sua empresa" ON public.vendas
  FOR SELECT USING (
    empresa_id IN (SELECT empresa_id FROM public.usuario_empresa WHERE usuario_id = auth.uid())
  );

DROP POLICY IF EXISTS "Usuários da empresa podem inserir vendas" ON public.vendas;
CREATE POLICY "Usuários da empresa podem inserir vendas" ON public.vendas
  FOR INSERT WITH CHECK (
    empresa_id IN (SELECT empresa_id FROM public.usuario_empresa WHERE usuario_id = auth.uid())
  );

DROP POLICY IF EXISTS "Usuários da empresa podem atualizar vendas" ON public.vendas;
CREATE POLICY "Usuários da empresa podem atualizar vendas" ON public.vendas
  FOR UPDATE USING (
    empresa_id IN (SELECT empresa_id FROM public.usuario_empresa WHERE usuario_id = auth.uid())
  );

DROP POLICY IF EXISTS "Usuários da empresa podem deletar vendas" ON public.vendas;
CREATE POLICY "Usuários da empresa podem deletar vendas" ON public.vendas
  FOR DELETE USING (
    empresa_id IN (SELECT empresa_id FROM public.usuario_empresa WHERE usuario_id = auth.uid())
  );

DROP POLICY IF EXISTS "Usuário vê dados ADS da sua empresa" ON public.facebook_ads;
CREATE POLICY "Usuário vê dados ADS da sua empresa" ON public.facebook_ads
  FOR SELECT USING (
    empresa_id IN (SELECT empresa_id FROM public.usuario_empresa WHERE usuario_id = auth.uid())
  );


-- 4. Supabase Storage: Bucket e Policies

-- Bucket para assets das empresas
INSERT INTO storage.buckets (id, name, public)
VALUES ('Mentorados', 'Mentorados', true)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Admin pode fazer upload" ON storage.objects;
CREATE POLICY "Admin pode fazer upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'Mentorados'
    AND (storage.foldername(name))[1] IN (
        SELECT e.id::text FROM empresas e
        INNER JOIN usuario_empresa ue ON ue.empresa_id = e.id
        WHERE ue.usuario_id = auth.uid() AND ue.papel = 'admin'
    )
);

DROP POLICY IF EXISTS "Membros podem ler assets" ON storage.objects;
CREATE POLICY "Membros podem ler assets"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'Mentorados'
    AND (storage.foldername(name))[1] IN (
        SELECT e.id::text FROM empresas e
        INNER JOIN usuario_empresa ue ON ue.empresa_id = e.id
        WHERE ue.usuario_id = auth.uid()
    )
);
