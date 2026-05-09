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
import { Plus, Pencil, CheckCircle2, FileText, Trash2, MessageCircle, Eye, Search } from "lucide-react";

interface Orcamento {
  id: string; cliente_nome: string; cliente_email: string | null; cliente_telefone: string | null;
  endereco: string; cidade: string; estado: string; servico_solicitado: string;
  valor_total: number; valor_instalacao: number; status: string; created_at: string;
  descricao: string | null; validade_dias?: number;
}
interface ItemEstoque { id: string; descricao: string; codigo: string | null; unidade: string; }
interface ItemOrc {
  id?: string; orcamento_id?: string; estoque_item_id: string | null;
  descricao: string; quantidade: number; unidade: string; valor_total: number;
}

const STATUS = ["pendente", "aprovado", "rejeitado"];
const badge = (s: string) => s === "aprovado" ? "bg-emerald-50 text-emerald-700" : s === "rejeitado" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700";
const moeda = (n: number) => `R$ ${Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Orcamentos = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const isTecnico = hasRole("tecnico") && !hasRole("admin", "gerente", "financeiro");

  const [list, setList] = useState<Orcamento[]>([]);
  const [estoque, setEstoque] = useState<ItemEstoque[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [validadeFiltro, setValidadeFiltro] = useState<"todos" | "vigentes" | "vencidos">("todos");
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<{ orc: Orcamento; itens: ItemOrc[] } | null>(null);
  const [editing, setEditing] = useState<Orcamento | null>(null);
  const [itens, setItens] = useState<ItemOrc[]>([]);
  const [form, setForm] = useState({
    cliente_nome: "", cliente_email: "", cliente_telefone: "",
    endereco: "", cidade: "", estado: "SP",
    servico_solicitado: "", descricao: "",
    valor_instalacao: "", status: "pendente", validade_dias: "30",
  });
  const [busy, setBusy] = useState(false);

  const totalItens = itens.reduce((s, i) => s + Number(i.valor_total || 0), 0);
  const totalGeral = totalItens + (Number(form.valor_instalacao) || 0);

  const load = async () => {
    const { data } = await supabase.from("orcamentos").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Orcamento[]);
  };
  const loadEstoque = async () => {
    const { data } = await supabase.from("estoque_itens").select("id,descricao,codigo,unidade").order("descricao");
    setEstoque((data ?? []) as ItemEstoque[]);
  };
  useEffect(() => { load(); loadEstoque(); }, []);

  const openNew = () => {
    setEditing(null);
    setItens([]);
    setForm({ cliente_nome: "", cliente_email: "", cliente_telefone: "", endereco: "", cidade: "", estado: "SP", servico_solicitado: "", descricao: "", valor_instalacao: "", status: "pendente", validade_dias: "30" });
    setOpen(true);
  };
  const openEdit = async (o: Orcamento) => {
    setEditing(o);
    setForm({
      cliente_nome: o.cliente_nome, cliente_email: o.cliente_email ?? "", cliente_telefone: o.cliente_telefone ?? "",
      endereco: o.endereco, cidade: o.cidade, estado: o.estado, servico_solicitado: o.servico_solicitado,
      descricao: o.descricao ?? "", valor_instalacao: String(o.valor_instalacao), status: o.status,
      validade_dias: String(o.validade_dias ?? 30),
    });
    const { data } = await supabase.from("orcamento_itens").select("*").eq("orcamento_id", o.id);
    setItens((data ?? []) as ItemOrc[]);
    setOpen(true);
  };

  const addItem = () => setItens([...itens, { estoque_item_id: null, descricao: "", quantidade: 1, unidade: "un", valor_total: 0 }]);
  const removeItem = (idx: number) => setItens(itens.filter((_, i) => i !== idx));
  const updateItem = (idx: number, patch: Partial<ItemOrc>) => setItens(itens.map((it, i) => i === idx ? { ...it, ...patch } : it));
  const pickEstoque = (idx: number, estId: string) => {
    const e = estoque.find(x => x.id === estId);
    if (e) updateItem(idx, { estoque_item_id: e.id, descricao: e.descricao, unidade: e.unidade });
  };

  const save = async () => {
    if (!form.cliente_nome || !form.servico_solicitado) {
      toast({ title: "Preencha cliente e serviço", variant: "destructive" }); return;
    }
    setBusy(true);
    const payload = {
      cliente_nome: form.cliente_nome,
      cliente_email: form.cliente_email || null,
      cliente_telefone: form.cliente_telefone || null,
      endereco: form.endereco, cidade: form.cidade, estado: form.estado,
      servico_solicitado: form.servico_solicitado,
      descricao: form.descricao || null,
      valor_instalacao: Number(form.valor_instalacao) || 0,
      valor_total: totalGeral,
      status: form.status,
      validade_dias: Number(form.validade_dias) || 30,
    };
    let orcId = editing?.id;
    const res = editing
      ? await supabase.from("orcamentos").update(payload).eq("id", editing.id)
      : await supabase.from("orcamentos").insert({ ...payload, criado_por: user!.id }).select("id").single();
    if (res.error) { setBusy(false); toast({ title: "Erro", description: res.error.message, variant: "destructive" }); return; }
    if (!editing) orcId = (res as any).data.id;

    // Substitui itens
    if (orcId) {
      await supabase.from("orcamento_itens").delete().eq("orcamento_id", orcId);
      if (itens.length > 0) {
        const rows = itens.filter(i => i.descricao.trim()).map(i => ({
          orcamento_id: orcId!,
          estoque_item_id: i.estoque_item_id,
          descricao: i.descricao,
          quantidade: Number(i.quantidade) || 0,
          unidade: i.unidade || "un",
          valor_total: Number(i.valor_total) || 0,
        }));
        if (rows.length) await supabase.from("orcamento_itens").insert(rows);
      }
    }
    setBusy(false);
    toast({ title: editing ? "Atualizado" : "Orçamento criado" });
    setOpen(false);
    load();

    // Enviar via WhatsApp ao cliente após cadastro
    if (!editing && form.cliente_telefone) {
      enviarWhatsApp({ ...payload, id: orcId! } as any, itens);
    }
  };

  const aprovar = async (o: Orcamento) => {
    const { error } = await supabase.from("orcamentos").update({ status: "aprovado" }).eq("id", o.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Aprovado!", description: "OS gerada automaticamente." }); load(); }
  };

  const validadeAteStr = (o: Orcamento) => {
    const d = new Date(o.created_at);
    d.setDate(d.getDate() + (o.validade_dias ?? 30));
    return d.toLocaleDateString("pt-BR");
  };

  const abrirRelatorio = async (o: Orcamento) => {
    const { data } = await supabase.from("orcamento_itens").select("*").eq("orcamento_id", o.id);
    setReportData({ orc: o, itens: (data ?? []) as ItemOrc[] });
    setReportOpen(true);
  };

  const buildMensagem = (o: any, its: ItemOrc[]) => {
    const lines = [
      `*Espier.Telecom — Orçamento*`,
      `Cliente: ${o.cliente_nome}`,
      `Serviço: ${o.servico_solicitado}`,
      ``,
      `*Itens:*`,
      ...its.filter(i => i.descricao).map(i => `• ${Number(i.quantidade)} ${i.unidade} — ${i.descricao}`),
      ``,
      `*Valor total: ${moeda((o.valor_total ?? 0))}*`,
      `Validade: ${o.validade_dias ?? 30} dias`,
      ``,
      `Atendimento: (21) 96000-1439`,
    ];
    return lines.join("\n");
  };

  const enviarWhatsApp = (o: any, its: ItemOrc[]) => {
    const tel = (o.cliente_telefone || "").replace(/\D/g, "");
    if (!tel) { toast({ title: "Cliente sem telefone", variant: "destructive" }); return; }
    const phone = tel.startsWith("55") ? tel : `55${tel}`;
    const msg = encodeURIComponent(buildMensagem(o, its));
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const enviarWhatsAppFromList = async (o: Orcamento) => {
    const { data } = await supabase.from("orcamento_itens").select("*").eq("orcamento_id", o.id);
    enviarWhatsApp(o, (data ?? []) as ItemOrc[]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Orçamentos</h1>
          <p className="text-sm text-slate-500 mt-1">Aprove orçamentos para gerar Ordens de Serviço. Validade padrão de 30 dias.</p>
        </div>
        {hasRole("admin", "gerente") && <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Novo orçamento</Button>}
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar por cliente, serviço ou cidade..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos status</SelectItem>
              {STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={validadeFiltro} onValueChange={(v: any) => setValidadeFiltro(v)}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Validade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="vigentes">Vigentes</SelectItem>
              <SelectItem value="vencidos">Vencidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              {!isTecnico && <TableHead>Valor total</TableHead>}
              {isTecnico && <TableHead>Valor do serviço</TableHead>}
              <TableHead>Validade até</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              const filtered = list.filter(o => {
                if (statusFiltro !== "todos" && o.status !== statusFiltro) return false;
                if (validadeFiltro !== "todos") {
                  const d = new Date(o.created_at);
                  d.setDate(d.getDate() + (o.validade_dias ?? 30));
                  const venc = d < new Date();
                  if (validadeFiltro === "vigentes" && venc) return false;
                  if (validadeFiltro === "vencidos" && !venc) return false;
                }
                if (busca) {
                  const q = busca.toLowerCase();
                  if (!o.cliente_nome.toLowerCase().includes(q) && !o.servico_solicitado.toLowerCase().includes(q) && !(o.cidade ?? "").toLowerCase().includes(q)) return false;
                }
                return true;
              });
              if (filtered.length === 0) return <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-8">Nenhum orçamento encontrado.</TableCell></TableRow>;
              return filtered.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.cliente_nome}</TableCell>
                <TableCell className="max-w-xs truncate">{o.servico_solicitado}</TableCell>
                {!isTecnico && <TableCell>{moeda(o.valor_total)}</TableCell>}
                {isTecnico && <TableCell>{moeda(o.valor_instalacao)}</TableCell>}
                <TableCell className="text-sm text-slate-600">{validadeAteStr(o)}</TableCell>
                <TableCell><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge(o.status)}`}>{o.status}</span></TableCell>
                <TableCell className="flex gap-1 flex-wrap">
                  <Button size="icon" variant="ghost" title="Ver relatório" onClick={() => abrirRelatorio(o)}><FileText className="w-4 h-4" /></Button>
                  {hasRole("admin", "gerente") && <Button size="icon" variant="ghost" title="Editar" onClick={() => openEdit(o)}><Pencil className="w-4 h-4" /></Button>}
                  {hasRole("admin", "gerente") && o.cliente_telefone && (
                    <Button size="icon" variant="ghost" title="Enviar WhatsApp" onClick={() => enviarWhatsAppFromList(o)} className="text-emerald-600 hover:text-emerald-700"><MessageCircle className="w-4 h-4" /></Button>
                  )}
                  {hasRole("admin", "gerente") && o.status === "pendente" && (
                    <Button size="sm" onClick={() => aprovar(o)} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="w-4 h-4 mr-1" /> Aprovar</Button>
                  )}
                </TableCell>
              </TableRow>
              ));
            })()}
          </TableBody>
        </Table>
      </Card>

      {/* Editor */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar orçamento" : "Novo orçamento"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Cliente *" value={form.cliente_nome} onChange={e => setForm({ ...form, cliente_nome: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="E-mail" value={form.cliente_email} onChange={e => setForm({ ...form, cliente_email: e.target.value })} />
              <Input placeholder="Telefone (com DDD)" value={form.cliente_telefone} onChange={e => setForm({ ...form, cliente_telefone: e.target.value })} />
            </div>
            <Input placeholder="Endereço" value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Cidade" value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} />
              <Input placeholder="UF" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} maxLength={2} />
            </div>
            <Input placeholder="Serviço solicitado *" value={form.servico_solicitado} onChange={e => setForm({ ...form, servico_solicitado: e.target.value })} />
            <Textarea placeholder="Descrição / detalhes" rows={3} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />

            {/* Itens (estoque) */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-800">Produtos / Itens</h3>
                <Button type="button" size="sm" variant="outline" onClick={addItem}><Plus className="w-3.5 h-3.5 mr-1" /> Adicionar item</Button>
              </div>
              {itens.length === 0 && <p className="text-xs text-slate-500 italic">Nenhum item adicionado.</p>}
              <div className="space-y-2">
                {itens.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center p-2 rounded border border-slate-200 bg-slate-50">
                    <div className="col-span-5">
                      <Select value={it.estoque_item_id ?? "manual"} onValueChange={(v) => v === "manual" ? updateItem(idx, { estoque_item_id: null }) : pickEstoque(idx, v)}>
                        <SelectTrigger><SelectValue placeholder="Item de estoque" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">— Item manual —</SelectItem>
                          {estoque.map(e => <SelectItem key={e.id} value={e.id}>{e.descricao}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {!it.estoque_item_id && (
                        <Input className="mt-1" placeholder="Descrição" value={it.descricao} onChange={e => updateItem(idx, { descricao: e.target.value })} />
                      )}
                    </div>
                    <Input className="col-span-2" type="number" step="0.01" placeholder="Qtd" value={it.quantidade} onChange={e => updateItem(idx, { quantidade: Number(e.target.value) })} />
                    <Input className="col-span-2" placeholder="Un" value={it.unidade} onChange={e => updateItem(idx, { unidade: e.target.value })} />
                    <Input className="col-span-2" type="number" step="0.01" placeholder="Valor total" value={it.valor_total} onChange={e => updateItem(idx, { valor_total: Number(e.target.value) })} />
                    <Button type="button" variant="ghost" size="icon" className="col-span-1 text-rose-600" onClick={() => removeItem(idx)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
              <div className="text-right text-sm text-slate-600 mt-2">Subtotal itens: <span className="font-semibold">{moeda(totalItens)}</span></div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t pt-3">
              <div>
                <label className="text-xs text-slate-600">Valor do serviço (instalação)</label>
                <Input type="number" step="0.01" value={form.valor_instalacao} onChange={e => setForm({ ...form, valor_instalacao: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-slate-600">Validade (dias)</label>
                <Input type="number" value={form.validade_dias} onChange={e => setForm({ ...form, validade_dias: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-slate-600">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-right text-base">
              <span className="text-slate-600 mr-2">Total geral:</span>
              <span className="font-bold text-primary text-lg">{moeda(totalGeral)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={busy}>{busy ? "..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Relatório profissional */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto print:shadow-none">
          {reportData && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Relatório de Orçamento</DialogTitle>
              </DialogHeader>
              <div id="orc-report" className="space-y-4 text-slate-800">
                <div className="border-b pb-3">
                  <h2 className="text-xl font-bold">Espier.Telecom</h2>
                  <p className="text-xs text-slate-500">TI · Telecom · Segurança · (21) 96000-1439 · espier.telecom@gmail.com</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><strong>Cliente:</strong> {reportData.orc.cliente_nome}</div>
                  <div><strong>Telefone:</strong> {reportData.orc.cliente_telefone ?? "—"}</div>
                  <div className="col-span-2"><strong>Endereço:</strong> {reportData.orc.endereco}, {reportData.orc.cidade}/{reportData.orc.estado}</div>
                  <div><strong>Emissão:</strong> {new Date(reportData.orc.created_at).toLocaleDateString("pt-BR")}</div>
                  <div><strong>Validade até:</strong> {validadeAteStr(reportData.orc)}</div>
                </div>
                <div>
                  <strong>Serviço:</strong> {reportData.orc.servico_solicitado}
                  {reportData.orc.descricao && <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{reportData.orc.descricao}</p>}
                </div>
                <div className="border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Qtd</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right w-32">Valor total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.itens.length === 0 && (
                        <TableRow><TableCell colSpan={3} className="text-center text-slate-500">Sem itens cadastrados.</TableCell></TableRow>
                      )}
                      {reportData.itens.map((i, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{Number(i.quantidade)} {i.unidade}</TableCell>
                          <TableCell>{i.descricao}</TableCell>
                          <TableCell className="text-right">{moeda(i.valor_total)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2} className="text-right font-semibold">Subtotal de itens</TableCell>
                        <TableCell className="text-right font-semibold">{moeda(reportData.itens.reduce((s, i) => s + Number(i.valor_total), 0))}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} className="text-right">Serviço de instalação</TableCell>
                        <TableCell className="text-right">{moeda(reportData.orc.valor_instalacao)}</TableCell>
                      </TableRow>
                      <TableRow className="bg-slate-50">
                        <TableCell colSpan={2} className="text-right font-bold text-base">VALOR TOTAL</TableCell>
                        <TableCell className="text-right font-bold text-base text-primary">{moeda(reportData.orc.valor_total)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-slate-500 italic">Este orçamento é válido por {reportData.orc.validade_dias ?? 30} dias a contar da emissão.</p>
              </div>
              <DialogFooter className="print:hidden">
                <Button variant="outline" onClick={() => window.print()}>Imprimir / PDF</Button>
                {reportData.orc.cliente_telefone && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => enviarWhatsApp(reportData.orc, reportData.itens)}>
                    <MessageCircle className="w-4 h-4 mr-1.5" /> Enviar por WhatsApp
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orcamentos;
