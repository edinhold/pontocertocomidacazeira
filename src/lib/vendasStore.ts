import { supabase } from "@/integrations/supabase/client";

export interface ItemVenda {
  nome: string;
  preco: number;
  quantidade: number;
  observacao?: string;
}

export interface Venda {
  id: string;
  mesa: number;
  itens: ItemVenda[];
  total: number;
  fechadoEm: string;
  observacaoGeral?: string;
}

function dispatchUpdate() {
  window.dispatchEvent(new Event("vendas-updated"));
}

function rowToVenda(row: any): Venda {
  return {
    id: row.id,
    mesa: row.mesa,
    itens: row.itens as ItemVenda[],
    total: Number(row.total),
    fechadoEm: row.fechado_em,
    observacaoGeral: row.observacao_geral || undefined,
  };
}

export async function getVendas(): Promise<Venda[]> {
  const { data, error } = await supabase
    .from("vendas")
    .select("*")
    .order("fechado_em", { ascending: false });
  if (error) {
    console.error("Erro ao buscar vendas:", error);
    return [];
  }
  return (data || []).map(rowToVenda);
}

export async function registrarVenda(venda: Venda) {
  const { error } = await supabase.from("vendas").insert({
    id: venda.id,
    mesa: venda.mesa,
    itens: venda.itens as any,
    total: venda.total,
    fechado_em: venda.fechadoEm,
    observacao_geral: venda.observacaoGeral || null,
  });
  if (error) console.error("Erro ao registrar venda:", error);
  dispatchUpdate();
}
