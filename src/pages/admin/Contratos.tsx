import { useState } from "react";
import { FileText, Plus, Search, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  em_negociacao: "bg-yellow-100 text-yellow-700 border-yellow-300",
  fechado: "bg-green-100 text-green-700 border-green-300",
  cancelado: "bg-red-100 text-red-700 border-red-300",
};

const statusLabels: Record<string, string> = {
  em_negociacao: "Em Negociação",
  fechado: "Fechado",
  cancelado: "Cancelado",
};

const Contratos = () => {
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const canManage = hasRole("admin") || hasRole("gerente");
  const isVendedor = hasRole("vendedor");

  const [form, setForm] = useState({ client_id: "", total_value: "", commission_value: "" });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: contratos = [], isLoading } = useQuery({
    queryKey: ["contratos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contratos").select("*, clientes(name, email, phone)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("contratos").insert({
        client_id: form.client_id,
        vendedor_id: user!.id,
        total_value: parseFloat(form.total_value) || 0,
        commission_value: parseFloat(form.commission_value) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      toast.success("Contrato criado!");
      setOpen(false);
      setForm({ client_id: "", total_value: "", commission_value: "" });
    },
    onError: () => toast.error("Erro ao criar contrato"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("contratos").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Status atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const filtered = contratos.filter((c: any) =>
    (c.clientes?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
          <p className="text-gray-500">Gerencie contratos de vendas.</p>
        </div>
        {(canManage || isVendedor) && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Contrato</Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-200">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Novo Contrato</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-600">Cliente *</Label>
                  <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900"><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {clientes.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-gray-600">Valor Total (R$) *</Label><Input type="number" className="bg-white border-gray-300 text-gray-900" value={form.total_value} onChange={(e) => setForm({ ...form, total_value: e.target.value })} /></div>
                <div><Label className="text-gray-600">Comissão (R$)</Label><Input type="number" className="bg-white border-gray-300 text-gray-900" value={form.commission_value} onChange={(e) => setForm({ ...form, commission_value: e.target.value })} /></div>
                <Button className="w-full" onClick={() => createMutation.mutate()} disabled={!form.client_id || !form.total_value || createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Contrato"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input placeholder="Buscar por cliente..." className="max-w-sm bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-600">Cliente</TableHead>
                <TableHead className="text-gray-600">Valor</TableHead>
                <TableHead className="text-gray-600">Comissão</TableHead>
                <TableHead className="text-gray-600">Status</TableHead>
                <TableHead className="text-gray-600">Data</TableHead>
                <TableHead className="text-gray-600">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-500">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-500">Nenhum contrato encontrado.</TableCell></TableRow>
              ) : filtered.map((c: any) => (
                <TableRow key={c.id} className="border-gray-200">
                  <TableCell className="text-gray-900 font-medium">{c.clientes?.name || "-"}</TableCell>
                  <TableCell className="text-gray-900">R$ {Number(c.total_value).toFixed(2)}</TableCell>
                  <TableCell className="text-gray-600">R$ {Number(c.commission_value).toFixed(2)}</TableCell>
                  <TableCell><Badge className={statusColors[c.status]}>{statusLabels[c.status]}</Badge></TableCell>
                  <TableCell className="text-gray-500 text-xs">{new Date(c.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewItem(c)}><Eye className="h-4 w-4 text-gray-500" /></Button>
                      {c.status === "em_negociacao" && (canManage || isVendedor) && (
                        <>
                          <Button size="sm" variant="outline" className="text-green-600 border-green-300 text-xs" onClick={() => updateStatusMutation.mutate({ id: c.id, status: "fechado" })}>Fechar</Button>
                          <Button size="sm" variant="outline" className="text-red-500 border-red-300 text-xs" onClick={() => updateStatusMutation.mutate({ id: c.id, status: "cancelado" })}>Cancelar</Button>
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

      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader><DialogTitle className="text-gray-900">Detalhes do Contrato</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <p className="text-gray-600"><strong className="text-gray-900">Cliente:</strong> {viewItem.clientes?.name}</p>
              <p className="text-gray-600"><strong className="text-gray-900">E-mail:</strong> {viewItem.clientes?.email || "-"}</p>
              <p className="text-gray-600"><strong className="text-gray-900">Telefone:</strong> {viewItem.clientes?.phone || "-"}</p>
              <p className="text-gray-600"><strong className="text-gray-900">Valor Total:</strong> R$ {Number(viewItem.total_value).toFixed(2)}</p>
              <p className="text-gray-600"><strong className="text-gray-900">Comissão:</strong> R$ {Number(viewItem.commission_value).toFixed(2)}</p>
              <p className="text-gray-600"><strong className="text-gray-900">Status:</strong> <Badge className={statusColors[viewItem.status]}>{statusLabels[viewItem.status]}</Badge></p>
              <p className="text-gray-600"><strong className="text-gray-900">Criado em:</strong> {new Date(viewItem.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contratos;
