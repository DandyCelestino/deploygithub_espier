import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Pencil, Search, Trash2, Building2, User, FileText, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface Cliente {
  id: string; name: string; email: string | null; phone: string | null; document: string | null;
  address?: string | null; city?: string | null; state?: string | null; cep?: string | null;
  tipo_pessoa?: string | null; observacoes?: string | null; created_at: string;
}

const empty = { name: "", email: "", phone: "", document: "", address: "", city: "", state: "SP", cep: "", tipo_pessoa: "fisica", observacoes: "" };

const Clientes = () => {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const canDelete = hasRole("admin", "gerente");
  const [list, setList] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "fisica" | "juridica">("todos");
  const [ufFiltro, setUfFiltro] = useState<string>("todos");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [contratosCliente, setContratosCliente] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("clientes").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Cliente[]);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setContratosCliente([]); setOpen(true); };
  const openEdit = async (c: Cliente) => {
    setEditing(c);
    setForm({
      name: c.name, email: c.email ?? "", phone: c.phone ?? "", document: c.document ?? "",
      address: c.address ?? "", city: c.city ?? "", state: c.state ?? "SP", cep: c.cep ?? "",
      tipo_pessoa: c.tipo_pessoa ?? "fisica", observacoes: c.observacoes ?? "",
    });
    setOpen(true);
    const { data } = await supabase.from("contratos").select("id,numero_contrato,total_value,status,created_at,token_publico,data_assinatura").eq("client_id", c.id).order("created_at", { ascending: false });
    setContratosCliente(data ?? []);
  };

  const save = async () => {
    if (!form.name.trim()) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    setBusy(true);
    const payload: any = {
      name: form.name.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null,
      document: form.document.trim() || null, address: form.address.trim() || null, city: form.city.trim() || null,
      state: form.state, cep: form.cep.trim() || null, tipo_pessoa: form.tipo_pessoa,
      observacoes: form.observacoes.trim() || null,
    };
    let res;
    if (editing) res = await supabase.from("clientes").update(payload).eq("id", editing.id);
    else {
      const { data: u } = await supabase.auth.getUser();
      res = await supabase.from("clientes").insert({ ...payload, created_by: u.user?.id });
    }
    setBusy(false);
    if (res.error) { toast({ title: "Erro", description: res.error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Atualizado" : "Cliente cadastrado" });
    setOpen(false); load();
  };

  const remove = async () => {
    if (!delId) return;
    const { error } = await supabase.from("clientes").delete().eq("id", delId);
    if (error) toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    else { toast({ title: "Cliente excluído" }); load(); }
    setDelId(null);
  };

  const ufs = Array.from(new Set(list.map(c => c.state).filter(Boolean))) as string[];
  const filtered = list.filter(c => {
    if (tipoFiltro !== "todos" && (c.tipo_pessoa ?? "fisica") !== tipoFiltro) return false;
    if (ufFiltro !== "todos" && (c.state ?? "") !== ufFiltro) return false;
    if (busca && !c.name.toLowerCase().includes(busca.toLowerCase()) && !(c.email ?? "").toLowerCase().includes(busca.toLowerCase()) && !(c.document ?? "").includes(busca) && !(c.phone ?? "").includes(busca)) return false;
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} de {list.length} cliente(s).</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Novo cliente</Button>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar por nome, e-mail, documento ou telefone..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10" />
          </div>
          <Select value={tipoFiltro} onValueChange={(v: any) => setTipoFiltro(v)}>
            <SelectTrigger className="sm:w-44"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="fisica">Pessoa Física</SelectItem>
              <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ufFiltro} onValueChange={setUfFiltro}>
            <SelectTrigger className="sm:w-32"><SelectValue placeholder="UF" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas UFs</SelectItem>
              {ufs.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Contato</TableHead>
              <TableHead>Documento</TableHead><TableHead>Cidade/UF</TableHead><TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-8">Nenhum cliente.</TableCell></TableRow>}
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-xs">
                    {c.tipo_pessoa === "juridica" ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {c.tipo_pessoa === "juridica" ? "PJ" : "PF"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{c.email ?? "-"}</div>
                  <div className="text-xs text-slate-500">{c.phone ?? "-"}</div>
                </TableCell>
                <TableCell>{c.document ?? "-"}</TableCell>
                <TableCell>{c.city ? `${c.city}/${c.state}` : "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                    {canDelete && <Button size="icon" variant="ghost" onClick={() => setDelId(c.id)}><Trash2 className="w-4 h-4 text-rose-600" /></Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar cliente" : "Novo cliente"}</DialogTitle></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><Input placeholder="Nome / Razão social *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <Select value={form.tipo_pessoa} onValueChange={v => setForm({ ...form, tipo_pessoa: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fisica">Pessoa Física</SelectItem>
                <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="CPF / CNPJ" value={form.document} onChange={e => setForm({ ...form, document: e.target.value })} />
            <Input placeholder="E-mail" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Telefone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="CEP" value={form.cep} onChange={e => setForm({ ...form, cep: e.target.value })} />
            <Input placeholder="Endereço" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <Input placeholder="Cidade" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <Input placeholder="UF" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
            <div className="sm:col-span-2"><Textarea placeholder="Observações" value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={busy}>{busy ? "..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clientes;
