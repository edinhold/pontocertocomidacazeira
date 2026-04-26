import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAdicionais, salvarAdicional, excluirAdicional, type Adicional } from "@/lib/adicionaisStore";

const Adicionais = () => {
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", preco: "" });

  const loadAdicionais = async () => {
    setLoading(true);
    const data = await getAdicionais();
    setAdicionais(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAdicionais();
  }, []);

  const resetForm = () => { setForm({ nome: "", preco: "" }); setEditingId(null); };

  const handleSave = () => {
    if (!form.nome || !form.preco) { toast.error("Preencha todos os campos"); return; }
    const updated = editingId
      ? adicionais.map((a) => (a.id === editingId ? { ...a, nome: form.nome, preco: parseFloat(form.preco) } : a))
      : [...adicionais, { id: Date.now().toString(), nome: form.nome, preco: parseFloat(form.preco) }];
    setAdicionais(updated);
    salvarAdicionais(updated);
    toast.success(editingId ? "Adicional atualizado!" : "Adicional adicionado!");
    setOpen(false);
    resetForm();
  };

  const handleEdit = (a: Adicional) => {
    setForm({ nome: a.nome, preco: a.preco.toString() });
    setEditingId(a.id);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = adicionais.filter((a) => a.id !== id);
    setAdicionais(updated);
    salvarAdicionais(updated);
    toast.success("Adicional removido!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Adicionais</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" />Novo Adicional</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Editar Adicional" : "Novo Adicional"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nome *</Label><Input placeholder="Ex: Bacon, Ovo frito, Queijo extra..." value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
              <div className="space-y-2"><Label>Preço (R$) *</Label><Input type="number" step="0.01" placeholder="0.00" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Carregando...</p>
          ) : adicionais.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum adicional cadastrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adicionais.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.nome}</TableCell>
                    <TableCell>R$ {a.preco.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(a)}><Pencil className="size-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Trash2 className="size-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir adicional?</AlertDialogTitle>
                              <AlertDialogDescription>Tem certeza que deseja excluir "{a.nome}"?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(a.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Adicionais;
