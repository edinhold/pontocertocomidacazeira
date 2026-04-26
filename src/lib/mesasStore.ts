import { supabase } from "@/integrations/supabase/client";

export interface Mesa {
  id: string;
  numero: number;
  capacidade: number;
}

export async function getMesas(): Promise<Mesa[]> {
  const { data, error } = await supabase
    .from("mesas")
    .select("*")
    .order("numero", { ascending: true });
  
  if (error) {
    console.error("Erro ao buscar mesas:", error);
    return [];
  }
  
  return data.map(m => ({
    id: m.id,
    numero: m.numero,
    capacidade: m.capacidade
  }));
}

export async function salvarMesa(mesa: Omit<Mesa, "id"> & { id?: string }) {
  const data = {
    numero: mesa.numero,
    capacidade: mesa.capacidade
  };

  if (mesa.id) {
    const { error } = await supabase
      .from("mesas")
      .update(data)
      .eq("id", mesa.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("mesas")
      .insert([data]);
    if (error) throw error;
  }
}

export async function excluirMesa(id: string) {
  const { error } = await supabase
    .from("mesas")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
