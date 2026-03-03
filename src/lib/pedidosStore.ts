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
}

const STORAGE_KEY = "pontocerto_pedidos";

export function getPedidos(): Pedido[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function salvarPedidos(pedidos: Pedido[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
  window.dispatchEvent(new Event("pedidos-updated"));
}

export function adicionarPedido(pedido: Pedido) {
  const pedidos = getPedidos();
  pedidos.push(pedido);
  salvarPedidos(pedidos);
}

export function atualizarStatusPedido(id: string, status: Pedido["status"]) {
  const pedidos = getPedidos();
  const idx = pedidos.findIndex((p) => p.id === id);
  if (idx !== -1) {
    pedidos[idx].status = status;
    salvarPedidos(pedidos);
  }
}

export function excluirPedido(id: string) {
  const pedidos = getPedidos().filter((p) => p.id !== id);
  salvarPedidos(pedidos);
}

export function getPedidosPorMesa(mesa: number): Pedido[] {
  return getPedidos().filter((p) => p.mesa === mesa);
}

export function fecharMesa(mesa: number) {
  const pedidos = getPedidos().filter((p) => p.mesa !== mesa);
  salvarPedidos(pedidos);
}
