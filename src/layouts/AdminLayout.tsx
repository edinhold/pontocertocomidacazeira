import { Outlet, useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { title: "Pratos do Dia", icon: UtensilsCrossed, path: "/admin/pratos" },
  { title: "Bebidas", icon: Wine, path: "/admin/bebidas" },
  { title: "Funcionários", icon: Users, path: "/admin/funcionarios" },
  { title: "Mesas", icon: Grid3X3, path: "/admin/mesas" },
  { title: "Pedidos", icon: ClipboardList, path: "/admin/pedidos" },
  { title: "Adicionais", icon: CirclePlus, path: "/admin/adicionais" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
