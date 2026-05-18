import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { usePermissions, PermModule } from "@/hooks/usePermissions";

interface Props {
  children: ReactNode;
  roles?: AppRole[];
  module?: PermModule;
}

const ProtectedRoute = ({ children, roles, module }: Props) => {
  const { user, loading, hasRole } = useAuth();
  const { can, loaded: permsLoaded } = usePermissions();
  const location = useLocation();

  if (loading || (user && !permsLoaded)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/auth" replace state={{ from: location }} />;
  }

  const roleOk = !roles || roles.length === 0 || hasRole(...roles);
  const permOk = module ? can(module, "view") : false;

  if (!roleOk && !permOk) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Acesso negado</h1>
        <p className="text-slate-500">Você não tem permissão para acessar esta área.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
