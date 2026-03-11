import { supabase } from "@/integrations/supabase/client";

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  senha: string;
  whatsapp: string;
  ativo: boolean;
  criadoEm: string;
}

function rowToCliente(row: any): Cliente {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    senha: row.senha,
    whatsapp: row.whatsapp || "",
    ativo: row.ativo,
    criadoEm: row.criado_em,
  };
}

export async function getClientes(): Promise<Cliente[]> {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("criado_em", { ascending: false });
  if (error) {
    console.error("Erro ao buscar clientes:", error);
    return [];
  }
  return (data || []).map(rowToCliente);
}

export async function cadastrarCliente(
  nome: string,
  email: string,
  senha: string,
  whatsapp?: string
): Promise<{ success: boolean; message: string }> {
  // Check if email already exists
  const { data: existing } = await supabase
    .from("clientes")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return { success: false, message: "Este e-mail já está cadastrado." };
  }

  const { error } = await supabase.from("clientes").insert({
    nome,
    email,
    senha,
    whatsapp: whatsapp || "",
  });

  if (error) {
    console.error("Erro ao cadastrar cliente:", error);
    return { success: false, message: "Erro ao cadastrar. Tente novamente." };
  }

  return { success: true, message: "Cadastro realizado com sucesso!" };
}

export async function autenticarCliente(email: string, senha: string): Promise<Cliente | null> {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("email", email)
    .eq("senha", senha)
    .maybeSingle();

  if (error || !data) return null;
  return rowToCliente(data);
}

export async function excluirCliente(id: string): Promise<boolean> {
  const { error } = await supabase.from("clientes").delete().eq("id", id);
  if (error) {
    console.error("Erro ao excluir cliente:", error);
    return false;
  }
  return true;
}

export async function toggleAtivoCliente(id: string, ativo: boolean): Promise<boolean> {
  const { error } = await supabase
    .from("clientes")
    .update({ ativo })
    .eq("id", id);
  if (error) {
    console.error("Erro ao atualizar status:", error);
    return false;
  }
  return true;
}
