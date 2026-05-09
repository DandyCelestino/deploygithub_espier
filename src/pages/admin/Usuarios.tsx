import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserRow {
  user_id: string; full_name: string; email: string; active: boolean;
  matricula: string | null; created_at: string; roles: string[];
}

const Usuarios = () => {
  const { toast } = useToast();
  const [list, setList] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [roleFiltro, setRoleFiltro] = useState<string>("todos");
  const [ativoFiltro, setAtivoFiltro] = useState<"todos" | "ativos" | "inativos">("todos");

  const load = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("*");
    const rolesMap = new Map<string, string[]>();
    (roles ?? []).forEach((r: any) => {
      const arr = rolesMap.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesMap.set(r.user_id, arr);
    });
    setList(((profiles ?? []) as any[]).map(p => ({ ...p, roles: rolesMap.get(p.user_id) ?? [] })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleActive = async (u: UserRow) => {
    const { error } = await supabase.from("profiles").update({ active: !u.active }).eq("user_id", u.user_id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: u.active ? "Desativado" : "Ativado" }); load(); }
  };

  const removeRole = async (u: UserRow, role: string) => {
    if (u.roles.length <= 1) { toast({ title: "Mantenha ao menos 1 role", variant: "destructive" }); return; }
    const { error } = await supabase.from("user_roles").delete().eq("user_id", u.user_id).eq("role", role as any);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Role removida" }); load(); }
  };

  const addRole = async (u: UserRow, role: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: u.user_id, role: role as any });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Role adicionada" }); load(); }
  };

  const ALL_ROLES = ["admin", "gerente", "tecnico", "vendedor", "financeiro"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Usuários</h1>
        <p className="text-sm text-slate-500 mt-1">Gerencie acessos e papéis dos colaboradores.</p>
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
              <TableHead>Nome</TableHead><TableHead>E-mail</TableHead><TableHead>Roles</TableHead><TableHead>Ativo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">Carregando...</TableCell></TableRow>}
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
              if (!loading && filtered.length === 0) return <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">Nenhum usuário encontrado.</TableCell></TableRow>;
              return filtered.map(u => (
              <TableRow key={u.user_id}>
                <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map(r => (
                      <button key={r} onClick={() => removeRole(u, r)} title="Clique para remover"
                        className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-rose-100 hover:text-rose-700">
                        {r} ×
                      </button>
                    ))}
                    {ALL_ROLES.filter(r => !u.roles.includes(r)).map(r => (
                      <button key={r} onClick={() => addRole(u, r)} title="Clique para adicionar"
                        className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700">
                        + {r}
                      </button>
                    ))}
                  </div>
                </TableCell>
                <TableCell><Switch checked={u.active} onCheckedChange={() => toggleActive(u)} /></TableCell>
              </TableRow>
              ));
            })()}
          </TableBody>
        </Table>
      </Card>

      <p className="text-xs text-slate-400 mt-4">
        Para criar novos usuários, aprove uma <a href="/admin/candidaturas" className="text-primary underline">candidatura</a>.
      </p>
    </div>
  );
};

export default Usuarios;
