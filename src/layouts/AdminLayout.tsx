import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Wine,
  Users,
  Grid3X3,
  ClipboardList,
  LogOut,
  CirclePlus,
  Settings,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { title: "Pratos do Dia", icon: UtensilsCrossed, path: "/admin/pratos" },
  { title: "Bebidas", icon: Wine, path: "/admin/bebidas" },
  { title: "Funcionários", icon: Users, path: "/admin/funcionarios" },
  { title: "Usuários", icon: Users, path: "/admin/usuarios" },
  { title: "Mesas", icon: Grid3X3, path: "/admin/mesas" },
  { title: "Pedidos", icon: ClipboardList, path: "/admin/pedidos" },
  { title: "Adicionais", icon: CirclePlus, path: "/admin/adicionais" },
  { title: "Configurações", icon: Settings, path: "/admin/configuracoes" },
  { title: "Mensagens", icon: MessageSquare, path: "/admin/mensagens" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const playAlert = () => {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.volume = 1.0;
      audio.play().catch(e => console.log("Áudio bloqueado pelo navegador", e));
      
      // Tenta tocar um segundo som logo após para garantir que seja audível
      setTimeout(() => {
        const audio2 = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio2.volume = 1.0;
        audio2.play().catch(() => {});
      }, 1000);
    };

    const channel = supabase
      .channel('admin-global-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, () => {
        playAlert();
        toast.success("🚨 TEM PEDIDO NOVO!", {
          description: "Um novo pedido chegou no sistema. Verifique a lista de pedidos.",
          duration: 15000,
          position: "top-center",
          action: {
            label: "Ver Pedidos",
            onClick: () => navigate("/admin/pedidos")
          }
        });
        
        // Dispatch event for components to reload if needed
        window.dispatchEvent(new Event("pedidos-updated"));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="items-center py-4">
          <Logo size="md" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  tooltip={item.title}
                >
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:text-sidebar-accent-foreground"
            onClick={() => navigate("/")}
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4 no-print">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
