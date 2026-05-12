import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Alarmes from "./pages/Alarmes.tsx";
import CFTV from "./pages/CFTV.tsx";
import ControleAcesso from "./pages/ControleAcesso.tsx";
import TI from "./pages/TI.tsx";
import Telecom from "./pages/Telecom.tsx";
import Rastreio from "./pages/Rastreio.tsx";

import AdminAuth from "./pages/admin/AdminAuth.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import ProtectedRoute from "./components/admin/ProtectedRoute.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import Candidaturas from "./pages/admin/Candidaturas.tsx";
import Usuarios from "./pages/admin/Usuarios.tsx";
import Clientes from "./pages/admin/Clientes.tsx";
import Contratos from "./pages/admin/Contratos.tsx";
import Orcamentos from "./pages/admin/Orcamentos.tsx";
import OrdensServico from "./pages/admin/OrdensServico.tsx";
import Estoque from "./pages/admin/Estoque.tsx";
import Financeiro from "./pages/admin/Financeiro.tsx";
import Configuracoes from "./pages/admin/Configuracoes.tsx";
import Visitas from "./pages/admin/Visitas.tsx";
import Agenda from "./pages/admin/Agenda.tsx";
import Permissoes from "./pages/admin/Permissoes.tsx";
import Historico from "./pages/admin/Historico.tsx";
import Comissoes from "./pages/admin/Comissoes.tsx";
import Vendedores from "./pages/admin/Vendedores.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/seguranca/alarmes" element={<Alarmes />} />
          <Route path="/seguranca/cftv" element={<CFTV />} />
          <Route path="/seguranca/controle-de-acesso" element={<ControleAcesso />} />
          <Route path="/ti" element={<TI />} />
          <Route path="/ti/telecom" element={<Telecom />} />
          <Route path="/rastreio" element={<Rastreio />} />

          {/* Área restrita */}
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="candidaturas" element={<ProtectedRoute roles={["admin","gerente"]}><Candidaturas /></ProtectedRoute>} />
            <Route path="usuarios" element={<ProtectedRoute roles={["admin"]}><Usuarios /></ProtectedRoute>} />
            <Route path="clientes" element={<ProtectedRoute roles={["admin","gerente","vendedor"]}><Clientes /></ProtectedRoute>} />
            <Route path="contratos" element={<ProtectedRoute roles={["admin","gerente","vendedor","financeiro"]}><Contratos /></ProtectedRoute>} />
            <Route path="orcamentos" element={<ProtectedRoute roles={["admin","gerente","vendedor","financeiro"]}><Orcamentos /></ProtectedRoute>} />
            <Route path="ordens" element={<ProtectedRoute roles={["admin","gerente","tecnico","financeiro"]}><OrdensServico /></ProtectedRoute>} />
            <Route path="estoque" element={<ProtectedRoute roles={["admin","gerente","tecnico","financeiro"]}><Estoque /></ProtectedRoute>} />
            <Route path="financeiro" element={<ProtectedRoute roles={["admin","gerente","financeiro"]}><Financeiro /></ProtectedRoute>} />
            <Route path="visitas" element={<ProtectedRoute roles={["admin","gerente","vendedor"]}><Visitas /></ProtectedRoute>} />
            <Route path="agenda" element={<ProtectedRoute roles={["admin","gerente","tecnico","vendedor","financeiro"]}><Agenda /></ProtectedRoute>} />
            <Route path="permissoes" element={<ProtectedRoute roles={["admin"]}><Permissoes /></ProtectedRoute>} />
            <Route path="historico" element={<ProtectedRoute roles={["admin","gerente"]}><Historico /></ProtectedRoute>} />
            <Route path="comissoes" element={<ProtectedRoute roles={["admin","gerente","vendedor","financeiro"]}><Comissoes /></ProtectedRoute>} />
            <Route path="vendedores" element={<ProtectedRoute roles={["admin","gerente","vendedor"]}><Vendedores /></ProtectedRoute>} />
            <Route path="configuracoes" element={<ProtectedRoute roles={["admin"]}><Configuracoes /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
