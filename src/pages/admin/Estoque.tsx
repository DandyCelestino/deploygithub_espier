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
import { Plus, Pencil, AlertTriangle, Search } from "lucide-react";

interface Item { id: string; codigo: string | null; descricao: string; quantidade: number; quantidade_minima: number; unidade: string; localizacao: string | null; }

const Estoque = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<Item[]>([]);
  const [busca, setBusca] = useState("");
  const [estoqueFiltro, setEstoqueFiltro] = useState<"todos" | "baixo" | "ok">("todos");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState({ codigo: "", descricao: "", quantidade: "0", quantidade_minima: "0", unidade: "un", localizacao: "" });
  const [busy, setBusy] = useState(false);

  const filtered = list.filter(i => {
    const baixo = i.quantidade <= i.quantidade_minima;
    if (estoqueFiltro === "baixo" && !baixo) return false;
    if (estoqueFiltro === "ok" && baixo) return false;
    if (busca) {
      const q = busca.toLowerCase();
      if (!i.descricao.toLowerCase().includes(q) && !(i.codigo ?? "").toLowerCase().includes(q) && !(i.localizacao ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const load = async () => {
    const { data } = await supabase.from("estoque_itens").select("*").order("descricao");
    setList((data ?? []) as Item[]);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ codigo: "", descricao: "", quantidade: "0", quantidade_minima: "0", unidade: "un", localizacao: "" }); setOpen(true); };
  const openEdit = (i: Item) => { setEditing(i); setForm({ codigo: i.codigo ?? "", descricao: i.descricao, quantidade: String(i.quantidade), quantidade_minima: String(i.quantidade_minima), unidade: i.unidade, localizacao: i.localizacao ?? "" }); setOpen(true); };

  const save = async () => {
    if (!form.descricao.trim()) { toast({ title: "Descrição obrigatória", variant: "destructive" }); return; }
    setBusy(true);
    const payload = {
      codigo: form.codigo.trim() || null, descricao: form.descricao.trim(),
      quantidade: parseInt(form.quantidade) || 0, quantidade_minima: parseInt(form.quantidade_minima) || 0,
      unidade: form.unidade.trim() || "un", localizacao: form.localizacao.trim() || null,
    };
    const res = editing
      ? await supabase.from("estoque_itens").update(payload).eq("id", editing.id)
      : await supabase.from("estoque_itens").insert(payload);
    setBusy(false);
    if (res.error) { toast({ title: "Erro", description: res.error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Atualizado" : "Item criado" });
    setOpen(false); load();
  };

  const canManage = hasRole("admin", "gerente");

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Estoque</h1>
          <p className="text-sm text-slate-500 mt-1">Controle de materiais e equipamentos.</p>
        </div>
        {canManage && <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Novo item</Button>}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead><TableHead>Descrição</TableHead><TableHead>Qtd</TableHead><TableHead>Mín</TableHead><TableHead>Un</TableHead><TableHead>Localização</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-slate-500 py-8">Nenhum item.</TableCell></TableRow>}
            {list.map(i => {
              const baixo = i.quantidade <= i.quantidade_minima;
              return (
                <TableRow key={i.id} className={baixo ? "bg-rose-50/40" : ""}>
                  <TableCell className="font-mono text-xs">{i.codigo ?? "-"}</TableCell>
                  <TableCell className="font-medium">{i.descricao}</TableCell>
                  <TableCell className={baixo ? "font-bold text-rose-700" : ""}>
                    {baixo && <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />}
                    {i.quantidade}
                  </TableCell>
                  <TableCell>{i.quantidade_minima}</TableCell>
                  <TableCell>{i.unidade}</TableCell>
                  <TableCell>{i.localizacao ?? "-"}</TableCell>
                  <TableCell>{canManage && <Button size="icon" variant="ghost" onClick={() => openEdit(i)}><Pencil className="w-4 h-4" /></Button>}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar item" : "Novo item"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Código" value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} />
            <Input placeholder="Descrição *" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <Input type="number" placeholder="Qtd" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} />
              <Input type="number" placeholder="Mín" value={form.quantidade_minima} onChange={e => setForm({ ...form, quantidade_minima: e.target.value })} />
              <Input placeholder="Un" value={form.unidade} onChange={e => setForm({ ...form, unidade: e.target.value })} />
            </div>
            <Input placeholder="Localização" value={form.localizacao} onChange={e => setForm({ ...form, localizacao: e.target.value })} />
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

export default Estoque;
