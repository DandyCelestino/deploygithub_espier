import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Shield } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative">
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="text-center relative z-10">
        <Shield className="w-16 h-16 text-primary/30 mx-auto mb-4" />
        <h1 className="mb-4 text-6xl font-bold gradient-text">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Página não encontrada</p>
        <a href="/" className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors">
          ← Voltar ao início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
