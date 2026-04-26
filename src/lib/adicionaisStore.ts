import { supabase } from "@/integrations/supabase/client";

export interface Adicional {
  id: string;
  nome: string;
  preco: number;
}

export async function getAdicionais(): Promise<Adicional[]> {
  const { data, error } = await supabase
    .from("adicionais")
    .select("*")
    .order("nome", { ascending: true });
  
  if (error) {
    console.error("Erro ao buscar adicionais:", error);
    return [];
  }
  
  return data.map(a => ({
    id: a.id,
    nome: a.nome,
    preco: Number(a.preco)
  }));
}

export async function salvarAdicional(adicional: Omit<Adicional, "id"> & { id?: string }) {
  const data = {
    nome: adicional.nome,
    preco: adicional.preco
  };

  if (adicional.id) {
    const { error } = await supabase
      .from("adicionais")
      .update(data)
      .eq("id", adicional.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("adicionais")
      .insert([data]);
    if (error) throw error;
  }
}

export async function excluirAdicional(id: string) {
  const { error } = await supabase
    .from("adicionais")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
