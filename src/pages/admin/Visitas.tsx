import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Pencil, Calendar, MapPin, CheckCircle2, Search } from "lucide-react";

interface Visita {
  id: string; vendedor_id: string; vendedor_nome: string | null;
  cliente_nome: string; cliente_telefone: string | null; cliente_email: string | null;
  endereco: string | null; cidade: string | null; data_visita: string;
  servico_descricao: string | null; valor_estimado: number; status: string;
  autoriza_orcamento: boolean; orcamento_id: string | null; observacoes: string | null;
}

const empty = {
  cliente_nome: "", cliente_telefone: "", cliente_email: "", endereco: "", cidade: "",
  data_visita: new Date().toISOString().slice(0, 16), servico_descricao: "",
  valor_estimado: 0, status: "agendada", autoriza_orcamento: false, observacoes: "",
};

const STATUS_LABEL: Record<string, string> = {
  agendada: "Agendada", realizada: "Realizada", cancelada: "Cancelada",
};
const STATUS_COLOR: Record<string, string> = {
  agendada: "bg-blue-50 text-blue-700",
  realizada: "bg-emerald-50 text-emerald-700",
  cancelada: "bg-slate-100 text-slate-500",
};

const Visitas = () => {
  const { toast } = useToast();
  const { user, hasRole } = useAuth();
  const [list, setList] = useState<Visita[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [orcFiltro, setOrcFiltro] = useState<"todos" | "gerado" | "autorizado" | "sem">("todos");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Visita | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [busy, setBusy] = useState(false);

  const filtered = list.filter(v => {
    if (statusFiltro !== "todos" && v.status !== statusFiltro) return false;
    if (orcFiltro === "gerado" && !v.orcamento_id) return false;
    if (orcFiltro === "autorizado" && (!v.autoriza_orcamento || v.orcamento_id)) return false;
    if (orcFiltro === "sem" && (v.autoriza_orcamento || v.orcamento_id)) return false;
    if (busca) {
      const q = busca.toLowerCase();
      if (!v.cliente_nome.toLowerCase().includes(q) && !(v.cliente_telefone ?? "").includes(busca) && !(v.cidade ?? "").toLowerCase().includes(q) && !(v.vendedor_nome ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const load = async () => {
    const { data } = await supabase.from("visitas").select("*").order("data_visita", { ascending: false });
    setList((data ?? []) as Visita[]);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (v: Visita) => {
    setEditing(v);
    setForm({
      cliente_nome: v.cliente_nome, cliente_telefone: v.cliente_telefone ?? "",
      cliente_email: v.cliente_email ?? "", endereco: v.endereco ?? "", cidade: v.cidade ?? "",
      data_visita: v.data_visita.slice(0, 16), servico_descricao: v.servico_descricao ?? "",
      valor_estimado: Number(v.valor_estimado) || 0, status: v.status,
      autoriza_orcamento: v.autoriza_orcamento, observacoes: v.observacoes ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.cliente_nome.trim()) { toast({ title: "Nome do cliente obrigatório", variant: "destructive" }); return; }
    if (!user) return;
    setBusy(true);
    const payload: any = {
      ...form,
      data_visita: new Date(form.data_visita).toISOString(),
      valor_estimado: Number(form.valor_estimado) || 0,
    };
    let res;
    if (editing) {
      res = await supabase.from("visitas").update(payload).eq("id", editing.id);
    } else {
      const { data: prof } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
      res = await supabase.from("visitas").insert({
        ...payload, vendedor_id: user.id, vendedor_nome: prof?.full_name ?? user.email,
      });
    }
    setBusy(false);
    if (res.error) { toast({ title: "Erro", description: res.error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Atualizado" : "Visita registrada" });
    if (form.status === "realizada" && form.autoriza_orcamento) {
      toast({ title: "Orçamento gerado automaticamente" });
    }
    setOpen(false); load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Visitas</h1>
          <p className="text-sm text-slate-500 mt-1">Agenda e registros do vendedor. Marcar "autoriza orçamento" gera pedido automaticamente.</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Nova visita</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead><TableHead>Cliente</TableHead><TableHead>Local</TableHead>
              <TableHead>Vendedor</TableHead><TableHead>Valor est.</TableHead><TableHead>Status</TableHead>
              <TableHead>Orçamento</TableHead><TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-slate-500 py-8">Nenhuma visita cadastrada.</TableCell></TableRow>}
            {list.map(v => (
              <TableRow key={v.id}>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-slate-400" />
                  {new Date(v.data_visita).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</div>
                </TableCell>
                <TableCell className="font-medium">
                  {v.cliente_nome}
                  <div className="text-xs text-slate-500">{v.cliente_telefone}</div>
                </TableCell>
                <TableCell className="text-sm">
                  {v.cidade && <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />{v.cidade}</div>}
                  {v.endereco && <div className="text-xs text-slate-500">{v.endereco}</div>}
                </TableCell>
                <TableCell className="text-sm">{v.vendedor_nome ?? "-"}</TableCell>
                <TableCell className="text-sm">R$ {Number(v.valor_estimado).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                <TableCell><span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[v.status]}`}>{STATUS_LABEL[v.status]}</span></TableCell>
                <TableCell>
                  {v.orcamento_id ? <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><CheckCircle2 className="w-3 h-3" /> Gerado</span>
                    : v.autoriza_orcamento ? <span className="text-xs text-amber-600">Autorizado</span> : <span className="text-xs text-slate-400">—</span>}
                </TableCell>
                <TableCell>
                  {(hasRole("admin", "gerente") || v.vendedor_id === user?.id) &&
                    <Button size="icon" variant="ghost" onClick={() => openEdit(v)}><Pencil className="w-4 h-4" /></Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar visita" : "Nova visita"}</DialogTitle></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><Input placeholder="Cliente *" value={form.cliente_nome} onChange={e => setForm({ ...form, cliente_nome: e.target.value })} /></div>
            <Input placeholder="Telefone" value={form.cliente_telefone} onChange={e => setForm({ ...form, cliente_telefone: e.target.value })} />
            <Input placeholder="E-mail" value={form.cliente_email} onChange={e => setForm({ ...form, cliente_email: e.target.value })} />
            <Input placeholder="Endereço" value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
            <Input placeholder="Cidade" value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} />
            <div>
              <Label className="text-xs text-slate-500">Data/Hora</Label>
              <Input type="datetime-local" value={form.data_visita} onChange={e => setForm({ ...form, data_visita: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="realizada">Realizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2"><Textarea placeholder="Serviço solicitado / detalhes" value={form.servico_descricao} onChange={e => setForm({ ...form, servico_descricao: e.target.value })} /></div>
            <Input type="number" step="0.01" placeholder="Valor estimado (R$)" value={form.valor_estimado} onChange={e => setForm({ ...form, valor_estimado: parseFloat(e.target.value) || 0 })} />
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
              <div>
                <p className="text-sm font-medium">Autoriza orçamento</p>
                <p className="text-xs text-slate-500">Gera orçamento ao salvar como "realizada"</p>
              </div>
              <Switch checked={form.autoriza_orcamento} onCheckedChange={v => setForm({ ...form, autoriza_orcamento: v })} />
            </div>
            <div className="sm:col-span-2"><Textarea placeholder="Observações" value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
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

export default Visitas;
