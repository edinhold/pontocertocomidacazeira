export interface Adicional {
  id: string;
  nome: string;
  preco: number;
}

const STORAGE_KEY = "pontocerto_adicionais";

export function getAdicionais(): Adicional[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function salvarAdicionais(adicionais: Adicional[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(adicionais));
}
