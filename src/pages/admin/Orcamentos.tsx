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
import { Plus, Pencil, CheckCircle2, FileText, Trash2, MessageCircle, Eye, Search, Send, UserCheck, FileSignature, XCircle } from "lucide-react";

interface Orcamento {
  id: string; cliente_nome: string; cliente_email: string | null; cliente_telefone: string | null;
  endereco: string; cidade: string; estado: string; servico_solicitado: string;
  valor_total: number; valor_instalacao: number; status: string; created_at: string;
  descricao: string | null; validade_dias?: number;
  cliente_id?: string | null; tipo_servico?: string; valor_mensal?: number;
  origem?: string; setor_responsavel?: string | null; vendedor_id?: string | null;
  assumido_por?: string | null; assumido_em?: string | null;
  forma_pagamento?: string | null; parcelas?: number; entrada?: number; desconto?: number;
  contrato_enviado_em?: string | null; lead_id?: string | null;
}
interface ItemEstoque { id: string; descricao: string; codigo: string | null; unidade: string; valor_venda?: number; }
interface Cliente { id: string; name: string; email: string | null; phone: string | null; address: string | null; city: string | null; state: string | null; }
interface UserMin { user_id: string; full_name: string; }
interface ItemOrc {
  id?: string; orcamento_id?: string; estoque_item_id: string | null;
  descricao: string; quantidade: number; unidade: string; valor_total: number;
}

const STATUS = ["pendente", "solicitado", "negociacao", "aprovado", "rejeitado"];
const badge = (s: string) =>
  s === "aprovado" ? "bg-emerald-50 text-emerald-700"
  : s === "rejeitado" ? "bg-rose-50 text-rose-700"
  : s === "negociacao" ? "bg-blue-50 text-blue-700"
  : s === "solicitado" ? "bg-purple-50 text-purple-700"
  : "bg-amber-50 text-amber-700";
