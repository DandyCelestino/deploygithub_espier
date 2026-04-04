import { useState } from "react";
import { ClipboardList, Play, CheckCircle, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  aberta: "bg-blue-100 text-blue-700 border-blue-300",
  em_andamento: "bg-yellow-100 text-yellow-700 border-yellow-300",
  concluida: "bg-green-100 text-green-700 border-green-300",
  cancelada: "bg-red-100 text-red-700 border-red-300",
};

const statusLabels: Record<string, string> = {
  aberta: "Aberta",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

const OrdensServico = () => {
  const { user, profile, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
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

  const activeOrder = isTecnico ? ordens.find((o) => o.tecnico_id === user?.id && (o.status === "em_andamento")) : null;

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
    },
    onError: () => toast.error("Erro ao atribuir ordem"),
  });

  const completeMutation = useMutation({
    mutationFn: async ({ id, observacoes }: { id: string; observacoes: string }) => {
      const { error } = await supabase.from("ordens_servico").update({
        status: "concluida",
        data_conclusao: new Date().toISOString(),
        observacoes,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens_servico"] });
      setSelectedOS(null);
      setObs("");
      toast.success("Ordem concluída!");
    },
    onError: () => toast.error("Erro ao concluir ordem"),
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

  const filtered = ordens.filter((o) =>
    o.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
    o.servico_solicitado.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ordens de Serviço</h1>
        <p className="text-gray-500">Gerencie as ordens de serviço atribuídas a técnicos.</p>
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
                <TableHead className="text-gray-600">Data</TableHead>
                <TableHead className="text-gray-600">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center text-gray-500">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-gray-500">Nenhuma ordem de serviço encontrada.</TableCell></TableRow>
              ) : filtered.map((os) => (
                <TableRow key={os.id} className="border-gray-200">
                  <TableCell className="text-gray-900 font-medium">{os.cliente_nome}</TableCell>
                  <TableCell className="text-gray-600">{os.servico_solicitado}</TableCell>
                  <TableCell className="text-gray-600">{os.cidade}</TableCell>
                  <TableCell className="text-gray-600">{os.tecnico_nome || "—"}</TableCell>
                  <TableCell><Badge className={statusColors[os.status]}>{statusLabels[os.status]}</Badge></TableCell>
                  <TableCell className="text-gray-500 text-xs">{new Date(os.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {isTecnico && os.status === "aberta" && !activeOrder && (
                        <Button size="sm" variant="outline" className="gap-1 text-blue-600 border-blue-300" onClick={() => assignMutation.mutate(os.id)}>
                          <Play className="h-3 w-3" /> Selecionar
                        </Button>
                      )}
                      {isTecnico && os.status === "em_andamento" && os.tecnico_id === user?.id && (
                        <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-300" onClick={() => setSelectedOS(os)}>
                          <CheckCircle className="h-3 w-3" /> Concluir
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

      <Dialog open={!!selectedOS} onOpenChange={() => setSelectedOS(null)}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader><DialogTitle className="text-gray-900">Concluir Ordem de Serviço</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">Cliente: <strong className="text-gray-900">{selectedOS?.cliente_nome}</strong></p>
            <p className="text-gray-600 text-sm">Serviço: <strong className="text-gray-900">{selectedOS?.servico_solicitado}</strong></p>
            <div>
              <Label className="text-gray-600">Observações da conclusão</Label>
              <Textarea className="bg-white border-gray-300 text-gray-900" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Descreva o que foi realizado..." />
            </div>
            <Button className="w-full" onClick={() => completeMutation.mutate({ id: selectedOS.id, observacoes: obs })} disabled={completeMutation.isPending}>
              {completeMutation.isPending ? "Salvando..." : "Confirmar Conclusão"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdensServico;
