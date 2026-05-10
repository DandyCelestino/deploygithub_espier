import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList, Wrench, DollarSign, Users, UserPlus, Package,
  TrendingUp, AlertCircle, CheckCircle2, Eye, ShieldCheck, Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const moeda = (n: number) => `R$ ${Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Dashboard = () => {
  const { user, roles, hasRole } = useAuth();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [tecnicoOS, setTecnicoOS] = useState<Record<string, any[]>>({});
  const [vendedorComissoes, setVendedorComissoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const out: Record<string, number> = {};
      const tasks: Promise<unknown>[] = [];
      const run = (p: PromiseLike<unknown>) => tasks.push(Promise.resolve(p));

      if (hasRole("admin", "gerente")) {
        run(supabase.from("candidaturas").select("id", { count: "exact", head: true }).eq("status", "pendente").then(({ count }) => { out.candidaturasPendentes = count ?? 0; }));
        run(supabase.from("orcamentos").select("id", { count: "exact", head: true }).eq("status", "pendente").then(({ count }) => { out.orcamentosPendentes = count ?? 0; }));
        run(supabase.from("ordens_servico").select("id", { count: "exact", head: true }).eq("status", "aberta").then(({ count }) => { out.osAbertas = count ?? 0; }));
        run(supabase.from("ordens_servico").select("id", { count: "exact", head: true }).eq("status", "em_andamento").then(({ count }) => { out.osEmAndamento = count ?? 0; }));
        run(supabase.from("ordens_servico").select("id", { count: "exact", head: true }).eq("status", "aguardando_supervisao").then(({ count }) => { out.osAguardandoVistoria = count ?? 0; }));
        run(supabase.from("contratos").select("id", { count: "exact", head: true }).eq("status", "fechado").then(({ count }) => { out.contratosFechados = count ?? 0; }));
        run(supabase.from("visitas").select("id", { count: "exact", head: true }).eq("status", "agendada").then(({ count }) => { out.visitasAgendadas = count ?? 0; }));
      }
      if (hasRole("admin")) {
        run(supabase.from("profiles").select("id", { count: "exact", head: true }).then(({ count }) => { out.totalUsuarios = count ?? 0; }));
      }
      if (hasRole("admin", "gerente", "tecnico", "financeiro")) {
        run(supabase.from("estoque_itens").select("id,quantidade,quantidade_minima").then(({ data }) => {
          out.estoqueBaixo = (data ?? []).filter((i: any) => i.quantidade <= i.quantidade_minima).length;
        }));
      }
      if (hasRole("admin", "gerente", "financeiro")) {
        run(supabase.from("financeiro_contas").select("id", { count: "exact", head: true }).eq("status", "pendente").then(({ count }) => { out.contasPendentes = count ?? 0; }));
      }
      if (hasRole("tecnico")) {
        run(supabase.from("ordens_servico").select("id,codigo_rastreio,cliente_nome,status,valor_instalacao,valor_liberado,supervisao_aprovada")
          .eq("tecnico_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
            const buckets: Record<string, any[]> = {
              em_execucao: [], aguardando_vistoria: [], vistoriadas: [], liberadas: [], finalizadas: [],
            };
            (data ?? []).forEach((os: any) => {
              if (os.status === "em_andamento") buckets.em_execucao.push(os);
              else if (os.status === "aguardando_supervisao") buckets.aguardando_vistoria.push(os);
              else if (os.supervisao_aprovada && !os.valor_liberado) buckets.vistoriadas.push(os);
              else if (os.valor_liberado && os.status !== "concluida") buckets.liberadas.push(os);
              else if (os.status === "concluida") buckets.finalizadas.push(os);
            });
            setTecnicoOS(buckets);
          }));
        run(supabase.from("ordens_servico").select("id", { count: "exact", head: true }).is("tecnico_id", null).eq("status", "aberta").then(({ count }) => { out.osDisponiveis = count ?? 0; }));
      }
      if (hasRole("vendedor")) {
        run(supabase.from("contratos").select("id", { count: "exact", head: true }).eq("vendedor_id", user.id).then(({ count }) => { out.meusContratos = count ?? 0; }));
        run(supabase.from("visitas").select("id", { count: "exact", head: true }).eq("vendedor_id", user.id).eq("status", "agendada").then(({ count }) => { out.minhasVisitas = count ?? 0; }));
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
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {hasRole("admin", "gerente") && (
              <>
                <StatCard to="/admin/candidaturas" icon={UserPlus} label="Candidaturas pendentes" value={stats.candidaturasPendentes ?? 0} accent="text-orange-600 bg-orange-50" />
                <StatCard to="/admin/orcamentos" icon={ClipboardList} label="Orçamentos pendentes" value={stats.orcamentosPendentes ?? 0} accent="text-blue-600 bg-blue-50" />
                <StatCard to="/admin/ordens" icon={AlertCircle} label="OS abertas" value={stats.osAbertas ?? 0} accent="text-red-600 bg-red-50" />
                <StatCard to="/admin/ordens" icon={Wrench} label="OS em andamento" value={stats.osEmAndamento ?? 0} accent="text-amber-600 bg-amber-50" />
                <StatCard to="/admin/ordens" icon={Eye} label="Aguardando vistoria" value={stats.osAguardandoVistoria ?? 0} accent="text-purple-600 bg-purple-50" />
                <StatCard to="/admin/contratos" icon={CheckCircle2} label="Contratos fechados" value={stats.contratosFechados ?? 0} accent="text-emerald-600 bg-emerald-50" />
                <StatCard to="/admin/visitas" icon={Calendar} label="Visitas agendadas" value={stats.visitasAgendadas ?? 0} accent="text-sky-600 bg-sky-50" />
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
            {hasRole("vendedor") && (
              <>
                <StatCard to="/admin/contratos" icon={TrendingUp} label="Meus contratos" value={stats.meusContratos ?? 0} accent="text-emerald-600 bg-emerald-50" />
                <StatCard to="/admin/visitas" icon={Calendar} label="Minhas visitas" value={stats.minhasVisitas ?? 0} accent="text-blue-600 bg-blue-50" />
              </>
            )}
            {hasRole("admin") && (
              <StatCard to="/admin/permissoes" icon={ShieldCheck} label="Permissões" value={0} accent="text-slate-700 bg-slate-100" hideValue />
            )}
          </div>

          {hasRole("tecnico") && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Minhas Ordens de Serviço</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <TecnicoBucket title="Em execução" color="text-amber-600 bg-amber-50" items={tecnicoOS.em_execucao ?? []} />
                <TecnicoBucket title="Aguardando vistoria" color="text-purple-600 bg-purple-50" items={tecnicoOS.aguardando_vistoria ?? []} />
                <TecnicoBucket title="Vistoriadas" color="text-blue-600 bg-blue-50" items={tecnicoOS.vistoriadas ?? []} />
                <TecnicoBucket title="Liberadas" color="text-emerald-600 bg-emerald-50" items={tecnicoOS.liberadas ?? []} showValor />
                <TecnicoBucket title="Finalizadas" color="text-slate-600 bg-slate-100" items={tecnicoOS.finalizadas ?? []} showValor />
                <Card className="p-5 border-dashed border-2 border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Disponíveis para puxar</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.osDisponiveis ?? 0}</p>
                  <Link to="/admin/ordens" className="text-xs text-primary hover:underline mt-2 inline-block">Ver e assumir →</Link>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const StatCard = ({ to, icon: Icon, label, value, accent, hideValue }: any) => (
  <Link to={to}>
    <Card className="p-5 hover:shadow-lg transition-shadow border-slate-200 cursor-pointer h-full">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      {!hideValue && <p className="text-3xl font-bold text-slate-900">{value}</p>}
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </Card>
  </Link>
);

const TecnicoBucket = ({ title, color, items, showValor }: any) => (
  <Card className="p-5">
    <div className="flex justify-between items-center mb-3">
      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${color}`}>{title}</span>
      <span className="text-2xl font-bold text-slate-900">{items.length}</span>
    </div>
    <div className="space-y-1.5 max-h-40 overflow-y-auto">
      {items.length === 0 && <p className="text-xs text-slate-400">Nenhuma OS.</p>}
      {items.slice(0, 6).map((os: any) => (
        <Link key={os.id} to="/admin/ordens" className="block text-xs hover:bg-slate-50 rounded px-2 py-1">
          <div className="font-mono text-[10px] text-slate-400">#{os.codigo_rastreio?.slice(0, 8)}</div>
          <div className="text-slate-700 truncate">{os.cliente_nome}</div>
          {showValor && os.valor_liberado && (
            <div className="text-emerald-600 font-semibold">R$ {(Number(os.valor_instalacao) * 0.3).toFixed(2)}</div>
          )}
        </Link>
      ))}
    </div>
  </Card>
);

export default Dashboard;
