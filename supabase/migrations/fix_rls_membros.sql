-- 1. Criação da Função Get User Companies (Security Definer)
-- Essa função vai rodar com privilégios de dono do banco, saltando a 
-- checagem recursiva do RLS durante pesquisas pesadas.
CREATE OR REPLACE FUNCTION public.get_user_companies()
RETURNS setof uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT empresa_id 
  FROM usuario_empresa 
  WHERE usuario_id = auth.uid();
$$;

-- 2. Restaurar Política da tabela usuario_empresa 
-- (Para ele ver todo mundo que tá nas empresas dele, não apenas o próprio vínculo dele)
DROP POLICY IF EXISTS "Usuário vê seus vínculos" ON public.usuario_empresa;

CREATE POLICY "Usuário vê seus vínculos" ON public.usuario_empresa
  FOR SELECT USING (
    empresa_id IN (SELECT public.get_user_companies())
  );

-- 3. Expandir a Política da tabela usuarios
-- (Para ele conseguir Puxar o "nome" na query `usuarios(nome)` que preenche os cartões)
DROP POLICY IF EXISTS "Usuário vê seu próprio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Usuário vê perfis da mesma empresa" ON public.usuarios;

-- Ele continua vendo o próprio perfil, E os perfis das pessoas que compartilham empresa
CREATE POLICY "Usuário vê perfis da mesma empresa" ON public.usuarios
  FOR SELECT USING (
    id = auth.uid() 
    OR 
    id IN (
      SELECT usuario_id 
      FROM public.usuario_empresa 
      WHERE empresa_id IN (SELECT public.get_user_companies())
    )
  );

-- Mantemos updates restritos apenas ao próprio usuário (Segurança de não alterar dados alheios)
DROP POLICY IF EXISTS "Usuários atualizam seu próprio perfil" ON public.usuarios;
CREATE POLICY "Usuários atualizam seu próprio perfil" ON public.usuarios
  FOR UPDATE USING (id = auth.uid());
