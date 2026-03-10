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

const STORAGE_KEY = "pontocerto_mensagens_programadas";

function ler(): MensagemProgramada[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function salvar(msgs: MensagemProgramada[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
}

export function getMensagens(): MensagemProgramada[] {
  return ler();
}

export function adicionarMensagem(msg: Omit<MensagemProgramada, "id" | "criadaEm" | "atualizadaEm">): MensagemProgramada {
  const lista = ler();
  const nova: MensagemProgramada = {
    ...msg,
    id: crypto.randomUUID(),
    criadaEm: new Date().toISOString(),
    atualizadaEm: new Date().toISOString(),
  };
  lista.push(nova);
  salvar(lista);
  return nova;
}

export function atualizarMensagem(id: string, dados: Partial<Omit<MensagemProgramada, "id" | "criadaEm">>): void {
  const lista = ler().map((m) =>
    m.id === id ? { ...m, ...dados, atualizadaEm: new Date().toISOString() } : m
  );
  salvar(lista);
}

export function removerMensagem(id: string): void {
  salvar(ler().filter((m) => m.id !== id));
}

export function toggleMensagem(id: string): void {
  const lista = ler().map((m) =>
    m.id === id ? { ...m, ativa: !m.ativa, atualizadaEm: new Date().toISOString() } : m
  );
  salvar(lista);
}

export const FREQUENCIA_LABELS: Record<Frequencia, string> = {
  unica: "Única",
  diaria: "Diária",
  semanal: "Semanal",
  mensal: "Mensal",
};

export const DIAS_SEMANA_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
