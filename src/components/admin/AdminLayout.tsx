import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";

const AdminLayout = () => {
  const { profile } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 bg-card">
            <SidebarTrigger className="text-card-foreground" />
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {profile?.full_name || "Usuário"}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-sm font-medium">
                  {(profile?.full_name || "U").charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
