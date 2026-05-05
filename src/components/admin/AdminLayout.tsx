import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, ClipboardList, Wrench,
  Package, DollarSign, UserPlus, LogOut, ShieldCheck, Settings,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles: AppRole[];
}

const items: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, roles: ["admin","gerente","tecnico","vendedor","financeiro"] },
  { title: "Candidaturas", url: "/admin/candidaturas", icon: UserPlus, roles: ["admin","gerente"] },
  { title: "Usuários", url: "/admin/usuarios", icon: Users, roles: ["admin"] },
  { title: "Clientes", url: "/admin/clientes", icon: Users, roles: ["admin","gerente","vendedor"] },
  { title: "Contratos", url: "/admin/contratos", icon: FileText, roles: ["admin","gerente","vendedor","financeiro"] },
  { title: "Orçamentos", url: "/admin/orcamentos", icon: ClipboardList, roles: ["admin","gerente","vendedor","financeiro","tecnico"] },
  { title: "Ordens de Serviço", url: "/admin/ordens", icon: Wrench, roles: ["admin","gerente","tecnico","financeiro"] },
  { title: "Estoque", url: "/admin/estoque", icon: Package, roles: ["admin","gerente","tecnico","financeiro"] },
  { title: "Financeiro", url: "/admin/financeiro", icon: DollarSign, roles: ["admin","gerente","financeiro"] },
];

function AppSidebar() {
  const { hasRole, isAdmin } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const visible = items.filter((i) => hasRole(...i.roles));

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200">
      <SidebarContent className="bg-white">
        <div className="p-4 flex items-center gap-2 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">Espier ERP</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Área restrita</p>
            </div>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Operação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visible.map((it) => (
                <SidebarMenuItem key={it.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={it.url}
                      end={it.url === "/admin"}
                      className={({ isActive }) =>
                        `flex items-center gap-2 ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-slate-700 hover:bg-slate-100"}`
                      }
                    >
                      <it.icon className="w-4 h-4" />
                      {!collapsed && <span>{it.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Sistema</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/configuracoes" className={({ isActive }) =>
                      `flex items-center gap-2 ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-slate-700 hover:bg-slate-100"}`}>
                      <Settings className="w-4 h-4" />
                      {!collapsed && <span>Configurações</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

const AdminLayout = () => {
  const { user, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name,email").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setName(data?.full_name || data?.email || user.email || ""));
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/auth", { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="hidden sm:block">
                <p className="text-xs text-slate-500">Olá,</p>
                <p className="text-sm font-semibold text-slate-900 leading-tight">{name || "..."}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-wrap gap-1">
                {roles.map((r) => (
                  <span key={r} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {r}
                  </span>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600">
                <LogOut className="w-4 h-4 mr-1.5" /> Sair
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
