import { useState, useEffect } from "react";
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
import { getBebidas, salvarBebida, excluirBebida, type Bebida } from "@/lib/bebidasStore";
import ImageUpload from "@/components/ImageUpload";

const categorias = ["Refrigerante", "Suco", "Cerveja", "Água", "Drink", "Vinho"];

const Bebidas = () => {
  const [bebidas, setBebidas] = useState<Bebida[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", preco: "", categoria: "", imagem: undefined as string | undefined });

  const loadBebidas = async () => {
    setLoading(true);
    const data = await getBebidas();
    setBebidas(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBebidas();
    const handleUpdate = () => loadBebidas();
    window.addEventListener("bebidas-updated", handleUpdate);
    return () => window.removeEventListener("bebidas-updated", handleUpdate);
  }, []);

  const resetForm = () => { setForm({ nome: "", preco: "", categoria: "", imagem: undefined }); setEditingId(null); };

  const handleSave = async () => {
    if (!form.nome || !form.preco || !form.categoria) { toast.error("Preencha todos os campos"); return; }
    
    try {
      await salvarBebida({
        id: editingId || undefined,
        nome: form.nome,
        preco: parseFloat(form.preco),
        categoria: form.categoria,
        imagem: form.imagem
      });
      
      toast.success(editingId ? "Bebida atualizada!" : "Bebida adicionada!");
      setOpen(false);
      resetForm();
    } catch (err) {
      toast.error("Erro ao salvar bebida");
    }
  };

  const handleEdit = (bebida: Bebida) => {
    setForm({ nome: bebida.nome, preco: bebida.preco.toString(), categoria: bebida.categoria, imagem: bebida.imagem });
    setEditingId(bebida.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await excluirBebida(id);
      toast.success("Bebida removida!");
    } catch (err) {
      toast.error("Erro ao excluir bebida");
    }
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
              <ImageUpload value={form.imagem} onChange={(v) => setForm({ ...form, imagem: v })} label="Foto da Bebida" />
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
                <TableHead className="w-16">Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando bebidas...</TableCell>
                </TableRow>
              ) : bebidas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma bebida encontrada.</TableCell>
                </TableRow>
              ) : bebidas.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    {b.imagem ? (
                      <img src={b.imagem} alt={b.nome} className="size-10 rounded object-cover" />
                    ) : (
                      <div className="size-10 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">—</div>
                    )}
                  </TableCell>
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
