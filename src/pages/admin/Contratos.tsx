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
import { Plus, Pencil, Search } from "lucide-react";

interface Contrato { id: string; client_id: string; vendedor_id: string; total_value: number; commission_value: number; status: string; created_at: string; }
interface Cliente { id: string; name: string; }

const STATUS = ["em_negociacao", "fechado", "cancelado"];
const statusBadge = (s: string) => s === "fechado" ? "bg-emerald-50 text-emerald-700" : s === "cancelado" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700";

const Contratos = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Contrato | null>(null);
  const [form, setForm] = useState({ client_id: "", total_value: "", commission_value: "", status: "em_negociacao" });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("contratos").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Contrato[]);
    const { data: cs } = await supabase.from("clientes").select("id,name").order("name");
    setClientes((cs ?? []) as Cliente[]);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ client_id: "", total_value: "", commission_value: "", status: "em_negociacao" }); setOpen(true); };
  const openEdit = (c: Contrato) => { setEditing(c); setForm({ client_id: c.client_id, total_value: String(c.total_value), commission_value: String(c.commission_value), status: c.status }); setOpen(true); };

  const save = async () => {
    if (!form.client_id) { toast({ title: "Selecione um cliente", variant: "destructive" }); return; }
    setBusy(true);
    const payload = {
      client_id: form.client_id,
      total_value: Number(form.total_value) || 0,
      commission_value: Number(form.commission_value) || 0,
      status: form.status,
      vendedor_id: editing?.vendedor_id ?? user!.id,
    };
    const res = editing
      ? await supabase.from("contratos").update(payload).eq("id", editing.id)
      : await supabase.from("contratos").insert(payload);
    setBusy(false);
    if (res.error) { toast({ title: "Erro", description: res.error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Atualizado" : "Contrato criado" });
    setOpen(false); load();
  };

  const clientName = (id: string) => clientes.find(c => c.id === id)?.name ?? "—";
  const canEdit = (c: Contrato) => hasRole("admin", "gerente") || c.vendedor_id === user?.id;

  const filtered = list.filter(c => {
    if (statusFiltro !== "todos" && c.status !== statusFiltro) return false;
    if (busca && !clientName(c.client_id).toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Contratos</h1>
          <p className="text-sm text-slate-500 mt-1">Acompanhe negociações e fechamentos.</p>
        </div>
        {hasRole("admin", "gerente", "vendedor") && (
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Novo contrato</Button>
        )}
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar por cliente..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="sm:w-52"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead><TableHead>Valor total</TableHead><TableHead>Comissão</TableHead><TableHead>Status</TableHead><TableHead>Criado em</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-8">Nenhum contrato encontrado.</TableCell></TableRow>}
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell>{clientName(c.client_id)}</TableCell>
                <TableCell>R$ {c.total_value.toFixed(2)}</TableCell>
                <TableCell>R$ {c.commission_value.toFixed(2)}</TableCell>
                <TableCell><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusBadge(c.status)}`}>{c.status}</span></TableCell>
                <TableCell>{new Date(c.created_at).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{canEdit(c) && <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar contrato" : "Novo contrato"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-600">Cliente *</label>
              <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Input type="number" step="0.01" placeholder="Valor total (R$)" value={form.total_value} onChange={e => setForm({ ...form, total_value: e.target.value })} />
            <Input type="number" step="0.01" placeholder="Comissão (R$)" value={form.commission_value} onChange={e => setForm({ ...form, commission_value: e.target.value })} />
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {form.status === "fechado" && <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded">⚡ Ao salvar como "fechado", um orçamento será gerado automaticamente.</p>}
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

export default Contratos;
