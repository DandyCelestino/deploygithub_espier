import { useState } from "react";
import { Settings, Save, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Configuracoes = () => {
  const { hasRole, profile, signOut } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = hasRole("admin");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ chave: "", valor: "", descricao: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["configuracoes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("configuracoes").select("*").order("chave");
      if (error) throw error;
      return data;
    },
  });

  const createConfigMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("configuracoes").insert({
        chave: form.chave,
        valor: form.valor,
        descricao: form.descricao || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracoes"] });
      toast.success("Configuração salva!");
      setOpen(false);
      setForm({ chave: "", valor: "", descricao: "" });
    },
    onError: () => toast.error("Erro ao salvar configuração"),
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, valor }: { id: string; valor: string }) => {
      const { error } = await supabase.from("configuracoes").update({ valor }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracoes"] });
      toast.success("Atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar"),
  });

  const deleteConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("configuracoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracoes"] });
      toast.success("Removido!");
    },
    onError: () => toast.error("Erro ao remover"),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (passwordForm.newPass !== passwordForm.confirm) throw new Error("As senhas não conferem");
      if (passwordForm.newPass.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres");
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPass });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setPasswordForm({ current: "", newPass: "", confirm: "" });
    },
    onError: (e: any) => toast.error(e.message || "Erro ao alterar senha"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Configurações do sistema e da sua conta.</p>
      </div>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Minha Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Nome</Label>
              <Input className="bg-gray-50 border-gray-300 text-gray-900" value={profile?.full_name || ""} disabled />
            </div>
            <div>
              <Label className="text-gray-600">E-mail</Label>
              <Input className="bg-gray-50 border-gray-300 text-gray-900" value={profile?.email || ""} disabled />
            </div>
            <div>
              <Label className="text-gray-600">Matrícula</Label>
              <Input className="bg-gray-50 border-gray-300 text-gray-900" value={profile?.matricula || ""} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Alterar Senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-600">Nova Senha</Label>
              <Input type="password" className="bg-white border-gray-300 text-gray-900" value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} />
            </div>
            <div>
              <Label className="text-gray-600">Confirmar Senha</Label>
              <Input type="password" className="bg-white border-gray-300 text-gray-900" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
            </div>
            <div className="flex items-end">
              <Button onClick={() => changePasswordMutation.mutate()} disabled={!passwordForm.newPass || changePasswordMutation.isPending} className="gap-2">
                <Save className="h-4 w-4" />
                {changePasswordMutation.isPending ? "Salvando..." : "Alterar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-gray-900">Configurações do Sistema</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Nova</Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200">
                <DialogHeader><DialogTitle className="text-gray-900">Nova Configuração</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label className="text-gray-600">Chave *</Label><Input className="bg-white border-gray-300 text-gray-900" value={form.chave} onChange={(e) => setForm({ ...form, chave: e.target.value })} placeholder="ex: empresa_nome" /></div>
                  <div><Label className="text-gray-600">Valor</Label><Input className="bg-white border-gray-300 text-gray-900" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} /></div>
                  <div><Label className="text-gray-600">Descrição</Label><Input className="bg-white border-gray-300 text-gray-900" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
                  <Button className="w-full" onClick={() => createConfigMutation.mutate()} disabled={!form.chave || createConfigMutation.isPending}>
                    {createConfigMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-gray-600">Chave</TableHead>
                  <TableHead className="text-gray-600">Valor</TableHead>
                  <TableHead className="text-gray-600">Descrição</TableHead>
                  <TableHead className="text-gray-600">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-gray-500">Nenhuma configuração cadastrada.</TableCell></TableRow>
                ) : configs.map((cfg) => (
                  <TableRow key={cfg.id} className="border-gray-200">
                    <TableCell className="text-gray-900 font-mono text-sm">{cfg.chave}</TableCell>
                    <TableCell>
                      <Input
                        className="bg-white border-gray-300 text-gray-900 h-8 text-sm"
                        defaultValue={cfg.valor || ""}
                        onBlur={(e) => {
                          if (e.target.value !== cfg.valor) {
                            updateConfigMutation.mutate({ id: cfg.id, valor: e.target.value });
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">{cfg.descricao || "—"}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => deleteConfigMutation.mutate(cfg.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="pt-4">
        <Button variant="destructive" onClick={signOut}>Sair do Sistema</Button>
      </div>
    </div>
  );
};

export default Configuracoes;
