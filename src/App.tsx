import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Pratos from "./pages/admin/Pratos";
import Bebidas from "./pages/admin/Bebidas";
import Funcionarios from "./pages/admin/Funcionarios";
import Mesas from "./pages/admin/Mesas";
import Pedidos from "./pages/admin/Pedidos";
import Adicionais from "./pages/admin/Adicionais";
import Configuracoes from "./pages/admin/Configuracoes";
import MensagensProgramadas from "./pages/admin/MensagensProgramadas";
import Usuarios from "./pages/admin/Usuarios";
import Garcom from "./pages/Garcom";
import Cozinha from "./pages/Cozinha";
import Cardapio from "./pages/Cardapio";
import Instalar from "./pages/Instalar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="pratos" element={<Pratos />} />
            <Route path="bebidas" element={<Bebidas />} />
            <Route path="funcionarios" element={<Funcionarios />} />
            <Route path="mesas" element={<Mesas />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="adicionais" element={<Adicionais />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="mensagens" element={<MensagensProgramadas />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
          <Route path="/garcom" element={<Garcom />} />
          <Route path="/cozinha" element={<Cozinha />} />
          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/instalar" element={<Instalar />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
