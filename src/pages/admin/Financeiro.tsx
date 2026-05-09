import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, CheckCircle2, ArrowDownCircle, ArrowUpCircle, Search } from "lucide-react";

interface Conta {
  id: string; tipo: string; descricao: string; valor: number; data_vencimento: string;
  data_pagamento: string | null; status: string; categoria: string | null; created_at: string;
}
const STATUS = ["pendente", "pago", "cancelado"];

const Financeiro = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<Conta[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "receita" | "despesa">("todos");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState<"todos" | "mes" | "vencidas" | "proximas">("todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tipo: "receita", descricao: "", valor: "", data_vencimento: "", categoria: "" });
  const [busy, setBusy] = useState(false);

  const inMonth = (d: string) => {
    const x = new Date(d), n = new Date();
    return x.getMonth() === n.getMonth() && x.getFullYear() === n.getFullYear();
  };
  const visible = list.filter(c => {
    if (statusFiltro !== "todos" && c.status !== statusFiltro) return false;
    if (periodo === "mes" && !inMonth(c.data_vencimento)) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    if (periodo === "vencidas" && (c.status === "pago" || new Date(c.data_vencimento) >= today)) return false;
    if (periodo === "proximas") {
      const due = new Date(c.data_vencimento);
      const limit = new Date(); limit.setDate(limit.getDate() + 7);
      if (c.status !== "pendente" || due < today || due > limit) return false;
    }
    if (busca) {
      const q = busca.toLowerCase();
      if (!c.descricao.toLowerCase().includes(q) && !(c.categoria ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const load = async () => {
    let q = supabase.from("financeiro_contas").select("*").order("data_vencimento", { ascending: false });
    if (filtroTipo !== "todos") q = q.eq("tipo", filtroTipo);
    const { data } = await q;
    setList((data ?? []) as Conta[]);
  };
  useEffect(() => { load(); }, [filtroTipo]);

  const openNew = () => { setForm({ tipo: "receita", descricao: "", valor: "", data_vencimento: "", categoria: "" }); setOpen(true); };

  const save = async () => {
    if (!form.descricao || !form.valor || !form.data_vencimento) {
      toast({ title: "Preencha descrição, valor e vencimento", variant: "destructive" }); return;
    }
    setBusy(true);
    const { error } = await supabase.from("financeiro_contas").insert({
      tipo: form.tipo, descricao: form.descricao, valor: Number(form.valor),
      data_vencimento: form.data_vencimento, categoria: form.categoria || null,
      status: "pendente", criado_por: user!.id,
    });
    setBusy(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Conta criada" });
    setOpen(false); load();
  };

  const marcarPago = async (c: Conta) => {
    const { error } = await supabase.from("financeiro_contas").update({
      status: "pago", data_pagamento: new Date().toISOString().slice(0, 10),
    }).eq("id", c.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Marcado como pago" }); load(); }
  };

  const totalReceitas = list.filter(c => c.tipo === "receita" && c.status === "pago").reduce((s, c) => s + Number(c.valor), 0);
  const totalDespesas = list.filter(c => c.tipo === "despesa" && c.status === "pago").reduce((s, c) => s + Number(c.valor), 0);
  const pendentes = list.filter(c => c.status === "pendente").reduce((s, c) => s + Number(c.valor), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-sm text-slate-500 mt-1">Receitas, despesas e contas a pagar/receber.</p>
        </div>
        <div className="flex gap-2">
          <Select value={filtroTipo} onValueChange={(v: any) => setFiltroTipo(v)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Nova conta</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Receitas pagas</p><p className="text-2xl font-bold text-emerald-600 mt-1">R$ {totalReceitas.toFixed(2)}</p></Card>
        <Card className="p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Despesas pagas</p><p className="text-2xl font-bold text-rose-600 mt-1">R$ {totalDespesas.toFixed(2)}</p></Card>
        <Card className="p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Pendentes</p><p className="text-2xl font-bold text-amber-600 mt-1">R$ {pendentes.toFixed(2)}</p></Card>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar por descrição ou categoria..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos status</SelectItem>
              {STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={periodo} onValueChange={(v: any) => setPeriodo(v)}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Período" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos períodos</SelectItem>
              <SelectItem value="mes">Este mês</SelectItem>
              <SelectItem value="vencidas">Vencidas</SelectItem>
              <SelectItem value="proximas">Próx. 7 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Valor</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-8">Nenhuma conta encontrada.</TableCell></TableRow>}
            {visible.map(c => (
              <TableRow key={c.id}>
                <TableCell>
                  {c.tipo === "receita"
                    ? <span className="text-emerald-600 flex items-center gap-1"><ArrowUpCircle className="w-4 h-4" /> Receita</span>
                    : <span className="text-rose-600 flex items-center gap-1"><ArrowDownCircle className="w-4 h-4" /> Despesa</span>}
                </TableCell>
                <TableCell className="font-medium">{c.descricao}</TableCell>
                <TableCell>R$ {Number(c.valor).toFixed(2)}</TableCell>
                <TableCell>{new Date(c.data_vencimento).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.status === "pago" ? "bg-emerald-50 text-emerald-700" : c.status === "cancelado" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"}`}>{c.status}</span>
                </TableCell>
                <TableCell>{c.status === "pendente" && <Button size="sm" onClick={() => marcarPago(c)} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="w-4 h-4 mr-1" /> Pagar</Button>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova conta</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="receita">Receita</SelectItem><SelectItem value="despesa">Despesa</SelectItem></SelectContent>
            </Select>
            <Input placeholder="Descrição *" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
            <Input type="number" step="0.01" placeholder="Valor *" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
            <Input type="date" placeholder="Vencimento *" value={form.data_vencimento} onChange={e => setForm({ ...form, data_vencimento: e.target.value })} />
            <Input placeholder="Categoria (opcional)" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={busy}>{busy ? "..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Financeiro;
