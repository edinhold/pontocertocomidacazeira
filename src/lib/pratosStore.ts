export interface Prato {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
}

const STORAGE_KEY = "pontocerto_pratos";

const defaultPratos: Prato[] = [
  { id: "1", nome: "Feijoada Completa", descricao: "Feijoada com todos os acompanhamentos", preco: 35.0, categoria: "Prato Principal", disponivel: true },
  { id: "2", nome: "Frango à Parmegiana", descricao: "Filé de frango empanado com queijo e molho", preco: 28.0, categoria: "Prato Principal", disponivel: true },
];

export function getPratos(): Prato[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : defaultPratos;
  } catch {
    return defaultPratos;
  }
}

export function salvarPratos(pratos: Prato[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pratos));
  window.dispatchEvent(new Event("pratos-updated"));
}
