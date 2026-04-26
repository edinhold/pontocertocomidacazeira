import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getConfigAsync, type ConfigLoja } from "@/lib/configStore";

export function useTheme() {
  const [theme, setTheme] = useState<Partial<ConfigLoja>>({});
  const [loading, setLoading] = useState(true);

  const fetchTheme = async () => {
    try {
      const config = await getConfigAsync();
      setTheme({
        corTema: config.corTema,
        corLetras: config.corLetras,
        corBotoes: config.corBotoes,
        imagemFundo: config.imagemFundo,
      });
    } catch (error) {
      console.error("Erro ao carregar tema:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
    window.addEventListener("config-updated", fetchTheme);
    return () => window.removeEventListener("config-updated", fetchTheme);
  }, []);

  return { theme, loading, refreshTheme: fetchTheme };
}

export async function uploadThemeImage(file: File, key: "imagem_fundo"): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const fileName = `${key}_${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("logos")
    .upload(fileName, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from("logos").getPublicUrl(fileName);
  const newUrl = urlData.publicUrl;

  return newUrl;
}
