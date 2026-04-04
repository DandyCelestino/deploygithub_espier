import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Alarmes from "./pages/Alarmes.tsx";
import CFTV from "./pages/CFTV.tsx";
import ControleAcesso from "./pages/ControleAcesso.tsx";
import Login from "./pages/Login.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import OrdensServico from "./pages/admin/OrdensServico.tsx";
import Orcamentos from "./pages/admin/Orcamentos.tsx";
import Estoque from "./pages/admin/Estoque.tsx";
import Financeiro from "./pages/admin/Financeiro.tsx";
import Administracao from "./pages/admin/Administracao.tsx";
import Configuracoes from "./pages/admin/Configuracoes.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/seguranca/alarmes" element={<Alarmes />} />
            <Route path="/seguranca/cftv" element={<CFTV />} />
            <Route path="/seguranca/controle-de-acesso" element={<ControleAcesso />} />

            {/* Área Restrita */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="ordens" element={<OrdensServico />} />
              <Route path="orcamentos" element={<Orcamentos />} />
              <Route path="estoque" element={<Estoque />} />
              <Route path="financeiro" element={<Financeiro />} />
              <Route path="administracao" element={<Administracao />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
