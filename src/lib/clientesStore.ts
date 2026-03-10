export interface Cliente {
  id: string;
  nome: string;
  email: string;
  senha: string;
}

const STORAGE_KEY = "pontocerto_clientes";

export function getClientes(): Cliente[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function salvarClientes(clientes: Cliente[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
}

export function cadastrarCliente(nome: string, email: string, senha: string): { success: boolean; message: string } {
  const clientes = getClientes();
  if (clientes.some((c) => c.email === email)) {
    return { success: false, message: "Este e-mail já está cadastrado." };
  }
  const novo: Cliente = {
    id: crypto.randomUUID(),
    nome,
    email,
    senha,
  };
  salvarClientes([...clientes, novo]);
  return { success: true, message: "Cadastro realizado com sucesso!" };
}

export function autenticarCliente(email: string, senha: string): Cliente | null {
  const clientes = getClientes();
  return clientes.find((c) => c.email === email && c.senha === senha) || null;
}
