import { useState } from "react";
import { FileText, Plus, Search, Eye, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  aprovado: "bg-green-500/20 text-green-400 border-green-500/30",
  rejeitado: "bg-red-500/20 text-red-400 border-red-500/30",
  finalizado: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  finalizado: "Finalizado",
};

const Orcamentos = () => {
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const canManage = hasRole("admin") || hasRole("gerente");

  const [form, setForm] = useState({
    cliente_nome: "", cliente_telefone: "", cliente_email: "",
    endereco: "", cidade: "", estado: "SP",
    servico_solicitado: "", descricao: "", valor_total: "",
  });

  const { data: orcamentos = [], isLoading } = useQuery({
    queryKey: ["orcamentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orcamentos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("orcamentos").insert({
        ...form,
        valor_total: parseFloat(form.valor_total) || 0,
        criado_por: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Orçamento criado com sucesso!");
      setOpen(false);
      setForm({ cliente_nome: "", cliente_telefone: "", cliente_email: "", endereco: "", cidade: "", estado: "SP", servico_solicitado: "", descricao: "", valor_total: "" });
    },
    onError: () => toast.error("Erro ao criar orçamento"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orcamentos").update({ status }).eq("id", id);
      if (error) throw error;
      // If approved, create service order
      if (status === "aprovado") {
        const orc = orcamentos.find((o) => o.id === id);
        if (orc) {
          const { error: osError } = await supabase.from("ordens_servico").insert({
            orcamento_id: id,
            cliente_nome: orc.cliente_nome,
            endereco: orc.endereco,
            cidade: orc.cidade,
            servico_solicitado: orc.servico_solicitado,
          });
          if (osError) throw osError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      queryClient.invalidateQueries({ queryKey: ["ordens_servico"] });
      toast.success("Status atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const filtered = orcamentos.filter((o) =>
    o.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
    o.servico_solicitado.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orçamentos</h1>
          <p className="text-gray-400">Crie e gerencie orçamentos para clientes.</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Orçamento</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Novo Orçamento</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label className="text-gray-300">Nome do Cliente *</Label><Input className="bg-background border-border text-white" value={form.cliente_nome} onChange={(e) => setForm({ ...form, cliente_nome: e.target.value })} /></div>
                <div><Label className="text-gray-300">Telefone</Label><Input className="bg-background border-border text-white" value={form.cliente_telefone} onChange={(e) => setForm({ ...form, cliente_telefone: e.target.value })} /></div>
                <div><Label className="text-gray-300">E-mail</Label><Input className="bg-background border-border text-white" value={form.cliente_email} onChange={(e) => setForm({ ...form, cliente_email: e.target.value })} /></div>
                <div><Label className="text-gray-300">Endereço *</Label><Input className="bg-background border-border text-white" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} /></div>
                <div><Label className="text-gray-300">Cidade *</Label><Input className="bg-background border-border text-white" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></div>
                <div><Label className="text-gray-300">Estado</Label><Input className="bg-background border-border text-white" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} /></div>
                <div className="md:col-span-2"><Label className="text-gray-300">Serviço Solicitado *</Label><Input className="bg-background border-border text-white" value={form.servico_solicitado} onChange={(e) => setForm({ ...form, servico_solicitado: e.target.value })} /></div>
                <div className="md:col-span-2"><Label className="text-gray-300">Descrição</Label><Textarea className="bg-background border-border text-white" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
                <div><Label className="text-gray-300">Valor Total (R$)</Label><Input type="number" className="bg-background border-border text-white" value={form.valor_total} onChange={(e) => setForm({ ...form, valor_total: e.target.value })} /></div>
              </div>
              <Button className="w-full mt-4" onClick={() => createMutation.mutate()} disabled={!form.cliente_nome || !form.endereco || !form.cidade || !form.servico_solicitado || createMutation.isPending}>
                {createMutation.isPending ? "Salvando..." : "Salvar Orçamento"}
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input placeholder="Buscar por cliente ou serviço..." className="max-w-sm bg-background border-border text-white placeholder:text-gray-500" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-gray-300">Cliente</TableHead>
                <TableHead className="text-gray-300">Serviço</TableHead>
                <TableHead className="text-gray-300">Cidade</TableHead>
                <TableHead className="text-gray-300">Valor</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Data</TableHead>
                <TableHead className="text-gray-300">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center text-gray-400">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-gray-400">Nenhum orçamento encontrado.</TableCell></TableRow>
              ) : filtered.map((orc) => (
                <TableRow key={orc.id} className="border-border">
                  <TableCell className="text-white font-medium">{orc.cliente_nome}</TableCell>
                  <TableCell className="text-gray-300">{orc.servico_solicitado}</TableCell>
                  <TableCell className="text-gray-300">{orc.cidade}/{orc.estado}</TableCell>
                  <TableCell className="text-white">R$ {Number(orc.valor_total).toFixed(2)}</TableCell>
                  <TableCell><Badge className={statusColors[orc.status]}>{statusLabels[orc.status]}</Badge></TableCell>
                  <TableCell className="text-gray-400 text-xs">{new Date(orc.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewItem(orc)}><Eye className="h-4 w-4 text-gray-400" /></Button>
                      {canManage && orc.status === "pendente" && (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => updateStatusMutation.mutate({ id: orc.id, status: "aprovado" })}><CheckCircle className="h-4 w-4 text-green-400" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => updateStatusMutation.mutate({ id: orc.id, status: "rejeitado" })}><XCircle className="h-4 w-4 text-red-400" /></Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-white">Detalhes do Orçamento</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <p className="text-gray-300"><strong className="text-white">Cliente:</strong> {viewItem.cliente_nome}</p>
              <p className="text-gray-300"><strong className="text-white">Telefone:</strong> {viewItem.cliente_telefone || "-"}</p>
              <p className="text-gray-300"><strong className="text-white">E-mail:</strong> {viewItem.cliente_email || "-"}</p>
              <p className="text-gray-300"><strong className="text-white">Endereço:</strong> {viewItem.endereco}</p>
              <p className="text-gray-300"><strong className="text-white">Cidade:</strong> {viewItem.cidade}/{viewItem.estado}</p>
              <p className="text-gray-300"><strong className="text-white">Serviço:</strong> {viewItem.servico_solicitado}</p>
              <p className="text-gray-300"><strong className="text-white">Descrição:</strong> {viewItem.descricao || "-"}</p>
              <p className="text-gray-300"><strong className="text-white">Valor:</strong> R$ {Number(viewItem.valor_total).toFixed(2)}</p>
              <p className="text-gray-300"><strong className="text-white">Status:</strong> <Badge className={statusColors[viewItem.status]}>{statusLabels[viewItem.status]}</Badge></p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orcamentos;
