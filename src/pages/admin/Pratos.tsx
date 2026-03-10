import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getPratos, salvarPratos, type Prato } from "@/lib/pratosStore";
import ImageUpload from "@/components/ImageUpload";

const categorias = ["Entrada", "Prato Principal", "Sobremesa", "Acompanhamento"];

const Pratos = () => {
  const [pratos, setPratos] = useState<Prato[]>(getPratos());
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", descricao: "", preco: "", categoria: "", disponivel: true, imagem: undefined as string | undefined });

  const resetForm = () => {
    setForm({ nome: "", descricao: "", preco: "", categoria: "", disponivel: true, imagem: undefined });
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.nome || !form.preco || !form.categoria) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    let updated: Prato[];
    if (editingId) {
      updated = pratos.map((p) => (p.id === editingId ? { ...p, nome: form.nome, descricao: form.descricao, preco: parseFloat(form.preco), categoria: form.categoria, disponivel: form.disponivel, imagem: form.imagem } : p));
      toast.success("Prato atualizado!");
    } else {
      updated = [...pratos, { id: Date.now().toString(), nome: form.nome, descricao: form.descricao, preco: parseFloat(form.preco), categoria: form.categoria, disponivel: form.disponivel, imagem: form.imagem }];
      toast.success("Prato adicionado!");
    }
    setPratos(updated);
    salvarPratos(updated);
    setOpen(false);
    resetForm();
  };

  const handleEdit = (prato: Prato) => {
    setForm({ nome: prato.nome, descricao: prato.descricao, preco: prato.preco.toString(), categoria: prato.categoria, disponivel: prato.disponivel, imagem: prato.imagem });
    setEditingId(prato.id);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = pratos.filter((p) => p.id !== id);
    setPratos(updated);
    salvarPratos(updated);
    toast.success("Prato removido!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pratos do Dia</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" />Novo Prato</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Prato" : "Novo Prato"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <ImageUpload value={form.imagem} onChange={(v) => setForm({ ...form, imagem: v })} label="Foto do Prato" />
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Preço (R$) *</Label>
                <Input type="number" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.disponivel} onCheckedChange={(v) => setForm({ ...form, disponivel: v })} />
                <Label>Disponível</Label>
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
                <TableHead className="w-16">Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pratos.map((prato) => (
                <TableRow key={prato.id}>
                  <TableCell>
                    {prato.imagem ? (
                      <img src={prato.imagem} alt={prato.nome} className="size-10 rounded object-cover" />
                    ) : (
                      <div className="size-10 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">—</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{prato.nome}</TableCell>
                  <TableCell>{prato.categoria}</TableCell>
                  <TableCell>R$ {prato.preco.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${prato.disponivel ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                      {prato.disponivel ? "Disponível" : "Indisponível"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(prato)}><Pencil className="size-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="size-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir prato?</AlertDialogTitle>
                            <AlertDialogDescription>Tem certeza que deseja excluir "{prato.nome}"?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(prato.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
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

export default Pratos;
