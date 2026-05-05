import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList, Wrench, DollarSign, Users, UserPlus, Package,
  TrendingUp, AlertCircle, CheckCircle2, Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  candidaturasPendentes: number;
  orcamentosPendentes: number;
  osAbertas: number;
  osEmAndamento: number;
  osMinhas: number;
  contratosFechados: number;
  contasPendentes: number;
  estoqueBaixo: number;
  totalUsuarios: number;
  meusContratos: number;
}

const Dashboard = () => {
  const { user, roles, hasRole } = useAuth();
  const [stats, setStats] = useState<Partial<Stats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const out: Partial<Stats> = {};
      const tasks: Promise<any>[] = [];

      if (hasRole("admin", "gerente")) {
        tasks.push(
          supabase.from("candidaturas").select("id", { count: "exact", head: true }).eq("status", "pendente")
            .then(({ count }) => (out.candidaturasPendentes = count ?? 0)),
          supabase.from("orcamentos").select("id", { count: "exact", head: true }).eq("status", "pendente")
            .then(({ count }) => (out.orcamentosPendentes = count ?? 0)),
          supabase.from("ordens_servico").select("id", { count: "exact", head: true }).eq("status", "aberta")
            .then(({ count }) => (out.osAbertas = count ?? 0)),
          supabase.from("ordens_servico").select("id", { count: "exact", head: true }).eq("status", "em_andamento")
            .then(({ count }) => (out.osEmAndamento = count ?? 0)),
          supabase.from("contratos").select("id", { count: "exact", head: true }).eq("status", "fechado")
            .then(({ count }) => (out.contratosFechados = count ?? 0)),
        );
      }
      if (hasRole("admin")) {
        tasks.push(
          supabase.from("profiles").select("id", { count: "exact", head: true })
            .then(({ count }) => (out.totalUsuarios = count ?? 0)),
        );
      }
      if (hasRole("admin", "gerente", "tecnico", "financeiro")) {
        tasks.push(
          supabase.from("estoque_itens").select("id,quantidade,quantidade_minima").then(({ data }) => {
            out.estoqueBaixo = (data ?? []).filter((i: any) => i.quantidade <= i.quantidade_minima).length;
          }),
        );
      }
      if (hasRole("admin", "gerente", "financeiro")) {
        tasks.push(
          supabase.from("financeiro_contas").select("id", { count: "exact", head: true }).eq("status", "pendente")
            .then(({ count }) => (out.contasPendentes = count ?? 0)),
        );
      }
      if (hasRole("tecnico")) {
        tasks.push(
          supabase.from("ordens_servico").select("id", { count: "exact", head: true }).eq("tecnico_id", user.id)
            .then(({ count }) => (out.osMinhas = count ?? 0)),
        );
      }
      if (hasRole("vendedor")) {
        tasks.push(
          supabase.from("contratos").select("id", { count: "exact", head: true }).eq("vendedor_id", user.id)
            .then(({ count }) => (out.meusContratos = count ?? 0)),
        );
      }

      await Promise.all(tasks);
      setStats(out);
      setLoading(false);
    })();
  }, [user, roles.join(",")]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Visão geral do que importa para o seu perfil.</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Carregando indicadores...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {hasRole("admin", "gerente") && (
            <>
              <StatCard to="/admin/candidaturas" icon={UserPlus} label="Candidaturas pendentes" value={stats.candidaturasPendentes ?? 0} accent="text-orange-600 bg-orange-50" />
              <StatCard to="/admin/orcamentos" icon={ClipboardList} label="Orçamentos pendentes" value={stats.orcamentosPendentes ?? 0} accent="text-blue-600 bg-blue-50" />
              <StatCard to="/admin/ordens" icon={AlertCircle} label="OS abertas" value={stats.osAbertas ?? 0} accent="text-red-600 bg-red-50" />
              <StatCard to="/admin/ordens" icon={Wrench} label="OS em andamento" value={stats.osEmAndamento ?? 0} accent="text-amber-600 bg-amber-50" />
              <StatCard to="/admin/contratos" icon={CheckCircle2} label="Contratos fechados" value={stats.contratosFechados ?? 0} accent="text-emerald-600 bg-emerald-50" />
            </>
          )}
          {hasRole("admin") && (
            <StatCard to="/admin/usuarios" icon={Users} label="Usuários do sistema" value={stats.totalUsuarios ?? 0} accent="text-purple-600 bg-purple-50" />
          )}
          {hasRole("admin", "gerente", "tecnico", "financeiro") && (
            <StatCard to="/admin/estoque" icon={Package} label="Itens em estoque baixo" value={stats.estoqueBaixo ?? 0} accent="text-rose-600 bg-rose-50" />
          )}
          {hasRole("admin", "gerente", "financeiro") && (
            <StatCard to="/admin/financeiro" icon={DollarSign} label="Contas pendentes" value={stats.contasPendentes ?? 0} accent="text-indigo-600 bg-indigo-50" />
          )}
          {hasRole("tecnico") && (
            <StatCard to="/admin/ordens" icon={Wrench} label="Minhas OS" value={stats.osMinhas ?? 0} accent="text-blue-600 bg-blue-50" />
          )}
          {hasRole("vendedor") && (
            <StatCard to="/admin/contratos" icon={TrendingUp} label="Meus contratos" value={stats.meusContratos ?? 0} accent="text-emerald-600 bg-emerald-50" />
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ to, icon: Icon, label, value, accent }: any) => (
  <Link to={to}>
    <Card className="p-5 hover:shadow-lg transition-shadow border-slate-200 cursor-pointer h-full">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </Card>
  </Link>
);

export default Dashboard;
