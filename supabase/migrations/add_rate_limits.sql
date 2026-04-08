CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT rate_limits_pkey PRIMARY KEY (id)
);

ALTER TABLE public.rate_limits DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS rate_limits_key_created_idx
  ON public.rate_limits (key, created_at);
