import {
  ClipboardList,
  Package,
  FileText,
  Users,
  DollarSign,
  Settings,
  LayoutDashboard,
  LogOut,
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

const menuGroups = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operacional",
    items: [
      { title: "Ordens de Serviço", url: "/admin/ordens", icon: ClipboardList },
      { title: "Orçamentos", url: "/admin/orcamentos", icon: FileText },
      { title: "Estoque", url: "/admin/estoque", icon: Package },
    ],
  },
  {
    label: "Gestão",
    items: [
      { title: "Financeiro", url: "/admin/financeiro", icon: DollarSign },
      { title: "Administração", url: "/admin/administracao", icon: Users },
      { title: "Configurações", url: "/admin/configuracoes", icon: Settings },
    ],
  },
];

const AdminSidebar = () => {
  const { profile, roles, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

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

        {menuGroups.map((group) => (
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
