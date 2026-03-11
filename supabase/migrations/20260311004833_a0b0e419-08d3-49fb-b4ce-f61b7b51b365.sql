
-- Allow anyone to insert/update config since auth is handled at app level
DROP POLICY IF EXISTS "Authenticated users can insert config" ON public.configuracoes;
DROP POLICY IF EXISTS "Authenticated users can update config" ON public.configuracoes;

CREATE POLICY "Anyone can insert config" ON public.configuracoes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update config" ON public.configuracoes FOR UPDATE TO public USING (true);
