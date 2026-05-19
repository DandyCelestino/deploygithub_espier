import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Pencil, Search, Trash2, ExternalLink, Send, FileText, Eye, Download, Copy } from "lucide-react";

interface Item { descricao: string; quantidade: number; valor_unit: number; }
interface Contrato {
  id: string; client_id: string; vendedor_id: string;
  numero_contrato: string | null;
  total_value: number; commission_value: number; valor_mensal: number;
  status: string; created_at: string;
  objeto: string | null; prazo_execucao_dias: number | null; forma_pagamento: string | null;
  garantia_meses: number; sla_resposta_horas: number; observacoes: string | null;
  itens: Item[]; token_publico: string; data_assinatura: string | null;
  assinatura_nome: string | null; enviado_whatsapp_em: string | null;
}
interface Cliente { id: string; name: string; phone: string | null; }

const STATUS = ["em_negociacao", "enviado", "fechado", "cancelado"];
const statusLabel: Record<string, string> = { em_negociacao: "Em negociação", enviado: "Enviado ao cliente", fechado: "Fechado / Assinado", cancelado: "Cancelado" };
const statusBadge = (s: string) => s === "fechado" ? "bg-emerald-50 text-emerald-700" : s === "cancelado" ? "bg-rose-50 text-rose-700" : s === "enviado" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700";

const emptyForm = {
  client_id: "", total_value: "", commission_value: "", valor_mensal: "",
  status: "em_negociacao", objeto: "", prazo_execucao_dias: "30",
  forma_pagamento: "50% entrada, 50% na entrega", garantia_meses: "12",
  sla_resposta_horas: "24", observacoes: "", itens: [] as Item[],
};

