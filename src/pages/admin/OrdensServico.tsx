import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Eye, Upload, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Camera, Search } from "lucide-react";

interface OS {
  id: string; cliente_nome: string; servico_solicitado: string; endereco: string; cidade: string;
  status: string; tecnico_id: string | null; tecnico_nome: string | null;
  valor_instalacao: number; codigo_rastreio: string; created_at: string;
  prazo_termino: string | null; data_inicio: string | null; data_conclusao: string | null;
  checklist_materiais: boolean; checklist_instalacao: boolean; checklist_teste: boolean;
  checklist_limpeza: boolean; checklist_fotos: boolean; checklist_assinatura_cliente: boolean;
  supervisao_aprovada: boolean; supervisao_por: string | null; supervisao_data: string | null;
  valor_liberado: boolean; observacoes: string | null;
  vistoria_checklist_seguranca?: boolean; vistoria_checklist_qualidade?: boolean;
  vistoria_checklist_documentacao?: boolean; vistoria_observacoes?: string | null;
  vistoria_motivo_reprovacao?: string | null;
}
interface Relatorio {
  id: string; descricao: string; fotos: string[] | null; data_relatorio: string;
  tecnico_nome: string | null; created_at: string;
}

const STATUS = ["aberta", "em_andamento", "aguardando_supervisao", "concluida", "cancelada"];
const badge = (s: string) =>
  s === "concluida" ? "bg-emerald-50 text-emerald-700"
  : s === "cancelada" ? "bg-rose-50 text-rose-700"
  : s === "em_andamento" ? "bg-blue-50 text-blue-700"
  : s === "aguardando_supervisao" ? "bg-purple-50 text-purple-700"
  : "bg-amber-50 text-amber-700";

const CHECKLIST_KEYS: [keyof OS, string][] = [
  ["checklist_materiais", "Materiais conferidos"],
  ["checklist_instalacao", "Instalação concluída"],
  ["checklist_teste", "Testes realizados"],
  ["checklist_limpeza", "Limpeza realizada"],
  ["checklist_fotos", "Fotos enviadas"],
  ["checklist_assinatura_cliente", "Assinatura do cliente"],
];

