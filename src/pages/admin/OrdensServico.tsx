import { useState } from "react";
import { Play, CheckCircle, Search, Eye, ClipboardCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  aberta: "bg-blue-100 text-blue-700 border-blue-300",
  em_andamento: "bg-yellow-100 text-yellow-700 border-yellow-300",
  aguardando_supervisao: "bg-purple-100 text-purple-700 border-purple-300",
  supervisionada: "bg-emerald-100 text-emerald-700 border-emerald-300",
  concluida: "bg-green-100 text-green-700 border-green-300",
  cancelada: "bg-red-100 text-red-700 border-red-300",
};

const statusLabels: Record<string, string> = {
  aberta: "Aberta",
  em_andamento: "Em Andamento",
  aguardando_supervisao: "Aguardando Supervisão",
  supervisionada: "Supervisionada",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

const checklistItems = [
  { key: "checklist_materiais", label: "Materiais conferidos e instalados" },
  { key: "checklist_instalacao", label: "Instalação concluída conforme especificação" },
  { key: "checklist_teste", label: "Testes realizados e aprovados" },
  { key: "checklist_limpeza", label: "Local limpo e organizado" },
  { key: "checklist_fotos", label: "Fotos do serviço registradas" },
  { key: "checklist_assinatura_cliente", label: "Assinatura do cliente coletada" },
] as const;

const OrdensServico = () => {
  const { user, profile, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [viewOS, setViewOS] = useState<any>(null);
  const [selectedOS, setSelectedOS] = useState<any>(null);
  const [obs, setObs] = useState("");
  const canManage = hasRole("admin") || hasRole("gerente");
  const isTecnico = hasRole("tecnico");

  const { data: ordens = [], isLoading } = useQuery({
    queryKey: ["ordens_servico"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ordens_servico").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const activeOrder = isTecnico ? ordens.find((o) => o.tecnico_id === user?.id && (o.status === "em_andamento" || o.status === "aguardando_supervisao")) : null;

  const assignMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ordens_servico").update({
        tecnico_id: user!.id,
        tecnico_nome: profile?.full_name || "",
        status: "em_andamento",
        data_inicio: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens_servico"] });
      toast.success("Ordem atribuída com sucesso!");
      setViewOS(null);
    },
    onError: () => toast.error("Erro ao atribuir ordem"),
  });

  const checklistMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: boolean }) => {
      const { error } = await supabase.from("ordens_servico").update({ [field]: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens_servico"] });
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
      queryClient.invalidateQueries({ queryKey: ["ordens_servico"] });
      setSelectedOS(null);
      setObs("");
      toast.success("Supervisão solicitada!");
    },
    onError: () => toast.error("Erro ao solicitar supervisão"),
  });

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
      queryClient.invalidateQueries({ queryKey: ["ordens_servico"] });
      toast.success("Supervisão aprovada! Valor liberado para o técnico.");
    },
    onError: () => toast.error("Erro ao aprovar supervisão"),
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ordens_servico").update({ status: "cancelada" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens_servico"] });
      toast.success("Ordem cancelada!");
    },
    onError: () => toast.error("Erro ao cancelar ordem"),
  });

  const isChecklistComplete = (os: any) =>
    checklistItems.every((item) => os[item.key] === true);

  const filtered = ordens.filter((o) =>
    o.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
    o.servico_solicitado.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ordens de Serviço</h1>
        <p className="text-gray-500">Gerencie as ordens de serviço.</p>
        {isTecnico && activeOrder && (
          <p className="text-yellow-600 text-sm mt-1">⚠ Você já possui uma ordem em andamento. Conclua-a antes de selecionar outra.</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input placeholder="Buscar por cliente ou serviço..." className="max-w-sm bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-600">Cliente</TableHead>
                <TableHead className="text-gray-600">Serviço</TableHead>
                <TableHead className="text-gray-600">Local</TableHead>
                <TableHead className="text-gray-600">Técnico</TableHead>
                <TableHead className="text-gray-600">Status</TableHead>
                <TableHead className="text-gray-600">Criação</TableHead>
                <TableHead className="text-gray-600">Prazo</TableHead>
                <TableHead className="text-gray-600">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center text-gray-500">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-gray-500">Nenhuma ordem encontrada.</TableCell></TableRow>
              ) : filtered.map((os) => (
                <TableRow key={os.id} className="border-gray-200">
                  <TableCell className="text-gray-900 font-medium">{os.cliente_nome}</TableCell>
                  <TableCell className="text-gray-600">{os.servico_solicitado}</TableCell>
                  <TableCell className="text-gray-600">{os.cidade}</TableCell>
                  <TableCell className="text-gray-600">{os.tecnico_nome || "—"}</TableCell>
                  <TableCell><Badge className={statusColors[os.status] || "bg-gray-100 text-gray-700"}>{statusLabels[os.status] || os.status}</Badge></TableCell>
                  <TableCell className="text-gray-500 text-xs">{new Date(os.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="text-gray-500 text-xs">{os.prazo_termino ? new Date(os.prazo_termino + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewOS(os)}>
                        <Eye className="h-4 w-4 text-gray-500" />
                      </Button>
                      {canManage && os.status === "aguardando_supervisao" && (
                        <Button size="sm" variant="outline" className="gap-1 text-emerald-600 border-emerald-300" onClick={() => approveSupervisionMutation.mutate(os.id)}>
                          <ClipboardCheck className="h-3 w-3" /> Aprovar
                        </Button>
                      )}
                      {canManage && (os.status === "aberta" || os.status === "em_andamento") && (
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => cancelMutation.mutate(os.id)}>Cancelar</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View/Preview OS Dialog */}
      <Dialog open={!!viewOS} onOpenChange={() => setViewOS(null)}>
        <DialogContent className="bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-gray-900">Detalhes da Ordem de Serviço</DialogTitle></DialogHeader>
          {viewOS && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p className="text-gray-600"><strong className="text-gray-900">Cliente:</strong> {viewOS.cliente_nome}</p>
                <p className="text-gray-600"><strong className="text-gray-900">Serviço:</strong> {viewOS.servico_solicitado}</p>
                <p className="text-gray-600"><strong className="text-gray-900">Endereço:</strong> {viewOS.endereco}</p>
                <p className="text-gray-600"><strong className="text-gray-900">Cidade:</strong> {viewOS.cidade}</p>
                <p className="text-gray-600"><strong className="text-gray-900">Criação:</strong> {new Date(viewOS.created_at).toLocaleDateString("pt-BR")}</p>
                <p className="text-gray-600"><strong className="text-gray-900">Prazo:</strong> {viewOS.prazo_termino ? new Date(viewOS.prazo_termino + "T00:00:00").toLocaleDateString("pt-BR") : "Sem prazo"}</p>
                <p className="text-gray-600"><strong className="text-gray-900">Técnico:</strong> {viewOS.tecnico_nome || "Não atribuído"}</p>
                <p className="text-gray-600"><strong className="text-gray-900">Status:</strong> <Badge className={statusColors[viewOS.status] || ""}>{statusLabels[viewOS.status] || viewOS.status}</Badge></p>
                {!isTecnico && (
                  <>
                    <p className="text-gray-600"><strong className="text-gray-900">Valor Instalação:</strong> R$ {Number(viewOS.valor_instalacao || 0).toFixed(2)}</p>
                    <p className="text-gray-600"><strong className="text-gray-900">Código Rastreio:</strong> <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{viewOS.codigo_rastreio || "—"}</span></p>
                  </>
                )}
              </div>
              {viewOS.observacoes && (
                <p className="text-gray-600 text-sm"><strong className="text-gray-900">Observações:</strong> {viewOS.observacoes}</p>
              )}

              {/* Checklist for tecnico on active OS */}
              {isTecnico && viewOS.tecnico_id === user?.id && viewOS.status === "em_andamento" && (
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> Checklist de Finalização</h3>
                  {checklistItems.map((item) => (
                    <div key={item.key} className="flex items-center gap-3">
                      <Checkbox
                        checked={viewOS[item.key] || false}
                        onCheckedChange={(checked) => {
                          checklistMutation.mutate({ id: viewOS.id, field: item.key, value: !!checked });
                          setViewOS({ ...viewOS, [item.key]: !!checked });
                        }}
                      />
                      <label className="text-sm text-gray-700">{item.label}</label>
                    </div>
                  ))}
                  {isChecklistComplete(viewOS) && (
                    <Button
                      className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                      onClick={() => { setSelectedOS(viewOS); setViewOS(null); }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" /> Finalizar e Solicitar Supervisão
                    </Button>
                  )}
                </div>
              )}

              {/* Accept button for tecnico */}
              {isTecnico && viewOS.status === "aberta" && !activeOrder && (
                <Button className="w-full gap-2" onClick={() => assignMutation.mutate(viewOS.id)} disabled={assignMutation.isPending}>
                  <Play className="h-4 w-4" /> {assignMutation.isPending ? "Atribuindo..." : "Aceitar Ordem"}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Request Supervision Dialog */}
      <Dialog open={!!selectedOS} onOpenChange={() => setSelectedOS(null)}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader><DialogTitle className="text-gray-900">Finalizar e Solicitar Supervisão</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">Cliente: <strong className="text-gray-900">{selectedOS?.cliente_nome}</strong></p>
            <p className="text-gray-600 text-sm">Serviço: <strong className="text-gray-900">{selectedOS?.servico_solicitado}</strong></p>
            <div>
              <Label className="text-gray-600">Observações da conclusão</Label>
              <Textarea className="bg-white border-gray-300 text-gray-900" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Descreva o que foi realizado..." />
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => requestSupervisionMutation.mutate({ id: selectedOS.id, observacoes: obs })} disabled={requestSupervisionMutation.isPending}>
              {requestSupervisionMutation.isPending ? "Enviando..." : "Solicitar Supervisão"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdensServico;
