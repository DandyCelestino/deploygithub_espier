import { ClipboardList, Package, FileText, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const { profile, roles } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard_stats"],
    queryFn: async () => {
      const [ordensRes, orcRes, estoqueRes, finRes] = await Promise.all([
        supabase.from("ordens_servico").select("id, status"),
        supabase.from("orcamentos").select("id, status"),
        supabase.from("estoque_itens").select("id, quantidade, quantidade_minima"),
        supabase.from("financeiro_contas").select("id, tipo, valor, status"),
      ]);
      
      const ordens = ordensRes.data || [];
      const orc = orcRes.data || [];
      const estoque = estoqueRes.data || [];
      const fin = finRes.data || [];

      return {
        ordensAbertas: ordens.filter((o) => o.status === "aberta" || o.status === "em_andamento").length,
        orcPendentes: orc.filter((o) => o.status === "pendente").length,
        itensEstoque: estoque.length,
        itensBaixos: estoque.filter((i) => i.quantidade <= i.quantidade_minima).length,
        aReceber: fin.filter((f) => f.tipo === "receber" && f.status === "pendente").reduce((s, f) => s + Number(f.valor), 0),
      };
    },
  });

  const cards = [
    { title: "Ordens Abertas", value: stats?.ordensAbertas ?? 0, icon: ClipboardList, color: "text-primary" },
    { title: "Orçamentos Pendentes", value: stats?.orcPendentes ?? 0, icon: FileText, color: "text-yellow-500" },
    { title: "Itens em Estoque", value: `${stats?.itensEstoque ?? 0} (${stats?.itensBaixos ?? 0} baixos)`, icon: Package, color: "text-accent" },
    { title: "A Receber", value: `R$ ${(stats?.aReceber ?? 0).toFixed(2)}`, icon: DollarSign, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Bem-vindo, {profile?.full_name || "Usuário"}!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white">Seus Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-400">
          <p><strong className="text-white">Nome:</strong> {profile?.full_name || "-"}</p>
          <p><strong className="text-white">E-mail:</strong> {profile?.email || "-"}</p>
          <p><strong className="text-white">Matrícula:</strong> {profile?.matricula || "-"}</p>
          <p><strong className="text-white">Funções:</strong> {roles.join(", ") || "Nenhuma"}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
