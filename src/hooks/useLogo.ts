import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import defaultLogo from "@/assets/logo.png";

const LOGO_CONFIG_KEY = "logo_url";

export function useLogo() {
  const [logoUrl, setLogoUrl] = useState<string>(defaultLogo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogo() {
      try {
        const { data, error } = await supabase
          .from("configuracoes")
          .select("valor")
          .eq("chave", LOGO_CONFIG_KEY)
          .maybeSingle();

        if (!error && data?.valor) {
          setLogoUrl(data.valor);
        }
      } catch {
        // fallback to default
      } finally {
        setLoading(false);
      }
    }

    fetchLogo();

    // Listen for logo updates
    const handler = () => fetchLogo();
    window.addEventListener("logo-updated", handler);
    return () => window.removeEventListener("logo-updated", handler);
  }, []);

  return { logoUrl, loading };
}

export async function uploadLogo(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const fileName = `logo_${Date.now()}.${ext}`;

  // Get current logo URL for audit log
  const { data: currentConfig } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("chave", LOGO_CONFIG_KEY)
    .maybeSingle();

  const oldUrl = currentConfig?.valor || null;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("logos")
    .upload(fileName, file, { upsert: false });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage.from("logos").getPublicUrl(fileName);
  const newUrl = urlData.publicUrl;

  // Save URL to configuracoes
  const { data: existing } = await supabase
    .from("configuracoes")
    .update({ valor: newUrl })
    .eq("chave", LOGO_CONFIG_KEY)
    .select();

  if (!existing || existing.length === 0) {
    await supabase
      .from("configuracoes")
      .insert({ chave: LOGO_CONFIG_KEY, valor: newUrl });
  }

  // Log the change
  await supabase.from("logo_alteracoes").insert({
    url_anterior: oldUrl,
    url_nova: newUrl,
  });

  window.dispatchEvent(new Event("logo-updated"));
  return newUrl;
}