const Contratos = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Contrato | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("contratos").select("*").order("created_at", { ascending: false });
    setList(((data ?? []) as any[]).map(d => ({ ...d, itens: Array.isArray(d.itens) ? d.itens : [] })) as Contrato[]);
    const { data: cs } = await supabase.from("clientes").select("id,name,phone").order("name");
    setClientes((cs ?? []) as Cliente[]);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (c: Contrato) => {
    setEditing(c);
    setForm({
      client_id: c.client_id,
      total_value: String(c.total_value), commission_value: String(c.commission_value),
      valor_mensal: String(c.valor_mensal ?? 0),
      status: c.status, objeto: c.objeto ?? "",
      prazo_execucao_dias: String(c.prazo_execucao_dias ?? 30),
      forma_pagamento: c.forma_pagamento ?? "",
      garantia_meses: String(c.garantia_meses ?? 12),
      sla_resposta_horas: String(c.sla_resposta_horas ?? 24),
      observacoes: c.observacoes ?? "",
      itens: Array.isArray(c.itens) ? c.itens : [],
    });
    setOpen(true);
  };

  const addItem = () => setForm({ ...form, itens: [...form.itens, { descricao: "", quantidade: 1, valor_unit: 0 }] });
  const updItem = (i: number, p: Partial<Item>) => { const a = [...form.itens]; a[i] = { ...a[i], ...p }; setForm({ ...form, itens: a }); };
  const rmItem = (i: number) => setForm({ ...form, itens: form.itens.filter((_, x) => x !== i) });

  const subtotalItens = form.itens.reduce((s, it) => s + Number(it.quantidade || 0) * Number(it.valor_unit || 0), 0);

  const save = async () => {
    if (!form.client_id) { toast({ title: "Selecione um cliente", variant: "destructive" }); return; }
    setBusy(true);
    const payload: any = {
      client_id: form.client_id,
      total_value: Number(form.total_value) || subtotalItens,
      commission_value: Number(form.commission_value) || 0,
      valor_mensal: Number(form.valor_mensal) || 0,
      status: form.status,
      objeto: form.objeto.trim() || null,
      prazo_execucao_dias: Number(form.prazo_execucao_dias) || null,
      forma_pagamento: form.forma_pagamento.trim() || null,
      garantia_meses: Number(form.garantia_meses) || 12,
      sla_resposta_horas: Number(form.sla_resposta_horas) || 24,
      observacoes: form.observacoes.trim() || null,
      itens: form.itens,
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

  const remove = async () => {
    if (!delId) return;
    const { error } = await supabase.from("contratos").delete().eq("id", delId);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Excluído" }); load(); }
    setDelId(null);
  };

  const linkPublico = (token: string) => `${window.location.origin}/contrato/${token}`;

  const copiarLink = async (c: Contrato) => {
    try {
      await navigator.clipboard.writeText(linkPublico(c.token_publico));
      toast({ title: "Link copiado para a área de transferência" });
    } catch {
      toast({ title: "Não foi possível copiar", variant: "destructive" });
    }
  };

  const baixarPdf = (c: Contrato) => {
    // abre o link público com auto-print → cliente/admin gera o PDF
    window.open(linkPublico(c.token_publico) + "?print=1", "_blank");
  };

  const enviarWhatsapp = async (c: Contrato) => {
    const cli = clientes.find(x => x.id === c.client_id);
    if (!cli?.phone) { toast({ title: "Cliente sem telefone cadastrado", variant: "destructive" }); return; }
    const tel = cli.phone.replace(/\D/g, "");
    const link = linkPublico(c.token_publico);
    const acao = c.data_assinatura ? "sua cópia assinada digitalmente" : "sua análise e assinatura digital";
    const msg = `Olá ${cli.name}! Segue o contrato *${c.numero_contrato}* da Espier.Telecom para ${acao}:\n\n${link}\n\nVocê pode visualizar, assinar e baixar o PDF diretamente no link acima.\n\nQualquer dúvida estamos à disposição.`;
    await supabase.from("contratos").update({ enviado_whatsapp_em: new Date().toISOString(), status: c.status === "em_negociacao" ? "enviado" : c.status }).eq("id", c.id);
    window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`, "_blank");
    load();
  };


  const clientName = (id: string) => clientes.find(c => c.id === id)?.name ?? "—";
  const canEdit = (c: Contrato) => hasRole("admin", "gerente") || c.vendedor_id === user?.id;
  const canDelete = hasRole("admin");

  const filtered = list.filter(c => {
    if (statusFiltro !== "todos" && c.status !== statusFiltro) return false;
    if (busca && !clientName(c.client_id).toLowerCase().includes(busca.toLowerCase()) && !(c.numero_contrato ?? "").toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Contratos</h1>
          <p className="text-sm text-slate-500 mt-1">Gere, envie por WhatsApp e acompanhe assinaturas.</p>
        </div>
        {hasRole("admin", "gerente", "vendedor") && (
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Novo contrato</Button>
        )}
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar por cliente ou nº do contrato..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="sm:w-52"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {STATUS.map(s => <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº</TableHead><TableHead>Cliente</TableHead><TableHead>Valor</TableHead><TableHead>Mensal</TableHead><TableHead>Status</TableHead><TableHead>Assinatura</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-slate-500 py-8">Nenhum contrato.</TableCell></TableRow>}
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">{c.numero_contrato ?? "—"}</TableCell>
                <TableCell className="font-medium">{clientName(c.client_id)}</TableCell>
                <TableCell>R$ {Number(c.total_value).toFixed(2)}</TableCell>
                <TableCell>{c.valor_mensal > 0 ? `R$ ${Number(c.valor_mensal).toFixed(2)}` : "—"}</TableCell>
                <TableCell><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusBadge(c.status)}`}>{statusLabel[c.status] ?? c.status}</span></TableCell>
                <TableCell className="text-xs">{c.data_assinatura ? <span className="text-emerald-700">✓ {c.assinatura_nome}</span> : c.enviado_whatsapp_em ? <span className="text-blue-700">Enviado</span> : <span className="text-slate-400">—</span>}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" title="Visualizar" onClick={() => window.open(linkPublico(c.token_publico), "_blank")}><Eye className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" title="Enviar por WhatsApp" onClick={() => enviarWhatsapp(c)}><Send className="w-4 h-4 text-emerald-600" /></Button>
                    {canEdit(c) && <Button size="icon" variant="ghost" title="Editar" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>}
                    {canDelete && <Button size="icon" variant="ghost" title="Excluir" onClick={() => setDelId(c.id)}><Trash2 className="w-4 h-4 text-rose-600" /></Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? `Editar contrato ${editing.numero_contrato ?? ""}` : "Novo contrato"}</DialogTitle></DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600">Cliente *</label>
              <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600">Objeto / Descrição do escopo</label>
              <Textarea className="mt-1.5" rows={3} placeholder="Ex: Instalação de sistema de CFTV com 8 câmeras IP, gravador DVR..." value={form.objeto} onChange={e => setForm({ ...form, objeto: e.target.value })} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-600">Itens / Serviços</label>
                <Button size="sm" variant="outline" onClick={addItem}><Plus className="w-3 h-3 mr-1" /> Item</Button>
              </div>
              {form.itens.length === 0 && <p className="text-xs text-slate-400">Nenhum item. (Opcional — você pode usar apenas o valor total.)</p>}
              <div className="space-y-2">
                {form.itens.map((it, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2">
                    <Input className="col-span-6" placeholder="Descrição" value={it.descricao} onChange={e => updItem(i, { descricao: e.target.value })} />
                    <Input className="col-span-2" type="number" placeholder="Qtd" value={it.quantidade} onChange={e => updItem(i, { quantidade: Number(e.target.value) })} />
                    <Input className="col-span-3" type="number" step="0.01" placeholder="Valor unit." value={it.valor_unit} onChange={e => updItem(i, { valor_unit: Number(e.target.value) })} />
                    <Button className="col-span-1" size="icon" variant="ghost" onClick={() => rmItem(i)}><Trash2 className="w-4 h-4 text-rose-600" /></Button>
                  </div>
                ))}
                {form.itens.length > 0 && <div className="text-right text-sm text-slate-600">Subtotal itens: <strong>R$ {subtotalItens.toFixed(2)}</strong></div>}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div><label className="text-xs font-bold text-slate-600">Valor total (R$)</label><Input className="mt-1.5" type="number" step="0.01" value={form.total_value} onChange={e => setForm({ ...form, total_value: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-slate-600">Comissão (R$)</label><Input className="mt-1.5" type="number" step="0.01" value={form.commission_value} onChange={e => setForm({ ...form, commission_value: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-slate-600">Mensalidade (R$)</label><Input className="mt-1.5" type="number" step="0.01" value={form.valor_mensal} onChange={e => setForm({ ...form, valor_mensal: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-slate-600">Prazo execução (dias)</label><Input className="mt-1.5" type="number" value={form.prazo_execucao_dias} onChange={e => setForm({ ...form, prazo_execucao_dias: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-slate-600">Garantia (meses)</label><Input className="mt-1.5" type="number" value={form.garantia_meses} onChange={e => setForm({ ...form, garantia_meses: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-slate-600">SLA (horas úteis)</label><Input className="mt-1.5" type="number" value={form.sla_resposta_horas} onChange={e => setForm({ ...form, sla_resposta_horas: e.target.value })} /></div>
            </div>

            <div><label className="text-xs font-bold text-slate-600">Forma de pagamento</label><Input className="mt-1.5" value={form.forma_pagamento} onChange={e => setForm({ ...form, forma_pagamento: e.target.value })} /></div>
            <div><label className="text-xs font-bold text-slate-600">Observações adicionais</label><Textarea className="mt-1.5" rows={2} value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>

            <div>
              <label className="text-xs font-bold text-slate-600">Status</label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS.map(s => <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>)}</SelectContent>
              </Select>
              {form.status === "fechado" && <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded mt-2">⚡ Ao salvar como "fechado", um orçamento será gerado automaticamente.</p>}
            </div>

            {editing && (
              <div className="bg-slate-50 border border-slate-200 rounded p-3 text-sm">
                <div className="font-bold text-slate-700 mb-1 flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Link público para o cliente</div>
                <a href={linkPublico(editing.token_publico)} target="_blank" rel="noreferrer" className="text-primary break-all text-xs">{linkPublico(editing.token_publico)}</a>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={busy}>{busy ? "..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Excluir contrato?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={remove}>Excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Contratos;
