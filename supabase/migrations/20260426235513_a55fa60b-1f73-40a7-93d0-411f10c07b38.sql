-- Create table for adicionais
CREATE TABLE IF NOT EXISTS public.adicionais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for mensagens_programadas
CREATE TABLE IF NOT EXISTS public.mensagens_programadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  horario TEXT NOT NULL,
  frequencia TEXT NOT NULL,
  dias_semana INTEGER[],
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for funcionarios
CREATE TABLE IF NOT EXISTS public.funcionarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cargo TEXT NOT NULL,
  senha TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for mesas
CREATE TABLE IF NOT EXISTS public.mesas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero INTEGER NOT NULL UNIQUE,
  capacidade INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.adicionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_programadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'adicionais' AND policyname = 'Public read access') THEN
        CREATE POLICY "Public read access" ON public.adicionais FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'adicionais' AND policyname = 'Auth manage access') THEN
        CREATE POLICY "Auth manage access" ON public.adicionais FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mensagens_programadas' AND policyname = 'Public read access') THEN
        CREATE POLICY "Public read access" ON public.mensagens_programadas FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mensagens_programadas' AND policyname = 'Auth manage access') THEN
        CREATE POLICY "Auth manage access" ON public.mensagens_programadas FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'funcionarios' AND policyname = 'Auth manage access') THEN
        CREATE POLICY "Auth manage access" ON public.funcionarios FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mesas' AND policyname = 'Public read access') THEN
        CREATE POLICY "Public read access" ON public.mesas FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mesas' AND policyname = 'Auth manage access') THEN
        CREATE POLICY "Auth manage access" ON public.mesas FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;
