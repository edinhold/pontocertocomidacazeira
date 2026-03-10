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
import { getFuncionarios, salvarFuncionarios, type Funcionario } from "@/lib/funcionariosStore";

const Funcionarios = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(getFuncionarios());
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", cargo: "" as string, senha: "" });

  useEffect(() => {
    salvarFuncionarios(funcionarios);
  }, [funcionarios]);

  const resetForm = () => { setForm({ nome: "", email: "", cargo: "", senha: "" }); setEditingId(null); };

  const handleSave = () => {
    if (!form.nome || !form.email || !form.cargo) { toast.error("Preencha os campos obrigatórios"); return; }
    if (!editingId && !form.senha) { toast.error("Defina uma senha para o funcionário"); return; }

    // Check duplicate email
    const duplicado = funcionarios.find((f) => f.email === form.email && f.id !== editingId);
    if (duplicado) { toast.error("Já existe um funcionário com este email"); return; }

    if (editingId) {
      setFuncionarios((prev) =>
        prev.map((f) =>
          f.id === editingId
            ? { ...f, nome: form.nome, email: form.email, cargo: form.cargo as Funcionario["cargo"], ...(form.senha ? { senha: form.senha } : {}) }
            : f
        )
      );
      toast.success("Funcionário atualizado!");
    } else {
      const novo: Funcionario = {
        id: Date.now().toString(),
        nome: form.nome,
        email: form.email,
        cargo: form.cargo as Funcionario["cargo"],
        senha: form.senha,
      };
      setFuncionarios((prev) => [...prev, novo]);
      toast.success("Funcionário cadastrado!");
    }
    setOpen(false);
    resetForm();
  };

  const handleEdit = (f: Funcionario) => {
    setForm({ nome: f.nome, email: f.email, cargo: f.cargo, senha: "" });
    setEditingId(f.id);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setFuncionarios((prev) => prev.filter((x) => x.id !== id));
    toast.success("Funcionário removido!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Funcionários</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" />Novo Funcionário</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nome *</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Cargo *</Label>
                <Select value={form.cargo} onValueChange={(v) => setForm({ ...form, cargo: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Garçom">Garçom</SelectItem>
                    <SelectItem value="Cozinheiro(a)">Cozinheiro(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{editingId ? "Nova Senha (deixe vazio para manter)" : "Senha *"}</Label>
                <Input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} />
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
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionarios.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.nome}</TableCell>
                  <TableCell>{f.email}</TableCell>
                  <TableCell>{f.cargo}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(f)}><Pencil className="size-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="size-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir funcionário?</AlertDialogTitle>
                            <AlertDialogDescription>Tem certeza que deseja excluir "{f.nome}"?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(f.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
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

export default Funcionarios;
