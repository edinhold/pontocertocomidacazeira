-- Garante que a chave last_update exista na tabela de configuracoes
INSERT INTO public.configuracoes (chave, valor)
VALUES ('last_update', now()::text)
ON CONFLICT (chave) DO NOTHING;
