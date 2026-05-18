import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole } from "@/hooks/useAuth";

export type PermModule =
  | "candidaturas" | "usuarios" | "clientes" | "contratos" | "orcamentos"
  | "ordens" | "estoque" | "financeiro" | "visitas" | "agenda" | "configuracoes";

export type PermAction = "view" | "create" | "edit" | "delete";

interface Override {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const ROLE_DEFAULTS: Record<AppRole, Partial<Record<PermModule, PermAction[]>>> = {
  admin: {
    candidaturas: ["view", "create", "edit", "delete"],
    usuarios: ["view", "create", "edit", "delete"],
    clientes: ["view", "create", "edit", "delete"],
    contratos: ["view", "create", "edit", "delete"],
    orcamentos: ["view", "create", "edit", "delete"],
    ordens: ["view", "create", "edit", "delete"],
    estoque: ["view", "create", "edit", "delete"],
    financeiro: ["view", "create", "edit", "delete"],
    visitas: ["view", "create", "edit", "delete"],
    agenda: ["view", "create", "edit", "delete"],
    configuracoes: ["view", "create", "edit", "delete"],
  },
  gerente: {
    candidaturas: ["view", "edit"],
    clientes: ["view", "create", "edit", "delete"],
    contratos: ["view", "create", "edit", "delete"],
    orcamentos: ["view", "create", "edit", "delete"],
    ordens: ["view", "create", "edit", "delete"],
    estoque: ["view", "create", "edit", "delete"],
    financeiro: ["view", "create", "edit"],
    visitas: ["view", "create", "edit", "delete"],
    agenda: ["view", "create", "edit"],
  },
  tecnico: {
    ordens: ["view", "edit"],
    estoque: ["view"],
    agenda: ["view", "create"],
  },
  vendedor: {
    clientes: ["view", "create", "edit"],
    contratos: ["view", "create", "edit"],
    orcamentos: ["view", "create"],
    visitas: ["view", "create", "edit", "delete"],
    agenda: ["view", "create"],
  },
  financeiro: {
    clientes: ["view"],
    contratos: ["view"],
    orcamentos: ["view"],
    ordens: ["view"],
    estoque: ["view"],
    financeiro: ["view", "create", "edit", "delete"],
    visitas: ["view"],
    agenda: ["view", "create"],
  },
};

export function usePermissions() {
  const { user, roles, isAdmin } = useAuth();
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async (uid: string) => {
    const { data } = await supabase.from("user_permissions").select("*").eq("user_id", uid);
    const map: Record<string, Override> = {};
    (data ?? []).forEach((r: any) => { map[r.module] = r; });
    setOverrides(map);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!user) { setOverrides({}); setLoaded(true); return; }
    load(user.id);
    const ch = supabase
      .channel(`user-perms-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_permissions", filter: `user_id=eq.${user.id}` },
        () => load(user.id)
      )
      .subscribe();
    const onFocus = () => load(user.id);
    window.addEventListener("focus", onFocus);
    return () => {
      supabase.removeChannel(ch);
      window.removeEventListener("focus", onFocus);
    };
  }, [user?.id, load]);

  const can = useCallback((mod: PermModule, action: PermAction): boolean => {
    if (!user) return false;
    if (isAdmin) return true;
    const ov = overrides[mod];
    if (ov) {
      const key = `can_${action}` as keyof Override;
      return Boolean(ov[key]);
    }
    return roles.some((r) => (ROLE_DEFAULTS[r]?.[mod] ?? []).includes(action));
  }, [user, isAdmin, overrides, roles]);

  return { can, loaded };
}
