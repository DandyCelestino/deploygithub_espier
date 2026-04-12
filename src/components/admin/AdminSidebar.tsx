import {
  ClipboardList,
  Package,
  FileText,
  Users,
  DollarSign,
  Settings,
  LayoutDashboard,
  LogOut,
  Camera,
  Handshake,
  UserCheck,
  Activity,
  TrendingUp,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

type AppRole = "admin" | "gerente" | "tecnico" | "financeiro" | "vendedor";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  roles: AppRole[]; // empty = all roles
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const allRoles: AppRole[] = ["admin", "gerente", "tecnico", "financeiro", "vendedor"];

const menuGroups: MenuGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard, roles: ["admin", "gerente", "tecnico", "financeiro"] },
      { title: "Dashboard Vendas", url: "/admin/dashboard-vendedor", icon: TrendingUp, roles: ["vendedor"] },
    ],
  },
  {
    label: "Comercial",
    items: [
      { title: "Clientes", url: "/admin/clientes", icon: UserCheck, roles: ["admin", "gerente", "vendedor"] },
      { title: "Contratos", url: "/admin/contratos", icon: Handshake, roles: ["admin", "gerente", "vendedor", "financeiro"] },
    ],
  },
  {
    label: "Operacional",
    items: [
      { title: "Ordens de Serviço", url: "/admin/ordens", icon: ClipboardList, roles: ["admin", "gerente", "tecnico"] },
      { title: "Orçamentos", url: "/admin/orcamentos", icon: FileText, roles: ["admin", "gerente", "tecnico", "financeiro", "vendedor"] },
      { title: "Relatórios Diários", url: "/admin/relatorios", icon: Camera, roles: ["admin", "gerente", "tecnico"] },
      { title: "Estoque", url: "/admin/estoque", icon: Package, roles: ["admin", "gerente", "tecnico", "financeiro"] },
    ],
  },
  {
    label: "Gestão",
    items: [
      { title: "Financeiro", url: "/admin/financeiro", icon: DollarSign, roles: ["admin", "gerente", "financeiro"] },
      { title: "Logs de Atividade", url: "/admin/logs", icon: Activity, roles: ["admin", "gerente"] },
      { title: "Administração", url: "/admin/administracao", icon: Users, roles: ["admin"] },
      { title: "Configurações", url: "/admin/configuracoes", icon: Settings, roles: ["admin", "gerente"] },
    ],
  },
];

const AdminSidebar = () => {
  const { profile, roles, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const userRoles = roles as AppRole[];

  const visibleGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.roles.some((r) => userRoles.includes(r))
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200">
      <SidebarContent className="bg-white">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">E</span>
              </div>
              <span className="font-bold text-gray-900">
                Espier.<span className="text-primary">Telecom</span>
              </span>
            </div>
          )}
        </div>

        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <NavLink to={item.url} className="flex items-center gap-2 text-gray-800 hover:text-gray-900">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="bg-white border-t border-gray-200 p-3">
        {!collapsed && (
          <div className="mb-2 px-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.full_name || "Usuário"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {roles.join(", ") || "Sem função"}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-500 hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Sair"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
