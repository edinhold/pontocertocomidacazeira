import { useState, useEffect } from "react";
import { getConfigAsync, type ConfigLoja } from "@/lib/configStore";

const defaultConfig: ConfigLoja = {
  whatsapp: "",
  taxaEntrega: 0,
  nomeRestaurante: "Ponto Certo - Comida Caseira",
};

export function useConfig() {
  const [config, setConfig] = useState<ConfigLoja>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConfigAsync().then((c) => {
      setConfig(c);
      setLoading(false);
    });
  }, []);

  return { config, loading };
}
