import { supabase } from "@/integrations/supabase/client";

export interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: "Administrador" | "Garçom" | "Cozinheiro(a)";
  senha: string;
}

export async function getFuncionarios(): Promise<Funcionario[]> {
  const { data, error } = await supabase
    .from("funcionarios")
    .select("*")
    .order("nome", { ascending: true });
  
  if (error) {
    console.error("Erro ao buscar funcionários:", error);
    return [];
  }
  
  if (data.length === 0) {
    return [{ id: "admin-default", nome: "Administrador", email: "admin@pontocerto.com", cargo: "Administrador", senha: "admin123" }];
  }

  return data.map(f => ({
    id: f.id,
    nome: f.nome,
    email: f.email,
    cargo: f.cargo as Funcionario["cargo"],
    senha: f.senha
  }));
}

export async function salvarFuncionario(f: Omit<Funcionario, "id"> & { id?: string }) {
  const data = {
    nome: f.nome,
    email: f.email,
    cargo: f.cargo,
    senha: f.senha
  };

  if (f.id) {
    const { error } = await supabase
      .from("funcionarios")
      .update(data)
      .eq("id", f.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("funcionarios")
      .insert([data]);
    if (error) throw error;
  }
  window.dispatchEvent(new Event("funcionarios-updated"));
}

export async function excluirFuncionario(id: string) {
  const { error } = await supabase
    .from("funcionarios")
    .delete()
    .eq("id", id);
  if (error) throw error;
  window.dispatchEvent(new Event("funcionarios-updated"));
}

export async function autenticar(email: string, senha: string): Promise<Funcionario | null> {
  const { data, error } = await supabase
    .from("funcionarios")
    .select("*")
    .eq("email", email)
    .eq("senha", senha)
    .single();
  
  if (error || !data) {
    // Fallback for default admin if no rows exist
    if (email === "admin@pontocerto.com" && senha === "admin123") {
      return { id: "admin-default", nome: "Administrador", email: "admin@pontocerto.com", cargo: "Administrador", senha: "admin123" };
    }
    return null;
  }

  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    cargo: data.cargo as Funcionario["cargo"],
    senha: data.senha
  };
}

export function getCargoRoute(cargo: Funcionario["cargo"]): string {
  switch (cargo) {
    case "Administrador": return "/admin";
    case "Garçom": return "/garcom";
    case "Cozinheiro(a)": return "/cozinha";
  }
}
