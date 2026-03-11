-- Create config table for restaurant settings
CREATE TABLE public.configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read config (clients need WhatsApp number)
CREATE POLICY "Anyone can read config" ON public.configuracoes FOR SELECT USING (true);

-- Only authenticated users can modify config
CREATE POLICY "Authenticated users can insert config" ON public.configuracoes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update config" ON public.configuracoes FOR UPDATE TO authenticated USING (true);

-- Insert default values
INSERT INTO public.configuracoes (chave, valor) VALUES
  ('whatsapp', ''),
  ('taxa_entrega', '0'),
  ('nome_restaurante', 'Ponto Certo - Comida Caseira');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_configuracoes_updated_at
  BEFORE UPDATE ON public.configuracoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();