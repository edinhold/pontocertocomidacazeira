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

const STORAGE_KEY = "pontocerto_vendas";

export function getVendas(): Venda[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function salvarVendas(vendas: Venda[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vendas));
  window.dispatchEvent(new Event("vendas-updated"));
}

export function registrarVenda(venda: Venda) {
  const vendas = getVendas();
  vendas.push(venda);
  salvarVendas(vendas);
}
