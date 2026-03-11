import { supabase } from "@/integrations/supabase/client";

export interface ConfigLoja {
  whatsapp: string;
  taxaEntrega: number;
  nomeRestaurante: string;
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

  for (const update of updates) {
    // Try update first
    const { data } = await supabase
      .from("configuracoes")
      .update({ valor: update.valor })
      .eq("chave", update.chave)
      .select();

    // If no row was updated, insert it
    if (!data || data.length === 0) {
      await supabase
        .from("configuracoes")
        .insert({ chave: update.chave, valor: update.valor });
    }
  }
}

/** Legacy sync saver */
export function salvarConfig(config: ConfigLoja) {
  salvarConfigAsync(config);
}
