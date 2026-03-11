
CREATE TABLE public.pedidos (
  id TEXT PRIMARY KEY,
  mesa INTEGER NOT NULL DEFAULT 0,
  itens JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente',
  hora TEXT NOT NULL DEFAULT '',
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacao_geral TEXT
);

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pedidos" ON public.pedidos FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert pedidos" ON public.pedidos FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update pedidos" ON public.pedidos FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete pedidos" ON public.pedidos FOR DELETE TO public USING (true);

CREATE TABLE public.vendas (
  id TEXT PRIMARY KEY,
  mesa INTEGER NOT NULL DEFAULT 0,
  itens JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  fechado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacao_geral TEXT
);

ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read vendas" ON public.vendas FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert vendas" ON public.vendas FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update vendas" ON public.vendas FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete vendas" ON public.vendas FOR DELETE TO public USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendas;
