import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Trash2 } from "lucide-react";

const MODULES = [
  { key: "candidaturas", label: "Candidaturas" },
  { key: "usuarios", label: "Usuários" },
  { key: "clientes", label: "Clientes" },
  { key: "contratos", label: "Contratos" },
  { key: "orcamentos", label: "Orçamentos" },
  { key: "ordens", label: "Ordens de Serviço" },
  { key: "estoque", label: "Estoque" },
  { key: "financeiro", label: "Financeiro" },
  { key: "visitas", label: "Visitas" },
  { key: "agenda", label: "Agenda" },
  { key: "configuracoes", label: "Configurações" },
];

interface Perm {
  id?: string; user_id: string; module: string;
  can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean;
}
interface Profile { user_id: string; full_name: string; email: string; }

const Permissoes = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selUser, setSelUser] = useState<string>("");
  const [perms, setPerms] = useState<Record<string, Perm>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("profiles").select("user_id,full_name,email").order("full_name")
      .then(({ data }) => setProfiles((data ?? []) as Profile[]));
  }, []);

  useEffect(() => {
    if (!selUser) { setPerms({}); return; }
    (async () => {
      const { data } = await supabase.from("user_permissions").select("*").eq("user_id", selUser);
      const map: Record<string, Perm> = {};
      MODULES.forEach(m => {
        const found = (data ?? []).find((p: any) => p.module === m.key);
        map[m.key] = found
          ? { id: found.id, user_id: selUser, module: m.key, can_view: found.can_view, can_create: found.can_create, can_edit: found.can_edit, can_delete: found.can_delete }
          : { user_id: selUser, module: m.key, can_view: false, can_create: false, can_edit: false, can_delete: false };
      });
      setPerms(map);
    })();
  }, [selUser]);

  const toggle = (mod: string, field: "can_view" | "can_create" | "can_edit" | "can_delete") => {
    setPerms(p => ({ ...p, [mod]: { ...p[mod], [field]: !p[mod][field] } }));
  };

  const save = async () => {
    if (!selUser) return;
    setBusy(true);
    const rows = Object.values(perms);
    const { error } = await supabase.from("user_permissions").upsert(
      rows.map(r => ({ user_id: r.user_id, module: r.module, can_view: r.can_view, can_create: r.can_create, can_edit: r.can_edit, can_delete: r.can_delete })),
      { onConflict: "user_id,module" }
    );
    setBusy(false);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Permissões salvas" });
  };

  const clearAll = async () => {
    if (!selUser || !confirm("Remover todas as permissões granulares deste usuário? (As regras do role continuam valendo.)")) return;
    const { error } = await supabase.from("user_permissions").delete().eq("user_id", selUser);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Removidas" }); setSelUser(selUser); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Permissões granulares</h1>
        <p className="text-sm text-slate-500 mt-1">Sobrescreve as regras de role para um usuário específico, módulo a módulo.</p>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[240px]">
            <label className="text-xs text-slate-500 mb-1 block">Selecionar usuário</label>
            <Select value={selUser} onValueChange={setSelUser}>
              <SelectTrigger><SelectValue placeholder="Escolha um usuário..." /></SelectTrigger>
              <SelectContent>
                {profiles.map(p => (
                  <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selUser && (
            <>
              <Button onClick={save} disabled={busy}><Save className="w-4 h-4 mr-1.5" /> Salvar</Button>
              <Button variant="outline" onClick={clearAll}><Trash2 className="w-4 h-4 mr-1.5" /> Limpar tudo</Button>
            </>
          )}
        </div>
      </Card>

      {selUser && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Módulo</TableHead>
                <TableHead className="text-center">Visualizar</TableHead>
                <TableHead className="text-center">Criar</TableHead>
                <TableHead className="text-center">Editar</TableHead>
                <TableHead className="text-center">Excluir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MODULES.map(m => {
                const p = perms[m.key];
                if (!p) return null;
                return (
                  <TableRow key={m.key}>
                    <TableCell className="font-medium">{m.label}</TableCell>
                    {(["can_view","can_create","can_edit","can_delete"] as const).map(f => (
                      <TableCell key={f} className="text-center">
                        <Checkbox checked={p[f]} onCheckedChange={() => toggle(m.key, f)} />
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <p className="text-xs text-slate-400 mt-4">
        Importante: estas permissões são aplicadas pela camada de UI. As regras de banco continuam protegidas pelos roles.
      </p>
    </div>
  );
};

export default Permissoes;
