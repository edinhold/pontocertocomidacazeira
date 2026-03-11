
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  whatsapp TEXT DEFAULT '',
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read clientes" ON public.clientes FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert clientes" ON public.clientes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update clientes" ON public.clientes FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete clientes" ON public.clientes FOR DELETE TO public USING (true);
