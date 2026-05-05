import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Pencil, CheckCircle2 } from "lucide-react";

interface Orcamento {
  id: string; cliente_nome: string; cliente_email: string | null; cliente_telefone: string | null;
  endereco: string; cidade: string; estado: string; servico_solicitado: string;
  valor_total: number; valor_instalacao: number; status: string; created_at: string;
  descricao: string | null;
}
const STATUS = ["pendente", "aprovado", "rejeitado"];
const badge = (s: string) => s === "aprovado" ? "bg-emerald-50 text-emerald-700" : s === "rejeitado" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700";

const Orcamentos = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<Orcamento[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Orcamento | null>(null);
  const [form, setForm] = useState({
    cliente_nome: "", cliente_email: "", cliente_telefone: "",
    endereco: "", cidade: "", estado: "SP",
    servico_solicitado: "", descricao: "",
    valor_total: "", valor_instalacao: "", status: "pendente",
  });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("orcamentos").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Orcamento[]);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ cliente_nome: "", cliente_email: "", cliente_telefone: "", endereco: "", cidade: "", estado: "SP", servico_solicitado: "", descricao: "", valor_total: "", valor_instalacao: "", status: "pendente" });
    setOpen(true);
  };
  const openEdit = (o: Orcamento) => {
    setEditing(o);
    setForm({
      cliente_nome: o.cliente_nome, cliente_email: o.cliente_email ?? "", cliente_telefone: o.cliente_telefone ?? "",
      endereco: o.endereco, cidade: o.cidade, estado: o.estado, servico_solicitado: o.servico_solicitado,
      descricao: o.descricao ?? "", valor_total: String(o.valor_total), valor_instalacao: String(o.valor_instalacao), status: o.status,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.cliente_nome || !form.servico_solicitado) {
      toast({ title: "Preencha cliente e serviço", variant: "destructive" }); return;
    }
    setBusy(true);
    const payload = {
      ...form,
      cliente_email: form.cliente_email || null,
      cliente_telefone: form.cliente_telefone || null,
      descricao: form.descricao || null,
      valor_total: Number(form.valor_total) || 0,
      valor_instalacao: Number(form.valor_instalacao) || 0,
    };
    const res = editing
      ? await supabase.from("orcamentos").update(payload).eq("id", editing.id)
      : await supabase.from("orcamentos").insert({ ...payload, criado_por: user!.id });
    setBusy(false);
    if (res.error) { toast({ title: "Erro", description: res.error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Atualizado" : "Orçamento criado" });
    setOpen(false); load();
  };

  const aprovar = async (o: Orcamento) => {
    const { error } = await supabase.from("orcamentos").update({ status: "aprovado" }).eq("id", o.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Aprovado!", description: "OS gerada automaticamente." }); load(); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Orçamentos</h1>
          <p className="text-sm text-slate-500 mt-1">Aprove orçamentos para gerar Ordens de Serviço.</p>
        </div>
        {hasRole("admin", "gerente") && <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Novo orçamento</Button>}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead><TableHead>Serviço</TableHead><TableHead>Valor total</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-8">Nenhum orçamento.</TableCell></TableRow>}
            {list.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.cliente_nome}</TableCell>
                <TableCell className="max-w-xs truncate">{o.servico_solicitado}</TableCell>
                <TableCell>R$ {o.valor_total.toFixed(2)}</TableCell>
                <TableCell><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge(o.status)}`}>{o.status}</span></TableCell>
                <TableCell className="flex gap-1">
                  {hasRole("admin", "gerente") && <Button size="icon" variant="ghost" onClick={() => openEdit(o)}><Pencil className="w-4 h-4" /></Button>}
                  {hasRole("admin", "gerente") && o.status === "pendente" && (
                    <Button size="sm" onClick={() => aprovar(o)} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="w-4 h-4 mr-1" /> Aprovar</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar orçamento" : "Novo orçamento"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Cliente *" value={form.cliente_nome} onChange={e => setForm({ ...form, cliente_nome: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="E-mail" value={form.cliente_email} onChange={e => setForm({ ...form, cliente_email: e.target.value })} />
              <Input placeholder="Telefone" value={form.cliente_telefone} onChange={e => setForm({ ...form, cliente_telefone: e.target.value })} />
            </div>
            <Input placeholder="Endereço *" value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Cidade *" value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} />
              <Input placeholder="UF" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} maxLength={2} />
            </div>
            <Input placeholder="Serviço solicitado *" value={form.servico_solicitado} onChange={e => setForm({ ...form, servico_solicitado: e.target.value })} />
            <Textarea placeholder="Descrição / detalhes" rows={3} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" step="0.01" placeholder="Valor total" value={form.valor_total} onChange={e => setForm({ ...form, valor_total: e.target.value })} />
              <Input type="number" step="0.01" placeholder="Valor instalação" value={form.valor_instalacao} onChange={e => setForm({ ...form, valor_instalacao: e.target.value })} />
            </div>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
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

export default Orcamentos;
