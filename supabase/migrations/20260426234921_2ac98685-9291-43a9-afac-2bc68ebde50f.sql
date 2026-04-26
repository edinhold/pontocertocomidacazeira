-- Create table for pratos
CREATE TABLE public.pratos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  disponivel BOOLEAN NOT NULL DEFAULT true,
  imagem TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for bebidas
CREATE TABLE public.bebidas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  imagem TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bebidas ENABLE ROW LEVEL SECURITY;

-- Create policies for pratos
CREATE POLICY "Pratos are viewable by everyone" ON public.pratos FOR SELECT USING (true);
CREATE POLICY "Pratos can be managed by authenticated users" ON public.pratos FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for bebidas
CREATE POLICY "Bebidas are viewable by everyone" ON public.bebidas FOR SELECT USING (true);
CREATE POLICY "Bebidas can be managed by authenticated users" ON public.bebidas FOR ALL USING (auth.role() = 'authenticated');

-- Triggers for updated_at
CREATE TRIGGER update_pratos_updated_at BEFORE UPDATE ON public.pratos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bebidas_updated_at BEFORE UPDATE ON public.bebidas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
