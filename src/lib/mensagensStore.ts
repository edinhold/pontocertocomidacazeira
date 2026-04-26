import { supabase } from "@/integrations/supabase/client";

export type Frequencia = "unica" | "diaria" | "semanal" | "mensal";

export interface MensagemProgramada {
  id: string;
  titulo: string;
  conteudo: string;
  horario: string; // HH:mm
  frequencia: Frequencia;
  diasSemana?: number[]; // 0=Dom ... 6=Sab (usado quando frequencia=semanal)
  ativa: boolean;
  criadaEm: string;
  atualizadaEm: string;
}

export async function getMensagens(): Promise<MensagemProgramada[]> {
  const { data, error } = await supabase
    .from("mensagens_programadas")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Erro ao buscar mensagens:", error);
    return [];
  }
  
  return data.map(m => ({
    id: m.id,
    titulo: m.titulo,
    conteudo: m.conteudo,
    horario: m.horario,
    frequencia: m.frequencia as Frequencia,
    diasSemana: m.dias_semana || [],
    ativa: m.ativa,
    criadaEm: m.created_at,
    atualizadaEm: m.updated_at
  }));
}

export async function adicionarMensagem(msg: Omit<MensagemProgramada, "id" | "criadaEm" | "atualizadaEm">) {
  const { error } = await supabase
    .from("mensagens_programadas")
    .insert([{
      titulo: msg.titulo,
      conteudo: msg.conteudo,
      horario: msg.horario,
      frequencia: msg.frequencia,
      dias_semana: msg.diasSemana,
      ativa: msg.ativa
    }]);
  
  if (error) throw error;
}

export async function atualizarMensagem(id: string, dados: Partial<Omit<MensagemProgramada, "id" | "criadaEm">>) {
  const data: any = { ...dados };
  if (dados.diasSemana) {
    data.dias_semana = dados.diasSemana;
    delete data.diasSemana;
  }
  data.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("mensagens_programadas")
    .update(data)
    .eq("id", id);
  
  if (error) throw error;
}

export async function removerMensagem(id: string) {
  const { error } = await supabase
    .from("mensagens_programadas")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
}

export async function toggleMensagem(id: string, ativa: boolean) {
  const { error } = await supabase
    .from("mensagens_programadas")
    .update({ ativa, updated_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) throw error;
}

export const FREQUENCIA_LABELS: Record<Frequencia, string> = {
  unica: "Única",
  diaria: "Diária",
  semanal: "Semanal",
  mensal: "Mensal",
};

export const DIAS_SEMANA_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
