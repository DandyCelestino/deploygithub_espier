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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
