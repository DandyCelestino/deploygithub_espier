import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, ClipboardList, Wrench,
  Package, DollarSign, UserPlus, LogOut, ShieldCheck, Settings,
  Calendar, MapPin, History, Lock, BadgeDollarSign, Briefcase,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { usePermissions, PermModule } from "@/hooks/usePermissions";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles: AppRole[];
  module?: PermModule;
}

const items: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, roles: ["admin","gerente","tecnico","vendedor","financeiro"] },
  { title: "Agenda", url: "/admin/agenda", icon: Calendar, roles: ["admin","gerente","tecnico","vendedor","financeiro"], module: "agenda" },
  { title: "Candidaturas", url: "/admin/candidaturas", icon: UserPlus, roles: ["admin","gerente"], module: "candidaturas" },
  { title: "Usuários", url: "/admin/usuarios", icon: Users, roles: ["admin"], module: "usuarios" },
  { title: "Permissões", url: "/admin/permissoes", icon: Lock, roles: ["admin"] },
  { title: "Clientes", url: "/admin/clientes", icon: Users, roles: ["admin","gerente","vendedor"], module: "clientes" },
  { title: "Visitas", url: "/admin/visitas", icon: MapPin, roles: ["admin","gerente","vendedor"], module: "visitas" },
  { title: "Contratos", url: "/admin/contratos", icon: FileText, roles: ["admin","gerente","vendedor","financeiro"], module: "contratos" },
  { title: "Orçamentos", url: "/admin/orcamentos", icon: ClipboardList, roles: ["admin","gerente","vendedor","financeiro"], module: "orcamentos" },
  { title: "Ordens de Serviço", url: "/admin/ordens", icon: Wrench, roles: ["admin","gerente","tecnico","financeiro"], module: "ordens" },
  { title: "Estoque", url: "/admin/estoque", icon: Package, roles: ["admin","gerente","tecnico","financeiro"], module: "estoque" },
  { title: "Financeiro", url: "/admin/financeiro", icon: DollarSign, roles: ["admin","gerente","financeiro"], module: "financeiro" },
  { title: "Comissões", url: "/admin/comissoes", icon: BadgeDollarSign, roles: ["admin","gerente","vendedor","financeiro"] },
  { title: "Vendedores · CRM", url: "/admin/vendedores", icon: Briefcase, roles: ["admin","gerente","vendedor"] },
  { title: "Histórico", url: "/admin/historico", icon: History, roles: ["admin","gerente"] },
];

function AppSidebar() {
  const { hasRole, isAdmin } = useAuth();
  const { can } = usePermissions();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const visible = items.filter((i) =>
    hasRole(...i.roles) || (i.module ? can(i.module, "view") : false)
  );

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

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
                      onClick={handleNavClick}
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
                    <NavLink
                      to="/admin/configuracoes"
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `flex items-center gap-2 ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-slate-700 hover:bg-slate-100"}`}
                    >
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
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 sticky top-0 z-30">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <SidebarTrigger />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-slate-500 leading-none">Olá,</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight truncate max-w-[140px] sm:max-w-none">{name || "..."}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex flex-wrap gap-1">
                {roles.map((r) => (
                  <span key={r} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {r}
                  </span>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 px-2 sm:px-3">
                <LogOut className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-x-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
