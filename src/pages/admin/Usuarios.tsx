import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Plus, UserCheck, UserX, Phone, KeyRound } from "lucide-react";
import { toast } from "sonner";
import {
  getClientes, cadastrarCliente, excluirCliente, toggleAtivoCliente, alterarSenhaCliente, type Cliente,
} from "@/lib/clientesStore";

const Usuarios = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", whatsapp: "" });
  const [salvando, setSalvando] = useState(false);

  // State for password change dialog
  const [senhaDialogOpen, setSenhaDialogOpen] = useState(false);
  const [senhaClienteId, setSenhaClienteId] = useState("");
  const [senhaClienteNome, setSenhaClienteNome] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  const carregar = useCallback(async () => {
    const data = await getClientes();
    setClientes(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleCadastrar = async () => {
    if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) {
      toast.error("Preencha nome, e-mail e senha");
      return;
    }
    setSalvando(true);
    const result = await cadastrarCliente(form.nome.trim(), form.email.trim(), form.senha, form.whatsapp.trim());
    setSalvando(false);
    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      setForm({ nome: "", email: "", senha: "", whatsapp: "" });
      carregar();
    } else {
      toast.error(result.message);
    }
  };

  const handleExcluir = async (id: string) => {
    const ok = await excluirCliente(id);
    if (ok) {
      toast.success("Cliente excluído!");
      carregar();
    } else {
      toast.error("Erro ao excluir cliente");
    }
  };

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    const ok = await toggleAtivoCliente(id, !ativo);
    if (ok) {
      toast.success(ativo ? "Cliente desativado" : "Cliente ativado");
      carregar();
    }
  };

  const handleAlterarSenha = async () => {
    if (!novaSenha || novaSenha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (novaSenha !== confirmaSenha) {
      toast.error("As senhas não coincidem");
      return;
    }
    const ok = await alterarSenhaCliente(senhaClienteId, novaSenha);
    if (ok) {
      toast.success("Senha alterada com sucesso!");
      setSenhaDialogOpen(false);
      setNovaSenha("");
      setConfirmaSenha("");
    } else {
      toast.error("Erro ao alterar senha");
    }
  };

  const openSenhaDialog = (cliente: Cliente) => {
    setSenhaClienteId(cliente.id);
    setSenhaClienteNome(cliente.nome);
    setNovaSenha("");
    setConfirmaSenha("");
    setSenhaDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" />Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Cliente</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} placeholder="Senha de acesso" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Phone className="size-3.5" /> WhatsApp</Label>
                <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="(11) 99999-9999" />
              </div>
              <Button onClick={handleCadastrar} className="w-full" disabled={salvando}>
                {salvando ? "Salvando..." : "Cadastrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog para alterar senha */}
      <Dialog open={senhaDialogOpen} onOpenChange={setSenhaDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Alterar senha — {senhaClienteNome}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nova senha</Label>
              <Input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="space-y-2">
              <Label>Confirmar nova senha</Label>
              <Input type="password" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} placeholder="Repita a senha" />
            </div>
            <Button onClick={handleAlterarSenha} className="w-full">Salvar nova senha</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados ({clientes.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Carregando...</p>
          ) : clientes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum cliente cadastrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead className="w-28"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.whatsapp || "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={c.endereco}>{c.endereco || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={c.ativo ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleToggleAtivo(c.id, c.ativo)}
                      >
                        {c.ativo ? (
                          <><UserCheck className="size-3 mr-1" />Ativo</>
                        ) : (
                          <><UserX className="size-3 mr-1" />Inativo</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(c.criadoEm).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openSenhaDialog(c)} title="Alterar senha">
                          <KeyRound className="size-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir {c.nome}?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleExcluir(c.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Excluir
                              </AlertDialogAction>
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

export default Usuarios;
