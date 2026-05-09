import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { Plus, Calendar as CalIcon, Clock, MapPin, Trash2, Users, UserCheck, Search } from "lucide-react";

interface Evento {
  id: string; titulo: string; descricao: string | null; tipo: string;
  data_inicio: string; data_fim: string | null; local: string | null;
  criado_por: string; criado_por_nome: string | null; status: string;
  target_roles: AppRole[] | null; target_user_ids: string[] | null;
}

interface UserOption { user_id: string; full_name: string; email: string; roles: AppRole[]; }

const TIPO_COLOR: Record<string, string> = {
  visita: "bg-blue-50 text-blue-700 border-blue-200",
  os: "bg-amber-50 text-amber-700 border-amber-200",
  reuniao: "bg-purple-50 text-purple-700 border-purple-200",
  manutencao: "bg-rose-50 text-rose-700 border-rose-200",
  outro: "bg-slate-100 text-slate-700 border-slate-200",
};

const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrador", gerente: "Gerente", tecnico: "Técnico",
  vendedor: "Vendedor", financeiro: "Financeiro/Contábil",
};
const ALL_ROLES: AppRole[] = ["admin", "gerente", "tecnico", "vendedor", "financeiro"];

const empty = {
  titulo: "", descricao: "", tipo: "reuniao",
  data_inicio: new Date().toISOString().slice(0, 16),
  data_fim: "", local: "", status: "agendado",
  target_roles: [] as AppRole[],
  target_user_ids: [] as string[],
};

