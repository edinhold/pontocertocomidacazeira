import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Bebida {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
}

const categorias = ["Refrigerante", "Suco", "Cerveja", "Água", "Drink", "Vinho"];

const Bebidas = () => {
  const [bebidas, setBebidas] = useState<Bebida[]>([
    { id: "1", nome: "Coca-Cola 350ml", preco: 6.0, categoria: "Refrigerante" },
    { id: "2", nome: "Suco de Laranja", preco: 8.0, categoria: "Suco" },
  ]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", preco: "", categoria: "" });

  const resetForm = () => { setForm({ nome: "", preco: "", categoria: "" }); setEditingId(null); };

  const handleSave = () => {
    if (!form.nome || !form.preco || !form.categoria) { toast.error("Preencha todos os campos"); return; }
    if (editingId) {
      setBebidas((prev) => prev.map((b) => (b.id === editingId ? { ...b, ...form, preco: parseFloat(form.preco) } : b)));
      toast.success("Bebida atualizada!");
    } else {
      setBebidas((prev) => [...prev, { id: Date.now().toString(), ...form, preco: parseFloat(form.preco) }]);
      toast.success("Bebida adicionada!");
    }
    setOpen(false);
    resetForm();
  };

  const handleEdit = (bebida: Bebida) => {
    setForm({ nome: bebida.nome, preco: bebida.preco.toString(), categoria: bebida.categoria });
    setEditingId(bebida.id);
    setOpen(true);
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
                      <Button variant="ghost" size="icon" onClick={() => setBebidas((prev) => prev.filter((x) => x.id !== b.id))}><Trash2 className="size-4 text-destructive" /></Button>
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
