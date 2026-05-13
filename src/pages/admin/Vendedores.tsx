import { useEffect, useMemo, useState, DragEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Search, Phone, MessageCircle, MapPin, Trophy, Target,
  TrendingUp, Users, DollarSign, Clock, Tag, Filter,
} from "lucide-react";

const ETAPAS = [
  { id: "novo_lead", label: "Novo Lead", color: "bg-slate-100 text-slate-700" },
  { id: "primeiro_contato", label: "Primeiro Contato", color: "bg-blue-100 text-blue-700" },
  { id: "aguardando_retorno", label: "Aguardando Retorno", color: "bg-amber-100 text-amber-700" },
  { id: "qualificacao", label: "Qualificação", color: "bg-indigo-100 text-indigo-700" },
  { id: "interesse_confirmado", label: "Interesse Confirmado", color: "bg-violet-100 text-violet-700" },
  { id: "agendamento_visita", label: "Agendamento de Visita", color: "bg-cyan-100 text-cyan-700" },
  { id: "visita_realizada", label: "Visita Realizada", color: "bg-teal-100 text-teal-700" },
  { id: "proposta_andamento", label: "Proposta em Andamento", color: "bg-sky-100 text-sky-700" },
  { id: "pedido_orcamento", label: "Pedido de Orçamento", color: "bg-fuchsia-100 text-fuchsia-700" },
  { id: "negociacao", label: "Negociação", color: "bg-orange-100 text-orange-700" },
  { id: "fechamento", label: "Fechamento", color: "bg-yellow-100 text-yellow-800" },
  { id: "contrato_assinado", label: "Contrato Assinado", color: "bg-lime-100 text-lime-700" },
  { id: "venda_concluida", label: "Venda Concluída", color: "bg-emerald-100 text-emerald-700" },
  { id: "pos_venda", label: "Pós-venda", color: "bg-green-100 text-green-700" },
  { id: "perdido", label: "Perdido / Cancelado", color: "bg-rose-100 text-rose-700" },
] as const;

type Lead = any;
type Atividade = any;

const PRIORIDADES = [
  { id: "baixa", label: "Baixa", color: "bg-slate-200 text-slate-700" },
  { id: "media", label: "Média", color: "bg-amber-200 text-amber-800" },
  { id: "alta", label: "Alta", color: "bg-orange-200 text-orange-800" },
  { id: "urgente", label: "Urgente", color: "bg-rose-200 text-rose-800" },
];

const SERVICOS = [
  "TI — Infraestrutura e Redes",
  "Telecom — Telefonia e PABX",
  "CFTV — Câmeras de Segurança",
  "Alarmes Monitorados",
  "Controle de Acesso",
  "Cerca Elétrica e Concertina",
  "Rastreamento Veicular",
  "Portões Automáticos",
  "Cabeamento Estruturado",
  "Manutenção Preventiva",
  "Outro",
];

// Etapas a partir das quais valor/serviço ficam travados (após "Visita Realizada")
const ETAPAS_TRAVAM_VALOR = [
  "visita_realizada", "proposta_andamento", "pedido_orcamento", "negociacao",
  "fechamento", "contrato_assinado", "venda_concluida", "pos_venda",
];
const valorTravado = (etapa?: string) => !!etapa && ETAPAS_TRAVAM_VALOR.includes(etapa);

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const fmtBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const diasParado = (iso?: string) => {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
};

