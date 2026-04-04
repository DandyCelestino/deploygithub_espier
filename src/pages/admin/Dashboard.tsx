import { ClipboardList, Package, FileText, DollarSign, CheckCircle, Clock, ClipboardCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const checklistItems = [
  { key: "checklist_materiais", label: "Materiais conferidos e instalados" },
  { key: "checklist_instalacao", label: "Instalação concluída conforme especificação" },
  { key: "checklist_teste", label: "Testes realizados e aprovados" },
  { key: "checklist_limpeza", label: "Local limpo e organizado" },
  { key: "checklist_fotos", label: "Fotos do serviço registradas" },
  { key: "checklist_assinatura_cliente", label: "Assinatura do cliente coletada" },
] as const;

const AdminDashboard = () => {
  const { user, profile, roles, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const isTecnico = hasRole("tecnico");
  const isGerente = hasRole("gerente") || hasRole("admin");
  const [finalizarOS, setFinalizarOS] = useState<any>(null);
  const [obs, setObs] = useState("");

  const approveSupervisionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ordens_servico").update({
        status: "concluida",
        supervisao_aprovada: true,
        supervisao_por: user!.id,
        supervisao_data: new Date().toISOString(),
        valor_liberado: true,
        data_conclusao: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard_stats"] });
      toast.success("Supervisão aprovada! Valor liberado para o técnico.");
    },
    onError: () => toast.error("Erro ao aprovar supervisão"),
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard_stats"],
    queryFn: async () => {
      const [ordensRes, orcRes, estoqueRes, finRes] = await Promise.all([
        supabase.from("ordens_servico").select("*"),
        supabase.from("orcamentos").select("id, status"),
        supabase.from("estoque_itens").select("id, quantidade, quantidade_minima"),
        supabase.from("financeiro_contas").select("id, tipo, valor, status"),
      ]);

      const ordens = ordensRes.data || [];
      const orc = orcRes.data || [];
      const estoque = estoqueRes.data || [];
      const fin = finRes.data || [];

      return {
        ordens,
        ordensAbertas: ordens.filter((o) => o.status === "aberta" || o.status === "em_andamento").length,
        orcPendentes: orc.filter((o) => o.status === "pendente").length,
        itensEstoque: estoque.length,
        itensBaixos: estoque.filter((i) => i.quantidade <= i.quantidade_minima).length,
        aReceber: fin.filter((f) => f.tipo === "receber" && f.status === "pendente").reduce((s, f) => s + Number(f.valor), 0),
      };
    },
  });

  const ordens = stats?.ordens || [];
  const minhasOrdens = isTecnico ? ordens.filter((o) => o.tecnico_id === user?.id) : [];
  const osAtiva = minhasOrdens.find((o) => o.status === "em_andamento" || o.status === "aguardando_supervisao");
  const osConcluidas = minhasOrdens.filter((o) => o.status === "concluida").length;
  const osEmAndamento = minhasOrdens.filter((o) => o.status === "em_andamento").length;
  const valorLiberado = minhasOrdens.filter((o) => o.valor_liberado).reduce((s, o) => s + Number(o.valor_instalacao || 0), 0);
  const valorPendente = minhasOrdens.filter((o) => (o.status === "em_andamento" || o.status === "aguardando_supervisao") && !o.valor_liberado).reduce((s, o) => s + Number(o.valor_instalacao || 0), 0);

  const isChecklistComplete = (os: any) =>
    checklistItems.every((item) => os[item.key] === true);

  const checklistMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: boolean }) => {
      const { error } = await supabase.from("ordens_servico").update({ [field]: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard_stats"] });
    },
    onError: () => toast.error("Erro ao atualizar checklist"),
  });

  const requestSupervisionMutation = useMutation({
    mutationFn: async ({ id, observacoes }: { id: string; observacoes: string }) => {
      const { error } = await supabase.from("ordens_servico").update({
        status: "aguardando_supervisao",
        observacoes,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard_stats"] });
      setFinalizarOS(null);
      setObs("");
      toast.success("Supervisão solicitada!");
    },
    onError: () => toast.error("Erro ao solicitar supervisão"),
  });

  // Technician dashboard
  if (isTecnico) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard do Técnico</h1>
          <p className="text-gray-500">Bem-vindo, {profile?.full_name || "Técnico"}!</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Em Andamento</CardTitle>
              <Clock className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-gray-900">{osEmAndamento}</p></CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Concluídas</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-gray-900">{osConcluidas}</p></CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Valor a Receber</CardTitle>
              <DollarSign className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-gray-900">R$ {valorPendente.toFixed(2)}</p></CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Valor Liberado</CardTitle>
              <DollarSign className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-green-600">{valorLiberado > 0 ? `R$ ${valorLiberado.toFixed(2)}` : "R$ 0,00"}</p></CardContent>
          </Card>
        </div>

        {/* Active OS with checklist */}
        {osAtiva ? (
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Ordem Ativa</CardTitle>
                <Badge className={osAtiva.status === "aguardando_supervisao" ? "bg-purple-100 text-purple-700" : "bg-yellow-100 text-yellow-700"}>
                  {osAtiva.status === "aguardando_supervisao" ? "Aguardando Supervisão" : "Em Andamento"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p className="text-gray-600"><strong className="text-gray-900">Cliente:</strong> {osAtiva.cliente_nome}</p>
                <p className="text-gray-600"><strong className="text-gray-900">Serviço:</strong> {osAtiva.servico_solicitado}</p>
                <p className="text-gray-600"><strong className="text-gray-900">Endereço:</strong> {osAtiva.endereco}</p>
                <p className="text-gray-600"><strong className="text-gray-900">Cidade:</strong> {osAtiva.cidade}</p>
                <p className="text-gray-600"><strong className="text-gray-900">Criação:</strong> {new Date(osAtiva.created_at).toLocaleDateString("pt-BR")}</p>
                <p className="text-gray-600"><strong className="text-gray-900">Prazo:</strong> {osAtiva.prazo_termino ? new Date(osAtiva.prazo_termino + "T00:00:00").toLocaleDateString("pt-BR") : "Sem prazo"}</p>
              </div>

              {osAtiva.status === "em_andamento" && (
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> Checklist de Finalização</h3>
                  {checklistItems.map((item) => (
                    <div key={item.key} className="flex items-center gap-3">
                      <Checkbox
                        checked={osAtiva[item.key] || false}
                        onCheckedChange={(checked) => {
                          checklistMutation.mutate({ id: osAtiva.id, field: item.key, value: !!checked });
                        }}
                      />
                      <label className="text-sm text-gray-700">{item.label}</label>
                    </div>
                  ))}
                  {isChecklistComplete(osAtiva) && (
                    <Button
                      className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                      onClick={() => { setFinalizarOS(osAtiva); setObs(""); }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" /> Finalizar e Solicitar Supervisão
                    </Button>
                  )}
                </div>
              )}

              {osAtiva.status === "aguardando_supervisao" && (
                <div className="border-t pt-4">
                  <p className="text-purple-600 text-sm font-medium">🔍 Sua ordem está aguardando supervisão do gerente. O valor será liberado após a aprovação.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white border-gray-200">
            <CardContent className="py-8 text-center">
              <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Nenhuma ordem ativa. Vá para Ordens de Serviço para selecionar uma.</p>
            </CardContent>
          </Card>
        )}

        {/* Recent completed orders */}
        {minhasOrdens.filter((o) => o.status === "concluida").length > 0 && (
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Últimas Ordens Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {minhasOrdens.filter((o) => o.status === "concluida").slice(0, 5).map((os) => (
                  <div key={os.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{os.cliente_nome}</p>
                      <p className="text-xs text-gray-500">{os.servico_solicitado}</p>
                    </div>
                    <div className="text-right">
                      {os.valor_liberado ? (
                        <span className="text-green-600 text-sm font-medium">R$ {Number(os.valor_instalacao || 0).toFixed(2)} ✓</span>
                      ) : (
                        <span className="text-yellow-600 text-sm">Aguardando liberação</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Finalize Dialog */}
        <Dialog open={!!finalizarOS} onOpenChange={() => setFinalizarOS(null)}>
          <DialogContent className="bg-white border-gray-200">
            <DialogHeader><DialogTitle className="text-gray-900">Finalizar e Solicitar Supervisão</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">Cliente: <strong className="text-gray-900">{finalizarOS?.cliente_nome}</strong></p>
              <div>
                <Label className="text-gray-600">Observações da conclusão</Label>
                <Textarea className="bg-white border-gray-300 text-gray-900" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Descreva o que foi realizado..." />
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => requestSupervisionMutation.mutate({ id: finalizarOS.id, observacoes: obs })} disabled={requestSupervisionMutation.isPending}>
                {requestSupervisionMutation.isPending ? "Enviando..." : "Solicitar Supervisão"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="bg-white border-gray-200">
          <CardHeader><CardTitle className="text-gray-900">Seus Dados</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-500">
            <p><strong className="text-gray-900">Nome:</strong> {profile?.full_name || "-"}</p>
            <p><strong className="text-gray-900">E-mail:</strong> {profile?.email || "-"}</p>
            <p><strong className="text-gray-900">Matrícula:</strong> {profile?.matricula || "-"}</p>
            <p><strong className="text-gray-900">Funções:</strong> {roles.join(", ") || "Nenhuma"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ordensAguardandoSupervisao = ordens.filter((o) => o.status === "aguardando_supervisao");
  const ordensConcluidas = ordens.filter((o) => o.status === "concluida");

  // Admin/Gerente/Financeiro dashboard
  const cards = [
    { title: "Ordens Abertas", value: stats?.ordensAbertas ?? 0, icon: ClipboardList, color: "text-primary" },
    { title: "Orçamentos Pendentes", value: stats?.orcPendentes ?? 0, icon: FileText, color: "text-yellow-500" },
    { title: "Itens em Estoque", value: `${stats?.itensEstoque ?? 0} (${stats?.itensBaixos ?? 0} baixos)`, icon: Package, color: "text-accent" },
    { title: "A Receber", value: `R$ ${(stats?.aReceber ?? 0).toFixed(2)}`, icon: DollarSign, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Bem-vindo, {profile?.full_name || "Usuário"}!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((stat) => (
          <Card key={stat.title} className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gerente: Ordens aguardando supervisão */}
      {isGerente && ordensAguardandoSupervisao.length > 0 && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-purple-500" /> Ordens Aguardando Supervisão ({ordensAguardandoSupervisao.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ordensAguardandoSupervisao.map((os) => (
              <div key={os.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">{os.cliente_nome}</p>
                  <p className="text-xs text-gray-500">{os.servico_solicitado}</p>
                  <p className="text-xs text-gray-500">Técnico: {os.tecnico_nome || "—"}</p>
                  {os.observacoes && <p className="text-xs text-gray-600 italic">"{os.observacoes}"</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-medium text-gray-900">R$ {Number(os.valor_instalacao || 0).toFixed(2)}</span>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white gap-1"
                    onClick={() => approveSupervisionMutation.mutate(os.id)}
                    disabled={approveSupervisionMutation.isPending}
                  >
                    <CheckCircle className="h-3 w-3" /> Liberar Pagamento
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Gerente: Ordens concluídas recentes */}
      {isGerente && ordensConcluidas.length > 0 && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" /> Ordens Concluídas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ordensConcluidas.slice(0, 5).map((os) => (
              <div key={os.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{os.cliente_nome}</p>
                  <p className="text-xs text-gray-500">{os.servico_solicitado} — {os.tecnico_nome || "—"}</p>
                </div>
                <div className="text-right">
                  <span className="text-green-600 text-sm font-medium">R$ {Number(os.valor_instalacao || 0).toFixed(2)} ✓</span>
                  {os.data_conclusao && <p className="text-xs text-gray-400">{new Date(os.data_conclusao).toLocaleDateString("pt-BR")}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="bg-white border-gray-200">
        <CardHeader><CardTitle className="text-gray-900">Seus Dados</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-500">
          <p><strong className="text-gray-900">Nome:</strong> {profile?.full_name || "-"}</p>
          <p><strong className="text-gray-900">E-mail:</strong> {profile?.email || "-"}</p>
          <p><strong className="text-gray-900">Matrícula:</strong> {profile?.matricula || "-"}</p>
          <p><strong className="text-gray-900">Funções:</strong> {roles.join(", ") || "Nenhuma"}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
