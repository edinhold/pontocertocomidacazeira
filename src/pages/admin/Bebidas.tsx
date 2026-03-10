import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getBebidas, salvarBebidas, type Bebida } from "@/lib/bebidasStore";

const categorias = ["Refrigerante", "Suco", "Cerveja", "Água", "Drink", "Vinho"];

const Bebidas = () => {
  const [bebidas, setBebidas] = useState<Bebida[]>(getBebidas());
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", preco: "", categoria: "" });

  const resetForm = () => { setForm({ nome: "", preco: "", categoria: "" }); setEditingId(null); };

  const handleSave = () => {
    if (!form.nome || !form.preco || !form.categoria) { toast.error("Preencha todos os campos"); return; }
    let updated: Bebida[];
    if (editingId) {
      updated = bebidas.map((b) => (b.id === editingId ? { ...b, ...form, preco: parseFloat(form.preco) } : b));
      toast.success("Bebida atualizada!");
    } else {
      updated = [...bebidas, { id: Date.now().toString(), ...form, preco: parseFloat(form.preco) }];
      toast.success("Bebida adicionada!");
    }
    setBebidas(updated);
    salvarBebidas(updated);
    setOpen(false);
    resetForm();
  };

  const handleEdit = (bebida: Bebida) => {
    setForm({ nome: bebida.nome, preco: bebida.preco.toString(), categoria: bebida.categoria });
    setEditingId(bebida.id);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = bebidas.filter((b) => b.id !== id);
    setBebidas(updated);
    salvarBebidas(updated);
    toast.success("Bebida removida!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bebidas</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" />Nova Bebida</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Editar Bebida" : "Nova Bebida"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nome *</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
              <div className="space-y-2"><Label>Preço (R$) *</Label><Input type="number" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bebidas.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.nome}</TableCell>
                  <TableCell>{b.categoria}</TableCell>
                  <TableCell>R$ {b.preco.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(b)}><Pencil className="size-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="size-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir bebida?</AlertDialogTitle>
                            <AlertDialogDescription>Tem certeza que deseja excluir "{b.nome}"?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(b.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Bebidas;
