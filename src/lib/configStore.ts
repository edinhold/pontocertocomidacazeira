import { supabase } from "@/integrations/supabase/client";

export interface ConfigLoja {
  whatsapp: string;
  taxaEntrega: number;
  nomeRestaurante: string;
  corTema?: string;
  corLetras?: string;
  corBotoes?: string;
  imagemFundo?: string;
}

const defaultConfig: ConfigLoja = {
  whatsapp: "",
  taxaEntrega: 0,
  nomeRestaurante: "Ponto Certo - Comida Caseira",
};

// Legacy localStorage key for migration
const STORAGE_KEY = "pontocerto_config";

/** Fetch config from Supabase (accessible by all devices) */
export async function getConfigAsync(): Promise<ConfigLoja> {
  try {
    const { data, error } = await supabase
      .from("configuracoes")
      .select("chave, valor");

    if (error || !data || data.length === 0) {
      // Fallback to localStorage for backward compatibility
      return getConfigLocal();
    }

    const config = { ...defaultConfig };
    for (const row of data) {
      if (row.chave === "whatsapp") config.whatsapp = row.valor;
      if (row.chave === "taxa_entrega") config.taxaEntrega = parseFloat(row.valor) || 0;
      if (row.chave === "nome_restaurante") config.nomeRestaurante = row.valor || defaultConfig.nomeRestaurante;
      if (row.chave === "cor_tema") config.corTema = row.valor;
      if (row.chave === "cor_letras") config.corLetras = row.valor;
      if (row.chave === "cor_botoes") config.corBotoes = row.valor;
      if (row.chave === "imagem_fundo") config.imagemFundo = row.valor;
    }
    return config;
  } catch {
    return getConfigLocal();
  }
}

/** Synchronous fallback from localStorage */
function getConfigLocal(): ConfigLoja {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? { ...defaultConfig, ...JSON.parse(data) } : defaultConfig;
  } catch {
    return defaultConfig;
  }
}

/** Legacy sync getter (for components not yet migrated) */
export function getConfig(): ConfigLoja {
  return getConfigLocal();
}

/** Save config to Supabase and localStorage */
export async function salvarConfigAsync(config: ConfigLoja) {
  // Save to localStorage as backup
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event("config-updated"));

  // Save to Supabase
  const updates = [
    { chave: "whatsapp", valor: config.whatsapp },
    { chave: "taxa_entrega", valor: config.taxaEntrega.toString() },
    { chave: "nome_restaurante", valor: config.nomeRestaurante },
  ];

  const { error } = await supabase
    .from("configuracoes")
    .upsert(updates, { onConflict: 'chave' });

  if (error) {
    console.error("Erro ao salvar no Supabase:", error);
    throw error;
  }
}

/** Legacy sync saver */
export function salvarConfig(config: ConfigLoja) {
  salvarConfigAsync(config);
}
