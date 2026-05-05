import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Pencil, Eye } from "lucide-react";

interface OS {
  id: string; cliente_nome: string; servico_solicitado: string; endereco: string; cidade: string;
  status: string; tecnico_id: string | null; tecnico_nome: string | null;
  valor_instalacao: number; codigo_rastreio: string; created_at: string;
  prazo_termino: string | null; data_inicio: string | null; data_conclusao: string | null;
  checklist_materiais: boolean; checklist_instalacao: boolean; checklist_teste: boolean;
  checklist_limpeza: boolean; checklist_fotos: boolean; checklist_assinatura_cliente: boolean;
  supervisao_aprovada: boolean; observacoes: string | null;
}

const STATUS = ["aberta", "em_andamento", "aguardando_supervisao", "concluida", "cancelada"];
const badge = (s: string) => s === "concluida" ? "bg-emerald-50 text-emerald-700" : s === "cancelada" ? "bg-rose-50 text-rose-700" : s === "em_andamento" ? "bg-blue-50 text-blue-700" : s === "aguardando_supervisao" ? "bg-purple-50 text-purple-700" : "bg-amber-50 text-amber-700";

const OrdensServico = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<OS[]>([]);
  const [tecnicos, setTecnicos] = useState<{ user_id: string; full_name: string }[]>([]);
  const [filter, setFilter] = useState<"todos" | "abertas" | "minhas">("todos");
  const [editing, setEditing] = useState<OS | null>(null);
  const [open, setOpen] = useState(false);

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

  const filtered = list.filter(o => {
    if (filter === "abertas") return o.status === "aberta";
    if (filter === "minhas") return o.tecnico_id === user?.id;
    return true;
  });

  const update = async (patch: Partial<OS>) => {
    if (!editing) return;
    const { error } = await supabase.from("ordens_servico").update(patch).eq("id", editing.id);
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
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "OS assumida" }); load(); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Ordens de Serviço</h1>
          <p className="text-sm text-slate-500 mt-1">Acompanhamento das OS abertas, em execução e concluídas.</p>
        </div>
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="abertas">Apenas abertas</SelectItem>
            {hasRole("tecnico") && <SelectItem value="minhas">Minhas</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead><TableHead>Serviço</TableHead><TableHead>Técnico</TableHead><TableHead>Status</TableHead><TableHead>Rastreio</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-8">Nenhuma OS.</TableCell></TableRow>}
            {filtered.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.cliente_nome}</TableCell>
                <TableCell className="max-w-xs truncate">{o.servico_solicitado}</TableCell>
                <TableCell>{o.tecnico_nome ?? "—"}</TableCell>
                <TableCell><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge(o.status)}`}>{o.status}</span></TableCell>
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>OS — {editing.cliente_nome}</DialogTitle>
                <DialogDescription>Código de rastreio: <code>{editing.codigo_rastreio}</code></DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Field label="Serviço">{editing.servico_solicitado}</Field>
                <Field label="Endereço">{editing.endereco} — {editing.cidade}</Field>
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
                  <div>
                    <label className="text-xs font-bold text-slate-600">Status</label>
                    <Select value={editing.status} onValueChange={(v) => update({ status: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase mb-2">Checklist</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      ["checklist_materiais", "Materiais conferidos"],
                      ["checklist_instalacao", "Instalação concluída"],
                      ["checklist_teste", "Testes realizados"],
                      ["checklist_limpeza", "Limpeza realizada"],
                      ["checklist_fotos", "Fotos enviadas"],
                      ["checklist_assinatura_cliente", "Assinatura do cliente"],
                    ].map(([k, l]) => (
                      <label key={k} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={(editing as any)[k]}
                          onCheckedChange={(c) => update({ [k]: !!c } as any)}
                        />
                        {l}
                      </label>
                    ))}
                  </div>
                </div>

                {hasRole("admin", "gerente") && editing.status === "aguardando_supervisao" && !editing.supervisao_aprovada && (
                  <Button onClick={() => update({ supervisao_aprovada: true, supervisao_por: user!.id, supervisao_data: new Date().toISOString(), status: "concluida", data_conclusao: new Date().toISOString() } as any)} className="bg-emerald-600 hover:bg-emerald-700 w-full">
                    Aprovar supervisão e concluir
                  </Button>
                )}
              </div>
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
