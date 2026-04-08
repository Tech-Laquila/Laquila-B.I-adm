-- Adiciona a coluna para armazenar a empresa atualmente focada pelo usuário
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS empresa_atual_id uuid REFERENCES public.empresas(id) ON DELETE SET NULL;
