-- Correção da política RLS da tabela empresas
DROP POLICY IF EXISTS "Usuário vê as empresas a que pertence" ON public.empresas;

-- Ao invés de usar IN com uma subquery que pode gerar loop de permissões cruzadas, usamos EXISTS
CREATE POLICY "Usuário vê as empresas a que pertence" ON public.empresas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuario_empresa 
      WHERE usuario_empresa.empresa_id = empresas.id 
      AND usuario_empresa.usuario_id = auth.uid()
    )
  );

-- O mesmo para usuario_empresa, ao invés de buscar novamente a mesma tabela para verificação de dono,
-- usamos uma comparação direta e otimizada (na verdade, aqui a verificação de usuario_id já bate com auth.uid).
-- Vamos aproveitar para otimizar a política da tabela usuario_empresa também, garantindo que não haja loop de leitura
DROP POLICY IF EXISTS "Usuário vê seus vínculos" ON public.usuario_empresa;

CREATE POLICY "Usuário vê seus vínculos" ON public.usuario_empresa
  FOR SELECT USING (
    usuario_id = auth.uid()
  );