const moeda = (n: number) => `R$ ${Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Orcamentos = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const isTecnico = hasRole("tecnico") && !hasRole("admin", "gerente", "financeiro");

  const [list, setList] = useState<Orcamento[]>([]);
  const [estoque, setEstoque] = useState<ItemEstoque[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<UserMin[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [validadeFiltro, setValidadeFiltro] = useState<"todos" | "vigentes" | "vencidos">("todos");
  const [origemFiltro, setOrigemFiltro] = useState<"todos" | "site" | "interno">("todos");
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<{ orc: Orcamento; itens: ItemOrc[] } | null>(null);
  const [editing, setEditing] = useState<Orcamento | null>(null);
  const [itens, setItens] = useState<ItemOrc[]>([]);
  const [form, setForm] = useState({
    cliente_id: "", cliente_nome: "", cliente_email: "", cliente_telefone: "",
    endereco: "", cidade: "", estado: "SP",
    servico_solicitado: "", descricao: "",
    valor_instalacao: "", status: "pendente", validade_dias: "30",
    tipo_servico: "avulso", valor_mensal: "",
    setor_responsavel: "", vendedor_id: "",
    forma_pagamento: "", parcelas: "1", entrada: "0", desconto: "0",
  });
  const [busy, setBusy] = useState(false);

  const totalItens = itens.reduce((s, i) => s + Number(i.valor_total || 0), 0);
  const totalGeral = totalItens + (Number(form.valor_instalacao) || 0);

  const load = async () => {
    const { data } = await supabase.from("orcamentos").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Orcamento[]);
  };
  const loadEstoque = async () => {
    const { data } = await supabase.from("estoque_itens").select("id,descricao,codigo,unidade,valor_venda").order("descricao");
    setEstoque((data ?? []) as ItemEstoque[]);
  };
  const loadClientes = async () => {
    const { data } = await supabase.from("clientes").select("id,name,email,phone,address,city,state").order("name");
    setClientes((data ?? []) as Cliente[]);
  };
  const loadVendedores = async () => {
    const { data: rolesData } = await supabase.from("user_roles").select("user_id").eq("role", "vendedor");
    const ids = (rolesData ?? []).map((r: any) => r.user_id);
    if (ids.length === 0) { setVendedores([]); return; }
    const { data: profs } = await supabase.from("profiles").select("user_id,full_name").in("user_id", ids);
    setVendedores((profs ?? []) as UserMin[]);
  };
  useEffect(() => { load(); loadEstoque(); loadClientes(); loadVendedores(); }, []);

  const pickCliente = (id: string) => {
    if (id === "manual") {
      setForm(f => ({ ...f, cliente_id: "" }));
      return;
    }
    const c = clientes.find(x => x.id === id);
    if (!c) return;
    setForm(f => ({
      ...f, cliente_id: c.id,
      cliente_nome: c.name, cliente_email: c.email ?? "", cliente_telefone: c.phone ?? "",
      endereco: c.address ?? "", cidade: c.city ?? "", estado: c.state ?? "SP",
    }));
  };

  const openNew = () => {
    setEditing(null);
    setItens([]);
    setForm({
      cliente_id: "", cliente_nome: "", cliente_email: "", cliente_telefone: "",
      endereco: "", cidade: "", estado: "SP", servico_solicitado: "", descricao: "",
      valor_instalacao: "", status: "pendente", validade_dias: "30",
      tipo_servico: "avulso", valor_mensal: "", setor_responsavel: "", vendedor_id: "",
      forma_pagamento: "", parcelas: "1", entrada: "0", desconto: "0",
    });
    setOpen(true);
  };
  const openEdit = async (o: Orcamento) => {
    setEditing(o);
    setForm({
      cliente_id: o.cliente_id ?? "",
      cliente_nome: o.cliente_nome, cliente_email: o.cliente_email ?? "", cliente_telefone: o.cliente_telefone ?? "",
      endereco: o.endereco, cidade: o.cidade, estado: o.estado, servico_solicitado: o.servico_solicitado,
      descricao: o.descricao ?? "", valor_instalacao: String(o.valor_instalacao), status: o.status,
      validade_dias: String(o.validade_dias ?? 30),
      tipo_servico: o.tipo_servico ?? "avulso",
      valor_mensal: String(o.valor_mensal ?? 0),
      setor_responsavel: o.setor_responsavel ?? "",
      vendedor_id: o.vendedor_id ?? "",
      forma_pagamento: o.forma_pagamento ?? "",
      parcelas: String(o.parcelas ?? 1),
      entrada: String(o.entrada ?? 0),
      desconto: String(o.desconto ?? 0),
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
    if (e) updateItem(idx, {
      estoque_item_id: e.id, descricao: e.descricao, unidade: e.unidade,
      valor_total: Number((e as any).valor_venda ?? 0),
    });
  };

  const save = async () => {
    if (!form.cliente_nome || !form.servico_solicitado) {
      toast({ title: "Preencha cliente e serviço", variant: "destructive" }); return;
    }
    setBusy(true);
    const isVendedorOnly = hasRole("vendedor") && !hasRole("admin", "gerente");
    const payload: any = {
      cliente_id: form.cliente_id || null,
      cliente_nome: form.cliente_nome,
      cliente_email: form.cliente_email || null,
      cliente_telefone: form.cliente_telefone || null,
      endereco: form.endereco, cidade: form.cidade, estado: form.estado,
      servico_solicitado: form.servico_solicitado,
      descricao: form.descricao || null,
      valor_instalacao: Number(form.valor_instalacao) || 0,
      valor_total: totalGeral,
      status: isVendedorOnly ? "solicitado" : form.status,
      validade_dias: Number(form.validade_dias) || 30,
      tipo_servico: form.tipo_servico,
      valor_mensal: Number(form.valor_mensal) || 0,
      setor_responsavel: isVendedorOnly ? "comercial" : (form.setor_responsavel || null),
      vendedor_id: isVendedorOnly ? user!.id : (form.vendedor_id || null),
      origem: isVendedorOnly ? "vendedor" : "interno",
      forma_pagamento: form.forma_pagamento || null,
      parcelas: Number(form.parcelas) || 1,
      entrada: Number(form.entrada) || 0,
      desconto: Number(form.desconto) || 0,
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

  const rejeitar = async (o: Orcamento) => {
    if (!confirm(`Rejeitar orçamento de ${o.cliente_nome}?`)) return;
    const { error } = await supabase.from("orcamentos").update({ status: "rejeitado" }).eq("id", o.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      if (o.lead_id) await supabase.from("leads").update({ etapa: "perdido" }).eq("id", o.lead_id);
      toast({ title: "Orçamento rejeitado" }); load();
    }
  };

  const encaminharFinanceiro = async (o: Orcamento) => {
    const { error } = await supabase.from("orcamentos").update({
      status: "solicitado", setor_responsavel: "financeiro",
    }).eq("id", o.id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    await supabase.from("agenda_eventos").insert({
      titulo: `Novo orçamento para análise: ${o.cliente_nome}`,
      descricao: `Orçamento ${moeda(o.valor_total)} aguardando assumir.`,
      tipo: "notificacao", data_inicio: new Date().toISOString(),
      criado_por: user!.id, target_roles: ["financeiro"],
    } as any);
    if (o.lead_id) await supabase.from("leads").update({ etapa: "pedido_orcamento" }).eq("id", o.lead_id);
    toast({ title: "Encaminhado ao Financeiro" }); load();
  };

  const assumirOrcamento = async (o: Orcamento) => {
    const { error } = await supabase.from("orcamentos").update({
      assumido_por: user!.id, assumido_em: new Date().toISOString(), status: "negociacao",
    }).eq("id", o.id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    if (o.lead_id) await supabase.from("leads").update({ etapa: "negociacao" }).eq("id", o.lead_id);
    toast({ title: "Orçamento assumido" }); load();
  };

  const enviarContrato = async (o: Orcamento) => {
    const now = new Date().toISOString();
    const { error: e1 } = await supabase.from("orcamentos").update({ contrato_enviado_em: now }).eq("id", o.id);
    if (e1) { toast({ title: "Erro", description: e1.message, variant: "destructive" }); return; }
    if (o.cliente_id && o.vendedor_id) {
      await supabase.from("contratos").insert({
        client_id: o.cliente_id, vendedor_id: o.vendedor_id,
        orcamento_id: o.id, lead_id: o.lead_id ?? null,
        status: "aguardando_assinatura",
        total_value: o.valor_total, commission_value: o.valor_total * 0.10,
        enviado_em: now,
      } as any);
    }
    if (o.lead_id) await supabase.from("leads").update({ etapa: "fechamento" }).eq("id", o.lead_id);
    if (o.vendedor_id) {
      await supabase.from("agenda_eventos").insert({
        titulo: `Contrato enviado — ${o.cliente_nome}`,
        descricao: `Aguardando assinatura.`, tipo: "notificacao",
        data_inicio: now, criado_por: user!.id, target_user_ids: [o.vendedor_id],
      } as any);
    }
    toast({ title: "Contrato enviado", description: "Aguardando assinatura do cliente." });
    load();
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
        {hasRole("admin", "gerente", "vendedor") && <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> {hasRole("admin","gerente") ? "Novo orçamento" : "Solicitar orçamento"}</Button>}
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
          <Select value={origemFiltro} onValueChange={(v: any) => setOrigemFiltro(v)}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Origem" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas origens</SelectItem>
              <SelectItem value="site">Site (público)</SelectItem>
              <SelectItem value="interno">Interno</SelectItem>
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
                if (origemFiltro !== "todos" && (o.origem ?? "interno") !== origemFiltro) return false;
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
              <TableRow key={o.id} className={o.origem === "site" && !o.setor_responsavel ? "bg-amber-50/40" : ""}>
                <TableCell className="font-medium">
                  {o.cliente_nome}
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {o.origem === "site" && <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Site</span>}
                    {o.tipo_servico === "mensalidade" && <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Mensal</span>}
                    {o.origem === "site" && !o.setor_responsavel && <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Sem setor</span>}
                    {o.setor_responsavel && <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{o.setor_responsavel}</span>}
                  </div>
                </TableCell>
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
                  {(hasRole("admin", "gerente", "vendedor")) && (o.status === "pendente") && !o.assumido_por && (
                    <Button size="sm" variant="outline" onClick={() => encaminharFinanceiro(o)} title="Encaminhar para Financeiro">
                      <Send className="w-4 h-4 mr-1" /> Financeiro
                    </Button>
                  )}
                  {hasRole("financeiro") && o.status === "solicitado" && !o.assumido_por && (
                    <Button size="sm" onClick={() => assumirOrcamento(o)} className="bg-blue-600 hover:bg-blue-700">
                      <UserCheck className="w-4 h-4 mr-1" /> Assumir
                    </Button>
                  )}
                  {hasRole("financeiro", "admin", "gerente") && o.status === "negociacao" && o.assumido_por === user?.id && !o.contrato_enviado_em && (
                    <Button size="sm" onClick={() => enviarContrato(o)} className="bg-indigo-600 hover:bg-indigo-700">
                      <FileSignature className="w-4 h-4 mr-1" /> Enviar contrato
                    </Button>
                  )}
                  {hasRole("admin", "gerente") && (o.status === "pendente" || o.status === "negociacao") && (
                    <Button size="sm" onClick={() => aprovar(o)} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="w-4 h-4 mr-1" /> Aprovar</Button>
                  )}
                  {hasRole("admin", "gerente", "financeiro") && o.status !== "rejeitado" && o.status !== "aprovado" && (
                    <Button size="icon" variant="ghost" title="Rejeitar" onClick={() => rejeitar(o)} className="text-rose-600 hover:text-rose-700"><XCircle className="w-4 h-4" /></Button>
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
            <div>
              <label className="text-xs text-slate-600">Cliente cadastrado</label>
              <Select value={form.cliente_id || "manual"} onValueChange={pickCliente}>
                <SelectTrigger><SelectValue placeholder="Selecionar cliente" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">— Cliente novo / manual —</SelectItem>
                  {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
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

            {hasRole("admin", "gerente") && (
              <div className="grid grid-cols-3 gap-3 border-t pt-3">
                <div>
                  <label className="text-xs text-slate-600">Tipo de serviço</label>
                  <Select value={form.tipo_servico} onValueChange={v => setForm({ ...form, tipo_servico: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avulso">Avulso (1x)</SelectItem>
                      <SelectItem value="mensalidade">Com mensalidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-slate-600">Valor mensal (R$)</label>
                  <Input type="number" step="0.01" disabled={form.tipo_servico !== "mensalidade"} value={form.valor_mensal} onChange={e => setForm({ ...form, valor_mensal: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-slate-600">Vendedor responsável</label>
                  <Select value={form.vendedor_id || "none"} onValueChange={v => setForm({ ...form, vendedor_id: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Nenhum —</SelectItem>
                      {vendedores.map(v => <SelectItem key={v.user_id} value={v.user_id}>{v.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {hasRole("admin") && (
              <div>
                <label className="text-xs text-slate-600">Setor responsável (designar)</label>
                <Select value={form.setor_responsavel || "none"} onValueChange={v => setForm({ ...form, setor_responsavel: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar setor" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Não designado —</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="gerencia">Gerência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

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