const OrdensServico = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<OS[]>([]);
  const [tecnicos, setTecnicos] = useState<{ user_id: string; full_name: string }[]>([]);
  const [filter, setFilter] = useState<"todos" | "abertas" | "minhas" | "vistoria">("todos");
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [tecnicoFiltro, setTecnicoFiltro] = useState<string>("todos");
  const [editing, setEditing] = useState<OS | null>(null);
  const [open, setOpen] = useState(false);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [novoRel, setNovoRel] = useState("");
  const [novasFotos, setNovasFotos] = useState<File[]>([]);
  const [savingRel, setSavingRel] = useState(false);
  const [tecnicoNome, setTecnicoNome] = useState<string>("");

  const isTecnico = hasRole("tecnico") && !hasRole("admin", "gerente");

  const load = async () => {
    const { data } = await supabase.from("ordens_servico").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as OS[]);
  };
  const loadTecnicos = async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "tecnico");
    const ids = (roles ?? []).map(r => r.user_id);
    if (ids.length === 0) return;
    const { data: profs } = await supabase.from("profiles").select("user_id,full_name").in("user_id", ids);
    setTecnicos((profs ?? []) as any);
  };
  useEffect(() => { load(); loadTecnicos(); }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setTecnicoNome(data?.full_name ?? user.email ?? ""));
  }, [user]);

  const loadRelatorios = useCallback(async (osId: string) => {
    const { data } = await supabase
      .from("relatorios_diarios")
      .select("*")
      .eq("ordem_servico_id", osId)
      .order("data_relatorio", { ascending: false });
    setRelatorios((data ?? []) as Relatorio[]);
  }, []);

  useEffect(() => {
    if (editing && open) loadRelatorios(editing.id);
    else { setRelatorios([]); setNovoRel(""); setNovasFotos([]); }
  }, [editing, open, loadRelatorios]);

  const filtered = list.filter(o => {
    if (filter === "abertas" && o.status !== "aberta") return false;
    if (filter === "minhas" && o.tecnico_id !== user?.id) return false;
    if (filter === "vistoria" && o.status !== "aguardando_supervisao") return false;
    if (statusFiltro !== "todos" && o.status !== statusFiltro) return false;
    if (tecnicoFiltro !== "todos") {
      if (tecnicoFiltro === "sem" && o.tecnico_id) return false;
      if (tecnicoFiltro !== "sem" && o.tecnico_id !== tecnicoFiltro) return false;
    }
    if (busca) {
      const q = busca.toLowerCase();
      if (!o.cliente_nome.toLowerCase().includes(q) && !o.servico_solicitado.toLowerCase().includes(q) && !(o.codigo_rastreio ?? "").toLowerCase().includes(q) && !(o.cidade ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const update = async (patch: Partial<OS>) => {
    if (!editing) return;
    const { error } = await supabase.from("ordens_servico").update(patch as any).eq("id", editing.id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Salvo" });
    load();
    setEditing({ ...editing, ...patch } as OS);
  };

  const assumirOS = async (o: OS) => {
    const { data: prof } = await supabase.from("profiles").select("full_name").eq("user_id", user!.id).maybeSingle();
    const { error } = await supabase.from("ordens_servico").update({
      tecnico_id: user!.id, tecnico_nome: prof?.full_name ?? user!.email, status: "em_andamento", data_inicio: new Date().toISOString(),
    }).eq("id", o.id);
    if (error) toast({ title: "Não foi possível assumir", description: error.message, variant: "destructive" });
    else { toast({ title: "OS assumida" }); load(); }
  };

  const checklistOk = editing
    ? CHECKLIST_KEYS.every(([k]) => Boolean((editing as any)[k]))
    : false;

  const solicitarVistoria = async () => {
    if (!editing) return;
    if (!checklistOk) {
      toast({ title: "Checklist incompleto", description: "Marque todos os itens antes de solicitar vistoria.", variant: "destructive" });
      return;
    }
    await update({ status: "aguardando_supervisao" });
  };

  const aprovarVistoria = async () => {
    if (!editing) return;
    const { error } = await supabase.from("ordens_servico").update({
      supervisao_aprovada: true,
      supervisao_por: user!.id,
      supervisao_data: new Date().toISOString(),
      status: "concluida",
      data_conclusao: new Date().toISOString(),
    } as any).eq("id", editing.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Vistoria aprovada", description: "Pagamento liberado e enviado ao financeiro." });
      load(); setOpen(false);
    }
  };

  const reprovarVistoria = async () => {
    if (!editing) return;
    const motivo = window.prompt("Motivo da reprovação (será registrado nas observações):") ?? "";
    const obs = (editing.observacoes ? editing.observacoes + "\n\n" : "") +
      `[Vistoria reprovada em ${new Date().toLocaleString("pt-BR")}]\n${motivo}`;
    await update({ status: "em_andamento", observacoes: obs });
    toast({ title: "Vistoria reprovada", description: "OS retornou para execução." });
  };

  const enviarRelatorio = async () => {
    if (!editing || !user) return;
    if (!novoRel.trim()) {
      toast({ title: "Descreva o relatório", variant: "destructive" });
      return;
    }
    setSavingRel(true);
    try {
      const fotosUrls: string[] = [];
      for (const file of novasFotos) {
        const path = `${editing.id}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("os-fotos").upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("os-fotos").getPublicUrl(path);
        fotosUrls.push(pub.publicUrl);
      }
      const { error } = await supabase.from("relatorios_diarios").insert({
        ordem_servico_id: editing.id,
        tecnico_id: user.id,
        tecnico_nome: tecnicoNome,
        descricao: novoRel.trim(),
        fotos: fotosUrls,
      });
      if (error) throw error;
      // marca checklist_fotos automaticamente se enviou foto
      if (fotosUrls.length > 0 && !editing.checklist_fotos) {
        await update({ checklist_fotos: true });
      }
      setNovoRel("");
      setNovasFotos([]);
      loadRelatorios(editing.id);
      toast({ title: "Relatório enviado" });
    } catch (e: any) {
      toast({ title: "Erro ao enviar", description: e.message, variant: "destructive" });
    } finally {
      setSavingRel(false);
    }
  };

  const podeVerValor = (o: OS) => hasRole("admin", "gerente", "financeiro") || (hasRole("tecnico") && o.valor_liberado);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Ordens de Serviço</h1>
          <p className="text-sm text-slate-500 mt-1">Acompanhamento das OS abertas, em execução e concluídas.</p>
        </div>
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="abertas">Apenas abertas</SelectItem>
            {hasRole("admin", "gerente") && <SelectItem value="vistoria">Aguardando vistoria</SelectItem>}
            {hasRole("tecnico") && <SelectItem value="minhas">Minhas</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Status</TableHead>
              {!isTecnico && <TableHead>Valor</TableHead>}
              <TableHead>Rastreio</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-slate-500 py-8">Nenhuma OS.</TableCell></TableRow>}
            {filtered.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.cliente_nome}</TableCell>
                <TableCell className="max-w-xs truncate">{o.servico_solicitado}</TableCell>
                <TableCell>{o.tecnico_nome ?? "—"}</TableCell>
                <TableCell><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge(o.status)}`}>{o.status}</span></TableCell>
                {!isTecnico && (
                  <TableCell>
                    {podeVerValor(o) ? `R$ ${Number(o.valor_instalacao).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                  </TableCell>
                )}
                <TableCell><code className="text-xs">{o.codigo_rastreio}</code></TableCell>
                <TableCell className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(o); setOpen(true); }}><Eye className="w-4 h-4" /></Button>
                  {hasRole("tecnico") && o.status === "aberta" && !o.tecnico_id && (
                    <Button size="sm" onClick={() => assumirOS(o)}>Assumir</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>OS — {editing.cliente_nome}</DialogTitle>
                <DialogDescription>
                  Código de rastreio: <code className="font-mono">{editing.codigo_rastreio}</code>
                  <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${badge(editing.status)}`}>{editing.status}</span>
                  {editing.valor_liberado && <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Pagamento liberado</span>}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="dados" className="mt-2">
                <TabsList>
                  <TabsTrigger value="dados">Dados</TabsTrigger>
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                  <TabsTrigger value="relatorios">Relatórios diários</TabsTrigger>
                  {hasRole("admin", "gerente") && <TabsTrigger value="vistoria">Vistoria</TabsTrigger>}
                </TabsList>

                <TabsContent value="dados" className="space-y-4 mt-4">
                  <Field label="Serviço">{editing.servico_solicitado}</Field>
                  <Field label="Endereço">{editing.endereco} — {editing.cidade}</Field>
                  {podeVerValor(editing) && (
                    <Field label="Valor da instalação">
                      R$ {Number(editing.valor_instalacao).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </Field>
                  )}
                  {isTecnico && !editing.valor_liberado && (
                    <p className="text-xs text-slate-500 italic">O valor será exibido após a aprovação da vistoria pelo gerente.</p>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {hasRole("admin", "gerente") && (
                      <div>
                        <label className="text-xs font-bold text-slate-600">Técnico</label>
                        <Select value={editing.tecnico_id ?? ""} onValueChange={(v) => {
                          const t = tecnicos.find(x => x.user_id === v);
                          update({ tecnico_id: v, tecnico_nome: t?.full_name ?? null });
                        }}>
                          <SelectTrigger className="mt-1.5"><SelectValue placeholder="Atribuir..." /></SelectTrigger>
                          <SelectContent>{tecnicos.map(t => <SelectItem key={t.user_id} value={t.user_id}>{t.full_name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    )}
                    {hasRole("admin", "gerente") && (
                      <div>
                        <label className="text-xs font-bold text-slate-600">Status</label>
                        <Select value={editing.status} onValueChange={(v) => update({ status: v })}>
                          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                          <SelectContent>{STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  {editing.observacoes && <Field label="Observações"><span className="whitespace-pre-line">{editing.observacoes}</span></Field>}
                </TabsContent>

                <TabsContent value="checklist" className="space-y-4 mt-4">
                  <p className="text-xs text-slate-500">Marque cada etapa concluída. O botão "Solicitar vistoria" só fica disponível com o checklist 100%.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {CHECKLIST_KEYS.map(([k, l]) => (
                      <label key={k as string} className="flex items-center gap-2 cursor-pointer p-2 rounded border border-slate-200 hover:bg-slate-50">
                        <Checkbox
                          checked={Boolean((editing as any)[k])}
                          disabled={!hasRole("admin", "gerente") && editing.tecnico_id !== user?.id}
                          onCheckedChange={(c) => update({ [k as string]: !!c } as any)}
                        />
                        {l}
                      </label>
                    ))}
                  </div>

                  {editing.tecnico_id === user?.id && editing.status === "em_andamento" && (
                    <Button
                      onClick={solicitarVistoria}
                      disabled={!checklistOk}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4 mr-1.5" />
                      Solicitar vistoria
                      {!checklistOk && <span className="ml-2 text-xs opacity-80">(checklist incompleto)</span>}
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="relatorios" className="space-y-4 mt-4">
                  {(editing.tecnico_id === user?.id || hasRole("admin", "gerente")) && (
                    <Card className="p-4 bg-slate-50">
                      <p className="text-xs font-bold uppercase text-slate-600 mb-2">Novo relatório</p>
                      <Textarea
                        rows={3}
                        placeholder="Descreva as atividades do dia..."
                        value={novoRel}
                        onChange={(e) => setNovoRel(e.target.value)}
                      />
                      <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center">
                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer text-slate-700 hover:text-primary">
                          <Camera className="w-4 h-4" />
                          <span>{novasFotos.length > 0 ? `${novasFotos.length} foto(s) selecionadas` : "Anexar fotos"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => setNovasFotos(Array.from(e.target.files ?? []))}
                          />
                        </label>
                        <Button onClick={enviarRelatorio} disabled={savingRel} size="sm" className="sm:ml-auto">
                          <Upload className="w-4 h-4 mr-1.5" />
                          {savingRel ? "Enviando..." : "Enviar relatório"}
                        </Button>
                      </div>
                    </Card>
                  )}

                  {relatorios.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6">Nenhum relatório enviado.</p>
                  ) : (
                    <div className="space-y-3">
                      {relatorios.map((r) => (
                        <Card key={r.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-primary">{new Date(r.data_relatorio).toLocaleDateString("pt-BR")}</p>
                            {r.tecnico_nome && <span className="text-xs text-slate-500">{r.tecnico_nome}</span>}
                          </div>
                          <p className="text-sm whitespace-pre-line text-slate-800">{r.descricao}</p>
                          {r.fotos && r.fotos.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {r.fotos.map((u, i) => (
                                <a key={i} href={u} target="_blank" rel="noreferrer" className="block aspect-square rounded-md overflow-hidden border border-slate-200 hover:opacity-90">
                                  <img src={u} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                                </a>
                              ))}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {hasRole("admin", "gerente") && (
                  <TabsContent value="vistoria" className="space-y-4 mt-4">
                    {editing.status !== "aguardando_supervisao" && !editing.supervisao_aprovada && (
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Esta OS ainda não está aguardando vistoria.
                      </p>
                    )}
                    {editing.supervisao_aprovada && (
                      <p className="text-sm text-emerald-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Vistoria aprovada em {editing.supervisao_data ? new Date(editing.supervisao_data).toLocaleString("pt-BR") : "—"}.
                      </p>
                    )}
                    {editing.status === "aguardando_supervisao" && !editing.supervisao_aprovada && (
                      <>
                        <Card className="p-4 bg-purple-50 border-purple-200">
                          <p className="text-xs font-bold text-purple-800 mb-2">CHECKLIST DO TÉCNICO</p>
                          <ul className="text-sm space-y-1.5">
                            {CHECKLIST_KEYS.map(([k, l]) => (
                              <li key={k as string} className="flex items-center gap-2">
                                {(editing as any)[k] ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                                {l}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-3 text-sm text-slate-700">
                            Valor a liberar: <strong>R$ {(Number(editing.valor_instalacao) * 0.30).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong> <span className="text-xs text-slate-500">(30% — comissão técnico)</span>
                          </p>
                        </Card>
                        <Card className="p-4 bg-amber-50 border-amber-200">
                          <p className="text-xs font-bold text-amber-800 mb-2">CHECKLIST DE VISTORIA DO GERENTE</p>
                          <div className="space-y-2 text-sm">
                            {[
                              ["vistoria_checklist_seguranca", "Segurança e conformidade no local"],
                              ["vistoria_checklist_qualidade", "Qualidade da instalação verificada"],
                              ["vistoria_checklist_documentacao", "Documentação e fotos completas"],
                            ].map(([k, l]) => (
                              <label key={k} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={!!(editing as any)[k]}
                                  onChange={(e) => update({ [k]: e.target.checked } as any)} />
                                {l}
                              </label>
                            ))}
                          </div>
                          <textarea
                            placeholder="Observações da vistoria..."
                            value={editing.vistoria_observacoes ?? ""}
                            onChange={(e) => setEditing({ ...editing, vistoria_observacoes: e.target.value })}
                            onBlur={() => update({ vistoria_observacoes: editing.vistoria_observacoes ?? null } as any)}
                            className="mt-3 w-full text-sm rounded border border-amber-200 bg-white p-2"
                            rows={3}
                          />
                        </Card>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={aprovarVistoria}
                            disabled={!(editing.vistoria_checklist_seguranca && editing.vistoria_checklist_qualidade && editing.vistoria_checklist_documentacao)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Aprovar e liberar pagamento
                          </Button>
                          <Button onClick={reprovarVistoria} variant="destructive">
                            <XCircle className="w-4 h-4 mr-1.5" /> Reprovar vistoria
                          </Button>
                        </div>
                      </>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
    <p className="text-sm text-slate-800 mt-0.5">{children}</p>
  </div>
);

export default OrdensServico;
