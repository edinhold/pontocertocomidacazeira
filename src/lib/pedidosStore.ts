import { supabase } from "@/integrations/supabase/client";
import { registrarVenda } from "./vendasStore";

export interface ItemPedido {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  observacao?: string;
}

export interface Pedido {
  id: string;
  mesa: number;
  itens: ItemPedido[];
  total: number;
  status: "pendente" | "preparando" | "pronto";
  hora: string;
  criadoEm: string;
  observacaoGeral?: string;
}

function dispatchUpdate() {
  window.dispatchEvent(new Event("pedidos-updated"));
}

function rowToPedido(row: any): Pedido {
  return {
    id: row.id,
    mesa: row.mesa,
    itens: row.itens as ItemPedido[],
    total: Number(row.total),
    status: row.status as Pedido["status"],
    hora: row.hora,
    criadoEm: row.criado_em,
    observacaoGeral: row.observacao_geral || undefined,
  };
}

export async function getPedidos(): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*")
    .order("criado_em", { ascending: true });
  if (error) {
    console.error("Erro ao buscar pedidos:", error);
    return [];
  }
  return (data || []).map(rowToPedido);
}

export async function adicionarPedido(pedido: Pedido) {
  const { error } = await supabase.from("pedidos").insert({
    id: pedido.id,
    mesa: pedido.mesa,
    itens: pedido.itens as any,
    total: pedido.total,
    status: pedido.status,
    hora: pedido.hora,
    criado_em: pedido.criadoEm,
    observacao_geral: pedido.observacaoGeral || null,
  });
  if (error) console.error("Erro ao adicionar pedido:", error);
  dispatchUpdate();
}

export async function atualizarStatusPedido(id: string, status: Pedido["status"]) {
  const { error } = await supabase
    .from("pedidos")
    .update({ status })
    .eq("id", id);
  if (error) console.error("Erro ao atualizar status:", error);
  dispatchUpdate();
}

export async function excluirPedido(id: string) {
  const { error } = await supabase.from("pedidos").delete().eq("id", id);
  if (error) console.error("Erro ao excluir pedido:", error);
  dispatchUpdate();
}

export async function getPedidosPorMesa(mesa: number): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*")
    .eq("mesa", mesa)
    .order("criado_em", { ascending: true });
  if (error) {
    console.error("Erro ao buscar pedidos da mesa:", error);
    return [];
  }
  return (data || []).map(rowToPedido);
}

export async function fecharMesa(mesa: number) {
  const pedidosMesa = await getPedidosPorMesa(mesa);

  if (pedidosMesa.length > 0) {
    const itensConsolidados = pedidosMesa.flatMap((p) =>
      p.itens.map((item) => ({
        nome: item.nome,
        preco: item.preco,
        quantidade: item.quantidade,
        observacao: item.observacao,
      }))
    );
    const totalMesa = pedidosMesa.reduce((sum, p) => sum + p.total, 0);
    const observacoes = pedidosMesa
      .filter((p) => p.observacaoGeral)
      .map((p) => p.observacaoGeral)
      .join("; ");

    await registrarVenda({
      id: `V${Date.now()}`,
      mesa,
      itens: itensConsolidados,
      total: totalMesa,
      fechadoEm: new Date().toISOString(),
      observacaoGeral: observacoes || undefined,
    });
  }

  const { error } = await supabase.from("pedidos").delete().eq("mesa", mesa);
  if (error) console.error("Erro ao fechar mesa:", error);
  dispatchUpdate();
}
