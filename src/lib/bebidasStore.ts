import { supabase } from "@/integrations/supabase/client";

export interface Bebida {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  imagem?: string;
}

const STORAGE_KEY = "pontocerto_bebidas";

const defaultBebidas: Bebida[] = [
  { id: "1", nome: "Coca-Cola 350ml", preco: 6.0, categoria: "Refrigerante" },
  { id: "2", nome: "Suco de Laranja", preco: 8.0, categoria: "Suco" },
];

export async function getBebidas(): Promise<Bebida[]> {
  try {
    const { data, error } = await supabase
      .from("bebidas")
      .select("*")
      .order("nome", { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map(row => ({
        id: row.id,
        nome: row.nome,
        preco: Number(row.preco),
        categoria: row.categoria,
        imagem: row.imagem || undefined
      }));
    }

    const localData = localStorage.getItem(STORAGE_KEY);
    return localData ? JSON.parse(localData) : defaultBebidas;
  } catch (error) {
    console.error("Erro ao buscar bebidas:", error);
    const localData = localStorage.getItem(STORAGE_KEY);
    return localData ? JSON.parse(localData) : defaultBebidas;
  }
}

export async function salvarBebida(bebida: Omit<Bebida, "id"> & { id?: string }) {
  const data = {
    nome: bebida.nome,
    preco: bebida.preco,
    categoria: bebida.categoria,
    imagem: bebida.imagem
  };

  let error;
  if (bebida.id && !bebida.id.includes(".")) {
    const { error: err } = await supabase
      .from("bebidas")
      .update(data)
      .eq("id", bebida.id);
    error = err;
  } else {
    const { error: err } = await supabase
      .from("bebidas")
      .insert([data]);
    error = err;
  }

  if (error) {
    console.error("Erro ao salvar bebida:", error);
    throw error;
  }

  window.dispatchEvent(new Event("bebidas-updated"));
}

export async function excluirBebida(id: string) {
  const { error } = await supabase
    .from("bebidas")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir bebida:", error);
  }

  const localData = localStorage.getItem(STORAGE_KEY);
  if (localData) {
    const bebidas: Bebida[] = JSON.parse(localData);
    const updated = bebidas.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  window.dispatchEvent(new Event("bebidas-updated"));
}

export function salvarBebidas(bebidas: Bebida[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bebidas));
  window.dispatchEvent(new Event("bebidas-updated"));
}
