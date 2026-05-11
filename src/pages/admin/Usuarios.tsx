import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, Plus, Pencil, KeyRound, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface UserRow {
  user_id: string; full_name: string; email: string; active: boolean;
  matricula: string | null; created_at: string; roles: string[];
}

const ALL_ROLES = ["admin", "gerente", "tecnico", "vendedor", "financeiro"];

const Usuarios = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [list, setList] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [roleFiltro, setRoleFiltro] = useState<string>("todos");
  const [ativoFiltro, setAtivoFiltro] = useState<"todos" | "ativos" | "inativos">("todos");

  // Diálogos
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [target, setTarget] = useState<UserRow | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    email: "", full_name: "", matricula: "", password: "",
    roles: [] as string[],
  });
  const [pwd, setPwd] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: rolesData } = await supabase.from("user_roles").select("*");
    const rolesMap = new Map<string, string[]>();
    (rolesData ?? []).forEach((r: any) => {
      const arr = rolesMap.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesMap.set(r.user_id, arr);
    });
    setList(((profiles ?? []) as any[]).map(p => ({ ...p, roles: rolesMap.get(p.user_id) ?? [] })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const invoke = async (action: string, payload: Record<string, unknown>) => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-manage-user", {
      body: { action, ...payload },
    });
    setBusy(false);
    if (error || (data as any)?.error) {
      toast({ title: "Erro", description: (data as any)?.error ?? error?.message ?? "Falha", variant: "destructive" });
      return false;
    }
    return true;
  };

  const openCreate = () => {
    setForm({ email: "", full_name: "", matricula: "", password: "", roles: ["tecnico"] });
    setCreateOpen(true);
  };
  const openEdit = (u: UserRow) => {
    setTarget(u);
    setForm({ email: u.email, full_name: u.full_name || "", matricula: u.matricula ?? "", password: "", roles: [...u.roles] });
    setEditOpen(true);
  };
  const openPwd = (u: UserRow) => { setTarget(u); setPwd(""); setPwdOpen(true); };
  const openDel = (u: UserRow) => { setTarget(u); setDelOpen(true); };

  const toggleRoleForm = (r: string) => {
    setForm(f => ({ ...f, roles: f.roles.includes(r) ? f.roles.filter(x => x !== r) : [...f.roles, r] }));
  };

  const handleCreate = async () => {
    if (!form.email || !form.full_name || form.password.length < 8 || form.roles.length === 0) {
      toast({ title: "Preencha todos os campos (senha ≥ 8 caracteres, ao menos 1 perfil)", variant: "destructive" });
      return;
    }
    const ok = await invoke("create", {
      email: form.email, password: form.password, full_name: form.full_name,
      matricula: form.matricula || undefined, roles: form.roles,
    });
    if (ok) { toast({ title: "Usuário criado" }); setCreateOpen(false); load(); }
  };

  const handleUpdate = async () => {
    if (!target) return;
    const okProfile = await invoke("update_profile", {
      user_id: target.user_id,
      full_name: form.full_name,
      matricula: form.matricula || null,
    });
    if (!okProfile) return;
    const sameRoles = form.roles.length === target.roles.length && form.roles.every(r => target.roles.includes(r));
    if (!sameRoles) {
      const okRoles = await invoke("set_roles", { user_id: target.user_id, roles: form.roles });
      if (!okRoles) return;
    }
    toast({ title: "Atualizado" });
    setEditOpen(false);
    load();
  };

  const handleSetPwd = async () => {
    if (!target || pwd.length < 8) {
      toast({ title: "Senha mínima 8 caracteres", variant: "destructive" }); return;
    }
    const ok = await invoke("set_password", { user_id: target.user_id, password: pwd });
    if (ok) { toast({ title: "Senha redefinida" }); setPwdOpen(false); }
  };

  const handleDelete = async () => {
    if (!target) return;
    const ok = await invoke("delete", { user_id: target.user_id });
    if (ok) { toast({ title: "Usuário excluído" }); setDelOpen(false); load(); }
  };

  const toggleActive = async (u: UserRow) => {
    // Para admin master, vai pela função; para outros, é bloqueado pela UI.
    if (!isAdmin) return;
    const ok = await invoke("update_profile", { user_id: u.user_id, active: !u.active });
    if (ok) { toast({ title: u.active ? "Desativado" : "Ativado" }); load(); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Usuários</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie acessos e papéis dos colaboradores.</p>
        </div>
        {isAdmin && <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1.5" /> Novo usuário</Button>}
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar por nome ou e-mail..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10" />
          </div>
          <Select value={roleFiltro} onValueChange={setRoleFiltro}>
            <SelectTrigger className="sm:w-44"><SelectValue placeholder="Perfil" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os perfis</SelectItem>
              {ALL_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              <SelectItem value="sem">Sem perfil</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ativoFiltro} onValueChange={(v: any) => setAtivoFiltro(v)}>
            <SelectTrigger className="sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativos">Ativos</SelectItem>
              <SelectItem value="inativos">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead><TableHead>E-mail</TableHead><TableHead>Perfis</TableHead><TableHead>Ativo</TableHead>
              {isAdmin && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-slate-500">Carregando...</TableCell></TableRow>}
            {(() => {
              const filtered = list.filter(u => {
                if (ativoFiltro === "ativos" && !u.active) return false;
                if (ativoFiltro === "inativos" && u.active) return false;
                if (roleFiltro === "sem" && u.roles.length > 0) return false;
                if (roleFiltro !== "todos" && roleFiltro !== "sem" && !u.roles.includes(roleFiltro)) return false;
                if (busca) {
                  const q = busca.toLowerCase();
                  if (!(u.full_name ?? "").toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
                }
                return true;
              });
              if (!loading && filtered.length === 0) return <TableRow><TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-slate-500">Nenhum usuário encontrado.</TableCell></TableRow>;
              return filtered.map(u => (
              <TableRow key={u.user_id}>
                <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.length === 0 && <span className="text-xs text-slate-400">—</span>}
                    {u.roles.map(r => (
                      <span key={r} className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{r}</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell><Switch checked={u.active} disabled={!isAdmin} onCheckedChange={() => toggleActive(u)} /></TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" title="Editar" onClick={() => openEdit(u)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" title="Redefinir senha" onClick={() => openPwd(u)}><KeyRound className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" title="Excluir" onClick={() => openDel(u)} className="text-rose-600 hover:text-rose-700"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
              ));
            })()}
          </TableBody>
        </Table>
      </Card>

      {!isAdmin && (
        <p className="text-xs text-slate-400 mt-4">
          Somente o admin master pode criar, editar, redefinir senha ou excluir usuários.
        </p>
      )}

      {/* Criar */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo usuário</DialogTitle><DialogDescription>Cadastro direto. O usuário poderá entrar com a senha temporária.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <FormItem label="Nome completo *"><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></FormItem>
            <FormItem label="E-mail *"><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></FormItem>
            <FormItem label="Matrícula"><Input value={form.matricula} onChange={e => setForm({ ...form, matricula: e.target.value })} /></FormItem>
            <FormItem label="Senha temporária * (mín. 8 caracteres)"><Input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></FormItem>
            <FormItem label="Perfis *">
              <div className="flex flex-wrap gap-2">
                {ALL_ROLES.map(r => (
                  <label key={r} className="flex items-center gap-1.5 text-sm">
                    <Checkbox checked={form.roles.includes(r)} onCheckedChange={() => toggleRoleForm(r)} />
                    <span className="uppercase text-xs font-bold">{r}</span>
                  </label>
                ))}
              </div>
            </FormItem>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={busy}>{busy ? "Criando..." : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editar */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar usuário</DialogTitle><DialogDescription>{target?.email}</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <FormItem label="Nome completo"><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></FormItem>
            <FormItem label="Matrícula"><Input value={form.matricula} onChange={e => setForm({ ...form, matricula: e.target.value })} /></FormItem>
            <FormItem label="Perfis">
              <div className="flex flex-wrap gap-2">
                {ALL_ROLES.map(r => (
                  <label key={r} className="flex items-center gap-1.5 text-sm">
                    <Checkbox checked={form.roles.includes(r)} onCheckedChange={() => toggleRoleForm(r)} />
                    <span className="uppercase text-xs font-bold">{r}</span>
                  </label>
                ))}
              </div>
            </FormItem>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={busy}>{busy ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Senha */}
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Redefinir senha</DialogTitle><DialogDescription>{target?.email}</DialogDescription></DialogHeader>
          <Input type="text" placeholder="Nova senha (mín. 8 caracteres)" value={pwd} onChange={e => setPwd(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwdOpen(false)}>Cancelar</Button>
            <Button onClick={handleSetPwd} disabled={busy}>{busy ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excluir */}
      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir usuário?</DialogTitle>
            <DialogDescription>
              Esta ação é permanente. O usuário <strong>{target?.email}</strong> perderá o acesso e seus dados de login serão removidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelOpen(false)}>Cancelar</Button>
            <Button onClick={handleDelete} disabled={busy} className="bg-rose-600 hover:bg-rose-700">{busy ? "Excluindo..." : "Excluir"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FormItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">{label}</label>
    {children}
  </div>
);

export default Usuarios;
