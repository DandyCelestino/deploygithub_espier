import { useState } from "react";
import { Users, Plus, Shield, Search, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const ROLES = ["admin", "gerente", "tecnico", "financeiro"] as const;
const roleLabels: Record<string, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  tecnico: "Técnico",
  financeiro: "Financeiro",
};
const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-700 border-red-300",
  gerente: "bg-blue-100 text-blue-700 border-blue-300",
  tecnico: "bg-green-100 text-green-700 border-green-300",
  financeiro: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

const Administracao = () => {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const isAdmin = hasRole("admin");

  const [form, setForm] = useState({
    full_name: "", email: "", password: "", matricula: "",
    roles: [] as string[],
  });

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: allRoles = [] } = useQuery({
    queryKey: ["admin_user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const getUserRoles = (userId: string) => allRoles.filter((r) => r.user_id === userId).map((r) => r.role);

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const res = await supabase.functions.invoke("create-user", {
        body: {
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          matricula: form.matricula || null,
          roles: form.roles,
        },
      });
      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin_user_roles"] });
      toast.success("Usuário criado com sucesso!");
      setOpen(false);
      setForm({ full_name: "", email: "", password: "", matricula: "", roles: [] });
    },
    onError: (e: any) => toast.error(e.message || "Erro ao criar usuário"),
  });

  const updateRolesMutation = useMutation({
    mutationFn: async ({ userId, roles }: { userId: string; roles: string[] }) => {
      const { error: delError } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (delError) throw delError;
      if (roles.length > 0) {
        const { error: insError } = await supabase.from("user_roles").insert(
          roles.map((role) => ({ user_id: userId, role: role as any }))
        );
        if (insError) throw insError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_user_roles"] });
      toast.success("Permissões atualizadas!");
      setEditUser(null);
    },
    onError: () => toast.error("Erro ao atualizar permissões"),
  });

  const toggleActiveStatus = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("profiles").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_profiles"] });
      toast.success("Status atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const toggleFormRole = (role: string) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
    }));
  };

  const toggleEditRole = (role: string) => {
    setEditRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
  };

  const filtered = profiles.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Acesso restrito a administradores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administração</h1>
          <p className="text-gray-500">Gerenciamento de usuários e permissões.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Usuário</Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200">
            <DialogHeader><DialogTitle className="text-gray-900">Criar Usuário</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label className="text-gray-600">Nome Completo *</Label><Input className="bg-white border-gray-300 text-gray-900" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div><Label className="text-gray-600">E-mail *</Label><Input className="bg-white border-gray-300 text-gray-900" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label className="text-gray-600">Senha *</Label><Input type="password" className="bg-white border-gray-300 text-gray-900" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div><Label className="text-gray-600">Matrícula</Label><Input className="bg-white border-gray-300 text-gray-900" value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} /></div>
              <div>
                <Label className="text-gray-600">Funções</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {ROLES.map((role) => (
                    <label key={role} className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                      <Checkbox checked={form.roles.includes(role)} onCheckedChange={() => toggleFormRole(role)} />
                      {roleLabels[role]}
                    </label>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={() => createUserMutation.mutate()} disabled={!form.full_name || !form.email || !form.password || createUserMutation.isPending}>
                {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input placeholder="Buscar usuário..." className="max-w-sm bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-600">Nome</TableHead>
                <TableHead className="text-gray-600">E-mail</TableHead>
                <TableHead className="text-gray-600">Matrícula</TableHead>
                <TableHead className="text-gray-600">Funções</TableHead>
                <TableHead className="text-gray-600">Status</TableHead>
                <TableHead className="text-gray-600">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-500">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-500">Nenhum usuário encontrado.</TableCell></TableRow>
              ) : filtered.map((p) => {
                const roles = getUserRoles(p.user_id);
                return (
                  <TableRow key={p.id} className="border-gray-200">
                    <TableCell className="text-gray-900 font-medium">{p.full_name}</TableCell>
                    <TableCell className="text-gray-600">{p.email}</TableCell>
                    <TableCell className="text-gray-600">{p.matricula || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {roles.map((r) => (
                          <Badge key={r} className={roleColors[r] || ""}>{roleLabels[r] || r}</Badge>
                        ))}
                        {roles.length === 0 && <span className="text-gray-400 text-xs">Nenhuma</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={p.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {p.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditUser(p); setEditRoles(roles); }}>
                          <Shield className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => toggleActiveStatus.mutate({ id: p.id, active: !p.active })}>
                          {p.active ? <Trash2 className="h-4 w-4 text-red-500" /> : <Edit className="h-4 w-4 text-green-600" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader><DialogTitle className="text-gray-900">Editar Permissões</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">Usuário: <strong className="text-gray-900">{editUser.full_name}</strong></p>
              <div>
                <Label className="text-gray-600">Funções</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {ROLES.map((role) => (
                    <label key={role} className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                      <Checkbox checked={editRoles.includes(role)} onCheckedChange={() => toggleEditRole(role)} />
                      {roleLabels[role]}
                    </label>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={() => updateRolesMutation.mutate({ userId: editUser.user_id, roles: editRoles })} disabled={updateRolesMutation.isPending}>
                {updateRolesMutation.isPending ? "Salvando..." : "Salvar Permissões"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Administracao;