export default function Vendedores() {
  const { user, hasRole, isAdmin } = useAuth();
  const isVendedor = hasRole("vendedor");
  const isGestor = isAdmin || hasRole("gerente");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendedores, setVendedores] = useState<{ user_id: string; full_name: string }[]>([]);
  const [clientes, setClientes] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [busca, setBusca] = useState("");
  const [filtroVend, setFiltroVend] = useState<string>("todos");
  const [filtroPrio, setFiltroPrio] = useState<string>("todas");

  // diálogos
  const [novoOpen, setNovoOpen] = useState(false);
  const [detalheLead, setDetalheLead] = useState<Lead | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);

  // form novo lead
  const empty = {
    nome: "", empresa: "", telefone: "", whatsapp: "", email: "",
    endereco: "", cep: "", cidade: "", servico_interesse: "",
    valor_estimado: "0", prioridade: "media", proxima_acao: "",
    observacoes_internas: "", cliente_id: "", vendedor_id: user?.id ?? "",
  };
  const [form, setForm] = useState<any>(empty);

  // metas / comissões para painel
  const [comissoes, setComissoes] = useState<any[]>([]);
  const [meta, setMeta] = useState<{ meta_valor: number; meta_vendas: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchAll();
    setForm((f: any) => ({ ...f, vendedor_id: f.vendedor_id || user.id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Ao abrir o diálogo, garante que o vendedor logado já vem preenchido
  function abrirNovo() {
    setForm({ ...empty, vendedor_id: user?.id ?? "" });
    setNovoOpen(true);
  }

  async function fetchAll() {
    setLoading(true);
    const [{ data: leadsData }, { data: vendData }, { data: cliData }, { data: comData }, { data: metaData }] =
      await Promise.all([
        supabase.from("leads").select("*").order("etapa_changed_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role").eq("role", "vendedor"),
        supabase.from("clientes").select("id, name").order("name"),
        supabase.from("vendedor_comissoes").select("*").eq("vendedor_id", user!.id),
        supabase.from("vendedor_metas").select("meta_valor, meta_vendas")
          .eq("vendedor_id", user!.id)
          .eq("ano", new Date().getFullYear())
          .eq("mes", new Date().getMonth() + 1)
          .maybeSingle(),
      ]);
    setLeads(leadsData ?? []);
    setClientes((cliData ?? []) as any);
    setComissoes(comData ?? []);
    setMeta(metaData as any);

    // pega nomes dos vendedores
    const ids = (vendData ?? []).map((r: any) => r.user_id);
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
      setVendedores((profs ?? []) as any);
    }
    setLoading(false);
  }

  async function abrirLead(lead: Lead) {
    setDetalheLead(lead);
    const { data } = await supabase
      .from("lead_atividades")
      .select("*")
      .eq("lead_id", lead.id)
      .order("data_evento", { ascending: false });
    setAtividades(data ?? []);
  }

  async function criarLead() {
    // Vendedor logado é assumido automaticamente
    const vendedor_id = form.vendedor_id || user?.id;
    if (!vendedor_id) { toast.error("Sessão inválida — faça login novamente."); return; }

    // Validações obrigatórias
    if (!form.nome.trim()) return toast.error("Nome do cliente é obrigatório");
    if (!form.telefone.trim() || onlyDigits(form.telefone).length < 10)
      return toast.error("Telefone válido é obrigatório (DDD + número)");
    if (!form.whatsapp.trim() || onlyDigits(form.whatsapp).length < 10)
      return toast.error("WhatsApp válido é obrigatório");
    if (!form.email.trim() || !isEmail(form.email))
      return toast.error("E-mail válido é obrigatório");
    if (!form.endereco.trim()) return toast.error("Endereço do cliente é obrigatório");
    if (!form.servico_interesse) return toast.error("Selecione o serviço de interesse");

    const vendNome =
      vendedores.find((v) => v.user_id === vendedor_id)?.full_name ??
      (vendedor_id === user?.id ? (user?.user_metadata?.full_name as string) ?? user?.email ?? "" : "");

    const { error } = await supabase.from("leads").insert({
      nome: form.nome.trim(),
      empresa: form.empresa || null,
      telefone: form.telefone,
      whatsapp: form.whatsapp,
      email: form.email,
      endereco: form.endereco,
      cep: form.cep || null,
      cidade: form.cidade || null,
      servico_interesse: form.servico_interesse,
      valor_estimado: Number(form.valor_estimado) || 0,
      prioridade: form.prioridade,
      proxima_acao: form.proxima_acao || null,
      observacoes_internas: form.observacoes_internas || null,
      cliente_id: form.cliente_id || null,
      vendedor_id,
      vendedor_nome: vendNome,
      etapa: "novo_lead",
      origem: "manual",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Lead criado");
    setNovoOpen(false);
    setForm(empty);
    fetchAll();
  }

  async function moverEtapa(leadId: string, etapa: string) {
    const { error } = await supabase.from("leads").update({ etapa }).eq("id", leadId);
    if (error) { toast.error(error.message); return; }
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, etapa, etapa_changed_at: new Date().toISOString() } : l)));
  }

  async function addAtividade(tipo: string, descricao: string) {
    if (!detalheLead || !descricao.trim()) return;
    const { error } = await supabase.from("lead_atividades").insert({
      lead_id: detalheLead.id,
      autor_id: user!.id,
      tipo,
      descricao,
    });
    if (error) { toast.error(error.message); return; }
    if (tipo === "contato" || tipo === "ligacao" || tipo === "whatsapp") {
      await supabase.from("leads").update({ ultimo_contato: new Date().toISOString() }).eq("id", detalheLead.id);
    }
    abrirLead(detalheLead);
    fetchAll();
  }

  async function excluirLead(id: string) {
    if (!confirm("Excluir este lead?")) return;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Excluído");
    setDetalheLead(null);
    fetchAll();
  }

  // filtragem
  const leadsFiltrados = useMemo(() => {
    return leads.filter((l) => {
      if (filtroVend !== "todos" && l.vendedor_id !== filtroVend) return false;
      if (filtroPrio !== "todas" && l.prioridade !== filtroPrio) return false;
      if (busca) {
        const q = busca.toLowerCase();
        const blob = `${l.nome} ${l.empresa ?? ""} ${l.telefone ?? ""} ${l.cidade ?? ""} ${l.servico_interesse ?? ""}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [leads, busca, filtroVend, filtroPrio]);

  // Painel do vendedor (próprio)
  const meusLeads = leads.filter((l) => l.vendedor_id === user?.id);
  const totalMeus = meusLeads.length;
  const fechados = meusLeads.filter((l) => ["venda_concluida", "contrato_assinado", "pos_venda"].includes(l.etapa)).length;
  const conversao = totalMeus ? Math.round((fechados / totalMeus) * 100) : 0;
  const comissaoAcum = comissoes.filter((c) => c.status !== "cancelada").reduce((a, c) => a + Number(c.valor || 0), 0);
  const comissaoPaga = comissoes.filter((c) => c.status === "pago").reduce((a, c) => a + Number(c.valor || 0), 0);
  const valorMeusFechados = meusLeads
    .filter((l) => ["venda_concluida", "contrato_assinado", "pos_venda"].includes(l.etapa))
    .reduce((a, l) => a + Number(l.valor_estimado || 0), 0);

  // Ranking simples (gestor)
  const ranking = useMemo(() => {
    const map: Record<string, { nome: string; leads: number; fechados: number; valor: number }> = {};
    leads.forEach((l) => {
      const key = l.vendedor_id;
      const nome = l.vendedor_nome || vendedores.find((v) => v.user_id === key)?.full_name || "—";
      if (!map[key]) map[key] = { nome, leads: 0, fechados: 0, valor: 0 };
      map[key].leads++;
      if (["venda_concluida", "contrato_assinado", "pos_venda"].includes(l.etapa)) {
        map[key].fechados++;
        map[key].valor += Number(l.valor_estimado || 0);
      }
    });
    return Object.values(map).sort((a, b) => b.valor - a.valor);
  }, [leads, vendedores]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendedores · CRM Comercial</h1>
          <p className="text-sm text-slate-500">Pipeline Kanban, leads e desempenho da equipe.</p>
        </div>
        <Dialog open={novoOpen} onOpenChange={(o) => (o ? abrirNovo() : setNovoOpen(false))}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white" onClick={abrirNovo}><Plus className="w-4 h-4 mr-1.5" /> Novo Lead</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo lead</DialogTitle>
              <p className="text-xs text-slate-500">
                Vendedor responsável: <strong>{vendedores.find(v => v.user_id === (form.vendedor_id || user?.id))?.full_name ?? user?.email ?? "—"}</strong>
                {!isGestor && " (preenchido automaticamente)"}
              </p>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label>Nome do cliente *</Label>
                <Input
                  list="leads-nomes"
                  value={form.nome}
                  onChange={(e) => {
                    const v = e.target.value;
                    const match = leads.find((l) => l.nome === v);
                    if (match) {
                      setForm({
                        ...form,
                        nome: match.nome,
                        empresa: match.empresa ?? "",
                        telefone: match.telefone ?? "",
                        whatsapp: match.whatsapp ?? "",
                        email: match.email ?? "",
                        endereco: match.endereco ?? "",
                        cep: match.cep ?? "",
                        cidade: match.cidade ?? "",
                      });
                    } else {
                      setForm({ ...form, nome: v });
                    }
                  }}
                  placeholder="Digite ou selecione um lead existente..."
                />
                <datalist id="leads-nomes">
                  {Array.from(new Set(leads.map((l) => l.nome).filter(Boolean))).map((n: string) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>
              <div><Label>Empresa</Label><Input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} /></div>
              <div><Label>Telefone *</Label><Input required placeholder="(21) 9XXXX-XXXX" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></div>
              <div><Label>WhatsApp *</Label><Input required placeholder="(21) 9XXXX-XXXX" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
              <div><Label>E-mail *</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>CEP</Label><Input placeholder="00000-000" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Endereço *</Label><Input required placeholder="Rua, número, bairro" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} /></div>
              <div><Label>Cidade</Label><Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></div>
              <div>
                <Label>Serviço de interesse *</Label>
                <Select value={form.servico_interesse} onValueChange={(v) => setForm({ ...form, servico_interesse: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione um serviço" /></SelectTrigger>
                  <SelectContent>
                    {SERVICOS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Valor estimado (R$)</Label><Input type="number" value={form.valor_estimado} onChange={(e) => setForm({ ...form, valor_estimado: e.target.value })} /></div>
              <div>
                <Label>Prioridade</Label>
                <Select value={form.prioridade} onValueChange={(v) => setForm({ ...form, prioridade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORIDADES.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cliente vinculado (opcional)</Label>
                <Select value={form.cliente_id || "__none"} onValueChange={(v) => setForm({ ...form, cliente_id: v === "__none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">— sem cliente —</SelectItem>
                    {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {isGestor && (
                <div>
                  <Label>Vendedor responsável</Label>
                  <Select value={form.vendedor_id} onValueChange={(v) => setForm({ ...form, vendedor_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{vendedores.map((v) => <SelectItem key={v.user_id} value={v.user_id}>{v.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div className="sm:col-span-2"><Label>Próxima ação</Label><Input value={form.proxima_acao} onChange={(e) => setForm({ ...form, proxima_acao: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Observações internas</Label><Textarea value={form.observacoes_internas} onChange={(e) => setForm({ ...form, observacoes_internas: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={criarLead}>Criar lead</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Pipeline Kanban</TabsTrigger>
          <TabsTrigger value="lista">Leads</TabsTrigger>
          <TabsTrigger value="painel">Painel do vendedor</TabsTrigger>
          {isGestor && <TabsTrigger value="ranking">Ranking</TabsTrigger>}
        </TabsList>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
            <Input className="pl-8" placeholder="Buscar por nome, empresa, cidade..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          {isGestor && (
            <Select value={filtroVend} onValueChange={setFiltroVend}>
              <SelectTrigger className="w-[200px]"><Filter className="w-3.5 h-3.5 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos vendedores</SelectItem>
                {vendedores.map((v) => <SelectItem key={v.user_id} value={v.user_id}>{v.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Select value={filtroPrio} onValueChange={setFiltroPrio}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas prioridades</SelectItem>
              {PRIORIDADES.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* KANBAN */}
        <TabsContent value="kanban" className="mt-4">
          {loading ? <p className="text-slate-500">Carregando...</p> : (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-3 min-w-max">
                {ETAPAS.map((etapa) => {
                  const cards = leadsFiltrados.filter((l) => l.etapa === etapa.id);
                  const total = cards.reduce((a, c) => a + Number(c.valor_estimado || 0), 0);
                  return (
                    <KanbanColumn key={etapa.id} etapa={etapa} count={cards.length} total={total} onDrop={(id) => moverEtapa(id, etapa.id)}>
                      {cards.map((l) => (
                        <KanbanCard key={l.id} lead={l} onClick={() => abrirLead(l)} />
                      ))}
                    </KanbanColumn>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* LISTA */}
        <TabsContent value="lista" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left px-3 py-2">Cliente</th>
                      <th className="text-left px-3 py-2">Empresa</th>
                      <th className="text-left px-3 py-2">Cidade</th>
                      <th className="text-left px-3 py-2">Etapa</th>
                      <th className="text-left px-3 py-2">Prioridade</th>
                      <th className="text-right px-3 py-2">Valor</th>
                      <th className="text-left px-3 py-2">Vendedor</th>
                      <th className="text-left px-3 py-2">Parado há</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadsFiltrados.map((l) => {
                      const e = ETAPAS.find((x) => x.id === l.etapa);
                      const p = PRIORIDADES.find((x) => x.id === l.prioridade);
                      return (
                        <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => abrirLead(l)}>
                          <td className="px-3 py-2 font-medium text-slate-900">{l.nome}</td>
                          <td className="px-3 py-2 text-slate-600">{l.empresa || "—"}</td>
                          <td className="px-3 py-2 text-slate-600">{l.cidade || "—"}</td>
                          <td className="px-3 py-2"><Badge className={e?.color}>{e?.label}</Badge></td>
                          <td className="px-3 py-2"><Badge className={p?.color}>{p?.label}</Badge></td>
                          <td className="px-3 py-2 text-right font-mono">{fmtBRL(Number(l.valor_estimado || 0))}</td>
                          <td className="px-3 py-2 text-slate-600">{l.vendedor_nome || "—"}</td>
                          <td className="px-3 py-2 text-slate-500">{diasParado(l.etapa_changed_at)}d</td>
                        </tr>
                      );
                    })}
                    {!leadsFiltrados.length && (
                      <tr><td colSpan={8} className="text-center py-8 text-slate-400">Nenhum lead encontrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAINEL */}
        <TabsContent value="painel" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Users} label="Meus leads" value={String(totalMeus)} />
            <StatCard icon={TrendingUp} label="Conversão" value={`${conversao}%`} />
            <StatCard icon={DollarSign} label="Vendas fechadas" value={fmtBRL(valorMeusFechados)} />
            <StatCard icon={Trophy} label="Comissão acumulada" value={fmtBRL(comissaoAcum)} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4" /> Meta do mês</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-slate-600">Meta de valor: <span className="font-semibold text-slate-900">{fmtBRL(meta?.meta_valor ?? 0)}</span></p>
                <p className="text-sm text-slate-600">Meta de vendas: <span className="font-semibold text-slate-900">{meta?.meta_vendas ?? 0}</span></p>
                <p className="text-sm text-slate-600">Realizado: <span className="font-semibold text-emerald-600">{fmtBRL(valorMeusFechados)}</span></p>
                <div className="h-2 bg-slate-200 rounded overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, meta?.meta_valor ? (valorMeusFechados / Number(meta.meta_valor)) * 100 : 0)}%` }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="w-4 h-4" /> Comissões</CardTitle></CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span>Em execução</span><span>{fmtBRL(comissoes.filter(c => c.status === 'em_execucao').reduce((a, c) => a + Number(c.valor), 0))}</span></div>
                <div className="flex justify-between"><span>A receber</span><span>{fmtBRL(comissoes.filter(c => c.status === 'a_receber').reduce((a, c) => a + Number(c.valor), 0))}</span></div>
                <div className="flex justify-between font-semibold text-emerald-600"><span>Pago</span><span>{fmtBRL(comissaoPaga)}</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {isGestor && (
          <TabsContent value="ranking" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left px-3 py-2">#</th>
                      <th className="text-left px-3 py-2">Vendedor</th>
                      <th className="text-right px-3 py-2">Leads</th>
                      <th className="text-right px-3 py-2">Fechados</th>
                      <th className="text-right px-3 py-2">Valor fechado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((r, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-bold text-slate-900">{i + 1}º</td>
                        <td className="px-3 py-2">{r.nome}</td>
                        <td className="px-3 py-2 text-right">{r.leads}</td>
                        <td className="px-3 py-2 text-right">{r.fechados}</td>
                        <td className="px-3 py-2 text-right font-mono">{fmtBRL(r.valor)}</td>
                      </tr>
                    ))}
                    {!ranking.length && <tr><td colSpan={5} className="text-center py-8 text-slate-400">Sem dados.</td></tr>}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Detalhe do lead */}
      <LeadDetalheDialog
        lead={detalheLead}
        atividades={atividades}
        onClose={() => setDetalheLead(null)}
        onAddAtividade={addAtividade}
        onMover={(etapa) => detalheLead && moverEtapa(detalheLead.id, etapa)}
        onExcluir={() => detalheLead && excluirLead(detalheLead.id)}
        onSave={async (patch) => {
          if (!detalheLead) return;
          const { error } = await supabase.from("leads").update(patch).eq("id", detalheLead.id);
          if (error) { toast.error(error.message); return; }
          toast.success("Lead atualizado");
          setDetalheLead({ ...detalheLead, ...patch });
          fetchAll();
        }}
        canDelete={isGestor || (isVendedor && detalheLead?.vendedor_id === user?.id)}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Icon className="w-5 h-5" /></div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-lg font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({
  etapa, count, total, children, onDrop,
}: { etapa: typeof ETAPAS[number]; count: number; total: number; children: React.ReactNode; onDrop: (id: string) => void }) {
  const handleDragOver = (e: DragEvent) => e.preventDefault();
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) onDrop(id);
  };
  return (
    <div className="w-72 shrink-0 flex flex-col bg-slate-50 rounded-lg border border-slate-200" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className="px-3 py-2 border-b border-slate-200 sticky top-0 bg-slate-50">
        <div className="flex items-center justify-between">
          <Badge className={etapa.color}>{etapa.label}</Badge>
          <span className="text-xs text-slate-500">{count}</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1 font-mono">{fmtBRL(total)}</p>
      </div>
      <div className="p-2 space-y-2 max-h-[70vh] overflow-y-auto">{children}</div>
    </div>
  );
}

function KanbanCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const prio = PRIORIDADES.find((p) => p.id === lead.prioridade);
  const dias = diasParado(lead.etapa_changed_at);
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", lead.id)}
      onClick={onClick}
      className="bg-white rounded-md border border-slate-200 p-2.5 cursor-pointer hover:border-primary hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-slate-900 line-clamp-1">{lead.nome}</p>
        {prio && <Badge className={`${prio.color} text-[10px] px-1.5 py-0`}>{prio.label}</Badge>}
      </div>
      {lead.empresa && <p className="text-xs text-slate-500 line-clamp-1">{lead.empresa}</p>}
      {lead.servico_interesse && <p className="text-xs text-slate-600 mt-1 line-clamp-1">{lead.servico_interesse}</p>}
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="font-mono text-emerald-600 font-semibold">{fmtBRL(Number(lead.valor_estimado || 0))}</span>
        {lead.cidade && <span className="text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.cidade}</span>}
      </div>
      <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{dias}d na etapa</span>
        <div className="flex gap-1">
          {lead.whatsapp && <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-emerald-600"><MessageCircle className="w-3.5 h-3.5" /></a>}
          {lead.telefone && <a href={`tel:${lead.telefone}`} onClick={(e) => e.stopPropagation()} className="text-blue-600"><Phone className="w-3.5 h-3.5" /></a>}
        </div>
      </div>
      {lead.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {lead.tags.slice(0, 3).map((t: string, i: number) => <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Tag className="w-2.5 h-2.5" />{t}</span>)}
        </div>
      )}
    </div>
  );
}

function LeadDetalheDialog({
  lead, atividades, onClose, onAddAtividade, onMover, onExcluir, canDelete,
}: {
  lead: Lead | null; atividades: Atividade[]; onClose: () => void;
  onAddAtividade: (tipo: string, descricao: string) => void;
  onMover: (etapa: string) => void; onExcluir: () => void; canDelete: boolean;
}) {
  const [novoTipo, setNovoTipo] = useState("observacao");
  const [novoTexto, setNovoTexto] = useState("");
  if (!lead) return null;

  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {lead.nome}
            {lead.empresa && <span className="text-sm font-normal text-slate-500">— {lead.empresa}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1.5">
            {lead.telefone && <p><Phone className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />{lead.telefone}</p>}
            {lead.whatsapp && <p><MessageCircle className="w-3.5 h-3.5 inline mr-1.5 text-emerald-500" /><a className="text-emerald-600 underline" href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{lead.whatsapp}</a></p>}
            {lead.email && <p>📧 {lead.email}</p>}
            {lead.cidade && <p><MapPin className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />{lead.cidade} <a className="text-blue-600 underline ml-1 text-xs" href={`https://www.google.com/maps/search/${encodeURIComponent(lead.cidade)}`} target="_blank" rel="noreferrer">abrir mapa</a></p>}
          </div>
          <div className="space-y-1.5">
            <p><strong>Vendedor:</strong> {lead.vendedor_nome ?? "—"}</p>
            <p><strong>Serviço:</strong> {lead.servico_interesse ?? "—"}</p>
            <p><strong>Valor:</strong> <span className="font-mono text-emerald-600">{fmtBRL(Number(lead.valor_estimado || 0))}</span></p>
            <p><strong>Próxima ação:</strong> {lead.proxima_acao ?? "—"}</p>
          </div>
        </div>

        {lead.observacoes_internas && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-amber-900">
            <strong>Notas internas:</strong> {lead.observacoes_internas}
          </div>
        )}

        <div>
          <Label className="text-xs">Mover para etapa</Label>
          <Select value={lead.etapa} onValueChange={onMover}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ETAPAS.map((e) => <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="border-t pt-3">
          <h4 className="font-semibold text-sm mb-2">Timeline</h4>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <Select value={novoTipo} onValueChange={setNovoTipo}>
              <SelectTrigger className="sm:w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="observacao">Observação</SelectItem>
                <SelectItem value="contato">Contato</SelectItem>
                <SelectItem value="ligacao">Ligação</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="visita">Visita</SelectItem>
                <SelectItem value="proposta">Proposta enviada</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
            <Input className="flex-1" placeholder="Descrição..." value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)} />
            <Button onClick={() => { onAddAtividade(novoTipo, novoTexto); setNovoTexto(""); }}>Adicionar</Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {atividades.map((a) => (
              <div key={a.id} className="border-l-2 border-primary pl-3 py-1.5">
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline">{a.tipo}</Badge>
                  <span className="text-slate-400">{new Date(a.data_evento).toLocaleString("pt-BR")}</span>
                </div>
                <p className="text-sm text-slate-700 mt-0.5">{a.descricao}</p>
              </div>
            ))}
            {!atividades.length && <p className="text-sm text-slate-400 text-center py-4">Sem atividades ainda.</p>}
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          {canDelete ? <Button variant="destructive" size="sm" onClick={onExcluir}>Excluir lead</Button> : <span />}
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
