import { useState } from "react";
import { DollarSign, Plus, Search, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-700 border-yellow-300",
  pago: "bg-green-100 text-green-700 border-green-300",
  vencido: "bg-red-100 text-red-700 border-red-300",
  cancelado: "bg-gray-100 text-gray-600 border-gray-300",
};

const Financeiro = () => {
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const canManage = hasRole("admin") || hasRole("gerente") || hasRole("financeiro");

  const [form, setForm] = useState({
    tipo: "receber" as string,
    descricao: "",
    valor: "",
    data_vencimento: "",
    categoria: "",
  });

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ["financeiro_contas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("financeiro_contas").select("*").order("data_vencimento", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("financeiro_contas").insert({
        tipo: form.tipo,
        descricao: form.descricao,
        valor: parseFloat(form.valor) || 0,
        data_vencimento: form.data_vencimento,
        categoria: form.categoria || null,
        criado_por: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financeiro_contas"] });
      toast.success("Conta cadastrada!");
      setOpen(false);
      setForm({ tipo: "receber", descricao: "", valor: "", data_vencimento: "", categoria: "" });
    },
    onError: () => toast.error("Erro ao cadastrar conta"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: any = { status };
      if (status === "pago") updateData.data_pagamento = new Date().toISOString().split("T")[0];
      const { error } = await supabase.from("financeiro_contas").update(updateData).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financeiro_contas"] });
      toast.success("Status atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar"),
  });

  const contasReceber = contas.filter((c) => c.tipo === "receber");
  const contasPagar = contas.filter((c) => c.tipo === "pagar");

  const totalReceber = contasReceber.filter((c) => c.status === "pendente").reduce((sum, c) => sum + Number(c.valor), 0);
  const totalPagar = contasPagar.filter((c) => c.status === "pendente").reduce((sum, c) => sum + Number(c.valor), 0);
  const totalRecebido = contasReceber.filter((c) => c.status === "pago").reduce((sum, c) => sum + Number(c.valor), 0);
  const totalPagoVal = contasPagar.filter((c) => c.status === "pago").reduce((sum, c) => sum + Number(c.valor), 0);

  const renderTable = (items: typeof contas) => {
    const filtered = items.filter((c) => c.descricao.toLowerCase().includes(search.toLowerCase()));
    return (
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200">
            <TableHead className="text-gray-600">Descrição</TableHead>
            <TableHead className="text-gray-600">Categoria</TableHead>
            <TableHead className="text-gray-600">Valor</TableHead>
            <TableHead className="text-gray-600">Vencimento</TableHead>
            <TableHead className="text-gray-600">Pagamento</TableHead>
            <TableHead className="text-gray-600">Status</TableHead>
            {canManage && <TableHead className="text-gray-600">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="text-center text-gray-500">Nenhuma conta encontrada.</TableCell></TableRow>
          ) : filtered.map((conta) => (
            <TableRow key={conta.id} className="border-gray-200">
              <TableCell className="text-gray-900 font-medium">{conta.descricao}</TableCell>
              <TableCell className="text-gray-600">{conta.categoria || "—"}</TableCell>
              <TableCell className="text-gray-900">R$ {Number(conta.valor).toFixed(2)}</TableCell>
              <TableCell className="text-gray-600">{new Date(conta.data_vencimento + "T12:00:00").toLocaleDateString("pt-BR")}</TableCell>
              <TableCell className="text-gray-600">{conta.data_pagamento ? new Date(conta.data_pagamento + "T12:00:00").toLocaleDateString("pt-BR") : "—"}</TableCell>
              <TableCell><Badge className={statusColors[conta.status]}>{conta.status.charAt(0).toUpperCase() + conta.status.slice(1)}</Badge></TableCell>
              {canManage && (
                <TableCell>
                  <div className="flex gap-1">
                    {conta.status === "pendente" && (
                      <>
                        <Button size="sm" variant="outline" className="text-green-600 border-green-300 text-xs" onClick={() => updateStatusMutation.mutate({ id: conta.id, status: "pago" })}>Pagar</Button>
                        <Button size="sm" variant="ghost" className="text-red-500 text-xs" onClick={() => updateStatusMutation.mutate({ id: conta.id, status: "cancelado" })}>Cancelar</Button>
                      </>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-500">Contas a pagar, receber e fluxo de caixa.</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Nova Conta</Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-200">
              <DialogHeader><DialogTitle className="text-gray-900">Nova Conta</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-600">Tipo *</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receber">A Receber</SelectItem>
                      <SelectItem value="pagar">A Pagar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-gray-600">Descrição *</Label><Input className="bg-white border-gray-300 text-gray-900" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-gray-600">Valor (R$) *</Label><Input type="number" className="bg-white border-gray-300 text-gray-900" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} /></div>
                  <div><Label className="text-gray-600">Vencimento *</Label><Input type="date" className="bg-white border-gray-300 text-gray-900" value={form.data_vencimento} onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })} /></div>
                </div>
                <div><Label className="text-gray-600">Categoria</Label><Input className="bg-white border-gray-300 text-gray-900" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} /></div>
                <Button className="w-full" onClick={() => createMutation.mutate()} disabled={!form.descricao || !form.valor || !form.data_vencimento || createMutation.isPending}>
                  {createMutation.isPending ? "Salvando..." : "Cadastrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">A Receber</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-gray-900">R$ {totalReceber.toFixed(2)}</p></CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">A Pagar</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-gray-900">R$ {totalPagar.toFixed(2)}</p></CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Recebido</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">R$ {totalRecebido.toFixed(2)}</p></CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Saldo</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><p className={`text-2xl font-bold ${(totalRecebido - totalPagoVal) >= 0 ? "text-green-600" : "text-red-500"}`}>R$ {(totalRecebido - totalPagoVal).toFixed(2)}</p></CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input placeholder="Buscar conta..." className="max-w-sm bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs defaultValue="receber" className="w-full">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="receber" className="text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100">A Receber</TabsTrigger>
          <TabsTrigger value="pagar" className="text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100">A Pagar</TabsTrigger>
        </TabsList>
        <TabsContent value="receber" className="mt-4">
          <Card className="bg-white border-gray-200"><CardContent className="p-0">{renderTable(contasReceber)}</CardContent></Card>
        </TabsContent>
        <TabsContent value="pagar" className="mt-4">
          <Card className="bg-white border-gray-200"><CardContent className="p-0">{renderTable(contasPagar)}</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financeiro;
