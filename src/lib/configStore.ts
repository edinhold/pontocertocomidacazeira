export interface ConfigLoja {
  whatsapp: string;
  taxaEntrega: number;
  nomeRestaurante: string;
}

const STORAGE_KEY = "pontocerto_config";

const defaultConfig: ConfigLoja = {
  whatsapp: "",
  taxaEntrega: 0,
  nomeRestaurante: "Ponto Certo - Comida Caseira",
};

export function getConfig(): ConfigLoja {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? { ...defaultConfig, ...JSON.parse(data) } : defaultConfig;
  } catch {
    return defaultConfig;
  }
}

export function salvarConfig(config: ConfigLoja) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event("config-updated"));
}
