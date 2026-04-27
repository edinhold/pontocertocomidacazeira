import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { autenticar, getCargoRoute } from "@/lib/funcionariosStore";
import { cadastrarCliente, autenticarCliente } from "@/lib/clientesStore";

const Login = () => {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regNome, setRegNome] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regWhatsapp, setRegWhatsapp] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    // Tenta autenticar como funcionário
    const funcionario = await autenticar(loginEmail, loginPassword);
    if (funcionario) {
      localStorage.setItem("pontocerto_user", JSON.stringify({ id: funcionario.id, nome: funcionario.nome, cargo: funcionario.cargo }));
      navigate(getCargoRoute(funcionario.cargo));
      toast.success(`Bem-vindo(a), ${funcionario.nome}!`);
      return;
    }

    // Tenta autenticar como cliente
    const cliente = await autenticarCliente(loginEmail, loginPassword);
    if (cliente) {
      localStorage.setItem("pontocerto_user", JSON.stringify({ id: cliente.id, nome: cliente.nome, tipo: "cliente" }));
      navigate("/");
      toast.success(`Bem-vindo(a), ${cliente.nome}!`);
      return;
    }

    toast.error("Email ou senha inválidos");
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNome || !regEmail || !regPassword || !regConfirm) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (regPassword !== regConfirm) {
      toast.error("As senhas não coincidem");
      return;
    }

    const result = await cadastrarCliente(regNome, regEmail, regPassword, regWhatsapp.trim());
    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setRegNome("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirm("");
    setRegWhatsapp("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted p-4 gap-6">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-4 pb-2">
          <img src={logo} alt="Ponto Certo - Comida Caseira" className="w-48 h-auto" />
          <p className="text-sm text-muted-foreground">Sistema de Gestão</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground text-center">
                Acesse com seu e-mail e senha cadastrados.
              </p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="seu@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Entrar</Button>
              </form>
            </TabsContent>

            <TabsContent value="cadastro" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground text-center">
                Crie sua conta para acessar o cardápio e acompanhar seus pedidos.
              </p>
              <form onSubmit={handleCadastro} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-nome">Nome completo</Label>
                  <Input id="reg-nome" placeholder="Seu nome" value={regNome} onChange={(e) => setRegNome(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" placeholder="seu@email.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Senha</Label>
                  <Input id="reg-password" type="password" placeholder="Mínimo 6 caracteres" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">Confirmar senha</Label>
                  <Input id="reg-confirm" type="password" placeholder="Repita a senha" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-whatsapp">WhatsApp</Label>
                  <Input id="reg-whatsapp" type="tel" placeholder="(11) 99999-9999" value={regWhatsapp} onChange={(e) => setRegWhatsapp(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Criar conta</Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Link to="/">
            <Button variant="outline" className="w-full gap-2">
              📋 Acessar Cardápio Digital
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
