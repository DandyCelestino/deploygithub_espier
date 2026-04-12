import { DollarSign, FileText, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

const DashboardVendedor = () => {
  const { user } = useAuth();

  const { data: contratos = [] } = useQuery({
    queryKey: ["vendedor_contratos", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select("*, clientes(name)")
        .eq("vendedor_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const totalContratos = contratos.length;
  const fechados = contratos.filter((c: any) => c.status === "fechado").length;
  const emNegociacao = contratos.filter((c: any) => c.status === "em_negociacao").length;
  const totalVendido = contratos.filter((c: any) => c.status === "fechado").reduce((s: number, c: any) => s + Number(c.total_value || 0), 0);
  const totalComissao = contratos.filter((c: any) => c.status === "fechado").reduce((s: number, c: any) => s + Number(c.commission_value || 0), 0);

  const stats = [
    { title: "Total de Contratos", value: totalContratos, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Em Negociação", value: emNegociacao, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { title: "Fechados", value: fechados, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { title: "Total Vendido", value: `R$ ${totalVendido.toFixed(2)}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    { title: "Comissão Total", value: `R$ ${totalComissao.toFixed(2)}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard do Vendedor</h1>
        <p className="text-gray-500">Acompanhe suas vendas e comissões.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.title} className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{s.title}</p>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Contratos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {contratos.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Nenhum contrato encontrado.</p>
          ) : (
            <div className="space-y-3">
              {contratos.slice(0, 10).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.clientes?.name || "Cliente"}</p>
                    <p className="text-xs text-gray-500">R$ {Number(c.total_value).toFixed(2)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    c.status === "fechado" ? "bg-green-100 text-green-700" :
                    c.status === "cancelado" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {c.status === "fechado" ? "Fechado" : c.status === "cancelado" ? "Cancelado" : "Em Negociação"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardVendedor;
