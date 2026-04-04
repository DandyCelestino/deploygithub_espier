import { useState } from "react";
import { Package, Plus, Search, ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Estoque = () => {
  const { user, profile, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [openItem, setOpenItem] = useState(false);
  const [openMov, setOpenMov] = useState(false);
  const [movType, setMovType] = useState<"entrada" | "saida">("entrada");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const canManage = hasRole("admin") || hasRole("gerente");

  const [formItem, setFormItem] = useState({ descricao: "", codigo: "", unidade: "un", quantidade: "0", quantidade_minima: "0", localizacao: "" });
  const [formMov, setFormMov] = useState({ quantidade: "", observacao: "" });

  const { data: itens = [], isLoading } = useQuery({
    queryKey: ["estoque_itens"],
    queryFn: async () => {
      const { data, error } = await supabase.from("estoque_itens").select("*").order("descricao");
      if (error) throw error;
      return data;
    },
  });

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ["estoque_movimentacoes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("estoque_movimentacoes").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("estoque_itens").insert({
        descricao: formItem.descricao,
        codigo: formItem.codigo || null,
        unidade: formItem.unidade,
        quantidade: parseInt(formItem.quantidade) || 0,
        quantidade_minima: parseInt(formItem.quantidade_minima) || 0,
        localizacao: formItem.localizacao || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estoque_itens"] });
      toast.success("Item cadastrado!");
      setOpenItem(false);
      setFormItem({ descricao: "", codigo: "", unidade: "un", quantidade: "0", quantidade_minima: "0", localizacao: "" });
    },
    onError: () => toast.error("Erro ao cadastrar item"),
  });

  const movMutation = useMutation({
    mutationFn: async () => {
      const qty = parseInt(formMov.quantidade);
      if (!qty || qty <= 0) throw new Error("Quantidade inválida");

      // Insert movement
      const { error } = await supabase.from("estoque_movimentacoes").insert({
        item_id: selectedItem.id,
        tipo: movType,
        quantidade: qty,
        tecnico_id: user!.id,
        tecnico_nome: profile?.full_name || "",
        observacao: formMov.observacao || null,
      });
      if (error) throw error;

      // Update stock quantity
      const newQty = movType === "entrada" ? selectedItem.quantidade + qty : selectedItem.quantidade - qty;
      const { error: updateError } = await supabase.from("estoque_itens").update({ quantidade: Math.max(0, newQty) }).eq("id", selectedItem.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estoque_itens"] });
      queryClient.invalidateQueries({ queryKey: ["estoque_movimentacoes"] });
      toast.success(movType === "entrada" ? "Entrada registrada!" : "Saída registrada!");
      setOpenMov(false);
      setFormMov({ quantidade: "", observacao: "" });
      setSelectedItem(null);
    },
    onError: (e: any) => toast.error(e.message || "Erro ao registrar movimentação"),
  });

  const filtered = itens.filter((i) =>
    i.descricao.toLowerCase().includes(search.toLowerCase()) ||
    (i.codigo && i.codigo.toLowerCase().includes(search.toLowerCase()))
  );

  const getItemName = (itemId: string) => itens.find((i) => i.id === itemId)?.descricao || "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Estoque</h1>
          <p className="text-gray-400">Controle de materiais, entradas e saídas.</p>
        </div>
        {canManage && (
          <Dialog open={openItem} onOpenChange={setOpenItem}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Item</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle className="text-white">Cadastrar Item</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label className="text-gray-300">Descrição *</Label><Input className="bg-background border-border text-white" value={formItem.descricao} onChange={(e) => setFormItem({ ...formItem, descricao: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-gray-300">Código</Label><Input className="bg-background border-border text-white" value={formItem.codigo} onChange={(e) => setFormItem({ ...formItem, codigo: e.target.value })} /></div>
                  <div><Label className="text-gray-300">Unidade</Label><Input className="bg-background border-border text-white" value={formItem.unidade} onChange={(e) => setFormItem({ ...formItem, unidade: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-gray-300">Qtd. Inicial</Label><Input type="number" className="bg-background border-border text-white" value={formItem.quantidade} onChange={(e) => setFormItem({ ...formItem, quantidade: e.target.value })} /></div>
                  <div><Label className="text-gray-300">Qtd. Mínima</Label><Input type="number" className="bg-background border-border text-white" value={formItem.quantidade_minima} onChange={(e) => setFormItem({ ...formItem, quantidade_minima: e.target.value })} /></div>
                </div>
                <div><Label className="text-gray-300">Localização</Label><Input className="bg-background border-border text-white" value={formItem.localizacao} onChange={(e) => setFormItem({ ...formItem, localizacao: e.target.value })} /></div>
                <Button className="w-full" onClick={() => createItemMutation.mutate()} disabled={!formItem.descricao || createItemMutation.isPending}>
                  {createItemMutation.isPending ? "Salvando..." : "Cadastrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="itens" className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="itens" className="text-gray-300 data-[state=active]:text-white">Itens em Estoque</TabsTrigger>
          <TabsTrigger value="movimentacoes" className="text-gray-300 data-[state=active]:text-white">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="itens" className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input placeholder="Buscar item..." className="max-w-sm bg-background border-border text-white placeholder:text-gray-500" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-gray-300">Código</TableHead>
                    <TableHead className="text-gray-300">Descrição</TableHead>
                    <TableHead className="text-gray-300">Qtd.</TableHead>
                    <TableHead className="text-gray-300">Unidade</TableHead>
                    <TableHead className="text-gray-300">Mín.</TableHead>
                    <TableHead className="text-gray-300">Local</TableHead>
                    <TableHead className="text-gray-300">Cadastro</TableHead>
                    <TableHead className="text-gray-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-gray-400">Carregando...</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-gray-400">Nenhum item encontrado.</TableCell></TableRow>
                  ) : filtered.map((item) => (
                    <TableRow key={item.id} className="border-border">
                      <TableCell className="text-gray-300 font-mono text-xs">{item.codigo || "—"}</TableCell>
                      <TableCell className="text-white font-medium">{item.descricao}</TableCell>
                      <TableCell>
                        <span className={item.quantidade <= item.quantidade_minima ? "text-red-400 font-bold" : "text-white"}>
                          {item.quantidade}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-300">{item.unidade}</TableCell>
                      <TableCell className="text-gray-400">{item.quantidade_minima}</TableCell>
                      <TableCell className="text-gray-300">{item.localizacao || "—"}</TableCell>
                      <TableCell className="text-gray-400 text-xs">{new Date(item.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {canManage && (
                            <Button size="icon" variant="ghost" onClick={() => { setSelectedItem(item); setMovType("entrada"); setOpenMov(true); }}>
                              <ArrowDown className="h-4 w-4 text-green-400" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" onClick={() => { setSelectedItem(item); setMovType("saida"); setOpenMov(true); }}>
                            <ArrowUp className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimentacoes" className="mt-4">
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-gray-300">Data</TableHead>
                    <TableHead className="text-gray-300">Tipo</TableHead>
                    <TableHead className="text-gray-300">Item</TableHead>
                    <TableHead className="text-gray-300">Qtd.</TableHead>
                    <TableHead className="text-gray-300">Técnico</TableHead>
                    <TableHead className="text-gray-300">Obs.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentacoes.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-gray-400">Nenhuma movimentação registrada.</TableCell></TableRow>
                  ) : movimentacoes.map((mov) => (
                    <TableRow key={mov.id} className="border-border">
                      <TableCell className="text-gray-400 text-xs">{new Date(mov.created_at).toLocaleString("pt-BR")}</TableCell>
                      <TableCell>
                        <Badge className={mov.tipo === "entrada" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                          {mov.tipo === "entrada" ? "Entrada" : "Saída"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{getItemName(mov.item_id)}</TableCell>
                      <TableCell className="text-white">{mov.quantidade}</TableCell>
                      <TableCell className="text-gray-300">{mov.tecnico_nome || "—"}</TableCell>
                      <TableCell className="text-gray-400 text-xs">{mov.observacao || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Movement dialog */}
      <Dialog open={openMov} onOpenChange={setOpenMov}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white">
              {movType === "entrada" ? "Registrar Entrada" : "Registrar Saída"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">Item: <strong className="text-white">{selectedItem?.descricao}</strong></p>
            <p className="text-gray-400 text-sm">Estoque atual: {selectedItem?.quantidade} {selectedItem?.unidade}</p>
            <div><Label className="text-gray-300">Quantidade *</Label><Input type="number" className="bg-background border-border text-white" value={formMov.quantidade} onChange={(e) => setFormMov({ ...formMov, quantidade: e.target.value })} /></div>
            <div><Label className="text-gray-300">Observação</Label><Input className="bg-background border-border text-white" value={formMov.observacao} onChange={(e) => setFormMov({ ...formMov, observacao: e.target.value })} /></div>
            <Button className="w-full" onClick={() => movMutation.mutate()} disabled={!formMov.quantidade || movMutation.isPending}>
              {movMutation.isPending ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Estoque;
