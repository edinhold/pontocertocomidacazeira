-- Update RLS policies for Clientes
DROP POLICY IF EXISTS "Anyone can insert clientes" ON public.clientes;
DROP POLICY IF EXISTS "Anyone can read clientes" ON public.clientes;
DROP POLICY IF EXISTS "Anyone can update clientes" ON public.clientes;
DROP POLICY IF EXISTS "Anyone can delete clientes" ON public.clientes;

CREATE POLICY "Allow public insert for clientes" ON public.clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select for clientes" ON public.clientes FOR SELECT USING (true);
CREATE POLICY "Allow public update for clientes" ON public.clientes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for clientes" ON public.clientes FOR DELETE USING (true);

-- Update RLS policies for Configuracoes
DROP POLICY IF EXISTS "Anyone can read config" ON public.configuracoes;
DROP POLICY IF EXISTS "Anyone can insert config" ON public.configuracoes;
DROP POLICY IF EXISTS "Anyone can update config" ON public.configuracoes;

CREATE POLICY "Allow public select for configuracoes" ON public.configuracoes FOR SELECT USING (true);
CREATE POLICY "Allow public insert for configuracoes" ON public.configuracoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for configuracoes" ON public.configuracoes FOR UPDATE USING (true);

-- Update RLS policies for Vendas
DROP POLICY IF EXISTS "Anyone can read vendas" ON public.vendas;
DROP POLICY IF EXISTS "Anyone can insert vendas" ON public.vendas;
DROP POLICY IF EXISTS "Anyone can update vendas" ON public.vendas;
DROP POLICY IF EXISTS "Anyone can delete vendas" ON public.vendas;

CREATE POLICY "Allow public select for vendas" ON public.vendas FOR SELECT USING (true);
CREATE POLICY "Allow public insert for vendas" ON public.vendas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for vendas" ON public.vendas FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for vendas" ON public.vendas FOR DELETE USING (true);

-- Update RLS policies for Pedidos
DROP POLICY IF EXISTS "Anyone can read pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Anyone can insert pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Anyone can update pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Anyone can delete pedidos" ON public.pedidos;

CREATE POLICY "Allow public select for pedidos" ON public.pedidos FOR SELECT USING (true);
CREATE POLICY "Allow public insert for pedidos" ON public.pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for pedidos" ON public.pedidos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for pedidos" ON public.pedidos FOR DELETE USING (true);

-- Update RLS policies for logo_alteracoes
DROP POLICY IF EXISTS "Anyone can read logo_alteracoes" ON public.logo_alteracoes;
DROP POLICY IF EXISTS "Anyone can insert logo_alteracoes" ON public.logo_alteracoes;

CREATE POLICY "Allow public select for logo_alteracoes" ON public.logo_alteracoes FOR SELECT USING (true);
CREATE POLICY "Allow public insert for logo_alteracoes" ON public.logo_alteracoes FOR INSERT WITH CHECK (true);