const Agenda = () => {
  const { toast } = useToast();
  const { user, hasRole } = useAuth();
  const [list, setList] = useState<Evento[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<typeof empty>(empty);
  const [filtro, setFiltro] = useState("todos");
  const [areaFiltro, setAreaFiltro] = useState<string>("todas");
  const [busca, setBusca] = useState("");
  const [periodoFiltro, setPeriodoFiltro] = useState<"todos" | "futuros" | "hoje" | "semana">("todos");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("agenda_eventos").select("*").order("data_inicio", { ascending: true });
    setList((data ?? []) as Evento[]);
  };

  const loadUsers = async () => {
    const { data: profs } = await supabase.from("profiles").select("user_id, full_name, email").eq("active", true);
    const { data: rs } = await supabase.from("user_roles").select("user_id, role");
    const rolesByUser: Record<string, AppRole[]> = {};
    (rs ?? []).forEach((r: any) => { (rolesByUser[r.user_id] ||= []).push(r.role); });
    setUsers((profs ?? []).map((p: any) => ({
      user_id: p.user_id, full_name: p.full_name || p.email, email: p.email,
      roles: rolesByUser[p.user_id] ?? [],
    })));
  };

  useEffect(() => { load(); loadUsers(); }, []);

  const grouped = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);
    const filtered = list.filter(e => {
      if (filtro !== "todos" && e.tipo !== filtro) return false;
      if (areaFiltro !== "todas" && !(e.target_roles ?? []).includes(areaFiltro as AppRole)) return false;
      if (busca) {
        const q = busca.toLowerCase();
        if (!e.titulo.toLowerCase().includes(q) && !(e.descricao ?? "").toLowerCase().includes(q) && !(e.local ?? "").toLowerCase().includes(q)) return false;
      }
      const d = new Date(e.data_inicio);
      if (periodoFiltro === "futuros" && d < today) return false;
      if (periodoFiltro === "hoje" && (d < today || d.toDateString() !== new Date().toDateString())) return false;
      if (periodoFiltro === "semana" && (d < today || d > weekEnd)) return false;
      return true;
    });
    const groups: Record<string, Evento[]> = {};
    filtered.forEach(e => {
      const day = new Date(e.data_inicio).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
      (groups[day] ||= []).push(e);
    });
    return groups;
  }, [list, filtro, areaFiltro, busca, periodoFiltro]);

  const toggleRole = (r: AppRole) => setForm(f => ({
    ...f,
    target_roles: f.target_roles.includes(r) ? f.target_roles.filter(x => x !== r) : [...f.target_roles, r],
  }));
  const toggleUser = (id: string) => setForm(f => ({
    ...f,
    target_user_ids: f.target_user_ids.includes(id) ? f.target_user_ids.filter(x => x !== id) : [...f.target_user_ids, id],
  }));

  const filteredUsers = useMemo(() => {
    if (form.target_roles.length === 0) return users;
    return users.filter(u => u.roles.some(r => form.target_roles.includes(r)));
  }, [users, form.target_roles]);

  const save = async () => {
    if (!form.titulo.trim() || !user) { toast({ title: "Título obrigatório", variant: "destructive" }); return; }
    setBusy(true);
    const { data: prof } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
    const payload: any = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      tipo: form.tipo,
      data_inicio: new Date(form.data_inicio).toISOString(),
      data_fim: form.data_fim ? new Date(form.data_fim).toISOString() : null,
      local: form.local.trim() || null,
      status: form.status,
      criado_por: user.id,
      criado_por_nome: prof?.full_name ?? user.email,
      target_roles: form.target_roles,
      target_user_ids: form.target_user_ids,
    };
    const { error } = await supabase.from("agenda_eventos").insert(payload);
    setBusy(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Evento criado" });
    setOpen(false); setForm(empty); load();
  };

  const remove = async (e: Evento) => {
    if (!confirm(`Excluir "${e.titulo}"?`)) return;
    const { error } = await supabase.from("agenda_eventos").delete().eq("id", e.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Excluído" }); load(); }
  };

  const userNameOf = (id: string) => users.find(u => u.user_id === id)?.full_name ?? id.slice(0, 6);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Agenda compartilhada</h1>
          <p className="text-sm text-slate-500 mt-1">Direcione eventos por área (perfil) ou para usuários específicos.</p>
        </div>
        <div className="flex gap-2">
          <Select value={filtro} onValueChange={setFiltro}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="visita">Visitas</SelectItem>
              <SelectItem value="os">Ordens de serviço</SelectItem>
              <SelectItem value="reuniao">Reuniões</SelectItem>
              <SelectItem value="manutencao">Manutenções</SelectItem>
              <SelectItem value="outro">Outros</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { setForm(empty); setOpen(true); }}><Plus className="w-4 h-4 mr-1.5" /> Novo evento</Button>
        </div>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar por título, descrição ou local..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10" />
          </div>
          <Select value={areaFiltro} onValueChange={setAreaFiltro}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Área" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as áreas</SelectItem>
              {ALL_ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={periodoFiltro} onValueChange={(v: any) => setPeriodoFiltro(v)}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Período" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos períodos</SelectItem>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Próx. 7 dias</SelectItem>
              <SelectItem value="futuros">A partir de hoje</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {Object.keys(grouped).length === 0 && (
        <Card className="p-8 text-center text-slate-500">Nenhum evento agendado.</Card>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([day, evs]) => (
          <div key={day}>
            <div className="flex items-center gap-2 mb-2">
              <CalIcon className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-slate-900 capitalize">{day}</h2>
            </div>
            <div className="space-y-2">
              {evs.map(e => {
                const roles = e.target_roles ?? [];
                const tusers = e.target_user_ids ?? [];
                const isOpen = roles.length === 0 && tusers.length === 0;
                return (
                  <Card key={e.id} className={`p-4 border-l-4 ${TIPO_COLOR[e.tipo]?.replace("bg-", "border-l-").split(" ")[0] ?? "border-l-slate-300"}`}>
                    <div className="flex justify-between items-start gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-slate-900">{e.titulo}</h3>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${TIPO_COLOR[e.tipo]}`}>{e.tipo}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />
                            {new Date(e.data_inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            {e.data_fim && ` — ${new Date(e.data_fim).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                          </span>
                          {e.local && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{e.local}</span>}
                          <span>por {e.criado_por_nome ?? "—"}</span>
                        </div>
                        {e.descricao && <p className="text-sm text-slate-600 mt-2">{e.descricao}</p>}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {isOpen && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Users className="w-3 h-3" /> Toda equipe
                            </span>
                          )}
                          {roles.map(r => (
                            <span key={r} className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Users className="w-3 h-3" /> {ROLE_LABEL[r]}
                            </span>
                          ))}
                          {tusers.map(uid => (
                            <span key={uid} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border">
                              <UserCheck className="w-3 h-3" /> {userNameOf(uid)}
                            </span>
                          ))}
                        </div>
                      </div>
                      {(e.criado_por === user?.id || hasRole("admin")) && (
                        <Button size="icon" variant="ghost" onClick={() => remove(e)}><Trash2 className="w-4 h-4 text-rose-600" /></Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Novo evento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Título *" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-500">Tipo</Label>
                <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visita">Visita</SelectItem>
                    <SelectItem value="os">Ordem de serviço</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Local" value={form.local} onChange={e => setForm({ ...form, local: e.target.value })} />
              <div>
                <Label className="text-xs text-slate-500">Início</Label>
                <Input type="datetime-local" value={form.data_inicio} onChange={e => setForm({ ...form, data_inicio: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Fim</Label>
                <Input type="datetime-local" value={form.data_fim} onChange={e => setForm({ ...form, data_fim: e.target.value })} />
              </div>
            </div>
            <Textarea placeholder="Descrição" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />

            <div className="border rounded-md p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Users className="w-4 h-4" /> Direcionar para área
              </div>
              <p className="text-xs text-slate-500">Selecione um ou mais perfis. Vazio = visível para toda a equipe.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_ROLES.map(r => (
                  <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={form.target_roles.includes(r)} onCheckedChange={() => toggleRole(r)} />
                    <span>{ROLE_LABEL[r]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border rounded-md p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <UserCheck className="w-4 h-4" /> Convidar usuários específicos
              </div>
              <p className="text-xs text-slate-500">
                {form.target_roles.length > 0 ? "Mostrando usuários das áreas selecionadas." : "Mostrando todos os usuários ativos."}
              </p>
              <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
                {filteredUsers.length === 0 && <div className="p-3 text-xs text-slate-500">Nenhum usuário.</div>}
                {filteredUsers.map(u => (
                  <label key={u.user_id} className="flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-slate-50">
                    <Checkbox checked={form.target_user_ids.includes(u.user_id)} onCheckedChange={() => toggleUser(u.user_id)} />
                    <span className="flex-1 truncate">{u.full_name}</span>
                    <span className="text-[10px] uppercase text-slate-400">{u.roles.join(", ") || "sem perfil"}</span>
                  </label>
                ))}
              </div>
            </div>
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

export default Agenda;
