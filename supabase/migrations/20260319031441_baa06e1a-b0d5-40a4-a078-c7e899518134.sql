
-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Allow anyone to read logos
CREATE POLICY "Anyone can read logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');

-- Allow anyone to upload logos (admin protection at app level)
CREATE POLICY "Anyone can upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos');

-- Allow anyone to update logos
CREATE POLICY "Anyone can update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'logos');

-- Allow anyone to delete logos
CREATE POLICY "Anyone can delete logos" ON storage.objects FOR DELETE USING (bucket_id = 'logos');

-- Create logo change log table
CREATE TABLE public.logo_alteracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_anterior TEXT,
  url_nova TEXT NOT NULL,
  alterado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.logo_alteracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read logo_alteracoes" ON public.logo_alteracoes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert logo_alteracoes" ON public.logo_alteracoes FOR INSERT WITH CHECK (true);
