import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Search } from "lucide-react";

interface Cliente { id: string; name: string; email: string | null; phone: string | null; document: string | null; created_at: string; }

const Clientes = () => {
  const { toast } = useToast();
  const [list, setList] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", document: "" });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("clientes").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Cliente[]);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", email: "", phone: "", document: "" }); setOpen(true); };
  const openEdit = (c: Cliente) => { setEditing(c); setForm({ name: c.name, email: c.email ?? "", phone: c.phone ?? "", document: c.document ?? "" }); setOpen(true); };

  const save = async () => {
    if (!form.name.trim()) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    setBusy(true);
    const payload = { name: form.name.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null, document: form.document.trim() || null };
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

  const filtered = list.filter(c => !busca || c.name.toLowerCase().includes(busca.toLowerCase()) || (c.email ?? "").toLowerCase().includes(busca.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">Cadastre e gerencie clientes do sistema.</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Novo cliente</Button>
      </div>

      <Card className="p-4 mb-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Buscar por nome ou e-mail..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10" />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead><TableHead>E-mail</TableHead><TableHead>Telefone</TableHead><TableHead>Documento</TableHead><TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-8">Nenhum cliente.</TableCell></TableRow>}
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.email ?? "-"}</TableCell>
                <TableCell>{c.phone ?? "-"}</TableCell>
                <TableCell>{c.document ?? "-"}</TableCell>
                <TableCell><Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar cliente" : "Novo cliente"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="E-mail" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Telefone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="CPF/CNPJ" value={form.document} onChange={e => setForm({ ...form, document: e.target.value })} />
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

export default Clientes;
