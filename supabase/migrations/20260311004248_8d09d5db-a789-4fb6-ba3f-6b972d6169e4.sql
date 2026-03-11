
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can read config" ON public.configuracoes;
DROP POLICY IF EXISTS "Authenticated users can insert config" ON public.configuracoes;
DROP POLICY IF EXISTS "Authenticated users can update config" ON public.configuracoes;

CREATE POLICY "Anyone can read config" ON public.configuracoes FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert config" ON public.configuracoes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update config" ON public.configuracoes FOR UPDATE TO authenticated USING (true);
