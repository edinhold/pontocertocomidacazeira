-- Remover a política antiga que restringia a usuários autenticados no Supabase Auth
DROP POLICY IF EXISTS "Pratos can be managed by authenticated users" ON public.pratos;

-- Criar uma nova política permitindo que qualquer pessoa gerencie os pratos
-- Isso é necessário porque o sistema usa autenticação customizada via tabela 'funcionarios'
-- e não o Supabase Auth nativo, o que causava erros ao tentar salvar em novos dispositivos.
CREATE POLICY "Pratos can be managed by everyone" 
ON public.pratos 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Aplicar o mesmo para bebidas e adicionais para garantir consistência em todo o painel admin
DROP POLICY IF EXISTS "Bebidas can be managed by authenticated users" ON public.bebidas;
CREATE POLICY "Bebidas can be managed by everyone" 
ON public.bebidas 
FOR ALL 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Adicionais can be managed by authenticated users" ON public.adicionais;
CREATE POLICY "Adicionais can be managed by everyone" 
ON public.adicionais 
FOR ALL 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Funcionarios can be managed by authenticated users" ON public.funcionarios;
CREATE POLICY "Funcionarios can be managed by everyone" 
ON public.funcionarios 
FOR ALL 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Configuracoes can be managed by authenticated users" ON public.configuracoes;
CREATE POLICY "Configuracoes can be managed by everyone" 
ON public.configuracoes 
FOR ALL 
USING (true)
WITH CHECK (true);
