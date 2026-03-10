export interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: "Administrador" | "Garçom" | "Cozinheiro(a)";
  senha: string;
}

const STORAGE_KEY = "pontocerto_funcionarios";

const defaultFuncionarios: Funcionario[] = [
  { id: "admin-default", nome: "Administrador", email: "admin@pontocerto.com", cargo: "Administrador", senha: "admin123" },
];

export function getFuncionarios(): Funcionario[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : defaultFuncionarios;
  } catch {
    return defaultFuncionarios;
  }
}

export function salvarFuncionarios(funcionarios: Funcionario[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionarios));
  window.dispatchEvent(new Event("funcionarios-updated"));
}

export function autenticar(email: string, senha: string): Funcionario | null {
  const funcionarios = getFuncionarios();
  return funcionarios.find((f) => f.email === email && f.senha === senha) || null;
}

export function getCargoRoute(cargo: Funcionario["cargo"]): string {
  switch (cargo) {
    case "Administrador": return "/admin";
    case "Garçom": return "/garcom";
    case "Cozinheiro(a)": return "/cozinha";
  }
}
