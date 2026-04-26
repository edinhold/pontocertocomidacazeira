import { supabase } from "@/integrations/supabase/client";

export interface Prato {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
  imagem?: string;
}

const STORAGE_KEY = "pontocerto_pratos";

const defaultPratos: Prato[] = [
  { id: "1", nome: "Feijoada Completa", descricao: "Feijoada com todos os acompanhamentos", preco: 35.0, categoria: "Prato Principal", disponivel: true },
  { id: "2", nome: "Frango à Parmegiana", descricao: "Filé de frango empanado com queijo e molho", preco: 28.0, categoria: "Prato Principal", disponivel: true },
];

export async function getPratos(): Promise<Prato[]> {
  try {
    const { data, error } = await supabase
      .from("pratos")
      .select("*")
      .order("nome", { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map(row => ({
        id: row.id,
        nome: row.nome,
        descricao: row.descricao || "",
        preco: Number(row.preco),
        categoria: row.categoria,
        disponivel: row.disponivel,
        imagem: row.imagem || undefined
      }));
    }

    // Fallback to localStorage if database is empty (for migration)
    const localData = localStorage.getItem(STORAGE_KEY);
    return localData ? JSON.parse(localData) : defaultPratos;
  } catch (error) {
    console.error("Erro ao buscar pratos:", error);
    const localData = localStorage.getItem(STORAGE_KEY);
    return localData ? JSON.parse(localData) : defaultPratos;
  }
}

export async function salvarPrato(prato: Omit<Prato, "id"> & { id?: string }) {
  const data = {
    nome: prato.nome,
    descricao: prato.descricao,
    preco: prato.preco,
    categoria: prato.categoria,
    disponivel: prato.disponivel,
    imagem: prato.imagem
  };

  let error;
  if (prato.id && !prato.id.includes(".")) { // Local IDs are usually timestamps or small strings
    const { error: err } = await supabase
      .from("pratos")
      .update(data)
      .eq("id", prato.id);
    error = err;
  } else {
    const { error: err } = await supabase
      .from("pratos")
      .insert([data]);
    error = err;
  }

  if (error) {
    console.error("Erro ao salvar prato:", error);
    throw error;
  }

  window.dispatchEvent(new Event("pratos-updated"));
}

export async function excluirPrato(id: string) {
  const { error } = await supabase
    .from("pratos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir prato:", error);
    // If it's a local ID, we might need to handle it differently, 
    // but moving to Supabase means we should have real IDs.
  }

  // Also remove from local storage if it exists there during migration
  const localData = localStorage.getItem(STORAGE_KEY);
  if (localData) {
    const pratos: Prato[] = JSON.parse(localData);
    const updated = pratos.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  window.dispatchEvent(new Event("pratos-updated"));
}

// Keep this for compatibility during transition if needed
export function salvarPratos(pratos: Prato[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pratos));
  window.dispatchEvent(new Event("pratos-updated"));
}
