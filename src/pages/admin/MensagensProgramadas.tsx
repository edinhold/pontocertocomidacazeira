import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Plus, Pencil, Trash2, Clock, CalendarDays, Send } from "lucide-react";
import { formatWhatsAppUrl } from "@/lib/utils";
import { useConfig } from "@/hooks/useConfig";
import { toast } from "sonner";
import {
  getMensagens,
  adicionarMensagem,
  atualizarMensagem,
  removerMensagem,
  toggleMensagem,
  MensagemProgramada,
  Frequencia,
  FREQUENCIA_LABELS,
  DIAS_SEMANA_LABELS,
} from "@/lib/mensagensStore";

const emptyForm = {
  titulo: "",
  conteudo: "",
  horario: "08:00",
  frequencia: "diaria" as Frequencia,
  diasSemana: [] as number[],
  ativa: true,
};

const MensagensProgramadas = () => {
  const { config } = useConfig();
  const [mensagens, setMensagens] = useState<MensagemProgramada[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const refresh = async () => {
    setLoading(true);
    const data = await getMensagens();
    setMensagens(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (m: MensagemProgramada) => {
    setEditId(m.id);
    setForm({
      titulo: m.titulo,
      conteudo: m.conteudo,
      horario: m.horario,
      frequencia: m.frequencia,
      diasSemana: m.diasSemana || [],
      ativa: m.ativa,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.titulo.trim()) return toast.error("Informe o título da mensagem");
    if (!form.conteudo.trim()) return toast.error("Informe o conteúdo da mensagem");
    if (form.frequencia === "semanal" && form.diasSemana.length === 0)
      return toast.error("Selecione ao menos um dia da semana");

    if (editId) {
      atualizarMensagem(editId, form);
      toast.success("Mensagem atualizada!");
    } else {
      adicionarMensagem(form);
      toast.success("Mensagem programada criada!");
    }
    setOpen(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    removerMensagem(id);
    toast.success("Mensagem removida");
    refresh();
  };

  const handleToggle = (id: string) => {
    toggleMensagem(id);
    refresh();
  };

  const toggleDia = (dia: number) => {
    setForm((f) => ({
      ...f,
      diasSemana: f.diasSemana.includes(dia)
        ? f.diasSemana.filter((d) => d !== dia)
        : [...f.diasSemana, dia].sort(),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Mensagens Programadas</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="size-4 mr-2" />
              Nova Mensagem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? "Editar Mensagem" : "Nova Mensagem Programada"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  placeholder="Ex: Bom dia automático"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Conteúdo da mensagem</Label>
                <Textarea
                  placeholder="Digite o texto da mensagem que será enviada..."
                  rows={4}
                  value={form.conteudo}
                  onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{nome}"} para personalizar com o nome do cliente.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Clock className="size-3" /> Horário
                  </Label>
                  <Input
                    type="time"
                    value={form.horario}
                    onChange={(e) => setForm({ ...form, horario: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <CalendarDays className="size-3" /> Frequência
                  </Label>
                  <Select
                    value={form.frequencia}
                    onValueChange={(v) => setForm({ ...form, frequencia: v as Frequencia })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FREQUENCIA_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.frequencia === "semanal" && (
                <div className="space-y-2">
                  <Label>Dias da semana</Label>
                  <div className="flex flex-wrap gap-2">
                    {DIAS_SEMANA_LABELS.map((label, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-1.5 cursor-pointer select-none"
                      >
                        <Checkbox
                          checked={form.diasSemana.includes(i)}
                          onCheckedChange={() => toggleDia(i)}
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={form.ativa}
                  onCheckedChange={(v) => setForm({ ...form, ativa: v })}
                />
                <Label>Ativa</Label>
              </div>

              <Button onClick={handleSave} className="w-full">
                {editId ? "Salvar Alterações" : "Criar Mensagem"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {mensagens.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MessageSquare className="size-12 mx-auto mb-4 opacity-30" />
            <p>Nenhuma mensagem programada.</p>
            <p className="text-sm">Crie mensagens automáticas para enviar via WhatsApp.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Mensagens cadastradas ({mensagens.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden sm:table-cell">Horário</TableHead>
                  <TableHead className="hidden sm:table-cell">Frequência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mensagens.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {m.titulo}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{m.horario}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary">{FREQUENCIA_LABELS[m.frequencia]}</Badge>
                      {m.frequencia === "semanal" && m.diasSemana && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({m.diasSemana.map((d) => DIAS_SEMANA_LABELS[d]).join(", ")})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={m.ativa}
                        onCheckedChange={() => handleToggle(m.id)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleSendNow(m)} title="Enviar agora">
                          <Send className="size-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MensagensProgramadas;
