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

export function getBebidas(): Bebida[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : defaultBebidas;
  } catch {
    return defaultBebidas;
  }
}

export function salvarBebidas(bebidas: Bebida[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bebidas));
  window.dispatchEvent(new Event("bebidas-updated"));
}
