import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Pencil, AlertTriangle, Search, Wrench, FileText } from "lucide-react";

interface Item {
  id: string; codigo: string | null; descricao: string;
  quantidade: number; quantidade_minima: number; unidade: string; localizacao: string | null;
  valor_compra: number; valor_venda: number;
  descricao_produto: string | null; usabilidade: string | null;
  produtos_associados: string[]; categoria_uso: string;
}

const moeda = (n: number) => `R$ ${Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Estoque = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<Item[]>([]);
  const [busca, setBusca] = useState("");
  const [estoqueFiltro, setEstoqueFiltro] = useState<"todos" | "baixo" | "ok">("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todos");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState({
    codigo: "", descricao: "", quantidade: "0", quantidade_minima: "0",
    unidade: "un", localizacao: "",
    valor_compra: "0", valor_venda: "0",
    descricao_produto: "", usabilidade: "",
    produtos_associados: [] as string[], categoria_uso: "ambos",
  });
  const [busy, setBusy] = useState(false);

  const canSeeValues = hasRole("admin", "gerente", "financeiro");
  const canManage = hasRole("admin", "gerente");

  const filtered = list.filter(i => {
    const baixo = i.quantidade <= i.quantidade_minima;
    if (estoqueFiltro === "baixo" && !baixo) return false;
    if (estoqueFiltro === "ok" && baixo) return false;
    if (categoriaFiltro !== "todos" && i.categoria_uso !== categoriaFiltro) return false;
    if (busca) {
      const q = busca.toLowerCase();
      if (!i.descricao.toLowerCase().includes(q) && !(i.codigo ?? "").toLowerCase().includes(q) && !(i.localizacao ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const load = async () => {
    const { data } = await supabase.from("estoque_itens").select("*").order("descricao");
    setList((data ?? []) as any);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({
      codigo: "", descricao: "", quantidade: "0", quantidade_minima: "0",
      unidade: "un", localizacao: "",
      valor_compra: "0", valor_venda: "0",
      descricao_produto: "", usabilidade: "",
      produtos_associados: [], categoria_uso: "ambos",
    });
    setOpen(true);
  };
  const openEdit = (i: Item) => {
    setEditing(i);
    setForm({
      codigo: i.codigo ?? "", descricao: i.descricao,
      quantidade: String(i.quantidade), quantidade_minima: String(i.quantidade_minima),
      unidade: i.unidade, localizacao: i.localizacao ?? "",
      valor_compra: String(i.valor_compra ?? 0), valor_venda: String(i.valor_venda ?? 0),
      descricao_produto: i.descricao_produto ?? "", usabilidade: i.usabilidade ?? "",
      produtos_associados: i.produtos_associados ?? [],
      categoria_uso: i.categoria_uso ?? "ambos",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.descricao.trim()) { toast({ title: "Descrição obrigatória", variant: "destructive" }); return; }
    setBusy(true);
    const payload = {
      codigo: form.codigo.trim() || null, descricao: form.descricao.trim(),
      quantidade: parseInt(form.quantidade) || 0, quantidade_minima: parseInt(form.quantidade_minima) || 0,
      unidade: form.unidade.trim() || "un", localizacao: form.localizacao.trim() || null,
      valor_compra: Number(form.valor_compra) || 0,
      valor_venda: Number(form.valor_venda) || 0,
      descricao_produto: form.descricao_produto.trim() || null,
      usabilidade: form.usabilidade.trim() || null,
      produtos_associados: form.produtos_associados,
      categoria_uso: form.categoria_uso,
    };
    const res = editing
      ? await supabase.from("estoque_itens").update(payload as any).eq("id", editing.id)
      : await supabase.from("estoque_itens").insert(payload as any);
    setBusy(false);
    if (res.error) { toast({ title: "Erro", description: res.error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Atualizado" : "Item criado" });
    setOpen(false); load();
  };

  const toggleAssoc = (id: string) => {
    setForm(f => ({
      ...f,
      produtos_associados: f.produtos_associados.includes(id)
        ? f.produtos_associados.filter(x => x !== id)
        : [...f.produtos_associados, id],
    }));
  };

  const catBadge = (c: string) => c === "instalacao" ? "bg-blue-50 text-blue-700"
    : c === "orcamento" ? "bg-emerald-50 text-emerald-700"
    : "bg-slate-100 text-slate-700";

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Estoque</h1>
          <p className="text-sm text-slate-500 mt-1">Catálogo de produtos com valores, usabilidade e associações.</p>
        </div>
        {canManage && <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Novo item</Button>}
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar por código, descrição ou localização..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10" />
          </div>
          <Select value={estoqueFiltro} onValueChange={(v: any) => setEstoqueFiltro(v)}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Estoque" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os itens</SelectItem>
              <SelectItem value="baixo">Estoque baixo</SelectItem>
              <SelectItem value="ok">Estoque normal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Uso" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas categorias</SelectItem>
              <SelectItem value="instalacao">Instalação</SelectItem>
              <SelectItem value="orcamento">Orçamento</SelectItem>
              <SelectItem value="ambos">Ambos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Qtd</TableHead>
              {canSeeValues && <TableHead>Compra</TableHead>}
              {canSeeValues && <TableHead>Venda</TableHead>}
              <TableHead>Uso</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && <TableRow><TableCell colSpan={canSeeValues ? 8 : 6} className="text-center text-slate-500 py-8">Nenhum item encontrado.</TableCell></TableRow>}
            {filtered.map(i => {
              const baixo = i.quantidade <= i.quantidade_minima;
              return (
                <TableRow key={i.id} className={baixo ? "bg-rose-50/40" : ""}>
                  <TableCell className="font-mono text-xs">{i.codigo ?? "-"}</TableCell>
                  <TableCell className="font-medium">
                    <div>{i.descricao}</div>
                    {i.descricao_produto && <div className="text-xs text-slate-500 line-clamp-1">{i.descricao_produto}</div>}
                  </TableCell>
                  <TableCell className={baixo ? "font-bold text-rose-700" : ""}>
                    {baixo && <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />}
                    {i.quantidade} {i.unidade}
                    <div className="text-[10px] text-slate-400">mín {i.quantidade_minima}</div>
                  </TableCell>
                  {canSeeValues && <TableCell className="text-slate-600">{moeda(i.valor_compra ?? 0)}</TableCell>}
                  {canSeeValues && <TableCell className="font-semibold text-emerald-700">{moeda(i.valor_venda ?? 0)}</TableCell>}
                  <TableCell><span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${catBadge(i.categoria_uso)}`}>{i.categoria_uso}</span></TableCell>
                  <TableCell>{i.localizacao ?? "-"}</TableCell>
                  <TableCell>{canManage && <Button size="icon" variant="ghost" onClick={() => openEdit(i)}><Pencil className="w-4 h-4" /></Button>}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar item" : "Novo item"}</DialogTitle></DialogHeader>
          <Tabs defaultValue="dados">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="dados">Dados básicos</TabsTrigger>
              <TabsTrigger value="descricao">Descrição</TabsTrigger>
              <TabsTrigger value="associados">Associados</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600">Código</label>
                  <Input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-slate-600">Categoria de uso</label>
                  <Select value={form.categoria_uso} onValueChange={v => setForm({ ...form, categoria_uso: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instalacao"><Wrench className="w-3.5 h-3.5 inline mr-1" /> Instalação</SelectItem>
                      <SelectItem value="orcamento"><FileText className="w-3.5 h-3.5 inline mr-1" /> Orçamento</SelectItem>
                      <SelectItem value="ambos">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-600">Descrição *</label>
                <Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600">Qtd em estoque</label>
                  <Input type="number" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-slate-600">Mínimo</label>
                  <Input type="number" value={form.quantidade_minima} onChange={e => setForm({ ...form, quantidade_minima: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-slate-600">Unidade</label>
                  <Input value={form.unidade} onChange={e => setForm({ ...form, unidade: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600">Valor de compra (R$)</label>
                  <Input type="number" step="0.01" value={form.valor_compra} onChange={e => setForm({ ...form, valor_compra: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-slate-600">Valor de venda (R$)</label>
                  <Input type="number" step="0.01" value={form.valor_venda} onChange={e => setForm({ ...form, valor_venda: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-600">Localização (estoque físico)</label>
                <Input value={form.localizacao} onChange={e => setForm({ ...form, localizacao: e.target.value })} />
              </div>
            </TabsContent>

            <TabsContent value="descricao" className="space-y-3 pt-3">
              <div>
                <label className="text-xs text-slate-600">Descrição detalhada do produto</label>
                <Textarea rows={4} placeholder="Especificações, marca, modelo, dimensões..." value={form.descricao_produto} onChange={e => setForm({ ...form, descricao_produto: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-slate-600">Usabilidade / aplicação</label>
                <Textarea rows={4} placeholder="Para que serve este produto, onde é aplicado, instruções de uso..." value={form.usabilidade} onChange={e => setForm({ ...form, usabilidade: e.target.value })} />
              </div>
            </TabsContent>

            <TabsContent value="associados" className="pt-3">
              <p className="text-xs text-slate-500 mb-2">Selecione produtos que costumam ser usados em conjunto:</p>
              <div className="max-h-72 overflow-y-auto border rounded p-2 space-y-1">
                {list.filter(x => x.id !== editing?.id).map(x => (
                  <label key={x.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={form.produtos_associados.includes(x.id)}
                      onChange={() => toggleAssoc(x.id)}
                    />
                    <span className="font-mono text-xs text-slate-400">{x.codigo ?? "-"}</span>
                    <span>{x.descricao}</span>
                  </label>
                ))}
                {list.length === 0 && <p className="text-xs text-slate-400 italic">Nenhum outro item para associar.</p>}
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={busy}>{busy ? "..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Estoque;
